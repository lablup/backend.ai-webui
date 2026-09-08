/**
 * FR-3865: the app launcher's "Allowed client IPs" field used to accept any
 * string and forward it verbatim as the `allowed_client_ips` proxy parameter.
 */
import { normalizeAllowedClientIps } from './useBackendAIAppLauncher';
import { describe, expect, it } from 'vitest';

describe('normalizeAllowedClientIps', () => {
  it('returns an empty list for nullish input', () => {
    expect(normalizeAllowedClientIps(undefined)).toEqual([]);
    expect(normalizeAllowedClientIps(null)).toEqual([]);
    expect(normalizeAllowedClientIps([])).toEqual([]);
  });

  it('trims entries and drops blank ones', () => {
    expect(
      normalizeAllowedClientIps([' 10.0.0.1 ', '', '   ', '10.0.0.2']),
    ).toEqual(['10.0.0.1', '10.0.0.2']);
  });

  it('never produces consecutive commas when joined', () => {
    expect(
      normalizeAllowedClientIps(['10.0.0.1', '', '10.0.0.2']).join(','),
    ).toBe('10.0.0.1,10.0.0.2');
  });
});
