/**
 * Resolves the package version, the bundled Playwright version, and a
 * best-effort WebUI git SHA at runtime.
 *
 * Strategy:
 *   - CLI version: read directly from this package's `package.json`.
 *   - Playwright version: read from `@playwright/test/package.json`.
 *   - WebUI SHA: prefer `BAI_SMOKE_WEBUI_SHA` (set by `build:smoke-cli`
 *     in a future release tarball) → fall back to `git rev-parse HEAD`
 *     when the package is run inside a checkout → `'unknown'` otherwise.
 *     A proper build-time injection ships with FR-2881.
 */
import { execSync } from 'node:child_process';
import { createRequire } from 'node:module';

const nodeRequire = createRequire(import.meta.url);
const pkg = nodeRequire('../package.json') as {
  name: string;
  version: string;
};

export const CLI_NAME: string = pkg.name;
export const CLI_VERSION: string = pkg.version;

export const PLAYWRIGHT_VERSION: string = resolvePlaywrightVersion();
export const WEBUI_SHA: string = resolveWebuiSha();

function resolvePlaywrightVersion(): string {
  try {
    const pwPkg = nodeRequire('@playwright/test/package.json') as {
      version: string;
    };
    return pwPkg.version;
  } catch {
    return 'not-bundled';
  }
}

function resolveWebuiSha(): string {
  if (process.env.BAI_SMOKE_WEBUI_SHA) return process.env.BAI_SMOKE_WEBUI_SHA;
  try {
    return execSync('git rev-parse HEAD', {
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .toString()
      .trim();
  } catch {
    return 'unknown';
  }
}
