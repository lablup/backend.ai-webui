const net = require("net");
const logger = require('./logger')(__filename);
const WebSocket = require('ws');
const ai = require('../../lib/backend.ai-client-node');
const bind = require("./bindStream");
const htmldeco = require('./htmldeco');
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

module.exports = (proxy = class Proxy {
  constructor(env) {
    this._running = false;
    this._resolve = undefined;
    this.tcpServer = net.createServer();
    this._env = env;
    if (env._apiVersionMajor > 4) {
      this.sessionPrefix = 'session'; // `kernel` for v4, `session` for v5 and later.
    } else {
      this.sessionPrefix = 'kernel'; // `kernel` for v4, `session` for v5 and later.
    }
  }

  get_header(queryString) {
    let method = "GET";
    let requestBody = '';
    let hdrs = {
      "Content-Type": "application/json",
      "Cookie" : "AIOHTTP_SESSION=" + this._env.session
    };
    return hdrs;
  }

  start(sessionName, app, ip, port) {
    return new Promise(resolve => {
      this._resolve = resolve;
      this._start(sessionName, app, ip, port);
    });
  }

  _start(sessionName, app, ip, port) {
    this.ip = ip;
    this.port = port;
    this._conn(sessionName, app);
    this.tcpServer.listen(this.port, this.ip);
  }

  _conn(sessionName, app) {
    let queryString = `/stream/${this.sessionPrefix}/` + sessionName + "/httpproxy?app=" + app;
    let hdrs = () => {
      return this.get_header(queryString);
    };
    let url = this._env.endpoint + queryString;
    url = url.replace(/^http/, "ws");

    this.tcpServer.on('listening', () => {
      this.port = this.tcpServer.address().port;
      logger.info(`Starting an app-proxy server with ${this.ip}:${this.port}...`);
      this._running = true;
      this._resolve(true);
      this._resolve = undefined;
    });

    this.tcpServer.on('close', () =>{
      logger.info(`Closed:W:${process.pid} / P:${this.port}`);
    });

    this.tcpServer.on("connection", (tcpConn) => {
      tcpConn.setTimeout(30000);
      tcpConn.on('timeout', () => {
        logger.debug(`Socket timeout`);
        tcpConn.destroy();
      });
      tcpConn.on("error", function(er) {
        logger.debug(`TCP CONN fail: ${this.port} - ${er.toString()}`);
        tcpConn.destroy();
      });
      tcpConn.on("close", function() {
        logger.debug(`TCPCONN CLOSED`);
      });
      let optionalHeaders = hdrs();
      let ws = new WebSocket(url, {
        headers: optionalHeaders,
        perMessageDeflate: false
      });
      ws.on('open', () => {
        logger.debug(`ws bind`);
        const wsStream = WebSocket.createWebSocketStream(ws, {});
        let bh = bind(wsStream, tcpConn);
      });
      ws.on('close', (code, reason) => {
        logger.debug(`ws closed - ${code}`);
      });
      ws.on('unexpected-response', (req, res) => {
        logger.warn(`Got non-101 response: ${res.statusCode}`);
        if(tcpConn.writable) {
          tcpConn.write("HTTP/1.1 503 Proxy Error\n"+"Connection: Closed\n"+"Content-Type: text/html; charset=UTF-8\n\n");
          switch(res.statusCode.toString()) {
            case "404":
              tcpConn.write(htmldeco("Server connection failed", "error_404"));
              break;
            case "401":
              tcpConn.write(htmldeco("Server connection failed", "error_401"));
              break;
            case "500":
            case "502":
              logger.warn(`Server fail: ${res.statusCode}`);
              tcpConn.write(htmldeco("Server connection failed", "error_500"));
              break;
            default:
              tcpConn.write(htmldeco("Server connection failed", "error_default" + "Code:" + res.statusCode));
          }
          tcpConn.write("\n");
          tcpConn.end();
        } else {
          logger.debug(`TCP socket is not writeable - Ignored`);
        }
        ws.terminate();
      });
      ws.on('error', (err) => {
        logger.warn(`Websocket fail: ${this.port} - ${err.toString()}`);
        if(tcpConn.writable) {
          tcpConn.write("HTTP/1.1 503 Proxy Error\n"+"Connection: Closed\n"+"Content-Type: text/html; charset=UTF-8\n\n");
          tcpConn.write(htmldeco("Server connection failed", "Restart your session or contact your administrator"));
          tcpConn.write("\n");
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
      if(!this._running) {
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
});
