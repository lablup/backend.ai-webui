import * as fs from 'fs';
import * as path from 'path';

/**
 * The e2e suite is laid out by the console a test acts on, and E2E_PART picks
 * which of those folders a run covers (plan: lablup/backend.ai-webui#11056):
 *
 * - `admin`: `e2e/admin/` (the admin console, `/admin/*`)
 * - `project`: `e2e/project/` (the user console)
 * - `project-admin`: `e2e/project-admin/` (`/project/:projectName/admin/*`)
 * - `common`: `e2e/common/` (auth, config.toml, global search, plugins)
 * - `user`: everything outside `e2e/admin/`, root-level specs included
 * - `all` (default): the whole suite
 *
 * A comma-separated list selects several parts. One Playwright run talks to
 * one server (`e2e/utils/test-util.ts` reads the endpoint and accounts once),
 * so the admin part and the rest run as separate invocations, each with its
 * own env file.
 *
 * The agent suite (`e2e-agent/`, `e2e.config.ts`) has the same part folders
 * and takes the same E2E_PART / E2E_ENV_FILE, through `e2eAgentPartGlobs`
 * and `resolveE2EEnvFile` below.
 */

export const E2E_PARTS = [
  'all',
  'admin',
  'project',
  'project-admin',
  'common',
  'user',
] as const;
export type E2EPart = (typeof E2E_PARTS)[number];

/** Folders under `e2e/` that are a part of their own. */
const PART_FOLDERS = ['admin', 'project', 'project-admin', 'common'] as const;

/** Parses `E2E_PART`; unset or empty means `all`, an unknown value throws. */
export function resolveE2EParts(value: string | undefined): E2EPart[] {
  const parts = (value ?? '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length === 0) return ['all'];
  for (const part of parts) {
    if (!(E2E_PARTS as readonly string[]).includes(part)) {
      throw new Error(
        `E2E_PART must be one or more of ${E2E_PARTS.join(', ')} (got "${part}")`,
      );
    }
  }
  return [...new Set(parts)] as E2EPart[];
}

/**
 * What a part list selects, before it is written as Playwright regexes or
 * e2e globs: everything, everything but `admin/`, or a list of part folders.
 */
type PartSelection =
  | { kind: 'all' }
  | { kind: 'exceptAdmin' }
  | { kind: 'folders'; folders: string[] };

function partSelection(parts: E2EPart[]): PartSelection {
  if (parts.includes('all')) return { kind: 'all' };
  // `user` already holds every folder but admin; adding admin means all.
  if (parts.includes('user')) {
    return parts.includes('admin') ? { kind: 'all' } : { kind: 'exceptAdmin' };
  }
  return {
    kind: 'folders',
    folders: PART_FOLDERS.filter((name) => parts.includes(name)),
  };
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * `testMatch` / `testIgnore` for the `chromium` project, given the absolute
 * path of `e2e/`. Playwright matches these against the absolute file path.
 */
export function e2ePartFilter(
  parts: E2EPart[],
  e2eDir: string,
): { testMatch?: RegExp; testIgnore?: RegExp } {
  const selection = partSelection(parts);
  if (selection.kind === 'all') return {};
  // Either separator, so a Windows path matches before its percent-encoded URL.
  const sep = String.raw`[\\/]`;
  const root = e2eDir
    .split(/[\\/]+/)
    .filter(Boolean)
    .map(escapeRegExp)
    .join(sep);
  const folder = (name: string) => `${root}${sep}${escapeRegExp(name)}${sep}`;
  // Windows paths (drive letter or backslash) are case-insensitive.
  const flags = /^[a-z]:|\\/i.test(e2eDir) ? 'i' : '';
  if (selection.kind === 'exceptAdmin') {
    return { testIgnore: new RegExp(folder('admin'), flags) };
  }
  const { folders } = selection;
  // testMatch replaces Playwright's default, so keep its test-file suffixes.
  const testFile = String.raw`(?=.*\.(?:spec|test)\.[cm]?[jt]sx?$)`;
  return {
    testMatch: new RegExp(
      `(?:${folders.map(folder).join('|')})${testFile}`,
      flags,
    ),
  };
}

export const DEFAULT_E2E_ENV_FILE = './e2e/envs/.env.playwright';
export const ADMIN_E2E_ENV_FILE = './e2e/envs/.env.playwright.admin';

/**
 * The env file a run reads: E2E_ENV_FILE when set (it must exist), else the
 * admin env file for a part list with `admin` (it must exist, so admin tests
 * never fall back to the user server), else `.env.playwright`. With `root`,
 * the paths are resolved against it instead of the working directory.
 */
export function resolveE2EEnvFile(
  parts: E2EPart[],
  requested: string | undefined,
  {
    root,
    exists = fs.existsSync,
  }: { root?: string; exists?: (file: string) => boolean } = {},
): string {
  const at = (file: string) => (root ? path.resolve(root, file) : file);
  if (requested) {
    if (!exists(at(requested))) {
      throw new Error(`E2E_ENV_FILE not found: ${requested}`);
    }
    return at(requested);
  }
  if (!parts.includes('admin')) return at(DEFAULT_E2E_ENV_FILE);
  if (!exists(at(ADMIN_E2E_ENV_FILE))) {
    throw new Error(
      `E2E_PART=${parts.join(',')} needs ${ADMIN_E2E_ENV_FILE} (copy ` +
        `e2e/envs/.env.playwright.admin.sample) or an explicit E2E_ENV_FILE`,
    );
  }
  return at(ADMIN_E2E_ENV_FILE);
}

/**
 * `tests` globs of `e2e.config.ts` for the agent suite under `agentDir`
 * (relative to the project root), by the same folder rule as
 * `e2ePartFilter`. Root-level `*.setup.e2e.ts` files (sign-in sessions) are
 * in every part, since the tests of every part restore their sessions.
 */
export function e2eAgentPartGlobs(
  parts: E2EPart[],
  agentDir = 'e2e-agent',
): string[] {
  const selection = partSelection(parts);
  const every = `${agentDir}/**/*.e2e.ts`;
  if (selection.kind === 'all') return [every];
  if (selection.kind === 'exceptAdmin') return [every, `!${agentDir}/admin/**`];
  return [
    `${agentDir}/*.setup.e2e.ts`,
    ...selection.folders.map((name) => `${agentDir}/${name}/**/*.e2e.ts`),
  ];
}

/** The `[e2e] part=… env=… webui=… webserver=…` line both configs print. */
export function e2eRunLine(
  parts: E2EPart[],
  envFile: string,
  root: string,
  webui: string | undefined,
  webserver: string | undefined,
): string {
  const host = (url?: string) => {
    try {
      return new URL(url ?? '').host;
    } catch {
      return '(unset)';
    }
  };
  return (
    `[e2e] part=${parts.join(',')} env=${path.relative(root, envFile)}` +
    ` webui=${host(webui)} webserver=${host(webserver)}`
  );
}

/**
 * A results folder name for a part list: the same parts in any order give the
 * same name, and `+` keeps `project+admin` apart from `project-admin`.
 */
export function e2ePartOutputName(parts: E2EPart[]): string {
  return E2E_PARTS.filter((part) => parts.includes(part)).join('+');
}
