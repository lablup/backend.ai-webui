const DEBUG = process.env.DEBUG || false;
const port = process.env.PORT || 5050;
const proxyListenIP = process.env.PROXYLISTENIP || '127.0.0.1';
const proxyBaseURL = process.env.PROXYBASEURL || 'http://localhost';
let web = null;
console.log("unpacked");
web = require('./web');
/*
let proxyBaseURL, proxyListenIP;
import('../config.js').then((config) => {
  if (typeof config.proxyBaseURL === "undefined" || config.proxyBaseURL === '') {
    proxyBaseURL = 'http://localhost';
  } else {
    proxyBaseURL = config.proxyURL;
  }
  if (typeof config.proxyListenIP === "undefined" || config.proxyListenIP === '') {
    proxyListenIP = '0.0.0.0';
  } else {
    proxyListenIP = config.proxyListenIP;
  }
}).catch((err) => {   // Fallback
  console.log("fallback");
  proxyBaseURL = 'http://localhost';
  proxyListenIP = '0.0.0.0';
});
*/

web(proxyListenIP, port, proxyBaseURL);
