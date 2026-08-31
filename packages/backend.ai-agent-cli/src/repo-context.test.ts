import { CliError } from './errors.js';
import { REPO_PACKAGE_NAME, resolveRepoContext } from './repo-context.js';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const tempDir = (): string => mkdtempSync(join(tmpdir(), 'bai-agent-'));

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
  });

  it('throws repo_not_found outside a checkout, naming what it looked for', () => {
    try {
      resolveRepoContext(tempDir());
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
      expect(cliError.hint).toContain('bai-agent doctor');
    }
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
