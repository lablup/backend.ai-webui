/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { selectDisabled, selectLimits, selectRemaining } from './selectors';
import { describe, expect, it } from 'vitest';

describe('selectors (stubs)', () => {
  it('selectLimits returns no limits yet', () => {
    expect(selectLimits({}, {})).toEqual({});
  });
  it('selectRemaining returns no remaining amounts yet', () => {
    expect(selectRemaining({}, {})).toEqual({});
  });
  it('selectDisabled disables nothing yet', () => {
    expect(selectDisabled({}, {})).toEqual({});
  });
});
