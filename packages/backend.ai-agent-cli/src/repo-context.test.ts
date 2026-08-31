import { CliError } from './errors.js';
import { syncedCheckoutDir } from './paths.js';
import {
  CHECKOUT_ENV,
  REPO_PACKAGE_NAME,
  locateRepo,
  resolveRepoContext,
} from './repo-context.js';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const tempDir = (): string => mkdtempSync(join(tmpdir(), 'bai-agent-'));

/** An env with nothing synced and no override, whatever this machine holds. */
const bareEnv = () => ({ BAI_AGENT_DATA_DIR: tempDir() });

function fakeCheckout(root = tempDir(), version = '0.0.0-test'): string {
  writeFileSync(
    join(root, 'package.json'),
    JSON.stringify({ name: REPO_PACKAGE_NAME, version }),
  );
  mkdirSync(join(root, 'data'), { recursive: true });
  writeFileSync(join(root, 'data/schema.graphql'), '');
  mkdirSync(join(root, 'resources/i18n'), { recursive: true });
  mkdirSync(join(root, 'packages/backend.ai-webui-docs'), { recursive: true });
  return root;
}

describe('resolveRepoContext', () => {
  it('finds the checkout by walking up from a nested directory', () => {
    const context = resolveRepoContext(import.meta.dirname);
    expect(context.repoRoot.length).toBeGreaterThan(0);
    expect(context.schemaPath).toBe(
      join(context.repoRoot, 'data/schema.graphql'),
    );
    expect(context.i18nDir).toBe(join(context.repoRoot, 'resources/i18n'));
    expect(context.docsDir).toBe(
      join(context.repoRoot, 'packages/backend.ai-webui-docs'),
    );
    expect(context.repoVersion).not.toBe('unknown');
    expect(context.source).toBe('cwd');
  });

  it('throws repo_not_found outside a checkout, naming what it looked for', () => {
    try {
      resolveRepoContext(tempDir(), bareEnv());
      expect.unreachable('should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(CliError);
      const cliError = error as CliError;
      expect(cliError.code).toBe('repo_not_found');
      expect(cliError.exitCode).toBe(1);
      expect(cliError.message).toContain(REPO_PACKAGE_NAME);
      expect(cliError.suggestions).toEqual(
        expect.arrayContaining([
          'data/schema.graphql',
          'resources/i18n',
          'packages/backend.ai-webui-docs',
        ]),
      );
      expect(cliError.hint).toBe('bai-agent sync');
    }
  });

  it('falls back to $BAI_AGENT_CHECKOUT, then to the synced checkout', () => {
    const env = bareEnv();
    const outside = tempDir();
    expect(locateRepo(outside, env)).toBeNull();

    const synced = fakeCheckout(
      (mkdirSync(syncedCheckoutDir(env), { recursive: true }),
      syncedCheckoutDir(env)),
      '0.0.0-synced',
    );
    expect(locateRepo(outside, env)).toEqual({
      root: synced,
      version: '0.0.0-synced',
      source: 'synced',
    });
    expect(resolveRepoContext(outside, env).source).toBe('synced');

    const override = fakeCheckout(tempDir(), '0.0.0-env');
    const withEnv = { ...env, [CHECKOUT_ENV]: override };
    expect(locateRepo(outside, withEnv)).toEqual({
      root: override,
      version: '0.0.0-env',
      source: 'env',
    });

    // cwd's own checkout still wins over both.
    const own = fakeCheckout(tempDir(), '0.0.0-cwd');
    expect(locateRepo(join(own, 'data'), withEnv)?.source).toBe('cwd');
  });

  it('refuses a $BAI_AGENT_CHECKOUT that is not a checkout', () => {
    const env = { ...bareEnv(), [CHECKOUT_ENV]: tempDir() };
    expect(() => locateRepo(tempDir(), env)).toThrow(CliError);
    expect(() => locateRepo(tempDir(), env)).toThrow(CHECKOUT_ENV);
  });

  it('throws repo_incomplete when data sources are missing', () => {
    const root = tempDir();
    writeFileSync(
      join(root, 'package.json'),
      JSON.stringify({ name: REPO_PACKAGE_NAME, version: '0.0.0-test' }),
    );
    mkdirSync(join(root, 'resources/i18n'), { recursive: true });

    try {
      resolveRepoContext(root);
      expect.unreachable('should have thrown');
    } catch (error) {
      const cliError = error as CliError;
      expect(cliError.code).toBe('repo_incomplete');
      expect(cliError.exitCode).toBe(1);
      expect(cliError.message).toContain('data/schema.graphql');
      expect(cliError.message).toContain('packages/backend.ai-webui-docs');
      expect(cliError.message).not.toContain('resources/i18n');
    }
  });

  it('treats a source of the wrong kind as missing', () => {
    const root = tempDir();
    writeFileSync(
      join(root, 'package.json'),
      JSON.stringify({ name: REPO_PACKAGE_NAME, version: '0.0.0-test' }),
    );
    // schema as a directory, i18n as a file: both exist, neither is the declared kind.
    mkdirSync(join(root, 'data/schema.graphql'), { recursive: true });
    mkdirSync(join(root, 'resources'), { recursive: true });
    writeFileSync(join(root, 'resources/i18n'), '');
    mkdirSync(join(root, 'packages/backend.ai-webui-docs'), {
      recursive: true,
    });

    try {
      resolveRepoContext(root);
      expect.unreachable('should have thrown');
    } catch (error) {
      const cliError = error as CliError;
      expect(cliError.code).toBe('repo_incomplete');
      expect(cliError.message).toContain('data/schema.graphql');
      expect(cliError.message).toContain('resources/i18n');
      expect(cliError.message).not.toContain('packages/backend.ai-webui-docs');
    }
  });
});
