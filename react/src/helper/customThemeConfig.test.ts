import {
  getCustomTheme,
  loadCustomThemeConfig,
  CustomThemeConfig,
} from './customThemeConfig';

// Mock fetch globally
global.fetch = jest.fn();

describe('customThemeConfig', () => {
  let originalEnv: string;
  let originalThemeColor: string | undefined;

  beforeAll(() => {
    originalEnv = process.env.NODE_ENV || 'test';
    originalThemeColor = process.env.REACT_APP_THEME_COLOR;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Clear event listeners
    document.removeEventListener('custom-theme-loaded', () => {});
  });

  afterEach(() => {
    // Restore original environment
    process.env.NODE_ENV = originalEnv;
    process.env.REACT_APP_THEME_COLOR = originalThemeColor;
  });

  describe('getCustomTheme', () => {
    it('should return the loaded theme after loadCustomThemeConfig succeeds', async () => {
      const mockTheme: CustomThemeConfig = {
        light: { token: { colorPrimary: '#1890ff' } },
        dark: { token: { colorPrimary: '#177ddc' } },
        logo: {
          src: '/logo.png',
          srcCollapsed: '/logo-small.png',
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: jest.fn().mockResolvedValueOnce(mockTheme),
      });

      await loadCustomThemeConfig();

      // Wait for the theme to be loaded
      await new Promise((resolve) => {
        document.addEventListener('custom-theme-loaded', resolve, {
          once: true,
        });
      });

      const theme = getCustomTheme();
      expect(theme).toEqual(mockTheme);
    });
  });

  describe('loadCustomThemeConfig', () => {
    it('should fetch theme from resources/theme.json', async () => {
      const mockTheme: CustomThemeConfig = {
        light: { token: { colorPrimary: '#1890ff' } },
        dark: { token: { colorPrimary: '#177ddc' } },
        logo: {
          src: '/logo.png',
          srcCollapsed: '/logo-small.png',
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: jest.fn().mockResolvedValueOnce(mockTheme),
      });

      loadCustomThemeConfig();

      expect(global.fetch).toHaveBeenCalledWith('resources/theme.json');
    });

    it('should handle legacy theme format without light/dark properties', async () => {
      const legacyTheme = {
        token: { colorPrimary: '#1890ff' },
        logo: {
          src: '/logo.png',
          srcCollapsed: '/logo-small.png',
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: jest.fn().mockResolvedValueOnce(legacyTheme),
      });

      await loadCustomThemeConfig();

      // Wait for the theme to be loaded
      await new Promise((resolve) => {
        document.addEventListener('custom-theme-loaded', resolve, {
          once: true,
        });
      });

      const theme = getCustomTheme();
      expect(theme).toEqual({
        light: legacyTheme,
        dark: legacyTheme,
        logo: legacyTheme.logo,
      });
    });

    it('should handle modern theme format with light and dark properties', async () => {
      const modernTheme: CustomThemeConfig = {
        light: { token: { colorPrimary: '#1890ff' } },
        dark: { token: { colorPrimary: '#177ddc' } },
        logo: {
          src: '/logo.png',
          srcCollapsed: '/logo-small.png',
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: jest.fn().mockResolvedValueOnce(modernTheme),
      });

      await loadCustomThemeConfig();

      // Wait for the theme to be loaded
      await new Promise((resolve) => {
        document.addEventListener('custom-theme-loaded', resolve, {
          once: true,
        });
      });

      const theme = getCustomTheme();
      expect(theme).toEqual(modernTheme);
    });

    it('should apply REACT_APP_THEME_COLOR in development mode', async () => {
      const originalEnv = process.env.NODE_ENV;
      const originalThemeColor = process.env.REACT_APP_THEME_COLOR;

      process.env.NODE_ENV = 'development';
      process.env.REACT_APP_THEME_COLOR = '#ff0000';

      const mockTheme: CustomThemeConfig = {
        light: { token: { colorPrimary: '#1890ff' } },
        dark: { token: { colorPrimary: '#177ddc' } },
        logo: {
          src: '/logo.png',
          srcCollapsed: '/logo-small.png',
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: jest.fn().mockResolvedValueOnce(mockTheme),
      });

      await loadCustomThemeConfig();

      // Wait for the theme to be loaded
      await new Promise((resolve) => {
        document.addEventListener('custom-theme-loaded', resolve, {
          once: true,
        });
      });

      const theme = getCustomTheme();
      expect(theme?.light.components?.Layout?.headerBg).toBe('#ff0000');
      expect(theme?.dark.components?.Layout?.headerBg).toBe('#ff0000');

      // Restore original environment
      process.env.NODE_ENV = originalEnv;
      process.env.REACT_APP_THEME_COLOR = originalThemeColor;
    });

    it('should not apply REACT_APP_THEME_COLOR in production mode', async () => {
      const originalEnv = process.env.NODE_ENV;
      const originalThemeColor = process.env.REACT_APP_THEME_COLOR;

      process.env.NODE_ENV = 'production';
      process.env.REACT_APP_THEME_COLOR = '#ff0000';

      const mockTheme: CustomThemeConfig = {
        light: {
          token: { colorPrimary: '#1890ff' },
          components: { Layout: { headerBg: '#001529' } },
        },
        dark: {
          token: { colorPrimary: '#177ddc' },
          components: { Layout: { headerBg: '#000000' } },
        },
        logo: {
          src: '/logo.png',
          srcCollapsed: '/logo-small.png',
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: jest.fn().mockResolvedValueOnce(mockTheme),
      });

      await loadCustomThemeConfig();

      // Wait for the theme to be loaded
      await new Promise((resolve) => {
        document.addEventListener('custom-theme-loaded', resolve, {
          once: true,
        });
      });

      const theme = getCustomTheme();
      expect(theme?.light.components?.Layout?.headerBg).toBe('#001529');
      expect(theme?.dark.components?.Layout?.headerBg).toBe('#000000');

      // Restore original environment
      process.env.NODE_ENV = originalEnv;
      process.env.REACT_APP_THEME_COLOR = originalThemeColor;
    });

    it('should dispatch custom-theme-loaded event when theme is loaded', async () => {
      const mockTheme: CustomThemeConfig = {
        light: { token: { colorPrimary: '#1890ff' } },
        dark: { token: { colorPrimary: '#177ddc' } },
        logo: {
          src: '/logo.png',
          srcCollapsed: '/logo-small.png',
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: jest.fn().mockResolvedValueOnce(mockTheme),
      });

      const eventPromise = new Promise((resolve) => {
        document.addEventListener('custom-theme-loaded', resolve, {
          once: true,
        });
      });

      loadCustomThemeConfig();

      await expect(eventPromise).resolves.toBeDefined();
    });
  });
});
