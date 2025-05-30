import react from '@vitejs/plugin-react';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import relay from 'vite-plugin-relay-lite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
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
      fileName: 'backendai-ui',
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
  },
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: 'src/__generated__/*',
          dest: '__generated__/',
        },
      ],
    }),
    relay({
      module: 'esmodule',
    }),
    react(),
    dts({
      include: ['src/**/*'],
      exclude: ['src/*/*/*.stories.ts', 'src/__generated__/*'],
      rollupTypes: true,
      insertTypesEntry: true,
    }),
  ],
});
