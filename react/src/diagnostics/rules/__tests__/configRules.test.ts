/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { checkBlocklistValidity, checkSslMismatch } from '../configRules';
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

describe('checkSslMismatch', () => {
  it('should return null when inputs are empty', () => {
    expect(checkSslMismatch('', 'http://proxy.example.com')).toBeNull();
    expect(checkSslMismatch('https://api.example.com', '')).toBeNull();
  });

  it('should return null when both use HTTPS', () => {
    expect(
      checkSslMismatch('https://api.example.com', 'https://proxy.example.com'),
    ).toBeNull();
  });

  it('should return null when both use HTTP', () => {
    expect(
      checkSslMismatch('http://api.example.com', 'http://proxy.example.com'),
    ).toBeNull();
  });

  it('should return warning when API is HTTPS but proxy is HTTP', () => {
    const result = checkSslMismatch(
      'https://api.example.com',
      'http://proxy.example.com',
    );
    expect(result).not.toBeNull();
    expect(result?.severity).toBe('warning');
    expect(result?.category).toBe('config');
    expect(result?.id).toBe('ssl-mismatch');
  });

  it('should return warning when API is HTTP but proxy is HTTPS', () => {
    const result = checkSslMismatch(
      'http://api.example.com',
      'https://proxy.example.com',
    );
    expect(result).not.toBeNull();
    expect(result?.severity).toBe('warning');
  });

  it('should return null for invalid URLs', () => {
    expect(
      checkSslMismatch('not-a-url', 'https://proxy.example.com'),
    ).toBeNull();
    expect(checkSslMismatch('https://api.example.com', 'not-a-url')).toBeNull();
  });
});

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
    expect(result?.category).toBe('config');
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
