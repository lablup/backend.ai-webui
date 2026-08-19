/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 The stack's `inert` contract: only the top entry stays interactive, and a
 released entry leaves nothing behind on a root that outlives it (FR-3585).
*/
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
const claim = (root: HTMLElement | null) => {
  const entry = claimDialogLevel(root);
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

    const lowerEntry = claim(lower);
    const upperEntry = claim(upper);

    expect(upperEntry.level).toBe(lowerEntry.level + 1);
    expect(lower.hasAttribute('inert')).toBe(true);
    expect(upper.hasAttribute('inert')).toBe(false);
  });

  it('un-inerts the new top when the top entry is released', () => {
    const lower = makeRoot();
    const upper = makeRoot();
    claim(lower);
    const upperEntry = claim(upper);

    releaseDialogLevel(upperEntry);

    // The released root outlives its entry (a drawer slides out), so it must
    // not be left inert either.
    expect(upper.hasAttribute('inert')).toBe(false);
    expect(lower.hasAttribute('inert')).toBe(false);
  });

  it('clears the inert a covered entry carried when it is released', () => {
    const lower = makeRoot();
    const upper = makeRoot();
    const lowerEntry = claim(lower);
    claim(upper);
    expect(lower.hasAttribute('inert')).toBe(true);

    releaseDialogLevel(lowerEntry);

    expect(lower.hasAttribute('inert')).toBe(false);
    expect(upper.hasAttribute('inert')).toBe(false);
  });

  // Past the ceiling the level repeats, so a release resolved by level would
  // splice — and un-inert — the wrong, still-open entry.
  it('releases by identity when two entries share the clamped level', () => {
    const roots = Array.from({ length: MAX_DIALOG_LEVEL + 2 }, makeRoot);
    const entries = roots.map(claim);
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
