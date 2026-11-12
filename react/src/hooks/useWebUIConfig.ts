/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * WebUI Config - React-based config.toml parsing and state management.
 *
 * This module replaces the Lit shell's _parseConfig() and loadConfig() methods.
 * It fetches config.toml, parses it with smol-toml, preprocesses values,
 * and provides the parsed config to React components via Jotai atoms.
 *
 * Config values are also set on globalThis for backward compatibility with
 * non-React code (e.g. globalThis.packageEdition, globalThis.packageValidUntil).
 */
import {
  getDefaultLoginConfig,
  refreshConfigFromToml,
  type LoginConfigState,
} from '../helper/loginConfig';
import { useBAILogger } from 'backend.ai-ui';
import { atom, useAtomValue, useSetAtom, useStore } from 'jotai';
import type { createStore } from 'jotai';
import { useEffect } from 'react';
import { parse as toml } from 'smol-toml';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * The raw parsed TOML config object (before field-level interpretation).
 * This mirrors the shape returned by smol-toml for config.toml.
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
 * Holds the config.toml parse error, if any.
 * Set when fetch succeeds but TOML parsing fails (e.g. duplicate keys).
 */
export const configParseErrorState = atom<unknown | null>(null);

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

/**
 * Module-level in-flight promise so config.toml is fetched and processed at
 * most once per page load, even when multiple entry points race to
 * initialize it (LoginView via `useInitializeConfig`, sToken entry paths via
 * `initializeConfigOnce` — see FR-3128). Concurrent callers share the same
 * promise instead of observing a half-initialized state.
 */
let configInitPromise: Promise<void> | null = null;

/**
 * Jotai store handle shape shared by the app-level `jotaiStore` and the
 * store returned by `useStore()`.
 */
type JotaiStore = ReturnType<typeof createStore>;

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
 * Result of fetching and parsing config.toml.
 * - Fetch failure (network error, non-200, SPA fallback): `{ config: null }` — no error.
 * - Parse failure (invalid TOML after fetch succeeds): `{ config: null, error }`.
 */
interface ConfigFetchResult {
  config: RawTomlConfig | null;
  error?: unknown;
  /** The `signal` aborted the fetch or the body read. */
  aborted?: boolean;
}

/**
 * Fetch and parse config.toml from the given path.
 * Returns the parsed config and any parse error for diagnostic logging.
 */
export async function fetchAndParseConfig(
  configPath: string,
  init?: Pick<RequestInit, 'signal' | 'credentials'>,
): Promise<ConfigFetchResult> {
  const signal = init?.signal ?? undefined;
  let res: Response;
  try {
    res = await fetch(configPath, init);
  } catch {
    // Network / fetch error — treat as missing config (no error field).
    return signal?.aborted ? { config: null, aborted: true } : { config: null };
  }

  if (res.status !== 200) {
    return { config: null };
  }
  // When config.toml is missing, the dev server's SPA fallback
  // (historyApiFallback) serves index.html with status 200.  Detect this
  // by checking the Content-Type header — a real TOML file is served as
  // text/plain or application/octet-stream, never text/html.
  const contentType = res.headers.get('content-type') ?? '';
  if (contentType.includes('text/html')) {
    return { config: null };
  }

  let text: string;
  try {
    // An aborted signal also rejects an in-flight body read (Fetch spec).
    text = await res.text();
  } catch {
    return signal?.aborted ? { config: null, aborted: true } : { config: null };
  }

  try {
    const parsed = toml(text) as RawTomlConfig;
    preprocessToml(parsed);
    return { config: parsed };
  } catch (error) {
    // Parse error — config was fetched but TOML is invalid.
    return { config: null, error };
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

  // Derive the full LoginConfigState from the raw config
  const loginConfig = refreshConfigFromToml(config);

  return {
    autoLogout,
    proxyUrl,
    loginPlugin,
    loginConfig,
  };
}

/**
 * Fetch and process config.toml exactly once per page load, writing the
 * results into the given Jotai store (the app-level `jotaiStore` in
 * production — `index.tsx` passes it to the root `JotaiProvider`, so
 * `useStore()` resolves to the same instance).
 *
 * Historically only `LoginView` (via `useInitializeConfig`) triggered this
 * bootstrap. Entry points that authenticate *before* the regular layout
 * mounts — e.g. `STokenLoginBoundary` on sToken/SSO URLs — must await this
 * themselves, otherwise the login sequence runs against
 * `getDefaultLoginConfig()` and silently drops webserver-configured flags
 * such as `[resources].allowNonAuthTCP` (FR-3128).
 *
 * Missing or unparsable config.toml is not an error: defaults are applied
 * and the promise resolves, mirroring the previous `useInitializeConfig`
 * behavior.
 */
export function initializeConfigOnce(
  store: JotaiStore,
  logger: Pick<Console, 'error' | 'warn'> = console,
): Promise<void> {
  if (!configInitPromise) {
    configInitPromise = (async () => {
      // Electron uses es6:// protocol which resolves from app/ directory
      // Web uses relative path from the HTML location
      const configPath = (globalThis as Record<string, unknown>).isElectron
        ? 'es6://config.toml'
        : '../../config.toml';

      const result = await fetchAndParseConfig(configPath);

      if (!result.config) {
        // config.toml is missing or failed to parse — apply defaults so the
        // app remains functional (login page renders with empty API endpoint
        // field).
        const defaultConfig = getDefaultLoginConfig();
        store.set(loginConfigState, defaultConfig);
        store.set(proxyUrlState, defaultConfig.proxy_url);
        store.set(autoLogoutState, false);
        store.set(configLoadedState, true);

        // Ensure config-derived globals are set even when config.toml is
        // missing, so edition-dependent logic behaves consistently with the
        // normal path.
        const globalScope = globalThis as Record<string, unknown>;
        if (globalScope.packageEdition === undefined) {
          globalScope.packageEdition = 'Open Source';
        }
        if (globalScope.packageValidUntil === undefined) {
          globalScope.packageValidUntil = '';
        }

        if (result.error) {
          store.set(configParseErrorState, result.error);
          logger.error(
            '[config.toml] Failed to parse — using default configuration:',
            result.error,
          );
        } else {
          logger.warn('[config.toml] Not found — using default configuration');
        }
        return;
      }

      store.set(rawConfigState, result.config);

      const { autoLogout, proxyUrl, loginPlugin, loginConfig } = processConfig(
        result.config,
      );

      store.set(loginConfigState, loginConfig);
      store.set(autoLogoutState, autoLogout);
      store.set(proxyUrlState, proxyUrl);
      store.set(loginPluginState, loginPlugin);

      store.set(configLoadedState, true);
    })().catch((error) => {
      // The body above is designed never to reject (fetch/parse failures
      // resolve through the defaults path). If it somehow does, drop the
      // cached promise so a later caller can retry instead of permanently
      // caching the rejection.
      configInitPromise = null;
      throw error;
    });
  }
  return configInitPromise;
}

// ---------------------------------------------------------------------------
// Electron: the connected webserver's config.toml
// ---------------------------------------------------------------------------

/** Set once a webserver's config.toml has been merged over Electron's own. */
export const webServerConfigMergedState = atom<boolean>(false);

// Electron keeps its own endpoint, download URL and local wsproxy.
const WEB_SERVER_CONFIG_EXCLUDED_KEYS = [
  'general.apiEndpoint',
  'general.apiEndpointText',
  'general.appDownloadUrl',
  'wsproxy',
];

/**
 * The webserver config.toml URL for `apiEndpoint`, or null when the page is
 * served from that endpoint already or it is not http(s).
 */
export function webServerConfigUrl(apiEndpoint: string): string | null {
  if (window.location.href.startsWith(apiEndpoint)) return null;
  try {
    const endpointUrl = new URL(apiEndpoint);
    if (!['http:', 'https:'].includes(endpointUrl.protocol)) return null;
    return new URL('./config.toml', apiEndpoint).href;
  } catch {
    return null;
  }
}

/**
 * Merge a webserver config.toml over the current one, except the keys
 * Electron keeps for itself. Returns false when the merge helpers are absent.
 */
export function mergeWebServerConfig(
  store: JotaiStore,
  config: RawTomlConfig,
): boolean {
  const backendaiutils = (globalThis as Record<string, any>).backendaiutils;
  if (!backendaiutils) return false;
  WEB_SERVER_CONFIG_EXCLUDED_KEYS.forEach((key) => {
    backendaiutils.deleteNestedKeyFromObject(config, key);
  });
  const merged = backendaiutils.mergeNestedObjects(
    store.get(rawConfigState) ?? {},
    config,
  );
  store.set(rawConfigState, merged);
  store.set(loginConfigState, refreshConfigFromToml(merged));
  store.set(webServerConfigMergedState, true);
  return true;
}

// ---------------------------------------------------------------------------
// Post-login re-read
// ---------------------------------------------------------------------------

// One attempt plus one retry per delay, each attempt bounded by the timeout.
const CONFIG_REFRESH_RETRY_DELAYS_MS = [500, 1000];
const CONFIG_REFRESH_MAX_ATTEMPTS = CONFIG_REFRESH_RETRY_DELAYS_MS.length + 1;
const CONFIG_REFRESH_ATTEMPT_TIMEOUT_MS = 5000;

const delay = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Read a non-empty config.toml with retries; null when every attempt failed.
 * An empty document ({}) counts as a failed read, not a config that resets
 * every field.
 */
async function readConfigWithRetries(
  store: JotaiStore,
  configPath: string,
  maxAttempts: number,
  logger: Pick<Console, 'error' | 'warn'>,
  credentials?: RequestCredentials,
): Promise<RawTomlConfig | null> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (attempt > 0) {
      await delay(CONFIG_REFRESH_RETRY_DELAYS_MS[attempt - 1]);
    }
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      CONFIG_REFRESH_ATTEMPT_TIMEOUT_MS,
    );
    let result: ConfigFetchResult;
    try {
      result = await fetchAndParseConfig(configPath, {
        signal: controller.signal,
        ...(credentials ? { credentials } : {}),
      });
    } finally {
      clearTimeout(timeout);
    }

    if (result.config && Object.keys(result.config).length > 0) {
      store.set(configParseErrorState, null);
      return result.config;
    }

    const label = `[config.toml] Post-login re-fetch attempt ${attempt + 1}/${maxAttempts}`;
    if (result.error) {
      store.set(configParseErrorState, result.error);
      logger.error(
        `${label} failed to parse — keeping pre-login configuration:`,
        result.error,
      );
    } else if (result.aborted) {
      logger.warn(
        `${label} timed out after ${CONFIG_REFRESH_ATTEMPT_TIMEOUT_MS}ms`,
      );
    } else {
      logger.warn(`${label} found no config`);
    }
  }
  return null;
}

/**
 * - `refreshed`: the post-login document is in the store.
 * - `unchanged`: nothing to re-read, or nothing before login to lose; the
 *   pre-login state stands.
 * - `failed`: every attempt failed; the caller ends the session.
 */
export type ConfigRefreshResult = 'refreshed' | 'unchanged' | 'failed';

/**
 * Re-fetch config.toml after login: the webserver serves only the login-screen
 * fields before authentication (lablup/backend.ai#16486), so the pre-login
 * fetch never saw the rest. Retried with backoff and a per-attempt timeout.
 *
 * On Electron the re-read is of the connected webserver (`webServerEndpoint`),
 * with the session cookie, merged as before login.
 */
export async function refreshConfigAfterLogin(
  store: JotaiStore,
  logger: Pick<Console, 'error' | 'warn'> = console,
  options: { webServerEndpoint?: string } = {},
): Promise<ConfigRefreshResult> {
  if ((globalThis as Record<string, unknown>).isElectron) {
    // Nothing was merged before login (API mode, no webserver config.toml):
    // the bundled config is the whole config.
    const url = options.webServerEndpoint
      ? webServerConfigUrl(options.webServerEndpoint)
      : null;
    if (!url || !store.get(webServerConfigMergedState)) return 'unchanged';
    const config = await readConfigWithRetries(
      store,
      url,
      CONFIG_REFRESH_MAX_ATTEMPTS,
      logger,
      'include',
    );
    return config && mergeWebServerConfig(store, config)
      ? 'refreshed'
      : 'failed';
  }

  // Let an in-flight bootstrap land first, or it overwrites the refreshed
  // values; bounded, since the bootstrap fetch has no timeout of its own.
  if (configInitPromise) {
    await Promise.race([
      configInitPromise.catch(() => undefined),
      delay(CONFIG_REFRESH_ATTEMPT_TIMEOUT_MS),
    ]);
  }

  // Without a pre-login config (no config.toml, an empty or unparsable one, or
  // a bootstrap that failed) one read is tried and failure keeps the defaults.
  const preLogin = store.get(rawConfigState);
  const hadPreLoginConfig = !!preLogin && Object.keys(preLogin).length > 0;
  const config = await readConfigWithRetries(
    store,
    '../../config.toml',
    hadPreLoginConfig ? CONFIG_REFRESH_MAX_ATTEMPTS : 1,
    logger,
  );
  if (!config) return hadPreLoginConfig ? 'failed' : 'unchanged';

  store.set(rawConfigState, config);
  const { autoLogout, proxyUrl, loginPlugin, loginConfig } =
    processConfig(config);
  store.set(loginConfigState, loginConfig);
  store.set(autoLogoutState, autoLogout);
  store.set(proxyUrlState, proxyUrl);
  store.set(loginPluginState, loginPlugin);
  store.set(configLoadedState, true);
  return 'refreshed';
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
  'use memo';
  const store = useStore();
  const { logger } = useBAILogger();

  const isLoaded = useAtomValue(configLoadedState);
  const rawConfig = useAtomValue(rawConfigState);
  const currentLoginConfig = useAtomValue(loginConfigState);

  const loadConfig = () => initializeConfigOnce(store, logger);

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
 * Hook to access the config.toml parse error, if any.
 */
export function useConfigParseError(): unknown | null {
  return useAtomValue(configParseErrorState);
}

/**
 * Hook to update the raw config (e.g., after Electron webserver config merge).
 * Returns a setter that re-processes config after updating.
 */
export function useUpdateRawConfig(): (config: RawTomlConfig) => void {
  'use memo';
  const setRawConfig = useSetAtom(rawConfigState);
  const setLoginConfig = useSetAtom(loginConfigState);
  const setAutoLogout = useSetAtom(autoLogoutState);
  const setProxyUrl = useSetAtom(proxyUrlState);
  const setLoginPlugin = useSetAtom(loginPluginState);

  return (config: RawTomlConfig) => {
    setRawConfig(config);
    const { autoLogout, proxyUrl, loginPlugin, loginConfig } =
      processConfig(config);
    setLoginConfig(loginConfig);
    setAutoLogout(autoLogout);
    setProxyUrl(proxyUrl);
    setLoginPlugin(loginPlugin);
  };
}

/**
 * Effect hook that sets up the proxy URL on the backend client
 * when the user connects (replaces Lit shell's refreshPage).
 */
export function useConfigRefreshPageEffect(): void {
  const store = useStore();

  useEffect(() => {
    // Read the store, not a rendered value: the post-login refresh sets the
    // atom and `backend-ai-connected` fires before React re-renders.
    const handleConnected = () => {
      const client = (globalThis as Record<string, unknown>).backendaiclient as
        { proxyURL?: string } | undefined;
      if (client) {
        client.proxyURL = store.get(proxyUrlState);
      }
    };

    document.addEventListener('backend-ai-connected', handleConnected);
    return () => {
      document.removeEventListener('backend-ai-connected', handleConnected);
    };
  }, [store]);
}
