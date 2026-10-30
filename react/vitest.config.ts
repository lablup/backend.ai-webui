import { relay } from './vite-plugins/relay';
import stylexVite from '@stylexjs/unplugin/vite';
import react from '@vitejs/plugin-react';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import svgr from 'vite-plugin-svgr';
import { defineConfig } from 'vitest/config';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const buiSrc = resolve(projectRoot, 'packages/backend.ai-ui/src');
const buiArtifactDir = resolve(buiSrc, '__generated__');
const reactSrc = resolve(__dirname, 'src');
const reactArtifactDir = resolve(reactSrc, '__generated__');

/**
 * Vitest config for the `react/` workspace (FR-2609).
 *
 * Deliberately separate from `vite.config.ts`: the main Vite config contains
 * dev-server middlewares, `transformIndexHtml` hooks, PWA generation, and
 * other things that either do not apply in a test runner or would slow it
 * down. What we share with vite.config.ts is the TRANSFORM pipeline — the
 * Relay plugin (per-directory artifactDirectory) and the React Compiler.
 *
 * The intent is that a single source file produces the same transformed
 * code under both `vite:dev` and `vitest`, so tests and the running app
 * exercise identical code paths (e.g., React Compiler `'use memo'`
 * optimisations are active in tests too).
 */
export default defineConfig({
  ssr: { resolve: { conditions: ['@backend.ai/source'] } },
  resolve: {
    conditions: ['@backend.ai/source'],
    alias: [
      // Mirror the `src/` baseUrl import in tsconfig.json so
      // `import 'src/hooks/foo'` resolves under Vitest too.
      { find: /^src\//, replacement: reactSrc + '/' },
      // `backend.ai-client` is mocked in tests (see __test__/backendAiClient.mock.js).
      {
        find: /^backend\.ai-client$/,
        replacement: resolve(__dirname, '__test__/backendAiClient.mock.js'),
      },
      // Existing `.svg` (plain import, not SVGR `?react`) module mock.
      // SVGR `?react` imports are handled by `vite-plugin-svgr` below.
      {
        find: /\.svg$/,
        replacement: resolve(__dirname, '__test__/svg.mock.js'),
      },
      // CSS imports (both `.css` and `.css?raw`) go through the same mock.
      // Array-form aliases REPLACE the matched portion, so we have to match
      // the entire specifier. The regex below anchors both ends via `^.+`.
      {
        find: /^.+\.(css|less|scss|sass)(\?raw)?$/,
        replacement: resolve(__dirname, '__test__/rawCss.mock.js'),
      },
    ],
  },

  plugins: [
    // StyleX compiler — the same one `vite.config.ts` wires for the app
    // (ticket 01). Without it, any module that calls `stylex.create()` at
    // import time throws "Unexpected 'stylex.create' call at runtime", which
    // took out 10 test files that merely import a component using `xstyle`
    // (ticket 30). It must stay ahead of relay() and react(): all are `enforce: 'pre'`.
    //
    // `cssInjectionTarget` is intentionally omitted: vitest aliases every CSS
    // specifier to `__test__/rawCss.mock.js`, so nothing consumes the emitted
    // sheet — only the transform matters here.
    stylexVite({
      useCSSLayers: false,
      // Same anchor as the app build so generated class names match.
      unstable_moduleResolution: { type: 'commonJS', rootDir: projectRoot },
    }),
    relay([
      { srcDir: buiSrc, artifactDirectory: buiArtifactDir },
      { srcDir: reactSrc, artifactDirectory: reactArtifactDir },
    ]),
    react({ compiler: { compilationMode: 'annotation' } }),
    svgr({ include: '**/*.svg?react' }),
  ],

  test: {
    globals: true,
    environment: 'jsdom',
    // Must stay above `setupTests.ts`'s 5s `asyncUtilTimeout`, or a `waitFor`
    // that exhausts its budget is cut off by the runner and reports a bare
    // timeout instead of the assertion diff that names the cause. FR-3617.
    testTimeout: 15_000,
    setupFiles: [resolve(__dirname, 'src/setupTests.ts')],
    // `vite-plugins/**` carries the dev review overlay (FR-3811): plain
    // TypeScript modules with no app imports, so they run under the same
    // jsdom setup without any extra wiring.
    include: [
      'src/**/*.{test,spec}.{ts,tsx}',
      'vite-plugins/**/*.{test,spec}.ts',
    ],
    exclude: ['**/node_modules/**', '**/build/**', '**/__generated__/**'],
    // ui-common's own components import their `.css`, which Node cannot load
    // when the package is externalized; let Vite transform it instead.
    server: { deps: { inline: [/@lablup\/ui-common/] } },

    // CI-only: the transform cache (node_modules/.experimental-vitest-cache)
    // is persisted by actions/cache in vitest-react.yml, cutting warm re-push
    // runs by ~45s. Escape hatch: `pnpm exec vitest --clearCache`.
    experimental: { fsModuleCache: !!process.env.CI },

    // Coverage settings: V8 provider is the fastest (Node's built-in V8
    // inspector with no Babel transform). `json` + `json-summary` are what
    // `davelosert/vitest-coverage-report-action` consumes for the PR comment;
    // `text` keeps a console summary. No `html`: nothing uploads `coverage/`
    // in CI (it was ~26 MB of discarded writes); pass `--coverage.reporter
    // html` locally for the drill-down UI.
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'json-summary'],
      reportsDirectory: 'coverage',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.{test,spec}.{ts,tsx}',
        'src/**/*.stories.{ts,tsx}',
        'src/__generated__/**',
        'src/**/__generated__/**',
        'src/index.tsx',
        'src/reportWebVitals.ts',
      ],
    },
  },
});
