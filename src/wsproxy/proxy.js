const Client = require("./lib/WstClient"),
      ai = require('../backend.ai-client-node');

module.exports = (proxy = class Proxy extends ai.backend.Client {
  get_header(queryString) {
    let method = "GET";
    let requestBody = '';
    let d = new Date();
    console.log(d)
    let signKey = this.getSignKey(this._config.secretKey, d);
    let aStr = this.getAuthenticationString(method, queryString, d.toISOString(), requestBody);
    let rqstSig = this.sign(signKey, 'binary', aStr, 'hex');
    let hdrs = {
      "Content-Type": "application/json",
      "User-Agent": `Backend.AI Client for Javascript ${this.mangleUserAgentSignature()}`,
      "X-BackendAI-Version": this._config.apiVersion,
      "X-BackendAI-Date": d.toISOString(),
      "Authorization": `BackendAI signMethod=HMAC-SHA256, credential=${this._config.accessKey}:${rqstSig}`
    };
    return hdrs;
  }

  start_proxy(kernelId, app, port) {
    this.port = port;
    this.host = "localhost:" + port;
    let queryString = '/stream/kernel/' + kernelId + "/httpproxy?app=" + app;
    let uri = this._config.endpoint + queryString;
    uri = uri.replace(/^http/, "ws")

    let hdrs = () => {return this.get_header(queryString);}
    this.c = new Client()
    this.c.verbose()
    this.c.start(this.host, uri, undefined, hdrs);
  }

  stop_proxy() {
    console.log("closing");
    this.c.close();
  }
});
