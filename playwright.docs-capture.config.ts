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
//
// HOST SETUP (ubuntu 26.04) — all three are required, and each fails in a way
// that is easy to miss:
//
//   1. Browsers do not install: Playwright has no ubuntu26.04 build, and
//      `playwright install` prints the failure but STILL EXITS 0. Install with
//        PLAYWRIGHT_HOST_PLATFORM_OVERRIDE=ubuntu24.04-x64 pnpm exec playwright install chromium
//      (the `-x64` suffix is required; bare `ubuntu24.04` is rejected). The same
//      env var must be set when running, not just when installing.
//
//   2. Chromium needs its runtime libs:
//        sudo apt-get install -y libatk1.0-0t64 libatk-bridge2.0-0t64 \
//          libatspi2.0-0t64 libcups2t64 libxkbcommon0 libxcomposite1 \
//          libxdamage1 libxfixes3 libxrandr2 libgbm1 libpango-1.0-0 \
//          libcairo2 libasound2t64 libnss3 libnspr4 libdrm2
//
//   3. CJK + Thai fonts, or ko/ja/th captures render as TOFU BOXES while the
//      English one looks perfect — silent, and only visible by eyeballing the
//      PNG:
//        sudo apt-get install -y fonts-noto-cjk fonts-noto-cjk-extra \
//          fonts-thai-tlwg fonts-noto-core
//      (there is no `fonts-noto-thai` package on 26.04; apt aborts the whole
//      transaction if you ask for it, so install these individually.)
//      Verify with: fc-list :lang=ko | wc -l   (must be > 0, likewise ja / th)
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
      // NOTE: project-level `use` OVERRIDES the top-level `use`, so viewport and
      // deviceScaleFactor must be repeated here — spreading devices['Desktop
      // Chrome'] alone silently resets them to 1280x720 @1x and produces
      // off-spec captures that do not match the existing images' framing.
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chromium',
        // 1440x900 matches the framing of the existing full-page manual
        // screenshots; deviceScaleFactor 2 yields the 2880x1800 output
        // SCREENSHOT-GUIDELINES.md asks for (sharp text without a Retina host).
        viewport: { width: 1440, height: 900 },
        deviceScaleFactor: 2,
      },
    },
  ],
});
