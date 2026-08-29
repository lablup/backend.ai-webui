import {
  CALLBACK_PATH,
  deriveLoginCode,
  newState,
  startCallbackServer,
  type CallbackServer,
} from './callback-server.js';
import { afterEach, describe, expect, it, vi } from 'vitest';

const STATE = 'a'.repeat(64);
const ENDPOINT = 'http://manager.example.com:8090';

let server: CallbackServer | undefined;

afterEach(async () => {
  await server?.close();
  server = undefined;
});

async function start(
  onPayload = vi.fn(async () => ({ ok: true, message: 'done' })),
) {
  server = await startCallbackServer({
    state: STATE,
    expectedEndpoint: ENDPOINT,
    timeoutMs: 5_000,
    onPayload,
  });
  return { server, onPayload };
}

const post = (port: number, body: unknown) =>
  fetch(`http://127.0.0.1:${port}${CALLBACK_PATH}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

describe('deriveLoginCode', () => {
  it('is a stable six-character code derived from the state', () => {
    expect(deriveLoginCode(STATE)).toBe(deriveLoginCode(STATE));
    expect(deriveLoginCode(STATE)).toHaveLength(6);
    expect(deriveLoginCode(STATE)).not.toBe(deriveLoginCode(newState()));
  });
});

describe('callback listener', () => {
  it('accepts a matching state and endpoint, and hands the payload on', async () => {
    const { server: running, onPayload } = await start();

    const response = await post(running.port, {
      sessionId: 'session-id-value',
      endpoint: `${ENDPOINT}/`,
      state: STATE,
      email: 'user@example.com',
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      message: 'done',
    });
    const { payload } = await running.wait();
    expect(payload.sessionId).toBe('session-id-value');
    expect(payload.endpoint).toBe(ENDPOINT);
    expect(onPayload).toHaveBeenCalledOnce();
  });

  it('rejects a mismatched state without consuming the wait', async () => {
    const { server: running, onPayload } = await start();

    const response = await post(running.port, {
      sessionId: 'session-id-value',
      endpoint: ENDPOINT,
      state: 'b'.repeat(64),
    });

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ error: 'state_mismatch' });
    expect(onPayload).not.toHaveBeenCalled();
    await expect(
      Promise.race([
        running.wait(),
        new Promise((resolve) =>
          setTimeout(() => resolve('still waiting'), 50),
        ),
      ]),
    ).resolves.toBe('still waiting');
  });

  it('rejects a payload for a different endpoint', async () => {
    const { server: running } = await start();

    const response = await post(running.port, {
      sessionId: 'session-id-value',
      endpoint: 'http://elsewhere.example.com',
      state: STATE,
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: 'endpoint_mismatch',
    });
  });

  it('answers the private-network preflight the browser sends', async () => {
    const { server: running } = await start();

    const response = await fetch(
      `http://127.0.0.1:${running.port}${CALLBACK_PATH}`,
      {
        method: 'OPTIONS',
        headers: {
          Origin: 'https://fr-3763.localhost:1355',
          'Access-Control-Request-Method': 'POST',
        },
      },
    );

    expect(response.status).toBe(204);
    expect(response.headers.get('access-control-allow-origin')).toBe(
      'https://fr-3763.localhost:1355',
    );
    expect(response.headers.get('access-control-allow-private-network')).toBe(
      'true',
    );
  });

  it('times out with an auth_required error', async () => {
    server = await startCallbackServer({
      state: STATE,
      expectedEndpoint: ENDPOINT,
      timeoutMs: 20,
      onPayload: async () => ({ ok: true, message: 'done' }),
    });

    await expect(server.wait()).rejects.toMatchObject({
      code: 'auth_required',
    });
  });
});
