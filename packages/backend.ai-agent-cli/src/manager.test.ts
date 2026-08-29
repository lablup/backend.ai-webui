import { fetchWhoAmI, gqlRequest, isAuthFailure } from './manager.js';
import { describe, expect, it, vi } from 'vitest';

const SESSION = {
  endpoint: 'http://manager.example.com:8090',
  sessionId: 'abcdefghijklmnopqrstuvwxyz012345',
};

/**
 * The shape the webserver actually returns for a dead session: HTTP 200 with
 * the manager's 401 wrapped in GraphQL `errors[]` (captured against a live
 * 26.9 manager).
 */
const DEAD_SESSION_BODY = {
  errors: [
    {
      message:
        'Unexpected empty "data" and "errors" fields in result: {"type":"https://api.backend.ai/probs/auth-failed","title":"Credential/signature mismatch.","error_code":"user_auth_unauthorized","msg":"Unauthorized access"}',
      path: ['user'],
      extensions: {
        response: {
          status: 401,
          body: { error_code: 'user_auth_unauthorized' },
        },
      },
    },
  ],
  data: { user: null },
};

const jsonResponse = (status: number, body: unknown) =>
  vi.fn(
    async () => new Response(JSON.stringify(body), { status }),
  ) as unknown as typeof fetch;

describe('isAuthFailure', () => {
  it('treats a bare 401 as an auth failure', () => {
    expect(isAuthFailure(401, {})).toBe(true);
  });

  it('treats a 200 carrying user_auth_unauthorized as an auth failure', () => {
    expect(isAuthFailure(200, DEAD_SESSION_BODY)).toBe(true);
  });

  it('treats a top-level problem document as an auth failure', () => {
    expect(
      isAuthFailure(200, {
        type: 'https://api.backend.ai/probs/auth-failed',
        title: 'Credential/signature mismatch.',
        error_code: 'user_auth_unauthorized',
      }),
    ).toBe(true);
  });

  it('leaves an ordinary GraphQL error alone', () => {
    expect(
      isAuthFailure(200, {
        errors: [{ message: 'Cannot query field "nope"' }],
      }),
    ).toBe(false);
    expect(isAuthFailure(200, { data: { user: { email: 'a@b.c' } } })).toBe(
      false,
    );
  });
});

describe('gqlRequest', () => {
  it('sends the SESSION-mode headers the WebUI sends', async () => {
    const fetchImpl = jsonResponse(200, { data: { ok: true } });

    await gqlRequest(SESSION, { query: 'query { ok }' }, { fetchImpl });

    const [url, init] = (fetchImpl as unknown as ReturnType<typeof vi.fn>).mock
      .calls[0] as [string, RequestInit];
    expect(url).toBe(`${SESSION.endpoint}/func/admin/gql`);
    const headers = init.headers as Record<string, string>;
    expect(headers['X-BackendAI-SessionID']).toBe(SESSION.sessionId);
    expect(headers['X-BackendAI-Version']).toBe('v8.20240915');
    expect(headers['X-BackendAI-Date']).toBeTruthy();
    expect(JSON.parse(String(init.body))).toEqual({
      query: 'query { ok }',
      variables: {},
    });
  });

  it('maps a 401 to auth_required with a login hint', async () => {
    await expect(
      gqlRequest(
        SESSION,
        { query: 'query { ok }' },
        {
          fetchImpl: jsonResponse(401, {
            error_code: 'user_auth_unauthorized',
          }),
        },
      ),
    ).rejects.toMatchObject({
      code: 'auth_required',
      exitCode: 3,
      hint: `bai-agent login --endpoint ${SESSION.endpoint}`,
    });
  });

  it('maps a 200 with user_auth_unauthorized to auth_required', async () => {
    await expect(
      gqlRequest(
        SESSION,
        { query: 'query { ok }' },
        { fetchImpl: jsonResponse(200, DEAD_SESSION_BODY) },
      ),
    ).rejects.toMatchObject({ code: 'auth_required', exitCode: 3 });
  });

  it('surfaces a non-auth GraphQL error as an internal error', async () => {
    await expect(
      gqlRequest(
        SESSION,
        { query: 'query { nope }' },
        {
          fetchImpl: jsonResponse(200, {
            errors: [{ message: 'Cannot query field "nope"' }],
          }),
        },
      ),
    ).rejects.toMatchObject({ code: 'internal' });
  });

  it('turns a transport failure into a reachability error', async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error('ECONNREFUSED');
    }) as unknown as typeof fetch;

    await expect(
      gqlRequest(SESSION, { query: 'query { ok }' }, { fetchImpl }),
    ).rejects.toMatchObject({ code: 'internal' });
  });
});

describe('fetchWhoAmI', () => {
  it('maps the manager fields onto the CLI shape', async () => {
    const fetchImpl = jsonResponse(200, {
      data: {
        user: {
          email: 'admin@lablup.com',
          role: 'superadmin',
          domain_name: 'default',
          full_name: 'Admin Lablu',
          status: 'active',
        },
      },
    });

    await expect(fetchWhoAmI(SESSION, { fetchImpl })).resolves.toEqual({
      email: 'admin@lablup.com',
      role: 'superadmin',
      domainName: 'default',
      fullName: 'Admin Lablu',
      status: 'active',
    });
  });

  it('treats a null user as an auth failure', async () => {
    await expect(
      fetchWhoAmI(SESSION, {
        fetchImpl: jsonResponse(200, { data: { user: null } }),
      }),
    ).rejects.toMatchObject({ code: 'auth_required' });
  });
});
