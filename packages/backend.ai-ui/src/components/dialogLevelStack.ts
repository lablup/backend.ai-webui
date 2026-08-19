/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 The one level stack every portalled modal surface shares — `BAIDialogPortal`
 here and `BAIDrawerPortal` in `react/` (FR-3585). One stack is what lets a
 modal opened from inside a drawer paint above it and inert it, the semantics
 `showModal()` chronology used to give before either left the top layer.
*/
import { useLayoutEffect, useState, type RefObject } from 'react';

/**
 * Marks an open portal modal root. Consumers scope document queries to it —
 * import it rather than retyping the string; a rename fails silently.
 */
export const BAI_MODAL_OPEN_ATTRIBUTE = 'data-bai-modal-open';

// The CSS climbs one ladder step per nesting level; past this ceiling a modal
// would reach the notice stack, the inversion FR-3578 exists to prevent.
// `zIndexLadder.test.ts` pins THIS number, not a copy.
export const MAX_DIALOG_LEVEL = 80;

// Module-level: inside `'use memo'` the compiler rewrites a read-then-increment.
const openDialogs: Array<{
  level: number;
  root: HTMLElement | null;
  setIsTopmost: (isTopmost: boolean) => void;
}> = [];

/**
 * Only the topmost portal stays interactive. A covered surface must both drop
 * its focus trap and go `inert`: the trap alone lets Tab escape to the parent's
 * last button, and `inert` alone freezes Tab entirely — Astryx >=0.4.4 excludes
 * `inert` subtrees when collecting focusables, so the covered trap sees none
 * and swallows the key rather than letting the topmost trap cycle.
 */
function syncCoveredDialogs(): void {
  openDialogs.forEach(({ root, setIsTopmost }, index) => {
    const shouldBeInert = index !== openDialogs.length - 1;
    setIsTopmost(!shouldBeInert);
    if (root && shouldBeInert !== root.hasAttribute('inert')) {
      root.toggleAttribute('inert', shouldBeInert);
    }
  });
}

export function claimDialogLevel(
  root: HTMLElement | null,
  setIsTopmost: (isTopmost: boolean) => void,
): number {
  const level = Math.min(
    (openDialogs.at(-1)?.level ?? -1) + 1,
    MAX_DIALOG_LEVEL,
  );
  openDialogs.push({ level, root, setIsTopmost });
  syncCoveredDialogs();
  return level;
}

export function releaseDialogLevel(level: number): void {
  const index = openDialogs.findIndex((entry) => entry.level === level);
  if (index !== -1) {
    // A root can outlive its stack entry, so the entry sheds `inert` as it is
    // removed rather than leaving it for the root's next open.
    openDialogs[index].root?.removeAttribute('inert');
    openDialogs.splice(index, 1);
  }
  syncCoveredDialogs();
}

/**
 * Claims a level for `rootRef` while `isOpen`, publishing it as `cssVar` on
 * the root's inline style. Written to the DOM rather than to state: the value
 * must be right at first paint, and it is a property React never manages.
 *
 * Returns whether this surface is the topmost one, which its focus trap has to
 * gate on — see `syncCoveredDialogs`.
 */
export function useDialogLevel(
  rootRef: RefObject<HTMLElement | null>,
  isOpen: boolean,
  cssVar: string,
): boolean {
  const [isTopmost, setIsTopmost] = useState(true);

  useLayoutEffect(() => {
    if (!isOpen) {
      return;
    }
    const root = rootRef.current;
    const level = claimDialogLevel(root, setIsTopmost);
    root?.style.setProperty(cssVar, String(level));
    return () => {
      releaseDialogLevel(level);
      // Cleared, or a root reopened at a lower level keeps the stale one.
      root?.style.removeProperty(cssVar);
    };
  }, [isOpen, rootRef, cssVar]);

  return isTopmost;
}
