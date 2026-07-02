import Manager from './manager.js';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

/**
 * Regression tests for the local wsproxy hardening (FR-3227).
 *
 * The local wsproxy previously (a) enabled `cors()` for every origin, (b)
 * returned a fixed token `"local"` from `PUT /conf`, and (c) never validated
 * the `:token` path param on the `/proxy/*` routes. These tests pin the fixed
 * behavior: a random per-instance token, constant-time token validation, and
 * an origin allowlist.
 *
 * The tests drive `/conf` in SESSION mode, which never constructs the
 * Backend.AI client, and never trigger a real gateway — so `manager.js`'s
 * lazily-required build artifacts are not needed (the suite runs from a
 * source-only checkout, e.g. CI).
 */

describe('wsproxy Manager security (FR-3227)', () => {
  let manager: any;
  let baseURL: string;

  const json = async (res: Response) => {
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  };

  // Drive `/conf` so `this._config` is set, and capture the per-instance token.
  // SESSION mode keeps the Backend.AI client (a build artifact) out of the path.
  const configure = async () => {
    const res = await fetch(`${baseURL}/conf`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoint: 'http://localhost:8081',
        mode: 'SESSION',
        auth_mode: 'header',
        session: 'test-session',
      }),
    });
    return (await json(res)).token as string;
  };

  beforeEach(async () => {
    manager = new Manager('127.0.0.1', '127.0.0.1', 0);
    const port = await manager.start();
    baseURL = `http://127.0.0.1:${port}`;
  });

  afterEach(async () => {
    await new Promise<void>((resolve) =>
      manager.listener.close(() => resolve()),
    );
  });

  describe('PUT /conf token', () => {
    it('returns a random per-instance token, not the legacy "local"', async () => {
      const token = await configure();
      expect(token).toBeTypeOf('string');
      expect(token).not.toBe('local');
      // 32 random bytes encoded as base64url → 43 chars.
      expect(token.length).toBe(43);
    });

    it('returns a distinct token per Manager instance', async () => {
      const tokenA = await configure();
      const other = new Manager('127.0.0.1', '127.0.0.1', 0);
      const port = await other.start();
      const res = await fetch(`http://127.0.0.1:${port}/conf`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: 'http://localhost:8081',
          mode: 'SESSION',
          auth_mode: 'header',
          session: 'test-session',
        }),
      });
      const tokenB = (await json(res)).token;
      await new Promise<void>((resolve) =>
        other.listener.close(() => resolve()),
      );
      expect(tokenA).not.toBe(tokenB);
    });

    it('rejects a disallowed cross-origin caller with 403', async () => {
      const res = await fetch(`${baseURL}/conf`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Origin: 'https://evil.example',
        },
        body: JSON.stringify({ endpoint: 'http://localhost:8081' }),
      });
      expect(res.status).toBe(403);
    });
  });

  describe('/proxy/:token token validation', () => {
    it('rejects /add with a wrong token (was previously accepted)', async () => {
      await configure();
      const res = await fetch(
        `${baseURL}/proxy/attacker-controlled-wrong-token/victim-session/add?app=jupyter`,
      );
      expect(res.status).toBe(403);
      expect((await json(res)).code).toBe(403);
    });

    it('rejects /delete with a wrong token (was previously accepted)', async () => {
      await configure();
      const res = await fetch(
        `${baseURL}/proxy/attacker-controlled-wrong-token/victim-session/delete`,
      );
      expect(res.status).toBe(403);
      expect((await json(res)).code).toBe(403);
    });

    it('rejects the existence-check route with a wrong token', async () => {
      await configure();
      const res = await fetch(
        `${baseURL}/proxy/attacker-controlled-wrong-token/victim-session`,
      );
      expect(res.status).toBe(403);
    });

    it('rejects an empty token segment', async () => {
      await configure();
      // `//` collapses; use a single space-only token to exercise the guard.
      const res = await fetch(`${baseURL}/proxy/%20/victim-session/delete`);
      expect(res.status).toBe(403);
    });

    it('accepts the correct token (passes the guard, then hits normal logic)', async () => {
      const token = await configure();
      const res = await fetch(
        `${baseURL}/proxy/${encodeURIComponent(token)}/no-such-session/delete`,
      );
      // The token check passed: we reach the normal handler, which returns 404
      // (no such proxy) rather than 403 (rejected token).
      expect(res.status).toBe(200);
      expect((await json(res)).code).toBe(404);
    });

    it('rejects the correct-length-but-wrong token (constant-time path)', async () => {
      const token = await configure();
      // Same length as the real token but different content.
      const forged = 'A'.repeat(token.length);
      const res = await fetch(
        `${baseURL}/proxy/${forged}/victim-session/delete`,
      );
      expect(res.status).toBe(403);
    });
  });

  describe('CORS allowlist', () => {
    it('does not reflect a disallowed origin (no wildcard, no echo)', async () => {
      const res = await fetch(`${baseURL}/status`, {
        headers: { Origin: 'https://evil.example' },
      });
      const acao = res.headers.get('access-control-allow-origin');
      expect(acao).not.toBe('*');
      expect(acao).not.toBe('https://evil.example');
    });

    it('reflects a trusted loopback origin', async () => {
      const res = await fetch(`${baseURL}/status`, {
        headers: { Origin: 'http://localhost:5173' },
      });
      expect(res.headers.get('access-control-allow-origin')).toBe(
        'http://localhost:5173',
      );
    });

    it('reflects a *.localhost subdomain origin (e.g. the Portless dev URL)', async () => {
      const res = await fetch(`${baseURL}/status`, {
        headers: { Origin: 'https://fr-3227.localhost:1355' },
      });
      expect(res.headers.get('access-control-allow-origin')).toBe(
        'https://fr-3227.localhost:1355',
      );
    });
  });
});
