/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  getDefaultLoginConfig,
  refreshConfigFromToml,
  applyConfigToClient,
  type LoginConfigState,
} from './loginConfig';

describe('loginConfig', () => {
  describe('getDefaultLoginConfig', () => {
    it('should return default configuration with all fields', () => {
      const config = getDefaultLoginConfig();

      expect(config).toBeDefined();
      expect(config.signup_support).toBe(false);
      expect(config.allowAnonymousChangePassword).toBe(false);
      expect(config.login_attempt_limit).toBe(500);
      expect(config.login_block_time).toBe(180);
      expect(config.api_endpoint).toBe('');
      expect(config.connection_mode).toBe('SESSION');
      expect(config.maxCPUCoresPerContainer).toBe(64);
      expect(config.maxMemoryPerContainer).toBe(16);
      expect(config.proxy_url).toBe('http://127.0.0.1:5050/');
      expect(config.allow_image_list).toEqual([]);
      expect(config.singleSignOnVendors).toEqual([]);
      expect(config.blockList).toEqual([]);
      expect(config.inactiveList).toEqual([]);
    });

    it('should return default session environment values', () => {
      const config = getDefaultLoginConfig();

      expect(config.default_session_environment).toBe('');
      expect(config.default_import_environment).toBe(
        'cr.backend.ai/multiarch/python:3.9-ubuntu20.04',
      );
    });

    it('should have default GPU limits configured', () => {
      const config = getDefaultLoginConfig();

      expect(config.maxCUDADevicesPerContainer).toBe(16);
      expect(config.maxCUDASharesPerContainer).toBe(16);
      expect(config.maxROCMDevicesPerContainer).toBe(10);
      expect(config.maxTPUDevicesPerContainer).toBe(8);
      expect(config.maxIPUDevicesPerContainer).toBe(8);
      expect(config.maxATOMDevicesPerContainer).toBe(8);
      expect(config.maxGaudi2DevicesPerContainer).toBe(8);
      expect(config.maxWarboyDevicesPerContainer).toBe(8);
      expect(config.maxRNGDDevicesPerContainer).toBe(8);
    });

    it('should have default feature flags set correctly', () => {
      const config = getDefaultLoginConfig();

      expect(config.hideAgents).toBe(true);
      expect(config.force2FA).toBe(false);
      expect(config.enablePipeline).toBe(false);
      expect(config.directoryBasedUsage).toBe(false);
      expect(config.allowCustomResourceAllocation).toBe(true);
      expect(config.enableModelFolders).toBe(true);
      expect(config.enableReservoir).toBe(false);
      expect(config.showNonInstalledImages).toBe(false);
      expect(config.enableImportFromHuggingFace).toBe(false);
      expect(config.enableExtendLoginSession).toBe(false);
      expect(config.enableInteractiveLoginAccountSwitch).toBe(true);
    });
  });

  describe('refreshConfigFromToml', () => {
    it('should return defaults when config is null', () => {
      const result = refreshConfigFromToml(null);
      const defaults = getDefaultLoginConfig();

      expect(result).toEqual(defaults);
    });

    it('should return defaults when config is undefined', () => {
      const result = refreshConfigFromToml(undefined);
      const defaults = getDefaultLoginConfig();

      expect(result).toEqual(defaults);
    });

    it('should parse general section boolean values', () => {
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
          allowAppDownloadPanel: false,
          hideAgents: false,
          force2FA: true,
          directoryBasedUsage: true,
          allowCustomResourceAllocation: false,
          isDirectorySizeVisible: true,
          enableImportFromHuggingFace: true,
          enableExtendLoginSession: true,
          enableInteractiveLoginAccountSwitch: false,
          enableModelFolders: false,
          enableReservoir: true,
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
      expect(result.allowAppDownloadPanel).toBe(false);
      expect(result.hideAgents).toBe(false);
      expect(result.force2FA).toBe(true);
      expect(result.directoryBasedUsage).toBe(true);
      expect(result.allowCustomResourceAllocation).toBe(false);
      expect(result.isDirectorySizeVisible).toBe(true);
      expect(result.enableImportFromHuggingFace).toBe(true);
      expect(result.enableExtendLoginSession).toBe(true);
      expect(result.enableInteractiveLoginAccountSwitch).toBe(false);
      expect(result.enableModelFolders).toBe(false);
      expect(result.enableReservoir).toBe(true);
    });

    it('should parse general section numeric values', () => {
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

    it('should parse general section string values', () => {
      const config = {
        general: {
          apiEndpoint: 'https://api.backend.ai',
          apiEndpointText: 'Production API',
          defaultSessionEnvironment: 'python:3.9',
          defaultImportEnvironment: 'python:3.11',
          ssoRealmName: 'my-realm',
          appDownloadUrl: 'https://downloads.example.com',
          systemSSHImage: 'ssh:latest',
          defaultFileBrowserImage: 'filebrowser:latest',
          eduAppNamePrefix: 'edu-',
        },
      };

      const result = refreshConfigFromToml(config);

      expect(result.api_endpoint).toBe('https://api.backend.ai');
      expect(result.api_endpoint_text).toBe('Production API');
      expect(result.default_session_environment).toBe('python:3.9');
      expect(result.default_import_environment).toBe('python:3.11');
      expect(result.ssoRealmName).toBe('my-realm');
      expect(result.appDownloadUrl).toBe('https://downloads.example.com');
      expect(result.systemSSHImage).toBe('ssh:latest');
      expect(result.defaultFileBrowserImage).toBe('filebrowser:latest');
      expect(result.eduAppNamePrefix).toBe('edu-');
    });

    it('should parse array values with comma-separated strings', () => {
      const config = {
        general: {
          singleSignOnVendors: 'google, github, saml',
        },
      };

      const result = refreshConfigFromToml(config);

      expect(result.singleSignOnVendors).toEqual(['google', 'github', 'saml']);
    });

    it('should handle empty array values', () => {
      const config = {
        general: {
          singleSignOnVendors: '',
        },
      };

      const result = refreshConfigFromToml(config);

      expect(result.singleSignOnVendors).toEqual([]);
    });

    it('should parse connection mode from config', () => {
      const config = {
        general: {
          connectionMode: 'api',
        },
      };

      const result = refreshConfigFromToml(config);

      expect(result.connection_mode).toBe('API');
    });

    it('should use SESSION as default connection mode', () => {
      const config = {
        general: {},
      };

      const result = refreshConfigFromToml(config);

      expect(result.connection_mode).toBe('SESSION');
    });

    it('should parse wsproxy section', () => {
      const config = {
        wsproxy: {
          proxyURL: 'http://localhost:8080/',
        },
      };

      const result = refreshConfigFromToml(config);

      expect(result.proxy_url).toBe('http://localhost:8080/');
    });

    it('should parse resources section boolean flags', () => {
      const config = {
        resources: {
          openPortToPublic: true,
          allowPreferredPort: true,
          allowNonAuthTCP: true,
        },
      };

      const result = refreshConfigFromToml(config);

      expect(result.openPortToPublic).toBe(true);
      expect(result.allowPreferredPort).toBe(true);
      expect(result.allowNonAuthTCP).toBe(true);
    });

    it('should parse resources section numeric limits', () => {
      const config = {
        resources: {
          maxCPUCoresPerContainer: '32',
          maxMemoryPerContainer: '32',
          maxCUDADevicesPerContainer: '8',
          maxCUDASharesPerContainer: '8',
          maxROCMDevicesPerContainer: '4',
          maxTPUDevicesPerContainer: '4',
          maxIPUDevicesPerContainer: '4',
          maxATOMDevicesPerContainer: '4',
          maxGaudi2DevicesPerContainer: '4',
          maxWarboyDevicesPerContainer: '4',
          maxRNGDDevicesPerContainer: '4',
          maxShmPerContainer: '4.5',
          maxFileUploadSize: '10737418240',
        },
      };

      const result = refreshConfigFromToml(config);

      expect(result.maxCPUCoresPerContainer).toBe(32);
      expect(result.maxMemoryPerContainer).toBe(32);
      expect(result.maxCUDADevicesPerContainer).toBe(8);
      expect(result.maxCUDASharesPerContainer).toBe(8);
      expect(result.maxROCMDevicesPerContainer).toBe(4);
      expect(result.maxTPUDevicesPerContainer).toBe(4);
      expect(result.maxIPUDevicesPerContainer).toBe(4);
      expect(result.maxATOMDevicesPerContainer).toBe(4);
      expect(result.maxGaudi2DevicesPerContainer).toBe(4);
      expect(result.maxWarboyDevicesPerContainer).toBe(4);
      expect(result.maxRNGDDevicesPerContainer).toBe(4);
      expect(result.maxShmPerContainer).toBe(4.5);
      expect(result.maxFileUploadSize).toBe(10737418240);
    });

    it('should parse environments section', () => {
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

    it('should parse menu section', () => {
      const config = {
        menu: {
          blocklist: 'agent, superadmin',
          inactivelist: 'pipeline, serving',
        },
      };

      const result = refreshConfigFromToml(config);

      expect(result.blockList).toEqual(['agent', 'superadmin']);
      expect(result.inactiveList).toEqual(['pipeline', 'serving']);
    });

    it('should parse pipeline section', () => {
      const config = {
        pipeline: {
          frontendEndpoint: 'https://pipeline.backend.ai',
        },
      };

      const result = refreshConfigFromToml(config);

      expect(result.fasttrackEndpoint).toBe('https://pipeline.backend.ai');
    });

    it('should parse plugin section', () => {
      const config = {
        plugin: {
          page: 'my-plugin-page',
        },
      };

      const result = refreshConfigFromToml(config);

      expect(result.pluginPages).toBe('my-plugin-page');
    });

    it('should handle invalid numeric values with defaults', () => {
      const config = {
        general: {
          loginAttemptLimit: 'invalid',
          loginBlockTime: 'NaN',
        },
        resources: {
          maxCPUCoresPerContainer: 'not-a-number',
        },
      };

      const result = refreshConfigFromToml(config);
      const defaults = getDefaultLoginConfig();

      expect(result.login_attempt_limit).toBe(defaults.login_attempt_limit);
      expect(result.login_block_time).toBe(defaults.login_block_time);
      expect(result.maxCPUCoresPerContainer).toBe(
        defaults.maxCPUCoresPerContainer,
      );
    });

    it('should handle empty string values with defaults', () => {
      const config = {
        general: {
          apiEndpoint: '',
          ssoRealmName: '""',
        },
      };

      const result = refreshConfigFromToml(config);

      expect(result.api_endpoint).toBe('');
      expect(result.ssoRealmName).toBe('');
    });

    it('should set backendaiwebui.debug global variable', () => {
      const config = {
        general: {
          debug: true,
        },
      };

      (globalThis as any).backendaiwebui = {};
      refreshConfigFromToml(config);

      expect((globalThis as any).backendaiwebui.debug).toBe(true);

      // Cleanup
      delete (globalThis as any).backendaiwebui;
    });

    it('should handle undefined sections gracefully', () => {
      const config = {
        general: {
          signupSupport: true,
        },
        // wsproxy, resources, environments, menu, pipeline, plugin sections missing
      };

      const result = refreshConfigFromToml(config);
      const defaults = getDefaultLoginConfig();

      expect(result.signup_support).toBe(true);
      expect(result.proxy_url).toBe(defaults.proxy_url);
      expect(result.maxCPUCoresPerContainer).toBe(
        defaults.maxCPUCoresPerContainer,
      );
      expect(result.allow_image_list).toEqual(defaults.allow_image_list);
      expect(result.blockList).toEqual(defaults.blockList);
      expect(result.fasttrackEndpoint).toBe(defaults.fasttrackEndpoint);
      expect(result.pluginPages).toBe(defaults.pluginPages);
    });
  });

  describe('applyConfigToClient', () => {
    let mockClient: any;

    beforeEach(() => {
      mockClient = {
        _config: {
          _proxyURL: '',
          _proxyToken: '',
          domainName: '',
          default_session_environment: '',
          default_import_environment: '',
          allow_project_resource_monitor: false,
          allow_manual_image_name_for_session: false,
          openPortToPublic: false,
          allowPreferredPort: false,
          allowNonAuthTCP: false,
          maxCPUCoresPerContainer: 0,
          maxMemoryPerContainer: 0,
          maxCUDADevicesPerContainer: 0,
          maxCUDASharesPerContainer: 0,
          maxROCMDevicesPerContainer: 0,
          maxTPUDevicesPerContainer: 0,
          maxIPUDevicesPerContainer: 0,
          maxATOMDevicesPerContainer: 0,
          maxGaudi2DevicesPerContainer: 0,
          maxWarboyDevicesPerContainer: 0,
          maxRNGDDevicesPerContainer: 0,
          maxShmPerContainer: 0,
          maxFileUploadSize: 0,
          allow_image_list: [],
          showNonInstalledImages: false,
          maskUserInfo: false,
          singleSignOnVendors: [],
          ssoRealmName: '',
          enableContainerCommit: false,
          appDownloadUrl: '',
          allowAppDownloadPanel: false,
          systemSSHImage: '',
          defaultFileBrowserImage: '',
          fasttrackEndpoint: '',
          hideAgents: false,
          force2FA: false,
          directoryBasedUsage: false,
          maxCountForPreopenPorts: 0,
          allowCustomResourceAllocation: false,
          isDirectorySizeVisible: false,
          enableImportFromHuggingFace: false,
          enableExtendLoginSession: false,
          enableInteractiveLoginAccountSwitch: false,
          enableModelFolders: false,
          pluginPages: '',
          blockList: [],
          inactiveList: [],
          allowSignout: false,
          enableReservoir: false,
        },
        ready: false,
      };
      (globalThis as any).backendaiclient = mockClient;
    });

    afterEach(() => {
      delete (globalThis as any).backendaiclient;
    });

    it('should apply config to client _config object', () => {
      const config: LoginConfigState = {
        ...getDefaultLoginConfig(),
        proxy_url: 'http://proxy:8080/',
        domain_name: 'test-domain',
        default_session_environment: 'python:3.9',
        default_import_environment: 'python:3.11',
        allow_project_resource_monitor: true,
        allow_manual_image_name_for_session: true,
        openPortToPublic: true,
        allowPreferredPort: true,
        allowNonAuthTCP: true,
        maxCPUCoresPerContainer: 32,
        maxMemoryPerContainer: 64,
        maskUserInfo: true,
        hideAgents: false,
        force2FA: true,
        allowSignout: true,
        enableReservoir: true,
      };

      applyConfigToClient(config);

      expect(mockClient._config._proxyURL).toBe('http://proxy:8080/');
      expect(mockClient._config._proxyToken).toBe('');
      expect(mockClient._config.domainName).toBe('test-domain');
      expect(mockClient._config.default_session_environment).toBe('python:3.9');
      expect(mockClient._config.default_import_environment).toBe('python:3.11');
      expect(mockClient._config.allow_project_resource_monitor).toBe(true);
      expect(mockClient._config.allow_manual_image_name_for_session).toBe(true);
      expect(mockClient._config.openPortToPublic).toBe(true);
      expect(mockClient._config.allowPreferredPort).toBe(true);
      expect(mockClient._config.allowNonAuthTCP).toBe(true);
      expect(mockClient._config.maxCPUCoresPerContainer).toBe(32);
      expect(mockClient._config.maxMemoryPerContainer).toBe(64);
      expect(mockClient._config.maskUserInfo).toBe(true);
      expect(mockClient._config.hideAgents).toBe(false);
      expect(mockClient._config.force2FA).toBe(true);
      // Note: allowSignout is set via allow_signout in the config state
      expect(mockClient._config.enableReservoir).toBe(true);
      expect(mockClient.ready).toBe(true);
    });

    it('should apply GPU limits to client config', () => {
      const config: LoginConfigState = {
        ...getDefaultLoginConfig(),
        maxCUDADevicesPerContainer: 8,
        maxCUDASharesPerContainer: 8,
        maxROCMDevicesPerContainer: 4,
        maxTPUDevicesPerContainer: 4,
        maxIPUDevicesPerContainer: 4,
        maxATOMDevicesPerContainer: 4,
        maxGaudi2DevicesPerContainer: 4,
        maxWarboyDevicesPerContainer: 4,
        maxRNGDDevicesPerContainer: 4,
        maxShmPerContainer: 2.5,
        maxFileUploadSize: 1073741824,
      };

      applyConfigToClient(config);

      expect(mockClient._config.maxCUDADevicesPerContainer).toBe(8);
      expect(mockClient._config.maxCUDASharesPerContainer).toBe(8);
      expect(mockClient._config.maxROCMDevicesPerContainer).toBe(4);
      expect(mockClient._config.maxTPUDevicesPerContainer).toBe(4);
      expect(mockClient._config.maxIPUDevicesPerContainer).toBe(4);
      expect(mockClient._config.maxATOMDevicesPerContainer).toBe(4);
      expect(mockClient._config.maxGaudi2DevicesPerContainer).toBe(4);
      expect(mockClient._config.maxWarboyDevicesPerContainer).toBe(4);
      expect(mockClient._config.maxRNGDDevicesPerContainer).toBe(4);
      expect(mockClient._config.maxShmPerContainer).toBe(2.5);
      expect(mockClient._config.maxFileUploadSize).toBe(1073741824);
    });

    it('should apply array configurations', () => {
      const config: LoginConfigState = {
        ...getDefaultLoginConfig(),
        allow_image_list: ['python', 'tensorflow'],
        singleSignOnVendors: ['google', 'github'],
        blockList: ['agent', 'superadmin'],
        inactiveList: ['pipeline'],
      };

      applyConfigToClient(config);

      expect(mockClient._config.allow_image_list).toEqual([
        'python',
        'tensorflow',
      ]);
      expect(mockClient._config.singleSignOnVendors).toEqual([
        'google',
        'github',
      ]);
      expect(mockClient._config.blockList).toEqual(['agent', 'superadmin']);
      expect(mockClient._config.inactiveList).toEqual(['pipeline']);
    });

    it('should apply feature flags to client config', () => {
      const config: LoginConfigState = {
        ...getDefaultLoginConfig(),
        enableContainerCommit: true,
        directoryBasedUsage: true,
        allowCustomResourceAllocation: false,
        isDirectorySizeVisible: true,
        enableImportFromHuggingFace: true,
        enableExtendLoginSession: true,
        enableInteractiveLoginAccountSwitch: false,
        enableModelFolders: false,
      };

      applyConfigToClient(config);

      expect(mockClient._config.enableContainerCommit).toBe(true);
      expect(mockClient._config.directoryBasedUsage).toBe(true);
      expect(mockClient._config.allowCustomResourceAllocation).toBe(false);
      expect(mockClient._config.isDirectorySizeVisible).toBe(true);
      expect(mockClient._config.enableImportFromHuggingFace).toBe(true);
      expect(mockClient._config.enableExtendLoginSession).toBe(true);
      expect(mockClient._config.enableInteractiveLoginAccountSwitch).toBe(
        false,
      );
      expect(mockClient._config.enableModelFolders).toBe(false);
    });

    it('should set client ready flag to true', () => {
      const config = getDefaultLoginConfig();

      expect(mockClient.ready).toBe(false);
      applyConfigToClient(config);
      expect(mockClient.ready).toBe(true);
    });

    it('should do nothing if client is not defined', () => {
      delete (globalThis as any).backendaiclient;

      const config = getDefaultLoginConfig();

      // Should not throw
      expect(() => applyConfigToClient(config)).not.toThrow();
    });

    it('should do nothing if client._config is not defined', () => {
      (globalThis as any).backendaiclient = {};

      const config = getDefaultLoginConfig();

      // Should not throw
      expect(() => applyConfigToClient(config)).not.toThrow();
    });
  });
});
