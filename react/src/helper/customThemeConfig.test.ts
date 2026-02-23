import {
  getCustomTheme,
  loadCustomThemeConfig,
  type CustomThemeConfig,
  type LogoConfig,
} from './customThemeConfig';

describe('customThemeConfig', () => {
  let fetchMock: jest.Mock;
  let originalFetch: typeof global.fetch;
  let dispatchEventSpy: jest.SpyInstance;
  let originalNodeEnv: string | undefined;

  beforeEach(() => {
    // Save original values
    originalFetch = global.fetch;
    originalNodeEnv = process.env.NODE_ENV;

    // Setup fetch mock
    fetchMock = jest.fn();
    global.fetch = fetchMock as unknown as typeof global.fetch;

    // Setup event dispatcher spy
    dispatchEventSpy = jest.spyOn(document, 'dispatchEvent');
  });

  afterEach(() => {
    // Restore original values
    global.fetch = originalFetch;
    process.env.NODE_ENV = originalNodeEnv;
    jest.clearAllMocks();
  });

  describe('getCustomTheme', () => {
    it('should return undefined when no theme is loaded', () => {
      const theme = getCustomTheme();
      expect(theme).toBeUndefined();
    });
  });

  describe('loadCustomThemeConfig', () => {
    it('should fetch theme configuration from resources/theme.json', async () => {
      const mockTheme: CustomThemeConfig = {
        light: { token: { colorPrimary: '#1890ff' } },
        dark: { token: { colorPrimary: '#177ddc' } },
        logo: {
          src: '/logo.png',
          srcCollapsed: '/logo-small.png',
        },
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockTheme),
      } as unknown as Response);

      loadCustomThemeConfig();

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(fetchMock).toHaveBeenCalledWith('resources/theme.json');
      expect(dispatchEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'custom-theme-loaded',
        }),
      );
    });

    it('should handle legacy theme format (no light/dark separation)', async () => {
      const mockLegacyTheme = {
        token: { colorPrimary: '#1890ff' },
        logo: {
          src: '/logo.png',
          srcCollapsed: '/logo-small.png',
        },
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockLegacyTheme),
      } as unknown as Response);

      loadCustomThemeConfig();

      await new Promise((resolve) => setTimeout(resolve, 100));

      const theme = getCustomTheme();
      expect(theme).toBeDefined();
      expect(theme?.light).toEqual({
        token: { colorPrimary: '#1890ff' },
        logo: { src: '/logo.png', srcCollapsed: '/logo-small.png' },
      });
      expect(theme?.dark).toEqual({
        token: { colorPrimary: '#1890ff' },
        logo: { src: '/logo.png', srcCollapsed: '/logo-small.png' },
      });
      expect(theme?.logo).toEqual(mockLegacyTheme.logo);
    });

    it('should apply REACT_APP_THEME_COLOR in development environment', async () => {
      process.env.NODE_ENV = 'development';
      process.env.REACT_APP_THEME_COLOR = '#ff0000';

      const mockTheme: CustomThemeConfig = {
        light: {
          token: { colorPrimary: '#1890ff' },
          components: { Layout: {} },
        },
        dark: {
          token: { colorPrimary: '#177ddc' },
          components: { Layout: {} },
        },
        logo: {
          src: '/logo.png',
          srcCollapsed: '/logo-small.png',
        },
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockTheme),
      } as unknown as Response);

      loadCustomThemeConfig();

      await new Promise((resolve) => setTimeout(resolve, 100));

      const theme = getCustomTheme();
      expect(theme?.light.components?.Layout?.headerBg).toBe('#ff0000');
      expect(theme?.dark.components?.Layout?.headerBg).toBe('#ff0000');
    });

    it('should not apply REACT_APP_THEME_COLOR in production environment', async () => {
      process.env.NODE_ENV = 'production';
      process.env.REACT_APP_THEME_COLOR = '#ff0000';

      const mockTheme: CustomThemeConfig = {
        light: {
          token: { colorPrimary: '#1890ff' },
          components: { Layout: {} },
        },
        dark: {
          token: { colorPrimary: '#177ddc' },
          components: { Layout: {} },
        },
        logo: {
          src: '/logo.png',
          srcCollapsed: '/logo-small.png',
        },
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockTheme),
      } as unknown as Response);

      loadCustomThemeConfig();

      await new Promise((resolve) => setTimeout(resolve, 100));

      const theme = getCustomTheme();
      expect(theme?.light.components?.Layout?.headerBg).toBeUndefined();
      expect(theme?.dark.components?.Layout?.headerBg).toBeUndefined();
    });

    it('should dispatch custom-theme-loaded event after loading', async () => {
      const mockTheme: CustomThemeConfig = {
        light: { token: { colorPrimary: '#1890ff' } },
        dark: { token: { colorPrimary: '#177ddc' } },
        logo: {
          src: '/logo.png',
          srcCollapsed: '/logo-small.png',
        },
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockTheme),
      } as unknown as Response);

      loadCustomThemeConfig();

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(dispatchEventSpy).toHaveBeenCalledTimes(1);
      const event = dispatchEventSpy.mock.calls[0][0];
      expect(event).toBeInstanceOf(CustomEvent);
      expect((event as CustomEvent).type).toBe('custom-theme-loaded');
    });

    it('should handle theme with complete logo configuration', async () => {
      const logoConfig: LogoConfig = {
        src: '/logo.png',
        srcCollapsed: '/logo-small.png',
        srcDark: '/logo-dark.png',
        srcCollapsedDark: '/logo-small-dark.png',
        alt: 'Company Logo',
        href: 'https://example.com',
        size: { width: 200, height: 50 },
        sizeCollapsed: { width: 50, height: 50 },
        aboutModalSize: { width: 300, height: 100 },
      };

      const mockTheme: CustomThemeConfig = {
        light: { token: { colorPrimary: '#1890ff' } },
        dark: { token: { colorPrimary: '#177ddc' } },
        logo: logoConfig,
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockTheme),
      } as unknown as Response);

      loadCustomThemeConfig();

      await new Promise((resolve) => setTimeout(resolve, 100));

      const theme = getCustomTheme();
      expect(theme?.logo).toEqual(logoConfig);
    });

    it('should handle theme with sider configuration', async () => {
      const mockTheme: CustomThemeConfig = {
        light: { token: { colorPrimary: '#1890ff' } },
        dark: { token: { colorPrimary: '#177ddc' } },
        logo: {
          src: '/logo.png',
          srcCollapsed: '/logo-small.png',
        },
        sider: {
          theme: 'dark',
        },
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockTheme),
      } as unknown as Response);

      loadCustomThemeConfig();

      await new Promise((resolve) => setTimeout(resolve, 100));

      const theme = getCustomTheme();
      expect(theme?.sider?.theme).toBe('dark');
    });

    it('should handle theme with branding configuration', async () => {
      const mockTheme: CustomThemeConfig = {
        light: { token: { colorPrimary: '#1890ff' } },
        dark: { token: { colorPrimary: '#177ddc' } },
        logo: {
          src: '/logo.png',
          srcCollapsed: '/logo-small.png',
        },
        branding: {
          companyName: 'Example Corp',
          brandName: 'Product Name',
        },
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockTheme),
      } as unknown as Response);

      loadCustomThemeConfig();

      await new Promise((resolve) => setTimeout(resolve, 100));

      const theme = getCustomTheme();
      expect(theme?.branding?.companyName).toBe('Example Corp');
      expect(theme?.branding?.brandName).toBe('Product Name');
    });

    it('should handle nested theme token configuration', async () => {
      const mockTheme: CustomThemeConfig = {
        light: {
          token: {
            colorPrimary: '#1890ff',
            colorSuccess: '#52c41a',
            borderRadius: 4,
          },
          components: {
            Button: {
              primaryColor: '#ffffff',
            },
            Layout: {
              headerBg: '#001529',
              siderBg: '#ffffff',
            },
          },
        },
        dark: {
          token: {
            colorPrimary: '#177ddc',
            colorSuccess: '#49aa19',
            borderRadius: 4,
          },
          components: {
            Button: {
              primaryColor: '#ffffff',
            },
            Layout: {
              headerBg: '#141414',
              siderBg: '#1f1f1f',
            },
          },
        },
        logo: {
          src: '/logo.png',
          srcCollapsed: '/logo-small.png',
        },
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockTheme),
      } as unknown as Response);

      loadCustomThemeConfig();

      await new Promise((resolve) => setTimeout(resolve, 100));

      const theme = getCustomTheme();
      expect(theme?.light.token?.colorPrimary).toBe('#1890ff');
      expect(theme?.light.components?.Layout?.headerBg).toBe('#001529');
      expect(theme?.dark.token?.colorPrimary).toBe('#177ddc');
      expect(theme?.dark.components?.Layout?.headerBg).toBe('#141414');
    });

    it('should handle multiple calls to loadCustomThemeConfig', async () => {
      const mockTheme1: CustomThemeConfig = {
        light: { token: { colorPrimary: '#1890ff' } },
        dark: { token: { colorPrimary: '#177ddc' } },
        logo: {
          src: '/logo1.png',
          srcCollapsed: '/logo-small1.png',
        },
      };

      const mockTheme2: CustomThemeConfig = {
        light: { token: { colorPrimary: '#ff0000' } },
        dark: { token: { colorPrimary: '#cc0000' } },
        logo: {
          src: '/logo2.png',
          srcCollapsed: '/logo-small2.png',
        },
      };

      fetchMock
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValueOnce(mockTheme1),
        } as unknown as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValueOnce(mockTheme2),
        } as unknown as Response);

      loadCustomThemeConfig();
      await new Promise((resolve) => setTimeout(resolve, 100));

      loadCustomThemeConfig();
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(dispatchEventSpy).toHaveBeenCalledTimes(2);
    });

    it('should only apply REACT_APP_THEME_COLOR when both development mode and env var are set', async () => {
      process.env.NODE_ENV = 'development';
      delete process.env.REACT_APP_THEME_COLOR;

      const mockTheme: CustomThemeConfig = {
        light: {
          token: { colorPrimary: '#1890ff' },
          components: { Layout: {} },
        },
        dark: {
          token: { colorPrimary: '#177ddc' },
          components: { Layout: {} },
        },
        logo: {
          src: '/logo.png',
          srcCollapsed: '/logo-small.png',
        },
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockTheme),
      } as unknown as Response);

      loadCustomThemeConfig();

      await new Promise((resolve) => setTimeout(resolve, 100));

      const theme = getCustomTheme();
      expect(theme?.light.components?.Layout?.headerBg).toBeUndefined();
      expect(theme?.dark.components?.Layout?.headerBg).toBeUndefined();
    });

    it('should preserve existing Layout component settings when applying REACT_APP_THEME_COLOR', async () => {
      process.env.NODE_ENV = 'development';
      process.env.REACT_APP_THEME_COLOR = '#ff0000';

      const mockTheme: CustomThemeConfig = {
        light: {
          token: { colorPrimary: '#1890ff' },
          components: {
            Layout: {
              siderBg: '#ffffff',
              bodyBg: '#f0f0f0',
            },
          },
        },
        dark: {
          token: { colorPrimary: '#177ddc' },
          components: {
            Layout: {
              siderBg: '#1f1f1f',
              bodyBg: '#141414',
            },
          },
        },
        logo: {
          src: '/logo.png',
          srcCollapsed: '/logo-small.png',
        },
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockTheme),
      } as unknown as Response);

      loadCustomThemeConfig();

      await new Promise((resolve) => setTimeout(resolve, 100));

      const theme = getCustomTheme();
      expect(theme?.light.components?.Layout?.headerBg).toBe('#ff0000');
      expect(theme?.light.components?.Layout?.siderBg).toBe('#ffffff');
      expect(theme?.light.components?.Layout?.bodyBg).toBe('#f0f0f0');
      expect(theme?.dark.components?.Layout?.headerBg).toBe('#ff0000');
      expect(theme?.dark.components?.Layout?.siderBg).toBe('#1f1f1f');
      expect(theme?.dark.components?.Layout?.bodyBg).toBe('#141414');
    });
  });
});
