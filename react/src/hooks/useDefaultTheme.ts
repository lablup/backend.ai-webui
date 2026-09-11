/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { App } from '../app-shim';
import {
  APPEARANCE_SCHEMA_VERSION,
  getStaticAppearanceConfig,
} from '../helper/customThemeConfig';
import { useBAISettingUserState } from './useBAISetting';
import { useRawCustomThemeConfig } from './useCustomThemeConfig';
import * as _ from 'lodash-es';
import { useEffectEvent, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * The *editable* appearance document (the operator's `theme.json`
 * equivalent) backing the admin Branding page. Kept as a per-user draft in
 * localStorage (`custom_theme_config`) and applied through the theme preview
 * mode. Seeded from the shipped `theme.json`, not from the applied document,
 * so the user's active family never leaks into the edited default.
 */
export const useDefaultTheme = () => {
  'use memo';

  const { t } = useTranslation();
  const { message } = App.useApp();
  const rawThemeConfig = useRawCustomThemeConfig();
  const [defaultTheme, setDefaultTheme] = useBAISettingUserState(
    'custom_theme_config',
  );

  // Seed the draft from the SHIPPED document (never from `rawThemeConfig`:
  // in preview mode that IS the draft, so reseeding from it would loop). A
  // draft from before the v2 format (no schemaVersion) is reseeded rather
  // than edited — its v1 paths no longer mean anything to the editor.
  // Note: useBAISettingUserState returns null (not undefined) when
  // localStorage has no value.
  const initializeDefaultTheme = useEffectEvent(() => {
    const shipped = getStaticAppearanceConfig();
    if (
      (_.isNil(defaultTheme) ||
        defaultTheme.schemaVersion !== APPEARANCE_SCHEMA_VERSION) &&
      !_.isNil(shipped)
    ) {
      setDefaultTheme(_.cloneDeep(shipped));
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
   * `theme.json` values. Reads the shipped document like the seed does — in
   * preview mode `rawThemeConfig` IS the draft, which made Reset a no-op.
   */
  const resetDefaultTheme = (paths?: string[]) => {
    const shipped = getStaticAppearanceConfig() ?? rawThemeConfig;
    if (!paths) {
      setDefaultTheme(_.cloneDeep(shipped));
      return;
    }
    for (const path of paths) {
      updateDefaultTheme(path, _.get(shipped, path) ?? undefined);
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
