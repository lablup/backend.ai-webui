/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useBAISettingUserState } from '../hooks/useBAISetting';
import { useCustomThemeConfig } from '../hooks/useCustomThemeConfig';
import LightDarkColorPicker from './LightDarkColorPicker';
import { theme } from 'antd';
import * as _ from 'lodash-es';

/**
 * End-user primary-color control for the User Settings page. Owns the
 * `custom_primary_color` user setting (per-scheme light/dark overrides);
 * `useCustomThemeConfig` reads it and overrides `colorPrimary` on the matching
 * scheme of the active family (Ant Design's algorithm derives the rest of the
 * palette). Distinct from the admin `BrandingSettingItems/ThemeColorPicker`,
 * which edits the full default-theme document.
 */
const ThemeAccentColorPicker: React.FC = () => {
  'use memo';
  const [accent, setAccent] = useBAISettingUserState('custom_primary_color');
  const { activeThemeFamily, themeFamilies } = useCustomThemeConfig();

  // Family-owned colors (theme.json) are what a cleared picker falls back to.
  const familyPair = themeFamilies[activeThemeFamily];
  const familyLight =
    familyPair?.light?.token?.colorPrimary ??
    theme.getDesignToken({ algorithm: theme.defaultAlgorithm }).colorPrimary;
  const familyDark =
    familyPair?.dark?.token?.colorPrimary ??
    theme.getDesignToken({ algorithm: theme.darkAlgorithm }).colorPrimary;

  const setSchemeAccent = (scheme: 'light' | 'dark', color?: string) => {
    const next = _.omitBy({ ...accent, [scheme]: color }, _.isUndefined);
    // Drop the setting entirely when no scheme is overridden so the theme
    // (and the setting item's changed badge) falls back to the default.
    setAccent(_.isEmpty(next) ? undefined : next);
  };

  return (
    <LightDarkColorPicker
      light={{
        'data-testid': 'theme-accent-color-picker-light',
        disabledAlpha: true,
        allowClear: true,
        value: accent?.light ?? familyLight,
        onChangeComplete: (color) =>
          setSchemeAccent('light', color.toHexString()),
        onClear: () => setSchemeAccent('light', undefined),
      }}
      dark={{
        'data-testid': 'theme-accent-color-picker-dark',
        disabledAlpha: true,
        allowClear: true,
        value: accent?.dark ?? familyDark,
        onChangeComplete: (color) =>
          setSchemeAccent('dark', color.toHexString()),
        onClear: () => setSchemeAccent('dark', undefined),
      }}
    />
  );
};

export default ThemeAccentColorPicker;
