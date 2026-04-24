require('dotenv').config();

const DEBUG = process.env.DEBUG === 'true';
const proxyListenIP = process.env.PROXYLISTENIP || '127.0.0.1';
const proxyBaseHost = process.env.PROXYBASEHOST || 'localhost';
// Prefer PROXYBASEPORT when explicitly set. Otherwise, honor `PORT` (e.g. the
// port that Portless injects when running under its proxy), and finally fall
// back to 5050 for standalone/legacy usage.
const proxyBasePort = parseInt(
  process.env.PROXYBASEPORT || process.env.PORT || 5050,
);
const ProxyManager = require('./manager.js');
const logger = require('./lib/logger')(__filename);

(async () => {
  let manager = new ProxyManager(proxyListenIP, proxyBaseHost, proxyBasePort);
  manager.once('ready', () => {
    let url = 'http://' + proxyBaseHost + ':' + manager.port + '/';
    logger.info('Proxy is ready: ' + url);
  });
  manager.start();

  // Graceful shutdown: close the HTTP server and release the port on
  // SIGINT (Ctrl+C) and SIGTERM (process manager stop signal).
  const shutdown = () => {
    if (manager.listener) {
      manager.listener.close(() => {
        process.exit(0);
      });
      // Force exit after 3 seconds if close() hangs
      setTimeout(() => process.exit(1), 3000).unref();
    } else {
      process.exit(0);
    }
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
})();
