/**
 * Throttled wrapper around a callback.
 *
 * Ported from ahooks (alibaba/hooks, MIT) — `useThrottleFn`, which delegates
 * to `lodash/throttle`. This port delegates to `lodash-es` (already a
 * dependency), so leading/trailing semantics are identical.
 */
export interface ThrottleOptions {
    /** Defaults to 1000ms, matching ahooks. */
    wait?: number;
    leading?: boolean;
    trailing?: boolean;
}
type AnyFn = (...args: any[]) => any;
declare function useThrottleFn<T extends AnyFn>(fn: T, options?: ThrottleOptions): {
    run: import('lodash').DebouncedFuncLeading<(...args: Parameters<T>) => ReturnType<T>>;
    cancel: () => void;
    flush: () => ReturnType<T>;
};
export default useThrottleFn;
