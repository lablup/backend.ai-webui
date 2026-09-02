import type { BasicTarget } from './internal/domTarget';
import useEventListener from './useEventListener';
import { useState } from 'react';

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

const useHover = (target: BasicTarget, options?: UseHoverOptions): boolean => {
  'use memo';
  const { onEnter, onLeave, onChange } = options || {};
  const [isHovering, setIsHovering] = useState(false);

  useEventListener(
    'mouseenter',
    () => {
      onEnter?.();
      setIsHovering(true);
      onChange?.(true);
    },
    { target },
  );

  useEventListener(
    'mouseleave',
    () => {
      onLeave?.();
      setIsHovering(false);
      onChange?.(false);
    },
    { target },
  );

  return isHovering;
};

export default useHover;
