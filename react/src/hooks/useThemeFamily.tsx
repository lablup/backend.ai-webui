/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  CustomThemeConfig,
  ThemeFamilyConfig,
  getBuiltinThemeFamilies,
  getCustomTheme,
} from '../helper/customThemeConfig';
import { useBAISettingUserState } from './useBAISetting';
import { useLocalStorageGlobalState } from './useLocalStorageGlobalState';
import { useSessionStorageState } from 'ahooks';
import * as _ from 'lodash-es';
import { useEffect, useEffectEvent, useState } from 'react';

/**
 * The built-in family synthesized from the top-level `light`/`dark` of
 * `theme.json`. Always present in the catalog so a theme.json without a
 * `families` block still yields a working (single-entry) selector. The same
 * literal is read by the FOUC bootstrap in `index.html`; keep them in sync.
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
 * mode). Shared by `useThemeFamily` (as the base of `activeThemeFamily`) and
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
 * Pure merge of the theme-family layers into the selectable catalog. Later
 * layers win per family key:
 *   built-in (`resources/theme-families.json`, product-owned)
 *   -> operator (`theme.json` `families`, deployment-owned)
 *   -> admin-defined (`remoteFamilies`, future backend store).
 * The `default` family is always synthesized from the operator's top-level
 * `light`/`dark` so it reflects deployment branding.
 */
export const resolveThemeFamilyCatalog = (
  rawConfig: CustomThemeConfig | undefined,
  builtinFamilies?: Record<string, ThemeFamilyConfig>,
  remoteFamilies?: Record<string, ThemeFamilyConfig>,
): ThemeFamilyCatalog =>
  rawConfig
    ? {
        [DEFAULT_THEME_FAMILY]: {
          light: rawConfig.light,
          dark: rawConfig.dark,
        },
        ...(builtinFamilies ?? {}),
        ...(rawConfig.families ?? {}),
        ...(remoteFamilies ?? {}),
      }
    : {};

/**
 * Built-in families load together with theme.json (announced by the same
 * `custom-theme-loaded` event); track them as state so consumers re-render
 * once the file arrives — including in branding preview mode, where
 * `useRawCustomThemeConfig` does not listen for that event.
 */
const useBuiltinThemeFamilies = ():
  | Record<string, ThemeFamilyConfig>
  | undefined => {
  'use memo';
  const [families, setFamilies] = useState(getBuiltinThemeFamilies());
  const subscribe = useEffectEvent(() => {
    if (!families) {
      const handler = () => setFamilies(getBuiltinThemeFamilies());
      document.addEventListener('custom-theme-loaded', handler);
      return () => {
        document.removeEventListener('custom-theme-loaded', handler);
      };
    }
  });
  useEffect(() => subscribe(), []);
  return families;
};

export type UseThemeFamilyResult = {
  /** The resolved active family key (always present in `families`). */
  family: string;
  /** Persist a new family selection (by family key). */
  setActiveThemeFamily: (family: string) => void;
  /** All selectable families, including the synthesized `default`. */
  families: ThemeFamilyCatalog;
  /**
   * The site-applied `CustomThemeConfig`: the default theme (`theme.json`)
   * with `light`/`dark` resolved to the active family and the custom accent
   * applied. This is what every theme provider consumes. `undefined` until
   * `theme.json` has loaded. For the *editable* default theme document (the
   * Branding page), use `useDefaultTheme` instead.
   */
  activeThemeFamily: CustomThemeConfig | undefined;
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
export const useThemeFamily = (): UseThemeFamilyResult => {
  'use memo';
  const rawConfig = useRawCustomThemeConfig();
  const [storedFamily, setStoredFamily] = useLocalStorageGlobalState<
    string | undefined
  >(THEME_FAMILY_STORAGE_KEY, undefined);
  // Custom primary color is an ordinary user setting; when present it
  // overrides the active family's primary color below. Owned by
  // ThemeAccentColorPicker.
  const [storedAccent] = useBAISettingUserState('custom_primary_color');

  const builtinFamilies = useBuiltinThemeFamilies();
  const families = resolveThemeFamilyCatalog(rawConfig, builtinFamilies);

  // Resolution order: user choice -> operator default -> built-in default.
  // Fall back to `default` if the requested key is absent (e.g. operator
  // removed a family the user had selected).
  const requestedFamily =
    storedFamily ?? rawConfig?.defaultFamily ?? DEFAULT_THEME_FAMILY;
  const activeFamily = families[requestedFamily]
    ? requestedFamily
    : DEFAULT_THEME_FAMILY;

  const activePair: ThemeFamilyConfig | undefined = families[activeFamily];
  const accent = storedAccent || undefined;

  let activeThemeFamily: CustomThemeConfig | undefined;
  if (rawConfig && activePair) {
    let { light, dark } = activePair;
    if (accent) {
      // Override colorPrimary/colorLink/headerBg on both schemes; Ant Design's
      // algorithm derives the rest of the palette from colorPrimary.
      light = _.cloneDeep(light);
      dark = _.cloneDeep(dark);
      for (const cfg of [light, dark]) {
        _.set(cfg, 'token.colorPrimary', accent);
        _.set(cfg, 'token.colorLink', accent);
        _.set(cfg, 'components.Layout.headerBg', accent);
      }
    }
    activeThemeFamily = { ...rawConfig, light, dark };
  }

  // Only writer of the body attribute that keys the signature-effect CSS.
  useEffect(() => {
    if (document.body.getAttribute('data-theme-family') !== activeFamily) {
      document.body.setAttribute('data-theme-family', activeFamily);
    }
  }, [activeFamily]);

  return {
    family: activeFamily,
    setActiveThemeFamily: setStoredFamily,
    families,
    activeThemeFamily,
  };
};
