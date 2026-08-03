// Dedicated Playwright config for user-manual screenshot capture.
//
// Why this exists instead of reusing playwright.config.ts:
//   The default `chromium` project declares `teardown: "cleanup"`, which runs
//   global-cleanup.teardown.ts and SWEEPS leftover e2e vfolders and services on
//   the target server. That is correct for a disposable CI test cluster and
//   dangerous for the shared capture server. Capture is strictly read-only, so
//   it gets a config with no teardown project at all.
//
// Also pins `channel: 'chromium'` (the full browser) rather than the default
// headless shell, which Playwright does not ship for ubuntu 26.04.
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  testMatch: /_capture.*\.spec\.ts/,
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: 'line',
  timeout: 180_000,
  use: {
    ...devices['Desktop Chrome'],
    channel: 'chromium',
    locale: 'en-US',
    // 2x device scale so text is sharp per SCREENSHOT-GUIDELINES.md, without
    // needing document.body.style.zoom gymnastics in every spec.
    deviceScaleFactor: 2,
    viewport: { width: 1440, height: 900 },
    screenshot: 'off',
    video: 'off',
    trace: 'off',
  },
  projects: [
    {
      name: 'capture',
      use: { ...devices['Desktop Chrome'], channel: 'chromium' },
    },
  ],
});
