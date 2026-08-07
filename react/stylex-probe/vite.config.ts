/**
 * SPIKE 14 — mirrors the repo's real plugin chain (react-compiler in annotation
 * mode + babel-plugin-relay + svgr + nodePolyfills + VitePWA) and adds the
 * StyleX compiler DIRECTLY via `@stylexjs/unplugin/vite`, bypassing
 * `@astryxdesign/build` (which declares peer vite ^8).
 */
import stylexVite from '@stylexjs/unplugin/vite';
import react from '@vitejs/plugin-react';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { VitePWA } from 'vite-plugin-pwa';
import svgr from 'vite-plugin-svgr';

const __dirname = dirname(fileURLToPath(import.meta.url));
const reactSrc = resolve(__dirname, '..', 'src');

export default defineConfig({
  root: __dirname,
  plugins: [
    stylexVite({
      // Unlayered output. StyleX's own priority ordering then applies, and the
      // whole sheet outranks Astryx's `@layer astryx-base` per CSS cascade
      // rules — which is exactly what `xstyle` overrides need.
      useCSSLayers: false,
      // Deterministically append the compiled CSS to the entry stylesheet
      // instead of "whichever .css asset rollup emitted first".
      cssInjectionTarget: (fileName: string) => /index-.*\.css$/.test(fileName),
      unstable_moduleResolution: {
        type: 'commonJS',
        rootDir: resolve(__dirname, '..', '..'),
      },
    }),

    react({
      babel: (id: string) => {
        const isReactSrc = id.startsWith(reactSrc);
        const plugins: Array<string | [string, unknown]> = [
          ['babel-plugin-react-compiler', { compilationMode: 'annotation' }],
        ];
        if (isReactSrc) {
          plugins.push([
            'babel-plugin-relay',
            { artifactDirectory: resolve(reactSrc, '__generated__') },
          ]);
        }
        return { plugins };
      },
    }),

    svgr({ include: '**/*.svg?react' }),

    nodePolyfills({
      include: ['buffer', 'stream'],
      globals: { Buffer: 'build', global: false, process: false },
    }),

    VitePWA({
      strategies: 'generateSW',
      filename: 'sw.js',
      injectRegister: false,
      manifest: false,
      devOptions: { enabled: false },
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        globIgnores: ['**/*.map', '**/asset-manifest.json'],
        navigateFallback: null,
      },
    }),
  ],
  server: { port: 5317, strictPort: true, host: '127.0.0.1' },
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
  },
});
