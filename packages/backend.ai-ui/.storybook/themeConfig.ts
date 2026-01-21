import webuiThemeJson from '../../../resources/theme.json';
import type { ThemeConfig } from 'antd';

export type ThemeMode = 'light' | 'dark';
export type ThemeStyle = 'default' | 'webui';

export const themeConfigs: Record<
  ThemeStyle,
  { light: ThemeConfig; dark: ThemeConfig }
> = {
  default: {
    light: {},
    dark: {},
  },
  webui: {
    light: webuiThemeJson.light,
    dark: webuiThemeJson.dark,
  },
};
