import { Client, ClientConfig } from './index';
import { describe, expect, it, vi } from 'vitest';

const makeClient = (mode: 'SESSION' | 'API') => {
  const client = new Client(
    new ClientConfig('AKTEST', 'SKTEST', 'https://example.com', mode),
    'probe-server-test',
  );
  return client;
};

const httpError = (statusCode: number) => ({ isError: true, statusCode });

describe('probeServer', () => {
  it('asks the anonymous health route through the webserver', async () => {
    const client = makeClient('SESSION');
    const wrap = vi
      .spyOn(client, '_wrapWithPromise')
      .mockResolvedValue({ status: 'ok' });

    await expect(client.probeServer()).resolves.toBeUndefined();
    expect(wrap).toHaveBeenCalledTimes(1);
    expect(wrap.mock.calls[0][0].uri).toBe('https://example.com/func/health');
  });

  it.each([401, 404])(
    'falls back to the legacy root when /health answers %i',
    async (status) => {
      const client = makeClient('SESSION');
      const wrap = vi
        .spyOn(client, '_wrapWithPromise')
        .mockRejectedValueOnce(httpError(status))
        .mockResolvedValueOnce({ version: 'v8.20240915', manager: '26.4.0' });

      await expect(client.probeServer()).resolves.toBeUndefined();
      expect(wrap.mock.calls.map(([rqst]) => rqst.uri)).toEqual([
        'https://example.com/func/health',
        'https://example.com/func/',
      ]);
    },
  );

  it('rethrows the health error when the legacy root refuses too', async () => {
    const client = makeClient('SESSION');
    const healthError = httpError(401);
    vi.spyOn(client, '_wrapWithPromise')
      .mockRejectedValueOnce(healthError)
      .mockRejectedValueOnce(httpError(401));

    await expect(client.probeServer()).rejects.toBe(healthError);
  });

  it('does not retry a server that did not answer', async () => {
    const client = makeClient('SESSION');
    const down = httpError(502);
    const wrap = vi
      .spyOn(client, '_wrapWithPromise')
      .mockRejectedValueOnce(down);

    await expect(client.probeServer()).rejects.toBe(down);
    expect(wrap).toHaveBeenCalledTimes(1);
  });

  it('asks the manager directly in API mode', async () => {
    const client = makeClient('API');
    const wrap = vi
      .spyOn(client, '_wrapWithPromise')
      .mockResolvedValue({ status: 'ok' });

    await client.probeServer();
    expect(wrap.mock.calls[0][0].uri).toBe('https://example.com/health');
  });
});

describe('get_manager_version', () => {
  it('signs the request in API mode', async () => {
    const client = makeClient('API');
    const wrap = vi
      .spyOn(client, '_wrapWithPromise')
      .mockResolvedValue({ version: 'v9.20250722', manager: '26.9.0' });

    await expect(client.get_manager_version()).resolves.toBe('26.9.0');
    const headers = wrap.mock.calls[0][0].headers as Headers;
    expect(headers.get('Authorization')).toMatch(/^BackendAI signMethod=/);
  });
});
