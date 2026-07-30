/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * Tests for narrowAndPageScopes().
 *
 * Coverage:
 * - Only rows of the requested scope type survive, order preserved
 * - `scopeCount` is the requested type's row count, not the input's
 * - Interleaved scope types page correctly (the input is not pre-grouped)
 * - Last partial page returns the remainder
 * - Offset past the end returns no rows but keeps the real count
 * - No row of the requested type → empty rows, zero count
 */
import { narrowAndPageScopes } from './rbacScopePaging';

const scope = (scopeType: string, scopeId: string) => ({ scopeType, scopeId });

describe('narrowAndPageScopes', () => {
  it('keeps only the requested scope type, in input order', () => {
    const scopes = [
      scope('PROJECT', 'p1'),
      scope('DOMAIN', 'd1'),
      scope('PROJECT', 'p2'),
    ];
    const { scopeRows } = narrowAndPageScopes(scopes, 'PROJECT', {
      offset: 0,
      limit: 10,
    });
    expect(scopeRows.map((row) => row.scopeId)).toEqual(['p1', 'p2']);
  });

  it('counts the requested type, not the whole input', () => {
    const scopes = [
      scope('PROJECT', 'p1'),
      scope('DOMAIN', 'd1'),
      scope('DOMAIN', 'd2'),
      scope('USER', 'u1'),
    ];
    // The server's `count` would report 4 here; the pagination total must be 2.
    expect(
      narrowAndPageScopes(scopes, 'DOMAIN', { offset: 0, limit: 10 }),
    ).toEqual({
      scopeRows: [scope('DOMAIN', 'd1'), scope('DOMAIN', 'd2')],
      scopeCount: 2,
    });
  });

  it('pages a type whose rows are interleaved with other types', () => {
    // Paging must apply after narrowing — slicing the raw input would leak
    // other types' rows into the page window.
    const scopes = [
      scope('DOMAIN', 'd1'),
      scope('PROJECT', 'p1'),
      scope('DOMAIN', 'd2'),
      scope('PROJECT', 'p2'),
      scope('DOMAIN', 'd3'),
      scope('PROJECT', 'p3'),
    ];
    const { scopeRows, scopeCount } = narrowAndPageScopes(scopes, 'PROJECT', {
      offset: 1,
      limit: 2,
    });
    expect(scopeRows.map((row) => row.scopeId)).toEqual(['p2', 'p3']);
    expect(scopeCount).toBe(3);
  });

  it('returns the remainder on the last partial page', () => {
    const scopes = ['a', 'b', 'c', 'd', 'e'].map((id) => scope('USER', id));
    const { scopeRows, scopeCount } = narrowAndPageScopes(scopes, 'USER', {
      offset: 4,
      limit: 2,
    });
    expect(scopeRows.map((row) => row.scopeId)).toEqual(['e']);
    expect(scopeCount).toBe(5);
  });

  it('returns no rows when the offset is past the end, keeping the count', () => {
    const scopes = [scope('USER', 'u1'), scope('USER', 'u2')];
    expect(
      narrowAndPageScopes(scopes, 'USER', { offset: 20, limit: 10 }),
    ).toEqual({ scopeRows: [], scopeCount: 2 });
  });

  it('returns empty rows and a zero count when no row matches', () => {
    const scopes = [scope('DOMAIN', 'd1'), scope('USER', 'u1')];
    expect(
      narrowAndPageScopes(scopes, 'PROJECT', { offset: 0, limit: 10 }),
    ).toEqual({ scopeRows: [], scopeCount: 0 });
  });
});
