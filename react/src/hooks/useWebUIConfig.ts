/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * WebUI Config - React-based config.toml parsing and state management.
 *
 * This module replaces the Lit shell's _parseConfig() and loadConfig() methods.
 * It fetches config.toml, parses it with markty-toml, preprocesses values,
 * and provides the parsed config to React components via Jotai atoms.
 *
 * Config values are also set on globalThis for backward compatibility with
 * non-React code (e.g. globalThis.packageEdition, globalThis.packageValidUntil).
 */
import {
  refreshConfigFromToml,
  type LoginConfigState,
} from '../helper/loginConfig';
import {
  pluginConfigStringState,
  pluginLoadedState,
} from './useWebUIPluginState';
import { atom, useAtomValue, useSetAtom } from 'jotai';
import toml from 'markty-toml';
import { useCallback, useEffect, useRef } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * The raw parsed TOML config object (before field-level interpretation).
 * This mirrors the shape returned by markty-toml for config.toml.
 */
export interface RawTomlConfig {
  general?: Record<string, unknown>;
  license?: {
    edition?: string;
    validUntil?: string;
    [key: string]: unknown;
  };
  wsproxy?: {
    proxyURL?: string;
    [key: string]: unknown;
  };
  plugin?: {
    login?: string;
    page?: string;
    [key: string]: unknown;
  };
  resources?: Record<string, unknown>;
  environments?: Record<string, unknown>;
  menu?: Record<string, unknown>;
  pipeline?: Record<string, unknown>;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Atoms
// ---------------------------------------------------------------------------

/**
 * Holds the raw parsed config.toml object.
 * Set once during app initialization, may be updated for Electron webserver merge.
 */
export const rawConfigState = atom<RawTomlConfig | null>(null);

/**
 * Holds the processed LoginConfigState derived from the raw TOML config.
 */
export const loginConfigState = atom<LoginConfigState | null>(null);

/**
 * Indicates whether config.toml has been fetched and processed.
 */
export const configLoadedState = atom<boolean>(false);

/**
 * Holds the auto_logout flag extracted from config.
 */
export const autoLogoutState = atom<boolean>(false);

/**
 * Holds the proxy URL from config.wsproxy.proxyURL.
 */
export const proxyUrlState = atom<string>('');

/**
 * Holds the login plugin name from config.plugin.login.
 */
export const loginPluginState = atom<string>('');

// ---------------------------------------------------------------------------
// TOML fetching and preprocessing
// ---------------------------------------------------------------------------

/**
 * Preprocess the TOML config to handle escape sequences in apiEndpointText.
 * This mirrors the Lit shell's _preprocessToml logic.
 */
function preprocessToml(config: RawTomlConfig): void {
  if (config?.general?.apiEndpointText) {
    try {
      config.general.apiEndpointText = JSON.parse(
        `"${config.general.apiEndpointText}"`,
      );
    } catch {
      // If JSON.parse fails, keep the original value
    }
  }
}

/**
 * Fetch and parse config.toml from the given path.
 * Returns the parsed TOML object, or null on failure.
 */
export async function fetchAndParseConfig(
  configPath: string,
): Promise<RawTomlConfig | null> {
  try {
    const res = await fetch(configPath);
    if (res.status !== 200) {
      return null;
    }
    const text = await res.text();
    const parsed = toml(text) as RawTomlConfig;
    preprocessToml(parsed);
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Process the raw config to extract config values and set global state.
 * This replaces the Lit shell's loadConfig() method.
 */
function processConfig(config: RawTomlConfig): {
  autoLogout: boolean;
  proxyUrl: string;
  loginPlugin: string;
  pluginPages: string;
  loginConfig: LoginConfigState;
} {
  // Auto-logout setting
  let autoLogout = false;
  const storedAutoLogout = (globalThis as Record<string, unknown>)
    .backendaioptions
    ? (
        (globalThis as Record<string, unknown>).backendaioptions as {
          get: (key: string, defaultValue?: unknown) => unknown;
        }
      ).get('auto_logout')
    : null;

  if (
    storedAutoLogout === null &&
    config.general !== undefined &&
    'autoLogout' in config.general
  ) {
    autoLogout = config.general.autoLogout as boolean;
  } else {
    autoLogout = (storedAutoLogout as boolean) ?? false;
  }

  // Package edition and license info
  let edition = 'Open Source';
  let validUntil = '';

  if (config.license !== undefined && 'edition' in config.license) {
    edition = config.license.edition ?? 'Open Source';
  }
  (globalThis as Record<string, unknown>).packageEdition = edition;

  if (config.license !== undefined && 'validUntil' in config.license) {
    validUntil = config.license.validUntil ?? '';
  }
  (globalThis as Record<string, unknown>).packageValidUntil = validUntil;

  // Proxy URL
  let proxyUrl = '';
  if (config.wsproxy !== undefined && 'proxyURL' in config.wsproxy) {
    proxyUrl = config.wsproxy.proxyURL ?? '';
  }

  // Login plugin
  let loginPlugin = '';
  if (config.plugin !== undefined && 'login' in config.plugin) {
    loginPlugin = config.plugin.login ?? '';
  }

  // Plugin pages
  const pluginPages =
    config.plugin !== undefined && 'page' in config.plugin
      ? (config.plugin.page ?? '')
      : '';

  // Derive the full LoginConfigState from the raw config
  const loginConfig = refreshConfigFromToml(config);

  return {
    autoLogout,
    proxyUrl,
    loginPlugin,
    pluginPages,
    loginConfig,
  };
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

/**
 * Hook that initializes the config system by fetching and parsing config.toml.
 * Should be called once at the app root level (e.g., in the Lit shell bridge
 * or in a top-level React component).
 *
 * This replaces the Lit shell's _parseConfig() + loadConfig() flow.
 */
export function useInitializeConfig(): {
  isLoaded: boolean;
  rawConfig: RawTomlConfig | null;
  loginConfig: LoginConfigState | null;
  loadConfig: () => Promise<void>;
} {
  const setRawConfig = useSetAtom(rawConfigState);
  const setLoginConfig = useSetAtom(loginConfigState);
  const setConfigLoaded = useSetAtom(configLoadedState);
  const setAutoLogout = useSetAtom(autoLogoutState);
  const setProxyUrl = useSetAtom(proxyUrlState);
  const setLoginPlugin = useSetAtom(loginPluginState);
  const setPluginConfigString = useSetAtom(pluginConfigStringState);
  const setPluginLoaded = useSetAtom(pluginLoadedState);

  const isLoaded = useAtomValue(configLoadedState);
  const rawConfig = useAtomValue(rawConfigState);
  const currentLoginConfig = useAtomValue(loginConfigState);
  const initRef = useRef(false);

  const loadConfig = useCallback(async () => {
    if (initRef.current) return;
    initRef.current = true;

    const configPath = (globalThis as Record<string, unknown>).isElectron
      ? './config.toml'
      : '../../config.toml';

    const parsed = await fetchAndParseConfig(configPath);

    if (!parsed) {
      // Config fetch failed - still mark as loaded so the app can show errors
      setConfigLoaded(true);
      return;
    }

    setRawConfig(parsed);

    const { autoLogout, proxyUrl, loginPlugin, pluginPages, loginConfig } =
      processConfig(parsed);

    setLoginConfig(loginConfig);
    setAutoLogout(autoLogout);
    setProxyUrl(proxyUrl);
    setLoginPlugin(loginPlugin);

    // Set plugin config directly into plugin atoms (replaces CustomEvent bridge)
    if (pluginPages) {
      setPluginConfigString(pluginPages);
    } else {
      setPluginLoaded(true);
    }

    setConfigLoaded(true);
  }, [
    setRawConfig,
    setLoginConfig,
    setConfigLoaded,
    setAutoLogout,
    setProxyUrl,
    setLoginPlugin,
    setPluginConfigString,
    setPluginLoaded,
  ]);

  return {
    isLoaded,
    rawConfig,
    loginConfig: currentLoginConfig,
    loadConfig,
  };
}

/**
 * Hook to access the processed login config state.
 */
export function useLoginConfig(): LoginConfigState | null {
  return useAtomValue(loginConfigState);
}

/**
 * Hook to access the raw config.toml state.
 */
export function useRawConfig(): RawTomlConfig | null {
  return useAtomValue(rawConfigState);
}

/**
 * Hook to check if config has been loaded.
 */
export function useConfigLoaded(): boolean {
  return useAtomValue(configLoadedState);
}

/**
 * Hook to access the auto-logout setting.
 */
export function useAutoLogout(): boolean {
  return useAtomValue(autoLogoutState);
}

/**
 * Hook to access the proxy URL.
 */
export function useProxyUrl(): string {
  return useAtomValue(proxyUrlState);
}

/**
 * Hook to update the raw config (e.g., after Electron webserver config merge).
 * Returns a setter that re-processes config after updating.
 */
export function useUpdateRawConfig(): (config: RawTomlConfig) => void {
  const setRawConfig = useSetAtom(rawConfigState);
  const setLoginConfig = useSetAtom(loginConfigState);
  const setAutoLogout = useSetAtom(autoLogoutState);
  const setProxyUrl = useSetAtom(proxyUrlState);
  const setLoginPlugin = useSetAtom(loginPluginState);

  return useCallback(
    (config: RawTomlConfig) => {
      setRawConfig(config);
      const { autoLogout, proxyUrl, loginPlugin, loginConfig } =
        processConfig(config);
      setLoginConfig(loginConfig);
      setAutoLogout(autoLogout);
      setProxyUrl(proxyUrl);
      setLoginPlugin(loginPlugin);
    },
    [setRawConfig, setLoginConfig, setAutoLogout, setProxyUrl, setLoginPlugin],
  );
}

/**
 * Effect hook that sets up the proxy URL on the backend client
 * when the user connects (replaces Lit shell's refreshPage).
 */
export function useConfigRefreshPageEffect(): void {
  const proxyUrl = useAtomValue(proxyUrlState);

  useEffect(() => {
    const handleConnected = () => {
      const client = (globalThis as Record<string, unknown>).backendaiclient as
        | { proxyURL?: string }
        | undefined;
      if (client) {
        client.proxyURL = proxyUrl;
      }
    };

    document.addEventListener('backend-ai-connected', handleConnected);
    return () => {
      document.removeEventListener('backend-ai-connected', handleConnected);
    };
  }, [proxyUrl]);
}
