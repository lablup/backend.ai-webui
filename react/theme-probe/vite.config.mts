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
import stylexVite from '@stylexjs/unplugin/vite';
import react from '@vitejs/plugin-react';
import { execSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const reactRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const projectRoot = resolve(reactRoot, '..');

// pnpm's global virtual store lives outside the repo; without allowing it,
// dependency CSS (astryx.css etc.) is rejected by server.fs.allow. Same
// rationale as `resolvePnpmStorePath` in ../vite.config.ts.
const pnpmStorePath = execSync('pnpm store path --silent', {
  encoding: 'utf-8',
}).trim();

// Ticket 14: probe pages now mount real react/src components, some of which
// carry Relay `graphql` tags — compile them exactly like the app dev server
// does (see react/vite.config.ts). BUI sources are consumed via the built
// package here, so only the react/src artifact directory is needed.
const reactArtifactDir = resolve(reactRoot, 'src/__generated__');
const reactSrc = resolve(reactRoot, 'src');

export default defineConfig({
  root: reactRoot,
  // The app build gets `global` from vite-plugin-node-polyfills; here a
  // define is enough (relay-test-utils touches `global` at import time).
  define: { global: 'globalThis' },
  plugins: [
    // Ticket 17: probe pages now mount components authored with Astryx
    // `xstyle` (stylex.create) — compile them exactly like the app dev server
    // (react/vite.config.ts). Same settings; dev server injects CSS itself so
    // cssInjectionTarget only matters for build.
    stylexVite({
      useCSSLayers: false,
      cssInjectionTarget: (fileName: string) =>
        /assets\/index-[^/]*\.css$/.test(fileName),
      unstable_moduleResolution: { type: 'commonJS', rootDir: projectRoot },
    }),
    react({
      babel: (id: string) => ({
        plugins: id.startsWith(reactSrc)
          ? [['babel-plugin-relay', { artifactDirectory: reactArtifactDir }]]
          : [],
      }),
    }),
  ],
  server: {
    host: '127.0.0.1',
    port: 9198,
    strictPort: true,
    fs: {
      allow: [resolve(reactRoot, '..'), pnpmStorePath],
    },
  },
});
