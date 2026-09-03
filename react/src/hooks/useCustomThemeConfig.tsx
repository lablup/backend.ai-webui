/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  BAIAppearanceConfig,
  getCustomTheme,
  isAppearanceSettled,
} from '../helper/customThemeConfig';
import { useBAISettingUserState } from './useBAISetting';
import { useLocalStorageGlobalState } from './useLocalStorageGlobalState';
import { useSessionStorageState } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import {
  useEffect,
  useEffectEvent,
  useState,
  useSyncExternalStore,
} from 'react';

/**
 * The family shown before the user picks one. The v2 document must carry a
 * `default` entry in `theme.families`; a document without one degrades to the
 * built-in seeds. The same literal is read by the FOUC bootstrap in
 * `index.html`; keep them in sync.
 */
export const DEFAULT_THEME_FAMILY = 'default';

/**
 * localStorage key of the selected family. Mirrors `themeMode` (NOT under
 * the `.user.` namespace) because the FOUC bootstrap in `index.html` reads it
 * before paint. A server-side `userConfig.themeFamily` store arrives with
 * FR-1964; until then this key is the only store.
 */
export const THEME_FAMILY_STORAGE_KEY = 'backendaiwebui.settings.themeFamily';

/**
 * Returns the raw, operator-provided appearance document: the current
 * domain's saved `appearance` slice wholesale, or the shipped
 * `resources/theme.json` when no domain document was ever saved — or the
 * per-user draft while in branding preview mode. No deep-merge: "absent"
 * means "follow the shipped defaults" (FR-1964).
 * Shared by `useCustomThemeConfig` and `useDefaultTheme` (the editable
 * document of the Branding page). Safe outside RelayEnvironmentProvider.
 */
export const useRawCustomThemeConfig = (): BAIAppearanceConfig | undefined => {
  'use memo';
  const [customThemeConfig, setCustomThemeConfig] = useState<
    BAIAppearanceConfig | undefined
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

  if (isThemePreviewMode) {
    return userCustomThemeConfig;
  }
  return customThemeConfig;
};

/**
 * True once the appearance bootstrap has settled (document loaded, or given
 * up). The theme providers render nothing before that, so the splash stays
 * up instead of a neutral-then-brand flash.
 */
const subscribeToAppearanceSettled = (onChange: () => void) => {
  document.addEventListener('custom-theme-loaded', onChange);
  return () => document.removeEventListener('custom-theme-loaded', onChange);
};

export const useAppearanceSettled = (): boolean =>
  useSyncExternalStore(
    subscribeToAppearanceSettled,
    isAppearanceSettled,
    () => true,
  );

export type ThemeFamilyCatalog = Record<string, { label?: string }>;

/**
 * The selectable family catalog: `theme.families` keys with their
 * `branding.familyLabels` labels (the selector falls back to the key).
 */
export const resolveThemeFamilyCatalog = (
  config: BAIAppearanceConfig | undefined,
): ThemeFamilyCatalog => {
  const families = config?.theme?.families;
  if (!_.isPlainObject(families)) {
    return {};
  }
  return _.mapValues(
    _.pickBy(families, (family) => _.isPlainObject(family)),
    (_family, key) => ({ label: config?.branding?.familyLabels?.[key] }),
  );
};

export type UseCustomThemeConfigResult = {
  /** The resolved active family key. */
  activeThemeFamily: string;
  /**
   * Persist a new family selection (by family key). Pass `undefined` to clear
   * the selection so resolution falls back to the `default` family.
   */
  setActiveThemeFamily: (family: string | undefined) => void;
  /** All selectable families with their display labels. */
  themeFamilies: ThemeFamilyCatalog;
  /**
   * The applied v2 appearance document (or the preview draft in branding
   * preview mode). `undefined` until the bootstrap has settled. Theme
   * providers pass `appearance.theme` to `resolveRoleTheme`; branding
   * consumers read `appearance.branding`.
   */
  appearance: BAIAppearanceConfig | undefined;
};

/**
 * Single source of truth for the theme-family axis (orthogonal to the
 * light/dark axis owned by `useThemeMode`) and the applied appearance
 * document. Owns the family selection mirror, resolves the active family, and
 * is the only writer of the `data-theme-family` attribute on `<body>` (which
 * keys the signature effect CSS in `resources/theme-families.css`).
 */
export const useCustomThemeConfig = (): UseCustomThemeConfigResult => {
  'use memo';
  const appearance = useRawCustomThemeConfig();
  const [storedFamily, setStoredFamily] = useLocalStorageGlobalState<
    string | undefined
  >(THEME_FAMILY_STORAGE_KEY, undefined);
  const [isThemePreviewMode] = useSessionStorageState('isThemePreviewMode', {
    defaultValue: false,
  });

  const families = resolveThemeFamilyCatalog(appearance);

  // Resolution order: user choice -> `default`. Fall back to `default` if the
  // requested key is absent (e.g. operator removed a family the user had
  // selected). Branding preview mode shows the edited draft as-is, so the
  // user's family selection is ignored there (the User Settings items are
  // hidden in that mode as well).
  const requestedFamily = isThemePreviewMode
    ? DEFAULT_THEME_FAMILY
    : (storedFamily ?? DEFAULT_THEME_FAMILY);
  const activeFamily = families[requestedFamily]
    ? requestedFamily
    : DEFAULT_THEME_FAMILY;

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
    appearance,
  };
};
