import {
  e2ePartFilter,
  e2eRunLine,
  resolveE2EEnvFile,
  resolveE2EParts,
} from "./e2e/e2e-parts";
import { defineConfig, devices } from "@playwright/test";
import * as dotenv from "dotenv";
import * as path from "path";

/*
 * E2E_PART narrows the `chromium` project to folders of the suite
 * (e2e/e2e-parts.ts); unset means all. E2E_ENV_FILE picks the env file:
 * default e2e/envs/.env.playwright; a part list with `admin` requires
 * e2e/envs/.env.playwright.admin. One run talks to one server.
 */
const requestedPart = process.env.E2E_PART;
const requestedEnvFile = process.env.E2E_ENV_FILE;
const e2eParts = resolveE2EParts(requestedPart);
const e2eEnvFile = resolveE2EEnvFile(e2eParts, requestedEnvFile, {
  root: __dirname,
});
dotenv.config({ path: e2eEnvFile, override: true });
// Workers re-evaluate this file, so an env file must not change the selection.
for (const [key, value] of [
  ["E2E_PART", requestedPart],
  ["E2E_ENV_FILE", requestedEnvFile],
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

// Separate outputs per part, so one part's run does not wipe the other's;
// PLAYWRIGHT_HTML_OUTPUT_DIR / PLAYWRIGHT_HTML_REPORT and --output still win.
const partOutput = e2eParts.includes("all") ? undefined : e2eParts.join("-");
const htmlReporter: [string, Record<string, unknown>] = [
  "html",
  {
    open: "never",
    ...(partOutput && { outputFolder: `playwright-report/${partOutput}` }),
  },
];

// One saved-login directory per run (e2e/utils/login-state.ts); workers
// inherit the variable, and globalTeardown deletes the directory.
if (!process.env.TEST_WORKER_INDEX && !process.env.E2E_LOGIN_STATE_RUN) {
  process.env.E2E_LOGIN_STATE_RUN = `${Date.now()}-${process.pid}`;
}

const teardownSpec = /global-cleanup\.teardown\.ts/;
const partFilter = e2ePartFilter(e2eParts, path.join(__dirname, "e2e"));
/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */

export default defineConfig({
  testDir: "./e2e",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  ...(partOutput && { outputDir: `test-results/${partOutput}` }),
  reporter: process.env.CI
    ? [htmlReporter, ["github"]]
    : [htmlReporter, ["list"]],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  /* Default timeout for each test */
  timeout: 180000,
  globalTeardown: "./e2e/utils/login-state-teardown.ts",
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://127.0.0.1:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
    permissions: ["local-network-access"],
    /*
     * Bound every action (click/fill/check/hover/…) so a single stuck action
     * cannot consume the whole 180s test budget. Without this, a transiently
     * pointer-blocked click — e.g. an antd notification/tooltip portal briefly
     * overlapping a tab or row button during the best-effort vfolder cleanup
     * sweep — would retry until the test timeout, hanging the cleanup and
     * leaving e2e-* orphans on the shared server (FR-3090). 30s is 3x the
     * largest explicit per-action timeout in the suite (10s), so it never cuts
     * a legitimately-slow action short; stuck actions now fail fast with a
     * catchable error that the sweep's skip-and-continue handles.
     */
    actionTimeout: 30000,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], locale: "en-US" },
      // The global cleanup runs as a dedicated teardown project, not as a
      // regular test in the suite. E2E_PART narrows this project rather than
      // adding one per part, so `--project chromium` keeps working.
      ...(partFilter.testMatch && { testMatch: partFilter.testMatch }),
      testIgnore: partFilter.testIgnore
        ? [teardownSpec, partFilter.testIgnore]
        : teardownSpec,
      teardown: "cleanup",
    },

    // Best-effort global cleanup (FR-3090): sweeps leftover e2e-* vfolders and
    // services after the whole suite finishes, regardless of pass/fail, so the
    // shared test server is always left clean. Runs only as chromium's teardown.
    {
      name: "cleanup",
      testMatch: /global-cleanup\.teardown\.ts/,
      use: { ...devices["Desktop Chrome"], locale: "en-US" },
    },

    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],
  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
