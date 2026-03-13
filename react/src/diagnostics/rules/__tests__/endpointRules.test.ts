/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { checkCorsHeaders, checkEndpointReachability } from '../endpointRules';
import { describe, expect, it } from '@jest/globals';

describe('checkEndpointReachability', () => {
  it('should return null when endpoint is empty', () => {
    expect(checkEndpointReachability('', false)).toBeNull();
  });

  it('should return null when endpoint is reachable', () => {
    expect(
      checkEndpointReachability('https://api.example.com', true),
    ).toBeNull();
  });

  it('should return critical when endpoint is unreachable', () => {
    const result = checkEndpointReachability(
      'https://api.example.com',
      false,
      'Connection refused',
    );
    expect(result).not.toBeNull();
    expect(result?.severity).toBe('critical');
    expect(result?.category).toBe('endpoint');
    expect(result?.id).toBe('endpoint-unreachable');
    expect(result?.interpolationValues?.error).toBe('Connection refused');
  });

  it('should use default error message when none provided', () => {
    const result = checkEndpointReachability('https://api.example.com', false);
    expect(result?.interpolationValues?.error).toBe('Unknown error');
  });
});

describe('checkCorsHeaders', () => {
  it('should return null when endpoint is empty', () => {
    expect(checkCorsHeaders('', { allowed: false })).toBeNull();
  });

  it('should return null when CORS is allowed', () => {
    expect(
      checkCorsHeaders('https://api.example.com', { allowed: true }),
    ).toBeNull();
  });

  it('should return null when CORS is allowed with allowOrigin header', () => {
    expect(
      checkCorsHeaders('https://api.example.com', {
        allowed: true,
        allowOrigin: '*',
      }),
    ).toBeNull();
  });

  it('should return warning when CORS is not allowed', () => {
    const result = checkCorsHeaders('https://api.example.com', {
      allowed: false,
    });
    expect(result).not.toBeNull();
    expect(result?.severity).toBe('warning');
    expect(result?.category).toBe('endpoint');
    expect(result?.id).toBe('cors-misconfigured');
    expect(result?.interpolationValues?.endpoint).toBe(
      'https://api.example.com',
    );
  });

  it('should return info when there is a network error', () => {
    const result = checkCorsHeaders('https://api.example.com', {
      allowed: false,
      error: 'Failed to fetch',
    });
    expect(result).not.toBeNull();
    expect(result?.severity).toBe('info');
    expect(result?.category).toBe('endpoint');
    expect(result?.id).toBe('cors-check-failed');
    expect(result?.interpolationValues?.error).toBe('Failed to fetch');
    expect(result?.interpolationValues?.endpoint).toBe(
      'https://api.example.com',
    );
  });

  it('should prioritize error over allowed=false', () => {
    const result = checkCorsHeaders('https://api.example.com', {
      allowed: false,
      error: 'Connection timeout',
    });
    expect(result?.id).toBe('cors-check-failed');
    expect(result?.severity).toBe('info');
  });
});
