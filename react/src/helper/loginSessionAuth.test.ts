/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { LoginConfigState } from './loginConfig';
import {
  KeypairUnavailableError,
  connectViaGQL,
  isKeypairUnavailableError,
} from './loginSessionAuth';
import { afterEach, describe, expect, test, vi } from 'vitest';

vi.mock('../hooks/useWebUIConfig', () => ({
  __esModule: true,
  fetchAndParseConfig: vi.fn(),
}));

vi.mock('./loginConfig', () => ({
  __esModule: true,
  applyConfigToClient: vi.fn(),
}));

const cfg = {} as LoginConfigState;

afterEach(() => {
  delete (globalThis as Record<string, unknown>).backendaiclient;
  vi.clearAllMocks();
});

describe('connectViaGQL — empty keypair (FR-3998)', () => {
  test('logs out and throws KeypairUnavailableError when the keypair query returns nothing', async () => {
    const logout = vi.fn().mockResolvedValue(undefined);
    const client = {
      query: vi.fn().mockResolvedValue({ keypair: null }),
      logout,
    };

    await expect(connectViaGQL(client, cfg, [])).rejects.toBeInstanceOf(
      KeypairUnavailableError,
    );
    expect(logout).toHaveBeenCalledTimes(1);
  });

  test('still throws KeypairUnavailableError when the cleanup logout rejects', async () => {
    // API-key mode has no webserver session, so `POST /server/logout` can
    // reject — the classification must survive it.
    const client = {
      query: vi.fn().mockResolvedValue({ keypair: null }),
      logout: vi.fn().mockRejectedValue(new Error('401 Unauthorized')),
    };

    await expect(connectViaGQL(client, cfg, [])).rejects.toBeInstanceOf(
      KeypairUnavailableError,
    );
  });

  test('the thrown error is recognizable across module boundaries', async () => {
    const client = {
      query: vi.fn().mockResolvedValue({ keypair: null }),
      logout: vi.fn().mockResolvedValue(undefined),
    };

    const error = await connectViaGQL(client, cfg, []).catch((e) => e);

    // The classifiers duck-type on the marker rather than `instanceof`, so a
    // structurally identical copy (HMR, mocked import) must classify the same.
    expect(isKeypairUnavailableError(error)).toBe(true);
    expect(
      isKeypairUnavailableError({ ...error, isKeypairUnavailable: true }),
    ).toBe(true);
    expect(isKeypairUnavailableError(new Error('something else'))).toBe(false);
    expect(isKeypairUnavailableError(null)).toBe(false);
  });
});

describe('connectViaGQL — keypair query rejects (FR-3998)', () => {
  const serverError = {
    isError: true,
    type: 'https://api.backend.ai/probs/auth-failed',
    statusCode: 401,
    title: '401 Unauthorized - Credential/signature mismatch.',
    msg: "'10.42.22.120' is not allowed IP address",
    message:
      "server responded failure: 401 Unauthorized - '10.42.22.120' is not allowed IP address",
    description: "'10.42.22.120' is not allowed IP address",
  };

  test('logs out once and rethrows the server error unchanged', async () => {
    const logout = vi.fn().mockResolvedValue(undefined);
    const client = { query: vi.fn().mockRejectedValue(serverError), logout };

    const error = await connectViaGQL(client, cfg, []).catch((e) => e);

    expect(error).toBe(serverError);
    expect(isKeypairUnavailableError(error)).toBe(false);
    expect(logout).toHaveBeenCalledTimes(1);
  });

  test('rethrows the server error when the cleanup logout also rejects', async () => {
    const client = {
      query: vi.fn().mockRejectedValue(serverError),
      logout: vi.fn().mockRejectedValue(new Error('401 Unauthorized')),
    };

    await expect(connectViaGQL(client, cfg, [])).rejects.toBe(serverError);
  });

  test('keeps the session when the query fails without a server refusal', async () => {
    const timeout = { isError: true, statusCode: 408, message: 'Timeout' };
    const logout = vi.fn().mockResolvedValue(undefined);
    const client = { query: vi.fn().mockRejectedValue(timeout), logout };

    await expect(connectViaGQL(client, cfg, [])).rejects.toBe(timeout);
    expect(logout).not.toHaveBeenCalled();
  });
});
