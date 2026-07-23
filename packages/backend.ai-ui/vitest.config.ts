import react from '@vitejs/plugin-react';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import relay from 'vite-plugin-relay-lite';
import svgr from 'vite-plugin-svgr';
import { defineConfig } from 'vitest/config';

const __dirname = dirname(fileURLToPath(import.meta.url));
const buiSrc = resolve(__dirname, 'src');
const generatedDir = resolve(buiSrc, '__generated__');

/**
 * Vitest config for `packages/backend.ai-ui/` (FR-2609).
 *
 * Mirrors `react/vitest.config.ts`: the same transform pipeline the real Vite
 * build uses (relay template-tag → require('./__generated__/...'), React
 * Compiler in annotation mode) is applied to tests, so a single source file
 * produces the same compiled output under both `vite build` and `vitest`.
 *
 * BUI's main `vite.config.ts` handles the library build (dts, rollup entries,
 * externals). Those concerns do not apply to the test runner, so this config
 * is deliberately narrower — only the transform pipeline is shared.
 */
export default defineConfig({
  resolve: {
    alias: [
      // Matches the alias in BUI's vite.config.ts so relay imports
      // (`./__generated__/*.graphql`) resolve to `src/__generated__/*.graphql.ts`.
      { find: './__generated__', replacement: generatedDir },
    ],
  },

  plugins: [
    react({
      babel: {
        plugins: [
          ['babel-plugin-react-compiler', { compilationMode: 'annotation' }],
        ],
      },
    }),
    relay({ module: 'esmodule' }),
    svgr(),
  ],

  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [
      resolve(__dirname, 'setupTests.ts'),
    ],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/__generated__/**'],

    // Coverage settings — see comment in `react/vitest.config.ts`. The
    // `davelosert/vitest-coverage-report-action` GitHub Action consumes the
    // `json-summary` reporter to post a PR comment with line/branch/function/
    // statement coverage diffs.
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
        'src/index.ts',
        'src/locale/**',
      ],
    },
  },
});
