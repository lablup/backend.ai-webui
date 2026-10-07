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
      expect(key).not.toMatch(/^login\.singleSignOn\.OpenIDUnknownError/);
      expect(typeof lookup(key)).toBe('string');
    }
  });

  it('falls back to the with-code key for an unknown code-shaped value', () => {
    expect(resolveOpenIDLoginErrorKey('something-new')).toEqual({
      key: 'login.singleSignOn.OpenIDUnknownErrorWithCode',
      code: 'something-new',
    });
  });

  it('does not treat Object prototype names as known codes', () => {
    expect(resolveOpenIDLoginErrorKey('constructor')).toEqual({
      key: 'login.singleSignOn.OpenIDUnknownErrorWithCode',
      code: 'constructor',
    });
  });

  it('omits the code for values that are not code-shaped', () => {
    for (const value of ['x'.repeat(65), 'Account locked. Call 1-800-000']) {
      expect(resolveOpenIDLoginErrorKey(value)).toEqual({
        key: 'login.singleSignOn.OpenIDUnknownError',
      });
    }
  });

  it('omits the code for an empty or blank value', () => {
    for (const value of ['', '   ']) {
      const result = resolveOpenIDLoginErrorKey(value);
      expect(result.key).toBe('login.singleSignOn.OpenIDUnknownError');
      expect(result.code).toBeUndefined();
    }
  });

  it('has both unknown-error messages, only one of them with the code', () => {
    const withCode = lookup('login.singleSignOn.OpenIDUnknownErrorWithCode');
    const withoutCode = lookup('login.singleSignOn.OpenIDUnknownError');
    expect(typeof withCode).toBe('string');
    expect(typeof withoutCode).toBe('string');
    expect(withCode as string).toContain('{{ code }}');
    expect(withoutCode as string).not.toContain('{{ code }}');
  });
});
