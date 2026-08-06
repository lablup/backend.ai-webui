import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig } from 'vite';

// SPIKE probe (cn-oss-removal ticket 08). Minimal Vite app, no Relay / PWA /
// polyfills — just enough to render antd Form vs BAIFormItem side by side.
export default defineConfig({
  root: __dirname,
  plugins: [react()],
  resolve: {
    alias: {
      'backend.ai-ui': path.resolve(
        __dirname,
        '../../packages/backend.ai-ui/src/index.ts',
      ),
    },
  },
  server: { port: 5287, strictPort: true, host: '127.0.0.1' },
});
