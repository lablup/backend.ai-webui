/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  LoginProbeCancelledError,
  escapeLoginProbe,
  probeManager,
} from './loginSessionAuth';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

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
