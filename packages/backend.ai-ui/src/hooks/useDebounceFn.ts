import { useLatest } from './internal/useLatest';
import { debounce, type DebouncedFunc } from 'lodash-es';
import { useEffect, useState } from 'react';

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

function useDebounceFn<T extends AnyFn>(
  fn: T,
  options?: DebounceOptions,
): {
  run: DebouncedFunc<(...args: Parameters<T>) => ReturnType<T>>;
  cancel: () => void;
  flush: () => ReturnType<T> | undefined;
} {
  const fnRef = useLatest(fn);
  const wait = options?.wait ?? 1000;

  // eslint-disable-next-line react-hooks/refs -- `fnRef` is only dereferenced when the wrapper actually fires, never during render.
  const [debounced] = useState(() =>
    debounce(
      (...args: Parameters<T>): ReturnType<T> => fnRef.current(...args),
      wait,
      options,
    ),
  );

  useEffect(() => {
    return () => {
      debounced.cancel();
    };
  }, [debounced]);

  return {
    run: debounced,
    cancel: debounced.cancel,
    flush: debounced.flush,
  };
}

export default useDebounceFn;
