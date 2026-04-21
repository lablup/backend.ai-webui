/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { fetchAndParseConfig } from './useWebUIConfig';

/**
 * Resolve the Backend.AI API endpoint from `config.toml` and fallbacks.
 *
 * Intended for pages and components that are entered outside of the normal
 * `LoginView` → `useInitializeConfig` flow (e.g. token URL entry points like
 * `EduAppLauncher` or the sToken login boundary) where neither
 * `localStorage('backendaiwebui.api_endpoint')` nor the `loginConfigState`
 * atom have been populated yet. The shared `useApiEndpoint()` hook would
 * return an empty string in those cases.
 *
 * Resolution order:
 *   1. `config.toml` → `general.apiEndpoint`
 *   2. `localStorage('backendaiwebui.api_endpoint')`
 *   3. Empty string (the caller should display an error in this case)
 *
 * Implementation note: this function suspends by throwing a promise so the
 * caller can gate rendering with `<Suspense>` until endpoint resolution
 * completes. The resolved value may still be an empty string if every
 * fallback source is unavailable — downstream code is responsible for
 * surfacing that failure (for example, via an error notification or an
 * `endpoint-unresolved` error state).
 */

let cachedEndpoint: string | null = null;
let inflightPromise: Promise<string> | null = null;

const readEndpointFromLocalStorage = (): string => {
  const stored = localStorage.getItem('backendaiwebui.api_endpoint');
  if (!stored) return '';
  return stored.replace(/^"+|"+$/g, '').trim();
};

const resolveEndpoint = async (): Promise<string> => {
  const configPath = (globalThis as Record<string, unknown>).isElectron
    ? 'es6://config.toml'
    : '../../config.toml';

  const { config } = await fetchAndParseConfig(configPath);
  const rawEndpoint = config?.general?.apiEndpoint;
  const fromToml = typeof rawEndpoint === 'string' ? rawEndpoint.trim() : '';

  if (fromToml) {
    return fromToml;
  }

  return readEndpointFromLocalStorage();
};

/**
 * Suspense-compatible hook that returns a resolved API endpoint string.
 * Throws a promise on first call so the component tree suspends until the
 * config.toml fetch completes; subsequent calls return the cached value.
 */
export const useResolvedApiEndpoint = (): string => {
  if (cachedEndpoint !== null) {
    return cachedEndpoint;
  }
  if (!inflightPromise) {
    inflightPromise = resolveEndpoint().then(
      (endpoint) => {
        if (endpoint) {
          cachedEndpoint = endpoint;
          return endpoint;
        }
        // Do not cache an empty result: allow the next render to retry
        // resolution (e.g., after `config.toml` becomes available).
        inflightPromise = null;
        return endpoint;
      },
      (error) => {
        inflightPromise = null;
        throw error;
      },
    );
  }
  throw inflightPromise;
};
