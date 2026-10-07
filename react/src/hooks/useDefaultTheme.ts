/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { App } from '../app-shim';
import {
  BAIAppearanceConfig,
  getDomainAppearanceConfig,
  getStaticAppearanceConfig,
} from '../helper/customThemeConfig';
import { useBAISettingUserState } from './useBAISetting';
import { useRawCustomThemeConfig } from './useCustomThemeConfig';
import * as _ from 'lodash-es';
import { useTranslation } from 'react-i18next';

/** The saved domain document, else the shipped `theme.json`. */
const getAppliedSeed = (): BAIAppearanceConfig | undefined =>
  getDomainAppearanceConfig() ?? getStaticAppearanceConfig();

/**
 * The Branding page's draft of the appearance document, kept in localStorage
 * (`custom_theme_config`) so the preview window can read it. The page seeds
 * it on entry and clears it on Apply or when it unmounts.
 */
export const useDefaultTheme = () => {
  'use memo';

  const { t } = useTranslation();
  const { message } = App.useApp();
  const rawThemeConfig = useRawCustomThemeConfig();
  const [defaultTheme, setDefaultTheme] = useBAISettingUserState(
    'custom_theme_config',
  );

  /** Replace the draft with the applied document; false until it has loaded. */
  const seedDefaultTheme = (): boolean => {
    const seed = getAppliedSeed();
    if (_.isNil(seed)) {
      return false;
    }
    setDefaultTheme(_.cloneDeep(seed));
    return true;
  };

  const clearDefaultTheme = () => {
    setDefaultTheme(undefined);
  };

  const hasUnappliedChanges =
    !_.isNil(defaultTheme) && !_.isEqual(defaultTheme, getAppliedSeed());

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
    seedDefaultTheme,
    clearDefaultTheme,
    hasUnappliedChanges,
  };
};
