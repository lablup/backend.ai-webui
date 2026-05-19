import { ClientConfig } from './client-config';
import {
  comparePEP440Versions,
  isCompatibleMultipleConditions,
} from './pep440';
import {
  ResourcePreset,
  VFolder,
  Agent,
  AgentSummary,
  StorageProxy,
  Keypair,
  ResourcePolicy,
  ContainerImage,
  ComputeSession,
  SessionTemplate,
  ModelService,
  Resources,
  Group,
  Domain,
  Maintenance,
  User,
  ScalingGroup,
  Registry,
  Setting,
  Service,
  UserConfig,
  Enterprise,
  Cloud,
  Pipeline,
  PipelineJob,
  PipelineTaskInstance,
  EduApp,
  utils,
} from './resources';
import type { SessionResources, requestInfo } from './types';
import CryptoES from 'crypto-es';

export class Client {
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
      requestTimerForSoftTimeout = setTimeout(() => {
        document?.dispatchEvent(
          new CustomEvent('backend-ai-network-soft-time-out'),
        );
        isSoftTimeoutTriggered = true;
      }, this.requestSoftTimeout);
      resp = await fetch(rqst.uri, rqst);
      if (typeof requestTimer !== 'undefined') {
        clearTimeout(requestTimer);
      }
      if (typeof requestTimerForSoftTimeout !== 'undefined') {
        clearTimeout(requestTimerForSoftTimeout);
        if (!isSoftTimeoutTriggered) {
          document?.dispatchEvent(
            new CustomEvent('backend-ai-network-success-without-soft-time-out'),
          );
          isSoftTimeoutTriggered = true;
        }
      }

      let loginSessionId = resp.headers.get('X-BackendAI-SessionID'); // Login session ID handler
      if (loginSessionId) {
        this._loginSessionId = loginSessionId;
      }
      errorType = Client.ERR_RESPONSE;
      let contentType = resp.headers.get('Content-Type');
      if (!rawFile && (contentType === null || resp.status === 204)) {
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
        // Include response body for GraphQL errors
        response: body,
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
      // console.warn('Local storage is full. Clearing part of the logs.');
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
    if (this.isManagerVersionCompatibleWith('22.09')) {
      this._features['force2FA'] = true;
      if (this.isManagerVersionCompatibleWith('25.09.0')) {
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
      this._features[
        'max-quota-scope-size-in-user-and-project-resource-policy'
      ] = true;
      this._features[
        'deprecated-max-vfolder-size-in-user-and-project-resource-policy'
      ] = true;
      this._features['max-quota-scope-size'] = true;
    }
    if (this.isManagerVersionCompatibleWith('23.09.4')) {
      this._features[
        'deprecated-max-vfolder-count-in-keypair-resource-policy'
      ] = true;
      this._features['deprecated-max-vfolder-size-in-keypair-resource-policy'] =
        true;
      this._features['use-win-instead-of-win32'] = true;
    }
    if (this.isManagerVersionCompatibleWith('23.09.6')) {
      this._features['max-vfolder-count-in-user-and-project-resource-policy'] =
        true;
      this._features['deprecated-max-quota-scope-in-keypair-resource-policy'] =
        true;
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
    if (this.isManagerVersionCompatibleWith(['24.03.10'])) {
      this._features['endpoint-lifecycle-stage-filter'] = true;
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
    if (
      this.isManagerVersionCompatibleWith(['25.1.0', '24.09.6', '24.03.12'])
    ) {
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
      this._features['image_rescan_by_project'] = true;
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
      this._features['endpoint-lifecycle-ready-stage'] = true;
    }
    if (this.isManagerVersionCompatibleWith('25.13.2')) {
      this._features['copy-on-terminal'] = true;
    }
    if (this.isManagerVersionCompatibleWith('25.15.0')) {
      this._features['agent-stats'] = true;
    }
    if (this.isManagerVersionCompatibleWith('25.15.2')) {
      this._features['user-node-query-project-filter'] = true;
    }
    if (this.isManagerVersionCompatibleWith('25.16.0')) {
      this._features['multi-agents'] = true;
    }
    if (this.isManagerVersionCompatibleWith('25.17.0')) {
      this._features['background-file-delete'] = true;
      // The 'reservoir' feature is introduced with 25.14.0, but ArtifactRegistry.id is introduced with 25.17.0.
      // Instead of adding conditional logic in all related components, make it supported starting from version 25.17.0 or later.
      this._features['reservoir'] = true;
    }
    if (this.isManagerVersionCompatibleWith('25.18.2')) {
      this._features['allow-only-ro-permission-for-model-project-folder'] =
        true;
    }
    if (this.isManagerVersionCompatibleWith('25.19.0')) {
      this._features['route-node'] = true;
    }
    if (this.isManagerVersionCompatibleWith('26.1.0')) {
      this._features['model-try-content-button'] = true;
    }
    if (this.isManagerVersionCompatibleWith('26.1.0')) {
      this._features['admin-resource-group-select'] = true;
    }
    if (this.isManagerVersionCompatibleWith('26.2.0')) {
      this._features['fair-share-scheduling'] = true;
      this._features['export-csv'] = true;
      this._features['bulk-create-user'] = true;
    }
    if (this.isManagerVersionCompatibleWith('26.3.0')) {
      this._features['session-scheduling-history'] = true;
      this._features['download-archive'] = true;
    }
    if (this.isManagerVersionCompatibleWith('26.4.0')) {
      this._features['update-user-v2'] = true;
      this._features['my-keypairs'] = true;
      this._features['rbac'] = true;
      this._features['bulk-purge-users'] = true;
      this._features['route-health-status'] = true;
      this._features['model-card-v2'] = true;
      this._features['my-roles'] = true;
      this._features['prometheus-auto-scaling-rule'] = true;
    }
    if (this.isManagerVersionCompatibleWith('26.4.2')) {
      this._features['prometheus-query-preset'] = true;
      this._features['deployment-preset'] = true;
    }
    if (this.isManagerVersionCompatibleWith('26.4.3')) {
      this._features['model-deployment-extended-filter'] = true;
    }
  }

  /**
   * Return if manager is compatible with given version.
   */
  isManagerVersionCompatibleWith(version: string | Array<string>) {
    let managerVersion = this._managerVersion;
    if (Array.isArray(version)) {
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
      // console.log(err);
      return Promise.resolve(false);
    }
    return result.authenticated;
  }

  /**
   * Login into webserver with given ID/Password. This requires additional webserver package.
   *
   */
  async login(otp?: string, force?: boolean) {
    let body: Record<string, unknown> = {
      username: this._config.userId,
      password: this._config.password,
    };
    if (otp) body['otp'] = otp;
    if (force) body['force'] = true;
    let rqst = this.newSignedRequest('POST', `/server/login`, body, '', true);
    let result;
    try {
      result = await this._wrapWithPromise(rqst, false, null, 0, 0, {
        log: JSON.stringify({
          username: this._config.userId,
          password: '********',
        }),
      });
    } catch (err) {
      // _wrapWithPromise throws on non-2xx responses. For 401 responses,
      // the web proxy wraps the error in an envelope { authenticated: false,
      // data: { type, title, details } }. Recover that envelope and throw
      // it as a login error so the caller can classify by data.type.
      const responseBody = err?.response;
      if (
        responseBody &&
        typeof responseBody === 'object' &&
        'authenticated' in responseBody &&
        responseBody.data
      ) {
        localStorage.removeItem('backendaiwebui.sessionid');
        throw {
          isLoginError: true,
          data: responseBody.data,
          title: responseBody.data.title,
          message: responseBody.data.details,
        };
      }
      // Non-envelope errors (429, 502, 503, network, etc.): re-throw as-is.
      // The caller can use err.type, err.title, err.statusCode, etc.
      throw err;
    }

    if (result.authenticated === true) {
      if (result.data.role === 'monitor') {
        await this.logout();
        throw {
          isLoginError: true,
          data: {
            type: 'monitor-role-login-forbidden',
          },
        };
      }
      await this.get_manager_version();
      if (this._loginSessionId !== null && this._loginSessionId !== '') {
        localStorage.setItem('backendaiwebui.sessionid', this._loginSessionId);
      }
      return this.check_login();
    }

    // HTTP 200 but authenticated === false (TOTP required, etc.)
    localStorage.removeItem('backendaiwebui.sessionid');
    throw {
      isLoginError: true,
      data: result.data || {},
      title: result.data?.title,
      message: result.data?.details,
    };
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
        // Persist the login session ID so that the session survives a
        // page refresh — same as the regular login() path.
        if (this._loginSessionId !== null && this._loginSessionId !== '') {
          localStorage.setItem(
            'backendaiwebui.sessionid',
            this._loginSessionId,
          );
        }
        return this.check_login();
      } else if (result.authenticated === false) {
        // Authentication failed. Clear any stale session id that may have
        // been persisted by a previous login so that subsequent
        // check_login() calls don't confuse it with a live session.
        // Mirrors the regular login() failure-path behavior.
        localStorage.removeItem('backendaiwebui.sessionid');
        if (result.data) {
          // Surface both `details` (free-text) and `type` (problem URL) so
          // the webui can classify the failure (`active-login-session-exists`,
          // `require-totp-authentication`, etc.) without string-matching
          // the user-visible message. Consumers read the last path segment
          // of `fail_type` the same way LoginView's `extractErrorType` does.
          return Promise.resolve({
            fail_reason: result.data.details,
            fail_type: result.data.type,
          });
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

  async initialize_totp_anon({ registration_token }): Promise<any> {
    let rqst = this.newSignedRequest(
      'POST',
      '/totp/anon',
      {
        registration_token,
      },
      null,
    );
    return this._wrapWithPromise(rqst);
  }

  async activate_totp(otp): Promise<any> {
    let rqst = this.newSignedRequest('POST', '/totp/verify', { otp }, null);
    return this._wrapWithPromise(rqst);
  }
  async activate_totp_anon({ otp, registration_token }): Promise<any> {
    let rqst = this.newSignedRequest(
      'POST',
      '/totp/anon/verify',
      { otp, registration_token },
      null,
    );
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
    const rqst = this.newSignedRequest(
      'GET',
      '/config/resource-slots',
      null,
      '',
    );
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
      reuseIfExists: false,
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
      ...resources,
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
      queryString = `${queryString}?${new URLSearchParams({ owner_access_key: ownerKey }).toString()}`;
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
  async get_logs(
    sessionId,
    ownerKey = null,
    kernelId = null,
    timeout = 0,
  ): Promise<any> {
    const queryParams = new URLSearchParams();
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
    const queryString = `${this.kernelPrefix}/_/logs?${new URLSearchParams({ session_name: sessionId }).toString()}`;
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
      queryString = `${queryString}?${new URLSearchParams({ owner_access_key: ownerKey, ...(forced ? { forced: 'true' } : {}) }).toString()}`;
    } else {
      queryString = `${queryString}?${new URLSearchParams({ ...(forced ? { forced: 'true' } : {}) }).toString()}`;
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
      queryString = `${queryString}?${new URLSearchParams({ owner_access_key: ownerKey }).toString()}`;
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
    opts: object = {},
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
    let rqst = this.newSignedRequest('POST', `/admin/gql`, query, null, secure);
    return this._wrapWithPromise(rqst, false, signal, timeout, retry).then(
      (r) => r.data,
    );
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
    const possible =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let i = 0; i < length; i++) {
      const random = CryptoES.lib.WordArray.random(4).words[0];
      result += possible.charAt(Math.abs(random) % possible.length);
    }

    return result;
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
      .replace(/[^\w-]+/g, '') // Remove all non-word chars
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
