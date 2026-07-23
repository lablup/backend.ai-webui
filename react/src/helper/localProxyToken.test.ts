import { requestLocalProxyToken } from './localProxyToken';
import { afterEach, describe, expect, it, vi } from 'vitest';

/**
 * Unit tests for the local (v1) wsproxy token handshake (FR-3227).
 *
 * Covers the defensive error handling: the helper must throw a clear error
 * when `/conf` is rejected or returns no token, instead of returning
 * `undefined` and producing `/proxy/undefined/...` URLs downstream.
 */
type AnyClient = Parameters<typeof requestLocalProxyToken>[0];

const sessionClient = {
  _config: {
    endpoint: 'http://host',
    connectionMode: 'SESSION',
    _session_id: 'cookie-session',
  },
  _loginSessionId: 'login-session',
  APIMajorVersion: 6,
} as unknown as AnyClient;

const apiClient = {
  _config: {
    endpoint: 'http://host',
    connectionMode: 'API',
    accessKey: 'AK',
    secretKey: 'SK',
  },
  APIMajorVersion: 6,
} as unknown as AnyClient;

const PROXY_URL = 'http://127.0.0.1:5050/';

const mockFetch = (response: {
  ok: boolean;
  status: number;
  body: unknown;
}) => {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: response.ok,
    status: response.status,
    json: async () => response.body,
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
};

describe('requestLocalProxyToken (FR-3227)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns the token from a successful /conf response', async () => {
    const fetchMock = mockFetch({
      ok: true,
      status: 200,
      body: { token: 'secret-token' },
    });

    const token = await requestLocalProxyToken(sessionClient, PROXY_URL);

    expect(token).toBe('secret-token');
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('http://127.0.0.1:5050/conf');
    expect(init.method).toBe('PUT');
    const body = JSON.parse(init.body);
    expect(body.mode).toBe('SESSION');
    expect(body.auth_mode).toBe('header');
    expect(body.session).toBe('login-session');
  });

  it('sends API-mode credentials when connectionMode is API', async () => {
    const fetchMock = mockFetch({
      ok: true,
      status: 200,
      body: { token: 't' },
    });

    await requestLocalProxyToken(apiClient, PROXY_URL);

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.mode).toBe('API');
    expect(body.access_key).toBe('AK');
    expect(body.secret_key).toBe('SK');
  });

  it('throws when /conf is rejected (non-ok response)', async () => {
    mockFetch({ ok: false, status: 403, body: { code: 403 } });

    await expect(
      requestLocalProxyToken(sessionClient, PROXY_URL),
    ).rejects.toThrow(/403/);
  });

  it('throws when the /conf response contains no token', async () => {
    mockFetch({ ok: true, status: 200, body: {} });

    await expect(
      requestLocalProxyToken(sessionClient, PROXY_URL),
    ).rejects.toThrow(/did not contain a token/);
  });
});
