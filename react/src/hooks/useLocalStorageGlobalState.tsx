/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSyncExternalStore } from 'react';

/**
 * A storage-backed state whose instances in one document stay in sync. Call it
 * at module scope with the storage to use (localStorage, sessionStorage, …).
 */
export const createGlobalStorageStateHook = (
  getStorage: () => Storage | undefined,
) => {
  const listenersByKey = new Map<string, Set<() => void>>();
  // Holds a value the storage refused (privacy mode, quota), so the state still works.
  const unsavedRawByKey = new Map<string, string | null>();

  const readRaw = (key: string): string | null => {
    if (unsavedRawByKey.has(key)) {
      return unsavedRawByKey.get(key) ?? null;
    }
    try {
      return getStorage()?.getItem(key) ?? null;
    } catch {
      return null;
    }
  };

  const writeRaw = (key: string, raw: string | null) => {
    try {
      const storage = getStorage();
      if (!storage) {
        throw new Error('storage unavailable');
      }
      if (raw === null) {
        storage.removeItem(key);
      } else {
        storage.setItem(key, raw);
      }
      unsavedRawByKey.delete(key);
    } catch {
      unsavedRawByKey.set(key, raw);
    }
    listenersByKey.get(key)?.forEach((listener) => listener());
  };

  const parse = <T,>(raw: string | null, defaultValue: T): T => {
    if (!raw) {
      return defaultValue;
    }
    try {
      return JSON.parse(raw) as T;
    } catch {
      return defaultValue;
    }
  };

  return function useGlobalStorageState<T>(key: string, defaultValue: T) {
    'use memo';
    // useSyncExternalStore re-reads the storage right after subscribing, so an
    // instance still mounting when another one writes does not keep the old value.
    const raw = useSyncExternalStore(
      (onStoreChange) => {
        const listeners = listenersByKey.get(key) ?? new Set<() => void>();
        listenersByKey.set(key, listeners);
        listeners.add(onStoreChange);
        return () => {
          listeners.delete(onStoreChange);
        };
      },
      () => readRaw(key),
    );
    const value = parse(raw, defaultValue);

    // `undefined` removes the entry.
    const setGlobalValue = (next: T) => {
      writeRaw(key, next === undefined ? null : JSON.stringify(next));
    };

    return [value, setGlobalValue] as const;
  };
};

export const useLocalStorageGlobalState = createGlobalStorageStateHook(() =>
  typeof window === 'undefined' ? undefined : localStorage,
);
