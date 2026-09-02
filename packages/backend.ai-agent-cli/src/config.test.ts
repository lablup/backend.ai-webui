import { CONFIG_FILE, configPath, readConfig, updateConfig } from './config.js';
import { configDir } from './paths.js';
import { mkdtempSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const freshEnv = () => ({
  BAI_AGENT_CONFIG_DIR: mkdtempSync(join(tmpdir(), 'bai-agent-config-')),
});

describe('config.json', () => {
  it('lives in the config dir next to sessions/', () => {
    const env = freshEnv();
    expect(configPath(env)).toBe(join(configDir(env), CONFIG_FILE));
  });

  it('reads {} when there is no file or it is not JSON', () => {
    const env = freshEnv();
    expect(readConfig(env)).toEqual({});
    mkdirSync(configDir(env), { recursive: true });
    writeFileSync(configPath(env), '{not json');
    expect(readConfig(env)).toEqual({});
  });

  it('drops malformed values instead of passing them on', () => {
    const env = freshEnv();
    mkdirSync(configDir(env), { recursive: true });
    writeFileSync(
      configPath(env),
      JSON.stringify({
        endpoint: {},
        managerVersion: 3,
        sync: { ref: {}, commit: 'abc' },
        unknown: true,
      }),
    );
    expect(readConfig(env)).toEqual({});
    writeFileSync(
      configPath(env),
      JSON.stringify({ sync: { ref: 'main', commit: 'abc' } }),
    );
    expect(readConfig(env)).toEqual({
      sync: { ref: 'main', commit: 'abc', syncedAt: '' },
    });
  });

  it('merges patches and removes keys set to undefined', () => {
    const env = freshEnv();
    updateConfig({ endpoint: 'https://manager.example.com' }, env);
    updateConfig(
      { sync: { ref: 'main', commit: 'abc', syncedAt: '2026-08-31' } },
      env,
    );
    expect(readConfig(env)).toEqual({
      endpoint: 'https://manager.example.com',
      sync: { ref: 'main', commit: 'abc', syncedAt: '2026-08-31' },
    });
    updateConfig({ endpoint: undefined }, env);
    expect(readConfig(env).endpoint).toBeUndefined();
    expect(readConfig(env).sync?.ref).toBe('main');
    expect(readFileSync(configPath(env), 'utf8').endsWith('\n')).toBe(true);
  });
});
