/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * Login configuration: the code defaults, the few keys `config.toml` still
 * carries, and the copy onto `backendaiclient._config` (ADR 0025).
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
  const isPlaceholder =
    typeof valueObj.value === 'string' &&
    valueObj.value.startsWith('[') &&
    valueObj.value.endsWith(']');
  const defaultConditions: boolean =
    parentsKey === undefined ||
    valueObj.value === undefined ||
    typeof valueObj.value === 'undefined' ||
    valueObj.value === '' ||
    valueObj.value === '""' ||
    valueObj.value === null ||
    isPlaceholder;
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
 * The WebUI configuration: code defaults, overridden by the file-only
 * `config.toml` keys, then by the app config `settings` documents.
 */
export interface LoginConfigState {
  signup_support: boolean;
  allowAnonymousChangePassword: boolean;
  change_signin_support: boolean;
  allow_manual_image_name_for_session: boolean;
  allow_signout: boolean;
  api_endpoint: string;
  allowSignupWithoutConfirmation: boolean;
  default_session_environment: string;
  default_import_environment: string;
  maskUserInfo: boolean;
  singleSignOnVendors: string[];
  ssoRealmName: string;
  enableContainerCommit: boolean;
  appDownloadUrl: string;
  allowAppDownloadPanel: boolean;
  cliDownloadUrl: string;
  allowCLIDownloadPanel: boolean;
  systemSSHImage: string;
  defaultFileBrowserImage: string;
  hideAgents: boolean;
  enablePipeline: boolean;
  connection_mode: 'SESSION' | 'API';
  maxCountForPreopenPorts: number;
  allowCustomResourceAllocation: boolean;
  allowThemeMode: boolean;
  isDirectorySizeVisible: boolean;
  enableExtendLoginSession: boolean;
  enableInteractiveLoginAccountSwitch: boolean;
  enableModelFolders: boolean;
  enableReservoir: boolean;
  enableWebMCP: boolean;
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
  /** Unset unless the file or a document names it, so the launcher falls back to the CUDA cap. */
  maxATOMPLUSDevicesPerContainer?: number;
  maxHyperaccelLPUDevicesPerContainer?: number;
  maxShmPerContainer: number;
  maxFileUploadSize: number;
  storageWarningThreshold: number;
  blockList: string[];
  inactiveList: string[];
  fasttrackEndpoint: string;
  pluginPages: string[];
  loginPlugin: string;
  domain_name: string;
  domain_id: string;
  debug: boolean;
  autoLogout: boolean;
}

export function getDefaultLoginConfig(): LoginConfigState {
  return {
    debug: false,
    autoLogout: false,
    signup_support: false,
    allowAnonymousChangePassword: false,
    change_signin_support: false,
    allow_manual_image_name_for_session: false,
    allow_signout: false,
    api_endpoint: '',
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
    cliDownloadUrl:
      'https://github.com/lablup/backend.ai/releases/latest/download',
    allowCLIDownloadPanel: true,
    systemSSHImage: '',
    defaultFileBrowserImage: '',
    hideAgents: true,
    enablePipeline: false,
    connection_mode: 'SESSION',
    maxCountForPreopenPorts: 10,
    allowCustomResourceAllocation: true,
    allowThemeMode: false,
    isDirectorySizeVisible: false,
    enableExtendLoginSession: false,
    enableInteractiveLoginAccountSwitch: true,
    enableModelFolders: true,
    enableReservoir: false,
    enableWebMCP: true,
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
    maxATOMPLUSDevicesPerContainer: undefined,
    maxHyperaccelLPUDevicesPerContainer: undefined,
    maxShmPerContainer: 2,
    maxFileUploadSize: -1,
    storageWarningThreshold: 90,
    blockList: [],
    inactiveList: [],
    fasttrackEndpoint: '',
    pluginPages: [],
    loginPlugin: '',
    domain_name: '',
    domain_id: '',
  };
}

/**
 * Applies the keys `config.toml` still owns (ADR 0025, section 3) over the code
 * defaults. Every other setting comes from the app config documents.
 */
export function refreshConfigFromToml(config: any): LoginConfigState {
  const state = getDefaultLoginConfig();

  if (!config) return state;

  const g = config.general;
  const w = config.wsproxy;

  state.signup_support = getConfigValueByExists(g, {
    valueType: 'boolean',
    defaultValue: false,
    value: g?.signupSupport,
  }) as boolean;

  state.api_endpoint = getConfigValueByExists(g, {
    valueType: 'string',
    defaultValue: '',
    value: g?.apiEndpoint,
  }) as string;

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
    const connectionModeValue = g?.connectionMode;
    const rawMode =
      typeof connectionModeValue === 'string'
        ? connectionModeValue.toUpperCase()
        : '';
    state.connection_mode =
      rawMode === 'SESSION' || rawMode === 'API' ? rawMode : 'SESSION';
  }

  // Strict: this gate exposes the page to agents, and a quoted "false" is truthy.
  // On when absent: the webserver's config.toml template cannot carry this key.
  state.enableWebMCP = g?.enableWebMCP === undefined || g.enableWebMCP === true;

  state.proxy_url = getConfigValueByExists(w, {
    valueType: 'string',
    defaultValue: state.proxy_url,
    value: w?.proxyURL,
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
  client._config.domainId = cfg.domain_id;
  client._config.default_session_environment = cfg.default_session_environment;
  client._config.default_import_environment = cfg.default_import_environment;
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
  if (cfg.maxATOMPLUSDevicesPerContainer !== undefined) {
    client._config.maxATOMPLUSDevicesPerContainer =
      cfg.maxATOMPLUSDevicesPerContainer;
  }
  if (cfg.maxHyperaccelLPUDevicesPerContainer !== undefined) {
    client._config.maxHyperaccelLPUDevicesPerContainer =
      cfg.maxHyperaccelLPUDevicesPerContainer;
  }
  client._config.maxShmPerContainer = cfg.maxShmPerContainer;
  client._config.maxFileUploadSize = cfg.maxFileUploadSize;
  client._config.storageWarningThreshold = cfg.storageWarningThreshold;
  client._config.showNonInstalledImages = cfg.showNonInstalledImages;
  client._config.maskUserInfo = cfg.maskUserInfo;
  client._config.singleSignOnVendors = cfg.singleSignOnVendors;
  client._config.ssoRealmName = cfg.ssoRealmName;
  client._config.enableContainerCommit = cfg.enableContainerCommit;
  client._config.appDownloadUrl = cfg.appDownloadUrl;
  client._config.allowAppDownloadPanel = cfg.allowAppDownloadPanel;
  client._config.cliDownloadUrl = cfg.cliDownloadUrl;
  client._config.allowCLIDownloadPanel = cfg.allowCLIDownloadPanel;
  client._config.systemSSHImage = cfg.systemSSHImage;
  client._config.defaultFileBrowserImage = cfg.defaultFileBrowserImage;
  client._config.fasttrackEndpoint = cfg.fasttrackEndpoint;
  client._config.hideAgents = cfg.hideAgents;
  client._config.maxCountForPreopenPorts = cfg.maxCountForPreopenPorts;
  client._config.allowCustomResourceAllocation =
    cfg.allowCustomResourceAllocation;
  client._config.allowThemeMode = cfg.allowThemeMode;
  client._config.isDirectorySizeVisible = cfg.isDirectorySizeVisible;
  client._config.enableExtendLoginSession = cfg.enableExtendLoginSession;
  client._config.enableInteractiveLoginAccountSwitch =
    cfg.enableInteractiveLoginAccountSwitch;
  client._config.enableModelFolders = cfg.enableModelFolders;
  client._config.pluginPages = cfg.pluginPages;
  client._config.blockList = cfg.blockList;
  client._config.inactiveList = cfg.inactiveList;
  client._config.allowSignout = cfg.allow_signout;
  client._config.enableReservoir = cfg.enableReservoir;
  client._config.enableWebMCP = cfg.enableWebMCP;
  client.ready = true;
}
