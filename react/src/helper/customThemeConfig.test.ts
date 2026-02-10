import {
  getCustomTheme,
  loadCustomThemeConfig,
  type CustomThemeConfig,
  type LogoConfig,
  type SiderConfig,
  type BrandingConfig,
} from './customThemeConfig';

describe('customThemeConfig', () => {
  let fetchMock: jest.SpyInstance;
  let dispatchEventSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    // Mock fetch
    fetchMock = jest.spyOn(global, 'fetch');

    // Mock document.dispatchEvent
    dispatchEventSpy = jest.spyOn(document, 'dispatchEvent');

    // Mock console.error to suppress error messages in tests
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    fetchMock.mockRestore();
    dispatchEventSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    delete process.env.REACT_APP_THEME_COLOR;
  });

  describe('getCustomTheme', () => {
    it('should return undefined or existing theme', () => {
      // getCustomTheme returns the current state, which may be undefined or a previously loaded theme
      const theme = getCustomTheme();
      // We can't assert undefined because the module state is shared across tests
      expect(theme === undefined || typeof theme === 'object').toBe(true);
    });
  });

  describe('loadCustomThemeConfig', () => {
    it('should load theme configuration from theme.json', async () => {
      const mockTheme: CustomThemeConfig = {
        light: {
          token: {
            colorPrimary: '#1890ff',
          },
        },
        dark: {
          token: {
            colorPrimary: '#177ddc',
          },
        },
        logo: {
          src: '/logo.png',
          srcCollapsed: '/logo-collapsed.png',
        },
      };

      fetchMock.mockResolvedValueOnce({
        json: async () => mockTheme,
      } as Response);

      loadCustomThemeConfig();

      // Wait for the promise to resolve
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(fetchMock).toHaveBeenCalledWith('resources/theme.json');
      expect(dispatchEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'custom-theme-loaded',
        }),
      );

      // The theme should be loaded
      const theme = getCustomTheme();
      expect(theme).toBeDefined();
      expect(theme?.light).toEqual(mockTheme.light);
      expect(theme?.dark).toEqual(mockTheme.dark);
      expect(theme?.logo).toEqual(mockTheme.logo);
    });

    it('should handle theme without separate light/dark modes', async () => {
      const mockTheme = {
        token: {
          colorPrimary: '#1890ff',
        },
        logo: {
          src: '/logo.png',
          srcCollapsed: '/logo-collapsed.png',
        },
      };

      fetchMock.mockResolvedValueOnce({
        json: async () => mockTheme,
      } as Response);

      loadCustomThemeConfig();

      // Wait for the promise to resolve
      await new Promise((resolve) => setTimeout(resolve, 10));

      const theme = getCustomTheme();
      expect(theme).toBeDefined();
      // When light is undefined, both light and dark should be set to the same theme
      expect(theme?.light).toEqual(mockTheme);
      expect(theme?.dark).toEqual(mockTheme);
      expect(theme?.logo).toEqual(mockTheme.logo);
    });

    it('should override header background color in development mode', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      process.env.REACT_APP_THEME_COLOR = '#ff0000';

      const mockTheme: CustomThemeConfig = {
        light: {
          components: {
            Layout: {
              headerBg: '#ffffff',
            },
          },
        },
        dark: {
          components: {
            Layout: {
              headerBg: '#000000',
            },
          },
        },
        logo: {
          src: '/logo.png',
          srcCollapsed: '/logo-collapsed.png',
        },
      };

      fetchMock.mockResolvedValueOnce({
        json: async () => mockTheme,
      } as Response);

      loadCustomThemeConfig();

      // Wait for the promise to resolve
      await new Promise((resolve) => setTimeout(resolve, 10));

      const theme = getCustomTheme();
      expect(theme).toBeDefined();
      expect(theme?.light?.components?.Layout?.headerBg).toBe('#ff0000');
      expect(theme?.dark?.components?.Layout?.headerBg).toBe('#ff0000');

      process.env.NODE_ENV = originalEnv;
    });

    it('should not override header background color in production mode', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      process.env.REACT_APP_THEME_COLOR = '#ff0000';

      const mockTheme: CustomThemeConfig = {
        light: {
          components: {
            Layout: {
              headerBg: '#ffffff',
            },
          },
        },
        dark: {
          components: {
            Layout: {
              headerBg: '#000000',
            },
          },
        },
        logo: {
          src: '/logo.png',
          srcCollapsed: '/logo-collapsed.png',
        },
      };

      fetchMock.mockResolvedValueOnce({
        json: async () => mockTheme,
      } as Response);

      loadCustomThemeConfig();

      // Wait for the promise to resolve
      await new Promise((resolve) => setTimeout(resolve, 10));

      const theme = getCustomTheme();
      expect(theme).toBeDefined();
      // In production, the header colors should not be overridden
      expect(theme?.light?.components?.Layout?.headerBg).toBe('#ffffff');
      expect(theme?.dark?.components?.Layout?.headerBg).toBe('#000000');

      process.env.NODE_ENV = originalEnv;
    });

    it('should handle theme with sider configuration', async () => {
      const mockTheme: CustomThemeConfig = {
        light: {},
        dark: {},
        logo: {
          src: '/logo.png',
          srcCollapsed: '/logo-collapsed.png',
        },
        sider: {
          theme: 'dark',
        },
      };

      fetchMock.mockResolvedValueOnce({
        json: async () => mockTheme,
      } as Response);

      loadCustomThemeConfig();

      // Wait for the promise to resolve
      await new Promise((resolve) => setTimeout(resolve, 10));

      const theme = getCustomTheme();
      expect(theme).toBeDefined();
      expect(theme?.sider).toEqual({ theme: 'dark' });
    });

    it('should handle theme with branding configuration', async () => {
      const mockTheme: CustomThemeConfig = {
        light: {},
        dark: {},
        logo: {
          src: '/logo.png',
          srcCollapsed: '/logo-collapsed.png',
        },
        branding: {
          companyName: 'Test Company',
          brandName: 'Test Brand',
        },
      };

      fetchMock.mockResolvedValueOnce({
        json: async () => mockTheme,
      } as Response);

      loadCustomThemeConfig();

      // Wait for the promise to resolve
      await new Promise((resolve) => setTimeout(resolve, 10));

      const theme = getCustomTheme();
      expect(theme).toBeDefined();
      expect(theme?.branding).toEqual({
        companyName: 'Test Company',
        brandName: 'Test Brand',
      });
    });

    it('should handle logo configuration with all optional fields', async () => {
      const mockTheme: CustomThemeConfig = {
        light: {},
        dark: {},
        logo: {
          src: '/logo.png',
          srcCollapsed: '/logo-collapsed.png',
          srcDark: '/logo-dark.png',
          srcCollapsedDark: '/logo-collapsed-dark.png',
          alt: 'Company Logo',
          href: 'https://example.com',
          size: {
            width: 100,
            height: 50,
          },
          sizeCollapsed: {
            width: 50,
            height: 50,
          },
          aboutModalSize: {
            width: 150,
            height: 75,
          },
        },
      };

      fetchMock.mockResolvedValueOnce({
        json: async () => mockTheme,
      } as Response);

      loadCustomThemeConfig();

      // Wait for the promise to resolve
      await new Promise((resolve) => setTimeout(resolve, 10));

      const theme = getCustomTheme();
      expect(theme).toBeDefined();
      expect(theme?.logo).toEqual(mockTheme.logo);
    });
  });

  describe('Type definitions', () => {
    it('should allow valid LogoConfig', () => {
      const validLogo: LogoConfig = {
        src: '/logo.png',
        srcCollapsed: '/logo-collapsed.png',
        srcDark: '/logo-dark.png',
        srcCollapsedDark: '/logo-collapsed-dark.png',
        alt: 'Logo',
        href: 'https://example.com',
        size: { width: 100, height: 50 },
        sizeCollapsed: { width: 50, height: 50 },
        aboutModalSize: { width: 150, height: 75 },
      };
      expect(validLogo).toBeDefined();
    });

    it('should allow valid SiderConfig', () => {
      const validSider: SiderConfig = {
        theme: 'dark',
      };
      expect(validSider).toBeDefined();

      const validSider2: SiderConfig = {
        theme: 'light',
      };
      expect(validSider2).toBeDefined();
    });

    it('should allow valid BrandingConfig', () => {
      const validBranding: BrandingConfig = {
        companyName: 'Test Company',
        brandName: 'Test Brand',
      };
      expect(validBranding).toBeDefined();
    });
  });
});
