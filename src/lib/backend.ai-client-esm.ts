/*
Backend.AI API Library / SDK for Node.JS / Javascript ESModule (v23.3.0)
=========================================================================

(C) Copyright 2016-2023 Lablup Inc.
Licensed under MIT
*/
/*jshint esnext: true */
import CryptoES from 'crypto-es';
//var CryptoES = require("crypto-js"); /* Exclude for ES6 */
import { comparePEP440Versions, isCompatibleMultipleConditions} from './pep440';
import { SessionResources } from '../types/backend-ai-console';
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
    accessKey?: string,
    secretKey?: string,
    endpoint?: string,
    connectionMode: string = 'API',
  ) {
    // default configs.
    this._apiVersionMajor = '8';
    this._apiVersion = 'v8.20240915'; // For compatibility with 24.09.
    this._hashType = 'sha256';
    if (endpoint === undefined || endpoint === null) {
      endpoint = 'https://api.backend.ai';
    }
    this._endpoint = endpoint;
    this._endpointHost = endpoint.replace(/^[^:]+:\/\//, '');
    if (connectionMode === 'API') {
      // API mode
      // dynamic configs
      if (accessKey === undefined || accessKey === null) {
        throw new Error(
          'You must set accessKey! (either as argument or environment variable)',
        );
      }
      if (secretKey === undefined || secretKey === null) {
        throw new Error(
          'You must set secretKey! (either as argument or environment variable)',
        );
      }
      this._accessKey = accessKey;
      this._secretKey = secretKey;
      this._userId = '';
      this._password = '';
    } else {
      // Session mode
      // dynamic configs
      if (accessKey === undefined || accessKey === null) {
        throw new Error(
          'You must set user id! (either as argument or environment variable)',
        );
      }
      if (secretKey === undefined || secretKey === null) {
        throw new Error(
          'You must set password! (either as argument or environment variable)',
        );
      }
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
  public _loginSessionId: string | null;
  public is_admin: boolean;
  public is_superadmin: boolean;
  public kernelPrefix: any;
  public resourcePreset: ResourcePreset;
  public vfolder: VFolder;
  public agent: Agent;
  public agentSummary: AgentSummary;
  public keypair: Keypair;
  public image: ContainerImage;
  public utils: utils;
  public computeSession: ComputeSession;
  public sessionTemplate: SessionTemplate;
  public modelService: ModelService;
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
  public requestSoftTimeout: number;
  static ERR_REQUEST: any;
  static ERR_RESPONSE: any;
  static ERR_ABORT: any;
  static ERR_TIMEOUT: any;
  static ERR_SERVER: any;
  static ERR_UNKNOWN: any;

  // Additional info related to current login user
  public email: string;
  public full_name: string;
  public user_uuid: string;

  /**
   * The client API wrapper.
   *
   * @param {ClientConfig} config - the API client-side configuration
   * @param {string} agentSignature - an extra string that will be appended to User-Agent headers when making API requests
   */
  constructor(config: ClientConfig, agentSignature: string) {
    this.code = null;
    this.sessionId = null; // TODO: check and remove.
    this.kernelType = null;
    this.clientVersion = '22.09.0';
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
    this.agentSummary = new AgentSummary(this);
    this.keypair = new Keypair(this);
    this.image = new ContainerImage(this);
    this.utils = new utils(this);
    this.computeSession = new ComputeSession(this);
    this.sessionTemplate = new SessionTemplate(this);
    this.modelService = new ModelService(this);
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
    this.requestTimeout = 30_000;
    this.requestSoftTimeout = 20_000;
    if (localStorage.getItem('backendaiwebui.sessionid')) {
      this._loginSessionId = localStorage.getItem('backendaiwebui.sessionid');
    } else {
      this._loginSessionId = '';
    }
    this.email = '';
    this.full_name = '';
    this.user_uuid = '';
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
   * @param {requestInfo} rqst - Request object to send
   * @param {Boolean} rawFile - True if it is raw request
   * @param {AbortController.signal} signal - Request signal to abort fetch
   * @param {number} timeout - Custom timeout (sec.) If no timeout is given, default timeout is used.
   * @param {number} retry - an integer to retry this request
   * @param {Object} opts - Options
   */
  async _wrapWithPromise(
    rqst: requestInfo,
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
    let errorCode = '';
    let traceback = '';
    let resp, body, requestTimer, requestTimerForSoftTimeout;
    let isSoftTimeoutTriggered = false;
    try {
      if (rqst.method === 'GET') {
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
      requestTimerForSoftTimeout = setTimeout(
        () => {
          document?.dispatchEvent(new CustomEvent('backend-ai-network-soft-time-out'));
          isSoftTimeoutTriggered = true;
        },
        this.requestSoftTimeout
      );
      resp = await fetch(rqst.uri, rqst);
      if (typeof requestTimer !== 'undefined') {
        clearTimeout(requestTimer);
      }
      if (typeof requestTimerForSoftTimeout !== 'undefined') {
        clearTimeout(requestTimerForSoftTimeout);
        if(!isSoftTimeoutTriggered) {
          document?.dispatchEvent(new CustomEvent('backend-ai-network-success-without-soft-time-out'));
          isSoftTimeoutTriggered = true;
        }
      }
      
      let loginSessionId = resp.headers.get('X-BackendAI-SessionID'); // Login session ID handler
      if (loginSessionId) {
        this._loginSessionId = loginSessionId;
      }
      errorType = Client.ERR_RESPONSE;
      let contentType = resp.headers.get('Content-Type');
      if (!rawFile && (contentType === null || resp.status === 204 )) {
        body = await resp.blob();
      } else if (
        !rawFile &&
        (contentType?.startsWith('application/json') ||
          contentType?.startsWith('application/problem+json'))
      ) {
        body = await resp.json(); // Formatted error message from manager
        errorType = body.type;
        errorTitle = body.title;
        errorCode = body?.error_code;
        traceback = body?.traceback;
      } else if (!rawFile && contentType?.startsWith('text/')) {
        body = await resp.text();
      } else {
        body = await resp.blob();
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
        err?.constructor === Object &&
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
        // `msg` field was introduced in v24.09.0
        msg: resp.msg,
        // `message` is deprecated, but it is kept for backward compatibility.
        // use `msg` field instead.
        message: errorMsg,
        description: errorDesc,
        error_code: errorCode,
        traceback: traceback,
      };
    }

    let previous_log = JSON.parse(
      localStorage.getItem('backendaiwebui.logs') as any,
    );
    if (previous_log) {
      if (previous_log.length > 2000) {
        previous_log = previous_log.slice(1, 2000);
      }
    }
    let log_stack: Record<string, unknown>[] = [];
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
      this._apiVersionMajor = v.version?.substring(1, 3);
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
    if (this.isAPIVersionCompatibleWith('v6.20220615')) {
      this._features['secure-payload'] = true;
    }
    if (this.isManagerVersionCompatibleWith('22.09')) {
      this._features['image-commit'] = true;
      this._features['fine-grained-storage-permissions'] = true;
      this._features['2FA'] = true;
    }
    if (this.isManagerVersionCompatibleWith('22.09')){
      this._features['force2FA'] = true;
      if(this.isManagerVersionCompatibleWith('25.09.0')) {
        this._features['force2FA'] = false; // force2FA is deprecated in 25.09.0
      }
    }
    if (this.isManagerVersionCompatibleWith('22.09.19')) {
      this._features['idle-checks'] = true;
    }
    if (this.isManagerVersionCompatibleWith('22.09.22')) {
      this._features['is-public'] = true;
    }
    if (this.isAPIVersionCompatibleWith('v6.20230315')) {
      this._features['inference-workload'] = true;
    }
    if (this.isManagerVersionCompatibleWith('23.03')) {
      this._features['inference-workload'] = true;
      this._features['local-vscode-remote-connection'] = true;
      this._features['display-allocated-shmem'] = true;
    }
    if (this.isManagerVersionCompatibleWith('23.03.3')) {
      this._features['sftp-scaling-group'] = true;
    }
    if (this.isManagerVersionCompatibleWith('23.03.7')) {
      this._features['quota-scope'] = true;
    }
    if (this.isManagerVersionCompatibleWith('23.03.11')) {
      this._features['model-serving'] = true;
    }
    if (this.isManagerVersionCompatibleWith('23.09.0')) {
      this._features['sudo-session-enabled'] = true;
    }
    if (this.isManagerVersionCompatibleWith('23.09.2')) {
      this._features['max-quota-scope-size-in-user-and-project-resource-policy'] = true;
      this._features['deprecated-max-vfolder-size-in-user-and-project-resource-policy'] = true;
      this._features['max-quota-scope-size'] = true;
    }
    if (this.isManagerVersionCompatibleWith('23.09.4')) {
      this._features['deprecated-max-vfolder-count-in-keypair-resource-policy'] = true;
      this._features['deprecated-max-vfolder-size-in-keypair-resource-policy'] = true;
      this._features['use-win-instead-of-win32'] = true;
    }
    if (this.isManagerVersionCompatibleWith('23.09.6')) {
      this._features['max-vfolder-count-in-user-and-project-resource-policy'] = true;
      this._features['deprecated-max-quota-scope-in-keypair-resource-policy'] = true;
    }
    if (this.isManagerVersionCompatibleWith('23.09.7')) {
      this._features['main-access-key'] = true;
    }
    if (this.isManagerVersionCompatibleWith('23.09.8')) {
      this._features['model-serving-endpoint-user-info'] = true;
    }
    if (this.isManagerVersionCompatibleWith('23.09.9')) {
      this._features['modify-endpoint'] = true;
    }
    if (this.isManagerVersionCompatibleWith('23.09.10')) {
      this._features['max-session-count-per-model-session'] = true;
      // In versions 23.09.10 and earlier, it is not suitable to create and modify user resource policies.
      this._features['configure-user-resource-policy'] = true;
    }
    if (this.isManagerVersionCompatibleWith('24.03.0')) {
      this._features['vfolder-trash-bin'] = true;
      this._features['model-store'] = true;
      this._features['per-user-image'] = true;
      this._features['user-committed-image'] = true;
      this._features['model-service-validation'] = true;
      this._features['max-customized-image-count'] = true;
    }
    if (this.isManagerVersionCompatibleWith('24.03.4')) {
      this._features['endpoint-extra-mounts'] = true;
      // Incorrect version annotation in the schema.
      // ref: https://github.com/lablup/backend.ai/issues/3413
      // ---------------------- START ----------------------
      this._features['max-pending-session-count'] = true;
      this._features['max-concurrent-sftp-sessions'] = true;
      // ---------------------- END ------------------------
      this._features['max-pending-session-resource-slots'] = true;
    }
    if (this.isManagerVersionCompatibleWith('24.03.5')) {
      this._features['modify-endpoint-environ'] = true;
      this._features['endpoint-runtime-variant'] = true;
    }
    if (this.isManagerVersionCompatibleWith('24.03.7')) {
      this._features['per-kernel-logs'] = true;
    }
    // ignore next alpha version
    if(this.isManagerVersionCompatibleWith(['24.03.10'])) {
      this._features['endpoint-lifecycle-stage-filter'] = true;
    }
    if (this.isManagerVersionCompatibleWith('24.09')) {
      this._features['extend-login-session'] = true;
      this._features['session-node'] = true;
      this._features['idle-checks-gql'] = true;
    }
    if (this.isManagerVersionCompatibleWith('24.09')) {
      this._features['extend-login-session'] = true;
      this._features['session-node'] = true;
      this._features['idle-checks-gql'] = true;
    }
    if (this.isManagerVersionCompatibleWith('24.09.1')) {
      this._features['agent-select'] = true;
    }
    if (this.isManagerVersionCompatibleWith('24.09.3')) {
      this._features['extra-field'] = true;
    }
    if (this.isManagerVersionCompatibleWith('24.12.0')) {
      this._features['extended-image-info'] = true;
      this._features['batch-timeout'] = true;
      this._features['prepared-session-status'] = true;
      this._features['creating-session-status'] = true;
      this._features['max_network_count'] = true;
      this._features['replicas'] = true;
      this._features['base-image-name'] = true;
    }
    if (this.isManagerVersionCompatibleWith(['25.1.0', '24.09.6', '24.03.12'])) {
      this._features['vfolder-id-based'] = true;
    }
    if (this.isManagerVersionCompatibleWith(['25.3.0', '24.09.8'])) {
      this._features['vfolder-mounts'] = true;
    }
    if (this.isManagerVersionCompatibleWith('25.4.0')) {
      this._features['resource-presets-per-resource-group'] = true;
      this._features['vfolder_nodes_in_session_node'] = true;
    }
    if (this.isManagerVersionCompatibleWith('25.5.0')) {
      this._features['custom-accelerator-quantum-size'] = true;
    }
    if (this.isManagerVersionCompatibleWith('25.6.0')) {
      this._features['user-metrics'] = true;
      this._features['invitation-inviter-email'] = true;
    }
    if (this.isManagerVersionCompatibleWith('25.1.0')) {
      this._features['image_rescan_by_project'] = true
      this._features['auto-scaling-rule'] = true;
    }
    if (this.isManagerVersionCompatibleWith('25.10.0')) {
      this._features['purge_image_by_id'] = true;
    }
    if (this.isManagerVersionCompatibleWith('25.12.0')) {
      this._features['mount-by-id'] = true;
    }
    if (this.isManagerVersionCompatibleWith('25.13.0')) {
      this._features['pending-session-list'] = true;
    }
    if (this.isManagerVersionCompatibleWith('25.12.0')) {
      this._features['reservoir'] = true;
    }
  }

  /**
   * Return if manager is compatible with given version.
   */
  isManagerVersionCompatibleWith(version: string | Array<string>) {
    let managerVersion = this._managerVersion;
    if(Array.isArray(version)){
      return isCompatibleMultipleConditions(managerVersion, version);
    } else {
      return comparePEP440Versions(managerVersion, version) >= 0;
    }
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
   * Return if manager supports OTP / 2FA.
   */
  async isManagerSupportingTOTP() {
    let rqst = this.newSignedRequest('GET', `/totp`, null, null);
    try {
      await this._wrapWithPromise(rqst);
      return Promise.resolve(true);
    } catch (e) {
      return Promise.resolve(false);
    }
  }

  /**
   * Check if webserver is authenticated. This requires additional webserver package.
   *
   */
  async check_login() {
    let rqst = this.newSignedRequest('POST', `/server/login-check`, null, null);
    let result;
    try {
      result = await this._wrapWithPromise(rqst);
      if (result.authenticated === true) {
        this._config._accessKey = result.data.access_key;
        this._config._session_id = result.session_id; // TODO: change to X-BackendAI-SessionID header-version. use this._loginSessionId instead.
        //console.log("login succeed");
      } else {
        //console.log("login failed");
      }
    } catch (err) {
      console.log(err);
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
    let rqst = this.newSignedRequest('POST', `/server/login`, body, '', true);
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
          await this.logout();
          return Promise.resolve({
            fail_reason: 'Monitor user does not allow to login.',
          });
        }
        await this.get_manager_version();
        if (this._loginSessionId !== null && this._loginSessionId !== '') {
          localStorage.setItem(
            'backendaiwebui.sessionid',
            this._loginSessionId,
          );
        }
        return this.check_login();
      } else if (result.authenticated === false) {
        // Authentication failed.
        localStorage.removeItem('backendaiwebui.sessionid');
        if (result.data && result.data.details) {
          return Promise.resolve({fail_reason: result.data.details, data: result.data });
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
    let rqst = this.newSignedRequest('POST', `/server/logout`, body, null);
    // clean up log msg for security reason
    const currentLogs = localStorage.getItem('backendaiwebui.logs');
    if (currentLogs) {
      localStorage.removeItem('backendaiwebui.logs');
    }
    localStorage.removeItem('backendaiwebui.sessionid');
    return this._wrapWithPromise(rqst);
  }

  /**
   * Login into webserver with auth cookie token. This requires additional webserver package.
   *
   */
  async token_login(token: string, extraParams: object = {}): Promise<any> {
    const body = token ? { sToken: token } : {};
    if (extraParams) {
      Object.assign(body, extraParams);
    }
    const rqst = this.newSignedRequest(
      'POST',
      `/server/token-login`,
      body,
      null,
    );
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
  async signout(userid, password): Promise<any> {
    let body = {
      username: userid,
      password: password,
    };
    let rqst = this.newSignedRequest('POST', `/auth/signout`, body, null);
    return this._wrapWithPromise(rqst);
  }

  /**
   * Update user's full_name.
   */
  async update_full_name(email, fullName): Promise<any> {
    let body = {
      email: email,
      full_name: fullName,
    };
    let rqst = this.newSignedRequest(
      'POST',
      `/auth/update-full-name`,
      body,
      null,
    );
    return this._wrapWithPromise(rqst);
  }

  /**
   * Update user's password.
   *
   */
  async update_password(oldPassword, newPassword, newPassword2): Promise<any> {
    let body = {
      old_password: oldPassword,
      new_password: newPassword,
      new_password2: newPassword2,
    };
    let rqst = this.newSignedRequest(
      'POST',
      `/auth/update-password`,
      body,
      '',
      true,
    );
    return this._wrapWithPromise(rqst);
  }

  async initialize_totp(): Promise<any> {
    let rqst = this.newSignedRequest('POST', '/totp', {}, null);
    return this._wrapWithPromise(rqst);
  }

  async initialize_totp_anon({
    registration_token,
  }): Promise<any> {
    let rqst = this.newSignedRequest('POST', '/totp/anon', {
      registration_token
    }, null);
    return this._wrapWithPromise(rqst);
  }

  async activate_totp(otp): Promise<any> {
    let rqst = this.newSignedRequest('POST', '/totp/verify', { otp }, null);
    return this._wrapWithPromise(rqst);
  }
  async activate_totp_anon({
    otp,
    registration_token,
  }): Promise<any> {
    let rqst = this.newSignedRequest('POST', '/totp/anon/verify', { otp, registration_token }, null);
    return this._wrapWithPromise(rqst);
  }

  async remove_totp(email = null): Promise<any> {
    let rqstUrl = '/totp';
    if (email) {
      const params = { email: email };
      const q = new URLSearchParams(params).toString();
      rqstUrl += `?${q}`;
    }
    let rqst = this.newSignedRequest('DELETE', rqstUrl, {}, null);
    return this._wrapWithPromise(rqst);
  }

  /**
   * Return the resource slots.
   */
  async get_resource_slots(): Promise<any> {
    const rqst = this.newSignedRequest('GET', '/config/resource-slots', null, '');
    return this._wrapWithPromise(rqst);
  }

  /**
   * Create a `compute session` if the session for the given sessionId does not exist.
   * It returns the information for the existing session otherwise, without error.
   *
   * @param {string} kernelType - the kernel type (usually language runtimes)
   * @param {string} sessionId - user-defined session ID
   * @param {object} resources - Per-session resource
   * @param {number} timeout - Timeout of request. Default : default fetch value. (5sec.)
   * @param {string} architecture - image architecture
   */
  async createIfNotExists(
    kernelType: string,
    sessionId: string,
    resources: SessionResources = {
      type: 'interactive',
      cluster_mode: 'single-node',
      cluster_size: 1,
      maxWaitSeconds: 0,
    },
    timeout?: number,
    architecture: string = 'x86_64',
  ) {
    if (
      typeof sessionId === 'undefined' ||
      sessionId === null ||
      sessionId === ''
    ) {
      sessionId = this.generateSessionId();
    }
    const params = {
      lang: kernelType,
      clientSessionToken: sessionId,
      architecture: architecture,
      ...resources
    };
    let rqst;
    if (this._apiVersionMajor < 5) {
      // For V3/V4 API compatibility
      rqst = this.newSignedRequest(
        'POST',
        `${this.kernelPrefix}/create`,
        params,
        null,
      );
    } else {
      rqst = this.newSignedRequest(
        'POST',
        `${this.kernelPrefix}`,
        params,
        null,
      );
    }
    //return this._wrapWithPromise(rqst);
    return this._wrapWithPromise(rqst, false, null, timeout);
  }

  /**
   * Create a session with a session template.
   *
   * @param {string} templateId - The templateId to create
   * @param {string} image - Image name to create container
   * @param {undefined | string | null} sessionName - Session name to create
   * @param {object} resources - Resources to use for session
   * @param {number} timeout - Timeout to cancel creation
   */
  async createSessionFromTemplate(
    templateId,
    image = null,
    sessionName: undefined | string | null = null,
    resources = {},
    timeout: number = 0,
  ) {
    if (typeof sessionName === 'undefined' || sessionName === null) {
      sessionName = this.generateSessionId();
    }
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
      null,
    );
    return this._wrapWithPromise(rqst, false, null, timeout);
  }

  /**
   * Obtain the session information by given sessionId.
   *
   * @param {string} sessionId - the sessionId given when created
   * @param {string | null} ownerKey - Owner API key to create
   */
  async get_info(sessionId, ownerKey = null): Promise<any> {
    let queryString = `${this.kernelPrefix}/${sessionId}`;
    if (ownerKey != null) {
      queryString = `${queryString}?${new URLSearchParams({ owner_access_key: ownerKey}).toString()}`;
    }
    let rqst = this.newSignedRequest('GET', queryString, null, null);
    return this._wrapWithPromise(rqst);
  }

  /**
   * Get the IP or URL that use to access publicly
   *
   * @param {string} sessionId - the sessionId given when created
   */
  async get_direct_access_info(sessionId): Promise<any> {
    let queryString = `${this.kernelPrefix}/${sessionId}/direct-access-info`;
    let rqst = this.newSignedRequest('GET', queryString, null, null);
    return this._wrapWithPromise(rqst);
  }

  /**
   * Obtain the session container logs by given sessionId.
   *
   * @param {string} sessionId - the sessionId given when created
   * @param {string | null} ownerKey - owner key to access
   * @param {number} timeout - timeout to wait log query. Set to 0 to use default value.
   */
  async get_logs(sessionId, ownerKey = null, kernelId = null, timeout = 0): Promise<any> {
    const queryParams = new URLSearchParams()
    // let queryParams: Array<string> = [];
    if (ownerKey != null) {
      queryParams.append('owner_access_key', ownerKey);
    }
    if (kernelId !== null) {
      queryParams.append('kernel_id', kernelId);
    }
    let queryString = `${this.kernelPrefix}/${sessionId}/logs`;
    if (queryParams.size > 0) {
      queryString += `?${queryParams.toString()}`;
    }
    let rqst = this.newSignedRequest('GET', queryString, null, null);
    return this._wrapWithPromise(rqst, false, null, timeout);
  }

  /**
   * Obtain the batch session (task) logs by given sessionId.
   *
   * @param {string} sessionId - the sessionId given when created
   */
  getTaskLogs(sessionId): Promise<any> {
    const queryString = `${this.kernelPrefix}/_/logs?${new URLSearchParams({session_name: sessionId}).toString()}`;
    let rqst = this.newSignedRequest('GET', queryString, null, null);
    return this._wrapWithPromise(rqst);
  }

  /**
   * Terminate and destroy the kernel session.
   *
   * @param {string} sessionId - the sessionId given when created
   * @param {string|null} ownerKey - owner key when terminating other users' session
   * @param {boolean} forced - force destroy session. Requires admin privilege.
   */
  async destroy(
    sessionId,
    ownerKey = null,
    forced: boolean = false,
  ): Promise<any> {
    let queryString = `${this.kernelPrefix}/${sessionId}`;
    if (ownerKey !== null) {
      queryString = `${queryString}?${new URLSearchParams({owner_access_key: ownerKey, ...(forced ? {forced: 'true'} : {})}).toString()}`;
    } else {
      queryString = `${queryString}?${new URLSearchParams({ ...(forced ? {forced: 'true'} : {})}).toString()}`;
    }
    let rqst = this.newSignedRequest('DELETE', queryString, null, null);
    return this._wrapWithPromise(rqst, false, null, 15000, 2); // 15 sec., two trial when error occurred.
  }

  /**
   * Restart the kernel session keeping its work directory and volume mounts.
   *
   * @param {string} sessionId - the sessionId given when created
   * @param {string | null} ownerKey - Owner API key to restart
   */
  async restart(sessionId, ownerKey = null): Promise<any> {
    let queryString = `${this.kernelPrefix}/${sessionId}`;
    if (ownerKey != null) {
      queryString = `${queryString}?${new URLSearchParams({owner_access_key: ownerKey}).toString()}`;
    }
    let rqst = this.newSignedRequest('PATCH', queryString, null, null);
    return this._wrapWithPromise(rqst);
  }

  // TODO: interrupt

  // TODO: auto-complete

  /**
   * Execute a code snippet or schedule batch-mode executions.
   *
   * @param {string} sessionId - the sessionId given when created
   * @param {string} runId - a random ID to distinguish each continuation until finish (the length must be between 8 and 64 bytes inclusively)
   * @param {string} mode - either "query", "batch", "input", or "continue"
   * @param {string} code - code snippet to execute
   * @param {object} opts - an optional object specifying additional configs such as batch-mode build/exec commands
   * @param {number} timeout - time limit until the execution starts.
   */
  async execute(
    sessionId: string,
    runId: string,
    mode: string,
    code: string,
    opts: Object,
    timeout = 0,
  ): Promise<any> {
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
      null,
    );
    return this._wrapWithPromise(rqst, false, null, timeout);
  }

  // legacy aliases (DO NOT USE for new codes)
  createKernel(
    kernelType,
    sessionId: string = '',
    resources = {},
    timeout = 0,
  ): Promise<any> {
    return this.createIfNotExists(
      kernelType,
      sessionId,
      resources,
      timeout,
      'x86_64',
    );
  }

  // legacy aliases (DO NOT USE for new codes)
  destroyKernel(sessionId, ownerKey = null): Promise<any> {
    return this.destroy(sessionId, ownerKey);
  }

  // legacy aliases (DO NOT USE for new codes)
  refreshKernel(sessionId, ownerKey = null): Promise<any> {
    return this.restart(sessionId, ownerKey);
  }

  // legacy aliases (DO NOT USE for new codes)
  runCode(code, sessionId, runId, mode): Promise<any> {
    return this.execute(sessionId, runId, mode, code, {});
  }

  /**
   * Rename session to another name.
   *
   * @param {string} sessionId - current session name
   * @param {string} newId - new session name
   */
  async rename(sessionId: string, newId: string): Promise<any> {
    let params = {
      name: newId,
    };
    let rqst = this.newSignedRequest(
      'POST',
      `${this.kernelPrefix}/${sessionId}/rename`,
      params,
      null,
    );
    return this._wrapWithPromise(rqst);
  }

  /**
   * Terminate and destroy the service.
   *
   * @param {string} sessionId - the sessionId that contains service
   * @param {string} service_name - service name to shut down
   */
  async shutdown_service(
    sessionId: string,
    service_name: string,
  ): Promise<any> {
    let params = {
      service_name: service_name,
    };
    const q = new URLSearchParams(params).toString();
    let rqst = this.newSignedRequest(
      'POST',
      `${this.kernelPrefix}/${sessionId}/shutdown-service?${q}`,
      null,
      null,
    );
    return this._wrapWithPromise(rqst, true);
  }

  async upload(sessionId: string, path, fs): Promise<any> {
    const formData = new FormData();
    //formData.append('src', fs, {filepath: path});
    formData.append('src', fs, path);
    let rqst = this.newSignedRequest(
      'POST',
      `${this.kernelPrefix}/${sessionId}/upload`,
      formData,
      null,
    );
    return this._wrapWithPromise(rqst);
  }

  async download(sessionId: string, files): Promise<any> {
    let params = {
      files: files,
    };
    const q = new URLSearchParams(params).toString();
    let rqst = this.newSignedRequest(
      'POST',
      `${this.kernelPrefix}/${sessionId}/download?${q}`,
      null,
      null,
    );
    return this._wrapWithPromise(rqst, true);
  }

  async download_single(sessionId, file) {
    let params = {
      file: file,
    };
    const q = new URLSearchParams(params).toString();
    let rqst = this.newSignedRequest(
      'POST',
      `${this.kernelPrefix}/${sessionId}/download_single?${q}`,
      null,
      null,
    );
    return this._wrapWithPromise(rqst, true);
  }

  mangleUserAgentSignature() {
    // TODO: remove the commented implementation
    /* let uaSig = this.clientVersion
      + (this.agentSignature ? ('; ' + this.agentSignature) : '');
    return uaSig;*/
    return (
      this.clientVersion +
      (this.agentSignature ? '; ' + this.agentSignature : '')
    );
  }

  /**
   * Send GraphQL requests
   *
   * @param {string} q - query string for GraphQL
   * @param {string} v - variable string for GraphQL
   * @param {AbortSignal} signal - signal to abort current request
   * @param {number} timeout - Timeout to force terminate request
   * @param {number} retry - The number of retry when request is failed
   * @param {number} secure - Decide to encode the payload or not
   */
  async query(
    q,
    v,
    signal = null,
    timeout: number = 0,
    retry: number = 0,
    secure: boolean = false,
  ) {
    let query = {
      query: q,
      variables: v,
    };
    let rqst = this.newSignedRequest(
      'POST',
      `/admin/gql`,
      query,
      null,
      secure,
    );
    return this._wrapWithPromise(rqst, false, signal, timeout, retry).then(r => r.data);
  }

  /**
   * Generate a RequestInfo object that can be passed to fetch() API,
   * which includes a properly signed header with the configured auth information.
   *
   * @param {string} method - the HTTP method
   * @param {string} queryString - the URI path and GET parameters
   * @param {any} body - an object that will be encoded as JSON in the request body
   * @param {string | null} serviceName - serviceName for sending up requests to other services
   * @param {boolean} secure - encrypt payload if secure is true.
   */
  newSignedRequest(
    method: string,
    queryString,
    body: any = undefined,
    serviceName: string | null = null,
    secure: boolean = false,
  ) {
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
    let uri: string;
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
      uri = this._config.endpoint + `/${serviceName}` + queryString;
      hdrs = new Headers({
        Accept: content_type,
        // "Allow-Control-Allow-Origin": "*"
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
        hdrs.set('Content-Length', new TextEncoder().encode(authBody).length);
      }
    } else {
      hdrs.set('Content-Type', content_type);
    }
    // Add secure tag if payload is encoded.
    if (secure) {
      if (typeof requestBody == 'string') {
        hdrs.set('X-BackendAI-Encoded', 'true');
        requestBody = this.getEncodedPayload(requestBody);
      }
    }
    // Add session id header for non-cookie environment.
    if (this._loginSessionId !== '') {
      hdrs.set('X-BackendAI-SessionID', this._loginSessionId);
    }
    return {
      method: method,
      headers: hdrs as Headers,
      cache: 'default' as RequestCache,
      body: requestBody,
      uri: uri as string,
    };
    // return requestInfo;
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

  /**
   * Crate new Public request.
   * Use this for authorized public APIs.
   *
   * @param {string} method - the HTTP method
   * @param {string} queryString - the URI path and GET parameters
   * @param {any} body - an object that will be encoded as JSON in the request body
   * @param {string} urlPrefix - prefix to bind at the beginning of URL
   */
  newPublicRequest(
    method: string,
    queryString: string,
    body: any,
    urlPrefix = '',
  ) {
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
      headers: hdrs as Headers,
      mode: 'cors' as RequestMode,
      cache: 'default' as RequestCache,
      uri: '',
    };
    if (
      this._config.connectionMode === 'SESSION' &&
      queryString.startsWith('/server')
    ) {
      // Force request to use Public when session mode is enabled
      requestInfo.uri = this._config.endpoint + queryString;
    } else if (
      this._config.connectionMode === 'SESSION' &&
      !queryString.startsWith('/server')
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
  ): string {
    let bodyHash = CryptoES.SHA256(bodyValue);
    // let bodyHash = crypto.createHash(this._config.hashType)
    //  .update(bodyValue).digest('hex');
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

  getCurrentDate(now): string {
    let year = `0000${now.getUTCFullYear()}`.slice(-4);
    let month = `0${now.getUTCMonth() + 1}`.slice(-2);
    let day = `0${now.getUTCDate()}`.slice(-2);
    return year + month + day;
  }

  getEncodedPayload(body): string {
    let iv = this.generateRandomStr(16);
    //let key = (btoa(this._config.endpoint) + iv + iv).substring(0,32); // btoa is deprecated. Now monitoring toString.
    let key = (
      this._getBase64FromString(this._config.endpoint) +
      iv +
      iv
    ).substring(0, 32);
    let result = CryptoES.AES.encrypt(body, CryptoES.enc.Utf8.parse(key), {
      iv: CryptoES.enc.Utf8.parse(iv),
      padding: CryptoES.pad.Pkcs7,
      mode: CryptoES.mode.CBC,
    });
    return iv + ':' + result.toString();
  }

  _getBase64FromString(str: string): string {
    const charset =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let strBytes: number[] = [];
    for (let i = 0; i < str.length; i++) {
      strBytes.push(str.charCodeAt(i));
    }
    let strBase64 = '';
    let i = 0;
    while (i < strBytes.length) {
      const byte1 = strBytes[i++];
      const byte2 = i < strBytes.length ? strBytes[i++] : -1;
      const byte3 = i < strBytes.length ? strBytes[i++] : -1;
      const triplet =
        (byte1 << 16) +
        ((byte2 != -1 ? byte2 : 0) << 8) +
        (byte3 != -1 ? byte3 : 0);
      strBase64 +=
        charset.charAt((triplet >> 18) & 0x3f) +
        charset.charAt((triplet >> 12) & 0x3f) +
        charset.charAt(byte2 != -1 ? (triplet >> 6) & 0x3f : 64) +
        charset.charAt(byte3 != -1 ? triplet & 0x3f : 64);
    }
    return strBase64;
  }

  sign(key, key_encoding, msg, digest_type) {
    const hashDigest = CryptoES.enc.Utf8.parse(msg);
    let hmacDigest;
    if (key_encoding == 'utf8') {
      key = CryptoES.enc.Utf8.parse(key);
    } else if (key_encoding == 'binary') {
      key = CryptoES.enc.Hex.parse(key);
    } else {
      key = CryptoES.enc.Utf8.parse(key);
    }
    if (['binary', 'hex'].includes(digest_type)) {
      hmacDigest = CryptoES.enc.Hex.stringify(
        CryptoES.HmacSHA256(hashDigest, key),
      );
    } else {
      hmacDigest = CryptoES.enc.Base64.stringify(
        CryptoES.HmacSHA256(hashDigest, key),
      );
    }
    return hmacDigest;
    /*let kbuf = new Buffer(key, key_encoding);
    let hmac = crypto.createHmac(this._config.hashType, kbuf);
    hmac.update(msg, 'utf8');
    return hmac.digest(digest_type);*/
  }

  getSignKey(secret_key, now) {
    let k1 = this.sign(secret_key, 'utf8', this.getCurrentDate(now), 'binary');
    return this.sign(k1, 'binary', this._config.endpointHost, 'binary');
  }

  generateRandomStr(length) {
    let text = '';
    const possible =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  generateSessionId(length = 8, nosuffix = false) {
    let text = this.generateRandomStr(length);
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
      .replace(/--+/g, '-') // Replace multiple - with single -
      .replace(/^-+/, '') // Trim - from start of text
      .replace(/-+$/, ''); // Trim - from end of text
  }

  /**
   * fetch existing public key of SSH Keypair from container
   * only ssh_public_key will be received.
   */
  async fetchSSHKeypair(): Promise<any> {
    let rqst = this.newSignedRequest('GET', '/auth/ssh-keypair', null, null);
    return this._wrapWithPromise(rqst, false);
  }

  /**
   * refresh SSH Keypair from container
   * gets randomly generated keypair (both ssh_public_key and ssh_private_key) will be received.
   */
  async refreshSSHKeypair(): Promise<any> {
    let rqst = this.newSignedRequest('PATCH', '/auth/ssh-keypair', null, null);
    return this._wrapWithPromise(rqst, false);
  }

  /**
   * post SSH Keypair to container
   * save the given keypair (both ssh_public_key and ssh_private_key)
   */
  async postSSHKeypair(param): Promise<any> {
    let rqst = this.newSignedRequest('POST', '/auth/ssh-keypair', param, null);
    return this._wrapWithPromise(rqst, false);
  }

  // TODO: move attach_background_task function in Maintenance Class to here.
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
  async list(param = null): Promise<any> {
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
  async check(param = null): Promise<any> {
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
  async add(name = null, input): Promise<any> {
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
  async mutate(name = null, input): Promise<any> {
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
  async delete(name = null): Promise<any> {
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
  public id: any;
  public urlPrefix: any;

  /**
   * The Virtual Folder API wrapper.
   *
   * @param {Client} client - the Client API wrapper object to bind
   * @param {string} name - Virtual folder name.
   */
  constructor(client, name = null, id = null) {
    this.client = client;
    this.name = name;
    this.id = id;
    this.urlPrefix = '/folders';
  }

  /**
   * Get allowed types of folders
   *
   */
  async list_allowed_types(): Promise<any> {
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
  ): Promise<any> {
    let body;
    if (host !== '') {
      body = {
        name: name,
        host: host,
      };
    }
    if (group !== '') {
      body = {
        name: name,
        host: host,
        group: group,
      };
    }
    if (usageMode) {
      body['usage_mode'] = usageMode;
    }
    if (permission) {
      body['permission'] = permission;
    }
    body['cloneable'] = cloneable;
    let rqst = this.client.newSignedRequest('POST', `${this.urlPrefix}`, body);
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Clone selected Virtual folder
   *
   * @param {json} input - parameters for cloning Vfolder
   * @param {boolean} input.cloneable - whether new cloned Vfolder is cloneable or not
   * @param {string} input.permission - permission for new cloned Vfolder. permission should one of the following: 'ro', 'rw'
   * @param {string} input.target_host - target_host for new cloned Vfolder
   * @param {string} input.target_name - name for new cloned Vfolder
   * @param {string} input.usage_mode - Cloned virtual folder's purpose of use. Can be "general" (normal folders), "data" (data storage), and "model" (pre-trained model storage).
   * @param name - source Vfolder name
   */

  async clone(input, name = null): Promise<any> {
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
   * @param {string} input.permission - permission for Vfolder. permission should one of the following: 'ro', 'rw'
   * @param name - source Vfolder name
   */
  async update_folder(input, name = null): Promise<any> {
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
  async list(groupId = null, userEmail = null): Promise<any> {
    let reqUrl = this.urlPrefix;
    let params = {};
    if (groupId) {
      params['group_id'] = groupId;
    }
    if (userEmail) {
      params['owner_user_email'] = userEmail;
    }
    const q = new URLSearchParams(params).toString();
    reqUrl += `?${q}`;
    let rqst = this.client.newSignedRequest('GET', reqUrl, null);
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * List Virtual folder hosts that requested accessKey has permission to.
   *
   * @param {string} groupId - project(group) id
   */
  async list_hosts(groupId = null): Promise<any> {
    let reqUrl = `${this.urlPrefix}/_/hosts`;
    let params = {};
    if (groupId) {
      params['group_id'] = groupId;
    }
    const q = new URLSearchParams(params).toString();
    reqUrl += `?${q}`;
    let rqst = this.client.newSignedRequest('GET', reqUrl, null);
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * List all storage hosts connected to storage-proxy server
   */
  async list_all_hosts(): Promise<any> {
    if (this.client.is_superadmin === true) {
      let reqUrl = `${this.urlPrefix}/_/all-hosts`;
      let rqst = this.client.newSignedRequest('GET', reqUrl, null);
      return this.client._wrapWithPromise(rqst);
    }
  }

  /**
   * Information about specific virtual folder.
   */
  async info(name = null): Promise<any> {
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
   * @param {string} vfolder_id - Virtual folder id.
   */
  async rename(new_name = null, vfolder_id = null): Promise<any> {
    const body = { new_name };
    const vfolder = vfolder_id ? vfolder_id : this.client.supports('vfolder-id-based') ? this.id : this.name;
    let rqst = this.client.newSignedRequest(
      'POST',
      `${this.urlPrefix}/${vfolder}/rename`,
      body,
    );
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Delete a Virtual folder.
   *
   * @param {string} name - Virtual folder name. If no name is given, use name on this VFolder object.
   */
  async delete(name = null): Promise<any> {
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
   * Delete a Virtual folder by id.
   *
   * @param {string} id - Virtual folder id.
   */
  async delete_by_id(id): Promise<any> {
    let body = {
      vfolder_id: id,
    };
    let rqst = this.client.newSignedRequest(
      'DELETE',
      `${this.urlPrefix}`,
      body,
    );
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Leave an invited Virtual folder.
   *
   * @param {string} name - Virtual folder name. If no name is given, use name on this VFolder object.
   */
  async leave_invited(name = null): Promise<any> {
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
  async upload(path, fs, name = null): Promise<any> {
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
  async uploadFormData(fss, name = null): Promise<any> {
    let rqst = this.client.newSignedRequest(
      'POST',
      `${this.urlPrefix}/${name}/upload`,
      fss,
    );
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Create an upload session for a file to Virtual folder.
   *
   * @param {string} path - Path to upload.
   * @param {string} fs - File object to upload.
   * @param {string} name - Virtual folder name.
   */
  async create_upload_session(path, fs, name = null): Promise<any> {
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
      tusUrl = `${res.url}?${new URLSearchParams({token}).toString()}`;
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
  async mkdir(
    path,
    name = null,
    parents = null,
    exist_ok = null,
  ): Promise<any> {
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
   * @param {string} is_dir - True when the object is directory, false when the object is file.
   */
  async rename_file(
    target_path,
    new_name,
    name = null,
    is_dir = false,
  ): Promise<any> {
    if (name == null) {
      name = this.name;
    }
    const body = { target_path, new_name, is_dir };
    const rqst = this.client.newSignedRequest(
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
  async delete_files(files, recursive = false, name = null): Promise<any> {
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
      this.client._managerVersion >= '24.03.7' ? 'POST' : 'DELETE',
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
  async download(
    file,
    name = false,
    archive = false,
    noCache = false,
  ): Promise<any> {
    const params = { file: file, archive: archive ? 'true' : 'false' };
    const q = new URLSearchParams(params).toString();
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
      })}`;
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
  async request_download_token(
    file,
    name = false,
    archive = false,
  ): Promise<any> {
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
  async download_with_token(token: string = ''): Promise<any> {
    let params = {
      token: token,
    };
    let q = new URLSearchParams(params).toString();
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
  get_download_url_with_token(token: string = ''): string {
    const params = { token };
    let q = new URLSearchParams(params).toString();
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
  async list_files(path, name = null): Promise<any> {
    if (name == null) {
      name = this.name;
    }
    let params = {
      path: path,
    };
    let q = new URLSearchParams(params).toString();
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
  async invite(perm, emails, name = null): Promise<any> {
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
  async invitations(): Promise<any> {
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
  async accept_invitation(inv_id): Promise<any> {
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
  async delete_invitation(inv_id): Promise<any> {
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
  async list_invitees(vfolder_id = null): Promise<any> {
    let queryString = '/folders/_/shared';
    if (vfolder_id !== null)
      queryString = `${queryString}?${new URLSearchParams({vfolder_id: vfolder_id}).toString()}`;
    let rqst = this.client.newSignedRequest('GET', queryString, null);
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Modify an invitee's permission to a shared vfolder
   *
   * @param {json} input - parameters for permission modification
   * @param {string} input.perm - invitee's new permission. permission should one of the following: 'ro', 'rw'
   * @param {string} input.user - invitee's uuid
   * @param {string} input.vfolder - id of the vfolder that has been shared to the invitee
   */
  async modify_invitee_permission(input): Promise<any> {
    let rqst = this.client.newSignedRequest('POST', '/folders/_/shared', input);
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Share specific users a group-type virtual folder with overriding permission.
   *
   * @param {string} permission - Permission to give to. `rw` or `ro`.
   * @param {array} emails - User E-mail(s) to share.
   * @param {string} name - A group virtual folder name to share.
   */
  async share(permission, emails, name = null): Promise<any> {
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
  async unshare(emails, name = null): Promise<any> {
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
  async get_quota(host, vfolder_id): Promise<any> {
    const params = { folder_host: host, id: vfolder_id };
    let q = new URLSearchParams(params).toString();
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
  async set_quota(host, vfolder_id, quota): Promise<any> {
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

  /**
   * Restore vfolder from trash bin, by changing status.
   * 
   * @param {string} vfolder_id - id of the vfolder.
   */
  async restore_from_trash_bin(vfolder_id): Promise<any> {
    const body = {vfolder_id};
    let rqst = this.client.newSignedRequest(
      'POST',
      `${this.urlPrefix}/restore-from-trash-bin`,
      body,
    );
    return this.client._wrapWithPromise(rqst);
  }


  /**
   * Delete `delete-pending` vfolders in storage proxy
   *
   * @param {string} vfolder_id - id of the vfolder.
   */
  async delete_from_trash_bin(vfolder_id): Promise<any> {
    const body = {vfolder_id};
    let rqst = this.client.newSignedRequest(
      'POST',
      `${this.urlPrefix}/delete-from-trash-bin`,
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
   * @param {string} status - Status to query. Should be one of 'ALIVE', 'PREPARING', 'TERMINATING' and 'TERMINATED'.
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
  ): Promise<any> {
    if (!['ALIVE', 'TERMINATED'].includes(status)) {
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
   * @param {string | null} id - resource preset name.
   * @param {json} input - resource preset specification and data. Required fields are:
   * {
   *   'schedulable': schedulable
   * };
   */
  async update(id = null, input): Promise<any> {
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

class AgentSummary {
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
   * List of agent summary.
   *
   * @param {string} status - Status to query. Should be one of 'ALIVE', 'PREPARING', 'TERMINATING' and 'TERMINATED'.
   * @param {array} fields - Fields to query. Queryable fields are:  id, status, scaling_group, schedulable, schedulable, available_slots, occupied_slots.
   * @param {number} limit - limit number of query items.
   * @param {number} offset - offset for item query. Useful for pagination.
   * @param {number} timeout - timeout for the request. Default uses SDK default. (5 sec.)
   */
  async list(
    status = 'ALIVE',
    fields = [
      'id',
      'status',
      'scaling_group',
      'schedulable',
      'available_slots',
      'occupied_slots',
      'architecture',
    ],
    limit = 20,
    offset = 0,
    timeout: number = 0,
  ): Promise<any> {
    let f = fields.join(' ');
    if (!['ALIVE', 'TERMINATED'].includes(status)) {
      return Promise.resolve(false);
    }
    let q = `query($limit:Int!, $offset:Int!, $status:String) {
        agent_summary_list(limit:$limit, offset:$offset, status:$status) {
           items { ${f} }
           total_count
        }
      }`;
    let v = {
      limit: limit,
      offset: offset,
      status: status,
    };
    return this.client.query(q, v, null, timeout);
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
  ): Promise<any> {
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
   * @param {array} fields - Fields to query. Queryable fields are:  'id', 'backend', 'fsprefix', 'capabilities'.
   */
  async detail(
    host: string = '',
    fields = ['id', 'backend', 'path', 'fsprefix', 'capabilities'],
  ): Promise<any> {
    let q =
      `query($vfolder_host: String!) {` +
      `  storage_volume(id: $vfolder_host) {` +
      `     ${fields.join(' ')}` +
      `  }` +
      `}`;
    let v = { vfolder_host: host };
    return this.client.query(q, v);
  }

  async getAllPermissions(): Promise<any> {
      const rqst = this.client.newSignedRequest('GET', `/acl`, null);
      return this.client._wrapWithPromise(rqst);
  }

  /**
   * Get all fields related to allowed_vfolder_hosts according to the current user information
   *
   * @param {string} domainName
   * @param {string} projectId
   * @param {string} resourcePolicyName
   * @returns {object} - get allowed_vfolder_hosts key-value on domain, group, resource policy of current user
   */
  async getAllowedVFolderHostsByCurrentUserInfo(
    domainName = '',
    projectId = '',
    resourcePolicyName = '',
  ): Promise<any> {
    const q = `
      query($domainName: String, $projectId: UUID!, $resourcePolicyName: String) {
        domain(name: $domainName) { allowed_vfolder_hosts }
        group(id: $projectId, domain_name: $domainName) { allowed_vfolder_hosts }
        keypair_resource_policy(name: $resourcePolicyName) { allowed_vfolder_hosts }
      }
    `;
    const v = { domainName, projectId, resourcePolicyName };
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
   * @param {string | null} name - the name of keypair class
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
  ): Promise<any> {
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
   * @param {string} isActive - filter keys with active state. If `true`, only active keypairs are returned.
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
  ): Promise<any> {
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
   * @param {number} rateLimit - API rate limit for 900 seconds. Prevents from DDoS attack.
   */
  async add(
    userId = null,
    isActive = true,
    isAdmin = false,
    resourcePolicy = 'default',
    rateLimit = 1000,
  ): Promise<any> {
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
  async mutate(accessKey, input): Promise<any> {
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
  async delete(accessKey): Promise<any> {
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
      'allowed_vfolder_hosts',
      'idle_timeout',
      'max_session_lifetime',
    ],
  ): Promise<any> {
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
   *   'allowed_vfolder_hosts': vfolder_hosts,
   *   'max_session_lifetime': max_session_lifetime
   * };
   */
  async add(name = null, input): Promise<any> {
    let fields = [
      'name',
      'created_at',
      'default_for_unspecified',
      'total_resource_slots',
      'max_concurrent_sessions',
      'max_containers_per_session',
      'max_vfolder_count',
      'allowed_vfolder_hosts',
      'idle_timeout',
      'max_session_lifetime',
    ];
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
  *     {int} 'max_vfolder_count': vfolder_count_limit,
   *   {[string]} 'allowed_vfolder_hosts': vfolder_hosts,
   *   {int} 'max_session_lifetime': max_session_lifetime
   * };
   */
  async mutate(name = null, input): Promise<any> {
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
  async delete(name = null): Promise<any> {
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
  ): Promise<any> {
    let q, v;
    if (installed_only) {
      q =
        `query($installed:Boolean) {` +
        `  images(is_installed:$installed) { ${fields.join(' ')} }` +
        '}';
      v = { installed: installed_only, is_operation: system_images };
    } else {
      q = `query {` + `  images { ${fields.join(' ')} }` + '}';
      v = { is_operation: system_images };
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
  async modifyResource(registry, image, tag, input): Promise<any[]> {
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
  async modifyLabel(registry, image, tag, key, value): Promise<any> {
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
  ): Promise<any> {
    registry = (registry === 'index.docker.io' ? '' : registry + '/').replace(
      /:/g,
      '%3A',
    );
    const sessionId = this.client.generateSessionId();
    if (Object.keys(resource).length === 0) {
      resource = {
        cpu: '1',
        mem: '512m',
        enqueueOnly: true,
        type: 'batch',
        startupCommand: 'echo "Image is installed"',
      };
    }
    return this.client
      .createIfNotExists(
        registry + name,
        sessionId,
        resource,
        10000,
        architecture,
      )
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
  async uninstall(
    name,
    registry: string = 'index.docker.io',
  ): Promise<boolean> {
    return Promise.resolve(false); // Temporally disable the feature.
  }

  /**
   * Get image label information.
   *
   * @param {string} registry - Registry name
   * @param {string} image - image name.
   * @param {string} tag - tag to get.
   */
  async get(registry, image, tag): Promise<any> {
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
   *        Available statuses are: `PREPARING`, `CREATING`, `BUILDING`, `PENDING`, `SCHEDULED`, `RUNNING`, `RESTARTING`, `RESIZING`, `SUSPENDED`, `TERMINATING`, `TERMINATED`, `ERROR`.
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
  ): Promise<any> {
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
   *        Available statuses are:`PREPARING`, `PREPARED`, `CREATING`, `BUILDING`, `PENDING`, `SCHEDULED`, `RUNNING`, `RESTARTING`, `RESIZING`, `SUSPENDED`, `TERMINATING`, `TERMINATED`, `ERROR`.
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
  ): Promise<any> {
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
  ): Promise<any> {
    fields = this.client._updateFieldCompatibilityByAPIVersion(fields);
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
  ): Promise<any> {
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

  /**
   * Request container commit for corresponding session in agent node
   *
   * @param sessionName - name of the session
   */
  async commitSession(sessionName: string = ''): Promise<any> {
    const rqst = this.client.newSignedRequest(
      'POST',
      `/session/${sessionName}/commit`,
      null,
    );
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Request container commit for corresponding session in agent node
   *
   * @param sessionName - name of the session
   */
  async convertSessionToImage(sessionName: string, newImageName: string): Promise<any> {
    const rqst = this.client.newSignedRequest(
      'POST',
      `/session/${sessionName}/imagify`,
      { image_name: newImageName },
    );
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Get status of requested container commit on agent node (ongoing / finished / failed)
   *
   * @param sessionName - name of the session
   */
  async getCommitSessionStatus(sessionName: string = ''): Promise<any> {
    const rqst = this.client.newSignedRequest(
      'GET',
      `/session/${sessionName}/commit`,
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
   * @param {boolean} listall - returns all list
   * @param {string} groupId - ID of group where session templates are bound
   */
  async list(listall = false, groupId = null): Promise<any> {
    let reqUrl = this.urlPrefix;
    if (listall) {
      const params = { all: listall ? 'true' : 'false' };
      const q = new URLSearchParams(params).toString();
      reqUrl += `?${q}`;
    }
    if (groupId) {
      const params = { group_id: groupId };
      const q = new URLSearchParams(params).toString();
      reqUrl += `?${q}`;
    }
    let rqst = this.client.newSignedRequest('GET', reqUrl, null);
    return this.client._wrapWithPromise(rqst);
  }
}

class ModelService {
  public client: any;

  /**
   * The Container image API wrapper.
   *
   * @param {Client} client - the Client API wrapper object to bind
   */
  constructor(client) {
    this.client = client;
  }

  listService() {
    // TODO: request list service by project(group) id
  }

  createService() {
    // TODO: request service creation by params
  }

  getServiceInfo() {
    // TODO: request service info detail by its id
  }

  termiateService() {
    // TODO: request service termination by its id
  }

  scaleRoutes() {
    // TODO: request routing count by its id and desired count
  }

  syncRoutings() {
    // TODO: request checking routings whether are successfully added or not by service id
  }

  updateRoute() {
    // TODO: request to update routing details (for now traffic ratio) by service id and routing id
  }

  deleteRoute() {
    // TODO: request to update desired routing count to -1 to delete routing of the service by service id and route_id
  }

  generateServiceToken() {
    // TODO: request generate token for accessing to service app by service id
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
    this.resources['ipu.device'] = {};
    this.resources['ipu.device'].total = 0;
    this.resources['ipu.device'].used = 0;
    this.resources['atom.device'] = {};
    this.resources['atom.device'].total = 0;
    this.resources['atom.device'].used = 0;
    this.resources['atom-plus.device'] = {};
    this.resources['atom-plus.device'].total = 0;
    this.resources['atom-plus.device'].used = 0;
    this.resources['atom-max.device'] = {};
    this.resources['atom-max.device'].total = 0;
    this.resources['atom-max.device'].used = 0;
    this.resources['gaudi2.device'] = {};
    this.resources['gaudi2.device'].total = 0;
    this.resources['gaudi2.device'].used = 0;
    this.resources['warboy.device'] = {};
    this.resources['warboy.device'].total = 0;
    this.resources['warboy.device'].used = 0;
    this.resources['rngd.device'] = {};
    this.resources['rngd.device'].total = 0;
    this.resources['rngd.device'].used = 0;
    this.resources['hyperaccel-lpu.device'] = {};
    this.resources['hyperaccel-lpu.device'].total = 0;
    this.resources['hyperaccel-lpu.device'].used = 0;

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
  async totalResourceInformation(status = 'ALIVE'): Promise<any> {
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
          Object.keys(this.agents).map((objectKey) => {
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
            if ('ipu.device' in available_slots) {
              this.resources['ipu.device'].total =
                parseInt(this.resources['ipu.device'].total) +
                Math.floor(Number(available_slots['ipu.device']));
            }
            if ('ipu.device' in occupied_slots) {
              this.resources['ipu.device'].used =
                parseInt(this.resources['ipu.device'].used) +
                Math.floor(Number(occupied_slots['ipu.device']));
            }
            if ('atom.device' in available_slots) {
              this.resources['atom.device'].total =
                parseInt(this.resources['atom.device'].total) +
                Math.floor(Number(available_slots['atom.device']));
            }
            if ('atom.device' in occupied_slots) {
              this.resources['atom.device'].used =
                parseInt(this.resources['atom.device'].used) +
                Math.floor(Number(occupied_slots['atom.device']));
            }
            if ('atom-plus.device' in available_slots) {
              this.resources['atom-plus.device'].total =
                parseInt(this.resources['atom-plus.device'].total) +
                Math.floor(Number(available_slots['atom-plus.device']));
            }
            if ('atom-plus.device' in occupied_slots) {
              this.resources['atom-plus.device'].used =
                parseInt(this.resources['atom-plus.device'].used) +
                Math.floor(Number(occupied_slots['atom-plus.device']));
            }
            if ('atom-max.device' in available_slots) {
              this.resources['atom-max.device'].total =
                parseInt(this.resources['atom-max.device'].total) +
                Math.floor(Number(available_slots['atom-max.device']));
            }
            if ('atom-max.device' in occupied_slots) {
              this.resources['atom-max.device'].used =
                parseInt(this.resources['atom-max.device'].used) +
                Math.floor(Number(occupied_slots['atom-max.device']));
            }
            if ('gaudi2.device' in available_slots) {
              this.resources['gaudi2.device'].total =
                parseInt(this.resources['gaudi2.device'].total) +
                Math.floor(Number(available_slots['gaudi2.device']));
            }
            if ('gaudi2.device' in occupied_slots) {
              this.resources['gaudi2.device'].used =
                parseInt(this.resources['gaudi2.device'].used) +
                Math.floor(Number(occupied_slots['gaudi2.device']));
            }
            if ('warboy.device' in available_slots) {
              this.resources['warboy.device'].total =
                parseInt(this.resources['warboy.device'].total) +
                Math.floor(Number(available_slots['warboy.device']));
            }
            if ('warboy.device' in occupied_slots) {
              this.resources['warboy.device'].used =
                parseInt(this.resources['warboy.device'].used) +
                Math.floor(Number(occupied_slots['warboy.device']));
            }
            if ('rngd.device' in available_slots) {
              this.resources['rngd.device'].total =
                parseInt(this.resources['rngd.device'].total) +
                Math.floor(Number(available_slots['rngd.device']));
            }
            if ('rngd.device' in occupied_slots) {
              this.resources['rngd.device'].used =
                parseInt(this.resources['rngd.device'].used) +
                Math.floor(Number(occupied_slots['rngd.device']));
            }
            if ('hyperaccel-lpu.device' in available_slots) {
              this.resources['hyperaccel-lpu.device'].total =
                parseInt(this.resources['hyperaccel-lpu.device'].total) +
                Math.floor(Number(available_slots['hyperaccel-lpu.device']));
            }
            if ('hyperaccel-lpu.device' in occupied_slots) {
              this.resources['hyperaccel-lpu.device'].used =
                parseInt(this.resources['hyperaccel-lpu.device'].used) +
                Math.floor(Number(occupied_slots['hyperaccel-lpu.device']));
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
  async user_stats(): Promise<any> {
    const rqst = this.client.newSignedRequest(
      'GET',
      '/resource/stats/user/month',
      null,
    );
    // return this.client._wrapWithPromise(rqst);
    return this.client._wrapWithPromise(rqst, false, null);
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
   * @param {array} fields - fields to get. Possible field names are:
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
      'type',
    ],
    type = ["GENERAL"],
  ): Promise<any> {
    let q, v;
      q =
        `query($is_active:Boolean, $type:[String!]) {` +
        `  groups(is_active:$is_active, type:$type) { ${fields.join(' ')} }` +
        '}';
      v = { is_active: is_active, type: type };
      if (domain_name) {
        q =
          `query($domain_name: String, $is_active:Boolean, $type:[String!]) {` +
          `  groups(domain_name: $domain_name, is_active:$is_active, type:$type) { ${fields.join(
            ' ',
          )} }` +
          '}';
        v = {
          is_active: is_active,
          domain_name: domain_name,
          type: type,
        };
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
   *   'total_resource_slots': JSONString,   // Total resource slots
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
  ): Promise<any> {
    let q, v;
    if (domain_name) {
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
  ): Promise<any> {
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
   *   'total_resource_slots': JSOONString,   // Total resource slots
   *   'allowed_vfolder_hosts': [String],   // Allowed virtual folder hosts
   *   'allowed_docker_registries': [String],   // Allowed docker registry lists
   *   'integration_id': [String],   // Integration ids
   *   'scaling_groups': [String],   // Scaling groups
   * };
   */
  async update(domain_name = false, input): Promise<any> {
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
  attach_background_task(task_id: string): EventSource {
    let urlStr = '/events/background-task?task_id=' + task_id;
    let req = this.client.newSignedRequest('GET', urlStr, null);
    return new EventSource(req.uri, { withCredentials: true });
  }

  /**
   * Rescan image from repository
   * @param {string} registry - registry. default is ''
   * @param {string | undefined} project - project.
   */
  async rescan_images(registry = '', project?: string): Promise<any> {
    if (this.client.is_admin === true) {
      let q, v;
      const params: Record<string, string> = {};
      
      if (registry !== '') {
        registry = decodeURIComponent(registry);
        params.registry = registry;

        if (project !== undefined) {
        // The 'project' parameter is only applicable when 'registry' is provided.
          params.project = project
        }
      }
  
      if (Object.keys(params).length > 0) {
        const paramList = Object.keys(params).map(p => `$${p}: String`).join(', ');
        const argList = Object.keys(params).map(p => `${p}: $${p}`).join(', ');
        
        q = `mutation(${paramList}) {
          rescan_images(${argList}) {
            ok msg task_id
          }
        }`;
        v = params;
      } else {
        q = `mutation {
          rescan_images {
            ok msg task_id
          }
        }`;
        v = {};
      }
      
      return this.client.query(q, v, null);
    } else {
      return Promise.resolve(false);
    }
  }

  async recalculate_usage(): Promise<any> {
    if (this.client.is_superadmin === true) {
      let rqst = this.client.newSignedRequest(
        'POST',
        `${this.urlPrefix}/recalculate-usage`,
        null,
      );
      // Set specific timeout due to time for recalculate
      return this.client._wrapWithPromise(rqst, false, null, 60 * 1000);
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
   * @param {json} fields - User specification to query. Fields are:
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
      'main_access_key',
    ],
  ): Promise<any> {
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
      // From 20.03, there is no single query to fetch every user, so
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
   * @param {json} fields - User specification to query. Fields are:
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
   *   'groups': List(UUID)     // Group Ids for user. Should be list of UUID strings.
   *   'totp_activated': Boolean// Whether TOTP is enabled for the user.
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
  async create(email = null, input): Promise<any> {
    // let fields = ['username', 'password', 'need_password_change', 'full_name', 'description', 'is_active', 'domain_name', 'role', 'groups{id, name}'];
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
      return this.client.query(q, v, null, 0, 0, true);
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
  async update(email = null, input): Promise<any> {
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
      return this.client.query(q, v, null, 0, 0, true);
    } else {
      return Promise.resolve(false);
    }
  }

  /**
   * delete user information with given user id
   *
   * @param {string} email - E-mail address as user id to delete.
   */
  async delete(email): Promise<any> {
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
      return this.client.query(q, v, null, 0, 0, true);
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

  async list_available(): Promise<any> {
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
        'wsproxy_addr',
        'is_public',
      ];
      const q = `query {` + `  scaling_groups { ${fields.join(' ')} }` + `}`;
      const v = {};
      return this.client.query(q, v);
    } else {
      return Promise.resolve(false);
    }
  }

  async list(group = 'default'): Promise<any> {
    const queryString = `/scaling-groups?${new URLSearchParams({group: group}).toString()}`;
    const rqst = this.client.newSignedRequest('GET', queryString, null, null);
    //const result = await this.client._wrapWithPromise(rqst);
    //console.log("test");
    //console.log(result);
    //return result;
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Get the version of WSProxy for a specific scaling group.
   * (NEW) manager version 21.09.
   *
   * @param {string} scalingGroup - Scaling group name
   * @param {string} groupId - Project (group) ID
   */
  async getWsproxyVersion(scalingGroup, groupId): Promise<any> {
    const url = `/scaling-groups/${scalingGroup}/wsproxy-version?${new URLSearchParams({group: groupId}).toString()}`;
    const rqst = this.client.newSignedRequest('GET', url, null, null);
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Create a scaling group
   *
   * @param {string} name - name of the new scaling group
   * @param {json} input - object containing desired modifications
   * {
   *   'description': String          // description of scaling group
   *   'is_active': Boolean           // active status of scaling group
   *   'driver': String
   *   'driver_opts': JSONString
   *   'scheduler': String
   *   'scheduler_opts': JSONString   // NEW in manager 22.03
   *   'wsproxy_addr': String         // NEW in manager 21.09
   *   'is_public': Boolean           // New in manager 23.03.1
   * }
   */
  async create(name, input): Promise<any> {
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
  async associate_domain(domain, scaling_group): Promise<any> {
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
   *   'is_public': Boolean
   *   'driver': String
   *   'driver_opts': JSONString
   *   'scheduler': String
   *   'scheduler_opts': JSONString   // NEW in manager 22.03
   *   'wsproxy_addr': String         // NEW in manager 21.09
   * }
   */
  async update(name, input): Promise<any> {
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
  async delete(name): Promise<any> {
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

  async list(): Promise<any> {
    const rqst = this.client.newSignedRequest('POST', '/config/get', {
      key: 'config/docker/registry',
      prefix: true,
    });
    return this.client._wrapWithPromise(rqst);
  }

  async set(key: string, value): Promise<any> {
    key = encodeURIComponent(key);
    let regkey = `config/docker/registry/${key}`;
    const rqst = this.client.newSignedRequest('POST', '/config/set', {
      key: regkey,
      value,
    });
    return this.client._wrapWithPromise(rqst);
  }

  async delete(key): Promise<any> {
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
  async list(prefix = ''): Promise<any> {
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
   * @param {string} key - prefix to get. This command will return every settings starting with the prefix.
   */
  async get(key): Promise<any> {
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
  async set(key, value): Promise<any> {
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
  async delete(key, prefix = false): Promise<any> {
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
  async get_announcement(): Promise<any> {
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
  async update_announcement(enabled = true, message): Promise<any> {
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
  async get_bootstrap_script(): Promise<any> {
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
   * @param {string} script - text content of bootstrap script.
   */
  async update_bootstrap_script(script: string): Promise<any> {
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
  async create(data: string = '', path: string): Promise<any> {
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
  async get(): Promise<any> {
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
  async update(data: string, path: string): Promise<any> {
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
  async delete(path: string): Promise<any> {
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
  async getLicense(): Promise<any> {
    if (this.client.is_superadmin === true) {
      if (typeof this.certificate === 'undefined') {
        const rqst = this.client.newSignedRequest('GET', '/license');
        let cert = await this.client._wrapWithPromise(rqst).catch((e: any) => {
          if (e.statusCode == 404) {
            // The open-source project version does not have a certificate.
            return Promise.resolve(null);
          }
          // Unknown error
          return Promise.resolve(undefined);
        });
        if (cert) {
          this.certificate = cert.certificate;
          this.certificate['valid'] = cert.status === 'valid';
        }
        return Promise.resolve(this.certificate);
      }
    } else {
      return Promise.resolve(undefined);
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
  async ping(): Promise<any> {
    const rqst = this.client.newSignedRequest('GET', '/cloud/ping');
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Verify signup email by JWT token.
   *
   * @param {string} token - JWT token which is delivered to user's email.
   */
  async verify_email(token: string): Promise<any> {
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
  async send_verification_email(email: string): Promise<any> {
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
  async send_password_change_email(email: string): Promise<any> {
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
  async change_password(
    email: string,
    password: string,
    token: string,
  ): Promise<any> {
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
  async login(input): Promise<boolean> {
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
      if (!result.hasOwnProperty('token')) {
        return Promise.resolve(false);
      } else {
        const token = result.token;
        document.cookie = `${this.tokenName}=${token}; path=/`;
        return Promise.resolve(false);
      }
    } catch (err) {
      console.log(err);
      throw {
        title: 'No Pipeline Server found at API Endpoint.',
        message:
          'Authentication failed. Check information and pipeline server status.',
      };
    }
  }

  async logout(): Promise<any> {
    const rqst = this.client.newSignedRequest(
      'DELETE',
      `/auth-token/`,
      null,
      'pipeline',
    );
    try {
      await this.client._wrapWithPromise(rqst);
    } catch (err) {
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

  async check_login(): Promise<any> {
    let rqst = this.client.newSignedRequest(
      'GET',
      `/api/users/me/`,
      null,
      'pipeline',
    );
    return this.client._wrapWithPromise(rqst);
  }

  getPipelineToken(): string {
    return this._getCookieByName(this.tokenName);
  }

  /**
   * List all pipelines
   */
  async list(): Promise<any> {
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
  async info(id): Promise<any> {
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
  async create(input): Promise<any> {
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
  async update(id, input): Promise<any> {
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
  async delete(id): Promise<any> {
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
  async run(id, input): Promise<any> {
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
  _getCookieByName(name = ''): string {
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
   * Remove Cookie By its name if exists
   *
   * @param {string} name - cookie name
   */
  _removeCookieByName(name = '') {
    if (name !== '') {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
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
  async list(): Promise<any> {
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
  async info(id): Promise<any> {
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
  async stop(id): Promise<any> {
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
   * @param {string} pipelineJobId - pipeline job id
   */
  async list(pipelineJobId: string = ''): Promise<any> {
    let queryString = `${this.urlPrefix}`;
    queryString += pipelineJobId ? `/?${new URLSearchParams({pipeline_job: pipelineJobId}).toString()}` : `/`;
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
  async info(id): Promise<any> {
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
  async create(input): Promise<any> {
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
  async update(id, input): Promise<any> {
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
  async delete(id): Promise<any> {
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
  async ping(): Promise<any> {
    const rqst = this.client.newSignedRequest('GET', '/eduapp/ping');
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Get mount folders for auto-mount.
   */
  async get_mount_folders(): Promise<any> {
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
    const searchParams = new URLSearchParams({
      sToken: stoken
    });
    const rqst = this.client.newSignedRequest('GET', `/eduapp/credential?${searchParams.toString()}`);
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
    if (binaryUnits.includes(value.substring(value.length - 1))) {
      sourceUnit = value.substring(value.length - 1);
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

  /**
   * Returns elapsed time between given start and end time. If end time is not set, calculate from start time to now.
   *
   * @param {string | Date | number} start - start time
   * @param {string | Date | number} end - end time
   * @return {string} - elapsed time
   */
  elapsedTime(start, end) {
    let startDate = new Date(start);
    let endDate;
    if (end === null) {
      endDate = new Date();
    } else {
      endDate = new Date(end);
    }
    // let seconds_total = Math.floor((endDate.getTime() - startDate.getTime()) / 1000);
    // let seconds_cumulative = seconds_total;
    let seconds_cumulative = Math.floor(
      (endDate.getTime() - startDate.getTime()) / 1000,
    );
    let days = Math.floor(seconds_cumulative / 86400);
    seconds_cumulative = seconds_cumulative - days * 86400;
    let hours = Math.floor(seconds_cumulative / 3600);
    seconds_cumulative = seconds_cumulative - hours * 3600;
    let minutes = Math.floor(seconds_cumulative / 60);
    seconds_cumulative = seconds_cumulative - minutes * 60;
    let seconds = seconds_cumulative;
    let result = '';
    if (days !== undefined && days > 0) {
      result = result + String(days) + 'd';
    }
    if (hours !== undefined) {
      result = result + this._padding_zeros(hours, 2) + ':';
    }
    if (minutes !== undefined) {
      result = result + this._padding_zeros(minutes, 2) + ':';
    }
    return result + this._padding_zeros(seconds, 2) + '';
  }

  /**
   * Returns total seconds from give elapsed time string.
   *   - ex) "1d01:54:33" -> 93273
   *
   * @param {string} daytimeString - daytime string, ex) "1d01:54:33"
   * @return {number} - total seconds
   */
  elapsedTimeToTotalSeconds(daytimeString) {
    let days, hours, minutes, seconds;
    if (daytimeString.includes('d')) {
      [days, daytimeString] = daytimeString.split('d');
    } else {
      days = 0;
    }
    [hours, minutes, seconds] = daytimeString.split(':');
    return (
      parseInt(days) * 86400 +
      parseInt(hours) * 3600 +
      parseInt(minutes) * 60 +
      parseInt(seconds)
    );
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

// @ts-ignore
const backend = {
  Client: Client,
  ClientConfig: ClientConfig,
};
/* For Node.JS library
// for use like "ai.backend.Client"
// module.exports.backend = backend;
// for classical uses
// module.exports.Client = Client;
// module.exports.ClientConfig = ClientConfig;
// legacy aliases
// module.exports.BackendAIClient = Client;
// module.exports.BackendAIClientConfig = ClientConfig;
*/
/* For ESModule export */
// @ts-ignore
export { backend, Client, ClientConfig };
