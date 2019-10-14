const express = require('express'),
 EventEmitter = require('events'),
         cors = require('cors');

const ai = require('../lib/backend.ai-client-node'),
  Gateway = require("./gateway/tcpwsproxy"),
  SGateway = require("./gateway/consoleproxy");
const htmldeco = require('./lib/htmldeco');

class Manager extends EventEmitter {
  constructor(listen_ip, proxyBaseHost, proxyBasePort) {
    super();
    if(listen_ip === undefined) {
      this.listen_ip = "127.0.0.1"
    } else {
      this.listen_ip = listen_ip;
    }

    if(proxyBaseHost === undefined) {
      this.proxyBaseHost = "127.0.0.1"
    } else {
      this.proxyBaseHost = proxyBaseHost;
    }

    if (proxyBasePort !== undefined) {
      this.port = proxyBasePort;
    } else {
      this.port = 0; //with 0, OS will assign the port
    }
    this.app = express();
    this.aiclient = undefined;
    this.proxies = {};
    this.ports = [];
    this.baseURL = undefined;
    this.init();
  }

  refreshPorts() {
    console.log("PortRefresh");
    for (let i = 0; i < 100; i++) {
      this.ports.push(Math.floor(Math.random() * 20000) + 10000)
    }
  }

  init() {
    this.app.use(express.json());
    this.app.use(cors());

    this.app.put('/conf', (req, res) => {
      let cf = {
        "created": Date.now(),
        "endpoint": req.body.endpoint
      };
      if(req.body.mode && req.body.mode == "SESSION") {
        cf['mode'] = "SESSION";
        cf['session'] = req.body.session;
        cf['endpoint'] = cf['endpoint'] + "/func";
      } else {
        cf['mode'] = "DEFAULT";
        cf['access_key'] = req.body.access_key;
        cf['secret_key'] = req.body.secret_key;
        let config = new ai.backend.ClientConfig(
          req.body.access_key,
          req.body.secret_key,
          req.body.endpoint,
        );
        this.aiclient = new ai.backend.Client(config);
      }
      this._config = cf;

      res.send({"token": "local"});
    });

    this.app.get('/', (req, res) => {
      let rtn = [];
      for (var key in this.proxies) {
        rtn.push(key);
      }
      res.send(rtn);
    });

    this.app.get('/proxy/local/:kernelId', (req, res) => {
      let kernelId = req.params["kernelId"];
      if (!this._config){
        res.send({"code": 401});
        return;
      }
      if (kernelId in this.proxies) {
        res.send({"code": 200});
      } else {
        res.send({"code": 404});
      }
    });

    this.app.get('/proxy/local/:kernelId/add', async (req, res) =>{
      if (!this._config){
        res.send({"code": 401});
        return;
      }
      let kernelId = req.params["kernelId"];
      let app = req.query.app || "jupyter";
      let p = kernelId + "|" + app;
      //TODO: reset or remove duplicate
      //
      /////
      /*
      let proxy;
      if(this._config.mode == "SESSION") {
        proxy = new CProxy(this._config);
      } else {
        proxy = new Proxy(this.aiclient._config);
      }
      this.getPort().then((port) => {
        let proxy_url = this.proxyBaseURL + ":" + port;
        proxy.start_proxy(kernelId, app, this.listen_ip, port, proxy_url);
        this.proxies[p] = proxy;
        res.send({"code": 200, "proxy": proxy.base_url, "url": this.baseURL + "/redirect?port=" + port});
      });
      */
      //////
      //
      let gateway;
      if(this._config.mode == "SESSION") {
        gateway = new SGateway(this._config);
      } else {
        gateway = new Gateway(this.aiclient._config);
      }
      this.proxies[p] = gateway;

      let ip = "127.0.0.1"; //FIXME: Update needed
      let port = undefined;
      let assigned = false;
      let maxtry = 5;
      for(let i=0;i < maxtry; i++) {
        try {
          await gateway.start_proxy(kernelId, app, ip, port);
          port = gateway.getPort();
          assigned = true;
          break;
        } catch (err) {
          //if port in use
          console.log(err);
          console.log("Port in use");
          //or just retry
        }
      }
      if(!assigned) {
        res.send({"code": 500});
      }
      let proxy_target = "http://localhost:" + port;
      if(app == 'sftp') {
        console.log(port);
        res.send({"code": 200, "proxy": proxy_target, "url": this.baseURL + "/sftp?port=" + port + "&dummy=1"});
      } else if (app == 'sshd') {
        console.log(port);
        res.send({
          "code": 200,
          "proxy": proxy_target,
          "port": port,
          "url": this.baseURL + "/sshd?port=" + port + "&dummy=1"
        });
      } else {
        res.send({"code": 200, "proxy": proxy_target, "url": this.baseURL + "/redirect?port=" + port});
      }
    });

    this.app.get('/proxy/local/:kernelId/delete', (req, res) => {
      //find all and kill

      let kernelId = req.params["kernelId"];
      if (!this._config){
        res.send({"code": 401});
        return;
      }
      if (kernelId in this.proxies) {
        this.proxies[kernelId].stop_proxy();
        res.send({"code": 200});
        delete this.proxies[kernelId];
      } else {
        res.send({"code": 404});
      }
    });

    this.app.get('/sftp', (req, res) => {
      let port = req.query.port;
      let url =  "sftp://upload@127.0.0.1:" + port;
      res.send(htmldeco("Connect with your own SFTP", "host: 127.0.0.1<br/>port: " + port + "<br/>username:upload<br/>URL : <a href=\"" + url + "\">" + url + "</a>"));
    });

    this.app.get('/redirect', (req, res) => {
      let port = req.query.port;
      let path = req.query.redirect || "";
      res.redirect("http://" + this.listen_ip + ":" + port + path)
    });
  }

  start() {
    return new Promise((resolve) => {
      this.listener = this.app.listen(this.port, this.listen_ip, () => {
        console.log(`Listening on port ${this.listener.address().port}!`);
        this.port = this.listener.address().port;
        this.baseURL = "http://" + this.proxyBaseHost + ":" + this.port;
        resolve(this.listener.address().port);
        this.emit("ready");
      });
    });
  }
}

module.exports = Manager;
