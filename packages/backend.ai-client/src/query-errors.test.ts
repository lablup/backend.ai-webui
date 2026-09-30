import { Client, ClientConfig } from './index';
import { describe, expect, it, vi } from 'vitest';

const makeClient = (result: unknown) => {
  const client = new Client(
    new ClientConfig('AKTEST', 'SKTEST', 'https://example.com'),
    'query-errors-test',
  );
  vi.spyOn(client, '_wrapWithPromise').mockResolvedValue(result);
  return client;
};

// Captured from a GraphQL gateway that wraps the manager's 401 into a 200.
const gatewayIpRejection = {
  errors: [
    {
      message:
        'Unexpected empty "data" and "errors" fields in result: {"type": "https://api.backend.ai/probs/auth-failed"}',
      path: ['keypair'],
      extensions: {
        request: {
          method: 'POST',
          body: { query: '{keypair{user_id resource_policy user}}' },
        },
        response: {
          status: 401,
          statusText: 'Unauthorized',
          body: {
            type: 'https://api.backend.ai/probs/auth-failed',
            title: 'Credential/signature mismatch.',
            error_code: 'user_auth_unauthorized',
            msg: "'10.42.22.120' is not allowed IP address",
          },
        },
        code: 'RESPONSE_VALIDATION_FAILED',
        serviceName: 'graphene',
      },
    },
  ],
  data: { keypair: null },
};

describe('Client.query GraphQL errors', () => {
  it('throws the upstream HTTP error a gateway wrapped into a 200', async () => {
    const client = makeClient(gatewayIpRejection);
    const error = await client
      .query('query { keypair { user_id } }', {})
      .catch((e: unknown) => e);
    expect(error).toMatchObject({
      isError: true,
      statusCode: 401,
      statusText: 'Unauthorized',
      type: 'https://api.backend.ai/probs/auth-failed',
      title: '401 Unauthorized - Credential/signature mismatch.',
      error_code: 'user_auth_unauthorized',
      msg: "'10.42.22.120' is not allowed IP address",
      message:
        "server responded failure: 401 Unauthorized - '10.42.22.120' is not allowed IP address",
      description: "'10.42.22.120' is not allowed IP address",
      response: gatewayIpRejection,
    });
  });

  it('returns data when some root fields resolved despite errors', async () => {
    const data = { keypair: { user_id: 'u' }, user: null };
    const client = makeClient({
      errors: [{ message: 'user: permission denied', path: ['user'] }],
      data,
    });
    await expect(client.query('query { keypair user }', {})).resolves.toBe(
      data,
    );
  });

  it('throws a graphql-error when errors carry no upstream response', async () => {
    const client = makeClient({
      errors: [{ message: 'Cannot query field "nope" on type "Query".' }],
      data: null,
    });
    await expect(client.query('query { nope }', {})).rejects.toMatchObject({
      isError: true,
      type: 'https://api.backend.ai/probs/graphql-error',
      title: 'Cannot query field "nope" on type "Query".',
      message: 'Cannot query field "nope" on type "Query".',
      description: 'Cannot query field "nope" on type "Query".',
    });
  });

  it('returns data unchanged when there are no errors', async () => {
    const client = makeClient({ data: { keypair: null } });
    await expect(client.query('query { keypair }', {})).resolves.toEqual({
      keypair: null,
    });
  });
});
