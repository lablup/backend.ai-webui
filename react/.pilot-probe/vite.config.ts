import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  root: __dirname,
  plugins: [react()],
  server: { port: 5311, strictPort: true, host: '127.0.0.1' },
});
