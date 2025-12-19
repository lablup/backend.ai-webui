'use babel';
/*
Backend.AI API Library / SDK for Node.JS / Javascript ESModule (v22.9.0)
====================================================================

(C) Copyright 2016-2022 Lablup Inc.
Licensed under MIT
*/
/*jshint esnext: true */
//const fetch = require('node-fetch'); /* Exclude for ES6 */
//const Headers = fetch.Headers; /* Exclude for ES6 */

const crypto_node = require('crypto');
//const FormData = require('form-data');
//import crypto from 'crypto-browserify';

const querystring = require('querystring');

interface Window {
  backendaiclient: any;
}

type requestInfo = {
  method: string;
  headers: Headers;
  mode?: RequestMode | undefined;
  body?: any | undefined;
  cache?: RequestCache | undefined;
  uri: string;
  credentials?: RequestCredentials | undefined;
  signal?: AbortController['signal'] | undefined;
};

class ClientConfig {
  public _apiVersionMajor: string;
  public _apiVersion: string;
  public _hashType: string;
  public _endpoint: string;
  public _endpointHost: string;
  public _accessKey: string;
  public _secretKey: string;
  public _userId: string;
  public _password: string;
  public _proxyURL: any;
  public _proxyToken: any;
  public _connectionMode: string;

  /**
   * The client Configuration object.
   *
   * @param {string} accessKey - access key to connect Backend.AI manager
   * @param {string} secretKey - secret key to connect Backend.AI manager
   * @param {string} endpoint  - endpoint of Backend.AI manager
   * @param {string} connectionMode - connection mode. 'API', 'SESSION' is supported. `SESSION` mode requires webserver.
   */
  constructor(
    accessKey: string,
    secretKey: string,
    endpoint: string,
    connectionMode: string = 'API',
  ) {
    // default configs.
    this._apiVersionMajor = '4';
    this._apiVersion = 'v4.20190615'; // For compatibility with 19.03 / 1.4
    this._hashType = 'sha256';
    if (endpoint === undefined || endpoint === null)
      endpoint = 'https://api.backend.ai';
    this._endpoint = endpoint;
    this._endpointHost = endpoint.replace(/^[^:]+:\/\//, '');
    if (connectionMode === 'API') {
      // API mode
      // dynamic configs
      if (accessKey === undefined || accessKey === null)
        throw 'You must set accessKey! (either as argument or environment variable)';
      if (secretKey === undefined || secretKey === null)
        throw 'You must set secretKey! (either as argument or environment variable)';
      this._accessKey = accessKey;
      this._secretKey = secretKey;
      this._userId = '';
      this._password = '';
    } else {
      // Session mode
      // dynamic configs
      if (accessKey === undefined || accessKey === null)
        throw 'You must set user id! (either as argument or environment variable)';
      if (secretKey === undefined || secretKey === null)
        throw 'You must set password! (either as argument or environment variable)';
      this._accessKey = '';
      this._secretKey = '';
      this._userId = accessKey;
      this._password = secretKey;
    }
    this._proxyURL = null;
    this._proxyToken = null;
    this._connectionMode = connectionMode;
  }

  get accessKey() {
    return this._accessKey;
  }

  get secretKey() {
    return this._secretKey;
  }

  get userId() {
    return this._userId;
  }

  get password() {
    return this._password;
  }

  get endpoint() {
    return this._endpoint;
  }

  get proxyURL() {
    return this._proxyURL;
  }
  get proxyToken() {
    return this._proxyToken;
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

  get connectionMode() {
    return this._connectionMode;
  }

  /**
   * Create a ClientConfig object from environment variables.
   */
  static createFromEnv() {
    return new this(
      process.env.BACKEND_ACCESS_KEY,
      process.env.BACKEND_SECRET_KEY,
      process.env.BACKEND_ENDPOINT,
    );
  }
}

class Client {
  public code: any;
  public sessionId: string | null;
  public kernelType: any;
  public clientVersion: string;
  public agentSignature: any;
  public _config: any;
  public _managerVersion: any;
  public _apiVersion: any;
  public _apiVersionMajor: any;
  public is_admin: boolean;
  public is_superadmin: boolean;
  public kernelPrefix: any;
  public resourcePreset: ResourcePreset;
  public vfolder: VFolder;
  public agent: Agent;
  public keypair: Keypair;
  public image: ContainerImage;
  public utils: utils;
  public computeSession: ComputeSession;
  public sessionTemplate: SessionTemplate;
  public resourcePolicy: ResourcePolicy;
  public user: User;
  public group: Group;
  public domain: Domain;
  public resources: Resources;
  public storageproxy: StorageProxy;
  public maintenance: Maintenance;
  public scalingGroup: ScalingGroup;
  public registry: Registry;
  public setting: Setting;
  public userConfig: UserConfig;
  public cloud: Cloud;
  public eduApp: EduApp;
  public service: Service;
  public enterprise: Enterprise;
  public pipeline: Pipeline;
  public pipelineJob: PipelineJob;
  public pipelineTaskInstance: PipelineTaskInstance;
  public _features: any;
  public ready: boolean = false;
  public abortController: any;
  public abortSignal: any;
  public requestTimeout: number;
  static ERR_REQUEST: any;
  static ERR_RESPONSE: any;
  static ERR_ABORT: any;
  static ERR_TIMEOUT: any;
  static ERR_SERVER: any;
  static ERR_UNKNOWN: any;

  /**
   * The client API wrapper.
   *
   * @param {ClientConfig} config - the API client-side configuration
   * @param {string} agentSignature - an extra string that will be appended to User-Agent headers when making API requests
   */
  constructor(config, agentSignature) {
    this.code = null;
    this.sessionId = null;
    this.kernelType = null;
    this.clientVersion = '20.11.0';
    this.agentSignature = agentSignature;
    if (config === undefined) {
      this._config = ClientConfig.createFromEnv();
    } else {
      this._config = config;
    }
    this._managerVersion = null;
    this._apiVersion = null;
    this._apiVersionMajor = null;
    this.is_admin = false;
    this.is_superadmin = false;
    this.kernelPrefix = '/kernel';
    this.resourcePreset = new ResourcePreset(this);
    this.vfolder = new VFolder(this);
    this.agent = new Agent(this);
    this.keypair = new Keypair(this);
    this.image = new ContainerImage(this);
    this.utils = new utils(this);
    this.computeSession = new ComputeSession(this);
    this.sessionTemplate = new SessionTemplate(this);
    this.resourcePolicy = new ResourcePolicy(this);
    this.user = new User(this);
    this.group = new Group(this);
    this.domain = new Domain(this);
    this.resources = new Resources(this);
    this.storageproxy = new StorageProxy(this);
    this.maintenance = new Maintenance(this);
    this.scalingGroup = new ScalingGroup(this);
    this.registry = new Registry(this);
    this.setting = new Setting(this);
    this.userConfig = new UserConfig(this);
    this.service = new Service(this);
    this.domain = new Domain(this);
    this.enterprise = new Enterprise(this);
    this.cloud = new Cloud(this);
    this.eduApp = new EduApp(this);
    this.pipeline = new Pipeline(this);
    this.pipelineJob = new PipelineJob(this);
    this.pipelineTaskInstance = new PipelineTaskInstance(this);
    this._features = {}; // feature support list
    this.abortController = new AbortController();
    this.abortSignal = this.abortController.signal;
    this.requestTimeout = 15000;
    //if (this._config.connectionMode === 'API') {
    //this.getManagerVersion();
    //}
  }

  /**
   * Return the server-side manager version.
   */
  get managerVersion() {
    return this._managerVersion;
  }

  /**
   * Return the server-side manager version.
   */
  get apiVersion() {
    return this._apiVersion;
  }
  /**
   * Promise wrapper for asynchronous request to Backend.AI manager.
   *
   * @param {Request} rqst - Request object to send
   * @param {Boolean} rawFile - True if it is raw request
   * @param {AbortController.signal} signal - Request signal to abort fetch
   * @param {number} timeout - Custom timeout (sec.) If no timeout is given, default timeout is used.
   * @param {number} retry - an integer to retry this request
   * @param {Object} opts - Options
   */
  async _wrapWithPromise(
    rqst,
    rawFile = false,
    signal = null,
    timeout: number = 0,
    retry: number = 0,
    opts = {},
  ) {
    let errorType = Client.ERR_REQUEST;
    let errorTitle = '';
    let errorMsg;
    let errorDesc = '';
    let resp, body, requestTimer;
    try {
      if (rqst.method == 'GET') {
        rqst.body = undefined;
      }
      if (this._config.connectionMode === 'SESSION') {
        // Force request to use Public when session mode is enabled
        rqst.credentials = 'include';
        rqst.mode = 'cors';
      }
      if (signal !== null) {
        rqst.signal = signal;
      } else {
        // Use client-wide fetch timeout.
        let controller = new AbortController();
        rqst.signal = controller.signal;
        requestTimer = setTimeout(
          () => {
            errorType = Client.ERR_TIMEOUT;
            controller.abort();
          },
          timeout === 0 ? this.requestTimeout : timeout,
        );
      }
      resp = await fetch(rqst.uri, rqst);
      if (typeof requestTimer !== 'undefined') {
        clearTimeout(requestTimer);
      }
      errorType = Client.ERR_RESPONSE;
      let contentType = resp.headers.get('Content-Type');
      if (rawFile === false && contentType === null) {
        if (resp.blob === undefined)
          body = await resp.buffer(); // for node-fetch
        else body = await resp.blob();
      } else if (
        rawFile === false &&
        (contentType.startsWith('application/json') ||
          contentType.startsWith('application/problem+json'))
      ) {
        body = await resp.json(); // Formatted error message from manager
        errorType = body.type;
        errorTitle = body.title;
      } else if (rawFile === false && contentType.startsWith('text/')) {
        body = await resp.text();
      } else {
        if (resp.blob === undefined) {
          body = await resp.buffer(); // for node-fetch
        } else {
          body = await resp.blob();
        }
      }
      errorType = Client.ERR_SERVER;
      if (!resp.ok) {
        throw body;
      }
    } catch (err) {
      if (retry > 0) {
        await new Promise((r) => setTimeout(r, 2000)); // Retry after 2 seconds.
        return this._wrapWithPromise(
          rqst,
          rawFile,
          signal,
          timeout,
          retry - 1,
          opts,
        );
      }
      let error_message;
      if (
        typeof err == 'object' &&
        err.constructor === Object &&
        'title' in err
      ) {
        error_message = err.title; // formatted message
      } else {
        error_message = err;
      }
      if (typeof resp === 'undefined') {
        resp = {};
      }
      switch (errorType) {
        case Client.ERR_REQUEST:
          errorType = 'https://api.backend.ai/probs/client-request-error';
          if (navigator.onLine) {
            errorTitle = error_message;
            errorMsg = `sending request has failed: ${error_message}`;
            errorDesc = error_message;
          } else {
            errorTitle = 'Network disconnected.';
            errorMsg = `sending request has failed: Network disconnected`;
            errorDesc = 'Network disconnected';
          }
          break;
        case Client.ERR_RESPONSE:
          errorType = 'https://api.backend.ai/probs/client-response-error';
          errorTitle = error_message;
          errorMsg = `reading response has failed: ${error_message}`;
          errorDesc = error_message;
          break;
        case Client.ERR_SERVER:
          errorType = 'https://api.backend.ai/probs/server-error';
          errorTitle = `${resp.status} ${resp.statusText} - ${body.title}`;
          errorMsg = 'server responded failure: ';
          if (body.msg) {
            errorMsg =
              errorMsg + `${resp.status} ${resp.statusText} - ${body.msg}`;
            errorDesc = body.msg;
          } else {
            errorMsg =
              errorMsg + `${resp.status} ${resp.statusText} - ${body.title}`;
            errorDesc = body.title;
          }
          break;
        case Client.ERR_ABORT:
          errorType = 'https://api.backend.ai/probs/request-abort-error';
          errorTitle = `Request aborted`;
          errorMsg = 'Request aborted by user';
          errorDesc = errorMsg;
          resp.status = 408;
          resp.statusText = 'Request aborted by user';
          break;
        case Client.ERR_TIMEOUT:
          errorType = 'https://api.backend.ai/probs/request-timeout-error';
          errorTitle = `Request timeout`;
          errorMsg = 'No response returned within timeout';
          errorDesc = errorMsg;
          resp.status = 408;
          resp.statusText = 'Timeout exceeded';
          break;
        default:
          if (typeof resp.status === 'undefined') {
            resp.status = 500;
            resp.statusText = 'Server error';
          }
          if (errorType === '') {
            errorType = Client.ERR_UNKNOWN;
          }
          if (errorTitle === '') {
            errorTitle = body.title;
          }
          errorMsg =
            'server responded failure: ' +
            `${resp.status} ${resp.statusText} - ${body.title}`;
          if (body.title !== '') {
            errorDesc = body.title;
          }
      }
      throw {
        isError: true,
        timestamp: new Date().toUTCString(),
        type: errorType,
        requestUrl: rqst.uri,
        requestMethod: rqst.method,
        requestParameters: rqst.body,
        statusCode: resp.status,
        statusText: resp.statusText,
        title: errorTitle,
        message: errorMsg,
        description: errorDesc,
      };
    }

    let previous_log = JSON.parse(
      localStorage.getItem('backendaiwebui.logs') as any,
    );
    if (previous_log) {
      if (previous_log.length > 3000) {
        previous_log = previous_log.slice(1, 3000);
      }
    }
    let log_stack = Array();
    if (typeof resp === 'undefined') {
      resp = {
        status: 'No status',
        statusText: 'No response given.',
      };
    }
    let current_log = {
      isError: false,
      timestamp: new Date().toUTCString(),
      type: '',
      requestUrl: rqst.uri,
      requestMethod: rqst.method,
      requestParameters: rqst.body,
      statusCode: resp.status,
      statusText: resp.statusText,
      title: body.title,
      message: '',
    };
    if ('log' in opts) {
      current_log.requestParameters = opts['log'];
    }
    log_stack.push(current_log);

    if (previous_log) {
      log_stack = log_stack.concat(previous_log);
    }
    try {
      localStorage.setItem('backendaiwebui.logs', JSON.stringify(log_stack));
    } catch (e) {
      console.warn('Local storage is full. Clearing part of the logs.');
      // localStorage is full, we will keep the recent 2/3 of the logs.
      let webuiLogs = JSON.parse(
        localStorage.getItem('backendaiwebui.logs') || '[]',
      );
      webuiLogs = webuiLogs.slice(0, Math.round((webuiLogs.length * 2) / 3));
      localStorage.setItem('backendaiwebui.logs', JSON.stringify(webuiLogs));
      // Deprecated backendaiconsole.* should also be cleared here.
      Object.entries(localStorage)
        .map((x) => x[0]) // get key
        .filter((x) => x.startsWith('backendaiconsole')) // filter keys start with backendaiconsole
        .map((x) => localStorage.removeItem(x)); // remove filtered keys

      // Will not throw exception here since the request should be proceeded
      // even if it is not possible to write log to localStorage.
    }

    return body;
  }

  /**
   * Return the server-side API version.
   *
   * @param {AbortController.signal} signal - Request signal to abort fetch
   *
   */
  getServerVersion(signal = null) {
    let rqst = this.newPublicRequest('GET', '/', null, '');
    return this._wrapWithPromise(rqst, false, signal);
  }

  /**
   * Get API major version
   */
  get APIMajorVersion() {
    return this._apiVersionMajor;
  }

  /**
   * Force API major version
   */
  set APIMajorVersion(value) {
    this._apiVersionMajor = value;
    this._config._apiVersionMajor = this._apiVersionMajor; // To upgrade API version with server version
  }

  /**
   * Get the server-side manager version.
   *
   * @param {AbortController.signal} signal - Request signal to abort fetch
   */
  async get_manager_version(signal = null) {
    if (this._managerVersion === null) {
      let v = await this.getServerVersion(signal);
      this._managerVersion = v.manager;
      this._apiVersion = v.version;
      this._config._apiVersion = this._apiVersion; // To upgrade API version with server version
      this._apiVersionMajor = v.version.substr(1, 2);
      this._config._apiVersionMajor = this._apiVersionMajor; // To upgrade API version with server version
      if (this._apiVersionMajor > 4) {
        this.kernelPrefix = '/session';
      }
    }
    return this._managerVersion;
  }

  /**
   * Check compatibility of current manager
   */
  supports(feature) {
    if (Object.keys(this._features).length === 0) {
      this._updateSupportList();
    }
    if (feature in this._features) {
      return this._features[feature];
    } else {
      return false;
    }
  }

  _updateFieldCompatibilityByAPIVersion(fields) {
    const v4_replacements = {
      session_name: 'sess_id',
    };
    if (this._apiVersionMajor < 5) {
      // For V3/V4 API compatibility
      Object.keys(v4_replacements).forEach((key) => {
        let index = fields.indexOf(key);
        if (index !== -1) {
          fields[index] = v4_replacements[key];
        }
      });
    }
    return fields;
  }

  _updateSupportList() {
    if (this.isAPIVersionCompatibleWith('v4.20190601')) {
      this._features['scaling-group'] = true;
      this._features['group'] = true;
      this._features['group-folder'] = true;
      this._features['system-images'] = true;
      this._features['detailed-session-states'] = true;
      this._features['change-user-name'] = true;
    }
    if (this.isAPIVersionCompatibleWith('v6.20200815')) {
      this._features['multi-container'] = true;
      this._features['multi-node'] = true;
      this._features['storage-proxy'] = true;
      this._features['hardware-metadata'] = true;
    }
    if (this.isManagerVersionCompatibleWith('20.09.16')) {
      this._features['avoid-hol-blocking'] = true;
      this._features['session-detail-status'] = true;
    }
    if (this.isManagerVersionCompatibleWith('21.09')) {
      this._features['schedulable'] = true;
      this._features['wsproxy-addr'] = true;
    }
    if (this.isManagerVersionCompatibleWith('22.03')) {
      this._features['scheduler-opts'] = true;
      this._features['session-lifetime'] = true;
    }
  }

  /**
   * Return if manager is compatible with given version.
   */
  isManagerVersionCompatibleWith(version) {
    let managerVersion = this._managerVersion;
    managerVersion = managerVersion
      .split('.')
      .map((s) => s.padStart(10))
      .join('.');
    version = version
      .split('.')
      .map((s) => s.padStart(10))
      .join('.');
    return version <= managerVersion;
  }

  /**
   * Return if api is compatible with given version.
   */
  isAPIVersionCompatibleWith(version) {
    let apiVersion = this._apiVersion;
    if (apiVersion !== null && version !== null) {
      apiVersion = apiVersion
        .split('.')
        .map((s) => s.padStart(10))
        .join('.');
      version = version
        .split('.')
        .map((s) => s.padStart(10))
        .join('.');
    }
    return version <= apiVersion;
  }

  /**
   * Check if webserver is authenticated. This requires additional webserver package.
   *
   */
  async check_login() {
    let rqst = this.newSignedRequest('POST', `/server/login-check`, null);
    let result;
    try {
      result = await this._wrapWithPromise(rqst);
      if (result.authenticated === true) {
        this._config._accessKey = result.data.access_key;
        this._config._session_id = result.session_id;
        //console.log("login succeed");
      } else {
        //console.log("login failed");
      }
    } catch (err) {
      // console.log(err);
      return Promise.resolve(false);
    }
    return result.authenticated;
  }

  /**
   * Login into webserver with given ID/Password. This requires additional webserver package.
   *
   */
  async login(otp?: string) {
    let body = {
      username: this._config.userId,
      password: this._config.password,
    };
    if (otp) body['otp'] = otp;
    let rqst = this.newSignedRequest('POST', `/server/login`, body);
    let result;
    try {
      result = await this._wrapWithPromise(rqst, false, null, 0, 0, {
        log: JSON.stringify({
          username: this._config.userId,
          password: '********',
        }),
      });
      if (result.authenticated === true) {
        if (result.data.role === 'monitor') {
          this.logout();
          return Promise.resolve({
            fail_reason: 'Monitor user does not allow to login.',
          });
        }
        await this.get_manager_version();
        return this.check_login();
      } else if (result.authenticated === false) {
        // Authentication failed.
        if (result.data && result.data.details) {
          return Promise.resolve({ fail_reason: result.data.details });
        } else {
          return Promise.resolve(false);
        }
      }
    } catch (err) {
      // Manager / webserver down.
      if ('statusCode' in err && err.statusCode === 429) {
        throw {
          title: err.description,
          message: 'Too many failed login attempts.',
        };
      } else {
        throw {
          title: 'No manager found at API Endpoint.',
          message:
            'Authentication failed. Check information and manager status.',
        };
      }
      //console.log(err);
      //return false;
    }
  }

  /**
   * Logout from webserver. This requires additional webserver package.
   *
   */
  logout() {
    let body = {};
    let rqst = this.newSignedRequest('POST', `/server/logout`, body);
    // clean up log msg for security reason
    const currentLogs = localStorage.getItem('backendaiwebui.logs');
    if (currentLogs) {
      localStorage.removeItem('backendaiwebui.logs');
    }
    return this._wrapWithPromise(rqst);
  }

  /**
   * Login into webserver with auth cookie token. This requires additional webserver package.
   *
   */
  async token_login() {
    const body = {};
    const rqst = this.newSignedRequest('POST', `/server/token-login`, body);
    try {
      const result = await this._wrapWithPromise(rqst);
      if (result.authenticated === true) {
        await this.get_manager_version();
        return this.check_login();
      } else if (result.authenticated === false) {
        // Authentication failed.
        if (result.data && result.data.details) {
          return Promise.resolve({ fail_reason: result.data.details });
        } else {
          return Promise.resolve(false);
        }
      }
    } catch (err) {
      // Manager / webserver down.
      if ('statusCode' in err && err.statusCode === 429) {
        throw {
          title: err.description,
          message: 'Too many failed login attempts.',
        };
      } else {
        throw {
          title: 'No manager found at API Endpoint.',
          message:
            'Authentication failed. Check information and manager status.',
        };
      }
      //console.log(err);
      //return false;
    }
  }

  /**
   * Leave from manager user. This requires additional webserver package.
   *
   */
  async signout(userid, password) {
    let body = {
      username: userid,
      password: password,
    };
    let rqst = this.newSignedRequest('POST', `/auth/signout`, body);
    return this._wrapWithPromise(rqst);
  }

  /**
   * Update user's full_name.
   */
  async update_full_name(email, fullName) {
    let body = {
      email: email,
      full_name: fullName,
    };
    let rqst = this.newSignedRequest('POST', `/auth/update-full-name`, body);
    return this._wrapWithPromise(rqst);
  }

  /**
   * Update user's password.
   *
   */
  async update_password(oldPassword, newPassword, newPassword2) {
    let body = {
      old_password: oldPassword,
      new_password: newPassword,
      new_password2: newPassword2,
    };
    let rqst = this.newSignedRequest('POST', `/auth/update-password`, body);
    return this._wrapWithPromise(rqst);
  }

  async initialize_totp() {
    let rqst = this.newSignedRequest('POST', '/totp', {});
    return this._wrapWithPromise(rqst);
  }

  async activate_totp(otp) {
    let rqst = this.newSignedRequest('POST', '/totp/verify', { otp });
    return this._wrapWithPromise(rqst);
  }

  async remove_totp() {
    let rqst = this.newSignedRequest('DELETE', '/totp', {});
    return this._wrapWithPromise(rqst);
  }

  /**
   * Return the resource slots.
   */
  async get_resource_slots() {
    let rqst;
    if (this.isAPIVersionCompatibleWith('v4.20190601')) {
      rqst = this.newPublicRequest('GET', '/config/resource-slots', null, '');
    } else {
      rqst = this.newPublicRequest('GET', '/etcd/resource-slots', null, '');
    }
    return this._wrapWithPromise(rqst);
  }

  /**
   * Create a compute session if the session for the given sessionId does not exists.
   * It returns the information for the existing session otherwise, without error.
   *
   * @param {string} kernelType - the kernel type (usually language runtimes)
   * @param {string} sessionId - user-defined session ID
   * @param {string} architecture - image architecture
   * @param {object} resources - Per-session resource
   * @param {number} timeout - Timeout of request. Default : default fetch value. (5sec.)
   */
  async createIfNotExists(
    kernelType,
    sessionId,
    resources = {},
    timeout: number = 0,
    architecture = '',
  ) {
    if (typeof sessionId === 'undefined' || sessionId === null)
      sessionId = this.generateSessionId();
    let params = {
      lang: kernelType,
      clientSessionToken: sessionId,
      architecture: architecture,
    };
    if (resources && Object.keys(resources).length > 0) {
      let config = {};
      if (resources['cpu']) {
        config['cpu'] = resources['cpu'];
      }
      if (resources['mem']) {
        config['mem'] = resources['mem'];
      }
      if (resources['gpu']) {
        // Legacy support (till 19.09)
        config['cuda.device'] = parseInt(resources['gpu']);
      }
      if (resources['cuda.device']) {
        // Generalized device information from 20.03
        config['cuda.device'] = parseInt(resources['cuda.device']);
      }
      if (resources['vgpu']) {
        // Legacy support (till 19.09)
        config['cuda.shares'] = parseFloat(resources['vgpu']).toFixed(2); // under 19.03
      } else if (resources['fgpu']) {
        config['cuda.shares'] = parseFloat(resources['fgpu']).toFixed(2); // 19.09 and above
      }
      if (resources['cuda.shares']) {
        // Generalized device information from 20.03
        config['cuda.shares'] = parseFloat(resources['cuda.shares']).toFixed(2);
      }
      if (resources['rocm']) {
        config['rocm.device'] = resources['rocm'];
      }
      if (resources['tpu']) {
        config['tpu.device'] = resources['tpu'];
      }
      if (resources['cluster_size']) {
        params['cluster_size'] = resources['cluster_size'];
      }
      if (resources['cluster_mode']) {
        params['cluster_mode'] = resources['cluster_mode'];
      }
      if (resources['group_name']) {
        params['group_name'] = resources['group_name'];
      }
      if (resources['domain']) {
        params['domain'] = resources['domain'];
      }
      if (resources['type']) {
        params['type'] = resources['type'];
      }
      if (resources['startsAt']) {
        params['starts_at'] = resources['startsAt'];
      }
      if (resources['enqueueOnly']) {
        params['enqueueOnly'] = resources['enqueueOnly'];
      }
      if (resources['maxWaitSeconds']) {
        params['maxWaitSeconds'] = resources['maxWaitSeconds'];
      }
      if (resources['reuseIfExists']) {
        params['reuseIfExists'] = resources['reuseIfExists'];
      }
      if (resources['startupCommand']) {
        params['startupCommand'] = resources['startupCommand'];
      }
      if (resources['bootstrapScript']) {
        params['bootstrapScript'] = resources['bootstrapScript'];
      }
      if (resources['bootstrap_script']) {
        params['bootstrap_script'] = resources['bootstrap_script'];
      }
      if (resources['owner_access_key']) {
        params['owner_access_key'] = resources['owner_access_key'];
      }
      params['config'] = { resources: config };
      if (resources['mounts']) {
        params['config'].mounts = resources['mounts'];
      }
      if (resources['mount_map']) {
        params['config'].mount_map = resources['mount_map'];
      }
      if (resources['scaling_group']) {
        params['config'].scaling_group = resources['scaling_group'];
      }
      if (resources['shmem']) {
        params['config'].resource_opts = {};
        params['config'].resource_opts.shmem = resources['shmem'];
      }
      if (resources['env']) {
        params['config'].environ = resources['env'];
      }
    }
    let rqst;
    if (this._apiVersionMajor < 5) {
      // For V3/V4 API compatibility
      rqst = this.newSignedRequest(
        'POST',
        `${this.kernelPrefix}/create`,
        params,
      );
    } else {
      rqst = this.newSignedRequest('POST', `${this.kernelPrefix}`, params);
    }
    //return this._wrapWithPromise(rqst);
    return this._wrapWithPromise(rqst, false, null, timeout);
  }

  /**
   * Create a session with a session template.
   *
   * @param {string} sessionId - the sessionId given when created
   */
  async createSessionFromTemplate(
    templateId,
    image = null,
    sessionName: undefined | string | null = null,
    resources = {},
    timeout: number = 0,
  ) {
    if (typeof sessionName === 'undefined' || sessionName === null)
      sessionName = this.generateSessionId();
    const params = { template_id: templateId };
    if (image) {
      params['image'] = image;
    }
    if (sessionName) {
      params['name'] = sessionName;
    }
    if (resources && Object.keys(resources).length > 0) {
      let config = {};
      if (resources['cpu']) {
        config['cpu'] = resources['cpu'];
      }
      if (resources['mem']) {
        config['mem'] = resources['mem'];
      }
      if (resources['cuda.device']) {
        config['cuda.device'] = parseInt(resources['cuda.device']);
      }
      if (resources['fgpu']) {
        config['cuda.shares'] = parseFloat(resources['fgpu']).toFixed(2); // 19.09 and above
      }
      if (resources['cuda.shares']) {
        config['cuda.shares'] = parseFloat(resources['cuda.shares']).toFixed(2);
      }
      if (resources['rocm']) {
        config['rocm.device'] = resources['rocm'];
      }
      if (resources['tpu']) {
        config['tpu.device'] = resources['tpu'];
      }
      if (resources['cluster_size']) {
        params['cluster_size'] = resources['cluster_size'];
      }
      if (resources['cluster_mode']) {
        params['cluster_mode'] = resources['cluster_mode'];
      }
      if (resources['group_name']) {
        params['group_name'] = resources['group_name'];
      }
      if (resources['domain']) {
        params['domain'] = resources['domain'];
      }
      if (resources['type']) {
        params['type'] = resources['type'];
      }
      if (resources['starts_at']) {
        params['starts_at'] = resources['startsAt'];
      }
      if (resources['enqueueOnly']) {
        params['enqueueOnly'] = resources['enqueueOnly'];
      }
      if (resources['maxWaitSeconds']) {
        params['maxWaitSeconds'] = resources['maxWaitSeconds'];
      }
      if (resources['reuseIfExists']) {
        params['reuseIfExists'] = resources['reuseIfExists'];
      }
      if (resources['startupCommand']) {
        params['startupCommand'] = resources['startupCommand'];
      }
      if (resources['bootstrap_script']) {
        params['bootstrap_script'] = resources['bootstrap_script'];
      }
      if (resources['owner_access_key']) {
        params['owner_access_key'] = resources['owner_access_key'];
      }
      // params['config'] = {};
      params['config'] = { resources: config };
      if (resources['mounts']) {
        params['config'].mounts = resources['mounts'];
      }
      if (resources['scaling_group']) {
        params['config'].scaling_group = resources['scaling_group'];
      }
      if (resources['shmem']) {
        params['config'].resource_opts = {};
        params['config'].resource_opts.shmem = resources['shmem'];
      }
      if (resources['env']) {
        params['config'].environ = resources['env'];
      }
    }
    const rqst = this.newSignedRequest(
      'POST',
      `${this.kernelPrefix}/_/create-from-template`,
      params,
    );
    return this._wrapWithPromise(rqst, false, null, timeout);
  }

  /**
   * Obtain the session information by given sessionId.
   *
   * @param {string} sessionId - the sessionId given when created
   */
  async get_info(sessionId, ownerKey = null) {
    let queryString = `${this.kernelPrefix}/${sessionId}`;
    if (ownerKey != null) {
      const searchParams = new URLSearchParams({ owner_access_key: ownerKey });
      queryString = `${queryString}?${searchParams.toString()}`;
    }
    let rqst = this.newSignedRequest('GET', queryString, null);
    return this._wrapWithPromise(rqst);
  }

  /**
   * Obtain the session container logs by given sessionId.
   *
   * @param {string} sessionId - the sessionId given when created
   * @param {string | null} ownerKey - owner key to access
   * @param {number} timeout - timeout to wait log query. Set to 0 to use default value.
   */
  async get_logs(sessionId, ownerKey = null, timeout = 0) {
    let queryString = `${this.kernelPrefix}/${sessionId}/logs`;
    if (ownerKey != null) {
      const searchParams = new URLSearchParams({ owner_access_key: ownerKey });
      queryString = `${queryString}?${searchParams.toString()}`;
    }
    let rqst = this.newSignedRequest('GET', queryString, null);
    return this._wrapWithPromise(rqst, false, null, timeout);
  }

  /**
   * Obtain the batch session (task) logs by given sessionId.
   *
   * @param {string} sessionId - the sessionId given when created
   */
  getTaskLogs(sessionId) {
    const searchParams = new URLSearchParams({ session_name: sessionId });
    const queryString = `${this.kernelPrefix}/_/logs?${searchParams.toString()}`;
    let rqst = this.newSignedRequest('GET', queryString, null);
    return this._wrapWithPromise(rqst);
  }

  /**
   * Terminate and destroy the kernel session.
   *
   * @param {string} sessionId - the sessionId given when created
   * @param {string|null} ownerKey - owner key when terminating other users' session
   * @param {boolean} forced - force destroy session. Requires admin privilege.
   */
  async destroy(sessionId, ownerKey = null, forced: boolean = false) {
    let queryString = `${this.kernelPrefix}/${sessionId}`;
    const searchParams = new URLSearchParams();
    if (ownerKey !== null) {
      searchParams.set('owner_access_key', ownerKey);
    }
    if (forced) {
      searchParams.set('forced', 'true');
    }
    queryString =
      searchParams.size > 0
        ? `${queryString}?${searchParams.toString()}`
        : queryString;
    let rqst = this.newSignedRequest('DELETE', queryString, null);
    return this._wrapWithPromise(rqst, false, null, 15000, 2); // 15 sec., two trial when error occurred.
  }

  /**
   * Restart the kernel session keeping its work directory and volume mounts.
   *
   * @param {string} sessionId - the sessionId given when created
   */
  async restart(sessionId, ownerKey = null) {
    let queryString = `${this.kernelPrefix}/${sessionId}`;
    if (ownerKey != null) {
      const searchParams = new URLSearchParams({ owner_access_key: ownerKey });
      queryString = `${queryString}?${searchParams.toString()}`;
    }
    let rqst = this.newSignedRequest('PATCH', queryString, null);
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
  async execute(sessionId, runId, mode, code, opts, timeout = 0) {
    let params = {
      mode: mode,
      code: code,
      runId: runId,
      options: opts,
    };
    let rqst = this.newSignedRequest(
      'POST',
      `${this.kernelPrefix}/${sessionId}`,
      params,
    );
    return this._wrapWithPromise(rqst, false, null, timeout);
  }

  // legacy aliases (DO NOT USE for new codes)
  createKernel(kernelType, sessionId = undefined, resources = {}, timeout = 0) {
    return this.createIfNotExists(
      kernelType,
      sessionId,
      resources,
      timeout,
      'x86_64',
    );
  }

  // legacy aliases (DO NOT USE for new codes)
  destroyKernel(sessionId, ownerKey = null) {
    return this.destroy(sessionId, ownerKey);
  }

  // legacy aliases (DO NOT USE for new codes)
  refreshKernel(sessionId, ownerKey = null) {
    return this.restart(sessionId, ownerKey);
  }

  // legacy aliases (DO NOT USE for new codes)
  runCode(code, sessionId, runId, mode) {
    return this.execute(sessionId, runId, mode, code, {});
  }

  async rename(sessionId, newId) {
    let params = {
      name: newId,
    };
    let rqst = this.newSignedRequest(
      'POST',
      `${this.kernelPrefix}/${sessionId}/rename`,
      params,
    );
    return this._wrapWithPromise(rqst);
  }

  async shutdown_service(sessionId, service_name) {
    let params = {
      service_name: service_name,
    };
    const q = querystring.stringify(params);
    let rqst = this.newSignedRequest(
      'POST',
      `${this.kernelPrefix}/${sessionId}/shutdown-service?${q}`,
      null,
    );
    return this._wrapWithPromise(rqst, true);
  }

  async upload(sessionId, path, fs) {
    const formData = new FormData();
    //formData.append('src', fs, {filepath: path});
    formData.append('src', fs, path);
    let rqst = this.newSignedRequest(
      'POST',
      `${this.kernelPrefix}/${sessionId}/upload`,
      formData,
    );
    return this._wrapWithPromise(rqst);
  }

  async download(sessionId, files) {
    let params = {
      files: files,
    };
    const q = querystring.stringify(params);
    let rqst = this.newSignedRequest(
      'GET',
      `${this.kernelPrefix}/${sessionId}/download?${q}`,
      null,
    );
    return this._wrapWithPromise(rqst, true);
  }

  async download_single(sessionId, file) {
    let params = {
      file: file,
    };
    const q = querystring.stringify(params);
    let rqst = this.newSignedRequest(
      'GET',
      `${this.kernelPrefix}/${sessionId}/download_single?${q}`,
      null,
    );
    return this._wrapWithPromise(rqst, true);
  }

  mangleUserAgentSignature() {
    let uaSig =
      this.clientVersion +
      (this.agentSignature ? '; ' + this.agentSignature : '');
    return uaSig;
  }

  /**
   * Send GraphQL requests
   *
   * @param {string} q - query string for GraphQL
   * @param {string} v - variable string for GraphQL
   * @param {number} timeout - Timeout to force terminate request
   * @param {number} retry - The number of retry when request is failed
   */
  async query(q, v, signal = null, timeout: number = 0, retry: number = 0) {
    let query = {
      query: q,
      variables: v,
    };
    let rqst = this.newSignedRequest('POST', `/admin/graphql`, query);
    return this._wrapWithPromise(rqst, false, signal, timeout, retry);
  }

  /**
   * Generate a RequestInfo object that can be passed to fetch() API,
   * which includes a properly signed header with the configured auth information.
   *
   * @param {string} method - the HTTP method
   * @param {string} queryString - the URI path and GET parameters
   * @param {any} body - an object that will be encoded as JSON in the request body
   */
  newSignedRequest(method: string, queryString, body: any, serviceName = '') {
    let content_type = 'application/json';
    let requestBody;
    let authBody;
    let d = new Date();
    if (body === null || body === undefined) {
      requestBody = '';
      authBody = requestBody;
    } else if (
      typeof body.getBoundary === 'function' ||
      body instanceof FormData
    ) {
      // detect form data input from form-data module
      requestBody = body;
      authBody = '';
      content_type = 'multipart/form-data';
    } else {
      requestBody = JSON.stringify(body);
      authBody = requestBody;
    }
    //queryString = '/' + this._config.apiVersionMajor + queryString;
    let aStr;
    let hdrs;
    let uri = '';
    if (this._config.connectionMode === 'SESSION') {
      // Force request to use Public when session mode is enabled
      hdrs = new Headers({
        'User-Agent': `Backend.AI Client for Javascript ${this.mangleUserAgentSignature()}`,
        'X-BackendAI-Version': this._config.apiVersion,
        'X-BackendAI-Date': d.toISOString(),
      });
      if (queryString.startsWith('/server') === true) {
        // Force request to use Public when session mode is enabled
        uri = this._config.endpoint + queryString;
      } else {
        // Force request to use Public when session mode is enabled
        uri = this._config.endpoint + '/func' + queryString;
      }
    } else {
      if (this._config._apiVersion[1] < 4) {
        aStr = this.getAuthenticationString(
          method,
          queryString,
          d.toISOString(),
          authBody,
          content_type,
        );
      } else {
        aStr = this.getAuthenticationString(
          method,
          queryString,
          d.toISOString(),
          '',
          content_type,
        );
      }
      let signKey = this.getSignKey(this._config.secretKey, d);
      let rqstSig = this.sign(signKey, 'binary', aStr, 'hex');
      hdrs = new Headers({
        'User-Agent': `Backend.AI Client for Javascript ${this.mangleUserAgentSignature()}`,
        'X-BackendAI-Version': this._config.apiVersion,
        'X-BackendAI-Date': d.toISOString(),
        Authorization: `BackendAI signMethod=HMAC-SHA256, credential=${this._config.accessKey}:${rqstSig}`,
      });
      uri = this._config.endpoint + queryString;
    }

    if (serviceName === 'pipeline') {
      uri = this._config.endpoint + '/flow' + queryString;
      hdrs = new Headers({
        Accept: content_type,
        'Allow-Control-Allow-Origin': '*',
      });
      const isDeleteTokenRequest =
        method === 'DELETE' && queryString.startsWith('/auth-token');

      // Append Authorization token for every API request to pipeline
      if (queryString.startsWith('/api') === true || isDeleteTokenRequest) {
        const token = this.pipeline.getPipelineToken();
        hdrs.set('Authorization', `Token ${token}`);
      }
    }

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
      hdrs.set('Content-Type', content_type);
    }

    let requestInfo = {
      method: method,
      headers: hdrs,
      cache: 'default',
      body: requestBody,
      uri: uri,
    };
    return requestInfo;
  }

  /**
   * Same to newRequest() method but it does not sign the request.
   * Use this for unauthorized public APIs.
   *
   * @param {string} method - the HTTP method
   * @param {string} queryString - the URI path and GET parameters
   * @param {any} body - an object that will be encoded as JSON in the request body
   */
  newUnsignedRequest(method, queryString, body) {
    return this.newPublicRequest(
      method,
      queryString,
      body,
      this._config.apiVersionMajor,
    );
  }

  newPublicRequest(method, queryString, body, urlPrefix) {
    let d = new Date();
    let hdrs = new Headers({
      'Content-Type': 'application/json',
      'User-Agent': `Backend.AI Client for Javascript ${this.mangleUserAgentSignature()}`,
      'X-BackendAI-Version': this._config.apiVersion,
      'X-BackendAI-Date': d.toISOString(),
      credentials: 'include',
      mode: 'cors',
    });
    //queryString = '/' + urlPrefix + queryString;
    let requestInfo = {
      method: method,
      headers: hdrs,
      mode: 'cors',
      cache: 'default',
      uri: '',
    };
    if (
      this._config.connectionMode === 'SESSION' &&
      queryString.startsWith('/server') === true
    ) {
      // Force request to use Public when session mode is enabled
      requestInfo.uri = this._config.endpoint + queryString;
    } else if (
      this._config.connectionMode === 'SESSION' &&
      queryString.startsWith('/server') === false
    ) {
      // Force request to use Public when session mode is enabled
      requestInfo.uri = this._config.endpoint + '/func' + queryString;
    } else {
      requestInfo.uri = this._config.endpoint + queryString;
    }
    return requestInfo;
  }

  getAuthenticationString(
    method,
    queryString,
    dateValue,
    bodyValue,
    content_type = 'application/json',
  ) {
    let bodyHash = crypto_node
      .createHash(this._config.hashType)
      .update(bodyValue)
      .digest('hex');
    return (
      method +
      '\n' +
      queryString +
      '\n' +
      dateValue +
      '\n' +
      'host:' +
      this._config.endpointHost +
      '\n' +
      'content-type:' +
      content_type +
      '\n' +
      'x-backendai-version:' +
      this._config.apiVersion +
      '\n' +
      bodyHash
    );
  }

  getCurrentDate(now) {
    let year = `0000${now.getUTCFullYear()}`.slice(-4);
    let month = `0${now.getUTCMonth() + 1}`.slice(-2);
    let day = `0${now.getUTCDate()}`.slice(-2);
    let t = year + month + day;
    return t;
  }

  sign(key, key_encoding, msg, digest_type) {
    let kbuf = new Buffer(key, key_encoding);
    let hmac = crypto_node.createHmac(this._config.hashType, kbuf);
    hmac.update(msg, 'utf8');
    return hmac.digest(digest_type);
  }

  getSignKey(secret_key, now) {
    let k1 = this.sign(secret_key, 'utf8', this.getCurrentDate(now), 'binary');
    let k2 = this.sign(k1, 'binary', this._config.endpointHost, 'binary');
    return k2;
  }

  generateRandomStr(length:number) {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      const idx = crypto_node.randomInt(0, possible.length);
      result += possible.charAt(idx);
    }
    return result;
  }

  generateSessionId(length = 8, nosuffix = false) {
    var text = this.generateRandomStr(length);
    return nosuffix ? text : text + '-jsSDK';
  }

  slugify(text) {
    const a = 'àáäâèéëêìíïîòóöôùúüûñçßÿœæŕśńṕẃǵǹḿǘẍźḧ·/_,:;';
    const b = 'aaaaeeeeiiiioooouuuuncsyoarsnpwgnmuxzh------';
    const p = new RegExp(a.split('').join('|'), 'g');

    return text
      .toString()
      .toLowerCase()
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(p, (c) => b.charAt(a.indexOf(c))) // Replace special chars
      .replace(/&/g, '-and-') // Replace & with 'and'
      .replace(/[^\w\-]+/g, '') // Remove all non-word chars
      .replace(/\-\-+/g, '-') // Replace multiple - with single -
      .replace(/^-+/, '') // Trim - from start of text
      .replace(/-+$/, ''); // Trim - from end of text
  }

  /**
   * fetch existing pubic key of SSH Keypair from container
   * only ssh_public_key will be received.
   */
  async fetchSSHKeypair() {
    let rqst = this.newSignedRequest('GET', '/auth/ssh-keypair', null);
    return this._wrapWithPromise(rqst, false);
  }

  /**
   * refresh SSH Keypair from container
   * gets randomly generated keypair (both ssh_public_key and ssh_private_key) will be received.
   */
  async refreshSSHKeypair() {
    let rqst = this.newSignedRequest('PATCH', '/auth/ssh-keypair', null);
    return this._wrapWithPromise(rqst, false);
  }
}

class ResourcePreset {
  public client: any;
  public urlPrefix: any;

  /**
   * Resource Preset API wrapper.
   *
   * @param {Client} client - the Client API wrapper object to bind
   */
  constructor(client) {
    this.client = client;
    this.urlPrefix = '/resource';
  }

  /**
   * Return the GraphQL Promise object containing resource preset list.
   */
  async list(param = null) {
    let rqst = this.client.newSignedRequest(
      'GET',
      `${this.urlPrefix}/presets`,
      param,
    );
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Return the GraphQL Promise object containing resource preset checking result.
   */
  async check(param = null) {
    let rqst = this.client.newSignedRequest(
      'POST',
      `${this.urlPrefix}/check-presets`,
      param,
    );
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * add resource preset with given name and fields.
   *
   * @param {string} name - resource preset name.
   * @param {json} input - resource preset specification and data. Required fields are:
   * {
   *   'resource_slots': JSON.stringify(total_resource_slots), // Resource slot value. should be Stringified JSON.
   * };
   */
  async add(name = null, input) {
    if (this.client.is_admin === true && name !== null) {
      let q =
        `mutation($name: String!, $input: CreateResourcePresetInput!) {` +
        `  create_resource_preset(name: $name, props: $input) {` +
        `    ok msg ` +
        `  }` +
        `}`;
      let v = {
        name: name,
        input: input,
      };
      return this.client.query(q, v);
    } else {
      return Promise.resolve(false);
    }
  }

  /**
   * mutate specified resource preset with given name with new values.
   *
   * @param {string} name - resource preset name to mutate.
   * @param {json} input - resource preset specification and data. Required fields are:
   * {
   *   'resource_slots': JSON.stringify(total_resource_slots), // Resource slot value. should be Stringified JSON.
   * };
   */
  async mutate(name = null, input) {
    if (this.client.is_admin === true && name !== null) {
      let q =
        `mutation($name: String!, $input: ModifyResourcePresetInput!) {` +
        `  modify_resource_preset(name: $name, props: $input) {` +
        `    ok msg ` +
        `  }` +
        `}`;
      let v = {
        name: name,
        input: input,
      };
      return this.client.query(q, v);
    } else {
      return Promise.resolve(false);
    }
  }

  /**
   * delete specified resource preset with given name.
   *
   * @param {string} name - resource preset name to delete.
   */
  async delete(name = null) {
    if (this.client.is_admin === true && name !== null) {
      let q =
        `mutation($name: String!) {` +
        `  delete_resource_preset(name: $name) {` +
        `    ok msg ` +
        `  }` +
        `}`;
      let v = {
        name: name,
      };
      return this.client.query(q, v);
    } else {
      return Promise.resolve(false);
    }
  }
}

class VFolder {
  public client: any;
  public name: any;
  public urlPrefix: any;

  /**
   * The Virtual Folder API wrapper.
   *
   * @param {Client} client - the Client API wrapper object to bind
   * @param {string} name - Virtual folder name.
   */
  constructor(client, name = null) {
    this.client = client;
    this.name = name;
    this.urlPrefix = '/folders';
  }

  /**
   * Get allowed types of folders
   *
   */
  async list_allowed_types() {
    let rqst = this.client.newSignedRequest(
      'GET',
      `${this.urlPrefix}/_/allowed_types`,
      null,
    );
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Create a Virtual folder on specific host.
   *
   * @param {string} name - Virtual folder name.
   * @param {string} host - Host name to create virtual folder in it.
   * @param {string} group - Virtual folder group name.
   * @param {string} usageMode - Virtual folder's purpose of use. Can be "general" (normal folders), "data" (data storage), and "model" (pre-trained model storage).
   * @param {string} permission - Virtual folder's innate permission.
   * @param {boolean} cloneable - Whether Virtual folder is cloneable or not.
   */
  async create(
    name,
    host = '',
    group = '',
    usageMode = 'general',
    permission = 'rw',
    cloneable = false,
  ) {
    let body;
    if (host !== '') {
      body = {
        name: name,
        host: host,
      };
    }
    if (this.client.supports('group-folder') && group !== '') {
      body = {
        name: name,
        host: host,
        group: group,
      };
    }
    if (this.client.isAPIVersionCompatibleWith('v4.20191215')) {
      if (usageMode) {
        body['usage_mode'] = usageMode;
      }
      if (permission) {
        body['permission'] = permission;
      }
    }
    if (this.client.supports('storage-proxy')) {
      body['cloneable'] = cloneable;
    }
    let rqst = this.client.newSignedRequest('POST', `${this.urlPrefix}`, body);
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Clone selected Virtual folder
   *
   * @param {json} input - parameters for cloning Vfolder
   * @param {boolean} input.cloneable - whether new cloned Vfolder is cloneable or not
   * @param {string} input.permission - permission for new cloned Vfolder. permission should one of the following: 'ro', 'rw', 'wd'
   * @param {string} input.target_host - target_host for new cloned Vfolder
   * @param {string} input.target_name - name for new cloned Vfolder
   * @param {string} input.usage_mode - Cloned virtual folder's purpose of use. Can be "general" (normal folders), "data" (data storage), and "model" (pre-trained model storage).
   * @param name - source Vfolder name
   */

  async clone(input, name = null) {
    let rqst = this.client.newSignedRequest(
      'POST',
      `${this.urlPrefix}/${name}/clone`,
      input,
    );
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Update Information of virtual folder
   *
   * @param {json} input - parameters for updating folder options of Vfolder
   * @param {boolean} input.cloneable - whether Vfolder is cloneable or not
   * @param {string} input.permission - permission for Vfolder. permission should one of the following: 'ro', 'rw', 'wd'
   * @param name - source Vfolder name
   */
  async update_folder(input, name = null) {
    let rqst = this.client.newSignedRequest(
      'POST',
      `${this.urlPrefix}/${name}/update-options`,
      input,
    );
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * List Virtual folders that requested accessKey has permission to.
   */
  async list(groupId = null, userEmail = null) {
    let reqUrl = this.urlPrefix;
    let params = {};
    if (groupId) {
      params['group_id'] = groupId;
    }
    if (userEmail) {
      params['owner_user_email'] = userEmail;
    }
    const q = querystring.stringify(params);
    reqUrl += `?${q}`;
    let rqst = this.client.newSignedRequest('GET', reqUrl, null);
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * List Virtual folder hosts that requested accessKey has permission to.
   *
   * @param {string} groupId - project(group) id
   */
  async list_hosts(groupId = null) {
    // let reqUrl = `${this.urlPrefix}/_/all-hosts`;
    let reqUrl = `${this.urlPrefix}/_/hosts`;
    let params = {};
    if (this.client.isManagerVersionCompatibleWith('22.03.0') && groupId) {
      params['group_id'] = groupId;
    }
    const q = querystring.stringify(params);
    reqUrl += `?${q}`;
    let rqst = this.client.newSignedRequest('GET', reqUrl, null);
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * List all storage hosts connected to storage-proxy server
   */
  async list_all_hosts() {
    if (this.client.is_superadmin === true) {
      let reqUrl = `${this.urlPrefix}/_/all-hosts`;
      let rqst = this.client.newSignedRequest('GET', reqUrl, null);
      return this.client._wrapWithPromise(rqst);
    }
  }

  /**
   * Information about specific virtual folder.
   */
  async info(name = null) {
    if (name == null) {
      name = this.name;
    }
    let rqst = this.client.newSignedRequest(
      'GET',
      `${this.urlPrefix}/${name}`,
      null,
    );
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Rename a Virtual folder.
   *
   * @param {string} new_name - New virtual folder name.
   */
  async rename(new_name = null) {
    const body = { new_name };
    let rqst = this.client.newSignedRequest(
      'POST',
      `${this.urlPrefix}/${this.name}/rename`,
      body,
    );
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Delete a Virtual folder.
   *
   * @param {string} name - Virtual folder name. If no name is given, use name on this VFolder object.
   */
  async delete(name = null) {
    if (name == null) {
      name = this.name;
    }
    let rqst = this.client.newSignedRequest(
      'DELETE',
      `${this.urlPrefix}/${name}`,
      null,
    );
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Leave an invited Virtual folder.
   *
   * @param {string} name - Virtual folder name. If no name is given, use name on this VFolder object.
   */
  async leave_invited(name = null) {
    if (name == null) {
      name = this.name;
    }
    let rqst = this.client.newSignedRequest(
      'POST',
      `${this.urlPrefix}/${name}/leave`,
      null,
    );
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Upload files to specific Virtual folder.
   *
   * @param {string} path - Path to upload.
   * @param {string} fs - File content to upload.
   * @param {string} name - Virtual folder name.
   */
  async upload(path, fs, name = null) {
    if (name == null) {
      name = this.name;
    }
    let formData = new FormData();
    formData.append('src', fs, path);
    let rqst = this.client.newSignedRequest(
      'POST',
      `${this.urlPrefix}/${name}/upload`,
      formData,
    );
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Upload file from formData to specific Virtual folder.
   *
   * @param {string} fss - formData with file specification. formData should contain {src, content, {filePath:filePath}}.
   * @param {string} name - Virtual folder name.
   */
  async uploadFormData(fss, name = null) {
    let rqst = this.client.newSignedRequest(
      'POST',
      `${this.urlPrefix}/${name}/upload`,
      fss,
    );
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Create a upload session for a file to Virtual folder.
   *
   * @param {string} path - Path to upload.
   * @param {string} fs - File object to upload.
   * @param {string} name - Virtual folder name.
   */
  async create_upload_session(path, fs, name = null) {
    if (name == null) {
      name = this.name;
    }
    let body = {
      path: path,
      size: fs.size,
    };
    let rqstUrl;
    if (this.client._apiVersionMajor < 6) {
      rqstUrl = `${this.urlPrefix}/${name}/create_upload_session`;
    } else {
      rqstUrl = `${this.urlPrefix}/${name}/request-upload`;
    }
    const rqst = this.client.newSignedRequest('POST', rqstUrl, body);
    const res = await this.client._wrapWithPromise(rqst);
    const token = res['token'];
    let tusUrl;
    if (this.client._apiVersionMajor < 6) {
      tusUrl = this.client._config.endpoint;
      if (this.client._config.connectionMode === 'SESSION') {
        tusUrl = tusUrl + '/func';
      }
      tusUrl = tusUrl + `${this.urlPrefix}/_/tus/upload/${token}`;
    } else {
      tusUrl = `${res.url}?${new URLSearchParams({ token: token }).toString()}`;
    }
    return Promise.resolve(tusUrl);
  }

  /**
   * Create directory in specific Virtual folder.
   *
   * @param {string} path - Directory path to create.
   * @param {string} name - Virtual folder name.
   * @param {string} parents - create parent folders when not exists (>=APIv6).
   * @param {string} exist_ok - Do not raise error when the folder already exists (>=APIv6).
   */
  async mkdir(path, name = null, parents = null, exist_ok = null) {
    if (name == null) {
      name = this.name;
    }
    const body = {
      path: path,
    };
    if (parents) {
      body['parents'] = parents;
    }
    if (exist_ok) {
      body['exist_ok'] = exist_ok;
    }
    const rqst = this.client.newSignedRequest(
      'POST',
      `${this.urlPrefix}/${name}/mkdir`,
      body,
    );
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Rename a file inside a virtual folder.
   *
   * @param {string} target_path - path to the target file or directory (with old name).
   * @param {string} new_name - new name of the target.
   * @param {string} name - Virtual folder name that target file exists.
   * @param {string} is_dir - True when the object is directory, false when it is file
   */
  async rename_file(target_path, new_name, name = null, is_dir = false) {
    if (name == null) {
      name = this.name;
    }
    let body;
    if (this.client.isAPIVersionCompatibleWith('v6.20200815')) {
      body = { target_path, new_name, is_dir };
    } else {
      body = { target_path, new_name };
    }
    let rqst = this.client.newSignedRequest(
      'POST',
      `${this.urlPrefix}/${name}/rename_file`,
      body,
    );
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Delete multiple files in a Virtual folder.
   *
   * @param {string} files - Files to delete.
   * @param {boolean} recursive - delete files recursively.
   * @param {string} name - Virtual folder name that files are in.
   */
  async delete_files(files, recursive = false, name = null) {
    if (name == null) {
      name = this.name;
    }
    if (recursive == null) {
      recursive = false;
    }
    let body = {
      files: files,
      recursive: recursive,
    };
    let rqst = this.client.newSignedRequest(
      'POST',
      `${this.urlPrefix}/${name}/delete-files`,
      body,
    );
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Download file from a Virtual folder.
   *
   * @param {string} file - File to download. Should contain full path.
   * @param {string} name - Virtual folder name that files are in.
   * @param {boolean} archive - Download target directory as an archive.
   * @param {boolean} noCache - If true, do not store the file response in any cache. New in API v6.
   */
  async download(file, name = false, archive = false, noCache = false) {
    const params = { file, archive };
    const q = querystring.stringify(params);
    if (this.client._apiVersionMajor < 6) {
      const rqst = this.client.newSignedRequest(
        'GET',
        `${this.urlPrefix}/${name}/download_single?${q}`,
        null,
      );
      return this.client._wrapWithPromise(rqst, true);
    } else {
      const res = await this.request_download_token(file, name);
      const downloadUrl = `${res.url}?${new URLSearchParams({
        token: res.token,
        archive: archive ? 'true' : 'false',
        no_cache: noCache ? 'true' : 'false',
      }).toString()}`;
      return fetch(downloadUrl);
    }
  }

  /**
   * Request a download and get the token for direct download.
   *
   * @param {string} file - File to download. Should contain full path.
   * @param {string} name - Virtual folder name that files are in.
   * @param {boolean} archive - Download target directory as an archive.
   */
  async request_download_token(file, name = false, archive = false) {
    let body = {
      file,
      archive,
    };
    let rqstUrl;
    if (this.client._apiVersionMajor < 6) {
      rqstUrl = `${this.urlPrefix}/${name}/request_download`;
    } else {
      rqstUrl = `${this.urlPrefix}/${name}/request-download`;
    }
    const rqst = this.client.newSignedRequest('POST', rqstUrl, body);
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Download file in a Virtual folder with token.
   *
   * @param {string} token - Temporary token to download specific file.
   */
  async download_with_token(token: string = '') {
    let params = {
      token: token,
    };
    let q = querystring.stringify(params);
    let rqst = this.client.newSignedRequest(
      'GET',
      `${this.urlPrefix}/_/download_with_token?${q}`,
      null,
    );
    return this.client._wrapWithPromise(rqst, true);
  }

  /**
   * Get download URL in a Virtual folder with token.
   *
   * @param {string} token - Temporary token to download specific file.
   */
  get_download_url_with_token(token: string = '') {
    const params = { token };
    let q = querystring.stringify(params);
    if (this.client._config.connectionMode === 'SESSION') {
      return `${this.client._config.endpoint}/func${this.urlPrefix}/_/download_with_token?${q}`;
    } else {
      return `${this.client._config.endpoint}${this.urlPrefix}/_/download_with_token?${q}`;
    }
  }

  /**
   * List files in specific virtual folder / path.
   *
   * @param {string} path - Directory path to list.
   * @param {string} name - Virtual folder name to look up with.
   */
  async list_files(path, name = null) {
    if (name == null) {
      name = this.name;
    }
    let params = {
      path: path,
    };
    let q = querystring.stringify(params);
    let rqst = this.client.newSignedRequest(
      'GET',
      `${this.urlPrefix}/${name}/files?${q}`,
      null,
    );
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Invite someone to specific virtual folder with permission.
   *
   * @param {string} perm - Permission to give to. `rw` or `ro`.
   * @param {array} emails - User E-mail to invite.
   * @param {string} name - Virtual folder name to invite.
   */
  async invite(perm, emails, name = null) {
    if (name == null) {
      name = this.name;
    }
    let body = {
      perm: perm,
      user_ids: emails,
    };
    let rqst = this.client.newSignedRequest(
      'POST',
      `${this.urlPrefix}/${name}/invite`,
      body,
    );
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Show invitations to current API key.
   */
  async invitations() {
    let rqst = this.client.newSignedRequest(
      'GET',
      `${this.urlPrefix}/invitations/list`,
      null,
    );
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Accept specific invitation.
   *
   * @param {string} inv_id - Invitation ID.
   */
  async accept_invitation(inv_id) {
    let body = {
      inv_id: inv_id,
    };
    let rqst = this.client.newSignedRequest(
      'POST',
      `${this.urlPrefix}/invitations/accept`,
      body,
    );
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Delete specific invitation.
   *
   * @param {string} inv_id - Invitation ID to delete.
   */
  async delete_invitation(inv_id) {
    let body = {
      inv_id: inv_id,
    };
    let rqst = this.client.newSignedRequest(
      'DELETE',
      `${this.urlPrefix}/invitations/delete`,
      body,
    );
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * List invitees(users who accepted an invitation)
   *
   * @param {string} vfolder_id - vfolder id. If no id is given, all users who accepted the client's invitation will be returned
   */
  async list_invitees(vfolder_id = null) {
    let queryString = '/folders/_/shared';
    if (vfolder_id !== null) {
      const searchParams = new URLSearchParams({
        vfolder_id: vfolder_id,
      });
      queryString = `${queryString}?${searchParams.toString()}`;
    }
    let rqst = this.client.newSignedRequest('GET', queryString, null);
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Modify an invitee's permission to a shared vfolder
   *
   * @param {json} input - parameters for permission modification
   * @param {string} input.perm - invitee's new permission. permission should one of the following: 'ro', 'rw', 'wd'
   * @param {string} input.user - invitee's uuid
   * @param {string} input.vfolder - id of the vfolder that has been shared to the invitee
   */
  async modify_invitee_permission(input) {
    let rqst = this.client.newSignedRequest('POST', '/folders/_/shared', input);
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Share specific users a group-type virtual folder with overriding permission.
   *
   * @param {string} perm - Permission to give to. `rw` or `ro`.
   * @param {array} emails - User E-mail(s) to share.
   * @param {string} name - A group virtual folder name to share.
   */
  async share(permission, emails, name = null) {
    if (!name) {
      name = this.name;
    }
    const body = { permission, emails };
    const rqst = this.client.newSignedRequest(
      'POST',
      `${this.urlPrefix}/${name}/share`,
      body,
    );
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Unshare a group-type virtual folder from given users.
   *
   * @param {array} emails - User E-mail(s) to unshare.
   * @param {string} name - A group virtual folder name to unshare.
   */
  async unshare(emails, name = null) {
    if (!name) {
      name = this.name;
    }
    const body = { emails };
    const rqst = this.client.newSignedRequest(
      'DELETE',
      `${this.urlPrefix}/${name}/unshare`,
      body,
    );
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Get the size quota of a vfolder.
   * Only available for some specific file system such as XFS.
   *
   * @param {string} host - Host name of a virtual folder.
   * @param {string} vfolder_id - id of the vfolder.
   */
  async get_quota(host, vfolder_id) {
    const params = { folder_host: host, id: vfolder_id };
    let q = querystring.stringify(params);
    const rqst = this.client.newSignedRequest(
      'GET',
      `${this.urlPrefix}/_/quota?${q}`,
      null,
    );
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Set the size quota of a vfolder.
   * Only available for some specific file system such as XFS.
   *
   * @param {string} host - Host name of a virtual folder.
   * @param {string} vfolder_id - id of the vfolder.
   * @param {number} quota - quota size of the vfolder.
   */
  async set_quota(host, vfolder_id, quota) {
    const body = {
      folder_host: host,
      id: vfolder_id,
      input: {
        size_bytes: quota,
      },
    };
    const rqst = this.client.newSignedRequest(
      'POST',
      `${this.urlPrefix}/_/quota`,
      body,
    );
    return this.client._wrapWithPromise(rqst);
  }
}

class Agent {
  public client: any;

  /**
   * Agent API wrapper.
   *
   * @param {Client} client - the Client API wrapper object to bind
   */
  constructor(client) {
    this.client = client;
  }

  /**
   * List computation agents.
   *
   * @param {string} status - Status to query. Should be one of 'ALIVE', 'CREATING', 'TERMINATING' and 'TERMINATED'.
   * @param {array} fields - Fields to query. Queryable fields are:  'id', 'status', 'region', 'first_contact', 'cpu_cur_pct', 'mem_cur_bytes', 'available_slots', 'occupied_slots'.
   * @param {number} timeout - timeout for the request. Default uses SDK default. (5 sec.)
   */
  async list(
    status = 'ALIVE',
    fields = [
      'id',
      'status',
      'region',
      'first_contact',
      'cpu_cur_pct',
      'mem_cur_bytes',
      'available_slots',
      'occupied_slots',
    ],
    timeout: number = 0,
  ) {
    if (['ALIVE', 'TERMINATED'].includes(status) === false) {
      return Promise.resolve(false);
    }
    let q =
      `query($status: String) {` +
      `  agents(status: $status) {` +
      `     ${fields.join(' ')}` +
      `  }` +
      `}`;
    let v = { status: status };
    return this.client.query(q, v, null, timeout);
  }

  /**
   * modify agent configuration with given name and fields.
   *
   * @param {string} agent_id - resource preset name.
   * @param {json} input - resource preset specification and data. Required fields are:
   * {
   *   'schedulable': schedulable
   * };
   */
  async update(id = null, input) {
    if (this.client.is_superadmin === true && id !== null) {
      let q =
        `mutation($id: String!, $input: ModifyAgentInput!) {` +
        `  modify_agent(id: $id, props: $input) {` +
        `    ok msg ` +
        `  }` +
        `}`;
      let v = {
        id: id,
        input: input,
      };
      return this.client.query(q, v);
    } else {
      return Promise.resolve(false);
    }
  }
}

class StorageProxy {
  public client: any;

  /**
   * Agent API wrapper.
   *
   * @param {Client} client - the Client API wrapper object to bind
   */
  constructor(client) {
    this.client = client;
  }

  /**
   * List storage proxies and its volumes.
   *
   * @param {array} fields - Fields to query. Queryable fields are:  'id', 'backend', 'capabilities'.
   * @param {number} limit - limit number of query items.
   * @param {number} offset - offset for item query. Useful for pagination.
   */
  async list(
    fields = ['id', 'backend', 'capabilities'],
    limit = 20,
    offset = 0,
  ) {
    let q =
      `query($offset:Int!, $limit:Int!) {` +
      `  storage_volume_list(limit:$limit, offset:$offset) {` +
      `     items { ${fields.join(' ')} }` +
      `     total_count` +
      `  }` +
      `}`;
    let v = {
      limit: limit,
      offset: offset,
    };
    return this.client.query(q, v);
  }

  /**
   * Detail of specific storage proxy / volume.
   *
   * @param {string} host - Virtual folder host.
   * @param {array} fields - Fields to query. Queryable fields are:  'id', 'backend', 'capabilities'.
   */
  async detail(
    host: string = '',
    fields = ['id', 'backend', 'path', 'fsprefix', 'capabilities'],
  ) {
    let q =
      `query($vfolder_host: String!) {` +
      `  storage_volume(id: $vfolder_host) {` +
      `     ${fields.join(' ')}` +
      `  }` +
      `}`;
    let v = { vfolder_host: host };
    return this.client.query(q, v);
  }
}

class Keypair {
  public client: any;
  public name: any;

  /**
   * Keypair API wrapper.
   *
   * @param {Client} client - the Client API wrapper object to bind
   */
  constructor(client, name = null) {
    this.client = client;
    this.name = name;
  }

  /**
   * Information of specific Keypair.
   *
   * @param {string} accessKey - Access key to query information. If client is not authorized as admin, this will be ignored and current API key infomation will be returned.
   * @param {array} fields - Fields to query. Queryable fields are: 'access_key', 'secret_key', 'is_active', 'is_admin', 'user_id', 'created_at', 'last_used',
   'concurrency_limit', 'concurrency_used', 'rate_limit', 'num_queries', 'resource_policy'.
   */
  async info(
    accessKey,
    fields = [
      'access_key',
      'secret_key',
      'is_active',
      'is_admin',
      'user_id',
      'created_at',
      'last_used',
      'concurrency_limit',
      'concurrency_used',
      'rate_limit',
      'num_queries',
      'resource_policy',
    ],
  ) {
    let q, v;
    if (this.client.is_admin) {
      q =
        `query($access_key: String!) {` +
        `  keypair(access_key: $access_key) {` +
        `    ${fields.join(' ')}` +
        `  }` +
        `}`;
      v = {
        access_key: accessKey,
      };
    } else {
      q = `query {` + `  keypair {` + `    ${fields.join(' ')}` + `  }` + `}`;
      v = {};
    }
    return this.client.query(q, v);
  }

  /**
   * List all Keypairs of given user ID.
   *
   * @param {string} userId - User ID to query API keys. If user ID is not given and client is authorized as admin, this will return every keypairs of the manager.
   * @param {array} fields - Fields to query. Queryable fields are: "access_key", 'is_active', 'is_admin', 'user_id', 'created_at', 'last_used',
   'concurrency_used', 'rate_limit', 'num_queries', 'resource_policy'.
   */
  async list(
    userId = null,
    fields = [
      'access_key',
      'is_active',
      'is_admin',
      'user_id',
      'created_at',
      'last_used',
      'concurrency_used',
      'rate_limit',
      'num_queries',
      'resource_policy',
    ],
    isActive = true,
  ) {
    let q, v;
    if (this.client._apiVersionMajor < 5) {
      q =
        this.client.is_admin && userId == null
          ? `
        query($is_active: Boolean) {
          keypairs(is_active: $is_active) {
            ${fields.join(' ')}
          }
        }
      `
          : `
        query($email: String!, $is_active: Boolean) {
          keypairs(email: $email, is_active: $is_active) {
            ${fields.join(' ')}
          }
        }
      `;
      v = {
        email: userId || this.client.email,
        is_active: isActive,
      };
      return this.client.query(q, v);
    } else {
      // From 20.03, there is no single query to fetch every keypairs, so
      // we iterate pages to gather all keypairs for client-side compability.
      const limit = 100;
      const keypairs = [] as any;
      q =
        this.client.is_admin && userId == null
          ? `
        query($offset:Int!, $limit:Int!, $is_active: Boolean) {
          keypair_list(offset:$offset, limit:$limit, is_active: $is_active) {
            items { ${fields.join(' ')} }
            total_count
          }
        }
      `
          : `
        query($offset:Int!, $limit:Int!, $email: String!, $is_active: Boolean) {
          keypair_list(offset:$offset, limit:$limit, email: $email, is_active: $is_active) {
            items { ${fields.join(' ')} }
            total_count
          }
        }
      `;
      // Prevent fetching more than 1000 keypairs.
      for (let offset = 0; offset < 10 * limit; offset += limit) {
        v = {
          offset,
          limit,
          email: userId || this.client.email,
          is_active: isActive,
        };
        const page = await this.client.query(q, v);
        keypairs.push(...page.keypair_list.items);
        if (offset >= page.keypair_list.total_count) {
          break;
        }
      }
      const resp = { keypairs };
      return Promise.resolve(resp);
    }
  }

  /**
   * Add Keypair with given information.
   *
   * @param {string} userId - User ID for new Keypair.
   * @param {boolean} isActive - is_active state. Default is True.
   * @param {boolean} isAdmin - is_admin state. Default is False.
   * @param {string} resourcePolicy - resource policy name to assign. Default is `default`.
   * @param {integer} rateLimit - API rate limit for 900 seconds. Prevents from DDoS attack.
   */
  async add(
    userId = null,
    isActive = true,
    isAdmin = false,
    resourcePolicy = 'default',
    rateLimit = 1000,
  ) {
    let fields = [
      'is_active',
      'is_admin',
      'resource_policy',
      'concurrency_limit',
      'rate_limit',
    ];
    let q =
      `mutation($user_id: String!, $input: KeyPairInput!) {` +
      `  create_keypair(user_id: $user_id, props: $input) {` +
      `    ok msg keypair { ${fields.join(' ')} }` +
      `  }` +
      `}`;
    let v = {
      user_id: userId,
      input: {
        is_active: isActive,
        is_admin: isAdmin,
        resource_policy: resourcePolicy,
        rate_limit: rateLimit,
      },
    };
    return this.client.query(q, v);
    /** accessKey is no longer used */
    /*
    if (accessKey !== null && accessKey !== '') {
      fields = fields.concat(['access_key', 'secret_key']);
    } */
    /* if (accessKey !== null && accessKey !== '') {
      v = {
        'user_id': userId,
        'input': {
          'is_active': isActive,
          'is_admin': isAdmin,
          'resource_policy': resourcePolicy,
          'rate_limit': rateLimit,
        },
      };
    } else {
      v = {
        'user_id': userId,
        'input': {
          'is_active': isActive,
          'is_admin': isAdmin,
          'resource_policy': resourcePolicy,
          'rate_limit': rateLimit
        },
      };
    } */
  }

  /**
   * mutate Keypair for given accessKey.
   *
   * @param {string} accessKey - access key to mutate.
   * @param {json} input - new information for mutation. JSON format should follow:
   * {
   *   'is_active': is_active,
   *   'is_admin': is_admin,
   *   'resource_policy': resource_policy,
   *   'rate_limit': rate_limit
   * }
   */
  async mutate(accessKey, input) {
    let q =
      `mutation($access_key: String!, $input: ModifyKeyPairInput!) {` +
      `  modify_keypair(access_key: $access_key, props: $input) {` +
      `    ok msg` +
      `  }` +
      `}`;
    let v = {
      access_key: accessKey,
      input: input,
    };
    return this.client.query(q, v);
  }

  /**
   * Delete Keypair with given accessKey
   *
   * @param {string} accessKey - access key to delete.
   */
  async delete(accessKey) {
    let q =
      `mutation($access_key: String!) {` +
      `  delete_keypair(access_key: $access_key) {` +
      `    ok msg` +
      `  }` +
      `}`;
    let v = {
      access_key: accessKey,
    };
    return this.client.query(q, v);
  }
}

class ResourcePolicy {
  public client: any;

  /**
   * The Resource Policy  API wrapper.
   *
   * @param {Client} client - the Client API wrapper object to bind
   */
  constructor(client) {
    this.client = client;
  }

  /**
   * get resource policy with given name and fields.
   *
   * @param {string} name - resource policy name.
   * @param {array} fields - fields to query.
   */
  async get(
    name = null,
    fields = [
      'name',
      'created_at',
      'default_for_unspecified',
      'total_resource_slots',
      'max_concurrent_sessions',
      'max_containers_per_session',
      'max_vfolder_count',
      'max_vfolder_size',
      'allowed_vfolder_hosts',
      'idle_timeout',
    ],
  ) {
    if (this.client.supports('session-lifetime')) {
      fields.push('max_session_lifetime');
    }
    let q, v;
    if (name === null) {
      q =
        `query {` + `  keypair_resource_policies { ${fields.join(' ')} }` + '}';
      v = { n: name };
    } else {
      q =
        `query($n:String!) {` +
        `  keypair_resource_policy(name: $n) { ${fields.join(' ')} }` +
        '}';
      v = { n: name };
    }
    return this.client.query(q, v);
  }

  /**
   * add resource policy with given name and fields.
   *
   * @param {string} name - resource policy name.
   * @param {json} input - resource policy specification and data. Required fields are:
   * {
   *   'default_for_unspecified': 'UNLIMITED', // default resource policy when resource slot is not given. 'UNLIMITED' or 'LIMITED'.
   *   'total_resource_slots': JSON.stringify(total_resource_slots), // Resource slot value. should be Stringified JSON.
   *   'max_concurrent_sessions': concurrency_limit,
   *   'max_containers_per_session': containers_per_session_limit,
   *   'idle_timeout': idle_timeout,
   *   'max_vfolder_count': vfolder_count_limit,
   *   'max_vfolder_size': vfolder_capacity_limit,
   *   'allowed_vfolder_hosts': vfolder_hosts,
   *   'max_session_lifetime': max_session_lifetime
   * };
   */
  async add(name = null, input) {
    let fields = [
      'name',
      'created_at',
      'default_for_unspecified',
      'total_resource_slots',
      'max_concurrent_sessions',
      'max_containers_per_session',
      'max_vfolder_count',
      'max_vfolder_size',
      'allowed_vfolder_hosts',
      'idle_timeout',
    ];
    if (this.client.supports('session-lifetime')) {
      fields.push('max_session_lifetime');
    }
    if (this.client.is_admin === true && name !== null) {
      let q =
        `mutation($name: String!, $input: CreateKeyPairResourcePolicyInput!) {` +
        `  create_keypair_resource_policy(name: $name, props: $input) {` +
        `    ok msg resource_policy { ${fields.join(' ')} }` +
        `  }` +
        `}`;
      let v = {
        name: name,
        input: input,
      };
      return this.client.query(q, v);
    } else {
      return Promise.resolve(false);
    }
  }

  /**
   * mutate specified resource policy with given name with new values.
   *
   * @param {string} name - resource policy name to mutate. (READ-ONLY)
   * @param {json} input - resource policy specification and data. Required fields are:
   * {
   *   {string} 'default_for_unspecified': 'UNLIMITED', // default resource policy when resource slot is not given. 'UNLIMITED' or 'LIMITED'.
   *   {JSONString} 'total_resource_slots': JSON.stringify(total_resource_slots), // Resource slot value. should be Stringified JSON.
   *   {int} 'max_concurrent_sessions': concurrency_limit,
   *   {int} 'max_containers_per_session': containers_per_session_limit,
   *   {bigint} 'idle_timeout': idle_timeout,
   *   {int} 'max_vfolder_count': vfolder_count_limit,
   *   {bigint} 'max_vfolder_size': vfolder_capacity_limit,
   *   {[string]} 'allowed_vfolder_hosts': vfolder_hosts,
   *   {int} 'max_session_lifetime': max_session_lifetime
   * };
   */
  async mutate(name = null, input) {
    if (this.client.is_admin === true && name !== null) {
      let q =
        `mutation($name: String!, $input: ModifyKeyPairResourcePolicyInput!) {` +
        `  modify_keypair_resource_policy(name: $name, props: $input) {` +
        `    ok msg ` +
        `  }` +
        `}`;
      let v = {
        name: name,
        input: input,
      };
      return this.client.query(q, v);
    } else {
      return Promise.resolve(false);
    }
  }

  /**
   * delete specified resource policy that exists in policy list.
   *
   * @param {string} name - resource policy name to delete. (READ-ONLY)
   */
  async delete(name = null) {
    if (this.client.is_superadmin === true && name !== null) {
      let q =
        `mutation($name: String!) {` +
        ` delete_keypair_resource_policy(name: $name) {` +
        `   ok msg ` +
        ` }` +
        `}`;
      let v = {
        name: name,
      };
      return this.client.query(q, v);
    } else {
      return Promise.resolve(false);
    }
  }
}

class ContainerImage {
  public client: any;

  /**
   * The Container image API wrapper.
   *
   * @param {Client} client - the Client API wrapper object to bind
   */
  constructor(client) {
    this.client = client;
  }

  /**
   * list container images registered on the manager.
   *
   * @param {array} fields - fields to query. Default fields are: ["name", "tag", "registry", "digest", "installed", "resource_limits { key min max }"]
   * @param {boolean} installed_only - filter images to installed / not installed. true to query installed images only.
   * @param {boolean} system_images - filter images to get system images such as web UI, SFTP server. true to query system images only.
   */
  async list(
    fields = [
      'name',
      'tag',
      'registry',
      'digest',
      'installed',
      'labels { key value }',
      'resource_limits { key min max }',
    ],
    installed_only = false,
    system_images = false,
  ) {
    let q, v;
    if (this.client.supports('system-images')) {
      if (installed_only === true) {
        q =
          `query($installed:Boolean) {` +
          `  images(is_installed:$installed) { ${fields.join(' ')} }` +
          '}';
        v = { installed: installed_only, is_operation: system_images };
      } else {
        q = `query {` + `  images { ${fields.join(' ')} }` + '}';
        v = { is_operation: system_images };
      }
    } else {
      q = `query {` + `  images { ${fields.join(' ')} }` + '}';
      v = {};
    }
    return this.client.query(q, v);
  }

  /**
   * Modify resource of given image.
   *
   * @param {string} registry - Registry name
   * @param {string} image - image name.
   * @param {string} tag - image tag.
   * @param {object} input - value list to set.
   */
  async modifyResource(registry, image, tag, input) {
    let promiseArray: Array<Promise<any>> = [];
    registry = registry.replace(/:/g, '%3A');
    image = image.replace(/\//g, '%2F');
    Object.keys(input).forEach((slot_type) => {
      Object.keys(input[slot_type]).forEach((key) => {
        const rqst = this.client.newSignedRequest('POST', '/config/set', {
          key: `images/${registry}/${image}/${tag}/resource/${slot_type}/${key}`,
          value: input[slot_type][key],
        });
        promiseArray.push(this.client._wrapWithPromise(rqst));
      });
    });
    return Promise.all(promiseArray);
  }

  /**
   * Modify label of given image.
   *
   * @param {string} registry - Registry name
   * @param {string} image - image name.
   * @param {string} tag - image tag.
   * @param {string} key - key to change.
   * @param {string} value - value for the key.
   */
  async modifyLabel(registry, image, tag, key, value) {
    registry = registry.replace(/:/g, '%3A');
    image = image.replace(/\//g, '%2F');
    tag = tag.replace(/\//g, '%2F');
    const rqst = this.client.newSignedRequest('POST', '/config/set', {
      key: `images/${registry}/${image}/${tag}/labels/${key}`,
      value: value,
    });
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * install specific container images from registry
   *
   * @param {string} name - name to install. it should contain full path with tags. e.g. lablup/python:3.6-ubuntu18.04
   * @param {string} architecture - architecture to install.
   * @param {object} resource - resource to use for installation.
   * @param {string} registry - registry of image. default is 'index.docker.io', which is public Backend.AI docker registry.
   */
  async install(
    name,
    architecture,
    resource: object = {},
    registry: string = 'index.docker.io',
  ) {
    if (registry != 'index.docker.io') {
      registry = registry + '/';
    } else {
      registry = '';
    }
    registry = registry.replace(/:/g, '%3A');
    let sessionId = this.client.generateSessionId();
    if (Object.keys(resource).length === 0) {
      resource = { cpu: '1', mem: '512m' };
    }
    return this.client
      .createIfNotExists(
        registry + name,
        sessionId,
        resource,
        600000,
        architecture,
      )
      .then((response) => {
        return this.client.destroy(sessionId);
      })
      .catch((err) => {
        throw err;
      });
  }

  /**
   * uninstall specific container images from registry (TO BE IMPLEMENTED)
   *
   * @param {string} name - name to install. it should contain full path with tags. e.g. lablup/python:3.6-ubuntu18.04
   * @param {string} registry - registry of image. default is 'index.docker.io', which is public Backend.AI docker registry.
   */
  async uninstall(name, registry: string = 'index.docker.io') {
    return Promise.resolve(false); // Temporally disable the feature.
  }

  /**
   * Get image label information.
   *
   * @param {string} registry - Registry name
   * @param {string} image - image name.
   * @param {string} tag - tag to get.
   */
  async get(registry, image, tag) {
    registry = registry.replace(/:/g, '%3A');
    const rqst = this.client.newSignedRequest('POST', '/config/get', {
      key: `images/${registry}/${image}/${tag}/resource/`,
      prefix: true,
    });
    return this.client._wrapWithPromise(rqst);
  }
}

class ComputeSession {
  public client: any;

  /**
   * The Computate session API wrapper.
   *
   * @param {Client} client - the Client API wrapper object to bind
   */
  constructor(client) {
    this.client = client;
  }

  /**
   * Get the number of compute sessions with specific conditions.
   *
   * @param {string or array} status - status to query. Default is 'RUNNING'.
   *        Available statuses are: `CREATING`, `BUILDING`, `PENDING`, `SCHEDULED`, `RUNNING`, `RESTARTING`, `RESIZING`, `SUSPENDED`, `TERMINATING`, `TERMINATED`, `ERROR`.
   * @param {string} accessKey - access key that is used to start compute sessions.
   * @param {number} limit - limit number of query items.
   * @param {number} offset - offset for item query. Useful for pagination.
   * @param {string} group - project group id to query. Default returns sessions from all groups.
   */
  async total_count(
    status = 'RUNNING',
    accessKey = '',
    limit = 1,
    offset = 0,
    group = '',
  ) {
    let q, v;
    q = `query($limit:Int!, $offset:Int!, $ak:String, $group_id:String, $status:String) {
      compute_session_list(limit:$limit, offset:$offset, access_key:$ak, group_id:$group_id, status:$status) {
        total_count
      }
    }`;
    v = {
      limit: limit,
      offset: offset,
      status: status,
    };
    if (accessKey != '') {
      v['ak'] = accessKey;
    }
    if (group != '') {
      v['group_id'] = group;
    }
    return this.client.query(q, v);
  }

  /**
   * list compute sessions with specific conditions.
   *
   * @param {array} fields - fields to query. Default fields are: ["id", "name", "image", "created_at", "terminated_at", "status", "status_info", "occupied_slots", "cpu_used", "io_read_bytes", "io_write_bytes"].
   * @param {string or array} status - status to query. Default is 'RUNNING'.
   *        Available statuses are: `CREATING`, `BUILDING`, `PENDING`, `SCHEDULED`, `RUNNING`, `RESTARTING`, `RESIZING`, `SUSPENDED`, `TERMINATING`, `TERMINATED`, `ERROR`.
   * @param {string} accessKey - access key that is used to start compute sessions.
   * @param {number} limit - limit number of query items.
   * @param {number} offset - offset for item query. Useful for pagination.
   * @param {string} group - project group id to query. Default returns sessions from all groups.
   * @param {number} timeout - timeout for the request. Default uses SDK default. (5 sec.)
   */
  async list(
    fields = [
      'id',
      'name',
      'image',
      'created_at',
      'terminated_at',
      'status',
      'status_info',
      'occupied_slots',
      'containers {live_stat last_stat}',
      'starts_at',
    ],
    status = 'RUNNING',
    accessKey = '',
    limit = 30,
    offset = 0,
    group = '',
    timeout: number = 0,
  ) {
    fields = this.client._updateFieldCompatibilityByAPIVersion(fields); // For V3/V4 API compatibility
    let q, v;
    q = `query($limit:Int!, $offset:Int!, $ak:String, $group_id:String, $status:String) {
      compute_session_list(limit:$limit, offset:$offset, access_key:$ak, group_id:$group_id, status:$status) {
        items { ${fields.join(' ')}}
        total_count
      }
    }`;
    v = {
      limit: limit,
      offset: offset,
      status: status,
    };
    if (accessKey != '') {
      v['ak'] = accessKey;
    }
    if (group != '') {
      v['group_id'] = group;
    }
    return this.client.query(q, v, null, timeout);
  }

  /**
   * list all status of compute sessions.
   *
   * @param {array} fields - fields to query. Default fields are: ["session_name", "lang", "created_at", "terminated_at", "status", "status_info", "occupied_slots", "cpu_used", "io_read_bytes", "io_write_bytes"].
   * @param {String} status - status to query. The default is string with all status combined.
   * @param {string} accessKey - access key that is used to start compute sessions.
   * @param {number} limit - limit number of query items.
   * @param {number} offset - offset for item query. Useful for pagination.
   * @param {string} group - project group id to query. Default returns sessions from all groups.
   * @param {number} timeout - timeout for the request. Default uses SDK default. (5 sec.)
   */
  async listAll(
    fields = [
      'id',
      'name',
      'image',
      'created_at',
      'terminated_at',
      'status',
      'status_info',
      'occupied_slots',
      'containers {live_stat last_stat}',
    ],
    status = 'RUNNING,RESTARTING,TERMINATING,PENDING,SCHEDULED,PREPARING,PREPARED,CREATING,PULLING,TERMINATED,CANCELLED,ERROR',
    accessKey = '',
    limit = 100,
    offset = 0,
    group = '',
    timeout: number = 0,
  ) {
    fields = this.client._updateFieldCompatibilityByAPIVersion(fields);
    if (!this.client.supports('avoid-hol-blocking')) {
      status.replace('SCHEDULED,', '');
      status.replace('SCHEDULED', '');
    }
    let q, v;
    const sessions: any = [];

    q = `query($limit:Int!, $offset:Int!, $ak:String, $group_id:String, $status:String) {
      compute_session_list(limit:$limit, offset:$offset, access_key:$ak, group_id:$group_id, status:$status) {
        items { ${fields.join(' ')}}
        total_count
      }
    }`;

    // Prevent fetching more than 1000 sessions.
    for (let offset = 0; offset < 10 * limit; offset += limit) {
      v = { limit, offset, status };
      if (accessKey != '') {
        v.access_key = accessKey;
      }
      if (group != '') {
        v.group_id = group;
      }
      const session = await this.client.query(q, v, null, timeout);
      sessions.push(...session.compute_session_list.items);
      if (offset >= session.compute_session_list.total_count) {
        break;
      }
    }
    return Promise.resolve(sessions);
  }

  /**
   * get compute session with specific condition.
   *
   * @param {array} fields - fields to query. Default fields are: ["session_name", "lang", "created_at", "terminated_at", "status", "status_info", "occupied_slots", "cpu_used", "io_read_bytes", "io_write_bytes"].
   * @param {string} sessionUuid - session ID to query specific compute session.
   */
  async get(
    fields = [
      'id',
      'session_name',
      'lang',
      'created_at',
      'terminated_at',
      'status',
      'status_info',
      'occupied_slots',
      'cpu_used',
      'io_read_bytes',
      'io_write_bytes',
      'scaling_group',
    ],
    sessionUuid = '',
  ) {
    fields = this.client._updateFieldCompatibilityByAPIVersion(fields); // For V3/V4 API compatibility
    let q, v;
    q = `query($session_uuid: UUID!) {
      compute_session(id:$session_uuid) {
        ${fields.join(' ')}
      }
    }`;
    v = { session_uuid: sessionUuid };
    return this.client.query(q, v);
  }

  async startService(
    loginSessionToken: string,
    session: string,
    app: string,
    port: number | null = null,
    envs: Record<string, unknown> | null = null,
    args: Record<string, unknown> | null = null,
  ) {
    let rqst = this.client.newSignedRequest(
      'POST',
      `/session/${session}/start-service`,
      {
        login_session_token: loginSessionToken,
        app,
        port: port || undefined,
        envs: envs || undefined,
        arguments: JSON.stringify(args) || undefined,
      },
    );
    return this.client._wrapWithPromise(rqst);
  }
}

class SessionTemplate {
  public client: any;
  public urlPrefix: string;

  /**
   * The Computate session template API wrapper.
   *
   * @param {Client} client - the Client API wrapper object to bind
   */
  constructor(client) {
    this.client = client;
    this.urlPrefix = '/template/session';
  }

  /**
   * list session templates with specific conditions.
   *
   * @param {array} fields - fields to query. Default fields are: ["id", "name", "image", "created_at", "terminated_at", "status", "status_info", "occupied_slots", "cpu_used", "io_read_bytes", "io_write_bytes"].
   * @param {string or array} status - status to query. Default is 'RUNNING'.
   *        Available statuses are: `CREATING`, `BUILDING`,`PENDING`, `SCHEDULED`, `RUNNING`, `RESTARTING`, `RESIZING`, `SUSPENDED`, `TERMINATING`, `TERMINATED`, `ERROR`.
   * @param {string} accessKey - access key that is used to start compute sessions.
   * @param {number} limit - limit number of query items.
   * @param {number} offset - offset for item query. Useful for pagination.
   * @param {string} group - project group id to query. Default returns sessions from all groups.
   * @param {number} timeout - timeout for the request. Default uses SDK default. (5 sec.)
   */
  async list(listall = false, groupId = null) {
    let reqUrl = this.urlPrefix;
    if (listall) {
      const params = { all: listall };
      const q = querystring.stringify(params);
      reqUrl += `?${q}`;
    }
    if (groupId) {
      const params = { group_id: groupId };
      const q = querystring.stringify(params);
      reqUrl += `?${q}`;
    }
    let rqst = this.client.newSignedRequest('GET', reqUrl, null);
    return this.client._wrapWithPromise(rqst);
  }
}

class Resources {
  public client: any;
  public resources: any;
  public agents: any;

  constructor(client) {
    this.client = client;
    this.resources = {};
    this._init_resource_values();
  }

  _init_resource_values() {
    this.resources.cpu = {};
    this.resources.cpu.total = 0;
    this.resources.cpu.used = 0;
    this.resources.cpu.percent = 0;
    this.resources.mem = {};
    this.resources.mem.total = 0;
    this.resources.mem.allocated = 0;
    this.resources.mem.used = 0;
    this.resources.gpu = {};
    this.resources.gpu.total = 0;
    this.resources.gpu.used = 0;
    this.resources['cuda.device'] = {};
    this.resources['cuda.device'].total = 0;
    this.resources['cuda.device'].used = 0;
    this.resources.fgpu = {};
    this.resources.fgpu.total = 0;
    this.resources.fgpu.used = 0;
    this.resources['cuda.shares'] = {};
    this.resources['cuda.shares'].total = 0;
    this.resources['cuda.shares'].used = 0;
    this.resources['rocm.device'] = {};
    this.resources['rocm.device'].total = 0;
    this.resources['rocm.device'].used = 0;
    this.resources['tpu.device'] = {};
    this.resources['tpu.device'].total = 0;
    this.resources['tpu.device'].used = 0;

    this.resources.agents = {};
    this.resources.agents.total = 0;
    this.resources.agents.using = 0;
    this.agents = [];
  }

  /**
   * Total resource information of Backend.AI cluster.
   *
   * @param {string} status - Resource node status to get information.
   */
  async totalResourceInformation(status = 'ALIVE') {
    if (this.client.is_admin) {
      let fields = [
        'id',
        'addr',
        'status',
        'first_contact',
        'cpu_cur_pct',
        'mem_cur_bytes',
        'occupied_slots',
        'available_slots',
      ];
      return this.client.agent
        .list(status, fields)
        .then((response) => {
          this._init_resource_values();
          this.agents = response.agents;
          Object.keys(this.agents).map((objectKey, index) => {
            let value = this.agents[objectKey];
            let occupied_slots = JSON.parse(value.occupied_slots);
            let available_slots = JSON.parse(value.available_slots);
            if ('cpu' in available_slots) {
              this.resources.cpu.total =
                this.resources.cpu.total +
                Math.floor(Number(available_slots.cpu));
            }
            if ('cpu' in occupied_slots) {
              this.resources.cpu.used =
                this.resources.cpu.used +
                Math.floor(Number(occupied_slots.cpu));
            }
            this.resources.cpu.percent =
              this.resources.cpu.percent + parseFloat(value.cpu_cur_pct);

            if (occupied_slots.mem === undefined) {
              occupied_slots.mem = 0;
            }
            this.resources.mem.total =
              parseFloat(this.resources.mem.total) +
              parseInt(
                this.client.utils.changeBinaryUnit(available_slots.mem, 'b'),
              );
            this.resources.mem.allocated =
              parseInt(this.resources.mem.allocated) +
              parseInt(
                this.client.utils.changeBinaryUnit(occupied_slots.mem, 'b'),
              );
            this.resources.mem.used =
              parseInt(this.resources.mem.used) +
              parseInt(
                this.client.utils.changeBinaryUnit(value.mem_cur_bytes, 'b'),
              );

            if ('cuda.device' in available_slots) {
              this.resources['cuda.device'].total =
                parseInt(this.resources['cuda.device'].total) +
                Math.floor(Number(available_slots['cuda.device']));
            }
            if ('cuda.device' in occupied_slots) {
              this.resources['cuda.device'].used =
                parseInt(this.resources['cuda.device'].used) +
                Math.floor(Number(occupied_slots['cuda.device']));
            }
            if ('cuda.shares' in available_slots) {
              this.resources['cuda.shares'].total =
                parseFloat(this.resources['cuda.shares'].total) +
                parseFloat(available_slots['cuda.shares']);
            }
            if ('cuda.shares' in occupied_slots) {
              this.resources['cuda.shares'].used =
                parseFloat(this.resources['cuda.shares'].used) +
                parseFloat(occupied_slots['cuda.shares']);
            }
            if ('rocm.device' in available_slots) {
              this.resources['rocm.device'].total =
                parseInt(this.resources['rocm.device'].total) +
                Math.floor(Number(available_slots['rocm.device']));
            }
            if ('rocm.device' in occupied_slots) {
              this.resources['rocm.device'].used =
                parseInt(this.resources['rocm.device'].used) +
                Math.floor(Number(occupied_slots['rocm.device']));
            }
            if ('tpu.device' in available_slots) {
              this.resources['tpu.device'].total =
                parseInt(this.resources['tpu.device'].total) +
                Math.floor(Number(available_slots['tpu.device']));
            }
            if ('tpu.device' in occupied_slots) {
              this.resources['tpu.device'].used =
                parseInt(this.resources['tpu.device'].used) +
                Math.floor(Number(occupied_slots['tpu.device']));
            }

            if (isNaN(this.resources.cpu.used)) {
              this.resources.cpu.used = 0;
            }
            if (isNaN(this.resources.mem.used)) {
              this.resources.mem.used = 0;
            }
            if (isNaN(this.resources.gpu.used)) {
              this.resources.gpu.used = 0;
            }
            if (isNaN(this.resources.fgpu.used)) {
              this.resources.fgpu.used = 0;
            }
          });
          // Legacy code
          this.resources.gpu.total = this.resources['cuda.device'].total;
          this.resources.gpu.used = this.resources['cuda.device'].used;
          this.resources.fgpu.used =
            this.resources['cuda.shares'].used.toFixed(2);
          this.resources.fgpu.total =
            this.resources['cuda.shares'].total.toFixed(2);
          this.resources.agents.total = Object.keys(this.agents).length; // TODO : remove terminated agents
          this.resources.agents.using = Object.keys(this.agents).length;
          return Promise.resolve(this.resources);
        })
        .catch((err) => {
          throw err;
        });
    } else {
      return Promise.resolve(false);
    }
  }

  /**
   * user statistics about usage.
   *
   */
  async user_stats() {
    const rqst = this.client.newSignedRequest(
      'GET',
      '/resource/stats/user/month',
      null,
    );
    return this.client._wrapWithPromise(rqst);
  }
}

class Group {
  public client: any;

  /**
   * The group API wrapper.
   *
   * @param {Client} client - the Client API wrapper object to bind
   */
  constructor(client) {
    this.client = client;
  }

  /**
   * List registred groups.
   * @param {boolean} is_active - List whether active users or inactive users.
   * @param {string} domain_name - domain name of group
   * {
   *   'name': String,          // Group name.
   *   'description': String,   // Description for group.
   *   'is_active': Boolean,    // Whether the group is active or not.
   *   'created_at': String,    // Created date of group.
   *   'modified_at': String,   // Modified date of group.
   *   'domain_name': String,   // Domain for group.
   * };
   */
  async list(
    is_active = true,
    domain_name = false,
    fields = [
      'id',
      'name',
      'description',
      'is_active',
      'created_at',
      'modified_at',
      'domain_name',
    ],
  ) {
    let q, v;
    if (this.client.is_admin === true) {
      q =
        `query($is_active:Boolean) {` +
        `  groups(is_active:$is_active) { ${fields.join(' ')} }` +
        '}';
      v = { is_active: is_active };
      if (domain_name !== false) {
        q =
          `query($domain_name: String, $is_active:Boolean) {` +
          `  groups(domain_name: $domain_name, is_active:$is_active) { ${fields.join(
            ' ',
          )} }` +
          '}';
        v = {
          is_active: is_active,
          domain_name: domain_name,
        };
      }
    } else {
      q =
        `query($is_active:Boolean) {` +
        `  groups(is_active:$is_active) { ${fields.join(' ')} }` +
        '}';
      v = { is_active: is_active };
    }
    return this.client.query(q, v);
  }
}

class Domain {
  public client: any;

  /**
   * The domain API wrapper.
   *
   * @param {Client} client - the Client API wrapper object to bind
   */
  constructor(client) {
    this.client = client;
  }

  /**
   * Get domain information.
   * @param {string} domain_name - domain name of group
   * @param {array} fields - fields to query.  Default fields are: ['name', 'description', 'is_active', 'created_at', 'modified_at', 'total_resource_slots', 'allowed_vfolder_hosts',
   'allowed_docker_registries', 'integration_id', 'scaling_groups']
   * {
   *   'name': String,          // Group name.
   *   'description': String,   // Description for group.
   *   'is_active': Boolean,    // Whether the group is active or not.
   *   'created_at': String,    // Created date of group.
   *   'modified_at': String,   // Modified date of group.
   *   'total_resource_slots': JSOONString,   // Total resource slots
   *   'allowed_vfolder_hosts': [String],   // Allowed virtual folder hosts
   *   'allowed_docker_registries': [String],   // Allowed docker registry lists
   *   'integration_id': [String],   // Integration ids
   *   'scaling_groups': [String],   // Scaling groups
   * };
   */
  async get(
    domain_name = false,
    fields = [
      'name',
      'description',
      'is_active',
      'created_at',
      'modified_at',
      'total_resource_slots',
      'allowed_vfolder_hosts',
      'allowed_docker_registries',
      'integration_id',
      'scaling_groups',
    ],
  ) {
    let q, v;
    if (domain_name !== false) {
      q =
        `query($name: String) {` +
        `  domain(name: $name) { ${fields.join(' ')} }` +
        '}';
      v = { name: domain_name };
      return this.client.query(q, v);
    }
  }

  async list(
    fields = [
      'name',
      'description',
      'is_active',
      'created_at',
      'total_resource_slots',
      'allowed_vfolder_hosts',
      'allowed_docker_registries',
      'integration_id',
    ],
  ) {
    let q = `query {` + ` domains { ${fields.join(' ')} }` + `}`;
    let v = {};

    return this.client.query(q, v);
  }

  /**
   * Modify domain information.
   * @param {string} domain_name - domain name of group


   * @param {json} input - Domain specification to change. Required fields are:
   * {
   *   'name': String,          // Group name.
   *   'description': String,   // Description for group.
   *   'is_active': Boolean,    // Whether the group is active or not.
   *   'created_at': String,    // Created date of group.
   *   'modified_at': String,   // Modified date of group.
   *   'total_resource_slots': JSONString,   // Total resource slots
   *   'allowed_vfolder_hosts': [String],   // Allowed virtual folder hosts
   *   'allowed_docker_registries': [String],   // Allowed docker registry lists
   *   'integration_id': [String],   // Integration ids
   *   'scaling_groups': [String],   // Scaling groups
   * };
   */
  async update(domain_name = false, input) {
    //let fields = ['name', 'description', 'is_active', 'created_at', 'modified_at', 'total_resource_slots', 'allowed_vfolder_hosts',
    //  'allowed_docker_registries', 'integration_id', 'scaling_groups'];
    if (this.client.is_superadmin === true) {
      let q =
        `mutation($name: String!, $input: ModifyDomainInput!) {` +
        `  modify_domain(name: $name, props: $input) {` +
        `    ok msg` +
        `  }` +
        `}`;
      let v = {
        name: domain_name,
        input: input,
      };
      return this.client.query(q, v);
    } else {
      return Promise.resolve(false);
    }
  }
}

class Maintenance {
  public client: any;
  public urlPrefix: any;

  /**
   * The Maintenance API wrapper.
   *
   * @param {Client} client - the Client API wrapper object to bind
   */
  constructor(client) {
    this.client = client;
    this.urlPrefix = '/resource';
  }

  /**
   * Attach to the background task to listen to events
   * @param {string} task_id - background task id.
   */
  attach_background_task(task_id: string) {
    const urlStr = '/events/background-task?task_id=' + task_id;
    const req = this.client.newSignedRequest('GET', urlStr, null);
    return new EventSource(req.uri, { withCredentials: true });
  }

  /**
   * Rescan image from repository
   * @param {string} registry - registry. default is ''
   */
  async rescan_images(registry = '') {
    if (this.client.is_admin === true) {
      let q, v;
      if (registry !== '') {
        registry = decodeURIComponent(registry);
        q =
          `mutation($registry: String) {` +
          `  rescan_images(registry: $registry) {` +
          `    ok msg task_id ` +
          `  }` +
          `}`;
        v = {
          registry: registry,
        };
      } else {
        q =
          `mutation {` +
          `  rescan_images {` +
          `    ok msg task_id ` +
          `  }` +
          `}`;
        v = {};
      }
      return this.client.query(q, v, null);
    } else {
      return Promise.resolve(false);
    }
  }

  async recalculate_usage() {
    if (this.client.is_superadmin === true) {
      let rqst = this.client.newSignedRequest(
        'POST',
        `${this.urlPrefix}/recalculate-usage`,
        null,
      );
      return this.client._wrapWithPromise(rqst, null, null, 60 * 1000);
    }
  }
}

class User {
  public client: any;

  /**
   * The user API wrapper.
   *
   * @param {Client} client - the Client API wrapper object to bind
   */
  constructor(client) {
    this.client = client;
  }

  /**
   * List all registred users.
   *
   * TODO: we need new paginated list API after implementation of server-side dynamic filtering.
   *
   * @param {boolean} is_active - List whether active users or inactive users.
   * @param {json} input - User specification to query. Fields are:
   * {
   *   'username': String,      // User name for given user id.
   *   'password': String,      // Password for user id.
   *   'need_password_change': Boolean, // Let user change password at the next login.
   *   'full_name': String,     // Full name of given user id.
   *   'description': String,   // Description for user.
   *   'is_active': Boolean, // Flag if user is active or not.
   *   'domain_name': String,   // Domain for user.
   *   'role': String,          // Role for user.
   *   'groups': {id name}  // Group Ids for user. Shoule be list of UUID strings.
   * };
   */
  async list(
    is_active = true,
    fields = [
      'username',
      'password',
      'need_password_change',
      'full_name',
      'description',
      'is_active',
      'domain_name',
      'role',
      'groups {id name}',
      'status',
    ],
  ) {
    let q, v;
    if (this.client._apiVersionMajor < 5) {
      q = this.client.is_admin
        ? `
        query($is_active:Boolean) {
          users(is_active:$is_active) { ${fields.join(' ')} }
        }
      `
        : `
        query {
          users { ${fields.join(' ')} }
        }
      `;
      v = this.client.is_admin ? { is_active } : {};
      return this.client.query(q, v);
    } else {
      // From 20.03, there is no single query to fetch every users, so
      // we iterate pages to gather all users for client-side compability.
      const limit = 100;
      const users = [] as any;
      q = this.client.is_admin
        ? `
        query($offset:Int!, $limit:Int!, $is_active:Boolean) {
          user_list(offset:$offset, limit:$limit, is_active:$is_active) {
            items { ${fields.join(' ')} }
            total_count
          }
        }
      `
        : `
        query($offset:Int!, $limit:Int!) {
          user_list(offset:$offset, limit:$limit) {
            items { ${fields.join(' ')} }
            total_count
          }
        }
      `;
      // Prevent fetching more than 1000 users.
      for (let offset = 0; offset < 10 * limit; offset += limit) {
        v = this.client.is_admin
          ? { offset, limit, is_active }
          : { offset, limit };
        const page = await this.client.query(q, v);
        users.push(...page.user_list.items);
        if (offset >= page.user_list.total_count) {
          break;
        }
      }
      const resp = { users };
      return Promise.resolve(resp);
    }
  }

  /**
   * Get user information.
   *
   * @param {string} email - E-mail address as user id.
   * @param {json} input - User specification to query. Fields are:
   * {
   *   'email': String,         // E-mail for given E-mail (same as user)
   *   'username': String,      // User name for given user id.
   *   'password': String,      // Password for user id.
   *   'need_password_change': Boolean, // Let user change password at the next login.
   *   'full_name': String,     // Full name of given user id.
   *   'description': String,   // Description for user.
   *   'is_active': Boolean,    // Flag if user is active or not.
   *   'domain_name': String,   // Domain for user.
   *   'role': String,          // Role for user.
   *   'groups': List(UUID)  // Group Ids for user. Shoule be list of UUID strings.
   * };
   */
  async get(
    email,
    fields = [
      'email',
      'username',
      'password',
      'need_password_change',
      'full_name',
      'description',
      'is_active',
      'domain_name',
      'role',
      'groups {id name}',
      'totp_activated',
    ],
  ) {
    let q, v;
    if (this.client.is_admin === true) {
      q =
        `query($email:String) {` +
        `  user (email:$email) { ${fields.join(' ')} }` +
        '}';
      v = { email: email };
    } else {
      q = `query {` + `  user { ${fields.join(' ')} }` + '}';
      v = {};
    }
    return this.client.query(q, v);
  }

  /**
   * add new user with given information.
   *
   * @param {string} email - E-mail address as user id.
   * @param {json} input - User specification to change. Required fields are:
   * {
   *   'username': String,      // User name for given user id.
   *   'password': String,      // Password for user id.
   *   'need_password_change': Boolean, // Let user change password at the next login.
   *   'full_name': String,     // Full name of given user id.
   *   'description': String,   // Description for user.
   *   'is_active': Boolean,    // Flag if user is active or not.
   *   'domain_name': String,   // Domain for user.
   *   'role': String,          // Role for user.
   *   'group_ids': List(UUID)  // Group Ids for user. Shoule be list of UUID strings.
   * };
   */
  async create(email = null, input) {
    let fields = [
      'username',
      'password',
      'need_password_change',
      'full_name',
      'description',
      'is_active',
      'domain_name',
      'role',
      'groups{id, name}',
    ];
    if (this.client.is_admin === true) {
      let q =
        `mutation($email: String!, $input: UserInput!) {` +
        `  create_user(email: $email, props: $input) {` +
        `    ok msg` +
        `  }` +
        `}`;
      let v = {
        email: email,
        input: input,
      };
      return this.client.query(q, v);
    } else {
      return Promise.resolve(false);
    }
  }

  /**
   * modify user information with given user id with new values.
   *
   * @param {string} email - E-mail address as user id.
   * @param {json} input - User specification to change. Required fields are:
   * {
   *   'username': String,      // User name for given user id.
   *   'password': String,      // Password for user id.
   *   'need_password_change': Boolean, // Let user change password at the next login.
   *   'full_name': String,     // Full name of given user id.
   *   'description': String,   // Description for user.
   *   'is_active': Boolean,    // Flag if user is active or not.
   *   'domain_name': String,   // Domain for user.
   *   'role': String,          // Role for user.
   *   'group_ids': List(UUID)  // Group Ids for user. Shoule be list of UUID strings.
   * };
   */
  async update(email = null, input) {
    if (this.client.is_superadmin === true) {
      let q =
        `mutation($email: String!, $input: ModifyUserInput!) {` +
        `  modify_user(email: $email, props: $input) {` +
        `    ok msg` +
        `  }` +
        `}`;
      let v = {
        email: email,
        input: input,
      };
      return this.client.query(q, v);
    } else {
      return Promise.resolve(false);
    }
  }

  /**
   * delete user information with given user id
   *
   * @param {string} email - E-mail address as user id to delete.
   */
  async delete(email) {
    if (this.client.is_superadmin === true) {
      let q =
        `mutation($email: String!) {` +
        `  delete_user(email: $email) {` +
        `    ok msg` +
        `  }` +
        `}`;
      let v = {
        email: email,
      };
      return this.client.query(q, v);
    } else {
      return Promise.resolve(false);
    }
  }
}

class ScalingGroup {
  public client: any;

  /**
   * The Scaling Group API wrapper.
   *
   * @param {Client} client - the Client API wrapper object to bind
   */
  constructor(client) {
    this.client = client;
  }

  async list_available() {
    if (this.client.is_superadmin === true) {
      const fields = [
        'name',
        'description',
        'is_active',
        'created_at',
        'driver',
        'driver_opts',
        'scheduler',
        'scheduler_opts',
      ];
      if (this.client.isManagerVersionCompatibleWith('21.09.0')) {
        fields.push('wsproxy_addr');
      }
      const q = `query {` + `  scaling_groups { ${fields.join(' ')} }` + `}`;
      const v = {};
      return this.client.query(q, v);
    } else {
      return Promise.resolve(false);
    }
  }

  async list(group = 'default') {
    const searchParams = new URLSearchParams({ group: group });
    const queryString = `/scaling-groups?${searchParams.toString()}`;
    const rqst = this.client.newSignedRequest('GET', queryString, null);
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Get the version of WSProxy for a specific scaling group.
   * (NEW) manager version 21.09.
   *
   * @param {string} scalingGroup - Scaling group name
   * @param {string} groupId - Project (group) ID
   */
  async getWsproxyVersion(scalingGroup, groupId) {
    if (!this.client.isManagerVersionCompatibleWith('21.09.0')) {
      return Promise.resolve({ wsproxy_version: 'v1' }); // for manager<=21.03 compatibility.
    }
    const url = `/scaling-groups/${scalingGroup}/wsproxy-version?${new URLSearchParams({ group: groupId }).toString()}`;
    const rqst = this.client.newSignedRequest('GET', url, null);
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Create a scaling group
   *
   * @param {json} input - object containing desired modifications
   * {
   *   'description': String          // description of scaling group
   *   'is_active': Boolean           // active status of scaling group
   *   'driver': String
   *   'driver_opts': JSONString
   *   'scheduler': String
   *   'scheduler_opts': JSONString   // NEW in manager 22.03
   *   'wsproxy_addr': String         // NEW in manager 21.09
   * }
   */
  async create(name, input) {
    let q =
      `mutation($name: String!, $input: CreateScalingGroupInput!) {` +
      `  create_scaling_group(name: $name, props: $input) {` +
      `    ok msg` +
      `  }` +
      `}`;
    let v = {
      name,
      input,
    };
    return this.client.query(q, v);
  }

  /**
   * Associate a scaling group with a domain
   *
   * @param {string} domain - domain name
   * @param {string} scaling_group - scaling group name
   */
  async associate_domain(domain, scaling_group) {
    let q =
      `mutation($domain: String!, $scaling_group: String!) {` +
      `  associate_scaling_group_with_domain(domain: $domain, scaling_group: $scaling_group) {` +
      `    ok msg` +
      `  }` +
      `}`;
    let v = {
      domain,
      scaling_group,
    };
    return this.client.query(q, v);
  }

  /**
   * Modify a scaling group
   *
   * @param {string} name - scaling group name
   * @param {json} input - object containing desired modifications
   * {
   *   'description': String          // description of scaling group
   *   'is_active': Boolean           // active status of scaling group
   *   'driver': String
   *   'driver_opts': JSONString
   *   'scheduler': String
   *   'scheduler_opts': JSONString   // NEW in manager 22.03
   *   'wsproxy_addr': String         // NEW in manager 21.09
   * }
   */
  async update(name, input) {
    if (!this.client.isManagerVersionCompatibleWith('21.09.0')) {
      delete input.wsproxy_addr;
      if (Object.keys(input).length < 1) {
        return Promise.resolve({ modify_scaling_group: { ok: true } });
      }
    }
    let q =
      `mutation($name: String!, $input: ModifyScalingGroupInput!) {` +
      `  modify_scaling_group(name: $name, props: $input) {` +
      `    ok msg` +
      `  }` +
      `}`;
    let v = {
      name,
      input,
    };

    return this.client.query(q, v);
  }

  /**
   * Delete a scaling group
   *
   * @param {string} name - name of scaling group to be deleted
   */
  async delete(name) {
    let q =
      `mutation($name: String!) {` +
      `  delete_scaling_group(name: $name) {` +
      `    ok msg` +
      `  }` +
      `}`;
    let v = {
      name,
    };

    return this.client.query(q, v);
  }
}

class Registry {
  public client: any;

  constructor(client) {
    this.client = client;
  }

  async list() {
    const rqst = this.client.newSignedRequest('POST', '/config/get', {
      key: 'config/docker/registry',
      prefix: true,
    });
    return this.client._wrapWithPromise(rqst);
  }

  async set(key, value) {
    key = encodeURIComponent(key);
    let regkey = `config/docker/registry/${key}`;
    const rqst = this.client.newSignedRequest('POST', '/config/set', {
      key: regkey,
      value,
    });
    return this.client._wrapWithPromise(rqst);
  }

  async delete(key) {
    key = encodeURIComponent(key);
    const rqst = this.client.newSignedRequest('POST', '/config/delete', {
      key: `config/docker/registry/${key}`,
      prefix: true,
    });
    return this.client._wrapWithPromise(rqst);
  }
}

class Setting {
  public client: any;
  public config: any;
  /**
   * Setting API wrapper.
   *
   * @param {Client} client - the Client API wrapper object to bind
   */
  constructor(client) {
    this.client = client;
    this.config = null;
  }

  /**
   * List settings
   *
   * @param {string} prefix - prefix to get. This command will return every settings starting with the prefix.
   */
  async list(prefix = '') {
    prefix = `config/${prefix}`;
    const rqst = this.client.newSignedRequest('POST', '/config/get', {
      key: prefix,
      prefix: true,
    });
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Get settings
   *
   * @param {string} prefix - prefix to get. This command will return every settings starting with the prefix.
   */
  async get(key) {
    key = `config/${key}`;
    const rqst = this.client.newSignedRequest('POST', '/config/get', {
      key: key,
      prefix: false,
    });
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Set a setting
   *
   * @param {string} key - key to add.
   * @param {object} value - value to add.
   */
  async set(key, value) {
    key = `config/${key}`;
    const rqst = this.client.newSignedRequest('POST', '/config/set', {
      key,
      value,
    });
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Delete a setting
   *
   * @param {string} key - key to delete
   * @param {boolean} prefix - prefix to delete. if prefix is true, this command will delete every settings starting with the key.
   */
  async delete(key, prefix = false) {
    key = `config/${key}`;
    const rqst = this.client.newSignedRequest('POST', '/config/delete', {
      key: `${key}`,
      prefix: prefix,
    });
    return this.client._wrapWithPromise(rqst);
  }
}

class Service {
  public client: any;
  public config: any;

  /**
   * Service-specific API wrapper.
   *
   * @param {Client} client - the Client API wrapper object to bind
   */
  constructor(client) {
    this.client = client;
    this.config = null;
  }

  /**
   * Get announcements
   *
   */
  async get_announcement() {
    const rqst = this.client.newSignedRequest(
      'GET',
      '/manager/announcement',
      null,
    );
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Update announcement
   *
   * @param {boolean} enabled - Enable / disable announcement. Default is True.
   * @param {string} message - Announcement content. Usually in Markdown syntax.
   */
  async update_announcement(enabled = true, message) {
    const rqst = this.client.newSignedRequest('POST', '/manager/announcement', {
      enabled: enabled,
      message: message,
    });
    return this.client._wrapWithPromise(rqst);
  }
}

class UserConfig {
  public client: any;
  public config: any;

  /**
   * Setting API wrapper.
   *
   * @param {Client} client - the Client API wrapper object to bind
   */
  constructor(client: Client) {
    this.client = client;
    this.config = null;
  }

  /**
   * Get content of bootstrap script of a keypair.
   */
  async get_bootstrap_script() {
    if (!this.client._config.accessKey) {
      throw 'Your access key is not set';
    }
    const rqst = this.client.newSignedRequest(
      'GET',
      '/user-config/bootstrap-script',
    );
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Update bootstrap script of a keypair.
   *
   * @param {string} data - text content of bootstrap script.
   */
  async update_bootstrap_script(script: string) {
    const rqst = this.client.newSignedRequest(
      'POST',
      '/user-config/bootstrap-script',
      { script },
    );
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Create content of script dotfile (.bashrc or .zshrc)
   * @param {string} data - text content of script dotfile
   * @param {string} path - path of script dotfile. (cwd: home directory)
   */
  async create(data: string = '', path: string) {
    if (!this.client._config.accessKey) {
      throw 'Your access key is not set';
    }
    let params = {
      path: path,
      data: data,
      permission: '644',
    };
    const rqst = this.client.newSignedRequest(
      'POST',
      '/user-config/dotfiles',
      params,
    );
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Get content of script dotfile
   */
  async get() {
    if (!this.client._config.accessKey) {
      throw 'Your access key is not set';
    }
    // let params = {
    //   "owner_access_key" : this.client._config.accessKey
    // }
    const rqst = this.client.newSignedRequest('GET', '/user-config/dotfiles');
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Update script dotfile of a keypair.
   *
   * @param {string} data - text content of script dotfile.
   * @param {string} path - path of script dotfile. (cwd: home directory)
   */
  async update(data: string, path: string) {
    let params = {
      data: data,
      path: path,
      permission: '644',
    };
    const rqst = this.client.newSignedRequest(
      'PATCH',
      '/user-config/dotfiles',
      params,
    );
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Delete script dotfile of a keypair.
   *
   * @param {string} path - path of script dotfile.
   */
  async delete(path: string) {
    let params = {
      path: path,
    };
    const rqst = this.client.newSignedRequest(
      'DELETE',
      '/user-config/dotfiles',
      params,
    );
    return this.client._wrapWithPromise(rqst);
  }
}

class Enterprise {
  public client: any;
  public config: any;
  public certificate: any;
  /**
   * Setting API wrapper.
   *
   * @param {Client} client - the Client API wrapper object to bind
   */
  constructor(client: Client) {
    this.client = client;
    this.config = null;
  }

  /**
   * Get the current enterprise license.
   */
  async getLicense() {
    if (this.client.is_superadmin === true) {
      if (typeof this.certificate === 'undefined') {
        const rqst = this.client.newSignedRequest('GET', '/license');
        let cert = await this.client._wrapWithPromise(rqst);
        this.certificate = cert.certificate;
        if (cert.status === 'valid') {
          this.certificate['valid'] = true;
        } else {
          this.certificate['valid'] = false;
        }
        return Promise.resolve(this.certificate);
      }
    } else {
      return Promise.resolve(false);
    }
  }
}

class Cloud {
  public client: any;
  public config: any;

  /**
   * Setting API wrapper.
   *
   * @param {Client} client - the Client API wrapper object to bind
   */
  constructor(client: Client) {
    this.client = client;
    this.config = null;
  }

  /**
   * Check if cloud endpoint is available.
   */
  async ping() {
    const rqst = this.client.newSignedRequest('GET', '/cloud/ping');
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Verify signup email by JWT token.
   *
   * @param {string} token - JWT token which is delivered to user's email.
   */
  async verify_email(token: string) {
    const body = { verification_code: token };
    const rqst = this.client.newSignedRequest(
      'POST',
      '/cloud/verify-email',
      body,
    );
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Send verification email.
   *
   * @param {string} email - user's email.
   */
  async send_verification_email(email: string) {
    const body = { email };
    const rqst = this.client.newSignedRequest(
      'POST',
      '/cloud/send-verification-email',
      body,
    );
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Send password change email to assist users who forgot their password.
   *
   * @param {string} email - user's email.
   */
  async send_password_change_email(email: string) {
    const body = { email };
    const rqst = this.client.newSignedRequest(
      'POST',
      '/cloud/send-password-change-email',
      body,
    );
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Verify JWT token for changing password.
   *
   * @param {string} email - user's email (for verification).
   * @param {string} password - new password.
   * @param {string} token - JWT token which is delivered to user's email.
   */
  async change_password(email: string, password: string, token: string) {
    const body = { email, password, token };
    const rqst = this.client.newSignedRequest(
      'POST',
      '/cloud/change-password',
      body,
    );
    return this.client._wrapWithPromise(rqst);
  }
}

class Pipeline {
  public client: any;
  public tokenName: string;
  public urlPrefix: string;

  /**
   * Setting API wrapper.
   *
   * @param {Client} client - the Client API wrapper object to bind
   */
  constructor(client: Client) {
    this.client = client;
    this.tokenName = 'pipeline-token';
    this.urlPrefix = `/api/pipelines`;
  }

  /**
   *
   * @param {json} input - pipeline specification and data. Required fields are:
   * {
   *    'username': string,
   *    'password': string,
   *    'access_key': string,
   *    'secret_key': string,
   * }
   */
  async login(input) {
    const rqst = this.client.newSignedRequest(
      'POST',
      `/auth-token/`,
      input,
      'pipeline',
    );
    let result;
    try {
      result = await this.client._wrapWithPromise(rqst, false, null, 0, 0, {
        log: JSON.stringify({
          username: input.username,
          password: '********',
        }),
      });
      // if there's no token, then user account is invalid
      if (result.hasOwnProperty('token') === false) {
        return Promise.resolve(false);
      } else {
        const token = result.token;
        document.cookie = `${this.tokenName}=${token}; path=/`;
      }
    } catch (err) {
      // console.log(err);
      throw {
        title: 'No Pipeline Server found at API Endpoint.',
        message:
          'Authentication failed. Check information and pipeline server status.',
      };
    }
  }

  async logout() {
    const rqst = this.client.newSignedRequest(
      'DELETE',
      `/auth-token/`,
      null,
      'pipeline',
    );
    try {
      await this.client._wrapWithPromise(rqst);
      this._removeCookieByName(this.tokenName);
    } catch (err) {
      // console.log(err);
      throw {
        title: 'Pipeline Logout Failed.',
        message:
          'Pipeline Logout failed. Check information and pipeline server status.',
      };
    } finally {
      // remove cookie anyway
      this._removeCookieByName(this.tokenName);
    }
  }

  async check_login() {
    let rqst = this.client.newSignedRequest(
      'GET',
      `/api/users/me/`,
      null,
      'pipeline',
    );
    return this.client._wrapWithPromise(rqst);
  }

  getPipelineToken() {
    return this._getCookieByName(this.tokenName);
  }

  /**
   * List all pipelines
   */
  async list() {
    let rqst = this.client.newSignedRequest(
      'GET',
      `${this.urlPrefix}/`,
      null,
      'pipeline',
    );
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Get pipeline with given its id
   *
   * @param {string} id - pipeline id
   */
  async info(id) {
    let rqst = this.client.newSignedRequest(
      'GET',
      `${this.urlPrefix}/${id}/`,
      null,
      'pipeline',
    );
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Create a pipeline with input
   *
   * @param {json} input - pipeline specification and data. Required fields are:
   * {
   *    'name': string,
   *    'description' : string,
   *    'yaml': string,
   *    'dataflow': object,
   *    'is_active': boolean
   * }
   */
  async create(input) {
    let rqst = this.client.newSignedRequest(
      'POST',
      `${this.urlPrefix}/`,
      input,
      'pipeline',
    );
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Update the pipeline based on input value
   *
   * @param {string} id - pipeline id
   * @param {json} input - pipeline specification and data. Required fields are:
   * {
   *    'name': string,
   *    'description': string, // TODO
   *    'yaml': string,
   *    'dataflow': {},
   *    'is_active': boolean, // TODO
   * }
   */
  async update(id, input) {
    let rqst = this.client.newSignedRequest(
      'PATCH',
      `${this.urlPrefix}/${id}/`,
      input,
      'pipeline',
    );
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Delete the pipeline
   *
   * @param {string} id - pipeline id
   */
  async delete(id) {
    let rqst = this.client.newSignedRequest(
      'DELETE',
      `${this.urlPrefix}/${id}/`,
      null,
      'pipeline',
    );
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Instantiate(Run) pipeline to pipeline-job
   *
   * @param {string} id - pipeline id
   * @param {json} input - piepline specification and data. Required fields are:
   * {
   *    'name': string,
   *    'description': string,
   *    'yaml': string,
   *    'dataflow': {},
   *    'is_active': boolean,
   * }
   */
  async run(id, input) {
    let rqst = this.client.newSignedRequest(
      'POST',
      `${this.urlPrefix}/${id}/run/`,
      input,
      'pipeline',
    );
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Get Cookie By its name if exists
   *
   * @param {string} name - cookie name
   * @returns {string} cookieValue
   */
  _getCookieByName(name = '') {
    let cookieValue: string = '';
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === name + '=') {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }

  /**
   * Remove Cooke By its name if exists
   *
   * @param {string} name - cookie name
   */
  _removeCookieByName(name = '') {
    if (name !== '') {
      document.cookie =
        name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }
  }
}

class PipelineJob {
  public client: any;
  public urlPrefix: string;

  /**
   * Setting API wrapper.
   *
   * @param {Client} client - the Client API wrapper object to bind
   */
  constructor(client: Client) {
    this.client = client;
    this.urlPrefix = `/api/pipeline-jobs`;
  }

  /**
   * List all pipeline jobs
   */
  async list() {
    let rqst = this.client.newSignedRequest(
      'GET',
      `${this.urlPrefix}/`,
      null,
      'pipeline',
    );
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Get pipeline job with given its id
   *
   * @param {string} id - pipeline id
   */
  async info(id) {
    let rqst = this.client.newSignedRequest(
      'GET',
      `${this.urlPrefix}/${id}/`,
      null,
      'pipeline',
    );
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Stop running pipeline job with given its id
   *
   * @param {string} id - pipeline id
   */
  async stop(id) {
    let rqst = this.client.newSignedRequest(
      'DELETE',
      `${this.urlPrefix}/${id}/stop/`,
      null,
      'pipeline',
    );
    return this.client._wrapWithPromise(rqst);
  }
}

class PipelineTaskInstance {
  public client: any;
  public urlPrefix: string;

  /**
   * Setting API wrapper.
   *
   * @param {Client} client - the Client API wrapper object to bind
   */
  constructor(client: Client) {
    this.client = client;
    this.urlPrefix = `/api/task-instances`;
  }

  /**
   * List all task instances of the pipeline job corresponding to pipelineJobId if its value is not null.
   * if not, then bring all task instances that pipeline server user created via every pipeline job
   *
   * @param {stirng} pipelineJobId - pipeline job id
   */
  async list(pipelineJobId = '') {
    let queryString = `${this.urlPrefix}`;
    const searchParams = new URLSearchParams();
    if (pipelineJobId) {
      searchParams.set('pipeline_job', pipelineJobId);
    }
    if (searchParams.size > 0) {
      queryString += `?${searchParams.toString()}`;
    } else {
      queryString += `/`;
    }
    let rqst = this.client.newSignedRequest(
      'GET',
      queryString,
      null,
      'pipeline',
    );
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Get task instance with given its id
   *
   * @param {string} id - task instance id
   */
  async info(id) {
    let rqst = this.client.newSignedRequest(
      'GET',
      `${this.urlPrefix}/${id}/`,
      null,
      'pipeline',
    );
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Create custom task instance with input
   *
   * @param {json} input
   */
  async create(input) {
    let rqst = this.client.newSignedRequest(
      'POST',
      `${this.urlPrefix}/`,
      input,
      'pipeline',
    );
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Update the task instance based on input value
   *
   * @param {string} id - task instance id
   * @param {json} input - task-instance specification and data.
   */
  async update(id, input) {
    let rqst = this.client.newSignedRequest(
      'PATCH',
      `${this.urlPrefix}/${id}/`,
      input,
      'pipeline',
    );
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Delete the task-instance
   *
   * @param {string} id - task instance id
   */
  async delete(id) {
    let rqst = this.client.newSignedRequest(
      'DELETE',
      `${this.urlPrefix}/${id}/`,
      null,
      'pipeline',
    );
    return this.client._wrapWithPromise(rqst);
  }
}

class EduApp {
  public client: any;
  public config: any;

  /**
   * Setting API wrapper.
   *
   * @param {Client} client - the Client API wrapper object to bind
   */
  constructor(client: Client) {
    this.client = client;
    this.config = null;
  }

  /**
   * Check if EduApp endpoint is available.
   */
  async ping() {
    const rqst = this.client.newSignedRequest('GET', '/eduapp/ping');
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Get mount folders for auto-mount.
   */
  async get_mount_folders() {
    const rqst = this.client.newSignedRequest('GET', '/eduapp/mounts');
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Get projects of user.
   */
  async get_user_projects() {
    const rqst = this.client.newSignedRequest('GET', '/eduapp/projects');
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Get credential of user.
   */
  async get_user_credential(stoken: string) {
    const rqst = this.client.newSignedRequest(
      'GET',
      `/eduapp/credential?${new URLSearchParams({ sToken: stoken }).toString()}`,
    );
    return this.client._wrapWithPromise(rqst);
  }
}

class utils {
  public client: any;

  constructor(client) {
    this.client = client;
  }

  changeBinaryUnit(value, targetUnit = 'g', defaultUnit = 'b') {
    if (value === undefined || value === null) {
      return value;
    }
    let sourceUnit;
    const binaryUnits = ['b', 'k', 'm', 'g', 't', 'p', 'auto'];
    const bBinaryUnits = ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB'];
    if (!binaryUnits.includes(targetUnit)) return false;
    value = value.toString();
    if (value.indexOf(' ') >= 0) {
      // Has string
      let v = value.split(/(\s+)/);
      if (bBinaryUnits.includes(v[2])) {
        value = v[0] + binaryUnits[bBinaryUnits.indexOf(v[2])];
      } else {
        value = v[0];
      }
    }
    if (binaryUnits.includes(value.substr(-1))) {
      sourceUnit = value.substr(-1);
      value = value.slice(0, -1);
    } else {
      sourceUnit = defaultUnit; // Fallback
    }
    if (targetUnit == 'auto') {
    }
    return (
      value *
      Math.pow(
        1024,
        Math.floor(
          binaryUnits.indexOf(sourceUnit) - binaryUnits.indexOf(targetUnit),
        ),
      )
    );
  }

  elapsedTime(start, end) {
    var startDate = new Date(start);
    if (end === null) {
      var endDate = new Date();
    } else {
      var endDate = new Date(end);
    }
    var seconds_total = Math.floor(
      (endDate.getTime() - startDate.getTime()) / 1000,
    );
    var seconds_cumulative = seconds_total;
    var days = Math.floor(seconds_cumulative / 86400);
    seconds_cumulative = seconds_cumulative - days * 86400;
    var hours = Math.floor(seconds_cumulative / 3600);
    seconds_cumulative = seconds_cumulative - hours * 3600;
    var minutes = Math.floor(seconds_cumulative / 60);
    seconds_cumulative = seconds_cumulative - minutes * 60;
    var seconds = seconds_cumulative;
    var result = '';
    if (days !== undefined && days > 0) {
      result = result + String(days) + ' Day ';
    }
    if (hours !== undefined) {
      result = result + this._padding_zeros(hours, 2) + ':';
    }
    if (minutes !== undefined) {
      result = result + this._padding_zeros(minutes, 2) + ':';
    }
    return result + this._padding_zeros(seconds, 2) + '';
  }

  _padding_zeros(n, width) {
    n = n + '';
    return n.length >= width
      ? n
      : new Array(width - n.length + 1).join('0') + n;
  }

  /**
   * Limit the boundary of value
   *
   * @param {number} value - input value to be clamped
   * @param {number} min - minimum value of the input value
   * @param {number} max - maximum value of the input vallue
   */
  clamp(value: number, min: number, max: number) {
    return Math.max(min, Math.min(value, max));
  }

  gqlToObject(array, key) {
    let result = {};
    array.forEach(function (element) {
      result[element[key]] = element;
    });
    return result;
  }

  gqlToList(array, key) {
    let result: Array<any> = [];
    array.forEach(function (element) {
      result.push(element[key]);
    });
    return result;
  }
}

// below will become "static const" properties in ES7
Object.defineProperty(Client, 'ERR_SERVER', {
  value: 0,
  writable: false,
  enumerable: true,
  configurable: false,
});
Object.defineProperty(Client, 'ERR_RESPONSE', {
  value: 1,
  writable: false,
  enumerable: true,
  configurable: false,
});
Object.defineProperty(Client, 'ERR_REQUEST', {
  value: 2,
  writable: false,
  enumerable: true,
  configurable: false,
});
Object.defineProperty(Client, 'ERR_ABORT', {
  value: 3,
  writable: false,
  enumerable: true,
  configurable: false,
});
Object.defineProperty(Client, 'ERR_TIMEOUT', {
  value: 4,
  writable: false,
  enumerable: true,
  configurable: false,
});
Object.defineProperty(Client, 'ERR_UNKNOWN', {
  value: 99,
  writable: false,
  enumerable: true,
  configurable: false,
});

const backend = {
  Client: Client,
  ClientConfig: ClientConfig,
};

// for use like "ai.backend.Client"
module.exports.backend = backend;
// for classical uses
module.exports.Client = Client;
module.exports.ClientConfig = ClientConfig;
// legacy aliases
module.exports.BackendAIClient = Client;
module.exports.BackendAIClientConfig = ClientConfig;
