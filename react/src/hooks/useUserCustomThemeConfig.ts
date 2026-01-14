'use memo';

import { useBAISettingUserState } from './useBAISetting';
import { useCustomThemeConfig } from './useCustomThemeConfig';
import { App } from 'antd';
import _ from 'lodash';
import { useEffectEvent, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export const useUserCustomThemeConfig = () => {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const themeConfig = useCustomThemeConfig();
  const [userCustomThemeConfig, setUserCustomThemeConfig] =
    useBAISettingUserState('custom_theme_config');

  // Initialize userCustomThemeConfig from themeConfig on first load
  // Note: useBAISettingUserState returns null (not undefined) when localStorage has no value
  const initializeThemeConfig = useEffectEvent(() => {
    if (_.isNil(userCustomThemeConfig) && !_.isNil(themeConfig)) {
      setUserCustomThemeConfig(_.cloneDeep(themeConfig));
    } else if (_.isNil(themeConfig)) {
      setUserCustomThemeConfig(undefined);
    }
  });
  useEffect(() => {
    initializeThemeConfig();
  }, [themeConfig]);

  const updateThemeConfig = (path: string, value: unknown) => {
    setUserCustomThemeConfig((prev) => {
      if (!prev) {
        message.error(t('userSettings.FailedToLoadDefaultThemeConfig'));
        return prev;
      }
      const newConfig = _.cloneDeep(prev);
      if (value !== undefined) {
        _.set(newConfig, path, value);
      } else {
        _.unset(newConfig, path);
      }
      return newConfig;
    });
  };

  const getThemeValue = <T>(path: string): T | undefined => {
    return _.get(userCustomThemeConfig, path);
  };

  const resetThemeConfig = () => {
    setUserCustomThemeConfig(_.cloneDeep(themeConfig));
  };

  return {
    userCustomThemeConfig,
    updateUserCustomThemeConfig: updateThemeConfig,
    setUserCustomThemeConfig,
    getThemeValue,
    resetThemeConfig,
  };
};
