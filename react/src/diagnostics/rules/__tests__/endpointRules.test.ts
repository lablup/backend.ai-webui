/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { checkEndpointReachability, checkSslMismatch } from '../endpointRules';
import { describe, expect, it } from '@jest/globals';

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
    expect(result?.category).toBe('endpoint');
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
