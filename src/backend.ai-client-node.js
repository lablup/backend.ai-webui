'use babel';
/*
Backend.AI Cloud Javascript API Library (v3.0a1)
==============================================

(C) Copyright 2016-2018 Lablup Inc.
Licensed under MIT
*/
/*jshint esnext: true */

var fetch = require('node-fetch');
var Headers = fetch.Headers;
var crypto = require('crypto');

class ClientConfig {
  constructor(accessKey, secretKey, endpoint) {
    // fixed configs with this implementation
    this._apiVersionMajor = 'v3';
    this._apiVersion = 'v3.20170615';
    this._hashType = 'sha256';
    // dynamic configs
    if (accessKey === undefined || accessKey === null)
      throw 'You must set accessKey! (either as argument or environment variable)';
    if (secretKey === undefined || secretKey === null)
      throw 'You must set secretKey! (either as argument or environment variable)';
    if (endpoint === undefined || endpoint === null)
      endpoint = 'https://api.backend.ai';
    this._endpoint = endpoint;
    this._endpointHost = endpoint.replace(/^[^:]+:\/\//, '');
    this._accessKey = accessKey;
    this._secretKey = secretKey;
  }

  get accessKey() {
    return this._accessKey;
  }

  get secretKey() {
    return this._secretKey;
  }

  get endpoint() {
    return this._endpoint;
  }

  get endpointHost() {
    return this._endpointHost;
  }

  get apiVersion() {
    return this._apiVersion;
  }

  get apiVersionMajor() {
    return this._apiVersionMajor;
  }

  get hashType() {
    return this._hashType;
  }

  /**
   * Create a ClientConfig object from environment variables.
   */
  static createFromEnv() {
    return new this(
      process.env.BACKEND_ACCESS_KEY,
      process.env.BACKEND_SECRET_KEY,
      process.env.BACKEND_ENDPOINT
    );
  }
}

class Client {
  /**
   * The client API wrapper.
   *
   * @param {ClientConfig} config - the API client-side configuration
   * @param {string} agentSignature - an extra string that will be appended to User-Agent headers when making API requests
   */
  constructor(config, agentSignature) {
    this.code = null;
    this.kernelId = null;
    this.kernelType = null;
    this.clientVersion = '0.4.0';  // TODO: read from package.json?
    this.agentSignature = agentSignature;
    if (config === undefined) {
      this._config = ClientConfig.createFromEnv();
    } else {
      this._config = config;
    }
  }

  async _wrapWithPromise(rqst) {
    let errorType = Client.ERR_REQUEST;
    let errorMsg;
    let resp, body;
    try {
      if (rqst.method == 'GET') {
        rqst.body = undefined;
      }
      resp = await fetch(rqst.uri, rqst);
      errorType = Client.ERR_RESPONSE;
      let contentType = resp.headers.get('Content-Type');
      if (contentType.startsWith('application/json') ||
          contentType.startsWith('application/problem+json')) {
        body = await resp.json();
      } else if (contentType.startsWith('text/')) {
        body = await resp.text();
      } else {
        if (resp.blob === undefined)
          body = await resp.buffer();  // for node-fetch
        else
          body = await resp.blob();
      }
      errorType = Client.ERR_SERVER;
      if (!resp.ok) {
        throw body;
      }
    } catch (err) {
      switch (errorType) {
      case Client.ERR_REQUEST:
        errorMsg = `sending request has failed: ${err}`;
        break;
      case Client.ERR_RESPONSE:
        errorMsg = `reading response has failed: ${err}`;
        break;
      case Client.ERR_SERVER:
        errorMsg = 'server responded failure: '
                   + `${resp.status} ${resp.statusText} - ${body.title}`;
        break;
      }
      throw {
        type: errorType,
        message: errorMsg,
      };
    }
    return body;
  }

  /**
   * Return the server-side API version.
   */
  getServerVersion() {
    let rqst = this.newPublicRequest('GET', '', null, '');
    return this._wrapWithPromise(rqst);
  }

  /**
   * Create a compute session if the session for the given sessionId does not exists.
   * It returns the information for the existing session otherwise, without error.
   *
   * @param {string} kernelType - the kernel type (usually language runtimes)
   * @param {string} sessionId - user-defined session ID
   */
  createIfNotExists(kernelType, sessionId) {
    if (sessionId === undefined)
      sessionId = this.generateSessionId();
    let params = {
      "lang": kernelType,
      "clientSessionToken": sessionId,
    };
    let rqst = this.newSignedRequest('POST', '/kernel/create', params);
    return this._wrapWithPromise(rqst);
  }

  /**
   * Obtain the session information by given sessionId.
   *
   * @param {string} sessionId - the sessionId given when created
   */
  getInformation(sessionId) {
    let rqst = this.newSignedRequest('GET', `/kernel/${sessionId}`, null);
    return this._wrapWithPromise(rqst);
  }

  /**
   * Terminate and destroy the kernel session.
   *
   * @param {string} sessionId - the sessionId given when created
   */
  destroy(sessionId) {
    let rqst = this.newSignedRequest('DELETE', `/kernel/${sessionId}`, null);
    return this._wrapWithPromise(rqst);
  }

  /**
   * Restart the kernel session keeping its work directory and volume mounts.
   *
   * @param {string} sessionId - the sessionId given when created
   */
  restart(sessionId) {
    let rqst = this.newSignedRequest('PATCH', `/kernel/${sessionId}`, null);
    return this._wrapWithPromise(rqst);
  }

  // TODO: interrupt

  // TODO: auto-complete

  /**
   * Execute a code snippet or schedule batch-mode executions.
   *
   * @param {string} sessionId - the sessionId given when created
   * @param {string} runId - a random ID to distinguish each continuation until finish (the length must be between 8 to 64 bytes inclusively)
   * @param {string} mode - either "query", "batch", "input", or "continue"
   * @param {string} opts - an optional object specifying additional configs such as batch-mode build/exec commands
   */
  execute(sessionId, runId, mode, code, opts) {
    let params = {
      "mode": mode,
      "code": code,
      "runId": runId,
      "opts": opts,
    };
    let rqst = this.newSignedRequest('POST', `/kernel/${sessionId}`, params);
    return this._wrapWithPromise(rqst);
  }

  // legacy aliases
  createKernel(kernelType) {
    return this.createIfNotExists(kernelType);
  }

  destroyKernel(kernelId) {
    return this.destroy(kernelId);
  }

  refreshKernel(kernelId) {
    return this.restart(kernelId);
  }

  runCode(code, kernelId, runId, mode) {
    return this.execute(kernelId, runId, mode, code, {});
  }

  mangleUserAgentSignature() {
    let uaSig = this.clientVersion
                + (this.agentSignature ? ('; ' + this.agentSignature) : '');
    return uaSig;
  }
  /* GraphQL requests */
  gql(q, v) {
    let query = {
      'query': q,
      'variables': v
    }
    let rqst = this.newSignedRequest('POST', `/admin/graphql`, query);
    return this._wrapWithPromise(rqst);
  }
  test_gql(){
    let status = 'RUNNING';
    let fields = ["sess_id","lang","created_at", "terminated_at", "status", "mem_slot", "cpu_slot", "gpu_slot", "cpu_used", "io_read_bytes", "io_write_bytes"];
    let q = `query($ak:String, $status:String) {`+
    `  compute_sessions(access_key:$ak, status:$status) { ${fields.join(" ")} }`+
    '}';
    let v = {'status': 'RUNNING', 'ak': this._config.accessKey};
    var a = this.gql(q, v);
    console.log(a);
  }

  /**
   * Generate a RequestInfo object that can be passed to fetch() API,
   * which includes a properly signed header with the configured auth information.
   *
   * @param {string} method - the HTTP method
   * @param {string} queryString - the URI path and GET parameters
   * @param {string} body - an object that will be encoded as JSON in the request body
   */
  newSignedRequest(method, queryString, body) {
    let requestBody;
    let d = new Date();
    let signKey = this.getSignKey(this._config.secretKey, d);
    if (body === null || body === undefined) {
      requestBody = '';
    } else {
      requestBody = JSON.stringify(body);
    }
    queryString = '/' + this._config.apiVersionMajor + queryString;
    let aStr = this.getAuthenticationString(method, queryString, d.toISOString(), requestBody);
    let rqstSig = this.sign(signKey, 'binary', aStr, 'hex');
    let hdrs = new Headers({
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(requestBody),
      "User-Agent": `Backend.AI Client for Javascript ${this.mangleUserAgentSignature()}`,
      "X-BackendAI-Version": this._config.apiVersion,
      "X-BackendAI-Date": d.toISOString(),
      "Authorization": `BackendAI signMethod=HMAC-SHA256, credential=${this._config.accessKey}:${rqstSig}`
    });

    let requestInfo = {
      method: method,
      headers: hdrs,
      cache: 'default',
      body: requestBody,
      uri: this._config.endpoint + queryString,
    };
    return requestInfo;
  }

  /**
   * Same to newRequest() method but it does not sign the request.
   * Use this for unauthorized public APIs.
   */

  newUnsignedRequest(method, queryString, body) {
    return this.newPublicRequest(method, queryString, body, this._config.apiVersionMajor);
  }

  newPublicRequest(method, queryString, body, urlPrefix) {
    let d = new Date();
    let hdrs = new Headers({
      "Content-Type": "application/json",
      "User-Agent": `Backend.AI Client for Javascript ${this.mangleUserAgentSignature()}`,
      "X-BackendAI-Version": this._config.apiVersion,
      "X-BackendAI-Date": d.toISOString()
    });
    queryString = '/' + urlPrefix + queryString;
    let requestInfo = {
      method: method,
      headers: hdrs,
      mode: 'cors',
      cache: 'default',
      uri: this._config.endpoint + queryString,
    };
    return requestInfo;
  }


  getAuthenticationString(method, queryString, dateValue, bodyValue) {
    let bodyHash = crypto.createHash(this._config.hashType)
                   .update(bodyValue).digest('hex');
    return (method + '\n' + queryString + '\n' + dateValue + '\n'
            + 'host:' + this._config.endpointHost + '\n'
            + 'content-type:application/json' + '\n'
            + 'x-backendai-version:' + this._config.apiVersion + '\n'
            + bodyHash);
  }

  getCurrentDate(now) {
    let year = (`0000${now.getUTCFullYear()}`).slice(-4);
    let month = (`0${now.getUTCMonth() + 1}`).slice(-2);
    let day = (`0${now.getUTCDate()}`).slice(-2);
    let t = year + month + day;
    return t;
  }

  sign(key, key_encoding, msg, digest_type) {
    let kbuf = new Buffer(key, key_encoding);
    let hmac = crypto.createHmac(this._config.hashType, kbuf);
    hmac.update(msg, 'utf8');
    return hmac.digest(digest_type);
  }

  getSignKey(secret_key, now) {
    let k1 = this.sign(secret_key, 'utf8', this.getCurrentDate(now), 'binary');
    let k2 = this.sign(k1, 'binary', this._config.endpointHost, 'binary');
    return k2;
  }

  generateSessionId() {
    var text = "backend-ai-SDK-js-";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 8; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
  }
}

// below will become "static const" properties in ES7
Object.defineProperty(Client, 'ERR_SERVER', {
    value: 0,
    writable: false,
    enumerable: true,
    configurable: false
});
Object.defineProperty(Client, 'ERR_RESPONSE', {
    value: 1,
    writable: false,
    enumerable: true,
    configurable: false
});
Object.defineProperty(Client, 'ERR_REQUEST', {
    value: 2,
    writable: false,
    enumerable: true,
    configurable: false
});

const backend = {
  Client: Client,
  ClientConfig: ClientConfig,
}

// for use like "ai.backend.Client"
module.exports.backend = backend;
// for classical uses
module.exports.Client = Client;
module.exports.ClientConfig = ClientConfig;
// legacy aliases
module.exports.BackendAIClient = Client;
module.exports.BackendAIClientConfig = ClientConfig;
