/*
Backend.AI Webapp proxy for Web UI
===================================

(C) Copyright 2016-2021 Lablup Inc.
*/
// Backend.AI Websocket proxy server for local runtime environment / app.
const express = require('express'),
  EventEmitter = require('events'),
  cors = require('cors');
const { rateLimit } = require('express-rate-limit');
const logger = require('./lib/logger')(__filename);

// The Backend.AI client and the proxy gateways are required lazily (inside the
// handlers that use them) rather than at module load. They — and their
// transitive deps such as backend.ai-ws-appproxy — are build artifacts that do
// not exist in a source-only checkout, so eager requires would make the module
// impossible to import without a full build (e.g. from the unit test).
const htmldeco = require('./lib/htmldeco');
const { escapeHtml } = require('./lib/htmldeco');
const crypto = require('crypto');

// Validate port number
function isValidPort(port) {
  const portNum = parseInt(port, 10);
  return !isNaN(portNum) && portNum > 0 && portNum <= 65535;
}

// Validate redirect path to prevent open redirect attacks
function isValidRedirectPath(path) {
  if (typeof path !== 'string') return false;
  // Only allow paths starting with / (relative paths)
  // Reject absolute URLs, protocol handlers, etc.
  if (!path.startsWith('/')) return false;
  // Reject paths starting with // (protocol-relative URLs)
  if (path.startsWith('//')) return false;
  return true;
}

// A cached gateway is only safe to reuse if its underlying TCP listener is
// still bound. Nothing notifies this manager when a user merely closes an
// app tab (only explicit session termination hits /delete), so a previous
// gateway can linger in `Manager.proxies` long after its listener has died.
// Reusing it would hand back a port whose client-side redirect fetch hangs
// forever with no error, no timeout, and no way to recover.
function isGatewayAlive(gateway) {
  return typeof gateway.isAlive === 'function' ? gateway.isAlive() : true;
}

// Parse additional trusted browser origins from the WSPROXY_CORS_ORIGINS
// environment variable. Accepts either a comma-separated list
// ("https://a.example,https://b.example") or a JSON array
// (["https://a.example","https://b.example"]). Used by self-hosted WebUI
// deployments that serve the page from a non-loopback origin.
function parseConfiguredOrigins() {
  const env = process.env.WSPROXY_CORS_ORIGINS;
  if (!env) return [];
  let list;
  try {
    const parsed = JSON.parse(env);
    list = Array.isArray(parsed) ? parsed : String(env).split(',');
  } catch {
    list = env.split(',');
  }
  return list.map((o) => String(o).trim()).filter(Boolean);
}

const configuredOrigins = parseConfiguredOrigins();

// A loopback page (the WebUI dev server, the proxy itself, or any localhost
// origin) is considered trusted: the proxy only binds to 127.0.0.1, so a
// loopback origin is already inside the trust boundary. `*.localhost`
// subdomains are included because RFC 6761 reserves the `.localhost` TLD to
// always resolve to loopback (browsers force it to 127.0.0.1), so a page served
// from e.g. the Portless dev URL `fr-3227.localhost` is genuinely local — a
// remote attacker cannot host a page on a `.localhost` name.
function isLoopbackOrigin(origin) {
  try {
    const { hostname } = new URL(origin);
    return (
      hostname === 'localhost' ||
      hostname.endsWith('.localhost') ||
      hostname === '127.0.0.1' ||
      hostname === '[::1]' ||
      hostname === '::1'
    );
  } catch {
    return false;
  }
}

// Decide whether a browser request from `origin` may read the proxy response.
// `undefined` (no Origin header → non-browser or same-origin request) and
// `'null'` (the Electron file:// renderer) are always allowed. Every other
// cross-origin request must be loopback or explicitly configured. This
// replaces the previous `cors()` default of reflecting any origin as `*`.
function isAllowedOrigin(origin) {
  if (!origin || origin === 'null') return true;
  if (isLoopbackOrigin(origin)) return true;
  return configuredOrigins.includes(origin);
}

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
    // Per-instance secret returned by PUT /conf and required by every
    // /proxy/* route. Regenerated on each proxy start, never logged. 32 random
    // bytes → a 43-char URL-safe base64url string that can sit in the URL path.
    this.secretToken = crypto.randomBytes(32).toString('base64url');
    this.init();
  }

  refreshPorts() {
    logger.info('PortRefresh');
    for (let i = 0; i < 100; i++) {
      this.ports.push(crypto.randomInt(10000, 30000));
    }
  }

  // Drop `this.proxies[p]` if it's no longer alive, so the caller always
  // finds either a live cached gateway or nothing. Nothing notifies this
  // manager when a user merely closes an app tab (only explicit session
  // termination hits /delete), so a previous gateway can linger here long
  // after its listener has died — reusing it would hand back a port whose
  // client-side redirect fetch hangs forever with no error, no timeout, and
  // no way to recover.
  _evictStaleGateway(p) {
    if (this.proxies.hasOwnProperty(p) && !isGatewayAlive(this.proxies[p])) {
      logger.info(`Stale proxy entry for ${p}, recreating`);
      try {
        this.proxies[p].stop_proxy();
      } catch (err) {
        logger.warn(`Failed to stop stale proxy for ${p}: ${err.message}`);
      }
      delete this.proxies[p];
    }
  }

  // Constant-time comparison of a caller-supplied proxy token against the
  // per-instance secret. `crypto.timingSafeEqual` throws when the buffers
  // differ in length, so guard the length first — an unequal length is already
  // a definitive non-match and leaks nothing beyond what the URL length does.
  _isAuthorizedToken(provided) {
    if (typeof provided !== 'string' || provided.length === 0) return false;
    const a = Buffer.from(provided, 'utf8');
    const b = Buffer.from(this.secretToken, 'utf8');
    if (a.length !== b.length) return false;
    try {
      return crypto.timingSafeEqual(a, b);
    } catch {
      return false;
    }
  }

  init() {
    this.app.use(express.json());
    // Restrict cross-origin access to trusted origins. Reflecting the specific
    // request origin (instead of `*`) is also required for the credentialed
    // requests the WebUI sends (fetch with `credentials: 'include'`), which a
    // wildcard ACAO would reject.
    this.app.use(
      cors({
        origin: (origin, callback) => {
          callback(null, isAllowedOrigin(origin));
        },
        credentials: true,
        methods: ['GET', 'PUT', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
        maxAge: 86400,
      }),
    );

    // Rate-limit the token-authorized /proxy/* routes as defense in depth:
    // even though the per-instance token is 256-bit (brute force is
    // infeasible), this bounds how fast a malicious page could spam proxy
    // add/delete to disrupt the user's app proxies. Generous limit — a single
    // desktop user issues only a handful of proxy operations per minute.
    const proxyRateLimiter = rateLimit({
      windowMs: 60 * 1000,
      limit: 600,
      standardHeaders: true,
      legacyHeaders: false,
    });

    this.app.put('/conf', (req, res) => {
      // CSRF / origin defense in depth: the CORS preflight already blocks
      // disallowed browser origins from issuing this PUT, but reject them
      // server-side too so the token secrecy does not rely solely on the
      // browser honoring CORS.
      if (!isAllowedOrigin(req.headers['origin'])) {
        res.status(403).send({ code: 403 });
        return;
      }
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
        const ai = require('../lib/backend.ai-client-node');
        let config = new ai.backend.ClientConfig(
          req.body.access_key,
          req.body.secret_key,
          req.body.endpoint,
        );
        this.aiclient = new ai.backend.Client(config);
        this.aiclient.APIMajorVersion = cf['_apiVersionMajor'];
      }
      this._config = cf;

      res.send({ token: this.secretToken });
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

    this.app.get('/proxy/:token/:sessionId', proxyRateLimiter, (req, res) => {
      if (!this._isAuthorizedToken(req.params['token'])) {
        res.status(403).send({ code: 403 });
        return;
      }
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

    this.app.get(
      '/proxy/:token/:sessionId/add',
      proxyRateLimiter,
      async (req, res) => {
        if (!this._isAuthorizedToken(req.params['token'])) {
          res.status(403).send({ code: 403 });
          return;
        }
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
        this._evictStaleGateway(p);
        if (this.proxies.hasOwnProperty(p)) {
          gateway = this.proxies[p];
          port = gateway.getPort();
        } else {
          if (this._config.mode == 'SESSION') {
            const SGateway = require('./gateway/consoleproxy');
            gateway = new SGateway(this._config);
          } else {
            const Gateway = require('./gateway/tcpwsproxy');
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
      },
    );

    this.app.get(
      '/proxy/:token/:sessionId/delete',
      proxyRateLimiter,
      (req, res) => {
        if (!this._isAuthorizedToken(req.params['token'])) {
          res.status(403).send({ code: 403 });
          return;
        }
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
            logger.info(
              `Total connections: ${Object.keys(this.proxies).length}`,
            );
            res.send({ code: 200 });
            delete this.proxies[p];
          } else {
            res.send({ code: 404 });
          }
        }
      },
    );

    this.app.get('/sftp', (req, res) => {
      let port = req.query.port;

      // Validate port number
      if (!isValidPort(port)) {
        return res
          .status(400)
          .send(
            htmldeco('Invalid Port', 'The port number provided is invalid.'),
          );
      }

      // Normalize and escape to prevent XSS and break taint tracking
      const escapedPort = escapeHtml(String(parseInt(port, 10)));
      const escapedHost = escapeHtml(this.proxyBaseHost);
      let url = 'sftp://upload@' + escapedHost + ':' + escapedPort;

      res.send(
        htmldeco(
          'Connect with your own SFTP',
          'host: ' +
            escapedHost +
            '<br/>port: ' +
            escapedPort +
            '<br/>username:upload<br/>URL : <a href="' +
            escapeHtml(url) +
            '">' +
            escapeHtml(url) +
            '</a>',
        ),
      );
    });

    this.app.get('/vnc', (req, res) => {
      let port = req.query.port;

      // Validate port number
      if (!isValidPort(port)) {
        return res
          .status(400)
          .send(
            htmldeco('Invalid Port', 'The port number provided is invalid.'),
          );
      }

      // Normalize and escape to prevent XSS and break taint tracking
      const escapedPort = escapeHtml(String(parseInt(port, 10)));
      const escapedHost = escapeHtml(this.proxyBaseHost);
      let url = 'vnc://' + escapedHost + ':' + escapedPort;

      res.send(
        htmldeco(
          'Connect with your VNC client',
          'host: ' +
            escapedHost +
            '<br/>port: ' +
            escapedPort +
            '<br/>URL : <a href="' +
            escapeHtml(url) +
            '">' +
            escapeHtml(url) +
            '</a>',
        ),
      );
    });

    this.app.get('/xrdp', (req, res) => {
      let port = req.query.port;

      // Validate port number
      if (!isValidPort(port)) {
        return res
          .status(400)
          .send(
            htmldeco('Invalid Port', 'The port number provided is invalid.'),
          );
      }

      // Normalize and escape to prevent XSS and break taint tracking
      const escapedPort = escapeHtml(String(parseInt(port, 10)));
      const escapedHost = escapeHtml(this.proxyBaseHost);
      let url = 'rdp://' + escapedHost + ':' + escapedPort;

      res.send(
        htmldeco(
          'Connect with your RDP client',
          'host: ' +
            escapedHost +
            '<br/>port: ' +
            escapedPort +
            '<br/>URL : <a href="' +
            escapeHtml(url) +
            '">' +
            escapeHtml(url) +
            '</a>',
        ),
      );
    });

    this.app.get('/redirect', (req, res) => {
      let port = req.query.port;

      // Validate port number
      if (!isValidPort(port)) {
        return res
          .status(400)
          .send(
            htmldeco('Invalid Port', 'The port number provided is invalid.'),
          );
      }

      let path = req.query.redirect || '';

      // Validate redirect path to prevent open redirect attacks
      if (path && !isValidRedirectPath(path)) {
        return res
          .status(400)
          .send(
            htmldeco(
              'Invalid Redirect Path',
              'The redirect path provided is invalid. Only relative paths starting with / are allowed.',
            ),
          );
      }

      // Fix: String.replace() returns a new string, must reassign
      path = path.replace('<proxy-host>', this.proxyBaseHost);
      path = path.replace('<port-number>', port);

      // Prevent CRLF injection attacks (defense in depth)
      if (path.indexOf('\r') !== -1 || path.indexOf('\n') !== -1) {
        return res
          .status(400)
          .send(
            htmldeco(
              'Invalid Redirect Path',
              'The redirect path contains invalid characters.',
            ),
          );
      }

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

// Exposed for regression tests, which seed `Manager.proxies` with fake
// gateways directly to avoid constructing real gateways (a build artifact
// unavailable in a source-only checkout).
Manager.isGatewayAlive = isGatewayAlive;

module.exports = Manager;
