const Client = require("./lib/WstClient");

module.exports = (proxy = class Proxy {
  constructor(env) {
    this._env = env;
  }
  get_header(queryString) {
    let method = "GET";
    let requestBody = '';
    let hdrs = {
      "Content-Type": "application/json",
      "User-Agent": `Backend.AI Client for Javascript `,
      "Cookie": `AIOHTTP_SESSION=${this._env.session_id}`
    };
    return hdrs;
  }

  start_proxy(kernelId, app, ip, port, url) {
    this.base_url = url;
    this.port = port;
    this.host = ip + ":" + port;
    let queryString = '/stream/kernel/' + kernelId + "/httpproxy?app=" + app;
    let uri = this._env.endpoint + queryString;
    uri = uri.replace(/^http/, "ws");

    let hdrs = () => {
      return this.get_header(queryString);
    };
    this.c = new Client();
    this.c.verbose();
    this.c.start(this.host, uri, undefined, hdrs);
  }

  stop_proxy() {
    console.log("closing");
    this.c.close();
  }
});
