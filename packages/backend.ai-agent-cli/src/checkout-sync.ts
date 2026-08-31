import { updateConfig } from './config.js';
import type { SyncRecord } from './config.js';
import { CliError } from './errors.js';
import { CLI_NAME } from './meta.js';
import { syncedCheckoutDir } from './paths.js';
import { REQUIRED_SOURCES, sourceStatus } from './repo-context.js';
import { execFileSync } from 'node:child_process';
import { existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';

type Env = Record<string, string | undefined>;

export const DATA_REPO_URL = 'https://github.com/lablup/backend.ai-webui.git';
export const DEFAULT_SYNC_REF = 'main';

/**
 * Non-cone sparse-checkout patterns: exactly what the commands read, and no
 * more. The manual's screenshots (`images/`, ~170 MB across four languages)
 * are excluded, and `react/src` is narrowed to the `.tsx` files the i18n
 * reverse index scans for fragments.
 */
export const SPARSE_PATTERNS = [
  '/package.json',
  '/data/',
  '/resources/i18n/',
  '/packages/backend.ai-webui-docs/',
  '!/packages/backend.ai-webui-docs/**/images/',
  '/react/src/**/*.tsx',
] as const;

/** Runs `git <args>` in `cwd` and returns stdout; throws on a non-zero exit. */
export type GitRunner = (args: string[], cwd?: string) => string;

export const defaultGit: GitRunner = (args, cwd) =>
  execFileSync('git', args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, GIT_TERMINAL_PROMPT: '0' },
  }).trim();

export type CheckoutSyncOutcome = 'cloned' | 'updated' | 'unchanged';

export interface SyncData {
  kind: 'sync';
  dir: string;
  repo: string;
  ref: string;
  commit: string;
  previousCommit?: string;
  outcome: CheckoutSyncOutcome;
  syncedAt: string;
  configPath: string;
  /** The sparse-checkout patterns applied, for `--detail`. */
  patterns: string[];
}

export interface SyncOptions {
  ref?: string;
  /** Discard the existing checkout and clone again. */
  force?: boolean;
  env?: Env;
  git?: GitRunner;
  now?: Date;
  notify?: (message: string) => void;
}

const gitFailure = (error: unknown): string => {
  if (error && typeof error === 'object' && 'stderr' in error) {
    const stderr = String((error as { stderr?: unknown }).stderr ?? '').trim();
    if (stderr) return stderr;
  }
  return error instanceof Error ? error.message : String(error);
};

export function requireGit(git: GitRunner): void {
  try {
    git(['--version']);
  } catch (error) {
    throw new CliError(
      'internal',
      'git is required to sync the data checkout and was not found on PATH.',
      { hint: 'install git, then: bai-agent sync', cause: error },
    );
  }
}

function headOf(git: GitRunner, dir: string): string | undefined {
  try {
    return git(['rev-parse', 'HEAD'], dir);
  } catch {
    return undefined;
  }
}

/**
 * Clone or update the sparse data checkout at `syncedCheckoutDir()` to `ref`.
 * A shallow, blob-filtered clone keeps the transfer to the data itself; every
 * run re-applies the sparse patterns so a CLI upgrade that widens them takes
 * effect on the next sync.
 */
export function syncCheckout(options: SyncOptions = {}): SyncData {
  const env = options.env ?? process.env;
  const git = options.git ?? defaultGit;
  const ref = options.ref?.trim() || DEFAULT_SYNC_REF;
  const dir = syncedCheckoutDir(env);
  const notify = options.notify ?? (() => {});

  requireGit(git);

  if (options.force && existsSync(dir)) {
    notify(`Removing ${dir} (--force).`);
    rmSync(dir, { recursive: true, force: true });
  }

  const fresh = !existsSync(join(dir, '.git'));
  const previousCommit = fresh ? undefined : headOf(git, dir);
  try {
    if (fresh) {
      notify(`Cloning ${DATA_REPO_URL} (${ref}, data paths only) into ${dir}…`);
      git([
        'clone',
        '--quiet',
        '--filter=blob:none',
        '--no-checkout',
        '--depth',
        '1',
        '--branch',
        ref,
        DATA_REPO_URL,
        dir,
      ]);
    } else {
      notify(`Fetching ${ref} into ${dir}…`);
      git(['fetch', '--quiet', '--depth', '1', 'origin', ref], dir);
    }
    git(['sparse-checkout', 'set', '--no-cone', '--', ...SPARSE_PATTERNS], dir);
    // `reset --hard` also discards a locally `schema sync`ed SDL — the ref's
    // own snapshot is the contract; re-run `schema sync` afterwards if needed.
    git(['reset', '--quiet', '--hard', fresh ? 'HEAD' : 'FETCH_HEAD'], dir);
    git(['sparse-checkout', 'reapply'], dir);
  } catch (error) {
    throw new CliError(
      'internal',
      `git failed while syncing ${ref} into ${dir}: ${gitFailure(error)}`,
      {
        hint: `${CLI_NAME} sync --ref ${DEFAULT_SYNC_REF}`,
        cause: error,
      },
    );
  }

  const commit = headOf(git, dir);
  if (!commit) {
    throw new CliError('internal', `No commit checked out in ${dir}.`, {
      hint: `${CLI_NAME} sync --force`,
    });
  }

  const missing = REQUIRED_SOURCES.filter(
    (source) => sourceStatus(dir, source) !== 'ok',
  );
  if (missing.length > 0) {
    throw new CliError(
      'repo_incomplete',
      `Synced ${ref} into ${dir}, but it lacks ${missing
        .map((source) => source.path)
        .join(', ')}.`,
      {
        suggestions: missing.map((source) => source.path),
        hint: `${CLI_NAME} sync --ref ${DEFAULT_SYNC_REF} --force`,
      },
    );
  }

  const syncedAt = (options.now ?? new Date()).toISOString();
  const record: SyncRecord = { ref, commit, syncedAt };
  const { path: configPath } = updateConfig({ sync: record }, env);

  return {
    kind: 'sync',
    dir,
    repo: DATA_REPO_URL,
    ref,
    commit,
    previousCommit,
    outcome: fresh
      ? 'cloned'
      : previousCommit === commit
        ? 'unchanged'
        : 'updated',
    syncedAt,
    configPath,
    patterns: [...SPARSE_PATTERNS],
  };
}
