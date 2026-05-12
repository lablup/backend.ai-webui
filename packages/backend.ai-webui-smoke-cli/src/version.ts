/**
 * Resolves the package version + optional WebUI git SHA at runtime.
 *
 * Reads `package.json` via `createRequire` (the file ships in the published
 * package). The webui SHA is intentionally a placeholder for now — FR-2881
 * will inject the real build-time SHA via a generated module.
 */
import { createRequire } from 'node:module';

const nodeRequire = createRequire(import.meta.url);
const pkg = nodeRequire('../package.json') as {
  name: string;
  version: string;
};

export const CLI_NAME: string = pkg.name;
export const CLI_VERSION: string = pkg.version;

// TODO(FR-2877): inject the webui git SHA at build time so `bai-smoke version`
// reports the exact WebUI revision the smoke specs were captured against.
export const WEBUI_SHA: string = process.env.BAI_SMOKE_WEBUI_SHA ?? 'unknown';

// TODO(FR-2877): read the Playwright version from the bundled dependency once
// the runner is wired in. Today the CLI does not yet depend on Playwright.
export const PLAYWRIGHT_VERSION: string = 'not-bundled';
