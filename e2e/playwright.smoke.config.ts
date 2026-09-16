import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';

/**
 * Smoke run against an already-installed WebUI (no dev fixtures, one account).
 *
 * Deliberately does NOT import `playwright.config.ts`: that file loads
 * `e2e/envs/.env.playwright` with `override: true` at module level, which
 * would clobber the operator's E2E_* credentials.
 *
 *   SMOKE_ROLE=admin|user   which role's credentials the run has (required)
 *   E2E_WEBUI_ENDPOINT      the installed WebUI (required)
 *   E2E_<ROLE>_EMAIL / _PASSWORD   that role's account (required)
 *   E2E_WEBSERVER_ENDPOINT  what the login form's endpoint field is filled
 *                           with (default: E2E_WEBUI_ENDPOINT)
 *   SMOKE_REPORT_DIR        report output (default e2e/smoke-report)
 *   SMOKE_INSECURE_TLS=1    accept self-signed certificates
 *   SMOKE_HEADED=1          headed browser
 *
 * See `E2E-TEST-NAMING-GUIDELINES.md` → "Smoke tags" and `README.md`.
 */

const role = process.env.SMOKE_ROLE;
if (role !== 'admin' && role !== 'user') {
  throw new Error(
    `SMOKE_ROLE must be "admin" or "user" (got ${JSON.stringify(role)}). ` +
      'It selects bare @smoke tests plus @smoke-<role> and excludes the other role.',
  );
}
const otherRole = role === 'admin' ? 'user' : 'admin';

// Without these the helpers fall back to the dev-box defaults
// (127.0.0.1:8090, admin@lablup.com) and every login fails slowly.
const rolePrefix = role.toUpperCase();
for (const name of [
  'E2E_WEBUI_ENDPOINT',
  `E2E_${rolePrefix}_EMAIL`,
  `E2E_${rolePrefix}_PASSWORD`,
]) {
  if (!process.env[name]) {
    throw new Error(`${name} must be set for a SMOKE_ROLE=${role} smoke run.`);
  }
}
process.env.E2E_WEBSERVER_ENDPOINT ??= process.env.E2E_WEBUI_ENDPOINT;
// `(?![\w-])` and not `\b`: `@smoke\b` matches inside `@smoke-user`.
const grep = new RegExp(`(@smoke(?![\\w-])|@smoke-${role}(?![\\w-]))`);
const grepInvert = new RegExp(`@smoke-${otherRole}(?![\\w-])`);

const reportDir =
  process.env.SMOKE_REPORT_DIR ?? path.resolve(__dirname, 'smoke-report');

// A cluster that cannot schedule sessions must show RED, not a skip: the
// session-lifecycle agent guard reads this and would otherwise `fixme`.
process.env.BACKEND_AI_AGENTS_AVAILABLE ??= 'true';

export default defineConfig({
  testDir: __dirname,
  fullyParallel: true,
  // One account on a live cluster: no concurrent session/vfolder creation.
  workers: 1,
  retries: 0,
  timeout: 180_000,
  grep,
  grepInvert,
  reporter: [
    ['html', { outputFolder: path.join(reportDir, 'html'), open: 'never' }],
    ['json', { outputFile: path.join(reportDir, 'results.json') }],
    ['list'],
  ],
  snapshotPathTemplate: `${__dirname}/{testFileDir}/snapshot/{arg}{ext}`,
  use: {
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    headless: process.env.SMOKE_HEADED !== '1',
    ignoreHTTPSErrors: process.env.SMOKE_INSECURE_TLS === '1',
    permissions: ['local-network-access'],
    // Same bound as the root config (FR-3090): one stuck action must not eat
    // the whole per-test budget.
    actionTimeout: 30_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], locale: 'en-US' },
      // The root config's `cleanup` teardown is not wired in: its sweep
      // delete-forevers every vfolder containing "e2e-" the account can see —
      // data loss on a customer cluster. Smoke specs reap their own artifacts.
      testIgnore: /global-cleanup\.teardown\.ts/,
    },
  ],
});
