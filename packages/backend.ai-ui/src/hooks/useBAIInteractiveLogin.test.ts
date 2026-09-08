import useBAIInteractiveLogin, {
  type BAIInteractiveLoginProbeResult,
  buildInteractiveLoginUrl,
  classifyFetchError,
  classifyLoginCheckResponse,
  normalizeWebserverUrl,
  probeLoginCheck,
  resolveCallbackUrl,
} from './useBAIInteractiveLogin';
import { act, renderHook, waitFor } from '@testing-library/react';

const APP_ORIGIN = 'https://app.example.com';

const stubLocation = (href = `${APP_ORIGIN}/workflows?tab=runs`) => {
  const location = { href, protocol: new URL(href).protocol };
  vi.stubGlobal('location', location);
  return location;
};

const okResponse = (body: unknown) =>
  ({ ok: true, status: 200, json: async () => body }) as unknown as Response;

const stubFetch = (impl: (...args: Array<any>) => unknown) => {
  const fetchMock = vi.fn(impl);
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
};

describe('normalizeWebserverUrl', () => {
  it('returns null for a missing or blank value', () => {
    expect(normalizeWebserverUrl(undefined)).toBeNull();
    expect(normalizeWebserverUrl(null)).toBeNull();
    expect(normalizeWebserverUrl('   ')).toBeNull();
  });

  it('returns null for a value that is not an absolute URL', () => {
    expect(normalizeWebserverUrl('/webserver')).toBeNull();
    expect(normalizeWebserverUrl('not a url')).toBeNull();
    // Parses as an opaque-path URL whose scheme is the host name.
    expect(normalizeWebserverUrl('localhost:8090')).toBeNull();
    expect(normalizeWebserverUrl('webserver.example.com:8090')).toBeNull();
  });

  it('returns null for a scheme that is not http(s)', () => {
    expect(normalizeWebserverUrl('javascript:alert(1)')).toBeNull();
    expect(normalizeWebserverUrl('mailto:admin@example.com')).toBeNull();
    expect(normalizeWebserverUrl('ftp://webserver.example.com')).toBeNull();
  });

  it('appends a trailing slash so relative segments keep the path prefix', () => {
    expect(normalizeWebserverUrl('https://webserver.example.com')).toBe(
      'https://webserver.example.com/',
    );
    expect(normalizeWebserverUrl('https://webserver.example.com/bai')).toBe(
      'https://webserver.example.com/bai/',
    );
    expect(normalizeWebserverUrl(' https://webserver.example.com/bai/ ')).toBe(
      'https://webserver.example.com/bai/',
    );
  });

  it('drops any query string and fragment', () => {
    expect(normalizeWebserverUrl('https://webserver.example.com/?a=1#b')).toBe(
      'https://webserver.example.com/',
    );
  });
});

describe('resolveCallbackUrl', () => {
  it('resolves a relative callback against the document URL', () => {
    expect(
      resolveCallbackUrl('/auth/callback', `${APP_ORIGIN}/workflows`),
    ).toBe(`${APP_ORIGIN}/auth/callback`);
  });

  it('falls back to the document URL when no callback is given', () => {
    expect(resolveCallbackUrl(undefined, `${APP_ORIGIN}/workflows`)).toBe(
      `${APP_ORIGIN}/workflows`,
    );
    expect(resolveCallbackUrl('  ', `${APP_ORIGIN}/workflows`)).toBe(
      `${APP_ORIGIN}/workflows`,
    );
  });

  it('refuses a callback whose scheme is not http(s)', () => {
    for (const callback of [
      'javascript:alert(1)',
      'data:text/html,hi',
      'mailto:someone@example.com',
      'file:///etc/passwd',
    ]) {
      expect(resolveCallbackUrl(callback, `${APP_ORIGIN}/workflows`)).toBe(
        null,
      );
    }
  });

  it('refuses a callback that does not parse', () => {
    expect(resolveCallbackUrl('https://', `${APP_ORIGIN}/workflows`)).toBe(
      null,
    );
    expect(resolveCallbackUrl('http://[bad', null)).toBeNull();
    // `undefined` would pick up the default (the document URL); `null` is
    // the no-document case.
    expect(resolveCallbackUrl(undefined, null)).toBeNull();
  });
});

describe('buildInteractiveLoginUrl', () => {
  beforeEach(() => {
    stubLocation();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('builds the provider URL for a webserver origin without a trailing slash', () => {
    const url = buildInteractiveLoginUrl({
      webserverUrl: 'https://webserver.example.com',
      appName: 'FastTrack',
      callbackUrl: `${APP_ORIGIN}/auth/callback`,
    });

    expect(url).toBe(
      'https://webserver.example.com/interactive-login?name=FastTrack&callback=https%3A%2F%2Fapp.example.com%2Fauth%2Fcallback',
    );
  });

  it('builds the same URL when the webserver URL already ends with a slash', () => {
    expect(
      buildInteractiveLoginUrl({
        webserverUrl: 'https://webserver.example.com/',
        appName: 'FastTrack',
        callbackUrl: `${APP_ORIGIN}/auth/callback`,
      }),
    ).toBe(
      buildInteractiveLoginUrl({
        webserverUrl: 'https://webserver.example.com',
        appName: 'FastTrack',
        callbackUrl: `${APP_ORIGIN}/auth/callback`,
      }),
    );
  });

  it('preserves a path prefix on the webserver URL', () => {
    const url = buildInteractiveLoginUrl({
      webserverUrl: 'https://webserver.example.com/bai',
      appName: 'FastTrack',
      callbackUrl: `${APP_ORIGIN}/auth/callback`,
    });

    expect(new URL(url as string).pathname).toBe('/bai/interactive-login');
  });

  it('resolves a relative callback against the current document URL', () => {
    const url = buildInteractiveLoginUrl({
      webserverUrl: 'https://webserver.example.com',
      appName: 'FastTrack',
      callbackUrl: '/auth/callback',
    });

    expect(new URL(url as string).searchParams.get('callback')).toBe(
      `${APP_ORIGIN}/auth/callback`,
    );
  });

  it('falls back to the current document URL when no callback is given', () => {
    const url = buildInteractiveLoginUrl({
      webserverUrl: 'https://webserver.example.com',
      appName: 'FastTrack',
    });

    expect(new URL(url as string).searchParams.get('callback')).toBe(
      `${APP_ORIGIN}/workflows?tab=runs`,
    );
  });

  it('percent-encodes the application name', () => {
    const url = buildInteractiveLoginUrl({
      webserverUrl: 'https://webserver.example.com',
      appName: 'Backend.AI FastTrack & Co',
      callbackUrl: `${APP_ORIGIN}/auth/callback`,
    });

    expect(url).toContain('name=Backend.AI+FastTrack+%26+Co');
    expect(new URL(url as string).searchParams.get('name')).toBe(
      'Backend.AI FastTrack & Co',
    );
  });

  it('returns null instead of forwarding a callback that is not an http(s) URL', () => {
    expect(
      buildInteractiveLoginUrl({
        webserverUrl: 'https://webserver.example.com',
        appName: 'FastTrack',
        callbackUrl: 'javascript:alert(1)',
      }),
    ).toBeNull();
    expect(
      buildInteractiveLoginUrl({
        webserverUrl: 'https://webserver.example.com',
        appName: 'FastTrack',
        callbackUrl: 'https://',
      }),
    ).toBeNull();
  });

  it('returns null when there is no usable webserver URL', () => {
    expect(
      buildInteractiveLoginUrl({ webserverUrl: '', appName: 'FastTrack' }),
    ).toBeNull();
    // Would otherwise throw while resolving a relative segment against an
    // opaque-path base, during render.
    expect(
      buildInteractiveLoginUrl({
        webserverUrl: 'localhost:8090',
        appName: 'FastTrack',
      }),
    ).toBeNull();
  });
});

describe('classifyFetchError', () => {
  it('maps abort and timeout errors to timeout', () => {
    expect(
      classifyFetchError(new DOMException('timed out', 'TimeoutError')),
    ).toBe('timeout');
    expect(classifyFetchError(new DOMException('aborted', 'AbortError'))).toBe(
      'timeout',
    );
  });

  it('maps every other rejection to cors_or_mixed', () => {
    expect(classifyFetchError(new TypeError('Failed to fetch'))).toBe(
      'cors_or_mixed',
    );
    expect(classifyFetchError(undefined)).toBe('cors_or_mixed');
  });
});

describe('classifyLoginCheckResponse', () => {
  it('accepts an authenticated response carrying a session id', () => {
    expect(
      classifyLoginCheckResponse({
        authenticated: true,
        data: { access_key: 'AKIA', role: 'user', status: 'active' },
        session_id: 'sess-1',
      }),
    ).toEqual({ ok: true, sessionId: 'sess-1' });
  });

  it('rejects a body that is not an object or lacks authenticated', () => {
    expect(classifyLoginCheckResponse(null)).toEqual({
      ok: false,
      reason: 'invalid_response',
    });
    expect(classifyLoginCheckResponse('nope')).toEqual({
      ok: false,
      reason: 'invalid_response',
    });
    expect(classifyLoginCheckResponse({ session_id: 'sess-1' })).toEqual({
      ok: false,
      reason: 'invalid_response',
    });
  });

  it('reports no_session when the webserver has no session for the browser', () => {
    expect(
      classifyLoginCheckResponse({
        authenticated: false,
        data: null,
        session_id: '',
      }),
    ).toEqual({ ok: false, reason: 'no_session' });
  });

  it('reports no_session_id when an authenticated response has no session id', () => {
    expect(
      classifyLoginCheckResponse({ authenticated: true, session_id: '' }),
    ).toEqual({ ok: false, reason: 'no_session_id' });
    expect(classifyLoginCheckResponse({ authenticated: true })).toEqual({
      ok: false,
      reason: 'no_session_id',
    });
  });
});

describe('probeLoginCheck', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('posts to <webserver>/server/login-check with credentials and no body', async () => {
    const fetchMock = stubFetch(async () =>
      okResponse({ authenticated: true, session_id: 'sess-1' }),
    );

    await probeLoginCheck({
      webserverUrl: 'https://webserver.example.com/bai',
      timeoutMs: 1000,
    });

    const [input, init] = fetchMock.mock.calls[0];
    expect(input).toBe('https://webserver.example.com/bai/server/login-check');
    expect(init.method).toBe('POST');
    expect(init.credentials).toBe('include');
    expect(init.body).toBeUndefined();
    expect(init.headers).toBeUndefined();
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });

  it('resolves with the session id when the browser already has a session', async () => {
    stubFetch(async () =>
      okResponse({ authenticated: true, session_id: 'sess-1' }),
    );

    await expect(
      probeLoginCheck({ webserverUrl: 'https://webserver.example.com' }),
    ).resolves.toEqual({ ok: true, sessionId: 'sess-1' });
  });

  it('reports no_endpoint without calling fetch', async () => {
    const fetchMock = stubFetch(async () => okResponse({}));

    await expect(probeLoginCheck({ webserverUrl: '  ' })).resolves.toEqual({
      ok: false,
      reason: 'no_endpoint',
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('reports no_endpoint for a scheme-less host:port webserver URL', async () => {
    const fetchMock = stubFetch(async () => okResponse({}));

    await expect(
      probeLoginCheck({ webserverUrl: 'localhost:8090' }),
    ).resolves.toEqual({ ok: false, reason: 'no_endpoint' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('reports cors_or_mixed when the browser blocks the request', async () => {
    stubFetch(async () => {
      throw new TypeError('Failed to fetch');
    });

    await expect(
      probeLoginCheck({ webserverUrl: 'https://webserver.example.com' }),
    ).resolves.toEqual({ ok: false, reason: 'cors_or_mixed' });
  });

  it('reports timeout when the request is aborted by the deadline', async () => {
    stubFetch(async () => {
      throw new DOMException('timed out', 'TimeoutError');
    });

    await expect(
      probeLoginCheck({ webserverUrl: 'https://webserver.example.com' }),
    ).resolves.toEqual({ ok: false, reason: 'timeout' });
  });

  it('reports http_error with the status code', async () => {
    stubFetch(
      async () =>
        ({
          ok: false,
          status: 502,
          json: async () => ({}),
        }) as unknown as Response,
    );

    await expect(
      probeLoginCheck({ webserverUrl: 'https://webserver.example.com' }),
    ).resolves.toEqual({ ok: false, reason: 'http_error', status: 502 });
  });

  it('reports invalid_response when the body is not JSON', async () => {
    stubFetch(
      async () =>
        ({
          ok: true,
          status: 200,
          json: async () => {
            throw new SyntaxError('Unexpected token <');
          },
        }) as unknown as Response,
    );

    await expect(
      probeLoginCheck({ webserverUrl: 'https://webserver.example.com' }),
    ).resolves.toEqual({ ok: false, reason: 'invalid_response' });
  });

  it('reports timeout when the deadline expires while the body is being read', async () => {
    stubFetch(
      async () =>
        ({
          ok: true,
          status: 200,
          json: async () => {
            throw new DOMException('timed out', 'TimeoutError');
          },
        }) as unknown as Response,
    );

    await expect(
      probeLoginCheck({ webserverUrl: 'https://webserver.example.com' }),
    ).resolves.toEqual({ ok: false, reason: 'timeout' });
  });

  it('reports no_session when the webserver answers authenticated: false', async () => {
    stubFetch(async () =>
      okResponse({ authenticated: false, data: null, session_id: '' }),
    );

    await expect(
      probeLoginCheck({ webserverUrl: 'https://webserver.example.com' }),
    ).resolves.toEqual({ ok: false, reason: 'no_session' });
  });

  it('reports no_session_id when an authenticated answer carries no session id', async () => {
    stubFetch(async () => okResponse({ authenticated: true, session_id: '' }));

    await expect(
      probeLoginCheck({ webserverUrl: 'https://webserver.example.com' }),
    ).resolves.toEqual({ ok: false, reason: 'no_session_id' });
  });
});

describe('useBAIInteractiveLogin', () => {
  beforeEach(() => {
    stubLocation();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const renderSubject = () =>
    renderHook(() =>
      useBAIInteractiveLogin({
        webserverUrl: 'https://webserver.example.com',
        appName: 'FastTrack',
        callbackUrl: `${APP_ORIGIN}/auth/callback`,
      }),
    );

  it('exposes the provider URL it would redirect to', () => {
    const { result } = renderSubject();

    expect(result.current.interactiveLoginUrl).toBe(
      'https://webserver.example.com/interactive-login?name=FastTrack&callback=https%3A%2F%2Fapp.example.com%2Fauth%2Fcallback',
    );
    expect(result.current.isProbing).toBe(false);
    expect(result.current.failure).toBeNull();
  });

  it('records the failure of a probe', async () => {
    stubFetch(async () => okResponse({ authenticated: false }));
    const { result } = renderSubject();

    await act(async () => {
      await result.current.probe();
    });

    await waitFor(() =>
      expect(result.current.failure).toEqual({
        reason: 'no_session',
        status: undefined,
      }),
    );
    expect(result.current.isProbing).toBe(false);
  });

  it('clears the failure once a probe succeeds', async () => {
    stubFetch(async () => okResponse({ authenticated: false }));
    const { result } = renderSubject();

    await act(async () => {
      await result.current.probe();
    });
    expect(result.current.failure).not.toBeNull();

    stubFetch(async () =>
      okResponse({ authenticated: true, session_id: 'sess-1' }),
    );
    await act(async () => {
      await expect(result.current.probe()).resolves.toEqual({
        ok: true,
        sessionId: 'sess-1',
      });
    });

    await waitFor(() => expect(result.current.failure).toBeNull());
  });

  it('lets only the latest of two overlapping probes commit state', async () => {
    const settlers: Array<(response: Response) => void> = [];
    stubFetch(
      () =>
        new Promise<Response>((resolve) => {
          settlers.push(resolve);
        }),
    );
    const { result } = renderSubject();

    let first!: Promise<BAIInteractiveLoginProbeResult>;
    let second!: Promise<BAIInteractiveLoginProbeResult>;
    act(() => {
      first = result.current.probe();
      second = result.current.probe();
    });
    expect(settlers).toHaveLength(2);

    // The newer probe settles first, then the stale one.
    await act(async () => {
      settlers[1](okResponse({ authenticated: true, session_id: 'sess-2' }));
      await second;
    });
    expect(result.current.isProbing).toBe(false);
    expect(result.current.failure).toBeNull();

    await act(async () => {
      settlers[0]({ ok: false, status: 502 } as unknown as Response);
      await first;
    });
    expect(result.current.failure).toBeNull();
    expect(result.current.isProbing).toBe(false);
  });

  it('accepts a failure reported by the caller, such as relay_failed', async () => {
    const { result } = renderSubject();

    act(() => {
      result.current.reportFailure('relay_failed');
    });

    await waitFor(() =>
      expect(result.current.failure).toEqual({
        reason: 'relay_failed',
        status: undefined,
      }),
    );
  });

  it('navigates to the provider URL on redirect', () => {
    const location = stubLocation();
    const { result } = renderSubject();

    act(() => {
      result.current.redirectToInteractiveLogin();
    });

    expect(location.href).toBe(
      'https://webserver.example.com/interactive-login?name=FastTrack&callback=https%3A%2F%2Fapp.example.com%2Fauth%2Fcallback',
    );
  });

  it('records no_endpoint instead of navigating when the webserver URL is unusable', () => {
    const location = stubLocation();
    const { result } = renderHook(() =>
      useBAIInteractiveLogin({ webserverUrl: '', appName: 'FastTrack' }),
    );

    act(() => {
      result.current.redirectToInteractiveLogin();
    });

    expect(location.href).toBe(`${APP_ORIGIN}/workflows?tab=runs`);
    expect(result.current.failure).toEqual({ reason: 'no_endpoint' });
  });

  it('records invalid_callback instead of navigating when the callback is unusable', () => {
    const location = stubLocation();
    const { result } = renderHook(() =>
      useBAIInteractiveLogin({
        webserverUrl: 'https://webserver.example.com',
        appName: 'FastTrack',
        callbackUrl: 'javascript:alert(1)',
      }),
    );

    expect(result.current.interactiveLoginUrl).toBeNull();

    let reason: ReturnType<typeof result.current.redirectToInteractiveLogin>;
    act(() => {
      reason = result.current.redirectToInteractiveLogin();
    });

    expect(reason!).toBe('invalid_callback');
    expect(location.href).toBe(`${APP_ORIGIN}/workflows?tab=runs`);
    expect(result.current.failure).toEqual({ reason: 'invalid_callback' });
  });
});
