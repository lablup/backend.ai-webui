const express = require('express')
const app = express()
const port = 3000
const Client = require("./lib/WstClient"),
      ai = require('backend.ai-client');
const Proxy = require("./proxy");

let config;
let aiclient = new ai.backend.Client(config);
let proxy;


let proxies = {};
let kernelId;

app.put('/conf', function (req, res) {
  conf = ai.backend.ClientConfig.createFromEnv();
  aiclient.createIfNotExists('app-jupyter', 'appsession')
  .then(response => {
    console.log(`my session is created: ${response.kernelId}`);
    kernelId = response.kernelId;
  })
  res.send({})
})

app.get('/', function (req, res) {
  let rtn = [];
  for (var key in proxies) {
    rtn.push(key);
  }
  res.send(rtn)
})

app.get('/proxy/:kernelId/add', function (req, res) {
  let kernelId = req.params["kernelId"]
  if(!(kernelId in proxies)) {
    let proxy = new Proxy(aiclient._config);
    proxy.start_proxy(kernelId, 8080)
    proxies[kernelId] = proxy;
  }
  res.send({"code": 200})
})

app.get('/proxy/:kernelId/delete', function (req, res) {
  let kernelId = req.params["kernelId"]
  if(kernelId in proxies) {
    proxies[kernelId].stop_proxy();
    res.send({"code": 200})
    delete proxies[kernelId];
  } else {
    res.send({"code": 404})
  }
})

app.get('/proxy/:kernelId', function (req, res) {
  if(kernelId in proxies) {
    res.send({"code": 200})
  } else {
    res.send({"code": 404})
  }
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
