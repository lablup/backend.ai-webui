/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * Comprehensive tests for loginConfig utilities.
 *
 * Coverage:
 * - getDefaultLoginConfig returns proper defaults
 * - refreshConfigFromToml handles various config scenarios
 * - refreshConfigFromToml handles missing/undefined config sections
 * - refreshConfigFromToml properly parses boolean, number, string, and array values
 * - refreshConfigFromToml sets globalThis.backendaiwebui.debug correctly
 * - refreshConfigFromToml handles connection_mode with localStorage and Electron
 * - applyConfigToClient applies configuration to global client object
 * - Edge cases: empty configs, invalid values, NaN handling
 */
import {
  getDefaultLoginConfig,
  refreshConfigFromToml,
  applyConfigToClient,
  type LoginConfigState,
} from './loginConfig';

describe('getDefaultLoginConfig', () => {
  it('should return a config object with all required properties', () => {
    const config = getDefaultLoginConfig();

    // Verify structure
    expect(config).toBeDefined();
    expect(typeof config).toBe('object');

    // Check critical boolean properties
    expect(config.signup_support).toBe(false);
    expect(config.allowAnonymousChangePassword).toBe(false);
    expect(config.change_signin_support).toBe(false);
    expect(config.allow_project_resource_monitor).toBe(false);
    expect(config.allow_manual_image_name_for_session).toBe(false);
    expect(config.allow_signout).toBe(false);
    expect(config.allowSignupWithoutConfirmation).toBe(false);
    expect(config.maskUserInfo).toBe(false);
    expect(config.enableContainerCommit).toBe(false);
    expect(config.allowAppDownloadPanel).toBe(true);
    expect(config.hideAgents).toBe(true);
    expect(config.force2FA).toBe(false);
    expect(config.enablePipeline).toBe(false);
    expect(config.directoryBasedUsage).toBe(false);
    expect(config.allowCustomResourceAllocation).toBe(true);
    expect(config.isDirectorySizeVisible).toBe(false);
    expect(config.enableImportFromHuggingFace).toBe(false);
    expect(config.enableExtendLoginSession).toBe(false);
    expect(config.enableInteractiveLoginAccountSwitch).toBe(true);
    expect(config.enableModelFolders).toBe(true);
    expect(config.enableReservoir).toBe(false);
    expect(config.showNonInstalledImages).toBe(false);
    expect(config.openPortToPublic).toBe(false);
    expect(config.allowPreferredPort).toBe(false);
    expect(config.allowNonAuthTCP).toBe(false);
  });

  it('should return correct numeric default values', () => {
    const config = getDefaultLoginConfig();

    expect(config.login_attempt_limit).toBe(500);
    expect(config.login_block_time).toBe(180);
    expect(config.maxCountForPreopenPorts).toBe(10);
    expect(config.maxCPUCoresPerContainer).toBe(64);
    expect(config.maxMemoryPerContainer).toBe(16);
    expect(config.maxCUDADevicesPerContainer).toBe(16);
    expect(config.maxCUDASharesPerContainer).toBe(16);
    expect(config.maxROCMDevicesPerContainer).toBe(10);
    expect(config.maxTPUDevicesPerContainer).toBe(8);
    expect(config.maxIPUDevicesPerContainer).toBe(8);
    expect(config.maxATOMDevicesPerContainer).toBe(8);
    expect(config.maxGaudi2DevicesPerContainer).toBe(8);
    expect(config.maxWarboyDevicesPerContainer).toBe(8);
    expect(config.maxRNGDDevicesPerContainer).toBe(8);
    expect(config.maxShmPerContainer).toBe(2);
    expect(config.maxFileUploadSize).toBe(-1);
  });

  it('should return correct string default values', () => {
    const config = getDefaultLoginConfig();

    expect(config.api_endpoint).toBe('');
    expect(config.api_endpoint_text).toBe('');
    expect(config.default_session_environment).toBe('');
    expect(config.default_import_environment).toBe(
      'cr.backend.ai/multiarch/python:3.9-ubuntu20.04',
    );
    expect(config.ssoRealmName).toBe('');
    expect(config.appDownloadUrl).toBe(
      'https://github.com/lablup/backend.ai-webui/releases/download',
    );
    expect(config.systemSSHImage).toBe('');
    expect(config.defaultFileBrowserImage).toBe('');
    expect(config.connection_mode).toBe('SESSION');
    expect(config.eduAppNamePrefix).toBe('');
    expect(config.proxy_url).toBe('http://127.0.0.1:5050/');
    expect(config.fasttrackEndpoint).toBe('');
    expect(config.pluginPages).toBe('');
    expect(config.domain_name).toBe('');
  });

  it('should return correct array default values', () => {
    const config = getDefaultLoginConfig();

    expect(Array.isArray(config.singleSignOnVendors)).toBe(true);
    expect(config.singleSignOnVendors).toEqual([]);
    expect(Array.isArray(config.allow_image_list)).toBe(true);
    expect(config.allow_image_list).toEqual([]);
    expect(Array.isArray(config.blockList)).toBe(true);
    expect(config.blockList).toEqual([]);
    expect(Array.isArray(config.inactiveList)).toBe(true);
    expect(config.inactiveList).toEqual([]);
  });
});

describe('refreshConfigFromToml', () => {
  beforeEach(() => {
    // Clean up globalThis before each test
    if ((globalThis as any).backendaiwebui) {
      delete (globalThis as any).backendaiwebui;
    }
    if ((globalThis as any).isElectron) {
      delete (globalThis as any).isElectron;
    }
    localStorage.clear();
  });

  it('should return default config when config is null', () => {
    const result = refreshConfigFromToml(null);
    const defaults = getDefaultLoginConfig();
    expect(result).toEqual(defaults);
  });

  it('should return default config when config is undefined', () => {
    const result = refreshConfigFromToml(undefined);
    const defaults = getDefaultLoginConfig();
    expect(result).toEqual(defaults);
  });

  it('should parse boolean values from general section', () => {
    const config = {
      general: {
        signupSupport: true,
        allowAnonymousChangePassword: true,
        allowChangeSigninMode: true,
        allowProjectResourceMonitor: true,
        allowManualImageNameForSession: true,
        allowSignout: true,
        maskUserInfo: true,
        enableContainerCommit: true,
        force2FA: true,
      },
    };

    const result = refreshConfigFromToml(config);

    expect(result.signup_support).toBe(true);
    expect(result.allowAnonymousChangePassword).toBe(true);
    expect(result.change_signin_support).toBe(true);
    expect(result.allow_project_resource_monitor).toBe(true);
    expect(result.allow_manual_image_name_for_session).toBe(true);
    expect(result.allow_signout).toBe(true);
    expect(result.maskUserInfo).toBe(true);
    expect(result.enableContainerCommit).toBe(true);
    expect(result.force2FA).toBe(true);
  });

  it('should parse numeric values from general section', () => {
    const config = {
      general: {
        loginAttemptLimit: '100',
        loginBlockTime: '300',
        maxCountForPreopenPorts: '20',
      },
    };

    const result = refreshConfigFromToml(config);

    expect(result.login_attempt_limit).toBe(100);
    expect(result.login_block_time).toBe(300);
    expect(result.maxCountForPreopenPorts).toBe(20);
  });

  it('should parse string values from general section', () => {
    const config = {
      general: {
        apiEndpoint: 'https://api.example.com',
        apiEndpointText: 'Example API',
        defaultSessionEnvironment: 'python:3.10',
        ssoRealmName: 'test-realm',
        eduAppNamePrefix: 'edu-',
      },
    };

    const result = refreshConfigFromToml(config);

    expect(result.api_endpoint).toBe('https://api.example.com');
    expect(result.api_endpoint_text).toBe('Example API');
    expect(result.default_session_environment).toBe('python:3.10');
    expect(result.ssoRealmName).toBe('test-realm');
    expect(result.eduAppNamePrefix).toBe('edu-');
  });

  it('should parse array values from general section', () => {
    const config = {
      general: {
        singleSignOnVendors: 'google, github, azure',
      },
    };

    const result = refreshConfigFromToml(config);

    expect(result.singleSignOnVendors).toEqual(['google', 'github', 'azure']);
  });

  it('should handle empty string for singleSignOnVendors', () => {
    const config = {
      general: {
        singleSignOnVendors: '',
      },
    };

    const result = refreshConfigFromToml(config);

    // Empty strings are filtered out by getConfigValueByExists
    expect(result.singleSignOnVendors).toEqual([]);
  });

  it('should parse values from wsproxy section', () => {
    const config = {
      wsproxy: {
        proxyURL: 'http://localhost:8080/',
      },
    };

    const result = refreshConfigFromToml(config);

    expect(result.proxy_url).toBe('http://localhost:8080/');
  });

  it('should parse values from resources section', () => {
    const config = {
      resources: {
        openPortToPublic: true,
        allowPreferredPort: true,
        allowNonAuthTCP: true,
        maxCPUCoresPerContainer: '128',
        maxMemoryPerContainer: '32',
        maxCUDADevicesPerContainer: '8',
        maxShmPerContainer: '4',
        maxFileUploadSize: '1000',
      },
    };

    const result = refreshConfigFromToml(config);

    expect(result.openPortToPublic).toBe(true);
    expect(result.allowPreferredPort).toBe(true);
    expect(result.allowNonAuthTCP).toBe(true);
    expect(result.maxCPUCoresPerContainer).toBe(128);
    expect(result.maxMemoryPerContainer).toBe(32);
    expect(result.maxCUDADevicesPerContainer).toBe(8);
    expect(result.maxShmPerContainer).toBe(4);
    expect(result.maxFileUploadSize).toBe(1000);
  });

  it('should parse values from environments section', () => {
    const config = {
      environments: {
        allowlist: 'python, tensorflow, pytorch',
        showNonInstalledImages: true,
      },
    };

    const result = refreshConfigFromToml(config);

    expect(result.allow_image_list).toEqual([
      'python',
      'tensorflow',
      'pytorch',
    ]);
    expect(result.showNonInstalledImages).toBe(true);
  });

  it('should parse values from menu section', () => {
    const config = {
      menu: {
        blocklist: 'admin, settings',
        inactivelist: 'beta, experimental',
      },
    };

    const result = refreshConfigFromToml(config);

    expect(result.blockList).toEqual(['admin', 'settings']);
    expect(result.inactiveList).toEqual(['beta', 'experimental']);
  });

  it('should parse values from pipeline section', () => {
    const config = {
      pipeline: {
        frontendEndpoint: 'https://pipeline.example.com',
      },
    };

    const result = refreshConfigFromToml(config);

    expect(result.fasttrackEndpoint).toBe('https://pipeline.example.com');
  });

  it('should parse values from plugin section', () => {
    const config = {
      plugin: {
        page: 'custom-pages.js',
      },
    };

    const result = refreshConfigFromToml(config);

    expect(result.pluginPages).toBe('custom-pages.js');
  });

  it('should handle connectionMode case conversion', () => {
    const config = {
      general: {
        connectionMode: 'api',
      },
    };

    const result = refreshConfigFromToml(config);

    expect(result.connection_mode).toBe('API');
  });

  it('should use localStorage connection_mode in Electron environment', () => {
    (globalThis as any).isElectron = true;
    localStorage.setItem('backendaiwebui.connection_mode', 'API');

    const config = {
      general: {
        connectionMode: 'session',
      },
    };

    const result = refreshConfigFromToml(config);

    expect(result.connection_mode).toBe('API');
  });

  it('should use config connection_mode when localStorage is empty in Electron', () => {
    (globalThis as any).isElectron = true;
    localStorage.setItem('backendaiwebui.connection_mode', '');

    const config = {
      general: {
        connectionMode: 'session',
      },
    };

    const result = refreshConfigFromToml(config);

    expect(result.connection_mode).toBe('SESSION');
  });

  it('should set globalThis.backendaiwebui.debug from config', () => {
    const config = {
      general: {
        debug: true,
      },
    };

    refreshConfigFromToml(config);

    expect((globalThis as any).backendaiwebui).toBeDefined();
    expect((globalThis as any).backendaiwebui.debug).toBe(true);
  });

  it('should handle NaN values for numeric fields', () => {
    const config = {
      general: {
        loginAttemptLimit: 'invalid',
        loginBlockTime: 'not-a-number',
      },
    };

    const result = refreshConfigFromToml(config);
    const defaults = getDefaultLoginConfig();

    // Should fall back to defaults when parsing results in NaN
    expect(result.login_attempt_limit).toBe(defaults.login_attempt_limit);
    expect(result.login_block_time).toBe(defaults.login_block_time);
  });

  it('should handle empty string values', () => {
    const config = {
      general: {
        apiEndpoint: '',
        apiEndpointText: '""',
        ssoRealmName: null,
      },
    };

    const result = refreshConfigFromToml(config);

    expect(result.api_endpoint).toBe('');
    expect(result.api_endpoint_text).toBe('');
    expect(result.ssoRealmName).toBe('');
  });

  it('should handle undefined config sections gracefully', () => {
    const config = {
      general: {
        signupSupport: true,
      },
      // missing wsproxy, resources, environments, menu, pipeline, plugin
    };

    const result = refreshConfigFromToml(config);
    const defaults = getDefaultLoginConfig();

    // Should use defaults for missing sections
    expect(result.proxy_url).toBe(defaults.proxy_url);
    expect(result.openPortToPublic).toBe(defaults.openPortToPublic);
    expect(result.allow_image_list).toEqual(defaults.allow_image_list);
    expect(result.blockList).toEqual(defaults.blockList);
    expect(result.fasttrackEndpoint).toBe(defaults.fasttrackEndpoint);
    expect(result.pluginPages).toBe(defaults.pluginPages);

    // But should have the configured value
    expect(result.signup_support).toBe(true);
  });

  it('should handle mixed valid and invalid values', () => {
    const config = {
      general: {
        signupSupport: true,
        loginAttemptLimit: 'invalid',
        apiEndpoint: 'https://valid.com',
      },
      resources: {
        maxCPUCoresPerContainer: '256',
        maxMemoryPerContainer: 'not-a-number',
      },
    };

    const result = refreshConfigFromToml(config);
    const defaults = getDefaultLoginConfig();

    expect(result.signup_support).toBe(true);
    expect(result.api_endpoint).toBe('https://valid.com');
    expect(result.maxCPUCoresPerContainer).toBe(256);

    // Invalid values should fall back to defaults
    expect(result.login_attempt_limit).toBe(defaults.login_attempt_limit);
    expect(result.maxMemoryPerContainer).toBe(defaults.maxMemoryPerContainer);
  });

  it('should handle all GPU device types', () => {
    const config = {
      resources: {
        maxCUDADevicesPerContainer: '4',
        maxCUDASharesPerContainer: '8',
        maxROCMDevicesPerContainer: '2',
        maxTPUDevicesPerContainer: '1',
        maxIPUDevicesPerContainer: '3',
        maxATOMDevicesPerContainer: '5',
        maxGaudi2DevicesPerContainer: '6',
        maxWarboyDevicesPerContainer: '7',
        maxRNGDDevicesPerContainer: '9',
      },
    };

    const result = refreshConfigFromToml(config);

    expect(result.maxCUDADevicesPerContainer).toBe(4);
    expect(result.maxCUDASharesPerContainer).toBe(8);
    expect(result.maxROCMDevicesPerContainer).toBe(2);
    expect(result.maxTPUDevicesPerContainer).toBe(1);
    expect(result.maxIPUDevicesPerContainer).toBe(3);
    expect(result.maxATOMDevicesPerContainer).toBe(5);
    expect(result.maxGaudi2DevicesPerContainer).toBe(6);
    expect(result.maxWarboyDevicesPerContainer).toBe(7);
    expect(result.maxRNGDDevicesPerContainer).toBe(9);
  });
});

describe('applyConfigToClient', () => {
  let mockClient: any;

  beforeEach(() => {
    mockClient = {
      _config: {},
      ready: false,
    };
    (globalThis as any).backendaiclient = mockClient;
  });

  afterEach(() => {
    delete (globalThis as any).backendaiclient;
  });

  it('should do nothing if client is not defined', () => {
    delete (globalThis as any).backendaiclient;
    const config = getDefaultLoginConfig();

    // Should not throw
    expect(() => applyConfigToClient(config)).not.toThrow();
  });

  it('should do nothing if client._config is not defined', () => {
    (globalThis as any).backendaiclient = { ready: false };
    const config = getDefaultLoginConfig();

    // Should not throw
    expect(() => applyConfigToClient(config)).not.toThrow();
  });

  it('should apply all configuration values to client', () => {
    const config: LoginConfigState = {
      ...getDefaultLoginConfig(),
      proxy_url: 'http://custom-proxy:8080/',
      domain_name: 'test-domain',
      default_session_environment: 'python:3.11',
      default_import_environment: 'pytorch:latest',
      allow_project_resource_monitor: true,
      allow_manual_image_name_for_session: true,
      openPortToPublic: true,
      allowPreferredPort: true,
      allowNonAuthTCP: true,
      maxCPUCoresPerContainer: 128,
      maxMemoryPerContainer: 32,
      maxCUDADevicesPerContainer: 8,
      maskUserInfo: true,
      enableContainerCommit: true,
      fasttrackEndpoint: 'https://fasttrack.example.com',
      hideAgents: false,
      force2FA: true,
      allowCustomResourceAllocation: false,
      enableReservoir: true,
    };

    applyConfigToClient(config);

    expect(mockClient._config._proxyURL).toBe('http://custom-proxy:8080/');
    expect(mockClient._config._proxyToken).toBe('');
    expect(mockClient._config.domainName).toBe('test-domain');
    expect(mockClient._config.default_session_environment).toBe('python:3.11');
    expect(mockClient._config.default_import_environment).toBe('pytorch:latest');
    expect(mockClient._config.allow_project_resource_monitor).toBe(true);
    expect(mockClient._config.allow_manual_image_name_for_session).toBe(true);
    expect(mockClient._config.openPortToPublic).toBe(true);
    expect(mockClient._config.allowPreferredPort).toBe(true);
    expect(mockClient._config.allowNonAuthTCP).toBe(true);
    expect(mockClient._config.maxCPUCoresPerContainer).toBe(128);
    expect(mockClient._config.maxMemoryPerContainer).toBe(32);
    expect(mockClient._config.maxCUDADevicesPerContainer).toBe(8);
    expect(mockClient._config.maskUserInfo).toBe(true);
    expect(mockClient._config.enableContainerCommit).toBe(true);
    expect(mockClient._config.fasttrackEndpoint).toBe(
      'https://fasttrack.example.com',
    );
    expect(mockClient._config.hideAgents).toBe(false);
    expect(mockClient._config.force2FA).toBe(true);
    expect(mockClient._config.allowCustomResourceAllocation).toBe(false);
    expect(mockClient._config.enableReservoir).toBe(true);
    expect(mockClient.ready).toBe(true);
  });

  it('should set client.ready to true', () => {
    const config = getDefaultLoginConfig();
    expect(mockClient.ready).toBe(false);

    applyConfigToClient(config);

    expect(mockClient.ready).toBe(true);
  });

  it('should apply array configurations', () => {
    const config: LoginConfigState = {
      ...getDefaultLoginConfig(),
      allow_image_list: ['python', 'tensorflow', 'pytorch'],
      singleSignOnVendors: ['google', 'github'],
      blockList: ['admin'],
      inactiveList: ['beta'],
    };

    applyConfigToClient(config);

    expect(mockClient._config.allow_image_list).toEqual([
      'python',
      'tensorflow',
      'pytorch',
    ]);
    expect(mockClient._config.singleSignOnVendors).toEqual([
      'google',
      'github',
    ]);
    expect(mockClient._config.blockList).toEqual(['admin']);
    expect(mockClient._config.inactiveList).toEqual(['beta']);
  });

  it('should apply all GPU device limits', () => {
    const config: LoginConfigState = {
      ...getDefaultLoginConfig(),
      maxCUDADevicesPerContainer: 4,
      maxCUDASharesPerContainer: 8,
      maxROCMDevicesPerContainer: 2,
      maxTPUDevicesPerContainer: 1,
      maxIPUDevicesPerContainer: 3,
      maxATOMDevicesPerContainer: 5,
      maxGaudi2DevicesPerContainer: 6,
      maxWarboyDevicesPerContainer: 7,
      maxRNGDDevicesPerContainer: 9,
      maxShmPerContainer: 4,
      maxFileUploadSize: 1000,
    };

    applyConfigToClient(config);

    expect(mockClient._config.maxCUDADevicesPerContainer).toBe(4);
    expect(mockClient._config.maxCUDASharesPerContainer).toBe(8);
    expect(mockClient._config.maxROCMDevicesPerContainer).toBe(2);
    expect(mockClient._config.maxTPUDevicesPerContainer).toBe(1);
    expect(mockClient._config.maxIPUDevicesPerContainer).toBe(3);
    expect(mockClient._config.maxATOMDevicesPerContainer).toBe(5);
    expect(mockClient._config.maxGaudi2DevicesPerContainer).toBe(6);
    expect(mockClient._config.maxWarboyDevicesPerContainer).toBe(7);
    expect(mockClient._config.maxRNGDDevicesPerContainer).toBe(9);
    expect(mockClient._config.maxShmPerContainer).toBe(4);
    expect(mockClient._config.maxFileUploadSize).toBe(1000);
  });
});
