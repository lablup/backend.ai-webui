/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  fetchPublicDomainConfigOnce,
  resetPublicDomainConfigCache,
  resolvePublicConfigTarget,
} from './publicAppConfig';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('resolvePublicConfigTarget', () => {
  beforeEach(() => localStorage.clear());

  it('needs apiDomainName and an endpoint', () => {
    expect(resolvePublicConfigTarget(null)).toBeUndefined();
    expect(
      resolvePublicConfigTarget({ general: { apiEndpoint: 'https://a' } }),
    ).toBeUndefined();
    expect(
      resolvePublicConfigTarget({ general: { apiDomainName: 'default' } }),
    ).toBeUndefined();
  });

  it('trims quotes and trailing slashes off the endpoint', () => {
    expect(
      resolvePublicConfigTarget({
        general: { apiDomainName: ' default ', apiEndpoint: '"https://a/"' },
      }),
    ).toEqual({ domainName: 'default', restBase: 'https://a' });
  });

  it('falls back to the stored login endpoint', () => {
    localStorage.setItem('backendaiwebui.api_endpoint', '"https://stored/"');
    expect(
      resolvePublicConfigTarget({ general: { apiDomainName: 'default' } }),
    ).toEqual({ domainName: 'default', restBase: 'https://stored' });
  });
});

describe('fetchPublicDomainConfigOnce', () => {
  const target = { domainName: 'default', restBase: 'https://a' };
  const payload = {
    app_configs: [
      {
        config_name: 'publicConfigByDomain',
        config: {
          default: { appearance: { schemaVersion: 2 }, settings: { x: 1 } },
          other: { settings: { x: 2 } },
        },
      },
    ],
  };

  beforeEach(() => resetPublicDomainConfigCache());
  afterEach(() => vi.restoreAllMocks());

  it('fetches once per target and returns the domain slice', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(
        new Response(JSON.stringify(payload), { status: 200 }),
      );
    const [a, b] = await Promise.all([
      fetchPublicDomainConfigOnce(target),
      fetchPublicDomainConfigOnce(target),
    ]);
    expect(a).toEqual(payload.app_configs[0].config.default);
    expect(b).toBe(a);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe(
      'https://a/func/v2/app-config/public/get',
    );
  });

  it('is undefined without a target, a slice, or on failure', async () => {
    await expect(
      fetchPublicDomainConfigOnce(undefined),
    ).resolves.toBeUndefined();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('nope', { status: 500 }),
    );
    await expect(fetchPublicDomainConfigOnce(target)).resolves.toBeUndefined();
    expect(warn).toHaveBeenCalledTimes(1);
    resetPublicDomainConfigCache();
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(payload), { status: 200 }),
    );
    await expect(
      fetchPublicDomainConfigOnce({ ...target, domainName: 'missing' }),
    ).resolves.toBeUndefined();
  });
});
