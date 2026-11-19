import react from '@vitejs/plugin-react';
import { Features } from 'lightningcss';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import relay from 'vite-plugin-relay-lite';
import svgr from 'vite-plugin-svgr';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    // @vueless/storybook-dark-mode imports react without declaring it.
    dedupe: ['react', 'react-dom'],
    alias: {
      './__generated__': resolve(__dirname, '../src/__generated__'),
    },
  },
  css: {
    lightningcss: { exclude: Features.LightDark },
  },
  plugins: [
    react({ compiler: { compilationMode: 'annotation' } }),
    relay({ module: 'esmodule', codegen: false }),
    svgr(),
  ],
  server: {
    watch: {
      ignored: ['**/__generated__/**'],
    },
  },
});
