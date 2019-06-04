const express = require('express'),
 EventEmitter = require('events'),
         cors = require('cors');

const {isFreePort} = require('node-port-check');

const Client = require("./lib/WstClient"),
  ai = require('../backend.ai-client-node'),
  Proxy = require("./proxy");

class Manager extends EventEmitter {
  constructor(listen_ip, port, proxyBaseURL) {
    super();
    this.listen_ip = listen_ip;
    this.port = port;
    this.proxyBaseURL = proxyBaseURL;

    this.app = express();
    this.aiclient = undefined;
    this.proxies = {};
    this.ports = [];
    this.baseURL = "http://" + listen_ip + ":" + port;

    this.init();
  }

  refreshPorts() {
    console.log("PortRefresh");
    for (let i = 0; i < 100; i++) {
      ports.push(Math.floor(Math.random() * 20000) + 10000)
    }
  }

  getPort() {
    return new Promise(function (resolve, reject) {
      if (ports.length == 0) {
        refreshPorts();
      }
      var port = ports.shift();
      isFreePort(port).then((v) => {
        if (v[2] == true) {
          resolve(v[0]);
        } else {
          getPort().then((v) => {
            resolve(v)
          });
        }
      });
    });
  }

  init() {
    this.app.use(express.json());
    this.app.use(cors());

    this.app.put('/conf', function (req, res) {
      let config = new ai.backend.ClientConfig(
        req.body.access_key,
        req.body.secret_key,
        req.body.endpoint,
      );
      this.aiclient = new ai.backend.Client(config);
      res.send({"token": "local"});
    });

    this.app.get('/', function (req, res) {
      let rtn = [];
      for (var key in proxies) {
        rtn.push(key);
      }
      res.send(rtn);
    });

    this.app.get('/proxy/local/:kernelId', function (req, res) {
      let kernelId = req.params["kernelId"];
      if (!this.aiclient){
        res.send({"code": 401});
        return;
      }
      if (kernelId in proxies) {
        res.send({"code": 200});
      } else {
        res.send({"code": 404});
      }
    });

    this.app.get('/proxy/local/:kernelId/add', function (req, res) {
      let kernelId = req.params["kernelId"];
      if (!this.aiclient){
        res.send({"code": 401});
        return;
      }
      let app = req.query.app || "jupyter";
      let p = kernelId + "|" + app;
      if (!(p in proxies)) {
        let proxy = new Proxy(this.aiclient._config);
        this.getPort().then((port) => {
          let proxy_url = proxyBaseURL + ":" + port;
          proxy.start_proxy(kernelId, app, listen_ip, port, proxy_url);
          proxies[p] = proxy;
          res.send({"code": 200, "proxy": proxy.base_url, "url": baseURL + "/redirect?port=" + port});
        });

      } else {
        let proxy = proxies[p];
        res.send({"code": 200, "proxy": proxy.base_url, "url": baseURL + "/redirect?port=" + proxy.port});
      }
    });

    this.app.get('/proxy/local/:kernelId/delete', function (req, res) {
      let kernelId = req.params["kernelId"];
      if (!this.aiclient){
        res.send({"code": 401});
        return;
      }
      if (kernelId in proxies) {
        proxies[kernelId].stop_proxy();
        res.send({"code": 200});
        delete proxies[kernelId];
      } else {
        res.send({"code": 404});
      }
    });

    this.app.get('/redirect', function (req, res) {
      let port = req.query.port;
      let path = req.query.redirect || "";
      res.redirect("http://" + this.listen_ip + ":" + this.port + path)
    });
  }

  start() {
    return new Promise((resolve) => {
      this.listener = this.app.listen(this.port, () => {
        console.log(`Listening on port ${this.listener.address().port}!`)
        this.port = this.listener.address().port;
        resolve(this.listener.address().port);
        this.emit("ready");
      });
    });
  }
}

module.exports = Manager;
