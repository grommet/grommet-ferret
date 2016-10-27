// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

var compression = require('compression');
var Ddos = require('ddos');
// increase ddos burst to avoid false positives with this app
var ddos = new Ddos({ burst: 80 });
var express = require('express');
var http = require("http");
var https = require("https");
var morgan = require('morgan');
var bodyParser = require('body-parser');
var busboyBodyParser = require('busboy-body-parser');
var cookieParser = require('cookie-parser');
var path = require('path');
var rest = require('./rest');
var throng = require('throng');

var ATLAS_SERVER = undefined;

var PORT = process.env.PORT || 8101;
var PREFIX = '/';
if (process.env.PREFIX) {
  PREFIX = '/' + process.env.PREFIX + '/';
}

// This allows for a self signed certificate from Atlas
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

var WORKERS = process.env.WEB_CONCURRENCY || 1;

throng(WORKERS, start);

function start () {
  var app = express();

  app.use(ddos.express);

  app.use(compression());

  app.use(cookieParser());

  app.use(morgan('tiny'));

  app.use(bodyParser.json());

  app.use(busboyBodyParser());

  if (! ATLAS_SERVER) {

    // Simulate REST API
    app.use('/rest', rest.router);
    //// generator.generate();

  } else {

    // Proxy /rest requests to another server

    app.get('/rest/*', function (req, res) {
      var options = {
        host:   ATLAS_SERVER,
        path:   req.url,
        method: 'GET',
        headers: req.headers
      };
      var data = '';

      var creq = https.request(options, function(cres) {
        cres.setEncoding('utf8');
        cres.on('data', function(chunk) {
          data += chunk;
        });
        cres.on('close', function() {
          res.status(cres.statusCode).send(data);
        });
        cres.on('end', function() {
          res.status(cres.statusCode).send(data);
        });
      }).on('error', function(e) {
        console.log('!!! error', e.message);
        res.status(500).send(e.message);
      });
      creq.end();
    });

    app.post('/rest/*', function (req, res) {
      var options = {
        host:   ATLAS_SERVER,
        path:   req.url,
        method: 'POST',
        headers: req.headers
      };
      var data = '';

      var creq = https.request(options, function(cres) {
        // set encoding
        cres.setEncoding('utf8');
        res.append('Content-Type', 'application/json');
        // wait for data
        cres.on('data', function(chunk) {
          data += chunk;
        });
        cres.on('close', function() {
          res.status(cres.statusCode).send(data);
        });
        cres.on('end', function() {
          res.status(cres.statusCode).send(data);
        });
      }).on('error', function(e) {
        console.log('!!! error', e.message);
        res.status(500).send(e.message);
      });
      creq.write(JSON.stringify(req.body), function (err) {
        creq.end();
      });
    });
  }

  // UI serving

  // app.use('/phoenix', express.static(path.join(__dirname, '/../dist')));
  // app.get('/phoenix/*', function (req, res) {
  //   res.sendFile(path.resolve(path.join(__dirname, '/../dist/index.html')));
  // });
  app.use('/', express.static(path.join(__dirname, '/../dist')));
  app.get('/*', function (req, res) {
    res.sendFile(path.resolve(path.join(__dirname, '/../dist/index.html')));
  });

  var server = http.createServer(app);

  rest.setup(server, PREFIX);

  server.listen(PORT);

  console.log('Server started, listening at: http://localhost:' + PORT +
    ', proxying to ' + ATLAS_SERVER);
}
