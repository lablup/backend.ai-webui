/**
 * Minimal Vite config for the standalone theme probe harness
 * (to-astryx ticket 02).
 *
 * The app dev server cannot serve extra HTML pages: its
 * `projectRootStaticPlugin.transformIndexHtml` (order: 'pre') discards the
 * incoming HTML and always renders the project-root app template, so ANY
 * .html under react/ comes back as the antd app. This config serves the same
 * react/ root with no custom HTML plugins:
 *
 *   cd react && pnpm exec vite --config theme-probe/vite.config.mts
 *   -> http://127.0.0.1:9198/theme-probe/brand.html
 */
import react from '@vitejs/plugin-react';
import { execSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const reactRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// pnpm's global virtual store lives outside the repo; without allowing it,
// dependency CSS (astryx.css etc.) is rejected by server.fs.allow. Same
// rationale as `resolvePnpmStorePath` in ../vite.config.ts.
const pnpmStorePath = execSync('pnpm store path --silent', {
  encoding: 'utf-8',
}).trim();

export default defineConfig({
  root: reactRoot,
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 9198,
    strictPort: true,
    fs: {
      allow: [resolve(reactRoot, '..'), pnpmStorePath],
    },
  },
});
