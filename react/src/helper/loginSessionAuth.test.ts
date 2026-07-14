/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  createBackendAIClient,
  checkLoginSession,
  connectViaGQL,
  tokenLogin,
  loadConfigFromWebServer,
  loginWithSAML,
  loginWithOpenID,
} from './loginSessionAuth';
import { getDefaultLoginConfig } from './loginConfig';

describe('loginSessionAuth', () => {
  describe('createBackendAIClient', () => {
    beforeEach(() => {
      // Mock BackendAI SDK classes
      (globalThis as any).BackendAIClientConfig = jest.fn((
        userId,
        password,
        apiEndpoint,
        mode,
      ) => ({
        userId,
        password,
        apiEndpoint,
        mode,
      }));

      (globalThis as any).BackendAIClient = jest.fn((config, appName) => ({
        _config: config,
        appName,
      }));
    });

    afterEach(() => {
      delete (globalThis as any).BackendAIClientConfig;
      delete (globalThis as any).BackendAIClient;
    });

    it('should create client with SESSION mode by default', () => {
      const result = createBackendAIClient(
        'user@example.com',
        'password123',
        'https://api.backend.ai',
      );

      expect(result.client).toBeDefined();
      expect(result.clientConfig).toBeDefined();
      expect((globalThis as any).BackendAIClientConfig).toHaveBeenCalledWith(
        'user@example.com',
        'password123',
        'https://api.backend.ai',
        'SESSION',
      );
      expect((globalThis as any).BackendAIClient).toHaveBeenCalledWith(
        result.clientConfig,
        'Backend.AI Console.',
      );
    });

    it('should create client with API mode when specified', () => {
      const result = createBackendAIClient(
        'user@example.com',
        'password123',
        'https://api.backend.ai',
        'API',
      );

      expect((globalThis as any).BackendAIClientConfig).toHaveBeenCalledWith(
        'user@example.com',
        'password123',
        'https://api.backend.ai',
        undefined, // API mode passes undefined
      );
    });

    it('should create client with SESSION mode when explicitly specified', () => {
      const result = createBackendAIClient(
        'user@example.com',
        'password123',
        'https://api.backend.ai',
        'SESSION',
      );

      expect((globalThis as any).BackendAIClientConfig).toHaveBeenCalledWith(
        'user@example.com',
        'password123',
        'https://api.backend.ai',
        'SESSION',
      );
    });
  });

  describe('checkLoginSession', () => {
    let mockClient: any;

    beforeEach(() => {
      mockClient = {
        get_manager_version: jest.fn(),
        check_login: jest.fn(),
      };

      (globalThis as any).BackendAIClientConfig = jest.fn();
      (globalThis as any).BackendAIClient = jest.fn(() => mockClient);
    });

    afterEach(() => {
      delete (globalThis as any).BackendAIClientConfig;
      delete (globalThis as any).BackendAIClient;
    });

    it('should return false when apiEndpoint is empty', async () => {
      const result = await checkLoginSession('');

      expect(result).toBe(false);
      expect(mockClient.get_manager_version).not.toHaveBeenCalled();
    });

    it('should return true when session is logged in', async () => {
      mockClient.get_manager_version.mockResolvedValue('24.03.0');
      mockClient.check_login.mockResolvedValue(true);

      const result = await checkLoginSession('https://api.backend.ai');

      expect(result).toBe(true);
      expect(mockClient.get_manager_version).toHaveBeenCalled();
      expect(mockClient.check_login).toHaveBeenCalled();
    });

    it('should return false when session is not logged in', async () => {
      mockClient.get_manager_version.mockResolvedValue('24.03.0');
      mockClient.check_login.mockResolvedValue(false);

      const result = await checkLoginSession('https://api.backend.ai');

      expect(result).toBe(false);
    });

    it('should return false when check_login returns null', async () => {
      mockClient.get_manager_version.mockResolvedValue('24.03.0');
      mockClient.check_login.mockResolvedValue(null);

      const result = await checkLoginSession('https://api.backend.ai');

      expect(result).toBe(false);
    });

    it('should return false when get_manager_version throws error', async () => {
      mockClient.get_manager_version.mockRejectedValue(
        new Error('Network error'),
      );

      const result = await checkLoginSession('https://api.backend.ai');

      expect(result).toBe(false);
    });

    it('should return false when check_login throws error', async () => {
      mockClient.get_manager_version.mockResolvedValue('24.03.0');
      mockClient.check_login.mockRejectedValue(new Error('Auth error'));

      const result = await checkLoginSession('https://api.backend.ai');

      expect(result).toBe(false);
    });
  });

  describe('connectViaGQL', () => {
    let mockClient: any;
    const testConfig = getDefaultLoginConfig();
    const testEndpoints = ['https://api1.backend.ai', 'https://api2.backend.ai'];

    beforeEach(() => {
      mockClient = {
        query: jest.fn(),
        logout: jest.fn(),
        group: {
          list: jest.fn(),
        },
        _config: {
          endpoint: 'https://api.backend.ai',
        },
      };

      (globalThis as any).backendaiutils = {
        _readRecentProjectGroup: jest.fn(),
      };

      (globalThis as any).backendaioptions = {
        set: jest.fn(),
      };
    });

    afterEach(() => {
      delete (globalThis as any).backendaiclient;
      delete (globalThis as any).backendaiutils;
      delete (globalThis as any).backendaioptions;
    });

    it('should successfully connect and setup client', async () => {
      mockClient.query
        .mockResolvedValueOnce({
          keypair: {
            user_id: 'user123',
            resource_policy: 'default',
            user: 'user-uuid',
          },
        })
        .mockResolvedValueOnce({
          user: {
            username: 'testuser',
            email: 'test@example.com',
            full_name: 'Test User',
            is_active: true,
            role: 'user',
            domain_name: 'default',
            groups: [
              { id: 'group1', name: 'project1' },
              { id: 'group2', name: 'project2' },
            ],
            need_password_change: false,
            uuid: 'user-uuid',
          },
        });

      mockClient.group.list.mockResolvedValue({
        groups: [
          { id: 'group1', name: 'project1', description: '', is_active: true },
          { id: 'group2', name: 'project2', description: '', is_active: true },
        ],
      });

      (globalThis as any).backendaiutils._readRecentProjectGroup.mockReturnValue(
        'project1',
      );

      const result = await connectViaGQL(mockClient, testConfig, testEndpoints);

      expect((globalThis as any).backendaiclient).toBe(mockClient);
      expect(mockClient.email).toBe('test@example.com');
      expect(mockClient.user_uuid).toBe('user-uuid');
      expect(mockClient.full_name).toBe('Test User');
      expect(mockClient.is_admin).toBe(false);
      expect(mockClient.is_superadmin).toBe(false);
      expect(mockClient.groups).toEqual(['project1', 'project2']);
      expect(mockClient.current_group).toBe('project1');
      expect(mockClient.ready).toBe(true);
      // Endpoint is added to list since it's not already present
      expect(result).toContain('https://api.backend.ai');
      expect(result.length).toBe(testEndpoints.length + 1);
    });

    it('should set is_admin for admin role', async () => {
      mockClient.query
        .mockResolvedValueOnce({
          keypair: {
            user_id: 'admin123',
            resource_policy: 'admin',
            user: 'admin-uuid',
          },
        })
        .mockResolvedValueOnce({
          user: {
            username: 'adminuser',
            email: 'admin@example.com',
            full_name: 'Admin User',
            is_active: true,
            role: 'admin',
            domain_name: 'default',
            groups: [{ id: 'group1', name: 'admin-group' }],
            need_password_change: false,
            uuid: 'admin-uuid',
          },
        });

      mockClient.group.list.mockResolvedValue({
        groups: [
          {
            id: 'group1',
            name: 'admin-group',
            description: '',
            is_active: true,
          },
        ],
      });

      await connectViaGQL(mockClient, testConfig, testEndpoints);

      expect(mockClient.is_admin).toBe(true);
      expect(mockClient.is_superadmin).toBe(false);
    });

    it('should set is_superadmin for superadmin role', async () => {
      mockClient.query
        .mockResolvedValueOnce({
          keypair: {
            user_id: 'superadmin123',
            resource_policy: 'superadmin',
            user: 'superadmin-uuid',
          },
        })
        .mockResolvedValueOnce({
          user: {
            username: 'superadmin',
            email: 'superadmin@example.com',
            full_name: 'Super Admin',
            is_active: true,
            role: 'superadmin',
            domain_name: 'default',
            groups: [],
            need_password_change: false,
            uuid: 'superadmin-uuid',
          },
        });

      mockClient.group.list.mockResolvedValue({ groups: null });

      await connectViaGQL(mockClient, testConfig, testEndpoints);

      expect(mockClient.is_admin).toBe(true);
      expect(mockClient.is_superadmin).toBe(true);
    });

    it('should use default group when no recent group found', async () => {
      mockClient.query
        .mockResolvedValueOnce({
          keypair: {
            user_id: 'user123',
            resource_policy: 'default',
            user: 'user-uuid',
          },
        })
        .mockResolvedValueOnce({
          user: {
            username: 'testuser',
            email: 'test@example.com',
            full_name: 'Test User',
            is_active: true,
            role: 'user',
            domain_name: 'default',
            groups: [{ id: 'group1', name: 'project1' }],
            need_password_change: false,
            uuid: 'user-uuid',
          },
        });

      mockClient.group.list.mockResolvedValue({
        groups: [
          { id: 'group1', name: 'project1', description: '', is_active: true },
        ],
      });

      (globalThis as any).backendaiutils._readRecentProjectGroup.mockReturnValue(
        null,
      );

      await connectViaGQL(mockClient, testConfig, testEndpoints);

      expect(mockClient.current_group).toBe('project1');
    });

    it('should set default group when group list is null', async () => {
      mockClient.query
        .mockResolvedValueOnce({
          keypair: {
            user_id: 'user123',
            resource_policy: 'default',
            user: 'user-uuid',
          },
        })
        .mockResolvedValueOnce({
          user: {
            username: 'testuser',
            email: 'test@example.com',
            full_name: 'Test User',
            is_active: true,
            role: 'user',
            domain_name: 'default',
            groups: [],
            need_password_change: false,
            uuid: 'user-uuid',
          },
        });

      mockClient.group.list.mockResolvedValue({ groups: null });

      await connectViaGQL(mockClient, testConfig, testEndpoints);

      expect(mockClient.groups).toEqual(['default']);
    });

    it('should add endpoint to list if not present', async () => {
      mockClient.query
        .mockResolvedValueOnce({
          keypair: {
            user_id: 'user123',
            resource_policy: 'default',
            user: 'user-uuid',
          },
        })
        .mockResolvedValueOnce({
          user: {
            username: 'testuser',
            email: 'test@example.com',
            full_name: 'Test User',
            is_active: true,
            role: 'user',
            domain_name: 'default',
            groups: [{ id: 'group1', name: 'project1' }],
            need_password_change: false,
            uuid: 'user-uuid',
          },
        });

      mockClient.group.list.mockResolvedValue({
        groups: [
          { id: 'group1', name: 'project1', description: '', is_active: true },
        ],
      });

      mockClient._config.endpoint = 'https://new-api.backend.ai';

      const result = await connectViaGQL(mockClient, testConfig, testEndpoints);

      expect(result).toContain('https://new-api.backend.ai');
      expect((globalThis as any).backendaioptions.set).toHaveBeenCalledWith(
        'endpoints',
        expect.arrayContaining(['https://new-api.backend.ai']),
      );
    });

    it('should limit endpoint history to 5 items', async () => {
      mockClient.query
        .mockResolvedValueOnce({
          keypair: {
            user_id: 'user123',
            resource_policy: 'default',
            user: 'user-uuid',
          },
        })
        .mockResolvedValueOnce({
          user: {
            username: 'testuser',
            email: 'test@example.com',
            full_name: 'Test User',
            is_active: true,
            role: 'user',
            domain_name: 'default',
            groups: [{ id: 'group1', name: 'project1' }],
            need_password_change: false,
            uuid: 'user-uuid',
          },
        });

      mockClient.group.list.mockResolvedValue({
        groups: [
          { id: 'group1', name: 'project1', description: '', is_active: true },
        ],
      });

      const longEndpoints = [
        'https://api1.backend.ai',
        'https://api2.backend.ai',
        'https://api3.backend.ai',
        'https://api4.backend.ai',
        'https://api5.backend.ai',
      ];

      mockClient._config.endpoint = 'https://new-api.backend.ai';

      const result = await connectViaGQL(
        mockClient,
        testConfig,
        longEndpoints,
      );

      expect(result.length).toBe(5);
      expect(result[4]).toBe('https://new-api.backend.ai');
      expect(result).not.toContain('https://api1.backend.ai');
    });

    it('should throw error when keypair is missing', async () => {
      mockClient.query.mockResolvedValueOnce({});

      await expect(
        connectViaGQL(mockClient, testConfig, testEndpoints),
      ).rejects.toThrow('Keypair information is missing.');

      expect(mockClient.logout).toHaveBeenCalled();
    });

    it('should create current_group_id function', async () => {
      mockClient.query
        .mockResolvedValueOnce({
          keypair: {
            user_id: 'user123',
            resource_policy: 'default',
            user: 'user-uuid',
          },
        })
        .mockResolvedValueOnce({
          user: {
            username: 'testuser',
            email: 'test@example.com',
            full_name: 'Test User',
            is_active: true,
            role: 'user',
            domain_name: 'default',
            groups: [
              { id: 'group1', name: 'project1' },
              { id: 'group2', name: 'project2' },
            ],
            need_password_change: false,
            uuid: 'user-uuid',
          },
        });

      mockClient.group.list.mockResolvedValue({
        groups: [
          { id: 'group1', name: 'project1', description: '', is_active: true },
          { id: 'group2', name: 'project2', description: '', is_active: true },
        ],
      });

      (globalThis as any).backendaiutils._readRecentProjectGroup.mockReturnValue(
        'project2',
      );

      await connectViaGQL(mockClient, testConfig, testEndpoints);

      expect(mockClient.current_group).toBe('project2');
      expect(mockClient.current_group_id).toBeDefined();
      expect(typeof mockClient.current_group_id).toBe('function');
      expect(mockClient.current_group_id()).toBe('group2');
    });
  });

  describe('tokenLogin', () => {
    let mockClient: any;

    beforeEach(() => {
      mockClient = {
        token_login: jest.fn(),
        query: jest.fn(),
        group: {
          list: jest.fn(),
        },
        _config: {
          endpoint: 'https://api.backend.ai',
        },
      };

      (globalThis as any).backendaiutils = {
        _readRecentProjectGroup: jest.fn(),
      };

      (globalThis as any).backendaioptions = {
        set: jest.fn(),
      };
    });

    afterEach(() => {
      delete (globalThis as any).backendaiclient;
      delete (globalThis as any).backendaiutils;
      delete (globalThis as any).backendaioptions;
    });

    it('should login with token and connect via GQL', async () => {
      mockClient.token_login.mockResolvedValue(true);
      mockClient.query
        .mockResolvedValueOnce({
          keypair: {
            user_id: 'user123',
            resource_policy: 'default',
            user: 'user-uuid',
          },
        })
        .mockResolvedValueOnce({
          user: {
            username: 'testuser',
            email: 'test@example.com',
            full_name: 'Test User',
            is_active: true,
            role: 'user',
            domain_name: 'default',
            groups: [{ id: 'group1', name: 'project1' }],
            need_password_change: false,
            uuid: 'user-uuid',
          },
        });

      mockClient.group.list.mockResolvedValue({
        groups: [
          { id: 'group1', name: 'project1', description: '', is_active: true },
        ],
      });

      const config = getDefaultLoginConfig();
      const endpoints = ['https://api.backend.ai'];

      const result = await tokenLogin(mockClient, 'test-token', config, endpoints);

      expect(mockClient.token_login).toHaveBeenCalledWith('test-token');
      expect(result).toBeDefined();
      expect((globalThis as any).backendaiclient).toBe(mockClient);
    });

    it('should throw error when token login fails', async () => {
      mockClient.token_login.mockResolvedValue(false);

      const config = getDefaultLoginConfig();
      const endpoints = ['https://api.backend.ai'];

      await expect(
        tokenLogin(mockClient, 'invalid-token', config, endpoints),
      ).rejects.toThrow('Cannot authorize session by token.');
    });
  });

  describe('loadConfigFromWebServer', () => {
    it('should skip config loading when URL starts with apiEndpoint', async () => {
      // When window.location.href starts with the apiEndpoint, 
      // config loading should be skipped
      await loadConfigFromWebServer('https://api.backend.ai');
      // Function returns early, no error should occur
    });

    it('should skip config loading for invalid URL protocols', async () => {
      // Invalid protocols should be rejected for security
      await loadConfigFromWebServer('javascript:alert(1)');
      await loadConfigFromWebServer('data:text/html,<script>alert(1)</script>');
      await loadConfigFromWebServer('file:///etc/passwd');
      // Functions return early, no error should occur
    });

    it('should skip config loading for malformed URLs', async () => {
      // Malformed URLs should be handled gracefully
      await loadConfigFromWebServer('not-a-valid-url');
      // Function returns early, no error should occur
    });
  });

  describe('loginWithSAML', () => {
    let mockClient: any;

    beforeEach(() => {
      mockClient = {
        newUnsignedRequest: jest.fn(),
      };

      // Mock DOM methods
      document.createElement = jest.fn((tagName) => {
        const element: any = {
          tagName,
          appendChild: jest.fn(),
          setAttribute: jest.fn(),
          submit: jest.fn(),
        };
        return element;
      });

      document.body.appendChild = jest.fn();
    });

    it('should create and submit SAML login form', () => {
      mockClient.newUnsignedRequest.mockReturnValue({
        uri: 'https://api.backend.ai/saml/login',
      });

      loginWithSAML(mockClient);

      expect(mockClient.newUnsignedRequest).toHaveBeenCalledWith(
        'POST',
        '/saml/login',
        null,
      );
      expect(document.createElement).toHaveBeenCalledWith('form');
      expect(document.createElement).toHaveBeenCalledWith('input');
    });
  });

  describe('loginWithOpenID', () => {
    let mockClient: any;

    beforeEach(() => {
      mockClient = {
        newUnsignedRequest: jest.fn(),
      };

      document.createElement = jest.fn((tagName) => {
        const element: any = {
          tagName,
          appendChild: jest.fn(),
          setAttribute: jest.fn(),
          submit: jest.fn(),
        };
        return element;
      });

      document.body.appendChild = jest.fn();
    });

    it('should create and submit OpenID login form', () => {
      mockClient.newUnsignedRequest.mockReturnValue({
        uri: 'https://api.backend.ai/openid/login',
      });

      loginWithOpenID(mockClient);

      expect(mockClient.newUnsignedRequest).toHaveBeenCalledWith(
        'POST',
        '/openid/login',
        null,
      );
      expect(document.createElement).toHaveBeenCalledWith('form');
      expect(document.createElement).toHaveBeenCalledWith('input');
    });
  });
});
