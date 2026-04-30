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
 * `@vitejs/plugin-react` configuration with `babel-plugin-relay`
 * (per-directory artifactDirectory) and `babel-plugin-react-compiler`.
 *
 * The intent is that a single source file produces the same transformed
 * code under both `vite:dev` and `vitest`, so tests and the running app
 * exercise identical code paths (e.g., React Compiler `'use memo'`
 * optimisations are active in tests too).
 */
export default defineConfig({
  resolve: {
    alias: [
      // Mirror the `src/` baseUrl import in tsconfig.json so
      // `import 'src/hooks/foo'` resolves under Vitest too.
      { find: /^src\//, replacement: reactSrc + '/' },
      // Workspace package alias (dev-source path, matching the Jest
      // moduleNameMapper entry for `backend.ai-ui`).
      { find: /^backend\.ai-ui\/dist(\/|$)/, replacement: buiSrc + '$1' },
      { find: /^backend\.ai-ui$/, replacement: buiSrc },
      // `backend.ai-client` is mocked in tests (see __test__/backendAiClient.mock.js).
      // The Jest moduleNameMapper handled this explicitly; we use an alias instead.
      {
        find: /^backend\.ai-client$/,
        replacement: resolve(__dirname, '__test__/backendAiClient.mock.js'),
      },
      // Existing `.svg` (plain import, not SVGR `?react`) module mock.
      // SVGR `?react` imports are handled by `vite-plugin-svgr` below.
      { find: /\.svg$/, replacement: resolve(__dirname, '__test__/svg.mock.js') },
      // CSS imports (both `.css` and `.css?raw`) go through the same mock.
      // Array-form aliases REPLACE the matched portion, so we have to match
      // the entire specifier. The regex below anchors both ends via `^.+`.
      {
        find: /^.+\.(css|less|scss|sass)(\?raw)?$/,
        replacement: resolve(__dirname, '__test__/rawCss.mock.js'),
      },
      // `bui-language` helper was mocked by Jest. Replicate the mapping.
      {
        find: /^.*\/helper\/bui-language$/,
        replacement: resolve(__dirname, '__test__/buiLanguage.mock.js'),
      },
    ],
  },

  plugins: [
    react({
      babel: (id) => {
        const isBUI = id.startsWith(buiSrc);
        const isReactSrc = id.startsWith(reactSrc);
        const plugins: Array<string | [string, unknown]> = [
          ['babel-plugin-react-compiler', { compilationMode: 'annotation' }],
        ];
        if (isBUI) {
          plugins.push([
            'babel-plugin-relay',
            { artifactDirectory: buiArtifactDir },
          ]);
        } else if (isReactSrc) {
          plugins.push([
            'babel-plugin-relay',
            { artifactDirectory: reactArtifactDir },
          ]);
        }
        return { plugins };
      },
    }),
    svgr({ include: '**/*.svg?react' }),
  ],

  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [
      resolve(__dirname, 'src/setupTests.ts'),
    ],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/build/**', '**/__generated__/**'],

    // Coverage settings: V8 provider is the fastest (Node's built-in V8
    // inspector with no Babel transform). `json-summary` is what
    // `davelosert/vitest-coverage-report-action` consumes for the PR comment;
    // `text` keeps a console summary; `html` lets developers open
    // `coverage/index.html` locally for inline drill-down.
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'json-summary', 'html'],
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
