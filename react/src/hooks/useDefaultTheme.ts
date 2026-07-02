/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useBAISettingUserState } from './useBAISetting';
import { useRawCustomThemeConfig } from './useThemeFamily';
import { App } from 'antd';
import * as _ from 'lodash-es';
import { useEffectEvent, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * The *editable* default-theme document (the operator's `theme.json`
 * equivalent) backing the admin Branding page. Kept as a per-user draft in
 * localStorage (`custom_theme_config`) and applied through the theme preview
 * mode. Distinct from `useThemeFamily().activeThemeFamily`, which is the
 * site-applied config with the active family and custom primary color
 * resolved — the draft is seeded from the raw `theme.json` so an active theme
 * family never leaks into the edited default document.
 */
export const useDefaultTheme = () => {
  'use memo';

  const { t } = useTranslation();
  const { message } = App.useApp();
  const rawThemeConfig = useRawCustomThemeConfig();
  const [defaultTheme, setDefaultTheme] = useBAISettingUserState(
    'custom_theme_config',
  );

  // Initialize the draft from theme.json on first load.
  // Note: useBAISettingUserState returns null (not undefined) when
  // localStorage has no value.
  const initializeDefaultTheme = useEffectEvent(() => {
    if (_.isNil(defaultTheme) && !_.isNil(rawThemeConfig)) {
      setDefaultTheme(_.cloneDeep(rawThemeConfig));
    } else if (_.isNil(rawThemeConfig)) {
      setDefaultTheme(undefined);
    }
  });
  useEffect(() => {
    initializeDefaultTheme();
  }, [rawThemeConfig]);

  const updateDefaultTheme = (path: string, value: unknown) => {
    setDefaultTheme((prev) => {
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

  const getDefaultThemeValue = <T>(path: string): T | undefined => {
    return _.get(defaultTheme, path);
  };

  /**
   * Restore the whole draft (no args) or only the given paths to the shipped
   * `theme.json` values.
   */
  const resetDefaultTheme = (paths?: string[]) => {
    if (!paths) {
      setDefaultTheme(_.cloneDeep(rawThemeConfig));
      return;
    }
    for (const path of paths) {
      updateDefaultTheme(path, _.get(rawThemeConfig, path) ?? undefined);
    }
  };

  return {
    defaultTheme,
    setDefaultTheme,
    updateDefaultTheme,
    getDefaultThemeValue,
    resetDefaultTheme,
  };
};
