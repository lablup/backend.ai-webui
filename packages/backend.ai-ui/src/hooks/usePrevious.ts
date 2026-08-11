import { useRef } from 'react';

/**
 * Returns the value from the previous "accepted" render.
 *
 * Ported from ahooks (alibaba/hooks, MIT) — `usePrevious`. The refs are
 * updated during render on purpose: the previous value has to be readable in
 * the very render that observes the change, which an effect-based update
 * would be one commit too late for.
 */
export type ShouldUpdateFunc<T> = (prev?: T, next?: T) => boolean;

const defaultShouldUpdate = <T>(a?: T, b?: T) => !Object.is(a, b);

function usePrevious<T>(
  state: T,
  shouldUpdate: ShouldUpdateFunc<T> = defaultShouldUpdate,
): T | undefined {
  const prevRef = useRef<T | undefined>(undefined);
  const curRef = useRef<T | undefined>(undefined);

  /* eslint-disable react-hooks/refs -- Render-time ref bookkeeping IS this
     hook: the previous value must be readable in the same render that observes
     the change. An effect-based version would always be one commit stale. */
  if (shouldUpdate(curRef.current, state)) {
    prevRef.current = curRef.current;
    curRef.current = state;
  }

  return prevRef.current;
  /* eslint-enable react-hooks/refs */
}

export default usePrevious;
