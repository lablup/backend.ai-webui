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
export declare function useLatest<T>(value: T): import('../../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react').RefObject<T>;
/**
 * A callback with a permanently stable identity whose body always runs the
 * implementation from the latest render.
 *
 * Equivalent to ahooks' `useMemoizedFn` (MIT), which the ported hooks rely on
 * for their "the setter never changes identity" contract. Application code
 * must **not** use this — see `.claude/rules/use-effect-event.md`; use
 * `useEffectEvent` (effect-internal) or a plain function under `'use memo'`.
 */
export declare function useLatestCallback<Args extends unknown[], Return>(fn: (...args: Args) => Return): (...args: Args) => Return;
