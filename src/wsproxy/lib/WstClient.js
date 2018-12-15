
let wst_client;
const net = require("net");
const WsStream = require("./WsStream");
const log = require("log");
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

  close() {
    this.tcpServer.close()
  }

  verbose() {
    this.on('tunnel', (ws, sock) => {
      log('Websocket tunnel established');
      return sock.on('close', () => log('Tunnel closed'));
    });
    this.on('connectHttpFailed', error => log(`HTTP connect error: ${error.toString()}`));
    return this.on('connectFailed', error => log(`WS connect error: ${error.toString()}`));
  }

  // example:  start(8081, "wss://ws.domain.com:454", "dst.domain.com:22")
  // meaning: tunnel *:localport to remoteAddr by using websocket connection to wsHost
  // or start("localhost:8081", "wss://ws.domain.com:454", "dst.domain.com:22")
  // @wsHostUrl:  ws:// denotes standard socket, wss:// denotes ssl socket
  //              may be changed at any time to change websocket server info
  start(localAddr, wsHostUrl, remoteAddr, get_hdrs, cb) {
    let localHost, localPort;
    this.wsHostUrl = wsHostUrl;

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

      return this._wsConnect(this.wsHostUrl, remoteAddr, get_hdrs, (error, wsStream) => {
        if (!error) {
          return bind(wsStream, tcpConn);
        } else {
          this.emit('connectFailed', error);
          log("FAIL")
        }
      });
    });
  }

  _wsConnect(wsHostUrl, remoteAddr, get_hdrs, cb) {
    let optionalHeaders = get_hdrs()
    const wsClient = createWsClient();
    wsClient.connect(wsHostUrl, undefined, undefined, optionalHeaders
                     , { agent: null } );
    wsClient.on('connectFailed', error => cb(error));
    return wsClient.on('connect', wsConn => {
      const wsStream = new WsStream(wsConn);
      return cb(null, wsStream);
    });
  }
});
