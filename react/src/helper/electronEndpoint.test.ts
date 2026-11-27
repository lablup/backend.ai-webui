/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { checkEndpoint, normalizeEndpoint } from './electronEndpoint';
import { describe, expect, it, vi } from 'vitest';

vi.mock('./loginSessionAuth', () => ({ loadConfigFromWebServer: vi.fn() }));

describe('normalizeEndpoint', () => {
  it('trims, unquotes and drops trailing slashes', () => {
    expect(normalizeEndpoint('  "https://a.example//" ')).toBe(
      'https://a.example',
    );
  });
});

describe('checkEndpoint', () => {
  it('refuses a value that is not an http(s) URL without loading anything', async () => {
    const load = vi.fn();
    for (const raw of ['', 'a.example', 'ftp://a.example', 'https://']) {
      await expect(checkEndpoint(raw, load)).resolves.toEqual({
        ok: false,
        error: 'invalidUrl',
      });
    }
    expect(load).not.toHaveBeenCalled();
  });

  it('passes the normalised endpoint to the loader and reports the domain', async () => {
    const load = vi.fn().mockResolvedValue({
      status: 'loaded',
      domainName: 'default',
    });
    await expect(checkEndpoint('https://a.example/', load)).resolves.toEqual({
      ok: true,
      endpoint: 'https://a.example',
      hasDomain: true,
    });
    expect(load).toHaveBeenCalledWith('https://a.example');
  });

  it('still continues when the server names no domain', async () => {
    const load = vi
      .fn()
      .mockResolvedValue({ status: 'loaded', domainName: null });
    await expect(checkEndpoint('http://b.example', load)).resolves.toEqual({
      ok: true,
      endpoint: 'http://b.example',
      hasDomain: false,
    });
  });

  it('maps an unreachable server and a missing config.toml to their errors', async () => {
    await expect(
      checkEndpoint(
        'https://a.example',
        vi.fn().mockResolvedValue({ status: 'unreachable' }),
      ),
    ).resolves.toEqual({ ok: false, error: 'unreachable' });
    await expect(
      checkEndpoint(
        'https://a.example',
        vi.fn().mockResolvedValue({ status: 'no-config' }),
      ),
    ).resolves.toEqual({ ok: false, error: 'noConfig' });
  });

  it('ends a load that throws as unreachable instead of rejecting', async () => {
    await expect(
      checkEndpoint(
        'https://a.example',
        vi.fn().mockRejectedValue(new Error('boom')),
      ),
    ).resolves.toEqual({ ok: false, error: 'unreachable' });
  });
});
