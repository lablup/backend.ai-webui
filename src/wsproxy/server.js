const Client = require("./lib/WstClient"),
      ai = require('backend.ai-client');
const httpSetup = require("./lib/httpSetup");

class Proxy extends ai.backend.Client {

  get_header(queryString) {
    let method = "GET";
    let requestBody = '';
    let d = new Date();
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

  proxy(kernelId, port) {
    let host = "localhost:" + port;
    let queryString = '/' + this._config.apiVersionMajor + "/wsproxy/" + kernelId + "/stream";
    let uri = this._config.endpoint + queryString;
    uri = uri.replace(/^http/, "ws")

    let hdrs = this.get_header(queryString)
    let client = new Client()
    client.verbose()
    client.start(host, uri, undefined, hdrs);
  }
}

let config = ai.backend.ClientConfig.createFromEnv();
let aiclient = new Proxy(config);
aiclient.createIfNotExists('app-jupyter', 'appsession')
.then(response => {
  console.log(`my session is created: ${response.kernelId}`);
  aiclient.proxy(response.kernelId, 8080)
})
