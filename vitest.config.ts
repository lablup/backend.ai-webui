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
    include: ["{src,scripts}/**/*.{test,spec}.ts"],
    exclude: [
      "**/node_modules/**",
      "**/build/**",
      "**/dist/**",
      // react/ and packages/ workspaces have their own vitest configs.
      "react/**",
      "packages/**",
    ],

    // V8 coverage instrumentation slows down tests significantly on CI's
    // smaller boxes. `gen-theme-schema.test.ts > generates a valid JSON
    // schema file` exercises the antd type tree several times per test
    // and routinely takes 5–10s under coverage. Bump the per-test timeout
    // so CI matches a normal local run without coverage.
    testTimeout: 30000,

    // Coverage settings — see comment in `react/vitest.config.ts`. Same
    // reporters and provider so the `davelosert/vitest-coverage-report-action`
    // PR comment shape is consistent across the three workspaces.
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "json-summary", "html"],
      reportsDirectory: "coverage",
      include: ["{src,scripts}/**/*.{ts,js,cjs}"],
      exclude: [
        "{src,scripts}/**/*.{test,spec}.ts",
        "src/wsproxy/**",
        "src/lib/backend.ai-client-node.*",
        // Build tooling — instrumenting these slows tests without giving
        // useful coverage signal. They are exercised end-to-end by the
        // tests but the coverage % of build scripts is not actionable.
        "scripts/**/*.cjs",
      ],
    },
  },
});
