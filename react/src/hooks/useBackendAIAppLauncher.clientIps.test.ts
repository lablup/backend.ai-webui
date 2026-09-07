/**
 * FR-3865: the app launcher's "Allowed client IPs" field used to accept any
 * string and forward it verbatim as the `allowed_client_ips` proxy parameter.
 */
import {
  findInvalidClientIps,
  normalizeAllowedClientIps,
} from './useBackendAIAppLauncher';
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

describe('findInvalidClientIps', () => {
  it('accepts IPv4, IPv6 and CIDR ranges', () => {
    expect(
      findInvalidClientIps([
        '10.0.0.1',
        '192.168.0.0/24',
        '::1',
        '2001:db8::/32',
      ]),
    ).toEqual([]);
  });

  it('reports entries that are neither an IP nor a CIDR range', () => {
    expect(
      findInvalidClientIps(['10.0.0.1', 'not-an-ip', '999.1.1.1']),
    ).toEqual(['not-an-ip', '999.1.1.1']);
  });

  it('ignores blank entries, which are dropped before the request', () => {
    expect(findInvalidClientIps(['', '  ', '10.0.0.1'])).toEqual([]);
  });

  it('validates trimmed entries', () => {
    expect(findInvalidClientIps([' 10.0.0.1 '])).toEqual([]);
  });
});
