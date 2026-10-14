/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  LoginBootstrapIncompleteError,
  SessionAuthFailureError,
} from './loginBootstrap';
import type { LoginConfigState } from './loginConfig';
import {
  LoginProbeCancelledError,
  connectViaGQL,
  escapeLoginProbe,
  probeManager,
} from './loginSessionAuth';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../hooks/useWebUIConfig', () => ({
  __esModule: true,
  fetchAndParseConfig: vi.fn(),
}));

vi.mock('./loginConfig', () => ({
  __esModule: true,
  applyConfigToClient: vi.fn(),
}));

// A manager that never answers: the request settles only when its signal is
// aborted, the way `fetch` behaves against a black-holed endpoint.
function makeHangingClient() {
  return {
    requestTimeout: 30_000,
    get_manager_version: vi.fn(
      (signal: AbortSignal) =>
        new Promise((_, reject) => {
          signal.addEventListener('abort', () =>
            reject(new Error('sending request has failed: AbortError')),
          );
        }),
    ),
  };
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('probeManager (dev build)', () => {
  it('resolves when the manager answers', async () => {
    const client = {
      requestTimeout: 30_000,
      get_manager_version: vi.fn().mockResolvedValue('26.9.0'),
    };
    await expect(probeManager(client)).resolves.toBeUndefined();
    expect(escapeLoginProbe()).toBe(false);
  });

  it('keeps the client-wide deadline and rejects with the request error', async () => {
    const client = makeHangingClient();
    const settled = probeManager(client).then(
      () => 'resolved',
      (err: unknown) => err,
    );
    await vi.advanceTimersByTimeAsync(client.requestTimeout - 1);
    expect(escapeLoginProbe()).toBe(true); // still in flight — and abort it
    expect(await settled).toBeInstanceOf(LoginProbeCancelledError);
  });

  it('times out with the request error, not the escape error', async () => {
    const client = makeHangingClient();
    const settled = probeManager(client).then(
      () => 'resolved',
      (err: unknown) => err,
    );
    await vi.advanceTimersByTimeAsync(client.requestTimeout);
    const err = await settled;
    expect(err).toBeInstanceOf(Error);
    expect(err).not.toBeInstanceOf(LoginProbeCancelledError);
    expect(escapeLoginProbe()).toBe(false);
  });
});

const cfg = {} as LoginConfigState;

describe('connectViaGQL — keypair query rejects (FR-3998)', () => {
  afterEach(() => {
    delete (globalThis as Record<string, unknown>).backendaiclient;
  });

  const refusal = { isError: true, statusCode: 401, message: 'not allowed' };

  // The bootstrap goes through the login Relay environment, which signs
  // and sends with these two client methods.
  const failingClient = (
    failure: unknown,
    logout: ReturnType<typeof vi.fn>,
  ) => ({
    newSignedRequest: vi.fn(() => ({})),
    _wrapWithPromise: vi.fn().mockRejectedValue(failure),
    isManagerVersionCompatibleWith: () => true,
    logout,
  });

  it('logs out and rethrows a 401 refusal as a session failure', async () => {
    const logout = vi.fn().mockResolvedValue(undefined);
    const client = failingClient(refusal, logout);

    await expect(connectViaGQL(client, cfg, [])).rejects.toBeInstanceOf(
      SessionAuthFailureError,
    );
    expect(logout).toHaveBeenCalledTimes(1);
  });

  it("carries the manager's text, the IP-block one included", async () => {
    const logout = vi.fn().mockResolvedValue(undefined);
    await expect(
      connectViaGQL(failingClient(refusal, logout), cfg, []),
    ).rejects.toThrow('not allowed');

    const ipBlocked = {
      isError: true,
      statusCode: 401,
      description: '10.0.0.1 is not allowed IP address',
    };
    await expect(
      connectViaGQL(failingClient(ipBlocked, logout), cfg, []),
    ).rejects.toThrow('10.0.0.1 is not allowed IP address');
  });

  it('rethrows the refusal when the cleanup logout also rejects', async () => {
    const client = failingClient(
      refusal,
      vi.fn().mockRejectedValue(new Error('401 Unauthorized')),
    );

    await expect(connectViaGQL(client, cfg, [])).rejects.toBeInstanceOf(
      SessionAuthFailureError,
    );
  });

  it('keeps the session when the query fails without a refusal', async () => {
    const timeout = { isError: true, statusCode: 408, message: 'Timeout' };
    const logout = vi.fn().mockResolvedValue(undefined);
    const client = failingClient(timeout, logout);

    await expect(connectViaGQL(client, cfg, [])).rejects.toBeInstanceOf(
      LoginBootstrapIncompleteError,
    );
    await expect(connectViaGQL(client, cfg, [])).rejects.toMatchObject({
      cause: { statusCode: 408 },
    });
    expect(logout).not.toHaveBeenCalled();
  });

  it('keeps the session when the manager fails to resolve the identity', async () => {
    const logout = vi.fn().mockResolvedValue(undefined);
    const client = {
      newSignedRequest: vi.fn(() => ({})),
      _wrapWithPromise: vi.fn().mockResolvedValue({
        data: { keypair: null, user: null, groups: null },
        errors: [{ message: 'database is unavailable', path: ['keypair'] }],
      }),
      isManagerVersionCompatibleWith: () => true,
      logout,
    };

    await expect(connectViaGQL(client, cfg, [])).rejects.toBeInstanceOf(
      LoginBootstrapIncompleteError,
    );
    await expect(connectViaGQL(client, cfg, [])).rejects.toThrow(
      'database is unavailable',
    );
    expect(logout).not.toHaveBeenCalled();
  });
});

describe('connectViaGQL — act-as tab (FR-4111)', () => {
  afterEach(() => {
    const g = globalThis as Record<string, unknown>;
    delete g.backendaiclient;
    delete g.backendaiutils;
    delete g.backendaioptions;
  });

  const refusal = { isError: true, statusCode: 401, message: 'not allowed' };

  const actAsClient = (wrapWithPromise: ReturnType<typeof vi.fn>) => ({
    actAsUserId: 'target-uuid',
    newSignedRequest: vi.fn(() => ({})),
    _wrapWithPromise: wrapWithPromise,
    isManagerVersionCompatibleWith: () => true,
    logout: vi.fn().mockResolvedValue(undefined),
  });

  it('never logs out the shared session on a refusal', async () => {
    const client = actAsClient(vi.fn().mockRejectedValue(refusal));

    await expect(connectViaGQL(client, cfg, [])).rejects.toBeInstanceOf(
      SessionAuthFailureError,
    );
    expect(client.logout).not.toHaveBeenCalled();
  });

  it('never logs out the shared session when the keypair is missing', async () => {
    const client = actAsClient(
      vi.fn().mockResolvedValue({
        data: { keypair: null, user: null, groups: null },
      }),
    );

    await expect(connectViaGQL(client, cfg, [])).rejects.toThrow(
      'Keypair information is missing.',
    );
    expect(client.logout).not.toHaveBeenCalled();
  });

  it("adopts the target's access key over the webserver session's", async () => {
    const g = globalThis as Record<string, unknown>;
    g.backendaiutils = { _readRecentProjectGroup: () => '' };
    g.backendaioptions = { set: vi.fn() };
    const client = {
      ...actAsClient(
        vi.fn().mockResolvedValue({
          data: {
            keypair: {
              id: 'KeyPair:TARGET_KEY',
              user_id: 'target@example.test',
              resource_policy: 'default',
              user: 'target-uuid',
              access_key: 'TARGET_KEY',
            },
            user: {
              id: 'User:target-uuid',
              username: 'target',
              email: 'target@example.test',
              full_name: 'Target',
              is_active: true,
              uuid: 'target-uuid',
              role: 'user',
              domain_name: 'default',
              groups: [{ name: 'p', id: 'p-id' }],
              need_password_change: false,
            },
            groups: [
              { id: 'p-id', name: 'p', description: null, is_active: true },
            ],
          },
        }),
      ),
      _config: { _accessKey: 'ADMIN_KEY', endpoint: 'https://example.test' },
    };

    await connectViaGQL(client, cfg, ['https://example.test']);
    expect(client._config._accessKey).toBe('TARGET_KEY');
  });
});
