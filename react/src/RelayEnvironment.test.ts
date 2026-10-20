/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { createFetchFn } from './RelayEnvironment';
import type { RequestParameters } from 'relay-runtime';
import { describe, expect, it, vi } from 'vitest';

const DISALLOWED_IP_MSG = "'10.42.22.120' is not allowed IP address";

// The GraphQL gateway's shape for a manager 401: HTTP 200, root field null.
function gatewayRefusal(msg?: string) {
  return {
    data: { myUserV2: null },
    errors: [
      {
        message: 'Unexpected empty "data" and "errors" fields in result: …',
        path: ['myUserV2'],
        extensions: {
          response: {
            status: 401,
            statusText: 'Unauthorized',
            body: {
              type: 'https://api.backend.ai/probs/auth-failed',
              title: 'Credential/signature mismatch.',
              ...(msg ? { msg } : {}),
            },
          },
        },
      },
    ],
  };
}

function fetchWith(response: unknown) {
  const client = {
    newSignedRequest: vi.fn(() => ({})),
    _wrapWithPromise: vi.fn().mockResolvedValue(response),
  };
  const fetch = createFetchFn(async () => client as any);
  return fetch(
    { text: 'query Q { myUserV2 { id } }' } as RequestParameters,
    {},
    {},
    undefined,
  );
}

describe('createFetchFn', () => {
  it("keeps the server's title and reason on a disallowed-IP refusal", async () => {
    await expect(
      fetchWith(gatewayRefusal(DISALLOWED_IP_MSG)),
    ).rejects.toMatchObject({
      name: 'AuthorizationError',
      title: 'Credential/signature mismatch.',
      description: DISALLOWED_IP_MSG,
    });
  });

  it('reports any other 401 as a bare AuthorizationError', async () => {
    const error = await (fetchWith(gatewayRefusal()) as Promise<unknown>).catch(
      (e: { name?: string; title?: string; description?: string }) => e,
    );
    expect(error).toMatchObject({ name: 'AuthorizationError' });
    expect(error).not.toHaveProperty('title', expect.anything());
    expect(error).not.toHaveProperty('description', expect.anything());
  });
});
