/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { gatewayWrappedError } from './gatewayWrappedError';
import { describe, expect, it } from 'vitest';

const wrapped = (status: number, msg?: string) => ({
  data: { compute_session_nodes: null, user: null },
  errors: [
    {
      message: `${status}: upstream failed`,
      extensions: {
        response: {
          status,
          statusText: 'Unauthorized',
          body: {
            type: 'https://api.backend.ai/probs/auth-failed',
            ...(msg ? { msg } : {}),
          },
        },
      },
    },
  ],
});

describe('gatewayWrappedError', () => {
  it('returns the upstream error in the _wrapWithPromise shape', () => {
    expect(
      gatewayWrappedError(wrapped(401, "'10.0.0.1' is not allowed IP address")),
    ).toMatchObject({
      isError: true,
      statusCode: 401,
      type: 'https://api.backend.ai/probs/auth-failed',
      message: "'10.0.0.1' is not allowed IP address",
      description: "'10.0.0.1' is not allowed IP address",
    });
  });

  it('falls back to the GraphQL error message when the body has no msg', () => {
    expect(gatewayWrappedError(wrapped(500))?.message).toBe(
      '500: upstream failed',
    );
  });

  it('leaves a partial success to Relay', () => {
    expect(
      gatewayWrappedError({
        ...wrapped(401),
        data: { compute_session_nodes: {}, user: null },
      }),
    ).toBeNull();
  });

  it('leaves ordinary GraphQL field errors to Relay', () => {
    expect(
      gatewayWrappedError({
        data: { user: null },
        errors: [{ message: 'not found' }],
      }),
    ).toBeNull();
  });

  it('ignores a result without errors', () => {
    expect(gatewayWrappedError({ data: { user: null } })).toBeNull();
    expect(gatewayWrappedError(undefined)).toBeNull();
  });
});
