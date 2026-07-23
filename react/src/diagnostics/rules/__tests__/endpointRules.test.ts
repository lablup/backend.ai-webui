/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { checkEndpointReachability } from '../endpointRules';

describe('checkEndpointReachability', () => {
  it('should return null when endpoint is empty', () => {
    expect(checkEndpointReachability('', false)).toBeNull();
  });

  it('should return null when endpoint returns 200', () => {
    expect(
      checkEndpointReachability(
        'https://api.example.com',
        true,
        undefined,
        200,
      ),
    ).toBeNull();
  });

  it('should return null when endpoint returns 401', () => {
    expect(
      checkEndpointReachability(
        'https://api.example.com',
        true,
        undefined,
        401,
      ),
    ).toBeNull();
  });

  it('should return null when endpoint returns 403', () => {
    expect(
      checkEndpointReachability(
        'https://api.example.com',
        true,
        undefined,
        403,
      ),
    ).toBeNull();
  });

  it('should return warning when endpoint returns 404', () => {
    const result = checkEndpointReachability(
      'https://api.example.com',
      true,
      undefined,
      404,
    );
    expect(result).not.toBeNull();
    expect(result?.severity).toBe('warning');
    expect(result?.category).toBe('endpoint');
    expect(result?.id).toBe('endpoint-not-found');
  });

  it('should return critical when endpoint is unreachable (500)', () => {
    const result = checkEndpointReachability(
      'https://api.example.com',
      false,
      'Internal Server Error',
      500,
    );
    expect(result).not.toBeNull();
    expect(result?.severity).toBe('critical');
    expect(result?.category).toBe('endpoint');
    expect(result?.id).toBe('endpoint-unreachable');
    expect(result?.interpolationValues?.error).toBe('Internal Server Error');
  });

  it('should return critical when endpoint is unreachable (network error)', () => {
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
