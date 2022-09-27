require('dotenv').config();

const DEBUG = (process.env.DEBUG === 'true');
const proxyListenIP = process.env.PROXYLISTENIP || '127.0.0.1';
const proxyBaseHost = process.env.PROXYBASEHOST || '127.0.0.1';
const proxyBasePort = parseInt(process.env.PROXYBASEPORT || 5050);
const ProxyManager = require('./manager.js');
const logger = require('./lib/logger')(__filename);

(async () => {
  let manager = new ProxyManager(proxyListenIP, proxyBaseHost, proxyBasePort);
  manager.once("ready", () => {
    let url = 'http://' + proxyBaseHost + ':' + manager.port + "/";
    logger.info("Proxy is ready: " + url);
  });
  manager.start();
})();
