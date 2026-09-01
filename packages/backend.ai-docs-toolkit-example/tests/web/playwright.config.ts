import { defineConfig, devices } from "@playwright/test";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PORT = Number(process.env.PORT) || 4567;
// Playwright loads config files as ESM, so __dirname isn't available — derive
// it from import.meta.url. PACKAGE_ROOT points at the example package root.
const HERE = path.dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = path.resolve(HERE, "..", "..");

/**
 * Playwright config for the docs-toolkit example E2E suite.
 *
 * The webServer block boots a tiny static-file server (no new devDeps;
 * see static-server.mjs) against the example's `dist/web/` build output.
 * If `dist/web/` is missing the static server exits 1, which fails fast
 * with a clear "run `pnpm build:web` first" message.
 *
 * Mobile-drawer tests run against a `Pixel 5` device profile (≤768px)
 * inside their own spec — desktop specs use the default viewport.
 */
export default defineConfig({
  testDir: ".",
  fullyParallel: false,
  workers: 1,
  reporter: process.env.CI ? "github" : "list",

  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },

  webServer: {
    command: `node tests/web/static-server.mjs`,
    cwd: PACKAGE_ROOT,
    env: { PORT: String(PORT) },
    url: `http://localhost:${PORT}/`,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },

  projects: [
    {
      name: "desktop-chromium",
      use: { ...devices["Desktop Chrome"] },
      testIgnore: /mobile-drawer\.spec\.ts$/,
    },
    {
      name: "mobile-chromium",
      use: { ...devices["Pixel 5"] },
      testMatch: /mobile-drawer\.spec\.ts$/,
    },
  ],
});
