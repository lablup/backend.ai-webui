/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { getGatewayWrappedError } from './gatewayWrappedError';
import { describe, expect, it } from 'vitest';

const wrapped = (
  status: number,
  msg = "'10.0.0.1' is not allowed IP address",
) => ({
  data: { compute_session_nodes: null, user: null },
  errors: [
    {
      message: `${status}: upstream failed`,
      extensions: {
        response: {
          status,
          statusText: 'Unauthorized',
          body: { type: 'https://api.backend.ai/probs/auth-failed', msg },
        },
      },
    },
  ],
});

describe('getGatewayWrappedError', () => {
  it('maps a wrapped 401 to an AuthorizationError carrying the server reason', () => {
    const err = getGatewayWrappedError(wrapped(401));
    expect(err).toBeInstanceOf(Error);
    expect((err as Error).name).toBe('AuthorizationError');
    expect((err as Error).message).toBe("'10.0.0.1' is not allowed IP address");
  });

  it('throws other upstream statuses in the _wrapWithPromise shape', () => {
    const err = getGatewayWrappedError(wrapped(503, 'down')) as Record<
      string,
      unknown
    >;
    expect(err).toMatchObject({
      isError: true,
      statusCode: 503,
      message: 'down',
      description: 'down',
      type: 'https://api.backend.ai/probs/auth-failed',
    });
  });

  it('falls back to the GraphQL error message when the body has no msg', () => {
    const result = wrapped(500);
    delete (result.errors[0].extensions.response.body as { msg?: string }).msg;
    const err = getGatewayWrappedError(result) as { message: string };
    expect(err.message).toBe('500: upstream failed');
  });

  it('leaves a partial success to Relay', () => {
    const result = {
      ...wrapped(401),
      data: { compute_session_nodes: {}, user: null },
    };
    expect(getGatewayWrappedError(result)).toBeNull();
  });

  it('leaves ordinary GraphQL field errors to Relay', () => {
    expect(
      getGatewayWrappedError({
        data: { user: null },
        errors: [{ message: 'not found', extensions: { code: 'NOT_FOUND' } }],
      }),
    ).toBeNull();
  });

  it('ignores a result without errors', () => {
    expect(getGatewayWrappedError({ data: { user: null } })).toBeNull();
    expect(getGatewayWrappedError({})).toBeNull();
  });
});
