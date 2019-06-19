const DEBUG = process.env.DEBUG || false;
const port = process.env.PORT || 5050;
const proxyListenIP = process.env.PROXYLISTENIP || '127.0.0.1';
const proxyBaseURL = process.env.PROXYBASEURL || 'http://localhost';
let Manager = require('./manager.js');

(async () => {
  let manager = new Manager();
  manager.start();
})();
