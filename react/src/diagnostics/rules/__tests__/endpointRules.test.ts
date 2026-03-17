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
    expect(result?.interpolationValues?.endpoint).toBe(
      'https://api.example.com',
    );
  });

  it('should use default error message when none provided', () => {
    const result = checkEndpointReachability('https://api.example.com', false);
    expect(result?.interpolationValues?.error).toBe('Unknown error');
  });

  it('should fall back to default error when empty string is provided', () => {
    const result = checkEndpointReachability(
      'https://api.example.com',
      false,
      '',
    );
    expect(result?.interpolationValues?.error).toBe('Unknown error');
  });

  it('should include endpoint in interpolation values', () => {
    const result = checkEndpointReachability(
      'https://my-backend.example.com:8090',
      false,
    );
    expect(result?.interpolationValues?.endpoint).toBe(
      'https://my-backend.example.com:8090',
    );
  });

  it('should include correct i18n keys', () => {
    const result = checkEndpointReachability(
      'https://api.example.com',
      false,
      'timeout',
    );
    expect(result?.titleKey).toBe('diagnostics.EndpointUnreachable');
    expect(result?.descriptionKey).toBe('diagnostics.EndpointUnreachableDesc');
    expect(result?.remediationKey).toBe('diagnostics.EndpointUnreachableFix');
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

  it('should include correct i18n keys for CORS misconfigured', () => {
    const result = checkCorsHeaders('https://api.example.com', {
      allowed: false,
    });
    expect(result?.titleKey).toBe('diagnostics.CorsMisconfigured');
    expect(result?.descriptionKey).toBe('diagnostics.CorsMisconfiguredDesc');
    expect(result?.remediationKey).toBe('diagnostics.CorsMisconfiguredFix');
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

  it('should treat error with allowed=true as info', () => {
    const result = checkCorsHeaders('https://api.example.com', {
      allowed: true,
      error: 'AbortError: signal timed out',
    });
    expect(result?.id).toBe('cors-check-failed');
    expect(result?.severity).toBe('info');
  });

  it('should not have remediationKey for cors-check-failed', () => {
    const result = checkCorsHeaders('https://api.example.com', {
      allowed: false,
      error: 'Network error',
    });
    expect(result?.remediationKey).toBeUndefined();
  });

  it('should include correct i18n keys for CORS check failed', () => {
    const result = checkCorsHeaders('https://api.example.com', {
      allowed: false,
      error: 'TypeError: Failed to fetch',
    });
    expect(result?.titleKey).toBe('diagnostics.CorsCheckFailed');
    expect(result?.descriptionKey).toBe('diagnostics.CorsCheckFailedDesc');
  });
});
