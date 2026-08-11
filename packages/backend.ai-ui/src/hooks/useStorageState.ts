import { useLatest, useLatestCallback } from './internal/useLatest';
import useEventListener from './useEventListener';
import useUpdateEffect from './useUpdateEffect';
import { useState } from 'react';

/**
 * `useState` backed by `localStorage` / `sessionStorage`.
 *
 * Ported from ahooks (alibaba/hooks, MIT) — `createUseStorageState`,
 * `useLocalStorageState`, `useSessionStorageState`.
 *
 * Behaviour preserved from ahooks:
 * - The stored value is read lazily on mount and re-read when `key` changes
 *   (but not on the mount render itself — that is the initial state).
 * - Writing `undefined` removes the entry instead of storing `"undefined"`.
 * - A write that is `Object.is`-equal to the current state is a no-op.
 * - With `listenStorageChange`, the hook re-syncs both from other documents
 *   (`storage` event) and from other hook instances in the same document
 *   (a custom event, because `StorageEvent` cannot be constructed for a
 *   non-built-in storage area).
 * - The setter identity is stable for the component's whole lifetime.
 */
export const SYNC_STORAGE_EVENT_NAME = 'BAI_SYNC_STORAGE_EVENT_NAME';

export type SetStorageState<S> = S | ((prevState?: S) => S);

export interface UseStorageStateOptions<T> {
  defaultValue?: T | (() => T);
  listenStorageChange?: boolean;
  serializer?: (value: T) => string;
  deserializer?: (value: string) => T;
  onError?: (error: unknown) => void;
}

interface StorageSyncDetail {
  key: string;
  newValue: string | null;
  oldValue: string | null;
  storageArea: Storage | undefined;
}

const isBrowser = typeof window !== 'undefined' && !!window.document;

const isFunction = (value: unknown): value is (...args: never[]) => unknown =>
  typeof value === 'function';

export const createUseStorageState = (
  getStorage: () => Storage | undefined,
) => {
  function useStorageState<T>(
    key: string,
    options: UseStorageStateOptions<T> = {},
  ) {
    const { listenStorageChange = false } = options;
    const serializer = isFunction(options.serializer)
      ? options.serializer
      : (JSON.stringify as (value: T) => string);
    const deserializer = isFunction(options.deserializer)
      ? options.deserializer
      : (JSON.parse as (value: string) => T);
    const onError = isFunction(options.onError)
      ? options.onError
      : // eslint-disable-next-line no-console -- ahooks' default `onError`; call sites can override it via `options.onError`.
        (error: unknown) => console.error(error);

    let storage: Storage | undefined;
    // Accessing `localStorage` throws in some privacy modes / sandboxed
    // iframes (alibaba/hooks#800), so the lookup itself is guarded.
    try {
      storage = getStorage();
    } catch (error) {
      onError(error);
    }

    const getStoredValue = (): T => {
      try {
        const raw = storage?.getItem(key);
        if (raw) {
          return deserializer(raw);
        }
      } catch (error) {
        onError(error);
      }
      const fallback = options.defaultValue;
      return (isFunction(fallback) ? fallback() : fallback) as T;
    };

    const [state, setState] = useState<T>(getStoredValue);
    const stateRef = useLatest(state);

    useUpdateEffect(() => {
      const nextState = getStoredValue();
      if (Object.is(nextState, stateRef.current)) {
        return;
      }
      stateRef.current = nextState;
      setState(nextState);
    }, [key]);

    const updateState = useLatestCallback((value: SetStorageState<T>) => {
      const previousState = stateRef.current;
      const currentState = (
        isFunction(value) ? (value as (prev?: T) => T)(previousState) : value
      ) as T;

      if (Object.is(currentState, previousState)) {
        return;
      }

      if (!listenStorageChange) {
        stateRef.current = currentState;
        setState(currentState);
      }

      try {
        let newValue: string | null;
        const oldValue = storage?.getItem(key) ?? null;

        // Only `undefined` removes the entry — `null` is serialised, exactly
        // as ahooks' `isUndef` does.
        if (currentState === undefined) {
          newValue = null;
          storage?.removeItem(key);
        } else {
          newValue = serializer(currentState);
          storage?.setItem(key, newValue);
        }

        dispatchEvent(
          new CustomEvent<StorageSyncDetail>(SYNC_STORAGE_EVENT_NAME, {
            detail: { key, newValue, oldValue, storageArea: storage },
          }),
        );
      } catch (error) {
        onError(error);
      }
    });

    const syncState = (event: StorageSyncDetail | StorageEvent) => {
      if (event.key !== key || event.storageArea !== storage) {
        return;
      }
      const nextState = getStoredValue();
      if (Object.is(nextState, stateRef.current)) {
        return;
      }
      stateRef.current = nextState;
      setState(nextState);
    };

    // From another document.
    useEventListener('storage', syncState, { enable: listenStorageChange });
    // From the same document but a different hook instance.
    useEventListener(
      SYNC_STORAGE_EVENT_NAME,
      (event: Event) => {
        syncState((event as CustomEvent<StorageSyncDetail>).detail);
      },
      { enable: listenStorageChange },
    );

    return [state, updateState] as const;
  }

  return useStorageState;
};

export const useLocalStorageState = createUseStorageState(() =>
  isBrowser ? localStorage : undefined,
);

export const useSessionStorageState = createUseStorageState(() =>
  isBrowser ? sessionStorage : undefined,
);
