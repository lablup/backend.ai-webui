import { BasicTarget } from './internal/domTarget';
/**
 * Tracks whether the pointer is over `target`.
 *
 * Ported from ahooks (alibaba/hooks, MIT) — `useHover`. Uses `mouseenter` /
 * `mouseleave` (non-bubbling), so nested children do not flip the state.
 */
export interface UseHoverOptions {
    onEnter?: () => void;
    onLeave?: () => void;
    onChange?: (isHovering: boolean) => void;
}
declare const useHover: (target: BasicTarget, options?: UseHoverOptions) => boolean;
export default useHover;
