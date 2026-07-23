import webuiThemeJson from './theme.json';
import type { ThemeConfig } from 'antd';

export type ThemeMode = 'light' | 'dark';
export type ThemeStyle = 'default' | 'webui';

// Ant Design theme configs
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
