/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { BackendAIClient } from '../hooks';
import {
  LoginBootstrapIncompleteError,
  isSessionAuthFailure,
  probeLoginSession,
} from './loginBootstrap';
import { describe, expect, it, vi } from 'vitest';

// A full response for the bootstrap document, as the manager returns it.
const bootstrap = {
  keypair: {
    access_key: 'AKIATEST',
    user_id: 'user@example.com',
    resource_policy: 'default',
    user: 'uuid-1',
    id: 'KeyPair:AKIATEST',
  },
  user: {
    username: 'user',
    email: 'user@example.com',
    full_name: 'Test User',
    is_active: true,
    role: 'user',
    domain_name: 'default',
    groups: [{ name: 'default', id: 'g-1' }],
    need_password_change: false,
    uuid: 'uuid-1',
    id: 'User:uuid-1',
  },
  groups: [{ id: 'g-1', name: 'default', description: null, is_active: true }],
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
  data: { keypair: null, user: null, groups: null },
  errors: ['keypair', 'user', 'groups'].map((field) => ({
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
    // A real method that reads `this`, as the client's own does.
    _managerVersion: '26.9.0',
    isManagerVersionCompatibleWith(this: { _managerVersion: string }) {
      return this._managerVersion !== '';
    },
    adoptLoginSession: vi.fn().mockReturnValue(true),
    check_login: vi.fn().mockResolvedValue(true),
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
        data: {
          keypair: bootstrap.keypair,
          user: bootstrap.user,
          groups: null,
        },
        errors: routerAuthFailed.errors.slice(2),
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

describe('probeLoginSession', () => {
  it('sends the compiled bootstrap document once and adopts the session', async () => {
    const client = makeClient();
    const data = await probeLoginSession(client);
    expect(data?.keypair?.access_key).toBe('AKIATEST');
    expect(data?.user?.email).toBe('user@example.com');
    expect(data?.groups?.[0]?.name).toBe('default');
    expect(client._wrapWithPromise).toHaveBeenCalledTimes(1);
    const [method, path, body] = client.newSignedRequest.mock.calls[0];
    expect(method).toBe('POST');
    expect(path).toBe('/admin/gql');
    expect((body as { query: string }).query).toMatch(
      /^query loginBootstrapQuery\b/,
    );
    expect(client.adoptLoginSession).toHaveBeenCalledWith('AKIATEST');
    expect(client.check_login).not.toHaveBeenCalled();
  });

  it('returns null for a session the webserver does not hold', async () => {
    const client = makeClient({
      _wrapWithPromise: vi.fn().mockRejectedValue(authFailed),
    });
    await expect(probeLoginSession(client)).resolves.toBeNull();
    expect(client.adoptLoginSession).not.toHaveBeenCalled();
    expect(client.check_login).not.toHaveBeenCalled();
  });

  it('returns null when the router wraps the manager 401 in a 200', async () => {
    const client = makeClient({
      _wrapWithPromise: vi.fn().mockResolvedValue(routerAuthFailed),
    });
    await expect(probeLoginSession(client)).resolves.toBeNull();
    expect(client.adoptLoginSession).not.toHaveBeenCalled();
    expect(client.check_login).not.toHaveBeenCalled();
  });

  it('reports an HTTP failure that is not a refusal as incomplete', async () => {
    const boom = { isError: true, statusCode: 502, message: 'bad gateway' };
    const client = makeClient({
      _wrapWithPromise: vi.fn().mockRejectedValue(boom),
    });
    await expect(probeLoginSession(client)).rejects.toBeInstanceOf(
      LoginBootstrapIncompleteError,
    );
    await expect(probeLoginSession(client)).rejects.toThrow('bad gateway');
    expect(client.check_login).not.toHaveBeenCalled();
  });

  it('reports a router-wrapped manager 5xx as incomplete', async () => {
    const client = makeClient({
      _wrapWithPromise: vi.fn().mockResolvedValue({
        data: { keypair: null, user: null, groups: null },
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

  it('rethrows a failure that carries no HTTP status', async () => {
    const network = new Error('sending request has failed');
    const client = makeClient({
      _wrapWithPromise: vi.fn().mockRejectedValue(network),
    });
    await expect(probeLoginSession(client)).rejects.toBe(network);
  });

  it('rejects, without asking check_login, when the identity fails to resolve', async () => {
    const client = makeClient({
      _wrapWithPromise: vi.fn().mockResolvedValue({
        data: { keypair: bootstrap.keypair, user: null, groups: null },
        errors: [{ message: 'resolver failed', path: ['user'] }],
      }),
    });
    await expect(probeLoginSession(client)).rejects.toBeInstanceOf(
      LoginBootstrapIncompleteError,
    );
    expect(client.check_login).not.toHaveBeenCalled();
  });

  it('accepts a bootstrap whose groups alone failed', async () => {
    const client = makeClient({
      _wrapWithPromise: vi.fn().mockResolvedValue({
        data: { ...bootstrap, groups: null },
        errors: [{ message: 'groups failed', path: ['groups'] }],
      }),
    });
    await expect(probeLoginSession(client)).resolves.toMatchObject({
      keypair: { access_key: 'AKIATEST' },
      groups: null,
    });
  });

  it('falls back to check_login when the session id is not known locally', async () => {
    const client = makeClient({
      adoptLoginSession: vi.fn().mockReturnValue(false),
    });
    await expect(probeLoginSession(client)).resolves.toMatchObject({
      keypair: { access_key: 'AKIATEST' },
    });
    expect(client.check_login).toHaveBeenCalledTimes(1);
  });

  it('reports no session when the check_login fallback refuses', async () => {
    const client = makeClient({
      adoptLoginSession: vi.fn().mockReturnValue(false),
      check_login: vi.fn().mockResolvedValue(false),
    });
    await expect(probeLoginSession(client)).resolves.toBeNull();
  });
});
