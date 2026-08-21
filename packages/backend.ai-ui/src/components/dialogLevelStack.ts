/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 The one level stack every portalled modal surface shares. One stack is what
 lets a surface opened from inside another paint above it and inert it.
*/
import {
  BAI_Z_INDEX,
  BAI_Z_INDEX_MODAL_LEVEL_STEP as Z_STEP,
} from '../styles/zIndexLadder';
import { devWarn } from '@astryxdesign/core/utils';
import {
  useEffectEvent,
  useLayoutEffect,
  useState,
  type RefObject,
} from 'react';

/**
 * Marks an open portal modal root. Consumers scope document queries to it —
 * import it rather than retyping the string; a rename fails silently.
 */
export const BAI_MODAL_OPEN_ATTRIBUTE = 'data-bai-modal-open';

// Nesting depth only — `MAX_DIALOG_Z_INDEX` is what keeps the band under the
// notice stack. The ceiling caps the number two entries may share.
// `zIndexLadder.test.ts` pins THIS number, not a copy.
export const MAX_DIALOG_LEVEL = 80;

/** The nesting depth, and where the root actually paints. */
const LEVEL_CSS_VAR = '--bai-dialog-level';
const Z_INDEX_CSS_VAR = '--bai-dialog-z';

/** The notice stack owns everything from `notification` up — the inversion
    FR-3578 exists to prevent. */
const MAX_DIALOG_Z_INDEX = BAI_Z_INDEX.notification - 1;

/** The claim's handle. Released by reference, never by `level` — the clamp at
    `MAX_DIALOG_LEVEL` lets two entries share one. */
export interface DialogLevelEntry {
  level: number;
  /** The stack, not the caller, is the authority on where the root paints. */
  zIndex: number;
  isTopmost: boolean;
  root: HTMLElement | null;
  setIsTopmost: (isTopmost: boolean) => void;
}

// Module-level: inside `'use memo'` the compiler rewrites a read-then-increment.
const openDialogs: Array<DialogLevelEntry> = [];

/**
 * One step above `topmost` (or the band's base), raised by an accepted
 * override. Stacking and `syncCoveredDialogs`' inertness therefore run on ONE
 * order: a dialog opened later paints above an earlier one whatever override
 * that one carried.
 */
function resolveDialogZIndex(
  topmost: DialogLevelEntry | undefined,
  requestedZIndex?: number,
): number {
  // The `zIndex` escape hatch is reachable from every `<BAIModal>`. Both
  // rejections keep the step, so the resolved value stays strictly increasing.
  let override = requestedZIndex;
  const rejectOverride = (reason: string) => {
    devWarn(
      'BAIDialog',
      `zIndex ${override} ${reason}; ignoring it. Pass a layer from ` +
        '`BAI_Z_INDEX` rather than a literal, or drop the prop.',
    );
    override = undefined;
  };
  if (override != null && override < BAI_Z_INDEX.modalBase) {
    rejectOverride(`is below the modal band base (${BAI_Z_INDEX.modalBase})`);
  } else if (override != null && override > MAX_DIALOG_Z_INDEX) {
    rejectOverride(
      `would reach the notice stack (${BAI_Z_INDEX.notification})`,
    );
  }

  const floor = topmost?.zIndex ?? BAI_Z_INDEX.modalBase - Z_STEP;
  return Math.min(Math.max(floor + Z_STEP, override ?? 0), MAX_DIALOG_Z_INDEX);
}

/**
 * Only the topmost portal stays interactive. A covered surface must both drop
 * its focus trap and go `inert`: the trap alone lets Tab escape to the parent's
 * last button, and `inert` alone freezes Tab entirely — Astryx >=0.4.4 excludes
 * `inert` subtrees when collecting focusables, so the covered trap sees none
 * and swallows the key rather than letting the topmost trap cycle.
 */
function syncCoveredDialogs(): void {
  openDialogs.forEach((entry, index) => {
    const isTopmost = index === openDialogs.length - 1;
    entry.root?.toggleAttribute('inert', !isTopmost);
    // Only on a flip: dispatched from a layout effect, an identical setState
    // still forces a synchronous pre-paint render of a dirty modal subtree.
    if (entry.isTopmost !== isTopmost) {
      entry.isTopmost = isTopmost;
      entry.setIsTopmost(isTopmost);
    }
  });
}

export function claimDialogLevel(
  root: HTMLElement | null,
  setIsTopmost: (isTopmost: boolean) => void,
  requestedZIndex?: number,
): DialogLevelEntry {
  const topmost = openDialogs.at(-1);
  const entry: DialogLevelEntry = {
    level: Math.min((topmost?.level ?? -1) + 1, MAX_DIALOG_LEVEL),
    zIndex: resolveDialogZIndex(topmost, requestedZIndex),
    isTopmost: true,
    root,
    setIsTopmost,
  };
  openDialogs.push(entry);
  syncCoveredDialogs();
  return entry;
}

export function releaseDialogLevel(entry: DialogLevelEntry): void {
  const index = openDialogs.indexOf(entry);
  if (index === -1) {
    return;
  }
  // A root can outlive its stack entry, so the entry sheds `inert` as it is
  // removed rather than leaving it for the root's next open.
  entry.root?.removeAttribute('inert');
  openDialogs.splice(index, 1);
  syncCoveredDialogs();
}

/**
 * Claims a level for `rootRef` while `isOpen`, publishing that level and the
 * z-index it resolved to on the root's inline style. Written to the DOM rather
 * than to state: the values must be right at first paint, and they are
 * properties React never manages.
 *
 * Returns whether this surface is the topmost one, which its focus trap has to
 * gate on — see `syncCoveredDialogs`.
 */
export function useDialogLevel(
  rootRef: RefObject<HTMLElement | null>,
  isOpen: boolean,
  zIndex?: number,
): boolean {
  'use memo';
  const [isTopmost, setIsTopmost] = useState(true);
  // Read at claim time only: re-claiming would move an already-open dialog to
  // the top of the shared stack and inert whatever legitimately covered it.
  const readZIndex = useEffectEvent(() => zIndex);

  useLayoutEffect(() => {
    if (!isOpen) {
      return;
    }
    const root = rootRef.current;
    const entry = claimDialogLevel(root, setIsTopmost, readZIndex());
    root?.style.setProperty(LEVEL_CSS_VAR, String(entry.level));
    root?.style.setProperty(Z_INDEX_CSS_VAR, String(entry.zIndex));
    return () => {
      releaseDialogLevel(entry);
      // Cleared, or a root reopened lower down keeps the stale values.
      root?.style.removeProperty(LEVEL_CSS_VAR);
      root?.style.removeProperty(Z_INDEX_CSS_VAR);
    };
  }, [isOpen, rootRef]);

  return isTopmost;
}
