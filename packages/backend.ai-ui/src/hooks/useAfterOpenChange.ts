/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useEffect, useRef } from 'react';

export interface AfterOpenChangeCallbacks {
  /** Called with the new visibility right after it changes. */
  afterOpenChange?: (open: boolean) => void;
  /** Called after the surface has closed. Drives `BAIUnmountAfterClose`. */
  afterClose?: () => void;
}

/**
 * antd fired `afterClose` when an overlay's exit transition ended. Astryx
 * surfaces have no exit transition, so the close edge of `isOpen` itself is
 * the signal: both callbacks fire from an effect on that transition, never on
 * mount or unmount. `BAIUnmountAfterClose` subscribes to exactly this.
 */
export function useAfterOpenChange(
  isOpen: boolean,
  { afterOpenChange, afterClose }: AfterOpenChangeCallbacks,
): void {
  const wasOpenRef = useRef(isOpen);
  useEffect(() => {
    if (wasOpenRef.current === isOpen) return;
    wasOpenRef.current = isOpen;
    afterOpenChange?.(isOpen);
    if (!isOpen) afterClose?.();
    // The callbacks are read on the transition only, as `BAIModal` does.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);
}
