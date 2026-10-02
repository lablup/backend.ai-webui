/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { isCredentialMismatchLoginError } from './loginErrorType';

const loginError = (data: Record<string, unknown>) => ({
  isLoginError: true,
  data,
});

describe('isCredentialMismatchLoginError', () => {
  it('matches an auth-failed envelope', () => {
    expect(
      isCredentialMismatchLoginError(
        loginError({
          type: 'https://api.backend.ai/probs/auth-failed',
          details: 'User credential mismatch.',
        }),
      ),
    ).toBe(true);
  });

  it('matches the legacy detail string from a webserver that sends no type', () => {
    expect(
      isCredentialMismatchLoginError(
        loginError({ details: 'User credential mismatch.' }),
      ),
    ).toBe(true);
  });

  it('does not match an email-verification gate', () => {
    expect(
      isCredentialMismatchLoginError(
        loginError({
          type: 'https://api.backend.ai/probs/auth-failed',
          details: 'Email verification is required.',
        }),
      ),
    ).toBe(false);
  });

  it.each([
    'require-totp-authentication',
    'require-totp-registration',
    'rejected-by-hook',
    'password-expired',
    'active-login-session-exists',
  ])('does not match the %s follow-up', (type) => {
    expect(
      isCredentialMismatchLoginError(
        loginError({
          type: `https://api.backend.ai/probs/${type}`,
          details: 'User credential mismatch.',
        }),
      ),
    ).toBe(false);
  });

  it('does not match server or network errors', () => {
    expect(
      isCredentialMismatchLoginError({
        isError: true,
        type: 'https://api.backend.ai/probs/login-blocked',
        statusCode: 429,
      }),
    ).toBe(false);
    expect(isCredentialMismatchLoginError(new TypeError('fetch failed'))).toBe(
      false,
    );
    expect(isCredentialMismatchLoginError(undefined)).toBe(false);
  });
});
