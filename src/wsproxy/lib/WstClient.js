
let wst_client;
const net = require("net");
const WsStream = require("./WsStream");
const log = require("lawg");
const ClientConn = require("./httptunnel/ClientConn");
const createWsClient = () => new (require('websocket').client)();

module.exports = (wst_client = class wst_client extends require('events').EventEmitter {
  /*
  emit Events:
  'tunnel' (WsStream|ClientConn) when a tunnel is established
  'connectFailed' (err) when ws connection failed
  'connectHttpFailed' (err) when http tunnel connection failed
  */

  constructor() {
    super();
    this.tcpServer = net.createServer();
  }

  verbose() {
    this.on('tunnel', (ws, sock) => {
      if (ws instanceof WsStream) {
        log('Websocket tunnel established');
      } else { log('Http tunnel established'); }
      return sock.on('close', () => log('Tunnel closed'));
    });
    this.on('connectHttpFailed', error => log(`HTTP connect error: ${error.toString()}`));
    return this.on('connectFailed', error => log(`WS connect error: ${error.toString()}`));
  }

  setHttpOnly(httpOnly) {
    this.httpOnly = httpOnly;
  }

  // example:  start(8081, "wss://ws.domain.com:454", "dst.domain.com:22")
  // meaning: tunnel *:localport to remoteAddr by using websocket connection to wsHost
  // or start("localhost:8081", "wss://ws.domain.com:454", "dst.domain.com:22")
  // @wsHostUrl:  ws:// denotes standard socket, wss:// denotes ssl socket
  //              may be changed at any time to change websocket server info
  start(localAddr, wsHostUrl, remoteAddr, optionalHeaders, cb) {
    let localHost, localPort;
    this.wsHostUrl = wsHostUrl;
    if (typeof optionalHeaders === 'function') {
      cb = optionalHeaders;
      optionalHeaders = {};
    }

    if (typeof localAddr === 'number') {
      localPort = localAddr;
    } else {
      [localHost, localPort] = Array.from(localAddr.split(':'));
      if (/^\d+$/.test(localHost)) {
        localPort = localHost;
        localHost = null;
      }
      localPort = parseInt(localPort);
    }
    if (localHost == null) { localHost = '127.0.0.1'; }

    this.tcpServer.listen(localPort, localHost, cb);
    return this.tcpServer.on("connection", tcpConn => {
      const bind = (s, tcp) => {
        require("./bindStream")(s, tcp);
        return this.emit('tunnel', s, tcp);
      };

      if (this.httpOnly) {
        return this._httpConnect(this.wsHostUrl, remoteAddr, optionalHeaders, (err, httpConn) => {
          if (!err) {
            return bind(httpConn, tcpConn);
          } else { return tcpConn.end(); }
        });
      } else {
        return this._wsConnect(this.wsHostUrl, remoteAddr, optionalHeaders, (error, wsStream) => {
          if (!error) {
            return bind(wsStream, tcpConn);
          } else {
            this.emit('connectFailed', error);
            return this._httpConnect(this.wsHostUrl, remoteAddr, optionalHeaders, (err, httpConn) => {
              if (!err) {
                return bind(httpConn, tcpConn);
              } else { return tcpConn.end(); }
            });
          }
        });
      }
    });
  }

  _wsConnect(wsHostUrl, remoteAddr, optionalHeaders, cb) {
    const wsClient = createWsClient();
    let d = new Date();
    wsClient.connect(wsHostUrl, undefined, undefined, optionalHeaders
                     , { agent: null } );
    wsClient.on('connectFailed', error => cb(error));
    return wsClient.on('connect', wsConn => {
      const wsStream = new WsStream(wsConn);
      return cb(null, wsStream);
    });
  }
});
