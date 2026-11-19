/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */

// The `backendaiwebui.login.` prefix is what `clearLoginStorage` (hooks/useLogout.ts) removes on logout.
const STORAGE_KEY = 'backendaiwebui.login.webuiAssistantApiKey';

/** The custom endpoint's API key kept in this browser, if it was saved for `baseURL`. */
export function loadStoredApiKey(baseURL: string): string | undefined {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return undefined;
    const saved = JSON.parse(raw) as { baseURL?: string; apiKey?: unknown };
    return saved.baseURL === baseURL && typeof saved.apiKey === 'string'
      ? saved.apiKey
      : undefined;
  } catch {
    return undefined;
  }
}

/** Keeps the custom endpoint's key until logout; no key, or a deployment connection, removes it. */
export function storeApiKey(baseURL?: string, apiKey?: string) {
  try {
    if (baseURL && apiKey) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ baseURL, apiKey }));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Storage can be unavailable (private mode, blocked site data); the key then stays in memory only.
  }
}
