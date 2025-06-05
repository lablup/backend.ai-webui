import react from '@vitejs/plugin-react';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'backend.ai-ui',
      fileName: 'backendai-ui',
      formats: ['es'],
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'i18next', 'react-i18next'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          i18next: 'i18next',
          'react-i18next': 'ReactI18Next',
        },
      },
    },
    sourcemap: true,
    outDir: 'dist',
  },
  plugins: [
    react(),
    dts({
      include: ['src/**/*'],
      exclude: ['src/__generated__/**/*', 'src/*/*/*.stories.ts'],
      rollupTypes: true,
    }),
  ],
});
