/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */

/**
 * Extract the error type suffix from a Backend.AI problem type URL.
 * e.g., "https://api.backend.ai/probs/auth-failed" → "auth-failed"
 */
export const extractErrorType = (typeUrl?: string | null): string => {
  if (!typeUrl) return '';
  const parts = typeUrl.split('/');
  return parts[parts.length - 1] || '';
};

export type TotpActivationErrorMessageKey =
  | 'totp.RegistrationTokenExpired'
  | 'totp.RegistrationTokenInvalid'
  | 'totp.InvalidTotpCode'
  | 'totp.TotpSetupNotAvailable';

/**
 * Tell a dead 2FA registration token apart from a mistyped OTP: the manager's
 * TOTP webapp raises `expired-token` / `invalid-token` for the token it parses
 * and `totp-auth-failed` for the code the user typed.
 */
export const getTotpActivationErrorMessageKey = (
  err: unknown,
  fallbackKey: TotpActivationErrorMessageKey = 'totp.InvalidTotpCode',
): TotpActivationErrorMessageKey => {
  const rawType = (err as { type?: unknown } | null | undefined)?.type;
  switch (extractErrorType(typeof rawType === 'string' ? rawType : undefined)) {
    case 'expired-token':
      return 'totp.RegistrationTokenExpired';
    case 'invalid-token':
      return 'totp.RegistrationTokenInvalid';
    case 'totp-auth-failed':
      return 'totp.InvalidTotpCode';
    default:
      return fallbackKey;
  }
};

/** True when the registration token is at fault, so retyping the OTP is futile. */
export const isTotpRegistrationTokenError = (err: unknown): boolean => {
  const key = getTotpActivationErrorMessageKey(err);
  return (
    key === 'totp.RegistrationTokenExpired' ||
    key === 'totp.RegistrationTokenInvalid'
  );
};
