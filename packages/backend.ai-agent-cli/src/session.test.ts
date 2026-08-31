import { updateConfig } from './config.js';
import { CliError } from './errors.js';
import {
  configDir,
  deleteSession,
  endpointKey,
  listSessions,
  loadSession,
  maskSessionId,
  normalizeEndpoint,
  readApiEndpointFromToml,
  resolveEndpoint,
  saveSession,
  sessionFileMode,
  sessionPath,
  sessionsDir,
} from './session.js';
import { chmodSync, mkdtempSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';

const ENDPOINT = 'http://manager.example.com:8090';

let env: Record<string, string | undefined>;

beforeEach(() => {
  env = {
    BAI_AGENT_CONFIG_DIR: mkdtempSync(join(tmpdir(), 'bai-agent-session-')),
  };
});

const sample = (endpoint = ENDPOINT) => ({
  endpoint,
  webui: 'https://fr-3763.localhost:1355',
  sessionId: 'abcdefghijklmnopqrstuvwxyz012345',
  savedAt: '2026-08-29T00:00:00.000Z',
});

describe('store paths', () => {
  it('prefers BAI_AGENT_CONFIG_DIR over XDG_CONFIG_HOME and $HOME', () => {
    expect(configDir(env)).toBe(env.BAI_AGENT_CONFIG_DIR);
    expect(sessionsDir(env)).toBe(join(env.BAI_AGENT_CONFIG_DIR!, 'sessions'));
  });

  it('falls back to XDG_CONFIG_HOME/backend.ai-agent', () => {
    expect(configDir({ XDG_CONFIG_HOME: '/xdg' })).toBe(
      join('/xdg', 'backend.ai-agent'),
    );
  });

  it('names the file after the sanitised host and port', () => {
    expect(endpointKey(ENDPOINT)).toBe('manager.example.com_8090');
    expect(sessionPath(ENDPOINT, env)).toBe(
      join(sessionsDir(env), 'manager.example.com_8090.json'),
    );
  });

  it('rejects an endpoint that is not a URL', () => {
    expect(() => normalizeEndpoint('not a url')).toThrow(CliError);
    expect(normalizeEndpoint('http://host:8090///')).toBe('http://host:8090');
  });
});

describe('store round trip', () => {
  it('writes 0600 inside a 0700 directory and reads back', () => {
    const path = saveSession(sample(), env);

    expect(sessionFileMode(path)).toBe(0o600);
    expect(statSync(sessionsDir(env)).mode & 0o777).toBe(0o700);
    expect(loadSession(ENDPOINT, env)).toMatchObject({
      ...sample(),
      path,
    });
  });

  it('keeps 0600 when an existing session is overwritten', () => {
    saveSession(sample(), env);
    const path = saveSession({ ...sample(), sessionId: 'second' }, env);

    expect(sessionFileMode(path)).toBe(0o600);
    expect(loadSession(ENDPOINT, env)?.sessionId).toBe('second');
  });

  it('tightens a pre-existing sessions directory to 0700', () => {
    saveSession(sample(), env);
    chmodSync(sessionsDir(env), 0o755);

    saveSession({ ...sample(), sessionId: 'second' }, env);

    expect(statSync(sessionsDir(env)).mode & 0o777).toBe(0o700);
  });

  it('deletes only the named session and is idempotent', () => {
    saveSession(sample(), env);
    saveSession(sample('http://other.example.com'), env);

    expect(deleteSession(ENDPOINT, env)).toBe(sessionPath(ENDPOINT, env));
    expect(deleteSession(ENDPOINT, env)).toBeNull();
    expect(listSessions(env).map((s) => s.endpoint)).toEqual([
      'http://other.example.com',
    ]);
  });

  it('ignores a corrupt session file', () => {
    saveSession(sample(), env);
    saveSession({ ...sample('http://broken.example.com'), sessionId: '' }, env);

    expect(listSessions(env)).toHaveLength(1);
  });
});

describe('maskSessionId', () => {
  it('shows four characters at each end', () => {
    expect(maskSessionId('abcdefghijklmnopqrstuvwxyz')).toBe('abcd…wxyz');
  });

  it('reveals nothing from a short or absent id', () => {
    expect(maskSessionId('short')).toBe('…');
    expect(maskSessionId(undefined)).toBe('(none)');
  });
});

describe('readApiEndpointFromToml', () => {
  it('reads apiEndpoint from [general] only', () => {
    const toml = [
      '[other]',
      'apiEndpoint = "http://wrong:1"',
      '[general]',
      'apiEndpoint = "http://right:8090"',
    ].join('\n');

    expect(readApiEndpointFromToml(toml)).toBe('http://right:8090');
  });

  it('treats the sample placeholder and an empty value as unset', () => {
    expect(
      readApiEndpointFromToml(
        '[general]\napiEndpoint = "[Default API Endpoint.]"',
      ),
    ).toBeUndefined();
    expect(
      readApiEndpointFromToml('[general]\napiEndpoint = ""'),
    ).toBeUndefined();
    expect(
      readApiEndpointFromToml('[general]\n# apiEndpoint = "x"'),
    ).toBeUndefined();
  });
});

describe('resolveEndpoint', () => {
  it('prefers the flag', () => {
    saveSession(sample(), env);

    expect(resolveEndpoint({ flag: 'http://flag:1/', cwd: '', env })).toEqual({
      endpoint: 'http://flag:1',
      source: 'flag',
    });
  });

  it('uses the single stored session', () => {
    saveSession(sample(), env);

    expect(resolveEndpoint({ cwd: '', env })).toEqual({
      endpoint: ENDPOINT,
      source: 'session',
    });
  });

  it('refuses to guess between several stored sessions', () => {
    saveSession(sample(), env);
    saveSession(sample('http://other.example.com'), env);

    expect(() => resolveEndpoint({ cwd: '', env })).toThrow(/--endpoint/);
  });

  it('uses the endpoint config.json recorded before the checkout config.toml', () => {
    updateConfig({ endpoint: 'https://config.example.com/' }, env);
    expect(resolveEndpoint({ cwd: '', env })).toEqual({
      endpoint: 'https://config.example.com',
      source: 'config',
    });
    // A stored session still wins over the recorded endpoint.
    saveSession(sample(), env);
    expect(resolveEndpoint({ cwd: '', env }).source).toBe('session');
  });

  it('fails with a login hint when nothing resolves', () => {
    expect(() => resolveEndpoint({ cwd: '', env })).toThrow(CliError);
  });
});
