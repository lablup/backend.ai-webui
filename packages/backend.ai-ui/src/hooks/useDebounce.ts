import useDebounceFn, { type DebounceOptions } from './useDebounceFn';
import { useEffect, useState } from 'react';

/**
 * Debounced mirror of a value.
 *
 * Ported from ahooks (alibaba/hooks, MIT) — `useDebounce`. The initial value
 * is adopted synchronously; every later change schedules a trailing (and, with
 * `leading: true`, an immediate) update through `useDebounceFn`.
 */
function useDebounce<T>(value: T, options?: DebounceOptions): T {
  const [debounced, setDebounced] = useState(value);

  const { run } = useDebounceFn(() => {
    setDebounced(value);
  }, options);

  useEffect(() => {
    run();
  }, [run, value]);

  return debounced;
}

export default useDebounce;
export type { DebounceOptions };
