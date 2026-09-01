import { useRef, useState } from 'react';

/**
 * Keeps a ref pointing at the value from the **current** render.
 *
 * Ported from ahooks (alibaba/hooks, MIT) — `useLatest`. The assignment
 * happens during render on purpose: consumers below in the tree may read the
 * ref from their own layout effects, which run *before* this component's
 * layout effect would have had a chance to update it.
 *
 * This is the one difference from BUI's `useEventNotStable`, which refreshes
 * its ref in a layout effect. Prefer `useEventNotStable` in application code;
 * this util exists so the ported hooks keep ahooks' exact timing.
 */
export function useLatest<T>(value: T) {
  const ref = useRef(value);
  // eslint-disable-next-line react-hooks/refs -- see the doc comment: ahooks' `useLatest` contract is a render-time refresh. Nothing reads this during render; it exists so callbacks invoked later see the newest value.
  ref.current = value;
  return ref;
}

/**
 * A callback with a permanently stable identity whose body always runs the
 * implementation from the latest render.
 *
 * Equivalent to ahooks' `useMemoizedFn` (MIT), which the ported hooks rely on
 * for their "the setter never changes identity" contract. Application code
 * must **not** use this — see `.claude/rules/use-effect-event.md`; use
 * `useEffectEvent` (effect-internal) or a plain function under `'use memo'`.
 */
export function useLatestCallback<Args extends unknown[], Return>(
  fn: (...args: Args) => Return,
) {
  const fnRef = useLatest(fn);
  const [stableFn] = useState(
    () =>
      (...args: Args): Return =>
        fnRef.current(...args),
  );
  return stableFn;
}
