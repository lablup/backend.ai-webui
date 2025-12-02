/*
Backend.AI Webapp proxy for Web UI
===================================

(C) Copyright 2016-2021 Lablup Inc.
*/
// Backend.AI Websocket proxy server for local runtime environment / app.
const express = require('express'),
  EventEmitter = require('events'),
  cors = require('cors');
const logger = require('./lib/logger')(__filename);

const ai = require('../lib/backend.ai-client-node'),
  Gateway = require('./gateway/tcpwsproxy'),
  SGateway = require('./gateway/consoleproxy');
const htmldeco = require('./lib/htmldeco');
const crypto = require('crypto');

// extHttpProxy is an endpoint of a http proxy server in a network.
// Can be set when a user in a company network needs to access the web socket
// externally through the http proxy provided by the company.
// ex) http://10.20.30.40:3128
const extHttpProxyURL = process.env.EXT_HTTP_PROXY;

class Manager extends EventEmitter {
  constructor(listen_ip, proxyBaseHost, proxyBasePort) {
    super();
    if (listen_ip === undefined) {
      this.listen_ip = '127.0.0.1';
    } else {
      this.listen_ip = listen_ip;
    }

    if (proxyBaseHost === undefined) {
      this.proxyBaseHost = '127.0.0.1';
    } else {
      this.proxyBaseHost = proxyBaseHost;
    }
    if (proxyBasePort !== undefined) {
      this.port = proxyBasePort;
    } else {
      this.port = 0; //with 0, OS will assign the port
    }

    this.extHttpProxyURL = extHttpProxyURL;
    this.app = express();
    this.aiclient = undefined;
    this.proxies = {};
    this.ports = [];
    this.baseURL = undefined;
    this.init();
  }

  refreshPorts() {
    logger.info('PortRefresh');
    for (let i = 0; i < 100; i++) {
      this.ports.push(crypto.randomInt(10000, 30000));
    }
  }

  init() {
    this.app.use(express.json());
    this.app.use(cors());

    this.app.put('/conf', (req, res) => {
      let cf = {
        created: Date.now(),
        endpoint: req.body.endpoint,
        ext_proxy_url: this.extHttpProxyURL,
      };
      // Receive API version from web UI. Initialization timing is different so we use API information from requester.
      if (req.body.api_version) {
        cf['_apiVersionMajor'] = req.body.api_version;
      } else {
        cf['_apiVersionMajor'] = 4;
      }
      if (req.body.mode && req.body.mode === 'SESSION') {
        cf['mode'] = 'SESSION';
        cf['session'] = req.body.session;
        cf['auth_mode'] = req.body.auth_mode;
        cf['endpoint'] = cf['endpoint'] + '/func';
      } else {
        cf['mode'] = 'API';
        cf['access_key'] = req.body.access_key;
        cf['secret_key'] = req.body.secret_key;
        let config = new ai.backend.ClientConfig(
          req.body.access_key,
          req.body.secret_key,
          req.body.endpoint,
        );
        this.aiclient = new ai.backend.Client(config);
        this.aiclient.APIMajorVersion = cf['_apiVersionMajor'];
      }
      this._config = cf;

      res.send({ token: 'local' });
    });

    this.app.get('/', (req, res) => {
      let rtn = [];
      for (var key in this.proxies) {
        rtn.push(key);
      }
      res.send(rtn);
    });

    this.app.get('/status', (req, res) => {
      res.send({ api_version: 'v1' });
    });

    this.app.get('/proxy/:token/:sessionId', (req, res) => {
      let sessionId = req.params['sessionId'];
      if (!this._config) {
        res.send({ code: 401 });
        return;
      }
      for (const key in this.proxies) {
        if (key.split('|', 1)[0] === sessionId) {
          res.send({ code: 200 });
          return;
        }
      }
      res.send({ code: 404 });
    });

    this.app.get('/proxy/:token/:sessionId/add', async (req, res) => {
      if (!this._config) {
        res.send({ code: 401 });
        return;
      }
      let sessionId = req.params['sessionId'];
      let app = req.query.app || 'jupyter';
      let port = parseInt(req.query.port) || undefined;
      let p = sessionId + '|' + app;
      let args = req.query.args ? JSON.parse(decodeURI(req.query.args)) : {};
      let envs = req.query.envs ? JSON.parse(decodeURI(req.query.envs)) : {};
      const protocol = req.query.protocol || 'http';
      let gateway;
      let ip = this.listen_ip;
      //let port = undefined;
      if (this.proxies.hasOwnProperty(p)) {
        gateway = this.proxies[p];
        port = gateway.getPort();
      } else {
        if (this._config.mode == 'SESSION') {
          gateway = new SGateway(this._config);
        } else {
          gateway = new Gateway(this.aiclient._config);
        }
        this.proxies[p] = gateway;

        let assigned = false;
        let maxtry = 5;
        for (let i = 0; i < maxtry; i++) {
          try {
            await gateway.start_proxy(sessionId, app, ip, port, envs, args);
            port = gateway.getPort();
            assigned = true;
            break;
          } catch (err) {
            if ('PortInUse' === err.message) {
              // try next number or fallback to random port for the last resort
              port = i < maxtry - 1 ? port + 1 : undefined;
              if (port) {
                logger.warn('trying next port: ' + port);
              } else {
                logger.warn('trying random port');
              }
            } else {
              logger.warn(err.message);
            }
          }
        }
        logger.debug(`proxies: ${p}`);
        logger.info(`Total connections: ${Object.keys(this.proxies).length}`);
        if (!assigned) {
          res.send({ code: 500 });
          return;
        }
      }

      let proxy_target = 'http://' + this.proxyBaseHost + ':' + port;
      if (app == 'sftp') {
        logger.debug('proxy target: ' + proxy_target);
        res.send({
          code: 200,
          proxy: proxy_target,
          url: this.baseURL + '/sftp?port=' + port + '&dummy=1',
        });
      } else if (app == 'sshd') {
        logger.debug('proxy target: ' + proxy_target);
        res.send({
          code: 200,
          proxy: proxy_target,
          port: port,
          url: this.baseURL + '/sshd?port=' + port + '&dummy=1',
        });
      } else if (app == 'vnc') {
        logger.debug('proxy target: ' + proxy_target);
        res.send({
          code: 200,
          proxy: proxy_target,
          port: port,
          url: this.baseURL + '/vnc?port=' + port + '&dummy=1',
        });
      } else if (app == 'xrdp') {
        logger.debug('proxy target: ' + proxy_target);
        res.send({
          code: 200,
          proxy: proxy_target,
          port: port,
          url: this.baseURL + '/xrdp?port=' + port + '&dummy=1',
        });
      } else {
        res.send({
          code: 200,
          proxy: proxy_target,
          url: this.baseURL + '/redirect?port=' + port,
        });
      }
    });

    this.app.get('/proxy/:token/:sessionId/delete', (req, res) => {
      //find all and kill
      if (!this._config) {
        res.send({ code: 401 });
        return;
      }

      let sessionId = req.params['sessionId'];
      let app = req.query.app || null;

      if (app === null) {
        let stopped = false;
        for (const key in this.proxies) {
          logger.debug(key.split('|', 1));
          if (key.split('|', 1)[0] === sessionId) {
            logger.info(`Found app to terminate in ${sessionId}`);
            this.proxies[key].stop_proxy();
            delete this.proxies[key];
            stopped = true;
          }
        }
        logger.info(`Total connections: ${Object.keys(this.proxies).length}`);
        if (stopped) {
          res.send({ code: 200 });
        } else {
          res.send({ code: 404 });
        }
      } else {
        let p = sessionId + '|' + app;
        if (p in this.proxies && app !== null) {
          logger.debug(`Found ${app} to terminate in ${sessionId}`);
          this.proxies[p].stop_proxy();
          logger.info(`Total connections: ${Object.keys(this.proxies).length}`);
          res.send({ code: 200 });
          delete this.proxies[p];
        } else {
          res.send({ code: 404 });
        }
      }
    });

    this.app.get('/sftp', (req, res) => {
      let port = req.query.port;
      let url = 'sftp://upload@' + this.proxyBaseHost + ':' + port;
      res.send(
        htmldeco(
          'Connect with your own SFTP',
          'host: ' +
            this.proxyBaseHost +
            '<br/>port: ' +
            port +
            '<br/>username:upload<br/>URL : <a href="' +
            url +
            '">' +
            url +
            '</a>',
        ),
      );
    });

    this.app.get('/redirect', (req, res) => {
      let port = req.query.port;
      let path = req.query.redirect || '';
      path.replace('<proxy-host>', this.proxyBaseHost);
      path.replace('<port-number>', port);
      res.redirect('http://' + this.proxyBaseHost + ':' + port + path);
    });
  }

  start() {
    return new Promise((resolve) => {
      this.listener = this.app.listen(this.port, this.listen_ip, () => {
        logger.info(`Listening on port ${this.listener.address().port}!`);
        this.port = this.listener.address().port;
        this.baseURL = 'http://' + this.proxyBaseHost + ':' + this.port;
        resolve(this.listener.address().port);
        this.emit('ready');
      });
    });
  }
}

module.exports = Manager;
