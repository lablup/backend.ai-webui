import { useLatest } from './internal/useLatest';
import { throttle } from 'lodash-es';
import { useEffect, useState } from 'react';

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

// The return type is inferred rather than annotated: `DebouncedFuncLeading`
// lives in `@types/lodash`, which is not a dependency of this package
// (`@types/lodash-es` only re-exports `DebouncedFunc`).
function useThrottleFn<T extends AnyFn>(fn: T, options?: ThrottleOptions) {
  const fnRef = useLatest(fn);
  const wait = options?.wait ?? 1000;

  // eslint-disable-next-line react-hooks/refs -- `fnRef` is only dereferenced when the wrapper actually fires, never during render.
  const [throttled] = useState(() =>
    throttle(
      (...args: Parameters<T>): ReturnType<T> => fnRef.current(...args),
      wait,
      options,
    ),
  );

  useEffect(() => {
    return () => {
      throttled.cancel();
    };
  }, [throttled]);

  return {
    run: throttled,
    cancel: throttled.cancel,
    flush: throttled.flush,
  };
}

export default useThrottleFn;
