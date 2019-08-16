const Server = require("../lib/backend.ai-ws-appproxy.js");

module.exports = (proxy = class Proxy {
  constructor(env) {
    this.env = env;
  }
  async start_proxy(kernelId, app, ip, port) {
    this.c = new Server(this.env);
    return this.c.start(kernelId, app, ip, port);
  }

  stop_proxy() {
    this.c.stop();
    this.c = undefined;
  }
  getPort() {
    return this.c.port
  }
});
