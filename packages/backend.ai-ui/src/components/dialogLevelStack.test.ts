/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 The stack's `inert` contract: only the top entry stays interactive, and a
 released entry leaves nothing behind on a root that outlives it.
*/
import {
  BAI_Z_INDEX,
  BAI_Z_INDEX_MODAL_LEVEL_STEP,
} from '../styles/zIndexLadder';
import {
  MAX_DIALOG_LEVEL,
  claimDialogLevel,
  releaseDialogLevel,
  type DialogLevelEntry,
} from './dialogLevelStack';
import { afterEach, describe, expect, it } from 'vitest';

const makeRoot = () => {
  const root = document.createElement('div');
  document.body.appendChild(root);
  return root;
};

// The stack is module state, so a failed assertion must not leak a claim into
// the next test — every claim goes through here and is released unconditionally.
const claimed: Array<DialogLevelEntry> = [];
const claim = (
  root: HTMLElement | null,
  requestedZIndex?: number,
  setIsTopmost: (isTopmost: boolean) => void = () => {},
) => {
  const entry = claimDialogLevel(root, setIsTopmost, requestedZIndex);
  claimed.push(entry);
  return entry;
};

afterEach(() => {
  claimed.splice(0).forEach(releaseDialogLevel);
  document.body.innerHTML = '';
});

describe('dialogLevelStack', () => {
  it('inerts every root but the top one', () => {
    const lower = makeRoot();
    const upper = makeRoot();

    claim(lower);
    expect(lower.hasAttribute('inert')).toBe(false);

    claim(upper);
    expect(lower.hasAttribute('inert')).toBe(true);
    expect(upper.hasAttribute('inert')).toBe(false);
  });

  it('un-inerts the new top when the top entry is released', () => {
    const lower = makeRoot();
    const upper = claim(makeRoot());
    claim(lower);

    releaseDialogLevel(upper);
    expect(lower.hasAttribute('inert')).toBe(false);
  });

  // A root can outlive its entry (a drawer keeps its root through the
  // slide-out), so the attribute has to go as the entry leaves.
  it('clears the inert a covered entry carried when it is released', () => {
    const lower = makeRoot();
    const lowerEntry = claim(lower);
    claim(makeRoot());
    expect(lower.hasAttribute('inert')).toBe(true);

    releaseDialogLevel(lowerEntry);
    expect(lower.hasAttribute('inert')).toBe(false);
  });

  // The focus trap gates on this flag, not on `inert`: Astryx >=0.4.4 drops
  // `inert` subtrees from its focusables, so a covered trap left active sees
  // none and swallows Tab instead of letting the top one cycle (FR-3578).
  it('tells each entry whether it is the topmost one', () => {
    const lowerFlags: Array<boolean> = [];
    const upperFlags: Array<boolean> = [];

    const lower = claim(makeRoot(), undefined, (isTopmost) =>
      lowerFlags.push(isTopmost),
    );
    // A claim starts topmost, so only flips are published — an identical
    // setState from a layout effect still costs a pre-paint render.
    expect(lower.isTopmost).toBe(true);
    expect(lowerFlags).toEqual([]);

    const upper = claim(makeRoot(), undefined, (isTopmost) =>
      upperFlags.push(isTopmost),
    );
    expect(lowerFlags).toEqual([false]);
    expect(upperFlags).toEqual([]);

    releaseDialogLevel(upper);
    expect(lowerFlags).toEqual([false, true]);
  });

  // One effective order: the entry the stack inerts must also be the one that
  // paints lower, whatever `zIndex` it asked for.
  it('resolves every claim above the current top, override or not', () => {
    const overridden = claim(makeRoot(), 10001);
    expect(overridden.zIndex).toBe(10001);

    expect(claim(makeRoot()).zIndex).toBe(10001 + BAI_Z_INDEX_MODAL_LEVEL_STEP);
  });

  it('ignores an override below the modal band base', () => {
    expect(claim(makeRoot(), 1002).zIndex).toBe(BAI_Z_INDEX.modalBase);
  });

  it('ignores an override that would reach the notice stack', () => {
    const entry = claim(makeRoot(), BAI_Z_INDEX.notification + 1);

    expect(entry.zIndex).toBe(BAI_Z_INDEX.modalBase);
  });

  // Past the ceiling the level repeats, so a release resolved by level would
  // splice — and un-inert — the wrong, still-open entry.
  it('releases by identity when two entries share the clamped level', () => {
    const roots = Array.from({ length: MAX_DIALOG_LEVEL + 2 }, makeRoot);
    const entries = roots.map((root) => claim(root));
    const [penultimate, top] = entries.slice(-2);
    expect(top.level).toBe(penultimate.level);

    releaseDialogLevel(top);
    // Resolving the release by level would splice `penultimate` instead and
    // leave the released entry on the stack — visible only once one opens above.
    claim(makeRoot());

    expect(roots.at(-1)?.hasAttribute('inert')).toBe(false);
    expect(roots.at(-2)?.hasAttribute('inert')).toBe(true);
  });
});
