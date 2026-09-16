const Server = require('../lib/backend.ai-ws-appproxy.js');

module.exports = proxy = class Proxy {
  // `extProxyURL` is passed separately because API mode's `env` is a
  // ClientConfig, which has no place to carry it (SESSION mode's `cf` does).
  constructor(env, extProxyURL) {
    this.env = env;
    this.extProxyURL = extProxyURL;
  }
  async start_proxy(kernelId, app, ip, port, envs = {}, args = {}) {
    this.c = new Server(this.env, this.extProxyURL);
    return this.c.start(kernelId, app, ip, port, envs, args);
  }

  stop_proxy() {
    this.c.stop();
    this.c = undefined;
  }
  getPort() {
    return this.c.port;
  }
  // Whether the underlying TCP listener is still bound. A gateway can outlive
  // its usefulness (e.g. the user closed the app tab without the manager
  // ever seeing a /delete call) while staying in `Manager.proxies` — reusing
  // it then would hand back a port nothing is listening on.
  isAlive() {
    return !!this.c && !!this.c.tcpServer && this.c.tcpServer.listening;
  }
};
