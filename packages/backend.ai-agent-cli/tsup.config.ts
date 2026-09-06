import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/cli.ts'],
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  // The bin must be directly executable; tsup does not add a shebang itself.
  // `createRequire` feeds esbuild's `__require` shim: `yaml` ships CJS, and a
  // bundled CJS dep's `require('node:*')` throws without a real `require`.
  banner: {
    js: [
      '#!/usr/bin/env node',
      "import { createRequire as __bai_createRequire } from 'node:module';",
      'const require = __bai_createRequire(import.meta.url);',
    ].join('\n'),
  },
});
