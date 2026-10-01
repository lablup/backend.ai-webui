/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { SessionAuthFailureError } from './loginBootstrap';
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

    await expect(connectViaGQL(client, cfg, [])).rejects.toMatchObject({
      statusCode: 408,
    });
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

  it('never logs out the shared session on a refusal', async () => {
    const logout = vi.fn().mockResolvedValue(undefined);
    const client = {
      actAsUserId: 'target-uuid',
      query: vi.fn().mockRejectedValue(refusal),
      logout,
    };

    await expect(connectViaGQL(client, cfg, [])).rejects.toBe(refusal);
    expect(logout).not.toHaveBeenCalled();
  });

  it('never logs out the shared session when the keypair is missing', async () => {
    const logout = vi.fn().mockResolvedValue(undefined);
    const client = {
      actAsUserId: 'target-uuid',
      query: vi.fn().mockResolvedValue({ keypair: null }),
      logout,
    };

    await expect(connectViaGQL(client, cfg, [])).rejects.toThrow(
      'Keypair information is missing.',
    );
    expect(logout).not.toHaveBeenCalled();
  });

  it("adopts the target's access key over the webserver session's", async () => {
    const g = globalThis as Record<string, unknown>;
    g.backendaiutils = { _readRecentProjectGroup: () => '' };
    g.backendaioptions = { set: vi.fn() };
    const client = {
      actAsUserId: 'target-uuid',
      _config: { _accessKey: 'ADMIN_KEY', endpoint: 'https://example.test' },
      query: vi
        .fn()
        .mockResolvedValueOnce({
          keypair: {
            user_id: 'target@example.test',
            resource_policy: 'default',
            user: 'target-uuid',
            access_key: 'TARGET_KEY',
          },
        })
        .mockResolvedValueOnce({
          user: {
            email: 'target@example.test',
            uuid: 'target-uuid',
            role: 'user',
            domain_name: 'default',
            groups: [{ name: 'p', id: 'p-id' }],
          },
        }),
      group: {
        list: vi
          .fn()
          .mockResolvedValue({ groups: [{ name: 'p', id: 'p-id' }] }),
      },
      logout: vi.fn(),
    };

    await connectViaGQL(client, cfg, ['https://example.test']);
    expect(client._config._accessKey).toBe('TARGET_KEY');
  });
});
