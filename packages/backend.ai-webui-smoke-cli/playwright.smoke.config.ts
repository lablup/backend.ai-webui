import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Playwright configuration for the `bai-smoke` runner.
 *
 * This config is invoked by `bai-smoke run` (`src/runner.ts`) via
 * `npx playwright test --config <this-file>`. The runner is the single
 * place that translates CLI arguments into the env vars consumed here —
 * we deliberately do NOT load `e2e/envs/.env.playwright` from this file
 * because the smoke CLI runs against arbitrary customer endpoints, not
 * the dev fixtures the e2e suite assumes.
 *
 * Env contract (set by the runner):
 *   BAI_SMOKE_REPORT_DIR    — output directory for html / json reports
 *   BAI_SMOKE_WORKERS       — playwright worker count (optional)
 *   BAI_SMOKE_TIMEOUT_MS    — per-test timeout in ms (default 180000)
 *   BAI_SMOKE_GREP          — grep regex source (no slashes), e.g. `@smoke(-any|-admin)?\b`
 *   BAI_SMOKE_GREP_INVERT   — grepInvert regex source (optional)
 *   BAI_SMOKE_PAGES         — comma-separated page directory names (optional)
 *   BAI_SMOKE_HEADED        — '1' to launch a headed browser
 *
 * Test credentials (E2E_*) are set by the runner as well — see
 * `src/config.ts#buildPlaywrightEnv`.
 */

// Resolve repo root e2e/ directory relative to this config file.
// File layout: <repo>/packages/backend.ai-webui-smoke-cli/playwright.smoke.config.ts
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const E2E_DIR = path.resolve(__dirname, '..', '..', 'e2e');

const reportDir = process.env.BAI_SMOKE_REPORT_DIR ?? path.resolve(process.cwd(), 'smoke-report');

const workersEnv = process.env.BAI_SMOKE_WORKERS;
const workers = workersEnv ? Number.parseInt(workersEnv, 10) : undefined;

const timeoutEnv = process.env.BAI_SMOKE_TIMEOUT_MS;
const timeout = timeoutEnv ? Number.parseInt(timeoutEnv, 10) : 180000;

const grepSource = process.env.BAI_SMOKE_GREP;
const grepInvertSource = process.env.BAI_SMOKE_GREP_INVERT;

// Pages filter — match by directory under e2e/. e.g. BAI_SMOKE_PAGES="session,vfolder"
// turns into testMatch ['**/session/**', '**/vfolder/**'].
const pagesEnv = process.env.BAI_SMOKE_PAGES;
const pages = pagesEnv
  ? pagesEnv
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean)
  : undefined;
const testMatch = pages && pages.length > 0 ? pages.map((p) => `**/${p}/**`) : undefined;

const headed = process.env.BAI_SMOKE_HEADED === '1';

export default defineConfig({
  testDir: E2E_DIR,
  testMatch,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: workers && Number.isFinite(workers) && workers > 0 ? workers : undefined,
  timeout: Number.isFinite(timeout) && timeout > 0 ? timeout : 180000,
  grep: grepSource ? new RegExp(grepSource) : undefined,
  grepInvert: grepInvertSource ? new RegExp(grepInvertSource) : undefined,
  reporter: [
    ['html', { outputFolder: path.join(reportDir, 'html'), open: 'never' }],
    ['json', { outputFile: path.join(reportDir, 'results.json') }],
    ['list'],
  ],
  snapshotPathTemplate: `${E2E_DIR}/{testFileDir}/snapshot/{arg}{ext}`,
  use: {
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    headless: !headed,
    ignoreHTTPSErrors: true,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], locale: 'en-US' },
    },
  ],
});
