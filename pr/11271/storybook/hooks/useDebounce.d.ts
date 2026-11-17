import { DebounceOptions } from './useDebounceFn';
/**
 * Debounced mirror of a value.
 *
 * Ported from ahooks (alibaba/hooks, MIT) — `useDebounce`. The initial value
 * is adopted synchronously; every later change schedules a trailing (and, with
 * `leading: true`, an immediate) update through `useDebounceFn`.
 */
declare function useDebounce<T>(value: T, options?: DebounceOptions): T;
export default useDebounce;
export type { DebounceOptions };
