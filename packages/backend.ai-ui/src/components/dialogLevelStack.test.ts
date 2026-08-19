/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 The stack's `inert` contract: only the top entry stays interactive, and a
 released entry leaves nothing behind on a root that outlives it (FR-3585).
*/
import { claimDialogLevel, releaseDialogLevel } from './dialogLevelStack';
import { afterEach, describe, expect, it } from 'vitest';

const makeRoot = () => {
  const root = document.createElement('div');
  document.body.appendChild(root);
  return root;
};

afterEach(() => {
  document.body.innerHTML = '';
});

describe('dialogLevelStack', () => {
  it('inerts every root but the top one', () => {
    const lower = makeRoot();
    const upper = makeRoot();

    const lowerLevel = claimDialogLevel(lower);
    const upperLevel = claimDialogLevel(upper);

    expect(upperLevel).toBe(lowerLevel + 1);
    expect(lower.hasAttribute('inert')).toBe(true);
    expect(upper.hasAttribute('inert')).toBe(false);

    releaseDialogLevel(upperLevel);
    releaseDialogLevel(lowerLevel);
  });

  it('un-inerts the new top when the top entry is released', () => {
    const lower = makeRoot();
    const upper = makeRoot();
    const lowerLevel = claimDialogLevel(lower);
    const upperLevel = claimDialogLevel(upper);

    releaseDialogLevel(upperLevel);

    // The released root outlives its entry (a drawer slides out), so it must
    // not be left inert either.
    expect(upper.hasAttribute('inert')).toBe(false);
    expect(lower.hasAttribute('inert')).toBe(false);

    releaseDialogLevel(lowerLevel);
  });

  it('clears the inert a covered entry carried when it is released', () => {
    const lower = makeRoot();
    const upper = makeRoot();
    const lowerLevel = claimDialogLevel(lower);
    const upperLevel = claimDialogLevel(upper);
    expect(lower.hasAttribute('inert')).toBe(true);

    releaseDialogLevel(lowerLevel);

    expect(lower.hasAttribute('inert')).toBe(false);
    expect(upper.hasAttribute('inert')).toBe(false);

    releaseDialogLevel(upperLevel);
  });
});
