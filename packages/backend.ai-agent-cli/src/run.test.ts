import { CliError, ERROR_CODES, EXIT, exitCodeForError } from './errors.js';
import { API_VERSION, errorEnvelope } from './output.js';
import { runCli } from './run.js';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const repoCwd = import.meta.dirname;
const outsideCwd = (): string => mkdtempSync(join(tmpdir(), 'bai-agent-out-'));

async function invoke(argv: string[], cwd = repoCwd) {
  let stdout = '';
  let stderr = '';
  const exitCode = await runCli({
    argv,
    cwd,
    io: {
      stdout: (chunk) => {
        stdout += chunk;
      },
      stderr: (chunk) => {
        stderr += chunk;
      },
    },
  });
  return { exitCode, stdout, stderr };
}

describe('exit code mapping', () => {
  it('maps every error code to its documented exit code', () => {
    expect(exitCodeForError('usage')).toBe(EXIT.usage);
    expect(exitCodeForError('auth_required')).toBe(EXIT.authRequired);
    expect(exitCodeForError('mutation_refused')).toBe(EXIT.mutationRefused);
    expect(exitCodeForError('not_found')).toBe(EXIT.notFound);
    expect(exitCodeForError('repo_not_found')).toBe(EXIT.error);
    expect(exitCodeForError('repo_incomplete')).toBe(EXIT.error);
    expect(exitCodeForError('internal')).toBe(EXIT.error);
  });

  it('produces an error envelope for every code', () => {
    for (const code of ERROR_CODES) {
      const envelope = errorEnvelope(
        new CliError(code, `boom ${code}`, {
          suggestions: ['a'],
          hint: 'bai-agent doctor',
        }),
      );
      expect(envelope).toEqual({
        apiVersion: API_VERSION,
        error: `boom ${code}`,
        code,
        suggestions: ['a'],
        hint: 'bai-agent doctor',
      });
    }
  });

  it('omits suggestions and hint when absent', () => {
    expect(errorEnvelope(new CliError('internal', 'boom'))).toEqual({
      apiVersion: API_VERSION,
      error: 'boom',
      code: 'internal',
    });
  });
});

describe('success envelope', () => {
  it('wraps version data', async () => {
    const { exitCode, stdout } = await invoke(['version', '--json']);
    expect(exitCode).toBe(EXIT.ok);
    const parsed = JSON.parse(stdout);
    expect(parsed.apiVersion).toBe(API_VERSION);
    expect(parsed.type).toBe('version');
    expect(parsed.data.cli.name).toBe('bai-agent');
    expect(parsed.data.repo.root.length).toBeGreaterThan(0);
  });

  it('wraps manifest data with the registered commands', async () => {
    const { exitCode, stdout } = await invoke(['manifest', '--json']);
    expect(exitCode).toBe(EXIT.ok);
    const parsed = JSON.parse(stdout);
    expect(parsed.type).toBe('manifest');
    expect(
      parsed.data.commands.map((entry: { name: string }) => entry.name),
    ).toEqual([
      'version',
      'manifest',
      'doctor',
      'search',
      'docs',
      'schema',
      'login',
      'logout',
      'whoami',
      'query',
      'explain',
      'open',
    ]);
  });

  it('wraps doctor data and reports every check as ok inside a checkout', async () => {
    const { exitCode, stdout } = await invoke(['doctor', '--json']);
    expect(exitCode).toBe(EXIT.ok);
    const parsed = JSON.parse(stdout);
    expect(parsed.type).toBe('doctor');
    expect(parsed.data.summary.fail).toBe(0);
    expect(parsed.data.summary.total).toBe(parsed.data.checks.length);
  });
});

describe('failures', () => {
  it('exits 1 outside a checkout, naming what was not found', async () => {
    const { exitCode, stderr } = await invoke(
      ['version', '--json'],
      outsideCwd(),
    );
    expect(exitCode).toBe(EXIT.error);
    const parsed = JSON.parse(stderr);
    expect(parsed.apiVersion).toBe(API_VERSION);
    expect(parsed.code).toBe('repo_not_found');
    expect(parsed.suggestions).toContain('data/schema.graphql');
    expect(parsed.hint).toContain('bai-agent doctor');
  });

  it('reports checkout failures through doctor without throwing', async () => {
    const { exitCode, stdout } = await invoke(
      ['doctor', '--json'],
      outsideCwd(),
    );
    expect(exitCode).toBe(EXIT.error);
    const parsed = JSON.parse(stdout);
    expect(parsed.data.summary.fail).toBeGreaterThan(0);
  });

  it('exits 2 on an unknown command', async () => {
    const { exitCode, stderr } = await invoke(['nope', '--json']);
    expect(exitCode).toBe(EXIT.usage);
    const parsed = JSON.parse(stderr);
    expect(parsed.code).toBe('usage');
    expect(parsed.error).toContain('Unknown command: nope');
    expect(parsed.suggestions).toContain('doctor');
  });

  it('exits 2 on an unknown flag', async () => {
    const { exitCode, stderr } = await invoke(['version', '--nope']);
    expect(exitCode).toBe(EXIT.usage);
    expect(stderr).toContain('code:');
    expect(stderr).toContain('usage');
  });

  it('exits 2 on an unexpected positional argument', async () => {
    const { exitCode, stderr } = await invoke(['version', 'extra', '--json']);
    expect(exitCode).toBe(EXIT.usage);
    expect(JSON.parse(stderr).code).toBe('usage');
  });

  it('exits 2 when --dense and --detail are combined', async () => {
    const { exitCode, stderr } = await invoke([
      'version',
      '--dense',
      '--detail',
    ]);
    expect(exitCode).toBe(EXIT.usage);
    expect(stderr).toContain('mutually exclusive');
  });
});

describe('help', () => {
  it('prints the CLI help with no arguments', async () => {
    const { exitCode, stdout } = await invoke([]);
    expect(exitCode).toBe(EXIT.ok);
    expect(stdout).toContain('Usage: bai-agent [options] [command]');
    expect(stdout).toContain('doctor');
    expect(stdout).toContain('Exit codes:');
  });

  it('prints command help for `<command> --help`', async () => {
    const { exitCode, stdout } = await invoke(['doctor', '--help']);
    expect(exitCode).toBe(EXIT.ok);
    expect(stdout).toContain('Usage: bai-agent doctor');
  });

  it('treats --version as the version command', async () => {
    const { exitCode, stdout } = await invoke(['--version', '--json']);
    expect(exitCode).toBe(EXIT.ok);
    expect(JSON.parse(stdout).type).toBe('version');
  });
});
