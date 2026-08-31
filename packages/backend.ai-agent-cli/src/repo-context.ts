import { CliError } from './errors.js';
import { CLI_NAME } from './meta.js';
import { syncedCheckoutDir } from './paths.js';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, parse } from 'node:path';

type Env = Record<string, string | undefined>;

/** Points a run at a checkout that is neither `cwd`'s nor the synced one. */
export const CHECKOUT_ENV = 'BAI_AGENT_CHECKOUT';

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

/**
 * How the checkout was found: walking up from `cwd`, from `$BAI_AGENT_CHECKOUT`,
 * or the data checkout `sync` maintains.
 */
export type ContextSource = 'cwd' | 'env' | 'synced';

export interface RepoContext {
  repoRoot: string;
  repoVersion: string;
  source: ContextSource;
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

export interface LocatedRepo {
  root: string;
  version: string;
  source: ContextSource;
}

/** `dir` itself is a checkout root (no walking up). */
function checkoutAt(dir: string): { root: string; version: string } | null {
  const pkg = readRootPackage(dir);
  return pkg?.name === REPO_PACKAGE_NAME
    ? { root: dir, version: pkg.version ?? 'unknown' }
    : null;
}

/**
 * The checkout a run reads: `cwd`'s own first, then `$BAI_AGENT_CHECKOUT`,
 * then the synced data checkout. An env value that is not a checkout is an
 * error rather than a silent fall-through — it was set on purpose.
 */
export function locateRepo(
  cwd: string,
  env: Env = process.env,
): LocatedRepo | null {
  const fromCwd = findRepoRoot(cwd);
  if (fromCwd) return { ...fromCwd, source: 'cwd' };

  const override = env[CHECKOUT_ENV]?.trim();
  if (override) {
    const found = checkoutAt(override);
    if (!found) {
      throw new CliError(
        'repo_not_found',
        `${CHECKOUT_ENV}=${override} is not a ${REPO_PACKAGE_NAME} checkout: no package.json named "${REPO_PACKAGE_NAME}" there.`,
        { hint: `unset ${CHECKOUT_ENV}, or point it at a checkout root` },
      );
    }
    return { ...found, source: 'env' };
  }

  const synced = checkoutAt(syncedCheckoutDir(env));
  return synced ? { ...synced, source: 'synced' } : null;
}

/**
 * Locate the WebUI checkout for `cwd` (see `locateRepo`). Throws a `CliError`
 * naming what was not found, so every command shares one failure message.
 */
export function resolveRepoContext(
  cwd: string,
  env: Env = process.env,
): RepoContext {
  const found = locateRepo(cwd, env);
  if (!found) {
    throw new CliError(
      'repo_not_found',
      `No ${REPO_PACKAGE_NAME} checkout: no ancestor of ${cwd} has a package.json named "${REPO_PACKAGE_NAME}", and nothing is synced at ${syncedCheckoutDir(env)}.`,
      {
        suggestions: [
          `a package.json with "name": "${REPO_PACKAGE_NAME}"`,
          ...REQUIRED_SOURCES.map((source) => source.path),
        ],
        hint: `${CLI_NAME} sync`,
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
        hint:
          found.source === 'synced'
            ? `${CLI_NAME} sync --force`
            : `${CLI_NAME} doctor`,
      },
    );
  }

  return {
    repoRoot: found.root,
    repoVersion: found.version,
    source: found.source,
    schemaPath: join(found.root, 'data/schema.graphql'),
    i18nDir: join(found.root, 'resources/i18n'),
    docsDir: join(found.root, 'packages/backend.ai-webui-docs'),
  };
}

export function tryResolveRepoContext(
  cwd: string,
  env: Env = process.env,
): { ok: true; context: RepoContext } | { ok: false; error: CliError } {
  try {
    return { ok: true, context: resolveRepoContext(cwd, env) };
  } catch (error) {
    if (error instanceof CliError) return { ok: false, error };
    throw error;
  }
}
