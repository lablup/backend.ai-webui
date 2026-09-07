/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  extractErrorType,
  getTotpActivationErrorMessageKey,
  isTotpRegistrationTokenError,
} from './backendErrorType';

const problem = (type: string) => ({ isError: true, type });

describe('extractErrorType', () => {
  it('returns the last segment of a problem type URL', () => {
    expect(extractErrorType('https://api.backend.ai/probs/auth-failed')).toBe(
      'auth-failed',
    );
  });

  it('returns an empty string for missing or empty input', () => {
    expect(extractErrorType(undefined)).toBe('');
    expect(extractErrorType(null)).toBe('');
    expect(extractErrorType('')).toBe('');
    expect(extractErrorType('https://api.backend.ai/probs/')).toBe('');
  });

  it('returns the input itself when it is not a URL', () => {
    expect(extractErrorType('expired-token')).toBe('expired-token');
  });
});

describe('getTotpActivationErrorMessageKey', () => {
  it('maps an expired registration token to the reissue message', () => {
    expect(
      getTotpActivationErrorMessageKey(
        problem('https://api.backend.ai/probs/expired-token'),
      ),
    ).toBe('totp.RegistrationTokenExpired');
  });

  it('maps a malformed registration token to the invalid-link message', () => {
    expect(
      getTotpActivationErrorMessageKey(
        problem('https://api.backend.ai/probs/invalid-token'),
      ),
    ).toBe('totp.RegistrationTokenInvalid');
  });

  it('maps a rejected OTP to the invalid-code message', () => {
    expect(
      getTotpActivationErrorMessageKey(
        problem('https://api.backend.ai/probs/totp-auth-failed'),
      ),
    ).toBe('totp.InvalidTotpCode');
  });

  it('falls back for unrelated, malformed or missing errors', () => {
    expect(
      getTotpActivationErrorMessageKey(
        problem('https://api.backend.ai/probs/invalid-api-params'),
      ),
    ).toBe('totp.InvalidTotpCode');
    expect(getTotpActivationErrorMessageKey(new Error('network'))).toBe(
      'totp.InvalidTotpCode',
    );
    expect(getTotpActivationErrorMessageKey(undefined)).toBe(
      'totp.InvalidTotpCode',
    );
    expect(getTotpActivationErrorMessageKey({ type: 404 })).toBe(
      'totp.InvalidTotpCode',
    );
  });

  it('honours a caller-supplied fallback key', () => {
    expect(
      getTotpActivationErrorMessageKey(
        new Error('network'),
        'totp.TotpSetupNotAvailable',
      ),
    ).toBe('totp.TotpSetupNotAvailable');
    // A recognized type still wins over the fallback.
    expect(
      getTotpActivationErrorMessageKey(
        problem('https://api.backend.ai/probs/expired-token'),
        'totp.TotpSetupNotAvailable',
      ),
    ).toBe('totp.RegistrationTokenExpired');
  });
});

describe('isTotpRegistrationTokenError', () => {
  it('is true only when the registration token is at fault', () => {
    expect(
      isTotpRegistrationTokenError(
        problem('https://api.backend.ai/probs/expired-token'),
      ),
    ).toBe(true);
    expect(
      isTotpRegistrationTokenError(
        problem('https://api.backend.ai/probs/invalid-token'),
      ),
    ).toBe(true);
    expect(
      isTotpRegistrationTokenError(
        problem('https://api.backend.ai/probs/totp-auth-failed'),
      ),
    ).toBe(false);
    expect(isTotpRegistrationTokenError(new Error('network'))).toBe(false);
  });
});
