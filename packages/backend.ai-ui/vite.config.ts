import react from '@vitejs/plugin-react';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import relay from 'vite-plugin-relay-lite';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const isDevMode = mode === 'development';
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
        entry: resolve(__dirname, 'src/index.ts'),
        name: 'backend.ai-ui',
        fileName: 'backend.ai-ui',
        formats: ['es'],
      },
      rollupOptions: {
        external: [
          'react',
          'react-dom',
          'i18next',
          'react-i18next',
          'relay-runtime',
        ],
        output: {
          globals: {
            react: 'React',
            'react-dom': 'ReactDOM',
            i18next: 'i18next',
            'react-i18next': 'ReactI18Next',
            'relay-runtime': 'RelayRuntime',
          },
        },
      },
      sourcemap: true,
      outDir: 'dist',
      emptyOutDir: !isDevMode,
    },
    plugins: [
      react(),
      relay({
        module: 'esmodule',
        codegen: false,
      }),
      dts({
        include: ['src/**/*'],
        exclude: ['src/*/*/*.stories.ts'],
        rollupTypes: false,
        insertTypesEntry: true,
        compilerOptions: {
          preserveSymlinks: false,
        },
      }),
    ],
    server: {
      watch: {
        ignored: ['**/__generated__/**'],
      },
    },
  };
});
