/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  LOGIN_SESSION_EXPIRES_AT_STORAGE_KEY,
  isLoginSessionExpiredState,
  learnLoginSessionExpiresAtState,
  loginSessionExpiresAtState,
  parseLoginSessionExpiresAt,
  publishLoginSessionExpiresAt,
  readLoginSessionExpiresAt,
  useSyncLoginSessionExpiresAt,
} from './useLoginSessionExpiration';
import { act, renderHook } from '@testing-library/react';
import { Provider, createStore } from 'jotai';

const iso = (offsetMs: number) => new Date(Date.now() + offsetMs).toISOString();

const fireStorage = (key: string | null, newValue: string | null) => {
  window.dispatchEvent(new StorageEvent('storage', { key, newValue }));
};

beforeEach(() => {
  localStorage.clear();
});

describe('parseLoginSessionExpiresAt', () => {
  it('parses an ISO timestamp into epoch milliseconds', () => {
    expect(parseLoginSessionExpiresAt('2026-01-02T03:04:05.000Z')).toBe(
      Date.parse('2026-01-02T03:04:05.000Z'),
    );
  });

  it('returns null for empty or unparsable values', () => {
    expect(parseLoginSessionExpiresAt(null)).toBeNull();
    expect(parseLoginSessionExpiresAt('')).toBeNull();
    expect(parseLoginSessionExpiresAt('not a date')).toBeNull();
  });
});

describe('publishLoginSessionExpiresAt', () => {
  it('publishes an expiry other tabs can read back', () => {
    const expires = iso(60_000);
    publishLoginSessionExpiresAt(expires);
    expect(localStorage.getItem(LOGIN_SESSION_EXPIRES_AT_STORAGE_KEY)).toBe(
      expires,
    );
    expect(readLoginSessionExpiresAt()).toBe(Date.parse(expires));
  });

  it('never rolls the shared expiry back to an earlier value', () => {
    const later = iso(600_000);
    publishLoginSessionExpiresAt(later);
    publishLoginSessionExpiresAt(iso(60_000));
    expect(localStorage.getItem(LOGIN_SESSION_EXPIRES_AT_STORAGE_KEY)).toBe(
      later,
    );
  });
});

describe('learnLoginSessionExpiresAtState', () => {
  it('keeps the later expiry and clears the expired flag', () => {
    const store = createStore();
    store.set(isLoginSessionExpiredState, true);

    store.set(learnLoginSessionExpiresAtState, 2_000);
    expect(store.get(loginSessionExpiresAtState)).toBe(2_000);
    expect(store.get(isLoginSessionExpiredState)).toBe(false);

    // An earlier value from a slower tab must not shorten the session.
    store.set(learnLoginSessionExpiresAtState, 1_000);
    expect(store.get(loginSessionExpiresAtState)).toBe(2_000);
  });

  it('clears the shared expiry when the value is dropped', () => {
    const store = createStore();
    store.set(learnLoginSessionExpiresAtState, 2_000);
    store.set(learnLoginSessionExpiresAtState, null);
    expect(store.get(loginSessionExpiresAtState)).toBeNull();
  });
});

describe('useSyncLoginSessionExpiresAt', () => {
  const renderWithStore = (store: ReturnType<typeof createStore>) =>
    renderHook(() => useSyncLoginSessionExpiresAt(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

  it('adopts the expiry a sibling tab already stored', () => {
    const expires = iso(60_000);
    localStorage.setItem(LOGIN_SESSION_EXPIRES_AT_STORAGE_KEY, expires);
    const store = createStore();

    renderWithStore(store);

    expect(store.get(loginSessionExpiresAtState)).toBe(Date.parse(expires));
  });

  it("adopts a sibling tab's renewal and un-expires this tab", () => {
    const store = createStore();
    store.set(learnLoginSessionExpiresAtState, Date.now());
    store.set(isLoginSessionExpiredState, true);
    renderWithStore(store);

    const renewed = iso(600_000);
    act(() => {
      fireStorage(LOGIN_SESSION_EXPIRES_AT_STORAGE_KEY, renewed);
    });

    expect(store.get(loginSessionExpiresAtState)).toBe(Date.parse(renewed));
    expect(store.get(isLoginSessionExpiredState)).toBe(false);
  });

  it('ignores storage events for unrelated keys', () => {
    const store = createStore();
    renderWithStore(store);

    act(() => {
      fireStorage('some.other.key', iso(600_000));
    });

    expect(store.get(loginSessionExpiresAtState)).toBeNull();
  });

  it('clears the shared expiry when a sibling tab logs out', () => {
    localStorage.setItem(LOGIN_SESSION_EXPIRES_AT_STORAGE_KEY, iso(60_000));
    const store = createStore();
    renderWithStore(store);

    act(() => {
      localStorage.removeItem(LOGIN_SESSION_EXPIRES_AT_STORAGE_KEY);
      fireStorage(LOGIN_SESSION_EXPIRES_AT_STORAGE_KEY, null);
    });

    expect(store.get(loginSessionExpiresAtState)).toBeNull();
  });

  it('stops listening once unmounted', () => {
    const store = createStore();
    const { unmount } = renderWithStore(store);
    unmount();

    act(() => {
      fireStorage(LOGIN_SESSION_EXPIRES_AT_STORAGE_KEY, iso(600_000));
    });

    expect(store.get(loginSessionExpiresAtState)).toBeNull();
  });
});
