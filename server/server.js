// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import compression from 'compression';
import Ddos from 'ddos';
// increase ddos burst to avoid false positives with this app
const ddos = new Ddos({ burst: 80 });
import express from 'express';
import http from "http";
import https from "https";
import morgan from 'morgan';
import bodyParser from 'body-parser';
import busboyBodyParser from 'busboy-body-parser';
import cookieParser from 'cookie-parser';
import path from 'path';
import rest from './rest';
import throng from 'throng';

const ATLAS_SERVER = undefined;

const PORT = process.env.PORT || 8101;
const PREFIX = process.env.PREFIX ? `/${process.env.PREFIX}/` : '/';

// This allows for a self signed certificate from Atlas
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const WORKERS = process.env.WEB_CONCURRENCY || 1;

throng(WORKERS, start);

function start () {
  const app = express();

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

    app.get('/rest/*', (req, res) => {
      const options = {
        host:   ATLAS_SERVER,
        path:   req.url,
        method: 'GET',
        headers: req.headers
      };
      let data = '';

      const creq = https.request(options, (cres) => {
        cres.setEncoding('utf8');
        cres.on('data', (chunk) => {
          data += chunk;
        });
        cres.on('close', () => {
          res.status(cres.statusCode).send(data);
        });
        cres.on('end', () => {
          res.status(cres.statusCode).send(data);
        });
      }).on('error', (e) => {
        console.log('!!! error', e.message);
        res.status(500).send(e.message);
      });
      creq.end();
    });

    app.post('/rest/*', (req, res) => {
      const options = {
        host:   ATLAS_SERVER,
        path:   req.url,
        method: 'POST',
        headers: req.headers
      };
      let data = '';

      const creq = https.request(options, (cres) => {
        // set encoding
        cres.setEncoding('utf8');
        res.append('Content-Type', 'application/json');
        // wait for data
        cres.on('data', (chunk) => {
          data += chunk;
        });
        cres.on('close', () => {
          res.status(cres.statusCode).send(data);
        });
        cres.on('end', () => {
          res.status(cres.statusCode).send(data);
        });
      }).on('error', (e) => {
        console.log('!!! error', e.message);
        res.status(500).send(e.message);
      });
      creq.write(JSON.stringify(req.body), (err) => {
        creq.end();
      });
    });
  }

  // UI serving

  app.use('/', express.static(path.join(__dirname, '/../dist')));
  app.get('/*', (req, res) => {
    res.sendFile(path.resolve(path.join(__dirname, '/../dist/index.html')));
  });

  const server = http.createServer(app);

  rest.setup(server, PREFIX);

  server.listen(PORT);

  console.log('Server started, listening at: http://localhost:' + PORT +
    ', proxying to ' + ATLAS_SERVER);
}
