/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 The one level stack every portalled modal surface shares — `BAIDialog` here
 and `BAIDrawerPortal` in `react/` (FR-3585). One stack is what lets a modal
 opened from inside a drawer paint above it and inert it, the semantics
 `showModal()` chronology used to give before either left the top layer.
*/
import { BAI_Z_INDEX } from '../styles/zIndexLadder';
import { devWarn } from '@astryxdesign/core/utils';
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

/**
 * The `zIndex` escape hatch is reachable from every `<BAIModal>`, and a number
 * below the band is always stale — degrade to "on top" rather than invisible.
 */
export function floorToModalBand(
  zIndex: number,
  componentName = 'BAIDialog',
): number {
  if (zIndex >= BAI_Z_INDEX.modalBase) {
    return zIndex;
  }
  devWarn(
    componentName,
    `zIndex ${zIndex} is below the modal band base ` +
      `(${BAI_Z_INDEX.modalBase}); clamping. Pass a layer from ` +
      '`BAI_Z_INDEX` rather than a literal, or drop the prop.',
  );
  return BAI_Z_INDEX.modalBase;
}

/** The claim's handle. Released by reference, never by `level` — the clamp at
    `MAX_DIALOG_LEVEL` lets two entries share one. */
export interface DialogLevelEntry {
  level: number;
  root: HTMLElement | null;
  setIsTopmost: (isTopmost: boolean) => void;
}

// Module-level: inside `'use memo'` the compiler rewrites a read-then-increment.
const openDialogs: Array<DialogLevelEntry> = [];

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
): DialogLevelEntry {
  const level = Math.min(
    (openDialogs.at(-1)?.level ?? -1) + 1,
    MAX_DIALOG_LEVEL,
  );
  const entry: DialogLevelEntry = { level, root, setIsTopmost };
  openDialogs.push(entry);
  syncCoveredDialogs();
  return entry;
}

export function releaseDialogLevel(entry: DialogLevelEntry): void {
  const index = openDialogs.indexOf(entry);
  if (index !== -1) {
    // A root can outlive its stack entry, so the entry sheds `inert` as it is
    // removed rather than leaving it for the root's next open.
    entry.root?.removeAttribute('inert');
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
  'use memo';
  const [isTopmost, setIsTopmost] = useState(true);

  useLayoutEffect(() => {
    if (!isOpen) {
      return;
    }
    const root = rootRef.current;
    const entry = claimDialogLevel(root, setIsTopmost);
    root?.style.setProperty(cssVar, String(entry.level));
    return () => {
      releaseDialogLevel(entry);
      // Cleared, or a root reopened at a lower level keeps the stale one.
      root?.style.removeProperty(cssVar);
    };
  }, [isOpen, rootRef, cssVar]);

  return isTopmost;
}
