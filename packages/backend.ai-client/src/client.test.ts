import { Client } from './client';
import { ClientConfig } from './client-config';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

// The `Client` constructor reads `localStorage` (the login session id), and the
// request path persists a log stack to it; both are absent in vitest's default
// `node` environment. Provide a minimal in-memory stub so the client can be
// instantiated and exercised without jsdom, and tear it down afterwards so the
// global override never leaks into other test files.
beforeAll(() => {
  const store = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => void store.set(key, value),
    removeItem: (key: string) => void store.delete(key),
    clear: () => store.clear(),
  });
});

afterAll(() => {
  vi.unstubAllGlobals();
});

/**
 * Regression tests for FR-3070.
 *
 * The manager migrated the session REST handlers from the legacy
 * `@check_api_params` decorator to the Handler-class pattern (BA-4723). Two
 * handlers now use `BodyParam` with a *required* body field, so the params
 * must be sent in the JSON request body — not as a query string with a null
 * body, which a migrated backend rejects with `400 MalformedRequestBody`:
 *
 *   POST /session/{name}/shutdown-service  -> required body field `service_name`
 *   POST /session/{name}/download          -> required body field `files`
 *
 * These tests inspect the request object that `newSignedRequest` produces (no
 * fetch, no live backend) and lock in that the params land in the body and that
 * `download` is a POST. They fail on the pre-FR-3070 code, where the params
 * were in the URL query string and the HTTP body was null/empty.
 */

function makeSessionClient(): Client {
  // SESSION mode mirrors how the React UI instantiates the client
  // (globalThis.backendaiclient) and skips HMAC signing, so no crypto/fetch is
  // touched while building the request.
  const config = new ClientConfig(
    'test-user@lablup.com',
    'test-password',
    'https://api.test',
    'SESSION',
  );
  return new Client(config, 'test');
}

/**
 * Capture the request object the method hands to `_wrapWithPromise` instead of
 * firing it. `_wrapWithPromise` is the single seam both `shutdown_service` and
 * `download` call after building the request.
 */
async function captureRequest(
  client: Client,
  run: (client: Client) => Promise<unknown>,
) {
  const spy = vi.spyOn(client, '_wrapWithPromise').mockResolvedValue(undefined);
  await run(client);
  expect(spy).toHaveBeenCalledOnce();
  return spy.mock.calls[0][0] as {
    method: string;
    uri: string;
    body: string | FormData;
  };
}

describe('session REST params go in the JSON body (FR-3070)', () => {
  it('shutdown_service: POST with service_name in the body, not the query string', async () => {
    const client = makeSessionClient();
    const rqst = await captureRequest(client, (c) =>
      c.shutdown_service('sess-1', 'tensorboard'),
    );

    expect(rqst.method).toBe('POST');
    expect(rqst.uri).toContain('/sess-1/shutdown-service');
    // params must NOT be encoded in the URL
    expect(rqst.uri).not.toContain('?');
    expect(rqst.uri).not.toContain('service_name=');
    // params MUST be in the JSON body
    expect(JSON.parse(rqst.body as string)).toEqual({
      service_name: 'tensorboard',
    });
  });

  it('download: switched to POST with the files array in the body', async () => {
    const client = makeSessionClient();
    const rqst = await captureRequest(client, (c) =>
      c.download('sess-1', ['a.txt', 'b.txt']),
    );

    // regression guard: the node client copy used GET against the deprecated
    // /download stub; both copies must use the real POST handler.
    expect(rqst.method).toBe('POST');
    expect(rqst.uri).toContain('/sess-1/download');
    expect(rqst.uri).not.toContain('?');
    expect(rqst.uri).not.toContain('files=');
    expect(JSON.parse(rqst.body as string)).toEqual({
      files: ['a.txt', 'b.txt'],
    });
  });

  it('download_single: deliberately unchanged — `file` stays in the query string', async () => {
    // download_single uses QueryParam[file] on the manager, so it is the one
    // endpoint of the three that is *not* migrated to a body param. Guard that
    // it is not accidentally folded into the body-param change above.
    const client = makeSessionClient();
    const rqst = await captureRequest(client, (c) =>
      c.download_single('sess-1', 'a.txt'),
    );

    expect(rqst.method).toBe('POST');
    expect(rqst.uri).toContain('/sess-1/download_single?');
    expect(rqst.uri).toContain('file=a.txt');
    expect(rqst.body).toBe('');
  });
});
