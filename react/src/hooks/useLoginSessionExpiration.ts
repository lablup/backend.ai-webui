/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { atom, useSetAtom } from 'jotai';
import { useEffect } from 'react';

/**
 * Every tab of a browser profile shares one cookie-backed webserver login
 * session, so the expiry must be one shared value instead of a per-tab
 * countdown. The `BackendAIWebUI.login.` prefix makes `clearLoginStorage()`
 * in `useLogout` drop it on logout.
 */
export const LOGIN_SESSION_EXPIRES_AT_STORAGE_KEY =
  'BackendAIWebUI.login.sessionExpiresAt';

/** Expiry of the shared login session in epoch milliseconds, or null when unknown. */
export const loginSessionExpiresAtState = atom<number | null>(null);

export const isLoginSessionExpiredState = atom(false);

/**
 * Record an expiry learned from this tab's own extend call or from a sibling
 * tab. It may only move later: the client never shortens the session, so a
 * stale value can never sign anyone out before the server does.
 */
export const learnLoginSessionExpiresAtState = atom(
  null,
  (get, set, expiresAt: number | null) => {
    if (expiresAt === null) {
      set(loginSessionExpiresAtState, null);
      return;
    }
    const current = get(loginSessionExpiresAtState);
    if (current !== null && expiresAt <= current) return;
    set(loginSessionExpiresAtState, expiresAt);
    set(isLoginSessionExpiredState, false);
  },
);

export const parseLoginSessionExpiresAt = (
  value?: string | null,
): number | null => {
  if (!value) return null;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? null : time;
};

export const readLoginSessionExpiresAt = (): number | null => {
  try {
    return parseLoginSessionExpiresAt(
      localStorage.getItem(LOGIN_SESSION_EXPIRES_AT_STORAGE_KEY),
    );
  } catch {
    // Storage can be unavailable (private mode, blocked cookies).
    return null;
  }
};

/**
 * Publish an expiry to the sibling tabs. Writing an earlier value is skipped so
 * a slow response cannot roll the shared expiry back.
 */
export const publishLoginSessionExpiresAt = (expires: string): void => {
  const incoming = parseLoginSessionExpiresAt(expires);
  if (incoming === null) return;
  const stored = readLoginSessionExpiresAt();
  if (stored !== null && incoming <= stored) return;
  try {
    localStorage.setItem(LOGIN_SESSION_EXPIRES_AT_STORAGE_KEY, expires);
  } catch {
    // Storage can be unavailable; the tab still counts down from its own value.
  }
};

/**
 * Mirror the stored expiry into `loginSessionExpiresAtState` and keep it in
 * sync with the other tabs. `storage` never fires in the tab that wrote the
 * value, so the writer updates the atom itself.
 */
export const useSyncLoginSessionExpiresAt = (): void => {
  'use memo';
  const learnExpiresAt = useSetAtom(learnLoginSessionExpiresAtState);

  useEffect(() => {
    learnExpiresAt(readLoginSessionExpiresAt());
    const handleStorage = (event: StorageEvent) => {
      // A null key means localStorage.clear(), which drops our key too.
      if (
        event.key !== null &&
        event.key !== LOGIN_SESSION_EXPIRES_AT_STORAGE_KEY
      ) {
        return;
      }
      learnExpiresAt(parseLoginSessionExpiresAt(event.newValue));
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [learnExpiresAt]);
};
