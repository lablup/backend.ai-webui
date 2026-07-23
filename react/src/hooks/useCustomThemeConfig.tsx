/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  CustomThemeConfig,
  ThemeFamilyConfig,
  getCustomTheme,
  pickValidThemeFamilies,
} from '../helper/customThemeConfig';
import { useBAISettingUserState } from './useBAISetting';
import { useLocalStorageGlobalState } from './useLocalStorageGlobalState';
import { useSessionStorageState } from 'ahooks';
import * as _ from 'lodash-es';
import { useEffect, useEffectEvent, useState } from 'react';

/**
 * The family shown before the user picks one. Always synthesized from
 * theme.json's top-level `light`/`dark` (the single source of the default
 * theme), so a pre-family theme.json still yields a working (single-entry)
 * catalog. The same literal is read by the FOUC bootstrap in `index.html`;
 * keep them in sync.
 */
export const DEFAULT_THEME_FAMILY = 'default';

/**
 * localStorage key for the selected family. Mirrors `themeMode` (NOT under the
 * `.user.` namespace) because the FOUC bootstrap in `index.html` reads it
 * before paint. The custom primary color is an ordinary user setting
 * (`custom_primary_color` via `useBAISettingUserState`) — nothing reads it
 * pre-paint.
 */
export const THEME_FAMILY_STORAGE_KEY = 'backendaiwebui.settings.themeFamily';

/**
 * Returns the raw, operator-provided `CustomThemeConfig` loaded from
 * `resources/theme.json` (or the per-user override while in branding preview
 * mode). Shared by `useCustomThemeConfig` (as the base of `themeConfig`) and
 * `useDefaultTheme` (as the pristine source of the editable default-theme
 * document).
 */
export const useRawCustomThemeConfig = (): CustomThemeConfig | undefined => {
  'use memo';
  const [customThemeConfig, setCustomThemeConfig] = useState<
    CustomThemeConfig | undefined
  >(getCustomTheme());
  const [userCustomThemeConfig] = useBAISettingUserState('custom_theme_config');
  const [isThemePreviewMode] = useSessionStorageState('isThemePreviewMode', {
    defaultValue: false,
  });

  const addEventListener = useEffectEvent(() => {
    if (isThemePreviewMode) {
      const themePreviewModeHandler = (e: StorageEvent) => {
        if (e.key === 'backendaiwebui.settings.user.custom_theme_config') {
          window.location.reload();
        }
      };
      window.addEventListener('storage', themePreviewModeHandler);
      return () => {
        window.removeEventListener('storage', themePreviewModeHandler);
      };
    }

    if (!customThemeConfig) {
      const handler = () => {
        setCustomThemeConfig(getCustomTheme());
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

  return isThemePreviewMode ? userCustomThemeConfig : customThemeConfig;
};

export type ThemeFamilyCatalog = Record<string, ThemeFamilyConfig>;

/**
 * Pure merge of theme.json's `families` block into the selectable catalog.
 * The `default` entry is always synthesized from the top-level `light`/`dark`
 * — the single source of the default theme, and the document the Branding
 * page edits. A `default` key inside `families` is ignored so it can never
 * shadow that document; otherwise a stale copy would mask top-level edits in
 * branding preview mode.
 */
export const resolveThemeFamilyCatalog = (
  rawConfig: CustomThemeConfig | undefined,
): ThemeFamilyCatalog =>
  rawConfig
    ? {
        [DEFAULT_THEME_FAMILY]: {
          light: rawConfig.light,
          dark: rawConfig.dark,
        },
        ..._.omit(
          pickValidThemeFamilies(rawConfig.families),
          DEFAULT_THEME_FAMILY,
        ),
      }
    : {};

export type UseCustomThemeConfigResult = {
  /** The resolved active family key (always present in `themeFamilies`). */
  activeThemeFamily: string;
  /**
   * Persist a new family selection (by family key). Pass `undefined` to clear
   * the user's selection so resolution falls back to the `default` family.
   */
  setActiveThemeFamily: (family: string | undefined) => void;
  /** All selectable families, always including a `default` entry. */
  themeFamilies: ThemeFamilyCatalog;
  /**
   * The site-applied `CustomThemeConfig`: the default theme (`theme.json`)
   * with `light`/`dark` resolved to the active family and the custom accent
   * applied. This is what every theme provider consumes. `undefined` until
   * `theme.json` has loaded. For the *editable* default theme document (the
   * Branding page), use `useDefaultTheme` instead.
   */
  themeConfig: CustomThemeConfig | undefined;
};

/**
 * Single source of truth for the theme-family axis (orthogonal to the
 * light/dark axis owned by `useThemeMode`). Owns the family selection,
 * synthesizes the family catalog, resolves the active family, applies the
 * `custom_primary_color` user setting through Ant Design's token system, and
 * is the only writer of the `data-theme-family` attribute on `<body>` (which
 * keys the signature effect CSS in `resources/theme-families.css`).
 *
 * Persistence is localStorage-only today, intentionally routed through this one
 * hook so a future backend-synced user-preferences store is a drop-in swap
 * (see `docs/theme-family-backend-sync-spec.md`).
 */
export const useCustomThemeConfig = (): UseCustomThemeConfigResult => {
  'use memo';
  const rawConfig = useRawCustomThemeConfig();
  const [storedFamily, setStoredFamily] = useLocalStorageGlobalState<
    string | undefined
  >(THEME_FAMILY_STORAGE_KEY, undefined);
  // Custom primary color is an ordinary user setting; when present it
  // overrides the active family's primary color below. Owned by
  // ThemeAccentColorPicker.
  const [storedAccent] = useBAISettingUserState('custom_primary_color');
  const [isThemePreviewMode] = useSessionStorageState('isThemePreviewMode', {
    defaultValue: false,
  });

  const families = resolveThemeFamilyCatalog(rawConfig);

  // Resolution order: user choice -> `default`. Fall back to `default` if the
  // requested key is absent (e.g. operator removed a family the user had
  // selected). Branding preview mode shows the edited default-theme draft
  // as-is, so the user's family selection and custom primary color are
  // ignored there (the User Settings items are hidden in that mode as well).
  const requestedFamily = isThemePreviewMode
    ? DEFAULT_THEME_FAMILY
    : (storedFamily ?? DEFAULT_THEME_FAMILY);
  const activeFamily = families[requestedFamily]
    ? requestedFamily
    : DEFAULT_THEME_FAMILY;

  const activePair: ThemeFamilyConfig | undefined = families[activeFamily];
  const accent = isThemePreviewMode ? undefined : storedAccent;

  let themeConfig: CustomThemeConfig | undefined;
  if (rawConfig && activePair) {
    let { light, dark } = activePair;
    if (accent?.light || accent?.dark) {
      // Override only colorPrimary, per scheme; Ant Design's algorithm
      // derives the rest of the palette from it. colorLink/headerBg stay
      // family-owned.
      light = _.cloneDeep(light);
      dark = _.cloneDeep(dark);
      if (accent.light) {
        _.set(light, 'token.colorPrimary', accent.light);
      }
      if (accent.dark) {
        _.set(dark, 'token.colorPrimary', accent.dark);
      }
    }
    themeConfig = { ...rawConfig, light, dark };
  }

  // Only writer of the body attribute that keys the signature-effect CSS.
  useEffect(() => {
    if (document.body.getAttribute('data-theme-family') !== activeFamily) {
      document.body.setAttribute('data-theme-family', activeFamily);
    }
  }, [activeFamily]);

  return {
    activeThemeFamily: activeFamily,
    setActiveThemeFamily: setStoredFamily,
    themeFamilies: families,
    themeConfig,
  };
};
