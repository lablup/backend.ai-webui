/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { LoginConfigState } from './loginConfig';
import { connectViaGQL } from './loginSessionAuth';
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

describe('connectViaGQL — keypair query rejects (FR-3998)', () => {
  const refusal = { isError: true, statusCode: 401, message: 'not allowed' };

  test('logs out and rethrows a 401 refusal unchanged', async () => {
    const logout = vi.fn().mockResolvedValue(undefined);
    const client = { query: vi.fn().mockRejectedValue(refusal), logout };

    await expect(connectViaGQL(client, cfg, [])).rejects.toBe(refusal);
    expect(logout).toHaveBeenCalledTimes(1);
  });

  test('rethrows the refusal when the cleanup logout also rejects', async () => {
    const client = {
      query: vi.fn().mockRejectedValue(refusal),
      logout: vi.fn().mockRejectedValue(new Error('401 Unauthorized')),
    };

    await expect(connectViaGQL(client, cfg, [])).rejects.toBe(refusal);
  });

  test('keeps the session when the query fails without a refusal', async () => {
    const timeout = { isError: true, statusCode: 408, message: 'Timeout' };
    const logout = vi.fn().mockResolvedValue(undefined);
    const client = { query: vi.fn().mockRejectedValue(timeout), logout };

    await expect(connectViaGQL(client, cfg, [])).rejects.toBe(timeout);
    expect(logout).not.toHaveBeenCalled();
  });
});
