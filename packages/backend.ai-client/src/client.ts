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
import type {
  FeatureSet,
  GraphQLVariables,
  LoginEnvelope,
  RequestBody,
  SessionResources,
  requestInfo,
} from './types';
import CryptoES from 'crypto-es';

export class Client {
  public code: string | null;
  public sessionId: string | null;
  public kernelType: string | null;
  public clientVersion: string;
  public agentSignature: string;
  public _config: ClientConfig;
  public _managerVersion: string | null;
  public _apiVersion: string | null;
  public _apiVersionMajor: string | null;
  public _loginSessionId: string | null;
  public is_admin: boolean;
  public is_superadmin: boolean;
  public kernelPrefix: string;
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
  public _features: FeatureSet;
  public ready: boolean = false;
  public abortController: AbortController;
  public abortSignal: AbortSignal;
  public requestTimeout: number;
  public requestSoftTimeout: number;
  // Numeric sentinel codes used by `_wrapWithPromise` to discriminate error
  // categories. Values must stay aligned with the `ErrorTypeCode` union in
  // `./types`. Defined as `readonly` literal-typed properties so consumers can
  // use them in type narrowing without losing the original `Object.defineProperty`
  // immutability semantics.
  static readonly ERR_SERVER = 0 as const;
  static readonly ERR_RESPONSE = 1 as const;
  static readonly ERR_REQUEST = 2 as const;
  static readonly ERR_ABORT = 3 as const;
  static readonly ERR_TIMEOUT = 4 as const;
  static readonly ERR_UNKNOWN = 99 as const;

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
    rawFile: boolean = false,
    signal: AbortSignal | null = null,
    timeout: number = 0,
    retry: number = 0,
    opts: Record<string, unknown> = {},
  ): Promise<any> {
    // `errorType` starts out as one of the numeric `Client.ERR_*` sentinels and
    // may later be re-assigned to a URI-shaped string (e.g.
    // `https://api.backend.ai/probs/client-request-error`) before being
    // surfaced in the thrown `WrappedError`. Track both possibilities.
    let errorType: number | string = Client.ERR_REQUEST;
    let errorTitle = '';
    let errorMsg: string | undefined;
    let errorDesc = '';
    let errorCode = '';
    let traceback = '';
    let resp: Response | undefined;
    // `body` is genuinely polymorphic: a parsed JSON object on the
    // application/json path, a string on the text/* path, or a Blob
    // otherwise. The callers downstream of this method also expect
    // different shapes (most read JSON fields directly). Type as `any`
    // here and document this in the type-mismatch follow-up file.
    let body: any;
    let requestTimer: ReturnType<typeof setTimeout> | undefined;
    let requestTimerForSoftTimeout: ReturnType<typeof setTimeout> | undefined;
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
      let error_message: string | unknown;
      if (
        typeof err == 'object' &&
        err !== null &&
        err.constructor === Object &&
        'title' in err
      ) {
        error_message = (err as { title: unknown }).title; // formatted message
      } else {
        error_message = err;
      }
      if (typeof resp === 'undefined') {
        // No fetch response was produced (network error, abort, timeout).
        // The catch block below overlays `status`, `statusText`, and `msg`
        // onto this placeholder object.
        resp = {} as Response;
      }
      // The original code assigns to `resp.status` / `resp.statusText` and
      // reads `resp.msg`, which are not assignable on a real `Response`.
      // Treat `resp` as a mutable overlay shape inside this catch block.
      // See `docs/type-mismatch-followups.md` for the underlying bug.
      const respOverlay = resp as unknown as {
        status?: number | string;
        statusText?: string;
        msg?: string;
      };
      const bodyAccess = body as Record<string, string> | undefined;
      switch (errorType) {
        case Client.ERR_REQUEST:
          errorType = 'https://api.backend.ai/probs/client-request-error';
          if (navigator.onLine) {
            errorTitle = String(error_message ?? '');
            errorMsg = `sending request has failed: ${errorTitle}`;
            errorDesc = errorTitle;
          } else {
            errorTitle = 'Network disconnected.';
            errorMsg = `sending request has failed: Network disconnected`;
            errorDesc = 'Network disconnected';
          }
          break;
        case Client.ERR_RESPONSE:
          errorType = 'https://api.backend.ai/probs/client-response-error';
          errorTitle = String(error_message ?? '');
          errorMsg = `reading response has failed: ${errorTitle}`;
          errorDesc = errorTitle;
          break;
        case Client.ERR_SERVER:
          errorType = 'https://api.backend.ai/probs/server-error';
          errorTitle = `${respOverlay.status} ${respOverlay.statusText} - ${bodyAccess?.title}`;
          errorMsg = 'server responded failure: ';
          if (bodyAccess?.msg) {
            errorMsg =
              errorMsg +
              `${respOverlay.status} ${respOverlay.statusText} - ${bodyAccess.msg}`;
            errorDesc = bodyAccess.msg;
          } else {
            errorMsg =
              errorMsg +
              `${respOverlay.status} ${respOverlay.statusText} - ${bodyAccess?.title}`;
            errorDesc = bodyAccess?.title ?? '';
          }
          break;
        case Client.ERR_ABORT:
          errorType = 'https://api.backend.ai/probs/request-abort-error';
          errorTitle = `Request aborted`;
          errorMsg = 'Request aborted by user';
          errorDesc = errorMsg;
          respOverlay.status = 408;
          respOverlay.statusText = 'Request aborted by user';
          break;
        case Client.ERR_TIMEOUT:
          errorType = 'https://api.backend.ai/probs/request-timeout-error';
          errorTitle = `Request timeout`;
          errorMsg = 'No response returned within timeout';
          errorDesc = errorMsg;
          respOverlay.status = 408;
          respOverlay.statusText = 'Timeout exceeded';
          break;
        default:
          if (typeof respOverlay.status === 'undefined') {
            respOverlay.status = 500;
            respOverlay.statusText = 'Server error';
          }
          if (errorType === '') {
            errorType = Client.ERR_UNKNOWN;
          }
          if (errorTitle === '') {
            errorTitle = bodyAccess?.title ?? '';
          }
          errorMsg =
            'server responded failure: ' +
            `${respOverlay.status} ${respOverlay.statusText} - ${bodyAccess?.title}`;
          if (bodyAccess?.title !== '') {
            errorDesc = bodyAccess?.title ?? '';
          }
      }
      throw {
        isError: true,
        timestamp: new Date().toUTCString(),
        type: errorType,
        requestUrl: rqst.uri,
        requestMethod: rqst.method,
        requestParameters: rqst.body,
        statusCode: respOverlay.status,
        statusText: respOverlay.statusText,
        title: errorTitle,
        // `msg` field was introduced in v24.09.0
        msg: respOverlay.msg,
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
      localStorage.getItem('backendaiwebui.logs') ?? 'null',
    );
    if (previous_log) {
      if (previous_log.length > 2000) {
        previous_log = previous_log.slice(1, 2000);
      }
    }
    let log_stack: Record<string, unknown>[] = [];
    if (typeof resp === 'undefined') {
      // Mirror the catch-block pattern: when no fetch response exists,
      // construct a stand-in object carrying placeholder status fields.
      resp = {
        status: 'No status',
        statusText: 'No response given.',
      } as unknown as Response;
    }
    const respView = resp as unknown as {
      status: number | string;
      statusText: string;
    };
    const current_log: {
      isError: boolean;
      timestamp: string;
      type: string;
      requestUrl: string;
      requestMethod: string;
      requestParameters: unknown;
      statusCode: number | string;
      statusText: string;
      title: unknown;
      message: string;
    } = {
      isError: false,
      timestamp: new Date().toUTCString(),
      type: '',
      requestUrl: rqst.uri,
      requestMethod: rqst.method,
      requestParameters: rqst.body,
      statusCode: respView.status,
      statusText: respView.statusText,
      title: body?.title,
      message: '',
    };
    if ('log' in opts) {
      current_log.requestParameters = (opts as Record<string, unknown>)['log'];
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
  set APIMajorVersion(value: string | null) {
    this._apiVersionMajor = value;
    // The mirror field on ClientConfig is non-null; only mirror when value
    // is actually provided so the config retains a usable default.
    if (value !== null) {
      this._config._apiVersionMajor = value;
    }
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
      this._config._apiVersion = this._apiVersion ?? this._config._apiVersion; // To upgrade API version with server version
      this._apiVersionMajor = v.version?.substring(1, 3) ?? null;
      if (this._apiVersionMajor !== null) {
        this._config._apiVersionMajor = this._apiVersionMajor; // To upgrade API version with server version
        if (Number(this._apiVersionMajor) > 4) {
          this.kernelPrefix = '/session';
        }
      }
    }
    return this._managerVersion;
  }

  /**
   * Check compatibility of current manager
   */
  supports(feature: string): boolean {
    if (Object.keys(this._features).length === 0) {
      this._updateSupportList();
    }
    if (feature in this._features) {
      return this._features[feature];
    } else {
      return false;
    }
  }

  _updateFieldCompatibilityByAPIVersion(fields: string[]): string[] {
    const v4_replacements: Record<string, string> = {
      session_name: 'sess_id',
    };
    if (
      this._apiVersionMajor !== null &&
      Number(this._apiVersionMajor) < 5
    ) {
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
      this._features['deployment-scheduling-history'] = true;
      this._features['route-scheduling-history'] = true;
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
    const managerVersion = this._managerVersion ?? '';
    if (Array.isArray(version)) {
      return isCompatibleMultipleConditions(managerVersion, version);
    } else {
      return comparePEP440Versions(managerVersion, version) >= 0;
    }
  }

  /**
   * Return if api is compatible with given version.
   */
  isAPIVersionCompatibleWith(version: string | null): boolean {
    let apiVersion: string | null = this._apiVersion;
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
    return (version ?? '') <= (apiVersion ?? '');
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
      const responseBody = (err as { response?: LoginEnvelope } | null)
        ?.response;
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
    } catch (err: unknown) {
      // Manager / webserver down.
      if (
        err !== null &&
        typeof err === 'object' &&
        'statusCode' in err &&
        (err as { statusCode?: number }).statusCode === 429
      ) {
        throw {
          title: (err as { description?: string }).description,
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
  async signout(userid: string, password: string): Promise<any> {
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
  async update_full_name(email: string, fullName: string): Promise<any> {
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
  async update_password(
    oldPassword: string,
    newPassword: string,
    newPassword2: string,
  ): Promise<any> {
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
  }: {
    registration_token: string;
  }): Promise<any> {
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

  async activate_totp(otp: string): Promise<any> {
    let rqst = this.newSignedRequest('POST', '/totp/verify', { otp }, null);
    return this._wrapWithPromise(rqst);
  }
  async activate_totp_anon({
    otp,
    registration_token,
  }: {
    otp: string;
    registration_token: string;
  }): Promise<any> {
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
    if (
      this._apiVersionMajor !== null &&
      Number(this._apiVersionMajor) < 5
    ) {
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
    templateId: string,
    image: string | null = null,
    sessionName: undefined | string | null = null,
    resources: Record<string, string | number> = {},
    timeout: number = 0,
  ) {
    if (typeof sessionName === 'undefined' || sessionName === null) {
      sessionName = this.generateSessionId();
    }
    const params: Record<string, unknown> = { template_id: templateId };
    if (image) {
      params['image'] = image;
    }
    if (sessionName) {
      params['name'] = sessionName;
    }
    if (resources && Object.keys(resources).length > 0) {
      const config: Record<string, string | number> = {};
      if (resources['cpu']) {
        config['cpu'] = resources['cpu'];
      }
      if (resources['mem']) {
        config['mem'] = resources['mem'];
      }
      if (resources['cuda.device']) {
        config['cuda.device'] = parseInt(String(resources['cuda.device']));
      }
      if (resources['fgpu']) {
        config['cuda.shares'] = parseFloat(String(resources['fgpu'])).toFixed(
          2,
        ); // 19.09 and above
      }
      if (resources['cuda.shares']) {
        config['cuda.shares'] = parseFloat(
          String(resources['cuda.shares']),
        ).toFixed(2);
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
      type SessionConfig = {
        resources: Record<string, string | number>;
        mounts?: string | number;
        scaling_group?: string | number;
        resource_opts?: { shmem?: string | number };
        environ?: string | number;
      };
      const sessionConfig: SessionConfig = { resources: config };
      params['config'] = sessionConfig;
      if (resources['mounts']) {
        sessionConfig.mounts = resources['mounts'];
      }
      if (resources['scaling_group']) {
        sessionConfig.scaling_group = resources['scaling_group'];
      }
      if (resources['shmem']) {
        sessionConfig.resource_opts = {};
        sessionConfig.resource_opts.shmem = resources['shmem'];
      }
      if (resources['env']) {
        sessionConfig.environ = resources['env'];
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
  async get_info(
    sessionId: string,
    ownerKey: string | null = null,
  ): Promise<any> {
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
  async get_direct_access_info(sessionId: string): Promise<any> {
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
    sessionId: string,
    ownerKey: string | null = null,
    kernelId: string | null = null,
    timeout: number = 0,
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
  getTaskLogs(sessionId: string): Promise<any> {
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
    sessionId: string,
    ownerKey: string | null = null,
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
  async restart(
    sessionId: string,
    ownerKey: string | null = null,
  ): Promise<any> {
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
  destroyKernel(
    sessionId: string,
    ownerKey: string | null = null,
  ): Promise<any> {
    return this.destroy(sessionId, ownerKey);
  }

  // legacy aliases (DO NOT USE for new codes)
  refreshKernel(
    sessionId: string,
    ownerKey: string | null = null,
  ): Promise<any> {
    return this.restart(sessionId, ownerKey);
  }

  // legacy aliases (DO NOT USE for new codes)
  runCode(
    code: string,
    sessionId: string,
    runId: string,
    mode: string,
  ): Promise<any> {
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

  async upload(sessionId: string, path: string, fs: Blob): Promise<any> {
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

  async download(sessionId: string, files: string[]): Promise<any> {
    // URLSearchParams stringifies the array to a comma-joined value
    // (e.g. `files=a,b`). Preserve that legacy encoding rather than
    // emitting a repeated key. Cast through the URLSearchParams init
    // type so strict TS accepts the array value.
    const params = { files: files };
    const q = new URLSearchParams(
      params as unknown as Record<string, string>,
    ).toString();
    let rqst = this.newSignedRequest(
      'POST',
      `${this.kernelPrefix}/${sessionId}/download?${q}`,
      null,
      null,
    );
    return this._wrapWithPromise(rqst, true);
  }

  async download_single(sessionId: string, file: string) {
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
  async query<TData = unknown>(
    q: string,
    v: GraphQLVariables | null,
    signal: AbortSignal | null = null,
    timeout: number = 0,
    retry: number = 0,
    secure: boolean = false,
  ): Promise<TData> {
    let query = {
      query: q,
      variables: v,
    };
    let rqst = this.newSignedRequest('POST', `/admin/gql`, query, null, secure);
    return this._wrapWithPromise(rqst, false, signal, timeout, retry).then(
      (r: { data: TData }) => r.data,
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
    queryString: string,
    body: RequestBody = undefined,
    serviceName: string | null = null,
    secure: boolean = false,
  ): requestInfo {
    let content_type = 'application/json';
    let requestBody: string | FormData;
    let authBody: string;
    let d = new Date();
    if (body === null || body === undefined) {
      // Some backends require a valid JSON body even when empty.
      // Send '{}' for methods that carry a body; keep '' for GET/HEAD.
      // authBody mirrors requestBody so the v<4 signature (which hashes the
      // body) matches what is actually sent; v4+ excludes the body anyway.
      requestBody = method !== 'GET' && method !== 'HEAD' ? '{}' : '';
      authBody = requestBody;
    } else if (
      typeof (body as { getBoundary?: () => string }).getBoundary ===
        'function' ||
      body instanceof FormData
    ) {
      // detect form data input from form-data module
      requestBody = body as FormData;
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
      // `_apiVersion` is shaped like `v8.20240915`; index [1] reads the
      // numeric major version (still a single-char string). Coerce so
      // strict TS accepts the inequality without changing the JS semantics
      // it had before this typing pass.
      if (Number(this._config._apiVersion[1]) < 4) {
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
      // The legacy node `form-data` module (vs the DOM FormData) carries a
      // `getBoundary()` method that produces the multipart boundary token.
      // Treat it as a structural type.
      type LegacyFormData = {
        getBoundary: () => string;
        getHeaders: () => Record<string, string>;
      };
      const maybeLegacyForm = body as Partial<LegacyFormData>;
      if (typeof maybeLegacyForm.getBoundary === 'function') {
        hdrs.set(
          'Content-Type',
          (maybeLegacyForm as LegacyFormData).getHeaders()['content-type'],
        );
      }
      if (body instanceof FormData) {
        // browser FormData — fetch sets the boundary automatically.
      } else {
        hdrs.set('Content-Type', content_type);
        hdrs.set(
          'Content-Length',
          String(new TextEncoder().encode(authBody).length),
        );
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
    if (this._loginSessionId !== '' && this._loginSessionId !== null) {
      hdrs.set('X-BackendAI-SessionID', this._loginSessionId);
    }
    return {
      method: method,
      headers: hdrs,
      cache: 'default',
      body: requestBody,
      uri: uri,
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
  newUnsignedRequest(method: string, queryString: string, body: RequestBody) {
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
    body: RequestBody,
    urlPrefix: string = '',
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
    method: string,
    queryString: string,
    dateValue: string,
    bodyValue: string,
    content_type: string = 'application/json',
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

  getCurrentDate(now: Date): string {
    let year = `0000${now.getUTCFullYear()}`.slice(-4);
    let month = `0${now.getUTCMonth() + 1}`.slice(-2);
    let day = `0${now.getUTCDate()}`.slice(-2);
    return year + month + day;
  }

  getEncodedPayload(body: string): string {
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

  sign(
    key: string,
    key_encoding: 'binary' | 'utf8',
    msg: string,
    digest_type: 'binary' | 'hex' | 'base64',
  ): string {
    const hashDigest = CryptoES.enc.Utf8.parse(msg);
    let parsedKey: CryptoES.lib.WordArray;
    if (key_encoding == 'utf8') {
      parsedKey = CryptoES.enc.Utf8.parse(key);
    } else if (key_encoding == 'binary') {
      parsedKey = CryptoES.enc.Hex.parse(key);
    } else {
      parsedKey = CryptoES.enc.Utf8.parse(key);
    }
    let hmacDigest: string;
    if (['binary', 'hex'].includes(digest_type)) {
      hmacDigest = CryptoES.enc.Hex.stringify(
        CryptoES.HmacSHA256(hashDigest, parsedKey),
      );
    } else {
      hmacDigest = CryptoES.enc.Base64.stringify(
        CryptoES.HmacSHA256(hashDigest, parsedKey),
      );
    }
    return hmacDigest;
    /*let kbuf = new Buffer(key, key_encoding);
    let hmac = crypto.createHmac(this._config.hashType, kbuf);
    hmac.update(msg, 'utf8');
    return hmac.digest(digest_type);*/
  }

  getSignKey(secret_key: string, now: Date): string {
    let k1 = this.sign(secret_key, 'utf8', this.getCurrentDate(now), 'binary');
    return this.sign(k1, 'binary', this._config.endpointHost, 'binary');
  }

  generateRandomStr(length: number): string {
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

  slugify(text: string): string {
    const a = 'àáäâèéëêìíïîòóöôùúüûñçßÿœæŕśńṕẃǵǹḿǘẍźḧ·/_,:;';
    const b = 'aaaaeeeeiiiioooouuuuncsyoarsnpwgnmuxzh------';
    const p = new RegExp(a.split('').join('|'), 'g');

    return text
      .toString()
      .toLowerCase()
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(p, (c: string) => b.charAt(a.indexOf(c))) // Replace special chars
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
  async postSSHKeypair(param: {
    ssh_public_key: string;
    ssh_private_key: string;
  }): Promise<any> {
    let rqst = this.newSignedRequest('POST', '/auth/ssh-keypair', param, null);
    return this._wrapWithPromise(rqst, false);
  }

  // TODO: move attach_background_task function in Maintenance Class to here.
}

// `Client.ERR_*` are declared as `static readonly ... as const` inside the
// class body so TypeScript can narrow them as literal types. The
// `Object.defineProperty` calls below restore the original property
// descriptors (writable: false, enumerable: true, configurable: false) so
// `Object.keys(Client)` and other reflection-based consumers continue to
// see the sentinels exactly as they did before this typing pass.
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
