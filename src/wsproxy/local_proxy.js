const DEBUG = process.env.DEBUG || false;
const proxyListenIP = process.env.PROXYLISTENIP || '127.0.0.1';
const proxyBaseHost = process.env.PROXYBASEHOST || 'localhost';
const proxyBasePort = process.env.PROXYBASEPORT || 5050;
const ProxyManager = require('./manager.js');

(async () => {
  let manager = new ProxyManager(proxyListenIP, proxyBaseHost, proxyBasePort);
  manager.once("ready", () => {
    let url = 'http://' + proxyBaseHost + ':' + manager.port + "/";
    console.log("Proxy is ready: " + url);
  });
  manager.start();
})();
