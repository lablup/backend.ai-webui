/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  LOGIN_BOOTSTRAP_QUERY,
  isSessionAuthFailure,
  probeLoginSession,
} from './loginBootstrap';
import { describe, expect, it, vi } from 'vitest';

const bootstrap = {
  keypair: {
    access_key: 'AKIATEST',
    user_id: 'user@example.com',
    resource_policy: 'default',
    user: 'uuid-1',
  },
  user: null,
  groups: [],
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
  return {
    queryEnvelope: vi.fn().mockResolvedValue({ data: bootstrap }),
    adoptLoginSession: vi.fn().mockReturnValue(true),
    check_login: vi.fn().mockResolvedValue(true),
    ...overrides,
  };
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
  it('returns the bootstrap and adopts the session in one query', async () => {
    const client = makeClient();
    await expect(probeLoginSession(client)).resolves.toBe(bootstrap);
    expect(client.queryEnvelope).toHaveBeenCalledTimes(1);
    expect(client.queryEnvelope).toHaveBeenCalledWith(
      LOGIN_BOOTSTRAP_QUERY,
      null,
    );
    expect(client.adoptLoginSession).toHaveBeenCalledWith('AKIATEST');
    expect(client.check_login).not.toHaveBeenCalled();
  });

  it('returns null for a session the webserver does not hold', async () => {
    const client = makeClient({
      queryEnvelope: vi.fn().mockRejectedValue(authFailed),
    });
    await expect(probeLoginSession(client)).resolves.toBeNull();
    expect(client.adoptLoginSession).not.toHaveBeenCalled();
    expect(client.check_login).not.toHaveBeenCalled();
  });

  it('returns null when the router wraps the manager 401 in a 200', async () => {
    const client = makeClient({
      queryEnvelope: vi.fn().mockResolvedValue(routerAuthFailed),
    });
    await expect(probeLoginSession(client)).resolves.toBeNull();
    expect(client.adoptLoginSession).not.toHaveBeenCalled();
    expect(client.check_login).not.toHaveBeenCalled();
  });

  it('rethrows failures that are not an auth refusal', async () => {
    const boom = { isError: true, statusCode: 502 };
    const client = makeClient({
      queryEnvelope: vi.fn().mockRejectedValue(boom),
    });
    await expect(probeLoginSession(client)).rejects.toBe(boom);
  });

  it('falls back to check_login when the session id is not known locally', async () => {
    const client = makeClient({
      adoptLoginSession: vi.fn().mockReturnValue(false),
    });
    await expect(probeLoginSession(client)).resolves.toBe(bootstrap);
    expect(client.check_login).toHaveBeenCalledTimes(1);
  });
});
