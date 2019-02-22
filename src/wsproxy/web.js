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
  let aiclients = {};
  let proxies = {};
  let {getFreePorts} = require('node-port-check');
  let ports = [];
  for (let i=portRange[0]; i<=portRange[1]; i++) {
    ports.push(i)
  }

  app.use(express.json());
  app.use(cors());

  app.put('/conf', function (req, res) {
    let config = new ai.backend.ClientConfig(
      req.body.access_key,
      req.body.secret_key,
      req.body.endpoint,
    );
    let aiclient = new ai.backend.Client(config);
    aiclients[req.body.access_key] = aiclient;
    res.send({})
  });

  app.get('/', function (req, res) {
    let rtn = [];
    for (var key in proxies) {
      rtn.push(key);
    }
    res.send(rtn);
  });

  app.get('/proxy/:accessKey/:kernelId', function (req, res) {
    let kernelId = req.params["kernelId"];
    let access_key = req.params["accessKey"];
    if(!access_key in aiclients) {
      res.send({"code": 401})
      return;
    }
    if(kernelId in proxies) {
      res.send({"code": 200})
    } else {
      res.send({"code": 404})
    }
  });

  app.get('/proxy/:accessKey/:kernelId/add', function (req, res) {
    let kernelId = req.params["kernelId"];
    let access_key = req.params["accessKey"];
    if(!access_key in aiclients) {
      res.send({"code": 401})
      return;
    }
    let app = req.query.app || "jupyter"
    if(!(kernelId in proxies)) {
      let client = aiclients[access_key];
      let proxy = new Proxy(client._config);
      getFreePorts(1, 'localhost', ports).then((freePortsList) => {
        let port = freePortsList[0];
        let proxy_url = proxyHost + ":" + port;
        proxy.start_proxy(kernelId, app, port, proxy_url);
        proxies[kernelId] = proxy;
        res.send({"code": 200, "proxy": proxy.base_url});
      });
    } else {
      let proxy = proxies[kernelId];
      res.send({"code": 200, "proxy": proxy.base_url});
    }
  });

  app.get('/proxy/:accessKey/:kernelId/delete', function (req, res) {
    let kernelId = req.params["kernelId"];
    let access_key = req.params["accessKey"];
    if(!access_key in aiclients) {
      res.send({"code": 401})
      return;
    }
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
