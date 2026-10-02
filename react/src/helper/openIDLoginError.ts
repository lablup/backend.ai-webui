/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */

/** The query parameter the manager's OpenID plugin appends on a failed login. */
export const OPENID_LOGIN_ERROR_PARAM = 'bai_error';

const OPENID_LOGIN_ERROR_KEYS: Record<string, string> = {
  'openid-access-denied': 'login.singleSignOn.OpenIDAccessDenied',
  'invalid-openid-session': 'login.singleSignOn.OpenIDSessionInvalid',
  'openid-not-authenticated': 'login.singleSignOn.OpenIDNotAuthenticated',
  'openid-group-not-allowed': 'login.singleSignOn.OpenIDGroupNotAllowed',
  'openid-domain-not-found': 'login.singleSignOn.OpenIDDomainNotFound',
  'openid-provider-misconfigured':
    'login.singleSignOn.OpenIDProviderMisconfigured',
  'openid-provider-unavailable': 'login.singleSignOn.OpenIDProviderUnavailable',
  'internal-server-error': 'login.singleSignOn.OpenIDInternalServerError',
};

// Only echo code-shaped values, so a crafted link cannot put prose in the banner.
const DISPLAYABLE_CODE = /^[A-Za-z0-9_-]{1,64}$/;

/**
 * Resolve a `bai_error` value to the i18n key of its description. Unknown
 * values fall back to a generic message that shows the code.
 */
export const resolveOpenIDLoginErrorKey = (
  code: string,
): { key: string; code: string } => {
  const trimmed = code.trim();
  if (Object.prototype.hasOwnProperty.call(OPENID_LOGIN_ERROR_KEYS, trimmed)) {
    return { key: OPENID_LOGIN_ERROR_KEYS[trimmed], code: trimmed };
  }
  return {
    key: 'login.singleSignOn.OpenIDUnknownError',
    code: DISPLAYABLE_CODE.test(trimmed) ? trimmed : 'invalid',
  };
};
