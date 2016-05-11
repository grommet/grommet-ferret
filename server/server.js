// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

var compression = require('compression');
var Ddos = require('ddos');
var ddos = new Ddos;
var express = require('express');
var http = require("http");
var router = express.Router();
var morgan = require('morgan');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var rest = require('./rest');
var path = require('path');

var PORT = process.env.PORT || 8010;

var app = express();

app.use(ddos.express);

app.use(compression());

app.use(cookieParser());

app.use(morgan('tiny'));

app.use(bodyParser.json());

app.use('/rest', rest.router);
app.use('/', express.static(path.join(__dirname, '/../dist')));
app.get('/*', function (req, res) {
  res.sendFile(path.resolve(path.join(__dirname, '/../dist/index.html')));
});

//app.get('/', function (req, res) {
//  res.redirect('/ferret');
//});

app.use('', router);

var server = http.createServer(app);

rest.setup(server);

server.listen(PORT);

console.log('Server started, listening at: http://<host>:' + PORT + '...');
