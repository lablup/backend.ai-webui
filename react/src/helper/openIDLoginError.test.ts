/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import en from '../../../resources/i18n/en.json';
import { resolveOpenIDLoginErrorKey } from './openIDLoginError';
import { describe, expect, it } from 'vitest';

const KNOWN_CODES = [
  'openid-access-denied',
  'invalid-openid-session',
  'openid-not-authenticated',
  'openid-group-not-allowed',
  'openid-domain-not-found',
  'openid-provider-misconfigured',
  'openid-provider-unavailable',
  'internal-server-error',
];

const lookup = (key: string): unknown =>
  key
    .split('.')
    .reduce<unknown>(
      (node, part) => (node as Record<string, unknown> | undefined)?.[part],
      en,
    );

describe('resolveOpenIDLoginErrorKey', () => {
  it('maps every known code to a distinct, existing i18n key', () => {
    const keys = KNOWN_CODES.map(
      (code) => resolveOpenIDLoginErrorKey(code).key,
    );
    expect(new Set(keys).size).toBe(KNOWN_CODES.length);
    for (const key of keys) {
      expect(key).not.toBe('login.singleSignOn.OpenIDUnknownError');
      expect(typeof lookup(key)).toBe('string');
    }
  });

  it('falls back to the unknown-error key and keeps the code', () => {
    expect(resolveOpenIDLoginErrorKey('something-new')).toEqual({
      key: 'login.singleSignOn.OpenIDUnknownError',
      code: 'something-new',
    });
    expect(typeof lookup('login.singleSignOn.OpenIDUnknownError')).toBe(
      'string',
    );
  });

  it('does not treat Object prototype names as known codes', () => {
    expect(resolveOpenIDLoginErrorKey('constructor').key).toBe(
      'login.singleSignOn.OpenIDUnknownError',
    );
  });

  it('does not echo values that are not code-shaped', () => {
    expect(resolveOpenIDLoginErrorKey('x'.repeat(65)).code).toBe('invalid');
    expect(
      resolveOpenIDLoginErrorKey('Account locked. Call 1-800-000').code,
    ).toBe('invalid');
  });

  it('falls back to the unknown-error key for an empty value', () => {
    expect(resolveOpenIDLoginErrorKey('')).toEqual({
      key: 'login.singleSignOn.OpenIDUnknownError',
      code: 'invalid',
    });
  });
});
