import react from '@vitejs/plugin-react';
import glob from 'fast-glob';
import { dirname, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import relay from 'vite-plugin-relay-lite';
import svgr from 'vite-plugin-svgr';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const isDevMode = mode === 'development';
  const localeFiles = glob.sync('src/locale/*.ts', { cwd: __dirname });
  const entries = {
    'backend.ai-ui': resolve(__dirname, 'src/index.ts'),
  };
  // Add locale entries
  localeFiles.forEach((file) => {
    const name = basename(file, '.ts');
    if (name === 'index') return;
    entries[`locale/${name}`] = resolve(__dirname, file);
  });

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
        external: [
          'react',
          'react-dom',
          'i18next',
          'react-i18next',
          'relay-runtime',
          'antd',
          'antd-style',
          'ahooks',
          'lodash',
          'graphql',
          'classnames',
          '@dnd-kit/core',
          '@dnd-kit/modifiers',
          '@dnd-kit/sortable',
          '@dnd-kit/utilities',
        ],
      },
      sourcemap: true,
      outDir: 'dist',
      emptyOutDir: !isDevMode,
    },
    plugins: [
      react(),
      relay({
        module: 'esmodule',
        codegen: !isDevMode,
      }),
      dts({
        include: ['src/**/*'],
        exclude: ['src/*/*/*.stories.ts', 'src/locale/*.json'],
        rollupTypes: false,
        insertTypesEntry: true,
        compilerOptions: {
          preserveSymlinks: false,
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
