import { nodeResolve } from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import typescript from '@rollup/plugin-typescript';
import { generateSW } from 'rollup-plugin-workbox';
import terser from '@rollup/plugin-terser';

const plugins = (outDir) => [
  nodeResolve(),
  typescript({
    tsconfig: './tsconfig.json',
    outDir: outDir,
  }),
  replace({
    'process.env.NODE_ENV': JSON.stringify('production'),
  }),
  terser(),
  generateSW({
    swDest: 'build/rollup/sw.js',
    globDirectory: 'build/rollup/',
    globPatterns: ['dist/**/*.{html,json,js,css}', 'src/lib/**/*.{js, map}'],
    skipWaiting: true,
  }),
];

/**
 * All Lit components (BackendAIPage, plugins) have been removed.
 * This rollup config now serves only to generate the service worker
 * for production builds. The React application is built by Vite
 * (via `pnpm run -r --stream build`).
 *
 * backend-ai-app.ts is used as a minimal entry point so rollup can run
 * and the generateSW plugin produces sw.js for offline caching.
 */
export default [
  {
    input: ['src/backend-ai-app.ts'],
    output: {
      dir: 'build/rollup/dist/components',
      format: 'es',
      sourcemap: false,
    },
    plugins: plugins('build/rollup/dist/components'),
  },
];
