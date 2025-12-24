import { useSessionStorageState } from 'ahooks';
import { App, ThemeConfig } from 'antd';
import _ from 'lodash';
import { useEffect, useEffectEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useBAISettingUserState } from 'src/hooks/useBAISetting';

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
  const [userCustomThemeConfig] = useBAISettingUserState('custom_theme_config');
  const [isThemePreviewMode] = useSessionStorageState('isThemePreviewMode', {
    defaultValue: false,
  });

  const addEventListener = useEffectEvent(() => {
    if (isThemePreviewMode) {
      const themePreviewModehandler = (e: StorageEvent) => {
        if (e.key === 'backendaiwebui.settings.user.custom_theme_config') {
          window.location.reload();
        }
      };
      window.addEventListener('storage', themePreviewModehandler);
      return () => {
        window.removeEventListener('storage', themePreviewModehandler);
      };
    }

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

  return isThemePreviewMode
    ? _.merge({}, customThemeConfig, userCustomThemeConfig)
    : customThemeConfig;
};

export const useUserCustomThemeConfig = () => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();
  const themeConfig = useCustomThemeConfig();
  const [userCustomThemeConfig, setUserCustomThemeConfig] =
    useBAISettingUserState('custom_theme_config');

  const mergedThemeConfig = themeConfig
    ? _.merge({}, themeConfig, userCustomThemeConfig)
    : undefined;

  const updateThemeConfig = (path: string, value: unknown) => {
    if (!themeConfig) {
      message.error(t('userSettings.FailedToLoadDefaultThemeConfig'));
      return;
    }

    setUserCustomThemeConfig((prev) => {
      const newConfig = _.cloneDeep({
        ...themeConfig,
        ...prev,
      });
      if (value) {
        _.set(newConfig, path, value);
      } else {
        const defaultValue = _.get(themeConfig, path);
        if (defaultValue !== undefined) {
          _.set(newConfig, path, defaultValue);
        } else {
          _.unset(newConfig, path);
        }
      }
      return newConfig;
    });
  };

  const getThemeValue = <T>(path: string, defaultValue?: T): T | undefined => {
    return (
      _.get(userCustomThemeConfig, path) ??
      _.get(themeConfig, path) ??
      defaultValue
    );
  };

  return {
    themeConfig,
    userCustomThemeConfig: mergedThemeConfig,
    setUserCustomThemeConfig: updateThemeConfig,
    getThemeValue,
  };
};
