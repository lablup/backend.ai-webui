import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/cli.ts'],
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  // The bin must be directly executable; tsup does not add a shebang itself.
  banner: { js: '#!/usr/bin/env node' },
});
