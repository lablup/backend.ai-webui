import webuiThemeJson from './theme.json';

export type ThemeMode = 'light' | 'dark';
export type ThemeStyle = 'default' | 'webui';

/**
 * The seed bag the "Theme Style" toolbar feeds `ThemeShimProvider`.
 *
 * Was `import type { ThemeConfig } from 'antd'`, the shape antd's
 * `ConfigProvider theme` prop took. `.storybook/theme.json` is a copy of the
 * app's `resources/theme.json`, which is still authored in antd token names
 * (that vocabulary is what the theme-shim reads — see
 * `src/theme-shim/tokenType.ts`), so the SHAPE is unchanged; only the type's
 * provenance is. Declared here rather than imported from the shim because
 * only the two keys below are ever read.
 */
export interface ThemeConfig {
  token?: Record<string, string | number>;
  components?: Record<string, Record<string, string | number>>;
}

// Theme seed configs, in antd token vocabulary (see above).
export const themeConfigs: Record<
  ThemeStyle,
  { light: ThemeConfig; dark: ThemeConfig }
> = {
  default: {
    light: {},
    dark: {
      token: {
        colorBgContainer: '#1f2229',
        colorBgElevated: '#262931',
        colorBgLayout: '#181b1f',
        colorBgSpotlight: '#2c2f36',
        colorBorder: '#3d424d',
        colorBorderSecondary: '#2c2f36',
      },
    },
  },
  webui: {
    light: webuiThemeJson.light,
    dark: webuiThemeJson.dark,
  },
};
