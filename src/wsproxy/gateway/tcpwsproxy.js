const Server = require('../lib/backend.ai-ws-appproxy.js');

module.exports = proxy = class Proxy {
  constructor(env) {
    this.env = env;
  }
  async start_proxy(kernelId, app, ip, port, envs = {}, args = {}) {
    this.c = new Server(this.env);
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
