import { CliError } from './errors.js';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, parse } from 'node:path';

/** The `name` of the WebUI checkout's root package.json. */
export const REPO_PACKAGE_NAME = 'backend.ai-webui';

/** Data sources the CLI reads live out of the checkout. Nothing is copied. */
export const REQUIRED_SOURCES = [
  { key: 'schemaPath', path: 'data/schema.graphql', kind: 'file' },
  { key: 'i18nDir', path: 'resources/i18n', kind: 'directory' },
  { key: 'docsDir', path: 'packages/backend.ai-webui-docs', kind: 'directory' },
] as const;

export type RequiredSource = (typeof REQUIRED_SOURCES)[number];

export type SourceStatus = 'ok' | 'missing' | 'wrong_kind';

/** Checks that `source` exists under `root` *and* is the declared kind. */
export function sourceStatus(
  root: string,
  source: RequiredSource,
): SourceStatus {
  const stat = statSync(join(root, source.path), { throwIfNoEntry: false });
  if (!stat) return 'missing';
  const matches = source.kind === 'file' ? stat.isFile() : stat.isDirectory();
  return matches ? 'ok' : 'wrong_kind';
}

export interface RepoContext {
  repoRoot: string;
  repoVersion: string;
  schemaPath: string;
  i18nDir: string;
  docsDir: string;
}

function readRootPackage(
  dir: string,
): { name?: string; version?: string } | null {
  const manifest = join(dir, 'package.json');
  if (!existsSync(manifest)) return null;
  try {
    return JSON.parse(readFileSync(manifest, 'utf8')) as {
      name?: string;
      version?: string;
    };
  } catch {
    return null;
  }
}

export function findRepoRoot(
  cwd: string,
): { root: string; version: string } | null {
  let dir = cwd;
  const { root: fsRoot } = parse(dir);
  for (;;) {
    const pkg = readRootPackage(dir);
    if (pkg?.name === REPO_PACKAGE_NAME) {
      return { root: dir, version: pkg.version ?? 'unknown' };
    }
    if (dir === fsRoot) return null;
    const parent = dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

/**
 * Locate the WebUI checkout containing `cwd`. Throws a `CliError` naming what
 * was not found, so every command shares one repo-mode failure message.
 */
export function resolveRepoContext(cwd: string): RepoContext {
  const found = findRepoRoot(cwd);
  if (!found) {
    throw new CliError(
      'repo_not_found',
      `Not inside a ${REPO_PACKAGE_NAME} checkout: no ancestor of ${cwd} has a package.json named "${REPO_PACKAGE_NAME}".`,
      {
        suggestions: [
          `a package.json with "name": "${REPO_PACKAGE_NAME}"`,
          ...REQUIRED_SOURCES.map((source) => source.path),
        ],
        hint: 'cd <backend.ai-webui checkout> && bai-agent doctor',
      },
    );
  }

  const missing = REQUIRED_SOURCES.filter(
    (source) => sourceStatus(found.root, source) !== 'ok',
  );
  if (missing.length > 0) {
    throw new CliError(
      'repo_incomplete',
      `Checkout at ${found.root} is missing ${missing.length} required data source(s): ${missing
        .map((source) => source.path)
        .join(', ')}.`,
      {
        suggestions: missing.map(
          (source) => `${source.path} (${source.kind}) not found`,
        ),
        hint: 'bai-agent doctor',
      },
    );
  }

  return {
    repoRoot: found.root,
    repoVersion: found.version,
    schemaPath: join(found.root, 'data/schema.graphql'),
    i18nDir: join(found.root, 'resources/i18n'),
    docsDir: join(found.root, 'packages/backend.ai-webui-docs'),
  };
}

export function tryResolveRepoContext(
  cwd: string,
): { ok: true; context: RepoContext } | { ok: false; error: CliError } {
  try {
    return { ok: true, context: resolveRepoContext(cwd) };
  } catch (error) {
    if (error instanceof CliError) return { ok: false, error };
    throw error;
  }
}
