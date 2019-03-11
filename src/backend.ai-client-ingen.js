'use babel';
/*
Backend.AI Node.JS / Javascript ES6 API Proxy Library for Ingen (v19.03b9)
==========================================================================

(C) Copyright 2016-2019 Lablup Inc.
Licensed under MIT
*/
/* jshint esnext: true */

const clientNode = require('./backend.ai-client-node');


class IngenClientConfig extends clientNode.ClientConfig {
  constructor(accessKey, secretKey, endpoint) {
    accessKey = secretKey = endpoint = '';
    super(accessKey, secretKey, endpoint);
  }
}

class IngenClient extends clientNode.Client {
  constructor(config, agentSignature) {
    super(config, agentSignature);
    this.kernelPrefix = '/ingen/kernel';
    this.vfolder.urlPrefix = '/ingen/folders';
  }

  /* GraphQL requests */
  gql(q, v) {
    const query = {'query': q, 'variables': v};
    const rqst = this.newSignedRequest('POST', '/ingen/graphql', query);
    return this._wrapWithPromise(rqst);
  }

  /**
   * Generate a RequestInfo object that can be passed to fetch() API.
   * We don't need signing process since it will be dealt in ingen server,
   * but we keep the method name to follow the parent's interface.
   *
   * @param {string} method - the HTTP method
   * @param {string} queryString - the URI path and GET parameters
   * @param {string} body - an object that will be encoded as JSON in the request body
   *
   * @return {Object} requestInfo - ingen request information
   */
  newSignedRequest(method, queryString, body) {
    let requestBody;
    let contentType = 'application/json';
    if (body === null || body === undefined) {
      requestBody = '';
    } else if (typeof body.getBoundary === 'function' || body instanceof FormData) {
      // detect form data input from form-data module
      requestBody = body;
      contentType = 'multipart/form-data';
    } else {
      requestBody = JSON.stringify(body);
    }

    const hdrs = new Headers();
    if (body != undefined) {
      if (typeof body.getBoundary === 'function') {
        hdrs.set('Content-Type', body.getHeaders()['content-type']);
      }
      if (body instanceof FormData) {
      } else {
        hdrs.set('Content-Type', content_type);
        hdrs.set('Content-Length', Buffer.byteLength(authBody));
      }
    } else {
      hdrs.set('Content-Type', contentType);
    }
    const uri = queryString; // endpoint will be determined in inge

    const requestInfo = {
      method: method,
      headers: hdrs,
      cache: 'default',
      body: requestBody,
      uri: uri
    };
    return requestInfo;
  }

  hello() {
    const rqst = this.newSignedRequest('GET', '/ingen');
    return this._wrapWithPromise(rqst);
  }
}


const backend = {
  Client: IngenClient,
  ClientConfig: IngenClientConfig,
};

module.exports.backend = backend;
// for classical uses
module.exports.Client = IngenClient;
module.exports.ClientConfig = IngenClientConfig;
// legacy aliases
module.exports.BackendAIClient = IngenClient;
module.exports.BackendAIClientConfig = IngenClientConfig;
