/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  loginConfigState,
  refreshConfigAfterLogin,
} from '../hooks/useWebUIConfig';
import { applyConfigToClient, type LoginConfigState } from './loginConfig';
import { checkLoginSession, connectViaGQL } from './loginSessionAuth';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('../hooks/useWebUIConfig', async () => {
  const { atom } = await import('jotai');
  return {
    __esModule: true,
    fetchAndParseConfig: vi.fn(),
    refreshConfigAfterLogin: vi.fn().mockResolvedValue('refreshed'),
    loginConfigState: atom<LoginConfigState | null>(null),
  };
});

vi.mock('./loginConfig', () => ({
  __esModule: true,
  applyConfigToClient: vi.fn(),
}));

vi.mock('../components/DefaultProviders', async () => {
  const { createStore } = await import('jotai');
  return {
    __esModule: true,
    jotaiStore: createStore(),
  };
});

const cfg = {} as LoginConfigState;

const versionOk = () => vi.fn().mockResolvedValue('26.4.19');

describe('connectViaGQL — keypair query rejects (FR-3998)', () => {
  afterEach(() => {
    delete (globalThis as Record<string, unknown>).backendaiclient;
  });

  const refusal = { isError: true, statusCode: 401, message: 'not allowed' };

  it('logs out and rethrows a 401 refusal unchanged', async () => {
    const logout = vi.fn().mockResolvedValue(undefined);
    const client = {
      get_manager_version: versionOk(),
      query: vi.fn().mockRejectedValue(refusal),
      logout,
    };

    await expect(connectViaGQL(client, cfg, [])).rejects.toBe(refusal);
    expect(logout).toHaveBeenCalledTimes(1);
  });

  it('rethrows the refusal when the cleanup logout also rejects', async () => {
    const client = {
      get_manager_version: versionOk(),
      query: vi.fn().mockRejectedValue(refusal),
      logout: vi.fn().mockRejectedValue(new Error('401 Unauthorized')),
    };

    await expect(connectViaGQL(client, cfg, [])).rejects.toBe(refusal);
  });

  it('keeps the session when the query fails without a refusal', async () => {
    const timeout = { isError: true, statusCode: 408, message: 'Timeout' };
    const logout = vi.fn().mockResolvedValue(undefined);
    const client = {
      get_manager_version: versionOk(),
      query: vi.fn().mockRejectedValue(timeout),
      logout,
    };

    await expect(connectViaGQL(client, cfg, [])).rejects.toBe(timeout);
    expect(logout).not.toHaveBeenCalled();
  });
});

describe('connectViaGQL — manager version read (#10994)', () => {
  afterEach(() => {
    delete (globalThis as Record<string, unknown>).backendaiclient;
  });

  it('reads the manager version before the first query', async () => {
    const calls: string[] = [];
    const stop = { isError: true, statusCode: 408, message: 'stop here' };
    const client = {
      get_manager_version: vi.fn(async () => {
        calls.push('version');
        return '26.4.19';
      }),
      query: vi.fn(async () => {
        calls.push('query');
        throw stop;
      }),
      logout: vi.fn(),
    };

    await expect(connectViaGQL(client, cfg, [])).rejects.toBe(stop);
    expect(calls).toEqual(['version', 'query']);
  });

  it('logs out when the manager refuses the signed version read', async () => {
    const refusal = { isError: true, statusCode: 401, message: 'auth' };
    const logout = vi.fn().mockResolvedValue(undefined);
    const query = vi.fn();
    const client = {
      get_manager_version: vi.fn().mockRejectedValue(refusal),
      query,
      logout,
    };

    await expect(connectViaGQL(client, cfg, [])).rejects.toBe(refusal);
    expect(query).not.toHaveBeenCalled();
    expect(logout).toHaveBeenCalledTimes(1);
  });

  it('keeps the session when the version read fails with a 5xx', async () => {
    const outage = { isError: true, statusCode: 502, message: 'Bad Gateway' };
    const logout = vi.fn();
    const client = {
      get_manager_version: vi.fn().mockRejectedValue(outage),
      query: vi.fn(),
      logout,
    };

    await expect(connectViaGQL(client, cfg, [])).rejects.toBe(outage);
    expect(logout).not.toHaveBeenCalled();
  });
});

describe('connectViaGQL — post-login config re-fetch (#10912)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  afterEach(() => {
    delete (globalThis as Record<string, unknown>).backendaiclient;
    delete (globalThis as Record<string, unknown>).backendaiutils;
    delete (globalThis as Record<string, unknown>).backendaioptions;
  });

  const successClient = () => ({
    get_manager_version: versionOk(),
    _config: { endpoint: 'https://api.test' },
    query: vi
      .fn()
      .mockResolvedValueOnce({
        keypair: { user_id: 'u', resource_policy: 'p', user: 'uid' },
      })
      .mockResolvedValueOnce({
        user: {
          username: 'u',
          email: 'u@test',
          full_name: 'u',
          is_active: true,
          role: 'user',
          domain_name: 'd',
          groups: [],
          need_password_change: false,
          uuid: 'uid',
        },
      }),
    group: { list: vi.fn().mockResolvedValue({ groups: [] }) },
    logout: vi.fn(),
  });

  it('re-reads config.toml after a successful connect (lablup/backend.ai#16486)', async () => {
    (globalThis as Record<string, unknown>).backendaiutils = {
      _readRecentProjectGroup: vi.fn().mockReturnValue(null),
    };
    (globalThis as Record<string, unknown>).backendaioptions = {
      set: vi.fn(),
    };
    const client = successClient();

    await connectViaGQL(client, cfg, []);

    expect(refreshConfigAfterLogin).toHaveBeenCalledTimes(1);
    // The session endpoint is the webserver Electron re-reads from.
    expect(vi.mocked(refreshConfigAfterLogin).mock.calls[0][2]).toEqual({
      webServerEndpoint: 'https://api.test',
    });
  });

  it('re-applies the refreshed config to the client', async () => {
    (globalThis as Record<string, unknown>).backendaiutils = {
      _readRecentProjectGroup: vi.fn().mockReturnValue(null),
    };
    (globalThis as Record<string, unknown>).backendaioptions = {
      set: vi.fn(),
    };
    const client = successClient();
    // The re-fetch populates the post-login sections into the store.
    vi.mocked(refreshConfigAfterLogin).mockImplementation(
      async (store: any) => {
        store.set(loginConfigState, {
          proxy_url: 'http://refreshed:5050/',
        } as LoginConfigState);
        return 'refreshed';
      },
    );

    await connectViaGQL(client, cfg, []);

    expect(applyConfigToClient).toHaveBeenCalledTimes(2);
    expect(applyConfigToClient).toHaveBeenLastCalledWith(
      expect.objectContaining({
        domain_name: 'd',
        proxy_url: 'http://refreshed:5050/',
      }),
    );
  });

  it('dispatches backend-ai-logout when the re-fetch fails on every attempt', async () => {
    (globalThis as Record<string, unknown>).backendaiutils = {
      _readRecentProjectGroup: vi.fn().mockReturnValue(null),
    };
    (globalThis as Record<string, unknown>).backendaioptions = {
      set: vi.fn(),
    };
    const client = successClient();
    vi.mocked(refreshConfigAfterLogin).mockResolvedValue('failed');

    const logoutEvent = new Promise<CustomEvent>((resolve) => {
      document.addEventListener('backend-ai-logout', resolve as EventListener, {
        once: true,
      });
    });

    await expect(connectViaGQL(client, cfg, [])).resolves.toBeNull();

    const event = await logoutEvent;
    expect(event.type).toBe('backend-ai-logout');
    // applyConfigToClient ran once with the truncated pre-login config; the
    // refreshed re-apply is skipped because the session is being ended.
    expect(applyConfigToClient).toHaveBeenCalledTimes(1);
  });

  it('keeps the session and the pre-login config when there was nothing to re-read', async () => {
    (globalThis as Record<string, unknown>).backendaiutils = {
      _readRecentProjectGroup: vi.fn().mockReturnValue(null),
    };
    (globalThis as Record<string, unknown>).backendaioptions = {
      set: vi.fn(),
    };
    const client = successClient();
    vi.mocked(refreshConfigAfterLogin).mockResolvedValue('unchanged');
    const onLogout = vi.fn();
    document.addEventListener('backend-ai-logout', onLogout);

    try {
      await connectViaGQL(client, cfg, []);
    } finally {
      document.removeEventListener('backend-ai-logout', onLogout);
    }

    expect(onLogout).not.toHaveBeenCalled();
    expect(applyConfigToClient).toHaveBeenCalledTimes(1);
  });

  it('skips the re-fetch when the connect fails before it', async () => {
    const refusal = { isError: true, statusCode: 401, message: 'auth' };
    const client = {
      get_manager_version: versionOk(),
      query: vi.fn().mockRejectedValue(refusal),
      logout: vi.fn().mockResolvedValue(undefined),
    };

    await expect(connectViaGQL(client, cfg, [])).rejects.toBe(refusal);
    expect(refreshConfigAfterLogin).not.toHaveBeenCalled();
  });
});

describe('checkLoginSession', () => {
  afterEach(() => {
    delete (globalThis as Record<string, unknown>).BackendAIClientConfig;
    delete (globalThis as Record<string, unknown>).BackendAIClient;
  });

  const installClient = (client: Record<string, unknown>) => {
    (globalThis as Record<string, unknown>).BackendAIClientConfig = vi.fn();
    (globalThis as Record<string, unknown>).BackendAIClient = vi.fn(
      function () {
        return client;
      },
    );
  };

  it('probes the server anonymously instead of reading its version', async () => {
    const getVersion = vi.fn();
    installClient({
      probeServer: vi.fn().mockResolvedValue(undefined),
      get_manager_version: getVersion,
      check_login: vi.fn().mockResolvedValue({ authenticated: true }),
    });

    await expect(checkLoginSession('https://example.test')).resolves.toBe(true);
    expect(getVersion).not.toHaveBeenCalled();
  });

  it('reports no session when the probe fails', async () => {
    const checkLogin = vi.fn();
    installClient({
      probeServer: vi.fn().mockRejectedValue(new Error('unreachable')),
      check_login: checkLogin,
    });

    await expect(checkLoginSession('https://example.test')).resolves.toBe(
      false,
    );
    expect(checkLogin).not.toHaveBeenCalled();
  });
});
