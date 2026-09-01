/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * Tests for computeRBACGrantState().
 *
 * Coverage:
 * - Fully granted (every matrix operation, incl. GRANT_* delegates) → 'full'
 * - Some but not all matrix operations granted → 'partial'
 * - No matrix operations granted → 'none'
 * - Empty matrix operation set → 'none'
 * - Duplicate matrix operations are de-duplicated before comparison
 * - Stale grants (granted op absent from the matrix) do not force 'partial'
 */
import { computeRBACGrantState } from './rbacGrantState';

describe('computeRBACGrantState', () => {
  it('returns "full" when every matrix operation is granted', () => {
    const full = ['CREATE', 'READ', 'UPDATE', 'GRANT_ALL'];
    const granted = new Set(full);
    expect(computeRBACGrantState(full, granted)).toBe('full');
  });

  it('requires GRANT_* delegate operations to be granted for "full"', () => {
    const full = ['READ', 'GRANT_READ'];
    const granted = new Set(['READ']);
    // Missing the delegate operation → not fully allowed.
    expect(computeRBACGrantState(full, granted)).toBe('partial');
  });

  it('returns "partial" when some but not all operations are granted', () => {
    const full = ['CREATE', 'READ', 'UPDATE'];
    const granted = new Set(['READ']);
    expect(computeRBACGrantState(full, granted)).toBe('partial');
  });

  it('returns "none" when no matrix operations are granted', () => {
    const full = ['CREATE', 'READ'];
    const granted = new Set<string>();
    expect(computeRBACGrantState(full, granted)).toBe('none');
  });

  it('returns "none" when the matrix defines no operations', () => {
    expect(computeRBACGrantState([], new Set(['READ']))).toBe('none');
  });

  it('de-duplicates matrix operations before comparing', () => {
    // Two matrix actions can share the same requiredPermission.
    const full = ['READ', 'READ', 'CREATE'];
    const granted = new Set(['READ', 'CREATE']);
    expect(computeRBACGrantState(full, granted)).toBe('full');
  });

  it('ignores granted operations absent from the matrix', () => {
    const full = ['READ'];
    // Role grants a stale op no longer in the matrix, plus the matrix op.
    const granted = new Set(['READ', 'LEGACY_OP']);
    expect(computeRBACGrantState(full, granted)).toBe('full');
  });

  it('treats a stale-only grant as "none"', () => {
    const full = ['READ', 'CREATE'];
    const granted = new Set(['LEGACY_OP']);
    expect(computeRBACGrantState(full, granted)).toBe('none');
  });
});
