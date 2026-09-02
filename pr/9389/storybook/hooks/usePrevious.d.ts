/**
 * Returns the value from the previous "accepted" render.
 *
 * Ported from ahooks (alibaba/hooks, MIT) — `usePrevious`. The refs are
 * updated during render on purpose: the previous value has to be readable in
 * the very render that observes the change, which an effect-based update
 * would be one commit too late for.
 */
export type ShouldUpdateFunc<T> = (prev?: T, next?: T) => boolean;
declare function usePrevious<T>(state: T, shouldUpdate?: ShouldUpdateFunc<T>): T | undefined;
export default usePrevious;
