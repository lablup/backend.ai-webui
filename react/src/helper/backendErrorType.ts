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

const TOTP_ERROR_MESSAGE_KEY_BY_TYPE: Record<
  string,
  TotpActivationErrorMessageKey
> = {
  'expired-token': 'totp.RegistrationTokenExpired',
  'invalid-token': 'totp.RegistrationTokenInvalid',
  'totp-auth-failed': 'totp.InvalidTotpCode',
};

/**
 * Tell a dead 2FA registration token apart from a mistyped OTP: the manager's
 * TOTP webapp raises `expired-token` / `invalid-token` for the token it parses
 * and `totp-auth-failed` for the code the user typed.
 */
export const getTotpActivationErrorMessageKey = (
  err: unknown,
  fallbackKey: TotpActivationErrorMessageKey = 'totp.InvalidTotpCode',
): TotpActivationErrorMessageKey => {
  const rejection = err as
    { type?: unknown; response?: { type?: unknown } | null } | null | undefined;
  // `_wrapWithPromise` overwrites the thrown `type` with a blanket
  // `server-error`; the manager's own problem type survives on `response`.
  for (const rawType of [rejection?.response?.type, rejection?.type]) {
    if (typeof rawType !== 'string') continue;
    const key = TOTP_ERROR_MESSAGE_KEY_BY_TYPE[extractErrorType(rawType)];
    if (key) return key;
  }
  return fallbackKey;
};

/** True when the registration token is at fault, so retyping the OTP is futile. */
export const isTotpRegistrationTokenError = (err: unknown): boolean => {
  const key = getTotpActivationErrorMessageKey(err);
  return (
    key === 'totp.RegistrationTokenExpired' ||
    key === 'totp.RegistrationTokenInvalid'
  );
};
