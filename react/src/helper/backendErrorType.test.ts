/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { Client } from '../../../packages/backend.ai-client/src/client';
import { ClientConfig } from '../../../packages/backend.ai-client/src/client-config';
import {
  extractErrorType,
  getTotpActivationErrorMessageKey,
  isTotpRegistrationTokenError,
} from './backendErrorType';

/**
 * The shape `Client._wrapWithPromise` actually rejects with: its catch block
 * overwrites `type` with a blanket `server-error` and keeps the manager's
 * problem document on `response`. The stubbed-fetch cases below pin this
 * against the real client so the two cannot drift.
 */
const clientRejection = (problemType: string) => ({
  isError: true,
  type: 'https://api.backend.ai/probs/server-error',
  response: { type: problemType, title: 'failure' },
});

const stubFetchWithProblem = (problemType: string, status = 400) => {
  vi.stubGlobal(
    'fetch',
    vi.fn(
      async () =>
        new Response(JSON.stringify({ type: problemType, title: 'failure' }), {
          status,
          statusText: 'Bad Request',
          headers: { 'Content-Type': 'application/problem+json' },
        }),
    ),
  );
};

/**
 * Drive the real client's TOTP activation against the stubbed fetch and
 * capture the rejection — the exact value the `onError` handlers see.
 */
const activateTotpRejection = async (problemType: string): Promise<unknown> => {
  stubFetchWithProblem(problemType);
  const client = new Client(
    new ClientConfig(
      'AKIADUMMYACCESSKEY',
      'dummy-secret',
      'http://mock-manager',
    ),
    'test-agent',
  );
  try {
    await client.activate_totp_anon({
      otp: '123456',
      registration_token: 'dummy-registration-token',
    });
  } catch (err) {
    return err;
  }
  throw new Error('expected activate_totp_anon to reject');
};

afterEach(() => {
  vi.unstubAllGlobals();
});

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
        clientRejection('https://api.backend.ai/probs/expired-token'),
      ),
    ).toBe('totp.RegistrationTokenExpired');
  });

  it('maps a malformed registration token to the invalid-link message', () => {
    expect(
      getTotpActivationErrorMessageKey(
        clientRejection('https://api.backend.ai/probs/invalid-token'),
      ),
    ).toBe('totp.RegistrationTokenInvalid');
  });

  it('maps a rejected OTP to the invalid-code message', () => {
    expect(
      getTotpActivationErrorMessageKey(
        clientRejection('https://api.backend.ai/probs/totp-auth-failed'),
      ),
    ).toBe('totp.InvalidTotpCode');
  });

  it('still reads a bare `type` when there is no response body', () => {
    // Not a shape the client produces today, but the classifier must not
    // depend on `response` existing.
    expect(
      getTotpActivationErrorMessageKey({
        isError: true,
        type: 'https://api.backend.ai/probs/expired-token',
      }),
    ).toBe('totp.RegistrationTokenExpired');
  });

  it('falls back for unrelated, malformed or missing errors', () => {
    expect(
      getTotpActivationErrorMessageKey(
        clientRejection('https://api.backend.ai/probs/invalid-api-params'),
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
    // A non-JSON body leaves a Blob on `response`, whose `type` is a MIME type.
    expect(
      getTotpActivationErrorMessageKey({
        isError: true,
        type: 'https://api.backend.ai/probs/server-error',
        response: new Blob(['boom'], { type: 'text/plain' }),
      }),
    ).toBe('totp.InvalidTotpCode');
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
        clientRejection('https://api.backend.ai/probs/expired-token'),
        'totp.TotpSetupNotAvailable',
      ),
    ).toBe('totp.RegistrationTokenExpired');
  });
});

describe('isTotpRegistrationTokenError', () => {
  it('is true only when the registration token is at fault', () => {
    expect(
      isTotpRegistrationTokenError(
        clientRejection('https://api.backend.ai/probs/expired-token'),
      ),
    ).toBe(true);
    expect(
      isTotpRegistrationTokenError(
        clientRejection('https://api.backend.ai/probs/invalid-token'),
      ),
    ).toBe(true);
    expect(
      isTotpRegistrationTokenError(
        clientRejection('https://api.backend.ai/probs/totp-auth-failed'),
      ),
    ).toBe(false);
    expect(isTotpRegistrationTokenError(new Error('network'))).toBe(false);
  });
});

describe('classification of real client rejections', () => {
  it('the client clobbers `type`, so the raw field alone is useless', async () => {
    const err = await activateTotpRejection(
      'https://api.backend.ai/probs/expired-token',
    );

    expect(err).toMatchObject({
      type: 'https://api.backend.ai/probs/server-error',
      response: { type: 'https://api.backend.ai/probs/expired-token' },
    });
  });

  it.each([
    ['expired-token', 'totp.RegistrationTokenExpired'],
    ['invalid-token', 'totp.RegistrationTokenInvalid'],
    ['totp-auth-failed', 'totp.InvalidTotpCode'],
  ])('classifies a %s rejection as %s', async (problem, expected) => {
    const err = await activateTotpRejection(
      `https://api.backend.ai/probs/${problem}`,
    );

    expect(getTotpActivationErrorMessageKey(err)).toBe(expected);
  });

  it('sends the user back to the login form only for token failures', async () => {
    expect(
      isTotpRegistrationTokenError(
        await activateTotpRejection(
          'https://api.backend.ai/probs/expired-token',
        ),
      ),
    ).toBe(true);
    expect(
      isTotpRegistrationTokenError(
        await activateTotpRejection(
          'https://api.backend.ai/probs/totp-auth-failed',
        ),
      ),
    ).toBe(false);
  });
});
