/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { BackendAIClient } from '../hooks';
import {
  LoginBootstrapIncompleteError,
  isSessionAuthFailure,
  loginBootstrapVariables,
  refusalDetail,
  probeLoginSession,
} from './loginBootstrap';
import { describe, expect, it, vi } from 'vitest';

// A full response for the bootstrap document, as the manager returns it.
const bootstrap = {
  myUserV2: {
    id: 'UserV2:uuid-1',
    entityId: 'uuid-1',
    basicInfo: { email: 'user@example.com', fullName: 'Test User' },
    organization: { domainName: 'default', role: 'USER' },
    domain: { entityId: 'domain-1', basicInfo: { name: 'default' } },
    defaultProject: {
      edges: [
        {
          node: {
            id: 'ProjectV2:p-1',
            entityId: 'p-1',
            basicInfo: { name: 'default' },
          },
        },
      ],
    },
  },
  myAppConfigs: [],
};

// The shape `_wrapWithPromise` throws for a webserver 401.
const authFailed = {
  isError: true,
  statusCode: 401,
  response: {
    type: 'https://api.backend.ai/probs/auth-failed',
    title: 'Unauthorized access',
  },
};

// The GraphQL router's shape for the same refusal: HTTP 200, the manager's
// 401 wrapped per subgraph field, every root field null.
const routerAuthFailed = {
  data: { myUserV2: null, myAppConfigs: null },
  errors: ['myUserV2', 'myAppConfigs'].map((field) => ({
    message: 'Unexpected empty "data" and "errors" fields in result: …',
    path: [field],
    extensions: {
      code: 'DOWNSTREAM_SERVICE_ERROR',
      serviceName: 'graphene',
      response: {
        status: 401,
        statusText: 'Unauthorized',
        body: { type: 'https://api.backend.ai/probs/auth-failed' },
      },
    },
  })),
};

function makeClient(overrides: Record<string, unknown> = {}) {
  const client = {
    newSignedRequest: vi.fn((method: string, path: string, body: unknown) => ({
      method,
      path,
      body,
    })),
    _wrapWithPromise: vi.fn().mockResolvedValue({ data: bootstrap }),
    _config: { endpointHost: 'api.example.com' },
    // A real method that reads `this`, as the client's own does.
    _managerVersion: '26.9.0',
    isManagerVersionCompatibleWith(this: { _managerVersion: string }) {
      return this._managerVersion !== '';
    },
    check_login: vi.fn().mockResolvedValue(true),
    get_manager_version: vi.fn().mockResolvedValue('26.10.0'),
    ...overrides,
  };
  return client as typeof client & BackendAIClient;
}

describe('isSessionAuthFailure', () => {
  it('recognises the webserver 401 by status and by problem type', () => {
    expect(isSessionAuthFailure(authFailed)).toBe(true);
    expect(isSessionAuthFailure({ statusCode: 401 })).toBe(true);
    expect(
      isSessionAuthFailure({
        statusCode: 500,
        response: { type: 'https://api.backend.ai/probs/auth-failed' },
      }),
    ).toBe(true);
  });

  it('recognises the router envelope that wraps the manager 401', () => {
    expect(isSessionAuthFailure(routerAuthFailed)).toBe(true);
  });

  it('does not mistake one refused subgraph on a live session for a refusal', () => {
    expect(
      isSessionAuthFailure({
        data: { myUserV2: bootstrap.myUserV2, myAppConfigs: null },
        errors: routerAuthFailed.errors.slice(1),
      }),
    ).toBe(false);
  });

  it('leaves every other failure alone', () => {
    expect(isSessionAuthFailure({ statusCode: 500 })).toBe(false);
    expect(
      isSessionAuthFailure({
        data: bootstrap,
        errors: [{ message: 'field error', extensions: { code: 'BAD' } }],
      }),
    ).toBe(false);
    expect(isSessionAuthFailure(new Error('network'))).toBe(false);
    expect(isSessionAuthFailure(null)).toBe(false);
  });
});

describe('loginBootstrapVariables', () => {
  it('reads the remembered project from the client before the global client is set', async () => {
    const g = globalThis as any;
    const saved = {
      backendaiclient: g.backendaiclient,
      backendaioptions: g.backendaioptions,
      backendaimetadata: g.backendaimetadata,
      tasker: g.tasker,
      backendaiutils: g.backendaiutils,
    };
    try {
      const { backendaiUtils } = await import('../global-stores');
      const get = vi.fn((key: string) =>
        key === 'projectGroup.api_example_com' ? 'my-project' : null,
      );
      g.backendaiclient = undefined;
      g.backendaioptions = { get };
      g.backendaiutils = backendaiUtils;
      expect(loginBootstrapVariables(makeClient())).toEqual({
        recentProjectName: 'my-project',
        hasRecentProject: true,
        needsAccessKey: false,
      });
      expect(get).toHaveBeenCalledWith('projectGroup.api_example_com');
    } finally {
      Object.assign(g, saved);
    }
  });
});

describe('probeLoginSession', () => {
  it('asks login-check first, then sends the bootstrap with the version', async () => {
    const client = makeClient();
    const data = await probeLoginSession(client);
    expect(data?.myUserV2?.basicInfo?.email).toBe('user@example.com');
    expect(client.check_login).toHaveBeenCalledWith({ rethrow: true });
    expect(client.get_manager_version).toHaveBeenCalledTimes(1);
    expect(client._wrapWithPromise).toHaveBeenCalledTimes(1);
    const [method, path, body] = client.newSignedRequest.mock.calls[0];
    expect(method).toBe('POST');
    expect(path).toBe('/admin/gql');
    expect((body as { query: string }).query).toMatch(
      /^query loginBootstrapQuery\b/,
    );
  });

  it('sends nothing more when login-check finds no session', async () => {
    const client = makeClient({
      check_login: vi.fn().mockResolvedValue(false),
    });
    await expect(probeLoginSession(client)).resolves.toBeNull();
    expect(client._wrapWithPromise).not.toHaveBeenCalled();
    expect(client.get_manager_version).not.toHaveBeenCalled();
  });

  it('holds the bootstrap and the version until the manager is reachable', async () => {
    const client = makeClient();
    let markReachable!: () => void;
    const reachable = new Promise<void>((resolve) => {
      markReachable = resolve;
    });
    const probe = probeLoginSession(client, reachable);
    await vi.waitFor(() => expect(client.check_login).toHaveBeenCalled());
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(client._wrapWithPromise).not.toHaveBeenCalled();
    expect(client.get_manager_version).not.toHaveBeenCalled();
    markReachable();
    await expect(probe).resolves.toMatchObject({
      myUserV2: { entityId: 'uuid-1' },
    });
    expect(client._wrapWithPromise).toHaveBeenCalledTimes(1);
    expect(client.get_manager_version).toHaveBeenCalledTimes(1);
  });

  it('rejects with the reachability failure and sends nothing more', async () => {
    const client = makeClient();
    const down = Object.assign(new Error('Gateway Timeout'), {
      isError: true,
      statusCode: 504,
    });
    await expect(probeLoginSession(client, Promise.reject(down))).rejects.toBe(
      down,
    );
    expect(client._wrapWithPromise).not.toHaveBeenCalled();
    expect(client.get_manager_version).not.toHaveBeenCalled();
  });

  it('does not read an unreachable manager as no session', async () => {
    const client = makeClient();
    await expect(
      probeLoginSession(client, Promise.reject(authFailed)),
    ).rejects.toBe(authFailed);
  });

  it('ignores reachability when login-check finds no session', async () => {
    const client = makeClient({
      check_login: vi.fn().mockResolvedValue(false),
    });
    const reachable = new Promise<void>(() => {});
    await expect(probeLoginSession(client, reachable)).resolves.toBeNull();
    expect(client._wrapWithPromise).not.toHaveBeenCalled();
    expect(client.get_manager_version).not.toHaveBeenCalled();
  });

  it('returns null when login-check is refused', async () => {
    const client = makeClient({
      check_login: vi.fn().mockRejectedValue(authFailed),
    });
    await expect(probeLoginSession(client)).resolves.toBeNull();
    expect(client._wrapWithPromise).not.toHaveBeenCalled();
  });

  it('reports a login-check HTTP failure that is not a refusal as incomplete', async () => {
    const boom = { isError: true, statusCode: 502, message: 'bad gateway' };
    const client = makeClient({
      check_login: vi.fn().mockRejectedValue(boom),
    });
    await expect(probeLoginSession(client)).rejects.toBeInstanceOf(
      LoginBootstrapIncompleteError,
    );
    await expect(probeLoginSession(client)).rejects.toThrow('bad gateway');
  });

  it('rethrows a login-check failure that carries no HTTP status', async () => {
    const network = new Error('sending request has failed');
    const client = makeClient({
      check_login: vi.fn().mockRejectedValue(network),
    });
    await expect(probeLoginSession(client)).rejects.toBe(network);
  });

  it('returns null for a session the webserver dropped after login-check', async () => {
    const client = makeClient({
      _wrapWithPromise: vi.fn().mockRejectedValue(authFailed),
    });
    await expect(probeLoginSession(client)).resolves.toBeNull();
  });

  it('returns null when the router wraps the manager 401 in a 200', async () => {
    const client = makeClient({
      _wrapWithPromise: vi.fn().mockResolvedValue(routerAuthFailed),
    });
    await expect(probeLoginSession(client)).resolves.toBeNull();
  });

  it('reports an HTTP failure of the bootstrap as incomplete', async () => {
    const boom = { isError: true, statusCode: 502, message: 'bad gateway' };
    const client = makeClient({
      _wrapWithPromise: vi.fn().mockRejectedValue(boom),
    });
    await expect(probeLoginSession(client)).rejects.toBeInstanceOf(
      LoginBootstrapIncompleteError,
    );
  });

  it('reports a manager version failure as incomplete', async () => {
    const client = makeClient({
      get_manager_version: vi
        .fn()
        .mockRejectedValue({ isError: true, statusCode: 503 }),
    });
    await expect(probeLoginSession(client)).rejects.toBeInstanceOf(
      LoginBootstrapIncompleteError,
    );
  });

  it('reports a router-wrapped manager 5xx as incomplete', async () => {
    const client = makeClient({
      _wrapWithPromise: vi.fn().mockResolvedValue({
        data: { myUserV2: null, myAppConfigs: null },
        errors: [
          {
            message: 'upstream failed',
            extensions: {
              response: { status: 500, body: { msg: 'manager exploded' } },
            },
          },
        ],
      }),
    });
    await expect(probeLoginSession(client)).rejects.toBeInstanceOf(
      LoginBootstrapIncompleteError,
    );
    await expect(probeLoginSession(client)).rejects.toThrow('manager exploded');
  });

  it('rejects when the identity fails to resolve', async () => {
    const client = makeClient({
      _wrapWithPromise: vi.fn().mockResolvedValue({
        data: { myUserV2: null, myAppConfigs: [] },
        errors: [{ message: 'resolver failed', path: ['myUserV2'] }],
      }),
    });
    await expect(probeLoginSession(client)).rejects.toBeInstanceOf(
      LoginBootstrapIncompleteError,
    );
  });

  it('accepts a bootstrap whose app configs alone failed', async () => {
    const client = makeClient({
      _wrapWithPromise: vi.fn().mockResolvedValue({
        data: { ...bootstrap, myAppConfigs: null },
        errors: [{ message: 'configs failed', path: ['myAppConfigs'] }],
      }),
    });
    await expect(probeLoginSession(client)).resolves.toMatchObject({
      myUserV2: { entityId: 'uuid-1' },
    });
  });
});

describe('refusalDetail', () => {
  const authorizationError = (cause: unknown, description?: string) =>
    Object.assign(new Error('GraphQL Authorization Error'), {
      name: 'AuthorizationError',
      description,
      cause,
    });

  it("reads the manager's text through the AuthorizationError wrapper", () => {
    expect(
      refusalDetail(
        authorizationError({
          isError: true,
          statusCode: 401,
          message: 'not allowed',
        }),
      ),
    ).toBe('not allowed');
  });

  it('keeps the IP-block text the wrapper carries', () => {
    expect(
      refusalDetail(
        authorizationError(
          { isError: true, statusCode: 401 },
          '10.0.0.1 is not allowed IP address',
        ),
      ),
    ).toBe('10.0.0.1 is not allowed IP address');
  });

  it('is empty when no layer carries any text', () => {
    expect(refusalDetail(authorizationError(undefined))).toBe('');
  });
});
