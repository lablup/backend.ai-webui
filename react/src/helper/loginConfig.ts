/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * Login configuration: the code defaults, the few keys `config.toml` still
 * carries, and the connection fields copied onto `backendaiclient._config` (ADR 0028).
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
  /** Root of a mirrored user manual; empty opens the hosted one. */
  manualUrl: string;
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
    manualUrl: '',
    pluginPages: [],
    loginPlugin: '',
    domain_name: '',
    domain_id: '',
  };
}

/** The keys config.toml still owns (ADR 0028, section 3); System Settings serves the rest. */
export const FILE_ONLY_CONFIG_KEYS: Readonly<
  Record<string, ReadonlyArray<string>>
> = {
  general: [
    'apiEndpoint',
    'apiDomainName',
    'connectionMode',
    'signupSupport',
    'enableWebMCP',
  ],
  wsproxy: ['proxyURL', 'disableCertCheck'],
  server: ['webServerURL'],
  license: ['edition', 'validUntil'],
};

/**
 * Applies the keys `config.toml` still owns (ADR 0028, section 3) over the code
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
 * Copies the connection fields onto `globalThis.backendaiclient._config` after
 * a successful GQL connection. WebUI settings stay in `loginConfigState` only.
 */
export function applyConfigToClient(cfg: LoginConfigState): void {
  const client = (globalThis as any).backendaiclient;
  if (!client || !client._config) return;

  client._config._proxyURL = cfg.proxy_url;
  client._config._proxyToken = '';
  client._config.domainName = cfg.domain_name;
  client._config.domainId = cfg.domain_id;
  client._config.enableWebMCP = cfg.enableWebMCP;
  client.ready = true;
}
