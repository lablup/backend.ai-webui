import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Mirrors the app's react() + react-compiler chain, without relay/pwa/svgr.
export default defineConfig({
  root: __dirname,
  plugins: [
    react({
      babel: {
        plugins: [
          ['babel-plugin-react-compiler', { compilationMode: 'annotation' }],
        ],
      },
    }),
  ],
  server: { port: 5199, strictPort: true },
});
