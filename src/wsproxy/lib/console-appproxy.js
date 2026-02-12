const net = require('net');
const logger = require('./logger')(__filename);
const WebSocket = require('ws');
const ai = require('../../lib/backend.ai-client-node');
const bind = require('./bindStream');
const htmldeco = require('./htmldeco');
const HttpsProxyAgent = require('https-proxy-agent');
/*
const i18next = require('i18next');
const i18next_backend = require('i18next-sync-fs-backend');
i18next
  .use(i18next_backend)
  .init({
    backend: {
      loadPath: 'i18n/{{lng}}/{{ns}}.json',
    },
    lng: 'ko',
    ns:['resource',],
    defaultNS:"resource",

    languages: ['ko',],
    initImmediate: false,
  });
*/

module.exports = proxy = class Proxy {
  constructor(env) {
    this._running = false;
    this._resolve = undefined;
    this._connectionCount = 0;
    this.tcpServer = net.createServer();
    this._env = env;
    if (env._apiVersionMajor > 4) {
      this.sessionPrefix = 'session'; // `kernel` for v4, `session` for v5 and later.
    } else {
      this.sessionPrefix = 'kernel'; // `kernel` for v4, `session` for v5 and later.
    }
  }

  get_header(queryString) {
    let method = 'GET';
    let requestBody = '';
    let hdrs = {
      'Content-Type': 'application/json',
    };
    logger.debug(`authenticating with manager by ${this._env.auth_mode} mode`);
    if (this._env.auth_mode === 'cookie') {
      hdrs.Cookie = 'AIOHTTP_SESSION=' + this._env.session;
    } else {
      hdrs['X-BackendAI-SessionID'] = this._env.session;
    }
    return hdrs;
  }

  start(sessionName, app, ip, port, envs = {}, args = {}) {
    return new Promise((resolve) => {
      this._resolve = resolve;
      this._start(sessionName, app, ip, port, envs, args);
    });
  }

  _start(sessionName, app, ip, port, envs, args) {
    this.ip = ip;
    this.port = port;
    this._conn(sessionName, app, envs, args);
    this.tcpServer.listen(this.port, this.ip);
  }

  _conn(sessionName, app, envs, args) {
    if (
      envs !== null &&
      typeof envs === 'object' &&
      Object.keys(envs).length > 0
    ) {
      app = app + '&envs=' + encodeURI(JSON.stringify(envs));
    }
    if (
      args !== null &&
      typeof args === 'object' &&
      Object.keys(args).length > 0
    ) {
      app = app + '&arguments=' + encodeURI(JSON.stringify(args));
    }
    // Determine the endpoint based on app type
    // TCP apps (vnc, xrdp, sshd, etc.) use tcpproxy, HTTP apps use httpproxy
    const appName = app.split('&')[0]; // Extract app name before query params
    const tcpApps = ['vnc', 'xrdp', 'sshd', 'vscode-desktop'];
    const endpoint = tcpApps.includes(appName) ? 'tcpproxy' : 'httpproxy';
    let queryString =
      `/stream/${this.sessionPrefix}/` +
      sessionName +
      `/${endpoint}?app=` +
      app;
    let hdrs = () => {
      return this.get_header(queryString);
    };
    let url = this._env.endpoint + queryString;
    url = url.replace(/^http/, 'ws');

    this.tcpServer.on('listening', () => {
      this.port = this.tcpServer.address().port;
      logger.info(
        `Starting an app-proxy server with ${this.ip}:${this.port}...`,
      );
      this._running = true;
      this._connectionCount = 0;
      this._resolve(true);
      this._resolve = undefined;
    });

    this.tcpServer.on('close', () => {
      logger.info(`Closed:W:${process.pid} / P:${this.port}`);
    });

    this.tcpServer.on('connection', (tcpConn) => {
      logger.info(
        `App-proxy server connection established: ${this.ip}:${this.port}.`,
      );
      tcpConn.setTimeout(30000);
      tcpConn.on('timeout', () => {
        logger.debug(`Socket timeout`);
        tcpConn.destroy();
      });
      tcpConn.on('error', function (er) {
        logger.debug(`TCP CONN fail: ${this.port} - ${er.toString()}`);
        tcpConn.destroy();
      });
      tcpConn.on('close', function () {
        logger.debug(`TCPCONN CLOSED`);
      });

      logger.info('destination: ' + url);
      const optionalHeaders = hdrs();
      let ws;
      if (this._env.ext_proxy_url) {
        logger.info(
          '- try using external http proxy: ' + this._env.ext_proxy_url,
        );
        const agent = new HttpsProxyAgent(this._env.ext_proxy_url);
        ws = new WebSocket(url, {
          agent: agent,
          headers: optionalHeaders,
          perMessageDeflate: false,
        });
      } else {
        ws = new WebSocket(url, {
          headers: optionalHeaders,
          perMessageDeflate: false,
        });
      }
      ws.on('open', () => {
        logger.debug(`ws bind`);
        this._connectionCount = 0;
        const wsStream = WebSocket.createWebSocketStream(ws, {});
        let bh = bind(wsStream, tcpConn);
      });
      ws.on('close', (code, reason) => {
        logger.debug(`ws closed - ${code}`);
      });
      ws.on('unexpected-response', (req, res) => {
        logger.warn(`Got non-101 response: ${res.statusCode}`);
        if (tcpConn.writable) {
          switch (res.statusCode.toString()) {
            case '404':
              tcpConn.write(
                'HTTP/1.1 503 Proxy Error\n' +
                  'Connection: Closed\n' +
                  'Content-Type: text/html; charset=UTF-8\n\n',
              );
              tcpConn.write(htmldeco('Server connection failed', '404 Error'));
              break;
            case '401':
              tcpConn.write(
                'HTTP/1.1 503 Proxy Error\n' +
                  'Connection: Closed\n' +
                  'Content-Type: text/html; charset=UTF-8\n\n',
              );
              tcpConn.write(htmldeco('Server connection failed', '401 Error'));
              break;
            case '500':
              if (this._connectionCount > 4) {
                tcpConn.write(
                  'HTTP/1.1 503 Proxy Error\n' +
                    'Connection: Closed\n' +
                    'Content-Type: text/html; charset=UTF-8\n\n',
                );
                logger.warn(`Server fail: ${res.statusCode}`);
                tcpConn.write(
                  htmldeco('Server connection failed', '500 Error'),
                );
              } else {
                tcpConn.write(
                  'HTTP/1.1 100 Continue\n' +
                    'Connection: keep-alive\n' +
                    'Content-Type: text/html; charset=UTF-8\n\n',
                );
                this._connectionCount = this._connectionCount + 1;
                tcpConn.write(
                  htmldeco('Waiting for application...', '', '', {
                    retry: true,
                  }),
                );
              }
              break;
            case '502':
              tcpConn.write(
                'HTTP/1.1 503 Proxy Error\n' +
                  'Connection: Closed\n' +
                  'Content-Type: text/html; charset=UTF-8\n\n',
              );
              logger.warn(`Server fail: ${res.statusCode}`);
              tcpConn.write(htmldeco('Server connection failed', '502 Error'));
              break;
            default:
              tcpConn.write(
                'HTTP/1.1 503 Proxy Error\n' +
                  'Connection: Closed\n' +
                  'Content-Type: text/html; charset=UTF-8\n\n',
              );
              tcpConn.write(
                htmldeco(
                  'Server connection failed',
                  'error_default' + 'Code:' + res.statusCode,
                ),
              );
          }
          tcpConn.write('\n');
          tcpConn.end();
        } else {
          logger.debug(`TCP socket is not writeable - Ignored`);
        }
        ws.terminate();
      });
      ws.on('error', (err) => {
        logger.warn(`Websocket fail: ${this.port} - ${err.toString()}`);
        if (tcpConn.writable) {
          tcpConn.write(
            'HTTP/1.1 503 Proxy Error\n' +
              'Connection: Closed\n' +
              'Content-Type: text/html; charset=UTF-8\n\n',
          );
          tcpConn.write(
            htmldeco(
              'Server connection failed',
              'Restart your session or contact your administrator',
            ),
          );
          tcpConn.write('\n');
          tcpConn.end();
        } else {
          logger.debug(`TCP socket is not writeable - Ignored`);
          tcpConn.destroy();
        }
        ws.terminate();
      });
    });
    this.tcpServer.on('error', (err) => {
      logger.warn(`Couldn't start the tcp-ws proxy ${err.toString()}`);
      if (!this._running) {
        logger.warn(`Proxy is not started : ${err}`);
        this._resolve(Promise.reject(new Error('PortInUse')));
      } else {
        logger.warn(`Proxy error: ${err}`);
      }
    });
  }

  stop() {
    logger.info(`Trying to close:W:${process.pid} / P:${this.port}`);
    this.tcpServer.close();
  }
};
