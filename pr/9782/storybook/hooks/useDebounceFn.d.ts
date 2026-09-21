import { DebouncedFunc } from 'lodash-es';
/**
 * Debounced wrapper around a callback.
 *
 * Ported from ahooks (alibaba/hooks, MIT) — `useDebounceFn`. ahooks delegates
 * the actual timing to `lodash/debounce`; this port delegates to `lodash-es`
 * (already a dependency of both workspaces), so leading/trailing/maxWait
 * semantics are byte-for-byte the same implementation.
 *
 * As in ahooks the options are captured on the first render — the debounced
 * instance is created once and never re-created — while the wrapped `fn` is
 * always read from the latest render.
 */
export interface DebounceOptions {
    /** Defaults to 1000ms, matching ahooks. */
    wait?: number;
    leading?: boolean;
    trailing?: boolean;
    maxWait?: number;
}
type AnyFn = (...args: any[]) => any;
declare function useDebounceFn<T extends AnyFn>(fn: T, options?: DebounceOptions): {
    run: DebouncedFunc<(...args: Parameters<T>) => ReturnType<T>>;
    cancel: () => void;
    flush: () => ReturnType<T> | undefined;
};
export default useDebounceFn;
