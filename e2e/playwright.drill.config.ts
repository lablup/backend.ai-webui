import { e2eRunLine, resolveE2EEnvFile, resolveE2EParts } from './e2e-parts';
import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

/*
 * Drill run: `pnpm e2e:drill <id>` (e2e/drills/cli.mjs) starts this config.
 * One worker, no retries: a drill mutates a live server and its report should
 * describe what happened once, not the last attempt. E2E_PART / E2E_ENV_FILE
 * pick the env file exactly as playwright.config.ts does, so a drill runs
 * against an already-running server with the same accounts as the suite.
 */
const requestedPart = process.env.E2E_PART;
const requestedEnvFile = process.env.E2E_ENV_FILE;
const e2eParts = resolveE2EParts(requestedPart);
const e2eEnvFile = resolveE2EEnvFile(e2eParts, requestedEnvFile, {
  // This config sits in `e2e/`; the env paths are relative to the repo root.
  root: path.resolve(__dirname, '..'),
});
dotenv.config({ path: e2eEnvFile, override: true });
for (const [key, value] of [
  ['E2E_PART', requestedPart],
  ['E2E_ENV_FILE', requestedEnvFile],
] as const) {
  if (value === undefined) delete process.env[key];
  else process.env[key] = value;
}
if (!process.env.TEST_WORKER_INDEX && (requestedPart || requestedEnvFile)) {
  console.error(
    e2eRunLine(
      e2eParts,
      e2eEnvFile,
      __dirname,
      process.env.E2E_WEBUI_ENDPOINT,
      process.env.E2E_WEBSERVER_ENDPOINT,
    ),
  );
}

// The same per-run login state directory the suite uses (utils/login-state.ts);
// the teardown deletes it.
if (!process.env.TEST_WORKER_INDEX && !process.env.E2E_LOGIN_STATE_RUN) {
  process.env.E2E_LOGIN_STATE_RUN = `${Date.now()}-${process.pid}`;
}

export default defineConfig({
  testDir: path.join(__dirname, 'drills'),
  testMatch: /drill\.spec\.ts$/,
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 240_000,
  reporter: [['list']],
  outputDir: path.resolve(__dirname, '..', 'test-results', 'drills'),
  globalTeardown: path.join(__dirname, 'utils', 'login-state-teardown.ts'),
  use: {
    ...devices['Desktop Chrome'],
    locale: 'en-US',
    trace: 'retain-on-failure',
    permissions: ['local-network-access'],
    actionTimeout: 30_000,
  },
});
