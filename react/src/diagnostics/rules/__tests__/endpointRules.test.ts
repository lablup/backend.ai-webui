/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { checkEndpointReachability } from '../endpointRules';
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
