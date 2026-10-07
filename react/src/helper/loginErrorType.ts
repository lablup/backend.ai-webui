/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { extractErrorType } from '.';

/**
 * True when `client.login()` rejected the username/password pair itself, as
 * opposed to a TOTP follow-up, an email-verification gate, or a network/server
 * error (those reject without `isLoginError`).
 */
export const isCredentialMismatchLoginError = (err: unknown): boolean => {
  const e = err as
    | { isLoginError?: unknown; data?: { type?: unknown; details?: unknown } }
    | null
    | undefined;
  if (!e?.isLoginError || !e.data) return false;
  const details = typeof e.data.details === 'string' ? e.data.details : '';
  const errorType =
    typeof e.data.type === 'string' ? extractErrorType(e.data.type) : '';
  if (errorType === 'auth-failed') {
    return !details.toLowerCase().includes('email verification');
  }
  // Older webservers send no `type`; match the legacy detail string.
  return errorType === '' && details.includes('User credential mismatch.');
};
