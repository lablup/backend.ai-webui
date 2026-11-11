/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useEffect, useEffectEvent } from 'react';

/**
 * Runs `reset` when the component unmounts because the page path changed,
 * not when a suspending query remounts it on the same path.
 */
export const useResetOnLeavingPath = (reset: () => void) => {
  const onLeave = useEffectEvent(reset);
  useEffect(() => {
    const mountedPath = window.location.pathname;
    return () => {
      if (window.location.pathname !== mountedPath) onLeave();
    };
  }, []);
};
