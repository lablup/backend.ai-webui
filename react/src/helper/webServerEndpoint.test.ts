import { isWebServerEndpoint } from './webServerEndpoint';
import { afterEach, describe, expect, it, vi } from 'vitest';

const CONFIG_BODY = '[general]\napiEndpoint = "http://host:8090"\n';

const mockFetch = (impl: (url: string) => Response) =>
  vi.stubGlobal(
    'fetch',
    vi.fn((input: RequestInfo | URL) =>
      Promise.resolve(
        impl(typeof input === 'string' ? input : input.toString()),
      ),
    ),
  );

describe('isWebServerEndpoint', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('asks the endpoint for its config.toml', async () => {
    const seen: string[] = [];
    mockFetch((url) => {
      seen.push(url);
      return new Response(CONFIG_BODY, { status: 200 });
    });

    await expect(isWebServerEndpoint('http://host:8090')).resolves.toBe(true);
    expect(seen).toEqual(['http://host:8090/config.toml']);
  });

  it('keeps one slash when the endpoint has a trailing one', async () => {
    const seen: string[] = [];
    mockFetch((url) => {
      seen.push(url);
      return new Response(CONFIG_BODY, { status: 200 });
    });

    await isWebServerEndpoint('http://host:8090/');
    expect(seen).toEqual(['http://host:8090/config.toml']);
  });

  it('is false for a manager, which answers 404', async () => {
    mockFetch(() => new Response('', { status: 404 }));
    await expect(isWebServerEndpoint('http://host:8091')).resolves.toBe(false);
  });

  it('is false for a 200 that is not the config, such as an SPA fallback', async () => {
    mockFetch(
      () =>
        new Response('<!doctype html><html><body>app</body></html>', {
          status: 200,
        }),
    );
    await expect(isWebServerEndpoint('http://static-host')).resolves.toBe(
      false,
    );
  });

  it('accepts the config whatever precedes the section on the line', async () => {
    mockFetch(
      () =>
        new Response(`# rendered\n  [general]  \nfoo = 1\n`, { status: 200 }),
    );
    await expect(isWebServerEndpoint('http://host:8090')).resolves.toBe(true);
  });

  it('is false when the request cannot be read at all', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new TypeError('Failed to fetch'))),
    );
    await expect(isWebServerEndpoint('http://host:8091')).resolves.toBe(false);
  });

  it('is false for an unusable endpoint without fetching', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    await expect(isWebServerEndpoint('')).resolves.toBe(false);
    await expect(isWebServerEndpoint('not a url')).resolves.toBe(false);
    await expect(isWebServerEndpoint('file:///tmp')).resolves.toBe(false);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
