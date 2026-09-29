/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { flattenUnsupportedSubFilter } from './FairShareStepToolbar';
import { describe, expect, it } from 'vitest';

describe('flattenUnsupportedSubFilter', () => {
  it('leaves a flat filter alone', () => {
    const flat = { name: { contains: 'a' } };
    expect(flattenUnsupportedSubFilter(flat)).toEqual(flat);
  });

  it('keeps the first leaf of an AND a pre-26.7 manager would reject', () => {
    expect(
      flattenUnsupportedSubFilter({
        AND: [{ name: { contains: 'a' } }, { isActive: true }],
      }),
    ).toEqual({ name: { contains: 'a' } });
  });

  it('handles OR and an object-shaped NOT', () => {
    expect(flattenUnsupportedSubFilter({ OR: [{ isPublic: true }] })).toEqual({
      isPublic: true,
    });
    expect(flattenUnsupportedSubFilter({ NOT: { isActive: false } })).toEqual({
      isActive: false,
    });
  });

  it('recurses through nested combinators', () => {
    expect(
      flattenUnsupportedSubFilter({
        AND: [{ OR: [{ domainName: { contains: 'x' } }] }, { isActive: true }],
      }),
    ).toEqual({ domainName: { contains: 'x' } });
  });

  it('returns undefined when nothing usable is left', () => {
    expect(flattenUnsupportedSubFilter(undefined)).toBeUndefined();
    expect(flattenUnsupportedSubFilter({ AND: [] })).toBeUndefined();
  });
});
