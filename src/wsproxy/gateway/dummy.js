const http = require('http');

module.exports = proxy = class Proxy {
  start_proxy(kernelId, app, ip, port) {
    log('started' + port);
    this.port = port;

    this.server = http.createServer((req, res) => {
      res.end();
    });
    this.server.on('clientError', (err, socket) => {
      socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
    });
    this.server.listen(port, ip);
  }

  stop_proxy() {
    log('closing');
    this.server.close();
  }
};
