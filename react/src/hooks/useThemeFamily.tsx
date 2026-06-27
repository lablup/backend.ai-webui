/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { sanitizeHexColor } from '../helper/colorSanitizer';
import {
  CustomThemeConfig,
  ThemeFamilyConfig,
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

/** localStorage keys. Mirror `themeMode` (NOT under the `.user.` namespace). */
export const THEME_FAMILY_STORAGE_KEY = 'backendaiwebui.settings.themeFamily';
export const THEME_ACCENT_STORAGE_KEY = 'backendaiwebui.settings.themeAccent';

const FALLBACK_PRIMARY = '#FF7A00';

/**
 * Returns the raw, operator-provided `CustomThemeConfig` loaded from
 * `resources/theme.json` (or the per-user override while in branding preview
 * mode). This is the former body of `useCustomThemeConfig`, extracted so both
 * `useCustomThemeConfig` and `useThemeFamily` can share it without a cycle.
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

export type UseThemeFamilyResult = {
  /** The resolved active family key (always present in `families`). */
  family: string;
  /** Persist a new family selection. */
  setFamily: (family: string) => void;
  /** The user's custom accent hex, or undefined when using the family default. */
  accent: string | undefined;
  /** Persist a custom accent hex (pass undefined/empty to clear). */
  setAccent: (accent: string | undefined) => void;
  /** All selectable families, including the synthesized `default`. */
  families: ThemeFamilyCatalog;
  /**
   * The `CustomThemeConfig` with `light`/`dark` resolved to the active family
   * (and the custom accent applied). Fed to the single `BAIConfigProvider`.
   * `undefined` until `theme.json` has loaded.
   */
  activeThemeConfig: CustomThemeConfig | undefined;
  /** How the active family's header handles contrast (drives WebUIHeader). */
  headerScheme: ThemeFamilyConfig['headerScheme'];
};

/**
 * Single source of truth for the theme-family axis (orthogonal to the
 * light/dark axis owned by `useThemeMode`). Owns family + custom-accent state,
 * synthesizes the family catalog, resolves the active family, applies the
 * custom accent through Ant Design's token system, and is the only writer of
 * the `data-theme-family` attribute on `<body>` (which keys the signature
 * effect CSS in `resources/theme-families.css`).
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
  const [storedAccent, setStoredAccent] = useLocalStorageGlobalState<
    string | undefined
  >(THEME_ACCENT_STORAGE_KEY, undefined);

  // Catalog = synthesized `default` (from top-level light/dark) + operator families.
  const families: ThemeFamilyCatalog = rawConfig
    ? {
        [DEFAULT_THEME_FAMILY]: {
          light: rawConfig.light,
          dark: rawConfig.dark,
        },
        ...(rawConfig.families ?? {}),
      }
    : {};

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

  let activeThemeConfig: CustomThemeConfig | undefined;
  if (rawConfig && activePair) {
    let { light, dark } = activePair;
    if (accent) {
      const safeAccent = sanitizeHexColor(
        accent,
        (light?.token?.colorPrimary as string) ?? FALLBACK_PRIMARY,
      );
      // Override colorPrimary/colorLink/headerBg on both schemes; Ant Design's
      // algorithm derives the rest of the palette from colorPrimary.
      light = _.cloneDeep(light);
      dark = _.cloneDeep(dark);
      for (const cfg of [light, dark]) {
        _.set(cfg, 'token.colorPrimary', safeAccent);
        _.set(cfg, 'token.colorLink', safeAccent);
        _.set(cfg, 'components.Layout.headerBg', safeAccent);
      }
    }
    activeThemeConfig = { ...rawConfig, light, dark };
  }

  // Only writer of the body attribute that keys the signature-effect CSS.
  useEffect(() => {
    if (document.body.getAttribute('data-theme-family') !== activeFamily) {
      document.body.setAttribute('data-theme-family', activeFamily);
    }
  }, [activeFamily]);

  return {
    family: activeFamily,
    setFamily: setStoredFamily,
    accent,
    setAccent: setStoredAccent,
    families,
    activeThemeConfig,
    headerScheme: activePair?.headerScheme,
  };
};
