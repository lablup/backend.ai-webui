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
export declare const SYNC_STORAGE_EVENT_NAME = "BAI_SYNC_STORAGE_EVENT_NAME";
export type SetStorageState<S> = S | ((prevState?: S) => S);
export interface UseStorageStateOptions<T> {
    defaultValue?: T | (() => T);
    listenStorageChange?: boolean;
    serializer?: (value: T) => string;
    deserializer?: (value: string) => T;
    onError?: (error: unknown) => void;
}
export declare const createUseStorageState: (getStorage: () => Storage | undefined) => <T>(key: string, options?: UseStorageStateOptions<T>) => readonly [T, (value: SetStorageState<T>) => void];
export declare const useLocalStorageState: <T>(key: string, options?: UseStorageStateOptions<T>) => readonly [T, (value: SetStorageState<T>) => void];
export declare const useSessionStorageState: <T>(key: string, options?: UseStorageStateOptions<T>) => readonly [T, (value: SetStorageState<T>) => void];
