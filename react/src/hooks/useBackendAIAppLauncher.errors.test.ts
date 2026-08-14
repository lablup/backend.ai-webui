/**
 * FR-3478 regression tests: every backend failure on the app-launch path must
 * surface its real cause to the user, never the blanket
 * "Proxy configurator is not responding." text (which describes only the v1
 * `/conf` path).
 *
 * The error catalog in `__fixtures__/appLaunchBackendErrors.ts` was extracted
 * from the backend.ai sources; these environments are hard to reproduce live
 * (they need a broken agent, a mis-configured resource group, an exhausted
 * appproxy worker, …), so the catalog + these tests stand in for them.
 *
 * The manager stage deliberately runs through the REAL Backend.AI client
 * (`Client._wrapWithPromise`) with only `fetch` stubbed, because the client's
 * error transformation — rejecting with a plain object instead of an `Error` —
 * is the root cause of FR-3478. Re-implementing that transformation in the
 * test would let the two drift apart. The real client is imported by relative
 * path on purpose: the bare `backend.ai-client` specifier is aliased to a stub
 * in vitest.config.ts.
 */
import { Client } from '../../../packages/backend.ai-client/src/client';
import { ClientConfig } from '../../../packages/backend.ai-client/src/client-config';
import {
  coordinatorErrors,
  managerErrors,
  networkLevelFailures,
  workerErrors,
  type MockedErrorResponse,
} from './__fixtures__/appLaunchBackendErrors';
import {
  AppLaunchError,
  getAppProxyErrorMessage,
  isSendRequestErrorResponse,
  isSessionNotFoundError,
  sendRequest,
} from './useBackendAIAppLauncher';
import { renderHook } from '@testing-library/react';
import { useErrorMessageResolver } from 'backend.ai-ui';

const LEGACY_PROXY_TEXT = 'Proxy configurator is not responding.';
const FALLBACK = 'Failed to start the app service.';

const STATUS_TEXT: Record<number, string> = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  409: 'Conflict',
  500: 'Internal Server Error',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
};

const stubFetchWith = (mock: MockedErrorResponse) => {
  vi.stubGlobal(
    'fetch',
    vi.fn(
      async () =>
        new Response(JSON.stringify(mock.body), {
          status: mock.status,
          statusText: STATUS_TEXT[mock.status],
          headers: mock.headers,
        }),
    ),
  );
};

const getErrorMessage = () => {
  const { result } = renderHook(() => useErrorMessageResolver());
  return result.current.getErrorMessage;
};

/**
 * Drive the real client's start-service call against the stubbed fetch and
 * capture the rejection — the exact value `_resolveV2ProxyUri`'s catch sees.
 */
const startServiceRejection = async (
  mock: MockedErrorResponse,
): Promise<unknown> => {
  stubFetchWith(mock);
  const client = new Client(
    new ClientConfig(
      'AKIADUMMYACCESSKEY',
      'dummy-secret',
      'http://mock-manager',
    ),
    'test-agent',
  );
  try {
    await client.computeSession.startService(
      'login-session-token',
      'e961a85c-29b3-429e-b140-b01dcd80b689',
      'jupyter',
    );
  } catch (err) {
    return err;
  }
  throw new Error('expected startService to reject');
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('stage 1 — manager start-service rejections through the real client', () => {
  it.each(Object.entries<MockedErrorResponse>(managerErrors))(
    '%s: rejects with a plain object carrying statusCode/error_code',
    async (_name, mock) => {
      const err = await startServiceRejection(mock);

      // Root cause of FR-3478: the client never rejects with an Error, so an
      // `err instanceof Error` branch always falls through to its fallback.
      expect(err).not.toBeInstanceOf(Error);
      expect(err).toMatchObject({
        statusCode: mock.status,
        error_code: mock.body.error_code,
      });
    },
  );

  it.each(Object.entries<MockedErrorResponse>(managerErrors))(
    '%s: resolves to the manager message + error_code, not the proxy text',
    async (_name, mock) => {
      const err = await startServiceRejection(mock);
      const resolved = getErrorMessage()(err, FALLBACK);

      expect(resolved).not.toBe(LEGACY_PROXY_TEXT);
      expect(resolved).not.toBe(FALLBACK);
      // The client folds `body.msg` (or `body.title` when msg is absent) into
      // its `message`, and getErrorMessage appends the error_code.
      expect(resolved).toContain(mock.body.msg ?? mock.body.title);
      expect(resolved).toContain(`(${mock.body.error_code})`);
    },
  );

  it.each(Object.entries<MockedErrorResponse>(managerErrors))(
    '%s: AppLaunchError preserves the payload for the notification',
    async (_name, mock) => {
      const err = await startServiceRejection(mock);
      const wrapped = new AppLaunchError(
        getErrorMessage()(err, FALLBACK),
        'configuring',
        err,
      );

      expect(wrapped.statusCode).toBe(mock.status);
      expect(wrapped.errorCode).toBe(mock.body.error_code);
      // The original payload (incl. traceback/response) must survive for the
      // notification's extraDescription.
      expect(wrapped.originalError).toBe(err);
    },
  );

  it('treats 404s as "session not accessible" unless the app-not-found code says otherwise', async () => {
    // 404 with error_code "session_read_not-found" → the session itself is
    // gone (or created under another access key): show SessionNotAccessible.
    expect(
      isSessionNotFoundError(
        await startServiceRejection(managerErrors.sessionNotFound),
      ),
    ).toBe(true);

    // 404 with error_code "backendai_read_not-found" → the *app* was not
    // found in service_ports; the session is fine. Masking this as "session
    // not accessible" would misdirect the user.
    expect(
      isSessionNotFoundError(
        await startServiceRejection(managerErrors.appNotFound),
      ),
    ).toBe(false);

    // Pre-24.09 managers send no error_code — keep the FR-2586 heuristic.
    expect(isSessionNotFoundError({ statusCode: 404 })).toBe(true);
    expect(isSessionNotFoundError({ statusCode: 500 })).toBe(false);

    // Fail-safe direction: an error_code we do not recognize (e.g. the manager
    // renames its domain prefix) must NOT strip the localized guidance. These
    // literals are intentionally not sourced from the fixture — reading them
    // from the same catalog the production code is matched against would make
    // the assertion self-fulfilling.
    expect(
      isSessionNotFoundError({
        statusCode: 404,
        error_code: 'compute-session_read_not-found',
      }),
    ).toBe(true);
  });

  it('distinguishes same-title 503 causes only via msg, never via title', async () => {
    // noScalingGroup and noCoordinator share status, type, the (typo'd)
    // title "Serivce unavailable." and even error_code — msg is the only
    // discriminator, and it must reach the user.
    const scalingGroupMsg = getErrorMessage()(
      await startServiceRejection(managerErrors.noScalingGroup),
      FALLBACK,
    );
    const coordinatorMsg = getErrorMessage()(
      await startServiceRejection(managerErrors.noCoordinator),
      FALLBACK,
    );

    expect(scalingGroupMsg).toContain('Session has no scaling group assigned');
    expect(coordinatorMsg).toContain(
      'No coordinator configured for this resource group',
    );
    expect(scalingGroupMsg).not.toBe(coordinatorMsg);
  });
});

describe('stage 2/3 — appproxy coordinator & worker errors through sendRequest', () => {
  const appproxyCatalog: Array<[string, MockedErrorResponse]> = [
    ...Object.entries<MockedErrorResponse>(coordinatorErrors),
    ...Object.entries<MockedErrorResponse>(workerErrors),
  ];

  it.each(appproxyCatalog)(
    '%s: sendRequest returns a detectable error shape with the real message',
    async (_name, mock) => {
      stubFetchWith(mock);
      const result = await sendRequest({
        uri: 'http://mock-appproxy/v2/proxy/token/session-id/add',
        method: 'GET',
      });

      expect(isSendRequestErrorResponse(result)).toBe(true);
      if (!isSendRequestErrorResponse(result)) return; // type narrowing

      expect(result.status).toBe(mock.status);
      const message = getAppProxyErrorMessage(result, FALLBACK);
      expect(message).toBe(mock.body.msg ?? mock.body.title);
      expect(message).not.toBe(LEGACY_PROXY_TEXT);
    },
  );

  it('coordinator 404 (token not found) follows the fail-safe direction', () => {
    // Under the denylist an out-of-domain code like "agent_read_not-found"
    // keeps the session-not-found guidance (fail-safe). This never surfaces:
    // isSessionNotFoundError is called exclusively on the manager's
    // start-service rejection — coordinator failures are routed through
    // sendRequest/getAppProxyErrorMessage and never reach it.
    expect(
      isSessionNotFoundError({
        statusCode: coordinatorErrors.tokenNotFound.status,
        error_code: coordinatorErrors.tokenNotFound.body.error_code,
      }),
    ).toBe(true);
  });
});

describe('stage 0 — network-level failures (no HTTP response at all)', () => {
  it('client path: an unreachable manager still surfaces the fetch failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw networkLevelFailures.unreachableAppProxy();
      }),
    );
    const client = new Client(
      new ClientConfig(
        'AKIADUMMYACCESSKEY',
        'dummy-secret',
        'http://mock-manager',
      ),
      'test-agent',
    );

    let rejection: unknown;
    try {
      await client.computeSession.startService(
        'token',
        'session-id',
        'jupyter',
      );
    } catch (err) {
      rejection = err;
    }

    expect(rejection).toBeDefined();
    expect(rejection).not.toBeInstanceOf(Error);
    expect(isSessionNotFoundError(rejection)).toBe(false);
    const resolved = getErrorMessage()(rejection, FALLBACK);
    expect(resolved).not.toBe(LEGACY_PROXY_TEXT);
    expect(resolved).toContain('Failed to fetch');
  });

  it('sendRequest path: an unreachable appproxy throws a descriptive Error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw networkLevelFailures.unreachableAppProxy();
      }),
    );

    await expect(
      sendRequest({
        uri: 'http://mock-appproxy/v2/proxy/token/session-id/add',
        method: 'GET',
      }),
    ).rejects.toThrow('Request failed: Failed to fetch');
  });
});

describe('AppLaunchError payload extraction guards', () => {
  it('extracts statusCode/errorCode only from well-typed fields', () => {
    const fromPayload = new AppLaunchError('m', 'configuring', {
      statusCode: 503,
      error_code: 'backendai_generic_unavailable',
    });
    expect(fromPayload.statusCode).toBe(503);
    expect(fromPayload.errorCode).toBe('backendai_generic_unavailable');

    // The client's overlay types statusCode as number|string; a string status
    // (or any other mistyped field) must be ignored, not coerced.
    const mistyped = new AppLaunchError('m', 'configuring', {
      statusCode: '503',
      error_code: 42,
    });
    expect(mistyped.statusCode).toBeUndefined();
    expect(mistyped.errorCode).toBeUndefined();
  });

  it('accepts Error and absent originalError without extraction', () => {
    const fromError = new AppLaunchError('m', 'requesting', new Error('boom'));
    expect(fromError.statusCode).toBeUndefined();
    expect(fromError.errorCode).toBeUndefined();
    expect(fromError.originalError).toBeInstanceOf(Error);

    const bare = new AppLaunchError('m', 'connecting');
    expect(bare.originalError).toBeUndefined();
    expect(bare.statusCode).toBeUndefined();
  });
});
