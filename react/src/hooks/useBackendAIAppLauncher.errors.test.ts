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
 *
 * On the frontend side the tests call the same exported helpers the hook
 * uses in production (`resolveStartServiceErrorMessage`,
 * `buildAppLaunchFailureExtraDescription`) rather than re-composing their
 * logic here, so a regression in those paths fails these tests.
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
  buildAppLaunchFailureExtraDescription,
  getAppProxyErrorMessage,
  isSendRequestErrorResponse,
  isSessionNotFoundError,
  resolveStartServiceErrorMessage,
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
    '%s: resolves to exactly the manager message + error_code',
    async (_name, mock) => {
      const err = await startServiceRejection(mock);
      // The production resolver used by `_resolveV2ProxyUri`'s catch. Equality
      // (not toContain) so the client's debug prefix ("server responded
      // failure: 503 Service Unavailable - …") can never leak back in.
      const resolved = resolveStartServiceErrorMessage(
        err,
        getErrorMessage(),
        FALLBACK,
      );

      expect(resolved).toBe(
        `${mock.body.msg ?? mock.body.title} (${mock.body.error_code})`,
      );
    },
  );

  it.each(Object.entries<MockedErrorResponse>(managerErrors))(
    '%s: AppLaunchError preserves the payload for the notification',
    async (_name, mock) => {
      const err = await startServiceRejection(mock);
      const wrapped = new AppLaunchError(
        resolveStartServiceErrorMessage(err, getErrorMessage(), FALLBACK),
        'configuring',
        err,
      );

      // The original payload (incl. traceback/response) must survive for the
      // notification's extraDescription.
      expect(wrapped.originalError).toBe(err);
    },
  );

  it.each(Object.entries<MockedErrorResponse>(managerErrors))(
    '%s: notification details keep diagnostics but never the request body',
    async (_name, mock) => {
      const err = await startServiceRejection(mock);

      // Sanity: the raw rejection DOES echo the start-service request body
      // (incl. the credential) via `requestParameters` — that is what the
      // builder must strip.
      expect(JSON.stringify(err)).toContain('login_session_token');

      const wrapped = new AppLaunchError('m', 'configuring', err);
      const extra = buildAppLaunchFailureExtraDescription(wrapped);

      expect(extra).toBeDefined();
      expect(extra).not.toContain('login_session_token');
      expect(extra).not.toContain('requestParameters');
      expect(extra).toContain(mock.body.error_code);
      expect(extra).toContain(String(mock.status));
    },
  );

  it('notification details fall back to the wrapper when nothing was preserved', () => {
    const fromError = buildAppLaunchFailureExtraDescription(
      new AppLaunchError('m', 'requesting', new Error('boom')),
    );
    expect(fromError).toContain('boom');

    const bare = new AppLaunchError('m', 'connecting');
    expect(buildAppLaunchFailureExtraDescription(bare)).toBe(bare.stack);
  });

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
    // discriminator, and it must reach the user verbatim.
    const scalingGroupMsg = resolveStartServiceErrorMessage(
      await startServiceRejection(managerErrors.noScalingGroup),
      getErrorMessage(),
      FALLBACK,
    );
    const coordinatorMsg = resolveStartServiceErrorMessage(
      await startServiceRejection(managerErrors.noCoordinator),
      getErrorMessage(),
      FALLBACK,
    );

    expect(scalingGroupMsg).toBe(
      'Session has no scaling group assigned (backendai_generic_unavailable)',
    );
    expect(coordinatorMsg).toBe(
      'No coordinator configured for this resource group (backendai_generic_unavailable)',
    );
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
    const resolved = resolveStartServiceErrorMessage(
      rejection,
      getErrorMessage(),
      FALLBACK,
    );
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
