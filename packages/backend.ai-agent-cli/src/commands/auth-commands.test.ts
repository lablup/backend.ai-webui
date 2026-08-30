import { EXIT } from '../errors.js';
import { runCli } from '../run.js';
import { loadSession, saveSession, sessionPath } from '../session.js';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const ENDPOINT = 'http://manager.example.com:8090';
const SESSION_ID = 'abcdefghijklmnopqrstuvwxyz012345';

const DEAD_SESSION_BODY = {
  errors: [{ message: 'error_code "user_auth_unauthorized"' }],
  data: { user: null },
};

const LIVE_USER_BODY = {
  data: {
    user: {
      email: 'admin@lablup.com',
      role: 'superadmin',
      domain_name: 'default',
      full_name: 'Admin Lablu',
      status: 'active',
    },
  },
};

let out: string[];
let err: string[];

const io = {
  stdout: (chunk: string) => out.push(chunk),
  stderr: (chunk: string) => err.push(chunk),
};

const run = (argv: string[]) => runCli({ argv, cwd: '', io });

const stubFetch = (status: number, body: unknown) =>
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response(JSON.stringify(body), { status })),
  );

beforeEach(() => {
  out = [];
  err = [];
  process.env.BAI_AGENT_CONFIG_DIR = mkdtempSync(
    join(tmpdir(), 'bai-agent-commands-'),
  );
  saveSession({
    endpoint: ENDPOINT,
    webui: 'https://fr-3763.localhost:1355',
    sessionId: SESSION_ID,
    savedAt: '2026-08-29T00:00:00.000Z',
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('whoami', () => {
  it('prints the account and never the raw session id', async () => {
    stubFetch(200, LIVE_USER_BODY);

    await expect(run(['whoami', '--endpoint', ENDPOINT])).resolves.toBe(
      EXIT.ok,
    );
    const text = out.join('');
    expect(text).toContain('admin@lablup.com');
    expect(text).toContain('superadmin');
    expect(text).toContain(ENDPOINT);
    expect(text).toContain('abcd…2345');
    expect(text).not.toContain(SESSION_ID);
  });

  it('deletes the session and exits 3 when the manager rejects it', async () => {
    stubFetch(200, DEAD_SESSION_BODY);

    await expect(run(['whoami', '--endpoint', ENDPOINT])).resolves.toBe(
      EXIT.authRequired,
    );
    expect(loadSession(ENDPOINT)).toBeNull();
    expect(err.join('')).toContain(`bai-agent login --endpoint ${ENDPOINT}`);
  });

  it('exits 3 with a login hint when no session is stored', async () => {
    stubFetch(200, LIVE_USER_BODY);

    await expect(
      run(['whoami', '--endpoint', 'http://other.example.com', '--json']),
    ).resolves.toBe(EXIT.authRequired);
    expect(JSON.parse(err.join(''))).toMatchObject({
      code: 'auth_required',
      hint: 'bai-agent login --endpoint http://other.example.com',
    });
  });
});

describe('logout', () => {
  it('removes the session file without contacting the manager', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    const path = sessionPath(ENDPOINT);

    await expect(
      run(['logout', '--endpoint', ENDPOINT, '--json']),
    ).resolves.toBe(EXIT.ok);
    expect(JSON.parse(out.join('')).data).toMatchObject({
      endpoint: ENDPOINT,
      removed: true,
      sessionFile: path,
      sessionId: 'abcd…2345',
    });
    expect(loadSession(ENDPOINT)).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('is idempotent', async () => {
    await run(['logout', '--endpoint', ENDPOINT]);
    out = [];

    await expect(
      run(['logout', '--endpoint', ENDPOINT, '--json']),
    ).resolves.toBe(EXIT.ok);
    expect(JSON.parse(out.join('')).data).toMatchObject({ removed: false });
  });
});

describe('login --paste', () => {
  it('stores the pasted session and verifies it', async () => {
    stubFetch(200, LIVE_USER_BODY);

    await expect(
      run([
        'login',
        '--paste',
        '--endpoint',
        'http://fresh.example.com',
        '--session-id',
        SESSION_ID,
        '--json',
      ]),
    ).resolves.toBe(EXIT.ok);
    expect(JSON.parse(out.join('')).data).toMatchObject({
      mode: 'paste',
      endpoint: 'http://fresh.example.com',
      sessionId: 'abcd…2345',
      user: { email: 'admin@lablup.com' },
    });
    expect(loadSession('http://fresh.example.com')?.sessionId).toBe(SESSION_ID);
  });

  it('does not keep a session the manager rejects', async () => {
    stubFetch(200, DEAD_SESSION_BODY);

    await expect(
      run([
        'login',
        '--paste',
        '--endpoint',
        'http://fresh.example.com',
        '--session-id',
        SESSION_ID,
      ]),
    ).resolves.toBe(EXIT.authRequired);
    expect(loadSession('http://fresh.example.com')).toBeNull();
  });

  it('keeps the previously stored session when the new one is rejected', async () => {
    stubFetch(200, DEAD_SESSION_BODY);

    await expect(
      run([
        'login',
        '--paste',
        '--endpoint',
        ENDPOINT,
        '--session-id',
        'rejected-candidate-session-id-000',
      ]),
    ).resolves.toBe(EXIT.authRequired);
    expect(loadSession(ENDPOINT)?.sessionId).toBe(SESSION_ID);
  });
});
