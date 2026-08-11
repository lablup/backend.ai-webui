import react from '@vitejs/plugin-react';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import relay from 'vite-plugin-relay-lite';
import svgr from 'vite-plugin-svgr';

import { peerDependencies } from './package.json';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Rollup matches `external` strings exactly, so bare names left subpaths like
// `react-dom/client` bundled — a second renderer that blank-screens consumers
// on any other React patch (#8595). i18next / react-i18next are dependencies
// rather than peers, so they stay bundled and keep BUI's i18n isolated.
const peerDependencyPatterns = Object.keys(peerDependencies).map(
  // `.` is the only regex metacharacter an npm package name can hold.
  (name) => new RegExp(`^${name.replaceAll('.', '\\.')}(/.*)?$`),
);

export default defineConfig(({ mode }) => {
  const isDevMode = mode === 'development';
  // Single entry. There used to be one extra entry per language
  // (`src/locale/en_US.ts` → `dist/locale/en_US.js`, the `./dist/locale/*`
  // package export), but those modules existed only to re-export
  // `antd/es/locale/*` bundles for antd's `ConfigProvider locale` prop. The
  // to-astryx final switch removed that provider, the 21 modules and the
  // package export together — BUI's OWN translation catalogs are the JSONs in
  // `src/locale/`, which are bundled into this entry, not published as one.
  const entries: Record<string, string> = {
    'backend.ai-ui': resolve(__dirname, 'src/index.ts'),
  };

  return {
    resolve: {
      alias: {
        // This is used to resolve the __generated__ directory for Relay
        // Since relay uses the directory './__generated__' internally, change this to src/__generated__.
        './__generated__': resolve(__dirname, 'src/__generated__'),
      },
    },
    build: {
      lib: {
        entry: entries,
        formats: ['es'],
      },
      rollupOptions: {
        external: peerDependencyPatterns,
      },
      sourcemap: true,
      outDir: 'dist',
      emptyOutDir: !isDevMode,
    },
    plugins: [
      react({
        babel: {
          plugins: [
            [
              'babel-plugin-react-compiler',
              {
                compilationMode: 'annotation',
              },
            ],
          ],
        },
      }),
      relay({
        module: 'esmodule',
        codegen: !isDevMode,
      }),
      dts({
        include: ['src/**/*', 'vite-env.d.ts'],
        exclude: ['**/*.{stories,test}.{ts,tsx}', 'src/locale/*.json'],
        rollupTypes: false,
        insertTypesEntry: true,
        compilerOptions: {
          preserveSymlinks: false,
          rootDir: 'src',
          paths: {}
        },
      }),
      svgr(),
    ],
    server: {
      watch: {
        ignored: ['**/__generated__/**'],
      },
    },
  };
});
