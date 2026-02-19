/**
 * Login Configuration Utilities
 *
 * Extracted from backend-ai-login.ts to support the React LoginView component.
 * Handles reading and applying configuration values from config.toml to global state.
 */

type ConfigValueType = 'boolean' | 'number' | 'string' | 'array';

interface ConfigValueObject {
  valueType: ConfigValueType;
  defaultValue: boolean | number | string | Array<string>;
  value: boolean | number | string | Array<string>;
}

function getConfigValueByExists(
  parentsKey: unknown,
  valueObj: ConfigValueObject,
): boolean | number | string | Array<string> {
  const defaultConditions: boolean =
    parentsKey === undefined ||
    valueObj.value === undefined ||
    typeof valueObj.value === 'undefined' ||
    valueObj.value === '' ||
    valueObj.value === '""' ||
    valueObj.value === null;
  let extraConditions;
  switch (typeof valueObj.defaultValue) {
    case 'number':
      extraConditions = isNaN(valueObj.value as number);
      return defaultConditions || extraConditions
        ? valueObj.defaultValue
        : valueObj.value;
    case 'boolean':
    case 'string':
    default:
      return defaultConditions ? valueObj.defaultValue : valueObj.value;
  }
}

/**
 * Configuration state that gets populated from config.toml.
 * These values are used to configure globalThis.backendaiclient._config
 * after successful login.
 */
export interface LoginConfigState {
  signup_support: boolean;
  allowAnonymousChangePassword: boolean;
  change_signin_support: boolean;
  allow_project_resource_monitor: boolean;
  allow_manual_image_name_for_session: boolean;
  allow_signout: boolean;
  login_attempt_limit: number;
  login_block_time: number;
  api_endpoint: string;
  api_endpoint_text: string;
  allowSignupWithoutConfirmation: boolean;
  default_session_environment: string;
  default_import_environment: string;
  maskUserInfo: boolean;
  singleSignOnVendors: string[];
  ssoRealmName: string;
  enableContainerCommit: boolean;
  appDownloadUrl: string;
  allowAppDownloadPanel: boolean;
  systemSSHImage: string;
  defaultFileBrowserImage: string;
  hideAgents: boolean;
  force2FA: boolean;
  enablePipeline: boolean;
  connection_mode: 'SESSION' | 'API';
  directoryBasedUsage: boolean;
  maxCountForPreopenPorts: number;
  allowCustomResourceAllocation: boolean;
  isDirectorySizeVisible: boolean;
  eduAppNamePrefix: string;
  enableImportFromHuggingFace: boolean;
  enableExtendLoginSession: boolean;
  enableInteractiveLoginAccountSwitch: boolean;
  enableModelFolders: boolean;
  enableReservoir: boolean;
  showNonInstalledImages: boolean;
  proxy_url: string;
  openPortToPublic: boolean;
  allowPreferredPort: boolean;
  allowNonAuthTCP: boolean;
  maxCPUCoresPerContainer: number;
  maxMemoryPerContainer: number;
  maxCUDADevicesPerContainer: number;
  maxCUDASharesPerContainer: number;
  maxROCMDevicesPerContainer: number;
  maxTPUDevicesPerContainer: number;
  maxIPUDevicesPerContainer: number;
  maxATOMDevicesPerContainer: number;
  maxGaudi2DevicesPerContainer: number;
  maxWarboyDevicesPerContainer: number;
  maxRNGDDevicesPerContainer: number;
  maxShmPerContainer: number;
  maxFileUploadSize: number;
  allow_image_list: string[];
  blockList: string[];
  inactiveList: string[];
  fasttrackEndpoint: string;
  pluginPages: string;
  domain_name: string;
}

export function getDefaultLoginConfig(): LoginConfigState {
  return {
    signup_support: false,
    allowAnonymousChangePassword: false,
    change_signin_support: false,
    allow_project_resource_monitor: false,
    allow_manual_image_name_for_session: false,
    allow_signout: false,
    login_attempt_limit: 500,
    login_block_time: 180,
    api_endpoint: '',
    api_endpoint_text: '',
    allowSignupWithoutConfirmation: false,
    default_session_environment: '',
    default_import_environment:
      'cr.backend.ai/multiarch/python:3.9-ubuntu20.04',
    maskUserInfo: false,
    singleSignOnVendors: [],
    ssoRealmName: '',
    enableContainerCommit: false,
    appDownloadUrl:
      'https://github.com/lablup/backend.ai-webui/releases/download',
    allowAppDownloadPanel: true,
    systemSSHImage: '',
    defaultFileBrowserImage: '',
    hideAgents: true,
    force2FA: false,
    enablePipeline: false,
    connection_mode: 'SESSION',
    directoryBasedUsage: false,
    maxCountForPreopenPorts: 10,
    allowCustomResourceAllocation: true,
    isDirectorySizeVisible: false,
    eduAppNamePrefix: '',
    enableImportFromHuggingFace: false,
    enableExtendLoginSession: false,
    enableInteractiveLoginAccountSwitch: true,
    enableModelFolders: true,
    enableReservoir: false,
    showNonInstalledImages: false,
    proxy_url: 'http://127.0.0.1:5050/',
    openPortToPublic: false,
    allowPreferredPort: false,
    allowNonAuthTCP: false,
    maxCPUCoresPerContainer: 64,
    maxMemoryPerContainer: 16,
    maxCUDADevicesPerContainer: 16,
    maxCUDASharesPerContainer: 16,
    maxROCMDevicesPerContainer: 10,
    maxTPUDevicesPerContainer: 8,
    maxIPUDevicesPerContainer: 8,
    maxATOMDevicesPerContainer: 8,
    maxGaudi2DevicesPerContainer: 8,
    maxWarboyDevicesPerContainer: 8,
    maxRNGDDevicesPerContainer: 8,
    maxShmPerContainer: 2,
    maxFileUploadSize: -1,
    allow_image_list: [],
    blockList: [],
    inactiveList: [],
    fasttrackEndpoint: '',
    pluginPages: '',
    domain_name: '',
  };
}

export function refreshConfigFromToml(config: any): LoginConfigState {
  const state = getDefaultLoginConfig();

  if (!config) return state;

  const g = config.general;
  const w = config.wsproxy;
  const r = config.resources;
  const e = config.environments;
  const m = config.menu;
  const pi = config.pipeline;
  const pl = config.plugin;

  // -- general section --
  (globalThis as any).backendaiwebui = (globalThis as any).backendaiwebui || {};
  (globalThis as any).backendaiwebui.debug = getConfigValueByExists(g, {
    valueType: 'boolean',
    defaultValue: false,
    value: g?.debug,
  }) as boolean;

  state.signup_support = getConfigValueByExists(g, {
    valueType: 'boolean',
    defaultValue: false,
    value: g?.signupSupport,
  }) as boolean;

  state.allowAnonymousChangePassword = getConfigValueByExists(g, {
    valueType: 'boolean',
    defaultValue: false,
    value: g?.allowAnonymousChangePassword,
  }) as boolean;

  state.change_signin_support = getConfigValueByExists(g, {
    valueType: 'boolean',
    defaultValue: false,
    value: g?.allowChangeSigninMode,
  }) as boolean;

  state.allow_project_resource_monitor = getConfigValueByExists(g, {
    valueType: 'boolean',
    defaultValue: false,
    value: g?.allowProjectResourceMonitor,
  }) as boolean;

  state.allow_manual_image_name_for_session = getConfigValueByExists(g, {
    valueType: 'boolean',
    defaultValue: false,
    value: g?.allowManualImageNameForSession,
  }) as boolean;

  state.allow_signout = getConfigValueByExists(g, {
    valueType: 'boolean',
    defaultValue: false,
    value: g?.allowSignout,
  }) as boolean;

  state.login_attempt_limit = getConfigValueByExists(g, {
    valueType: 'number',
    defaultValue: state.login_attempt_limit,
    value: parseInt(g?.loginAttemptLimit),
  }) as number;

  state.login_block_time = getConfigValueByExists(g, {
    valueType: 'number',
    defaultValue: state.login_block_time,
    value: parseInt(g?.loginBlockTime),
  }) as number;

  state.api_endpoint = getConfigValueByExists(g, {
    valueType: 'string',
    defaultValue: '',
    value: g?.apiEndpoint,
  }) as string;

  state.api_endpoint_text = getConfigValueByExists(g, {
    valueType: 'string',
    defaultValue: '',
    value: g?.apiEndpointText,
  }) as string;

  state.allowSignupWithoutConfirmation = getConfigValueByExists(g, {
    valueType: 'boolean',
    defaultValue: false,
    value: g?.allowSignupWithoutConfirmation,
  }) as boolean;

  state.default_session_environment = getConfigValueByExists(g, {
    valueType: 'string',
    defaultValue: '',
    value: g?.defaultSessionEnvironment,
  }) as string;

  state.default_import_environment = getConfigValueByExists(g, {
    valueType: 'string',
    defaultValue: 'cr.backend.ai/multiarch/python:3.9-ubuntu20.04',
    value: g?.defaultImportEnvironment,
  }) as string;

  state.maskUserInfo = getConfigValueByExists(g, {
    valueType: 'boolean',
    defaultValue: false,
    value: g?.maskUserInfo,
  }) as boolean;

  state.singleSignOnVendors = getConfigValueByExists(g, {
    valueType: 'array',
    defaultValue: [] as string[],
    value: g?.singleSignOnVendors
      ? g.singleSignOnVendors.split(',').map((el: string) => el.trim())
      : [],
  }) as string[];

  state.ssoRealmName = getConfigValueByExists(g, {
    valueType: 'string',
    defaultValue: '',
    value: g?.ssoRealmName ? g.ssoRealmName : '',
  }) as string;

  state.enableContainerCommit = getConfigValueByExists(g, {
    valueType: 'boolean',
    defaultValue: false,
    value: g?.enableContainerCommit,
  }) as boolean;

  state.appDownloadUrl = getConfigValueByExists(g, {
    valueType: 'string',
    defaultValue:
      'https://github.com/lablup/backend.ai-webui/releases/download',
    value: g?.appDownloadUrl,
  }) as string;

  state.allowAppDownloadPanel = getConfigValueByExists(g, {
    valueType: 'boolean',
    defaultValue: true,
    value: g?.allowAppDownloadPanel,
  }) as boolean;

  state.systemSSHImage = getConfigValueByExists(g, {
    valueType: 'string',
    defaultValue: '',
    value: g?.systemSSHImage,
  }) as string;

  state.defaultFileBrowserImage = getConfigValueByExists(g, {
    valueType: 'string',
    defaultValue: '',
    value: g?.defaultFileBrowserImage,
  }) as string;

  state.hideAgents = getConfigValueByExists(g, {
    valueType: 'boolean',
    defaultValue: true,
    value: g?.hideAgents,
  }) as boolean;

  state.force2FA = getConfigValueByExists(g, {
    valueType: 'boolean',
    defaultValue: false,
    value: g?.force2FA,
  }) as boolean;

  state.enablePipeline = getConfigValueByExists(g, {
    valueType: 'boolean',
    defaultValue: false,
    value: false,
  }) as boolean;

  // Connection mode
  const storedConnectionMode = localStorage.getItem(
    'backendaiwebui.connection_mode',
  );
  if (
    (globalThis as any).isElectron &&
    storedConnectionMode !== null &&
    storedConnectionMode !== '' &&
    storedConnectionMode !== '""'
  ) {
    state.connection_mode =
      storedConnectionMode === 'SESSION' ? 'SESSION' : 'API';
  } else {
    state.connection_mode = getConfigValueByExists(g, {
      valueType: 'boolean',
      defaultValue: 'SESSION',
      value: ((g?.connectionMode ?? 'SESSION') as string).toUpperCase() as
        | 'SESSION'
        | 'API',
    }) as 'SESSION' | 'API';
  }

  state.directoryBasedUsage = getConfigValueByExists(g, {
    valueType: 'boolean',
    defaultValue: false,
    value: g?.directoryBasedUsage,
  }) as boolean;

  state.maxCountForPreopenPorts = getConfigValueByExists(g, {
    valueType: 'number',
    defaultValue: state.maxCountForPreopenPorts,
    value: parseInt(g?.maxCountForPreopenPorts),
  }) as number;

  state.allowCustomResourceAllocation = getConfigValueByExists(g, {
    valueType: 'boolean',
    defaultValue: true,
    value: g?.allowCustomResourceAllocation,
  }) as boolean;

  state.isDirectorySizeVisible = getConfigValueByExists(g, {
    valueType: 'boolean',
    defaultValue: false,
    value: g?.isDirectorySizeVisible,
  }) as boolean;

  state.eduAppNamePrefix = getConfigValueByExists(g, {
    valueType: 'string',
    defaultValue: '',
    value: g?.eduAppNamePrefix,
  }) as string;

  state.enableImportFromHuggingFace = getConfigValueByExists(g, {
    valueType: 'boolean',
    defaultValue: false,
    value: g?.enableImportFromHuggingFace,
  }) as boolean;

  state.enableExtendLoginSession = getConfigValueByExists(g, {
    valueType: 'boolean',
    defaultValue: false,
    value: g?.enableExtendLoginSession,
  }) as boolean;

  state.enableInteractiveLoginAccountSwitch = getConfigValueByExists(g, {
    valueType: 'boolean',
    defaultValue: true,
    value: g?.enableInteractiveLoginAccountSwitch,
  }) as boolean;

  state.enableModelFolders = getConfigValueByExists(g, {
    valueType: 'boolean',
    defaultValue: true,
    value: g?.enableModelFolders,
  }) as boolean;

  state.enableReservoir = getConfigValueByExists(g, {
    valueType: 'boolean',
    defaultValue: false,
    value: g?.enableReservoir,
  }) as boolean;

  // -- wsproxy section --
  state.proxy_url = getConfigValueByExists(w, {
    valueType: 'string',
    defaultValue: 'http://127.0.0.1:5050/',
    value: w?.proxyURL,
  }) as string;

  // -- resources section --
  state.openPortToPublic = getConfigValueByExists(r, {
    valueType: 'boolean',
    defaultValue: false,
    value: r?.openPortToPublic,
  }) as boolean;

  state.allowPreferredPort = getConfigValueByExists(r, {
    valueType: 'boolean',
    defaultValue: false,
    value: r?.allowPreferredPort,
  }) as boolean;

  state.allowNonAuthTCP = getConfigValueByExists(r, {
    valueType: 'boolean',
    defaultValue: false,
    value: r?.allowNonAuthTCP,
  }) as boolean;

  state.maxCPUCoresPerContainer = getConfigValueByExists(r, {
    valueType: 'number',
    defaultValue: 64,
    value: parseInt(r?.maxCPUCoresPerContainer ?? ''),
  }) as number;

  state.maxMemoryPerContainer = getConfigValueByExists(r, {
    valueType: 'number',
    defaultValue: 16,
    value: parseInt(r?.maxMemoryPerContainer),
  }) as number;

  state.maxCUDADevicesPerContainer = getConfigValueByExists(r, {
    valueType: 'number',
    defaultValue: 16,
    value: parseInt(r?.maxCUDADevicesPerContainer),
  }) as number;

  state.maxCUDASharesPerContainer = getConfigValueByExists(r, {
    valueType: 'number',
    defaultValue: 16,
    value: parseInt(r?.maxCUDASharesPerContainer),
  }) as number;

  state.maxROCMDevicesPerContainer = getConfigValueByExists(r, {
    valueType: 'number',
    defaultValue: 10,
    value: parseInt(r?.maxROCMDevicesPerContainer),
  }) as number;

  state.maxTPUDevicesPerContainer = getConfigValueByExists(r, {
    valueType: 'number',
    defaultValue: 8,
    value: parseInt(r?.maxTPUDevicesPerContainer),
  }) as number;

  state.maxIPUDevicesPerContainer = getConfigValueByExists(r, {
    valueType: 'number',
    defaultValue: 8,
    value: parseInt(r?.maxIPUDevicesPerContainer),
  }) as number;

  state.maxATOMDevicesPerContainer = getConfigValueByExists(r, {
    valueType: 'number',
    defaultValue: 8,
    value: parseInt(r?.maxATOMDevicesPerContainer),
  }) as number;

  state.maxGaudi2DevicesPerContainer = getConfigValueByExists(r, {
    valueType: 'number',
    defaultValue: 8,
    value: parseInt(r?.maxGaudi2DevicesPerContainer),
  }) as number;

  state.maxWarboyDevicesPerContainer = getConfigValueByExists(r, {
    valueType: 'number',
    defaultValue: 8,
    value: parseInt(r?.maxWarboyDevicesPerContainer),
  }) as number;

  state.maxRNGDDevicesPerContainer = getConfigValueByExists(r, {
    valueType: 'number',
    defaultValue: 8,
    value: parseInt(r?.maxRNGDDevicesPerContainer),
  }) as number;

  state.maxShmPerContainer = getConfigValueByExists(r, {
    valueType: 'number',
    defaultValue: 2,
    value: parseFloat(r?.maxShmPerContainer),
  }) as number;

  state.maxFileUploadSize = getConfigValueByExists(r, {
    valueType: 'number',
    defaultValue: -1,
    value: parseInt(r?.maxFileUploadSize),
  }) as number;

  // -- environments section --
  state.allow_image_list = getConfigValueByExists(e, {
    valueType: 'array',
    defaultValue: [] as string[],
    value: e?.allowlist
      ? e.allowlist.split(',').map((el: string) => el.trim())
      : [],
  }) as string[];

  state.showNonInstalledImages = getConfigValueByExists(e, {
    valueType: 'boolean',
    defaultValue: false,
    value: e?.showNonInstalledImages,
  }) as boolean;

  // -- menu section --
  state.blockList = getConfigValueByExists(m, {
    valueType: 'array',
    defaultValue: [] as string[],
    value: m?.blocklist
      ? m.blocklist.split(',').map((el: string) => el.trim())
      : [],
  }) as string[];

  state.inactiveList = getConfigValueByExists(m, {
    valueType: 'array',
    defaultValue: [] as string[],
    value: m?.inactivelist
      ? m.inactivelist.split(',').map((el: string) => el.trim())
      : [],
  }) as string[];

  // -- pipeline section --
  state.fasttrackEndpoint = getConfigValueByExists(pi, {
    valueType: 'string',
    defaultValue: '',
    value: pi?.frontendEndpoint,
  }) as string;

  // -- plugin section --
  state.pluginPages = getConfigValueByExists(pl, {
    valueType: 'string',
    defaultValue: '',
    value: pl?.page,
  }) as string;

  return state;
}

/**
 * Apply the login configuration state to globalThis.backendaiclient._config
 * after a successful GQL connection.
 */
export function applyConfigToClient(cfg: LoginConfigState): void {
  const client = (globalThis as any).backendaiclient;
  if (!client || !client._config) return;

  client._config._proxyURL = cfg.proxy_url;
  client._config._proxyToken = '';
  client._config.domainName = cfg.domain_name;
  client._config.default_session_environment = cfg.default_session_environment;
  client._config.default_import_environment = cfg.default_import_environment;
  client._config.allow_project_resource_monitor =
    cfg.allow_project_resource_monitor;
  client._config.allow_manual_image_name_for_session =
    cfg.allow_manual_image_name_for_session;
  client._config.openPortToPublic = cfg.openPortToPublic;
  client._config.allowPreferredPort = cfg.allowPreferredPort;
  client._config.allowNonAuthTCP = cfg.allowNonAuthTCP;
  client._config.maxCPUCoresPerContainer = cfg.maxCPUCoresPerContainer;
  client._config.maxMemoryPerContainer = cfg.maxMemoryPerContainer;
  client._config.maxCUDADevicesPerContainer = cfg.maxCUDADevicesPerContainer;
  client._config.maxCUDASharesPerContainer = cfg.maxCUDASharesPerContainer;
  client._config.maxROCMDevicesPerContainer = cfg.maxROCMDevicesPerContainer;
  client._config.maxTPUDevicesPerContainer = cfg.maxTPUDevicesPerContainer;
  client._config.maxIPUDevicesPerContainer = cfg.maxIPUDevicesPerContainer;
  client._config.maxATOMDevicesPerContainer = cfg.maxATOMDevicesPerContainer;
  client._config.maxGaudi2DevicesPerContainer =
    cfg.maxGaudi2DevicesPerContainer;
  client._config.maxWarboyDevicesPerContainer =
    cfg.maxWarboyDevicesPerContainer;
  client._config.maxRNGDDevicesPerContainer = cfg.maxRNGDDevicesPerContainer;
  client._config.maxShmPerContainer = cfg.maxShmPerContainer;
  client._config.maxFileUploadSize = cfg.maxFileUploadSize;
  client._config.allow_image_list = cfg.allow_image_list;
  client._config.showNonInstalledImages = cfg.showNonInstalledImages;
  client._config.maskUserInfo = cfg.maskUserInfo;
  client._config.singleSignOnVendors = cfg.singleSignOnVendors;
  client._config.ssoRealmName = cfg.ssoRealmName;
  client._config.enableContainerCommit = cfg.enableContainerCommit;
  client._config.appDownloadUrl = cfg.appDownloadUrl;
  client._config.allowAppDownloadPanel = cfg.allowAppDownloadPanel;
  client._config.systemSSHImage = cfg.systemSSHImage;
  client._config.defaultFileBrowserImage = cfg.defaultFileBrowserImage;
  client._config.fasttrackEndpoint = cfg.fasttrackEndpoint;
  client._config.hideAgents = cfg.hideAgents;
  client._config.force2FA = cfg.force2FA;
  client._config.directoryBasedUsage = cfg.directoryBasedUsage;
  client._config.maxCountForPreopenPorts = cfg.maxCountForPreopenPorts;
  client._config.allowCustomResourceAllocation =
    cfg.allowCustomResourceAllocation;
  client._config.isDirectorySizeVisible = cfg.isDirectorySizeVisible;
  client._config.enableImportFromHuggingFace = cfg.enableImportFromHuggingFace;
  client._config.enableExtendLoginSession = cfg.enableExtendLoginSession;
  client._config.enableInteractiveLoginAccountSwitch =
    cfg.enableInteractiveLoginAccountSwitch;
  client._config.enableModelFolders = cfg.enableModelFolders;
  client._config.pluginPages = cfg.pluginPages;
  client._config.blockList = cfg.blockList;
  client._config.inactiveList = cfg.inactiveList;
  client._config.allowSignout = cfg.allow_signout;
  client._config.enableReservoir = cfg.enableReservoir;
  client.ready = true;
}
