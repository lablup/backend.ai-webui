/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { getDefaultDesignToken } from '../helper/defaultDesignTokens';
import { useBAISettingUserState } from '../hooks/useBAISetting';
import { useCustomThemeConfig } from '../hooks/useCustomThemeConfig';
import LightDarkColorPicker from './LightDarkColorPicker';
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

  // Family-owned colors (theme.json) are what a cleared picker falls back to;
  // a family that names no `colorPrimary` falls back one further, to the
  // framework default (`getDefaultDesignToken` — the shim-backed replacement
  // for `theme.getDesignToken({ algorithm })`, bit-identical for this token).
  const familyPair = themeFamilies[activeThemeFamily];
  const familyLight =
    familyPair?.light?.token?.colorPrimary ??
    getDefaultDesignToken('light').colorPrimary;
  const familyDark =
    familyPair?.dark?.token?.colorPrimary ??
    getDefaultDesignToken('dark').colorPrimary;

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
        allowClear: true,
        value: accent?.light ?? familyLight,
        onChangeComplete: (color) => setSchemeAccent('light', color),
        onClear: () => setSchemeAccent('light', undefined),
      }}
      dark={{
        'data-testid': 'theme-accent-color-picker-dark',
        allowClear: true,
        value: accent?.dark ?? familyDark,
        onChangeComplete: (color) => setSchemeAccent('dark', color),
        onClear: () => setSchemeAccent('dark', undefined),
      }}
    />
  );
};

export default ThemeAccentColorPicker;
