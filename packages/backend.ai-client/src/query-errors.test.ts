import { Client, ClientConfig, gatewayWrappedError } from './index';
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

describe('Client.query GraphQL errors (FR-3998)', () => {
  it('throws the upstream error a gateway wrapped into a 200', async () => {
    const error = await makeClient(gatewayIpRejection)
      .query('{keypair{user_id}}', {})
      .catch((e) => e);

    expect(error).toMatchObject({
      isError: true,
      statusCode: 401,
      type: 'https://api.backend.ai/probs/auth-failed',
      title: 'Credential/signature mismatch.',
      msg: "'10.42.22.120' is not allowed IP address",
      message: "'10.42.22.120' is not allowed IP address",
      description: "'10.42.22.120' is not allowed IP address",
    });
  });

  it('returns data when some root fields resolved despite errors', async () => {
    const data = { a: null, b: { id: 1 } };
    await expect(
      makeClient({ errors: [{ message: 'boom' }], data }).query('{a b}', {}),
    ).resolves.toEqual(data);
  });

  it('returns data unchanged when there are no errors', async () => {
    const data = { keypair: { user_id: 'u' } };
    await expect(
      makeClient({ data }).query('{keypair{user_id}}', {}),
    ).resolves.toEqual(data);
  });
});

describe('gatewayWrappedError (FR-4124)', () => {
  it('carries the upstream status for a gateway-wrapped failure', () => {
    expect(gatewayWrappedError(gatewayIpRejection)?.statusCode).toBe(401);
  });

  it('has no status for a plain GraphQL field error, so Relay keeps it', () => {
    const error = gatewayWrappedError({
      data: { user: null },
      errors: [{ message: 'not found' }],
    });
    expect(error).toMatchObject({ message: 'not found' });
    expect(error?.statusCode).toBeUndefined();
  });

  it('ignores a result without errors', () => {
    expect(gatewayWrappedError({ data: { user: null } })).toBeNull();
    expect(gatewayWrappedError(undefined)).toBeNull();
  });
});
