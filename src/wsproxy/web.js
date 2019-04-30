const express = require('express');
const cors = require('cors');
const app = express();
const Client = require("./lib/WstClient"),
  ai = require('../backend.ai-client-node'),
  Proxy = require("./proxy");

function express_app(listen_ip, port, proxyBaseURL) {
  let aiclient = undefined;
  let proxies = {};
  let {isFreePort} = require('node-port-check');
  let ports = [];
  let baseURL = "http://" + listen_ip + ":" + port;

  //FIXME: !!
  //proxyBaseURL = "http://52.78.225.155"
  //listen_ip = "0.0.0.0"

  function refreshPorts() {
    console.log("PortRefresh");
    for (let i = 0; i < 100; i++) {
      ports.push(Math.floor(Math.random() * 20000) + 10000)
    }
  }

  function getPort() {
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

  app.use(express.json());
  app.use(cors());

  app.put('/conf', function (req, res) {
    let config = new ai.backend.ClientConfig(
      req.body.access_key,
      req.body.secret_key,
      req.body.endpoint,
    );
    aiclient = new ai.backend.Client(config);
    res.send({"token": "local"});
  });

  app.get('/', function (req, res) {
    let rtn = [];
    for (var key in proxies) {
      rtn.push(key);
    }
    res.send(rtn);
  });

  app.get('/proxy/local/:kernelId', function (req, res) {
    let kernelId = req.params["kernelId"];
    if (!aiclient){
      res.send({"code": 401});
      return;
    }
    if (kernelId in proxies) {
      res.send({"code": 200});
    } else {
      res.send({"code": 404});
    }
  });

  app.get('/proxy/local/:kernelId/add', function (req, res) {
    let kernelId = req.params["kernelId"];
    if (!aiclient){
      res.send({"code": 401});
      return;
    }
    let app = req.query.app || "jupyter";
    let p = kernelId + "|" + app;
    if (!(p in proxies)) {
      let proxy = new Proxy(aiclient._config);
      getPort().then((port) => {
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

  app.get('/proxy/local/:kernelId/delete', function (req, res) {
    let kernelId = req.params["kernelId"];
    if (!aiclient){
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

  app.get('/redirect', function (req, res) {
    let port = req.query.port;
    let path = req.query.redirect || "";
    res.redirect("http://" + listen_ip + ":" + port + path)
  });

  app.listen(port, () => console.log(`Listening on port ${port}!`));
}

module.exports = express_app;
