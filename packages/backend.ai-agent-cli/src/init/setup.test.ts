import type { RunContext } from '../command.js';
import { readConfig } from '../config.js';
import { CliError } from '../errors.js';
import type { Prompter } from '../prompt.js';
import { COMMANDS } from '../registry.js';
import { REPO_PACKAGE_NAME } from '../repo-context.js';
import { BLOCK_START, CLAUDE_MD } from './block.js';
import type { SetupDeps } from './setup.js';
import { runSetup } from './setup.js';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const temp = (label: string): string =>
  mkdtempSync(join(tmpdir(), `bai-agent-${label}-`));

function freshEnv() {
  const root = temp('setup');
  return {
    BAI_AGENT_CONFIG_DIR: join(root, 'config'),
    BAI_AGENT_DATA_DIR: join(root, 'data'),
    CLAUDE_CONFIG_DIR: join(root, 'claude'),
  };
}

function context(
  flags: RunContext['flags'],
  cwd = temp('outside'),
): RunContext & { notes: string[] } {
  const notes: string[] = [];
  return {
    cwd,
    commands: COMMANDS,
    args: [],
    flags,
    json: false,
    render: { verbosity: 'normal' },
    notify: (message) => notes.push(message),
    notes,
  };
}

const silent: Prompter = {
  interactive: false,
  text: () => Promise.reject(new Error('no prompt expected')),
  confirm: () => Promise.reject(new Error('no prompt expected')),
};

/** A synced checkout that `sync` "created" and a ref list git "returned". */
function fakeDeps(env: ReturnType<typeof freshEnv>): {
  deps: Partial<SetupDeps>;
  calls: string[];
} {
  const calls: string[] = [];
  const dir = join(env.BAI_AGENT_DATA_DIR, 'checkout');
  const deps: Partial<SetupDeps> = {
    prompter: silent,
    git: (args) => {
      calls.push(`git ${args[0]}`);
      return args[0] === 'ls-remote'
        ? 'a\trefs/tags/v26.8.0\nb\trefs/tags/v26.8.1\nc\trefs/tags/v26.9.0-rc.1'
        : '';
    },
    fetchVersion: async () => {
      calls.push('version');
      return { manager: '26.8.1', apiVersion: 'v8.20240915', source: '/func/' };
    },
    sync: (options) => {
      calls.push(`sync ${options?.ref}`);
      mkdirSync(join(dir, 'data'), { recursive: true });
      writeFileSync(
        join(dir, 'package.json'),
        JSON.stringify({ name: REPO_PACKAGE_NAME, version: '0.0.0-synced' }),
      );
      writeFileSync(join(dir, 'data/schema.graphql'), 'type Query { ok: Int }');
      mkdirSync(join(dir, 'resources/i18n'), { recursive: true });
      mkdirSync(join(dir, 'packages/backend.ai-webui-docs'), {
        recursive: true,
      });
      return {
        kind: 'sync',
        dir,
        repo: 'r',
        ref: options?.ref ?? 'main',
        refSource: 'flag',
        commit: 'abc123def',
        outcome: 'cloned',
        syncedAt: 'now',
        configPath: 'c',
        patterns: [],
      };
    },
    syncSchema: async (_context, options) => {
      calls.push(`schema ${options?.tag}`);
      return {
        kind: 'schema-sync',
        tag: options?.tag ?? '',
        tagSource: 'flag',
        outcome: 'updated',
        dryRun: false,
        schemaChanged: true,
        repo: 'r',
        asset: 'a',
        source: 's',
        schemaPath: 'p',
        metaPath: 'm',
        remoteSha256: 'x',
        remoteBytes: 1,
        byteDelta: 0,
        remoteIsFederated: true,
      };
    },
    login: async (_context, endpoint) => {
      calls.push(`login ${endpoint}`);
      return { email: 'user@example.com', role: 'admin', sessionFile: 'f' };
    },
    installSkill: (options) => {
      calls.push('skill');
      return {
        path: join(options.env?.CLAUDE_CONFIG_DIR ?? '', 'skills', 'bai-agent'),
        source: 'src',
        outcome: 'installed',
        files: ['SKILL.md'],
      };
    },
  };
  return { deps, calls };
}

describe('init setup', () => {
  it('refuses to guess without a TTY, naming the flag it needs', async () => {
    const env = freshEnv();
    const { deps } = fakeDeps(env);
    await expect(
      runSetup({ context: context({}), env, deps }),
    ).rejects.toMatchObject({
      code: 'usage',
      message: expect.stringContaining('--endpoint'),
    });

    const { deps: fresh, calls } = fakeDeps(env);
    await expect(
      runSetup({
        context: context({ endpoint: 'https://m.example.com' }),
        env,
        deps: fresh,
      }),
    ).rejects.toMatchObject({
      code: 'usage',
      message: expect.stringContaining('--login'),
    });
    // Refused before any side effect: no manager probe, no clone.
    expect(calls).toEqual([]);
    expect(readConfig(env).endpoint).toBeUndefined();
  });

  it('outside a checkout: records the endpoint, syncs the manager-matched tag, aligns the SDL, installs the skill', async () => {
    const env = freshEnv();
    const { deps, calls } = fakeDeps(env);
    const ctx = context({
      endpoint: 'https://m.example.com/',
      'no-login': true,
      skill: true,
    });

    const data = await runSetup({ context: ctx, env, deps });

    expect(data.endpoint).toBe('https://m.example.com');
    expect(data.endpointSource).toBe('flag');
    expect(data.manager).toMatchObject({ manager: '26.8.1' });
    expect(data.ref).toMatchObject({ ref: 'v26.8.1', source: 'manager' });
    expect(data.checkout.source).toBe('synced');
    expect(data.sync).toMatchObject({ outcome: 'cloned' });
    expect(data.schemaSync).toMatchObject({
      tag: '26.8.1',
      outcome: 'updated',
    });
    expect(data.login).toMatchObject({
      skipped: expect.stringContaining('login --endpoint'),
    });
    expect(data.skill).toMatchObject({ outcome: 'installed' });
    expect(data.block).toMatchObject({ skipped: expect.any(String) });
    expect(calls).toEqual([
      'version',
      'git ls-remote',
      'sync v26.8.1',
      'schema 26.8.1',
      'skill',
    ]);
    expect(readConfig(env)).toMatchObject({
      endpoint: 'https://m.example.com',
      managerVersion: '26.8.1',
    });
  });

  it('honours --ref and keeps going when the manager is unreachable', async () => {
    const env = freshEnv();
    const { deps, calls } = fakeDeps(env);
    deps.fetchVersion = async () => {
      throw new Error('ECONNREFUSED');
    };
    const ctx = context({
      endpoint: 'https://m.example.com',
      ref: 'main',
      'no-login': true,
      'no-skill': true,
    });
    const data = await runSetup({ context: ctx, env, deps });
    expect(data.manager).toEqual({ skipped: 'ECONNREFUSED' });
    expect(data.ref).toMatchObject({ ref: 'main', source: 'flag' });
    expect(data.schemaSync).toEqual({ skipped: 'manager version unknown' });
    expect(calls).toEqual(['sync main']);
    expect(ctx.notes.some((note) => note.includes('ECONNREFUSED'))).toBe(true);
  });

  it('inside a checkout: leaves the data alone and refreshes the CLAUDE.md block', async () => {
    const env = freshEnv();
    const { deps, calls } = fakeDeps(env);
    const root = temp('checkout');
    writeFileSync(
      join(root, 'package.json'),
      JSON.stringify({ name: REPO_PACKAGE_NAME, version: '0.0.0-test' }),
    );
    mkdirSync(join(root, 'data'), { recursive: true });
    writeFileSync(join(root, 'data/schema.graphql'), 'type Query { ok: Int }');
    mkdirSync(join(root, 'resources/i18n'), { recursive: true });
    mkdirSync(join(root, 'packages/backend.ai-webui-docs'), {
      recursive: true,
    });
    writeFileSync(join(root, CLAUDE_MD), '# Project\n');

    const ctx = context(
      { endpoint: 'https://m.example.com', login: true, 'no-skill': true },
      join(root, 'data'),
    );
    const data = await runSetup({ context: ctx, env, deps });

    expect(data.checkout).toEqual({ root, source: 'cwd' });
    expect(data.sync).toMatchObject({ skipped: 'inside a checkout' });
    expect(data.schemaSync).toMatchObject({
      skipped: expect.stringContaining('committed SDL'),
    });
    expect(data.login).toEqual({
      email: 'user@example.com',
      role: 'admin',
      sessionFile: 'f',
    });
    expect(data.block).toMatchObject({
      outcome: 'inserted',
      path: join(root, CLAUDE_MD),
    });
    expect(readFileSync(join(root, CLAUDE_MD), 'utf8')).toContain(BLOCK_START);
    expect(calls).toEqual(['version', 'login https://m.example.com']);
  });

  it('asks in a terminal, offering the recorded endpoint as the default', async () => {
    const env = freshEnv();
    const { deps, calls } = fakeDeps(env);
    const asked: string[] = [];
    let first = true;
    deps.prompter = {
      interactive: true,
      text: async (question, fallback) => {
        asked.push(`${question} [${fallback ?? ''}]`);
        return first
          ? ((first = false), 'https://typed.example.com')
          : (fallback ?? '');
      },
      confirm: async (question, fallback) => {
        asked.push(`${question} (${fallback})`);
        return question.startsWith('Log in') ? false : fallback;
      },
    };
    deps.login = async () => {
      throw new Error('should not log in');
    };

    const one = await runSetup({ context: context({}), env, deps });
    expect(one.endpoint).toBe('https://typed.example.com');
    expect(one.endpointSource).toBe('prompt');
    expect(one.login).toMatchObject({
      skipped: expect.stringContaining('not requested'),
    });
    expect(one.skill).toMatchObject({ outcome: 'installed' });

    const two = await runSetup({ context: context({}), env, deps });
    expect(two.endpoint).toBe('https://typed.example.com');
    expect(two.endpointSource).toBe('config');
    expect(asked[0]).toBe('Backend.AI endpoint URL []');
    expect(asked[3]).toBe(
      'Backend.AI endpoint URL [https://typed.example.com]',
    );
    expect(asked.filter((q) => q.startsWith('Log in now?'))).toHaveLength(2);
    expect(
      asked.filter((q) => q.startsWith('Install the Claude Code skill')),
    ).toHaveLength(2);
    expect(calls.filter((call) => call.startsWith('login'))).toHaveLength(0);
  });

  it('treats $BAI_AGENT_CHECKOUT like a checkout: no sync, block written there, SDL untouched', async () => {
    const env = freshEnv();
    const { deps, calls } = fakeDeps(env);
    const root = temp('envcheckout');
    writeFileSync(
      join(root, 'package.json'),
      JSON.stringify({ name: REPO_PACKAGE_NAME, version: '0.0.0-env' }),
    );
    mkdirSync(join(root, 'data'), { recursive: true });
    writeFileSync(join(root, 'data/schema.graphql'), 'type Query { ok: Int }');
    mkdirSync(join(root, 'resources/i18n'), { recursive: true });
    mkdirSync(join(root, 'packages/backend.ai-webui-docs'), {
      recursive: true,
    });
    writeFileSync(join(root, CLAUDE_MD), '# Project\n');

    const data = await runSetup({
      context: context({
        endpoint: 'https://m.example.com',
        'no-login': true,
        'no-skill': true,
      }),
      env: { ...env, BAI_AGENT_CHECKOUT: root },
      deps,
    });
    expect(data.checkout).toEqual({ root, source: 'env' });
    expect(data.sync).toMatchObject({ skipped: 'inside a checkout' });
    expect(data.schemaSync).toMatchObject({ skipped: expect.any(String) });
    expect(data.block).toMatchObject({ outcome: 'inserted' });
    expect(calls).toEqual(['version']);
  });

  it('reports a CLAUDE.md it cannot write as a skipped step, keeping the other outcomes', async () => {
    const env = freshEnv();
    const { deps } = fakeDeps(env);
    const root = temp('noclaude');
    writeFileSync(
      join(root, 'package.json'),
      JSON.stringify({ name: REPO_PACKAGE_NAME, version: '0.0.0-test' }),
    );
    mkdirSync(join(root, 'data'), { recursive: true });
    writeFileSync(join(root, 'data/schema.graphql'), 'type Query { ok: Int }');
    mkdirSync(join(root, 'resources/i18n'), { recursive: true });
    mkdirSync(join(root, 'packages/backend.ai-webui-docs'), {
      recursive: true,
    });

    const data = await runSetup({
      context: context(
        { endpoint: 'https://m.example.com', login: true, skill: true },
        root,
      ),
      env,
      deps,
    });
    expect(data.login).toMatchObject({ email: 'user@example.com' });
    expect(data.skill).toMatchObject({ outcome: 'installed' });
    expect(data.block).toMatchObject({
      skipped: expect.stringContaining(CLAUDE_MD),
    });
  });

  it('reports a failed login as a skipped step instead of aborting', async () => {
    const env = freshEnv();
    const { deps } = fakeDeps(env);
    deps.login = async () => {
      throw new CliError('auth_required', 'rejected');
    };
    const data = await runSetup({
      context: context({
        endpoint: 'https://m.example.com',
        login: true,
        'no-skill': true,
      }),
      env,
      deps,
    });
    expect(data.login).toEqual({ skipped: 'login failed: rejected' });
    expect(data.skill).toMatchObject({ skipped: expect.any(String) });
  });
});
