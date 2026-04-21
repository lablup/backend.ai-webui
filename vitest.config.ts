import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Vitest config for repo-root `/src` and `/scripts` tests (FR-2609).
 *
 * These are small Node-environment suites (pep440, dev-config, gen-theme-schema,
 * i18n-merge-driver) that previously ran under `ts-jest`. They do not need a
 * browser DOM, React, or Relay — so this config is deliberately minimal and
 * does not share the `@vitejs/plugin-react` transform pipeline used by
 * `react/vitest.config.ts` and `packages/backend.ai-ui/vitest.config.ts`.
 */
export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: [
      // Map `jest.*` helpers to their `vi.*` equivalents so tests written
      // against Jest can run under Vitest without per-file renames.
      resolve(__dirname, "__test__/vitest.jest-compat.ts"),
    ],
    include: ["{src,scripts}/**/*.{test,spec}.ts"],
    exclude: [
      "**/node_modules/**",
      "**/build/**",
      "**/dist/**",
      // react/ and packages/ workspaces have their own vitest configs.
      "react/**",
      "packages/**",
    ],
  },
});
