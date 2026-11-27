/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { atom, useAtom } from 'jotai';
import { atomFamily } from 'jotai-family';

/**
 * A storage-backed state whose instances in one document stay in sync. Call it
 * at module scope with the storage to use (localStorage, sessionStorage, …).
 */
export const createGlobalStorageStateHook = (
  getStorage: () => Storage | undefined,
) => {
  // `undefined` stands for "no entry": JSON never parses to it.
  const readStored = (key: string): unknown => {
    try {
      const raw = getStorage()?.getItem(key);
      return raw ? JSON.parse(raw) : undefined;
    } catch {
      return undefined;
    }
  };

  type Written = { isWritten: boolean; isSaved?: boolean; value?: unknown };

  // Returns the value as a reload would read it, and whether the storage took it.
  const writeStored = (key: string, value: unknown): Written => {
    if (value === undefined) {
      try {
        getStorage()?.removeItem(key);
        return { isWritten: true, isSaved: true };
      } catch {
        return { isWritten: true, isSaved: false };
      }
    }
    let raw: string | undefined;
    try {
      raw = JSON.stringify(value);
    } catch {
      raw = undefined;
    }
    // `JSON.stringify` gives `undefined`, without throwing, for a function or a symbol.
    if (raw === undefined) {
      return { isWritten: true, isSaved: false, value };
    }
    const saved = JSON.parse(raw) as unknown;
    try {
      const storage = getStorage();
      storage?.setItem(key, raw);
      return { isWritten: true, isSaved: !!storage, value: saved };
    } catch {
      // Privacy mode or quota: the value lives in the atom only.
      return { isWritten: true, isSaved: false, value: saved };
    }
  };

  const storedAtomFamily = atomFamily((key: string) => {
    // The value last written through the hook. While an instance is mounted
    // the atom, not the storage, is what every instance reads.
    const writtenAtom = atom<Written>({ isWritten: false });
    // With no instance left the storage is the source again, unless it refused
    // the value. A new object each time: jotai keeps the last read for an
    // unmounted atom until a dependency changes.
    writtenAtom.onMount = (setWritten) => () =>
      setWritten((written) =>
        written.isWritten && !written.isSaved ? written : { isWritten: false },
      );
    return atom(
      (get) => {
        const written = get(writtenAtom);
        return written.isWritten ? written.value : readStored(key);
      },
      (_get, set, next: unknown) => {
        set(writtenAtom, writeStored(key, next));
      },
    );
  });

  return function useGlobalStorageState<T>(key: string, defaultValue: T) {
    'use memo';
    const [stored, setStored] = useAtom(storedAtomFamily(key));
    const value = stored === undefined ? defaultValue : (stored as T);

    // `undefined` removes the entry.
    const setGlobalValue = (next: T) => {
      setStored(next);
    };

    return [value, setGlobalValue] as const;
  };
};

export const useLocalStorageGlobalState = createGlobalStorageStateHook(() =>
  typeof window === 'undefined' ? undefined : localStorage,
);
