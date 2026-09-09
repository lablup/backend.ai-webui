import type { GitRunner } from './checkout-sync.js';
import {
  DATA_REPO_URL,
  DEFAULT_SYNC_REF,
  SPARSE_PATTERNS,
  syncCheckout,
  validateRef,
} from './checkout-sync.js';
import { readConfig } from './config.js';
import { CliError } from './errors.js';
import { syncedCheckoutDir } from './paths.js';
import { REPO_PACKAGE_NAME, REQUIRED_SOURCES } from './repo-context.js';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const freshEnv = () => {
  const root = mkdtempSync(join(tmpdir(), 'bai-agent-sync-'));
  return {
    BAI_AGENT_CONFIG_DIR: join(root, 'config'),
    BAI_AGENT_DATA_DIR: join(root, 'data'),
  };
};

/** Lays down what a successful clone would leave behind. */
function populate(dir: string): void {
  mkdirSync(join(dir, '.git'), { recursive: true });
  writeFileSync(
    join(dir, 'package.json'),
    JSON.stringify({ name: REPO_PACKAGE_NAME, version: '0.0.0-synced' }),
  );
  for (const source of REQUIRED_SOURCES) {
    if (source.kind === 'file') {
      mkdirSync(join(dir, source.path, '..'), { recursive: true });
      writeFileSync(join(dir, source.path), '');
    } else {
      mkdirSync(join(dir, source.path), { recursive: true });
    }
  }
}

/** A git double that records calls and answers rev-parse from `heads`. */
function fakeGit(options: { heads: string[]; populate?: string }): {
  git: GitRunner;
  calls: string[][];
} {
  const calls: string[][] = [];
  const heads = [...options.heads];
  const git: GitRunner = (args, cwd) => {
    calls.push([...args, ...(cwd ? [`@${cwd}`] : [])]);
    if (args[0] === 'clone' && options.populate) populate(options.populate);
    if (args[0] === 'rev-parse') return heads.shift() ?? heads[0] ?? '';
    return '';
  };
  return { git, calls };
}

describe('syncCheckout', () => {
  it('clones sparse and shallow on first run and records the sync', () => {
    const env = freshEnv();
    const dir = syncedCheckoutDir(env);
    const { git, calls } = fakeGit({ heads: ['abc123'], populate: dir });
    const now = new Date('2026-08-31T00:00:00.000Z');

    const data = syncCheckout({ env, git, now });

    expect(data.outcome).toBe('cloned');
    expect(data.ref).toBe(DEFAULT_SYNC_REF);
    expect(data.refSource).toBe('default');
    expect(data.commit).toBe('abc123');
    expect(data.previousCommit).toBeUndefined();
    expect(data.dir).toBe(dir);
    expect(data.patterns).toEqual([...SPARSE_PATTERNS]);

    const clone = calls.find((call) => call[0] === 'clone');
    expect(clone).toEqual([
      'clone',
      '--quiet',
      '--filter=blob:none',
      '--no-checkout',
      '--depth',
      '1',
      '--branch',
      DEFAULT_SYNC_REF,
      '--',
      DATA_REPO_URL,
      dir,
    ]);
    expect(calls.some((call) => call[0] === 'fetch')).toBe(false);
    const sparse = calls.find(
      (call) => call[0] === 'sparse-checkout' && call[1] === 'set',
    );
    expect(sparse).toEqual([
      'sparse-checkout',
      'set',
      '--no-cone',
      '--',
      ...SPARSE_PATTERNS,
      `@${dir}`,
    ]);

    expect(readConfig(env).sync).toEqual({
      ref: DEFAULT_SYNC_REF,
      commit: 'abc123',
      syncedAt: now.toISOString(),
    });
  });

  it('fetches and resets an existing checkout, reporting unchanged or updated', () => {
    const env = freshEnv();
    const dir = syncedCheckoutDir(env);
    populate(dir);

    const same = fakeGit({ heads: ['abc123', 'abc123'] });
    const unchanged = syncCheckout({ env, git: same.git, ref: 'v26.8.1' });
    expect(unchanged.outcome).toBe('unchanged');
    expect(unchanged.previousCommit).toBe('abc123');
    expect(same.calls.some((call) => call[0] === 'clone')).toBe(false);
    expect(same.calls).toContainEqual([
      'fetch',
      '--quiet',
      '--depth',
      '1',
      '--',
      'origin',
      'v26.8.1',
      `@${dir}`,
    ]);
    expect(same.calls).toContainEqual([
      'reset',
      '--quiet',
      '--hard',
      'FETCH_HEAD',
      `@${dir}`,
    ]);

    const moved = fakeGit({ heads: ['abc123', 'def456'] });
    const updated = syncCheckout({ env, git: moved.git, ref: 'v26.8.1' });
    expect(updated.outcome).toBe('updated');
    expect(updated.previousCommit).toBe('abc123');
    expect(updated.commit).toBe('def456');
    expect(readConfig(env).sync?.ref).toBe('v26.8.1');

    // A bare re-sync keeps the recorded ref instead of drifting to main.
    const bare = fakeGit({ heads: ['def456', 'def456'] });
    const kept = syncCheckout({ env, git: bare.git });
    expect(kept.ref).toBe('v26.8.1');
    expect(kept.refSource).toBe('recorded');
    expect(bare.calls).toContainEqual([
      'fetch',
      '--quiet',
      '--depth',
      '1',
      '--',
      'origin',
      'v26.8.1',
      `@${dir}`,
    ]);
  });

  it('--force discards the checkout and clones again', () => {
    const env = freshEnv();
    const dir = syncedCheckoutDir(env);
    populate(dir);
    const { git, calls } = fakeGit({ heads: ['abc123'], populate: dir });
    const data = syncCheckout({ env, git, force: true });
    expect(data.outcome).toBe('cloned');
    expect(calls.some((call) => call[0] === 'clone')).toBe(true);
  });

  it('refuses a ref that could parse as a git option', () => {
    const env = freshEnv();
    const { git, calls } = fakeGit({ heads: ['abc123'] });
    for (const bad of ['--upload-pack=touch /tmp/x', '-x', 'a..b', 'a b']) {
      expect(() => syncCheckout({ env, git, ref: bad }), bad).toThrow(CliError);
    }
    expect(calls.filter((call) => call[0] !== '--version')).toEqual([]);
    expect(validateRef('v26.8.1')).toBe('v26.8.1');
    expect(validateRef('feature/x_y-z')).toBe('feature/x_y-z');
  });

  it('fails clearly when git is not installed', () => {
    const env = freshEnv();
    const git: GitRunner = () => {
      throw new Error('spawn git ENOENT');
    };
    expect(() => syncCheckout({ env, git })).toThrow(CliError);
    try {
      syncCheckout({ env, git });
    } catch (error) {
      expect((error as CliError).message).toContain('git is required');
    }
  });

  it('surfaces git stderr and hints the default ref when a ref does not exist', () => {
    const env = freshEnv();
    const git: GitRunner = (args) => {
      if (args[0] === '--version') return 'git version 2.53.0';
      const failure = new Error('git exited 128') as Error & { stderr: string };
      failure.stderr = 'fatal: Remote branch nope not found in upstream origin';
      throw failure;
    };
    try {
      syncCheckout({ env, git, ref: 'nope' });
      expect.unreachable('should have thrown');
    } catch (error) {
      const cliError = error as CliError;
      expect(cliError.code).toBe('internal');
      expect(cliError.message).toContain('Remote branch nope not found');
      expect(cliError.hint).toBe(`bai-agent sync --ref ${DEFAULT_SYNC_REF}`);
    }
    expect(readConfig(env).sync).toBeUndefined();
  });

  it('refuses a ref that lacks the data sources', () => {
    const env = freshEnv();
    const dir = syncedCheckoutDir(env);
    const git: GitRunner = (args) => {
      if (args[0] === 'clone') {
        mkdirSync(join(dir, '.git'), { recursive: true });
        writeFileSync(
          join(dir, 'package.json'),
          JSON.stringify({ name: REPO_PACKAGE_NAME, version: '0' }),
        );
      }
      return args[0] === 'rev-parse' ? 'abc123' : '';
    };
    try {
      syncCheckout({ env, git });
      expect.unreachable('should have thrown');
    } catch (error) {
      const cliError = error as CliError;
      expect(cliError.code).toBe('repo_incomplete');
      expect(cliError.message).toContain('data/schema.graphql');
    }
  });
});
