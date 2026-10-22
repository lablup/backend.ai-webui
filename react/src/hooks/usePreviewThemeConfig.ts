/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { App } from '../app-shim';
import { BAIAppearanceConfig } from '../helper/customThemeConfig';
import { useBAISettingUserState } from './useBAISetting';
import { useRawCustomThemeConfig } from './useCustomThemeConfig';
import * as _ from 'lodash-es';
import { useTranslation } from 'react-i18next';

/**
 * The Branding page's edits, kept in localStorage (`custom_theme_config`) so
 * the preview window can render them. Until the first edit there is nothing
 * stored and the page shows the applied document.
 */
export const usePreviewThemeConfig = () => {
  'use memo';

  const { t } = useTranslation();
  const { message } = App.useApp();
  const appliedThemeConfig = useRawCustomThemeConfig();
  const [previewThemeConfig, setPreviewThemeConfig] = useBAISettingUserState(
    'custom_theme_config',
  );

  /** The document the page shows, exports and applies. */
  const themeConfig = previewThemeConfig ?? appliedThemeConfig;

  const getThemeConfigValue = <T>(path: string): T | undefined =>
    _.get(themeConfig, path);

  /** Writes one path; the first edit copies the applied document. */
  const updateThemeConfigValue = (path: string, value: unknown) => {
    setPreviewThemeConfig((prev) => {
      const base = prev ?? appliedThemeConfig;
      if (!base) {
        message.error(t('userSettings.FailedToLoadDefaultThemeConfig'));
        return prev;
      }
      const next: BAIAppearanceConfig = _.cloneDeep(base);
      if (value !== undefined) {
        _.set(next, path, value);
      } else {
        _.unset(next, path);
      }
      return next;
    });
  };

  const clearPreviewThemeConfig = () => {
    setPreviewThemeConfig(undefined);
  };

  return {
    themeConfig,
    appliedThemeConfig,
    hasPreviewThemeConfig: !_.isNil(previewThemeConfig),
    getThemeConfigValue,
    updateThemeConfigValue,
    setPreviewThemeConfig,
    clearPreviewThemeConfig,
  };
};
