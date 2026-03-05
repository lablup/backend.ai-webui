/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { checkBlocklistValidity } from '../configRules';
import { describe, expect, it } from '@jest/globals';

const validMenuKeys = [
  'start',
  'dashboard',
  'session',
  'serving',
  'model-store',
  'data',
  'my-environment',
  'agent-summary',
  'statistics',
  'credential',
  'environment',
  'maintenance',
  'information',
];

describe('checkBlocklistValidity', () => {
  it('should return null when blocklist is empty', () => {
    expect(checkBlocklistValidity([], validMenuKeys)).toBeNull();
  });

  it('should return null when all entries are valid', () => {
    expect(
      checkBlocklistValidity(['session', 'serving'], validMenuKeys),
    ).toBeNull();
  });

  it('should return warning when blocklist has invalid entries', () => {
    const result = checkBlocklistValidity(
      ['session', 'nonexistent-menu', 'another-bad'],
      validMenuKeys,
    );
    expect(result).not.toBeNull();
    expect(result?.severity).toBe('warning');
    expect(result?.id).toBe('config-invalid-blocklist');
    expect(result?.interpolationValues?.entries).toBe(
      'nonexistent-menu, another-bad',
    );
    expect(result?.interpolationValues?.count).toBe('2');
  });

  it('should return null when blocklist is undefined-like', () => {
    expect(
      checkBlocklistValidity(undefined as unknown as string[], validMenuKeys),
    ).toBeNull();
  });
});
