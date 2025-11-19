import { ThemeConfig } from 'antd';
import _ from 'lodash';
import { useEffect, useEffectEvent, useState } from 'react';

type LogoConfig = {
  src: string;
  srcCollapsed: string;
  srcDark?: string;
  srcCollapsedDark?: string;
  alt?: string;
  href?: string;
  size?: {
    width?: number;
    height?: number;
  };
  sizeCollapsed?: {
    width?: number;
    height?: number;
  };
  aboutModalSize?: {
    width?: number;
    height?: number;
  };
};
type SiderConfig = {
  theme?: 'light' | 'dark';
};
type BrandingConfig = {
  companyName?: string;
  brandName?: string;
};
export type CustomThemeConfig = {
  light: ThemeConfig;
  dark: ThemeConfig;
  logo: LogoConfig;
  sider?: SiderConfig;
  branding?: BrandingConfig;
};
let _customTheme:
  | {
      light: ThemeConfig;
      dark: ThemeConfig;
      logo: LogoConfig;
      sider?: SiderConfig;
      branding?: BrandingConfig;
    }
  | undefined;

export const loadCustomThemeConfig = () => {
  fetch('resources/theme.json')
    .then((response) => response.json())
    .then((theme) => {
      if (_.isUndefined(theme.light)) {
        _customTheme = { light: theme, dark: theme, logo: theme.logo };
      } else {
        _customTheme = theme;
      }
      if (
        _customTheme &&
        process.env.NODE_ENV === 'development' &&
        process.env.REACT_APP_THEME_COLOR
      ) {
        _.set(
          _customTheme,
          'light.components.Layout.headerBg',
          process.env.REACT_APP_THEME_COLOR,
        );
        _.set(
          _customTheme,
          'dark.components.Layout.headerBg',
          process.env.REACT_APP_THEME_COLOR,
        );
      }

      document.dispatchEvent(new CustomEvent('custom-theme-loaded'));
    });
};

export const useCustomThemeConfig = () => {
  const [customThemeConfig, setCustomThemeConfig] = useState<
    CustomThemeConfig | undefined
  >(_customTheme);
  const addEventListener = useEffectEvent(() => {
    if (!customThemeConfig) {
      const handler = () => {
        setCustomThemeConfig(_customTheme);
      };
      document.addEventListener('custom-theme-loaded', handler);

      return () => {
        document.removeEventListener('custom-theme-loaded', handler);
      };
    }
  });

  useEffect(() => {
    addEventListener();
  }, []);

  return customThemeConfig;
};
