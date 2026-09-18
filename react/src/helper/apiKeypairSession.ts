/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */

// API mode never creates a server session, so the keypair is what a reload has
// to come back with. sessionStorage keeps it for this tab only; logout clears
// it with the rest of sessionStorage (FR-3561).
const API_KEYPAIR_KEY = 'backendaiwebui.api_keypair';

export interface ApiKeypair {
  accessKey: string;
  secretKey: string;
}

export function saveApiKeypair(keypair: ApiKeypair): void {
  try {
    sessionStorage.setItem(API_KEYPAIR_KEY, JSON.stringify(keypair));
  } catch {
    // Storage unavailable (privacy mode, quota): the login just stays in memory.
  }
}

export function loadApiKeypair(): ApiKeypair | null {
  try {
    const raw = sessionStorage.getItem(API_KEYPAIR_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      typeof parsed?.accessKey === 'string' &&
      parsed.accessKey &&
      typeof parsed?.secretKey === 'string' &&
      parsed.secretKey
    ) {
      return { accessKey: parsed.accessKey, secretKey: parsed.secretKey };
    }
  } catch {
    // Fall through: unreadable storage counts as "nothing stored".
  }
  clearApiKeypair();
  return null;
}

export function clearApiKeypair(): void {
  try {
    sessionStorage.removeItem(API_KEYPAIR_KEY);
  } catch {
    // Nothing to clear where storage is unavailable.
  }
}

/**
 * The mode the login screen starts in. A keypair this tab kept wins over the
 * configured default only where the user could have picked API mode.
 */
export function resolveInitialConnectionMode(
  config: {
    connection_mode: 'SESSION' | 'API';
    change_signin_support: boolean;
  },
  hasStoredKeypair: boolean,
): 'SESSION' | 'API' {
  if (hasStoredKeypair && config.change_signin_support) return 'API';
  return config.connection_mode;
}
