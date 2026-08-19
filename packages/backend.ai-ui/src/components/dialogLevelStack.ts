/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 The one level stack every portalled modal surface shares — `BAIDialogPortal`
 here and `BAIDrawerPortal` in `react/` (FR-3585). One stack is what lets a
 modal opened from inside a drawer paint above it and inert it, the semantics
 `showModal()` chronology used to give before either left the top layer.
*/
import { BAI_Z_INDEX } from '../styles/zIndexLadder';
import { devWarn } from '@astryxdesign/core/utils';

/**
 * Marks an open portal modal root. Consumers scope document queries to it —
 * import it rather than retyping the string; a rename fails silently.
 */
export const BAI_MODAL_OPEN_ATTRIBUTE = 'data-bai-modal-open';

// The CSS climbs one ladder step per nesting level; past this ceiling a modal
// would reach the notice stack, the inversion FR-3578 exists to prevent.
// Exported so `zIndexLadder.test.ts` pins THIS number under it, not a copy.
export const MAX_DIALOG_LEVEL = 80;

/**
 * The `zIndex` escape hatch is reachable from every `<BAIModal>`, and a number
 * below the band is always stale — degrade to "on top" rather than invisible.
 */
export function floorToModalBand(zIndex: number): number {
  if (zIndex >= BAI_Z_INDEX.modalBase) {
    return zIndex;
  }
  devWarn(
    'BAIDialogPortal',
    `zIndex ${zIndex} is below the modal band base ` +
      `(${BAI_Z_INDEX.modalBase}); clamping. Pass a layer from ` +
      '`BAI_Z_INDEX` rather than a literal, or drop the prop.',
  );
  return BAI_Z_INDEX.modalBase;
}

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
export function syncCoveredDialogs(): void {
  openDialogs.forEach(({ root, setIsTopmost }, index) => {
    const isTopmost = index === openDialogs.length - 1;
    setIsTopmost(isTopmost);
    root?.toggleAttribute('inert', !isTopmost);
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
    // A drawer root outlives its level by one slide-out, so a covered entry
    // has to shed `inert` on the way out rather than on the next open.
    openDialogs[index].root?.removeAttribute('inert');
    openDialogs.splice(index, 1);
  }
  syncCoveredDialogs();
}
