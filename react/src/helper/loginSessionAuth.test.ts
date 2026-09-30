/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
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

  it('logs out and rethrows a 401 refusal unchanged', async () => {
    const logout = vi.fn().mockResolvedValue(undefined);
    const client = { query: vi.fn().mockRejectedValue(refusal), logout };

    await expect(connectViaGQL(client, cfg, [])).rejects.toBe(refusal);
    expect(logout).toHaveBeenCalledTimes(1);
  });

  it('rethrows the refusal when the cleanup logout also rejects', async () => {
    const client = {
      query: vi.fn().mockRejectedValue(refusal),
      logout: vi.fn().mockRejectedValue(new Error('401 Unauthorized')),
    };

    await expect(connectViaGQL(client, cfg, [])).rejects.toBe(refusal);
  });

  it('keeps the session when the query fails without a refusal', async () => {
    const timeout = { isError: true, statusCode: 408, message: 'Timeout' };
    const logout = vi.fn().mockResolvedValue(undefined);
    const client = { query: vi.fn().mockRejectedValue(timeout), logout };

    await expect(connectViaGQL(client, cfg, [])).rejects.toBe(timeout);
    expect(logout).not.toHaveBeenCalled();
  });
});
