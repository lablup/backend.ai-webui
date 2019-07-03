const DEBUG = process.env.DEBUG || false;
const proxyListenIP = process.env.PROXYLISTENIP || '127.0.0.1';
const proxyBaseURL = process.env.PROXYBASEURL || 'http://localhost';
const proxyBasePort = process.env.PROXYBASEPORT || 5050;
const ProxyManager = require('./manager.js');

(async () => {
  let manager = new ProxyManager(proxyListenIP, proxyBaseURL, proxyBasePort);
  manager.once("ready", () => {
    let url = 'http://localhost:' + manager.port + "/";
    console.log("Proxy is ready:" + url);
  });
  manager.start();
})();
