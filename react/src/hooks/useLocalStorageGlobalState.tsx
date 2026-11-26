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

  const writeStored = (key: string, value: unknown) => {
    try {
      const storage = getStorage();
      if (value === undefined) {
        storage?.removeItem(key);
      } else {
        storage?.setItem(key, JSON.stringify(value));
      }
    } catch {
      // Privacy mode or quota: the value still lives in the atom below.
    }
  };

  const storedAtomFamily = atomFamily((key: string) => {
    // The value last written through the hook. While an instance is mounted
    // the atom, not the storage, is what every instance reads.
    const writtenAtom = atom<{ isWritten: boolean; value?: unknown }>({
      isWritten: false,
    });
    // With no instance left the storage is the source again. A new object each
    // time: jotai keeps the last read for an unmounted atom until a dependency changes.
    writtenAtom.onMount = (setWritten) => () =>
      setWritten({ isWritten: false });
    return atom(
      (get) => {
        const written = get(writtenAtom);
        return written.isWritten ? written.value : readStored(key);
      },
      (_get, set, next: unknown) => {
        writeStored(key, next);
        set(writtenAtom, { isWritten: true, value: next });
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
