const express = require('express');
const cors = require('cors');
const app = express()
const Client = require("./lib/WstClient"),
      ai = require('../backend.ai-client-node'),
      Proxy = require("./proxy");
const proxyHost = "52.78.225.155"
const proxyProtocol = "http"
const portRange = [10000, 10100];

function express_app(port) {
  let config;
  let aiclient;
  let proxies = {};
  let {getFreePorts} = require('node-port-check');
  let ports = [];
  for (let i=portRange[0]; i<=portRange[1]; i++) {
    port.push(i)
  }

  app.use(express.json());
  app.use(cors());

  app.put('/conf', function (req, res) {
    config = new ai.backend.ClientConfig(
      req.body.access_key,
      req.body.secret_key,
      req.body.endpoint,
    );
    aiclient = new ai.backend.Client(config);
    res.send({})
  });

  app.get('/', function (req, res) {
    if(config == undefined) {
      res.send({"code": 401});
      return;
    }
    let rtn = [];
    for (var key in proxies) {
      rtn.push(key);
    }
    res.send(rtn);
  });

  app.get('/proxy/:kernelId', function (req, res) {
    if(config == undefined) {
      res.send({"code": 401})
      return;
    }
    let kernelId = req.params["kernelId"];
    if(kernelId in proxies) {
      res.send({"code": 200})
    } else {
      res.send({"code": 404})
    }
  });

  app.get('/proxy/:kernelId/add', function (req, res) {
    if(config == undefined) {
      res.send({"code": 401});
      return;
    }
    let kernelId = req.params["kernelId"];
    let app = req.query.app || "jupyter"
    if(!(kernelId in proxies)) {
      let proxy = new Proxy(aiclient._config);
      getFreePorts(1, 'localhost', ports).then((freePortsList) => {
        let port = freePortsList[0];
        let proxy_url = proxyProtocol + "://" + proxyHost + ":" + port;
        proxy.start_proxy(kernelId, app, port);
        proxies[kernelId] = proxy;
        res.send({"code": 200, "proxy": proxy_url});
      });
    } else {
      let proxy = proxies[kernelId];
      res.send({"code": 200, "proxy": proxy.host});
    }
  });

  app.get('/proxy/:kernelId/delete', function (req, res) {
    if(config == undefined) {
      res.send({"code": 401});
      return;
    }
    let kernelId = req.params["kernelId"];
    if(kernelId in proxies) {
      proxies[kernelId].stop_proxy();
      res.send({"code": 200});
      delete proxies[kernelId];
    } else {
      res.send({"code": 404});
    }
  });

  app.listen(port, () => console.log(`Listening on port ${port}!`));
}

module.exports = express_app;
