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
  if (parts.includes('all')) return {};
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
  if (parts.includes('user')) {
    // `user` already holds every folder but admin; adding admin means all.
    return parts.includes('admin')
      ? {}
      : { testIgnore: new RegExp(folder('admin'), flags) };
  }
  const folders = PART_FOLDERS.filter((name) => parts.includes(name));
  // testMatch replaces Playwright's default, so keep its test-file suffixes.
  const testFile = String.raw`(?=.*\.(?:spec|test)\.[cm]?[jt]sx?$)`;
  return {
    testMatch: new RegExp(
      `(?:${folders.map(folder).join('|')})${testFile}`,
      flags,
    ),
  };
}
