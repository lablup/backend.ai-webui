import react from '@vitejs/plugin-react';
import glob from 'fast-glob';
import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, relative, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin } from 'vite';
import dts from 'vite-plugin-dts';
import relay from 'vite-plugin-relay-lite';
import svgr from 'vite-plugin-svgr';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Copies the branding-schema JSON assets (schema.json + examples/*.json) from
 * `src/branding-schema/` into `dist/branding-schema/`. Vite's library bundler
 * compiles `.ts` entries but ignores standalone JSON files, so we copy them
 * after the bundle is written.
 */
function copyBrandingSchemaJson(): Plugin {
  return {
    name: 'bui-copy-branding-schema-json',
    apply: 'build',
    closeBundle() {
      const srcDir = resolve(__dirname, 'src/branding-schema');
      const outDir = resolve(__dirname, 'dist/branding-schema');
      const jsonFiles = glob.sync('**/*.json', { cwd: srcDir });
      for (const file of jsonFiles) {
        const from = resolve(srcDir, file);
        const to = resolve(outDir, file);
        mkdirSync(dirname(to), { recursive: true });
        copyFileSync(from, to);
      }
      const rels = jsonFiles.map((f) =>
        relative(__dirname, resolve(outDir, f)),
      );
      // eslint-disable-next-line no-console
      console.log(
        `[bui-copy-branding-schema-json] copied ${rels.length} file(s):`,
        rels.join(', '),
      );
    },
  };
}

export default defineConfig(({ mode }) => {
  const isDevMode = mode === 'development';
  const localeFiles = glob.sync('src/locale/*.ts', { cwd: __dirname });
  const entries: Record<string, string> = {
    'backend.ai-ui': resolve(__dirname, 'src/index.ts'),
    'branding-schema/index': resolve(__dirname, 'src/branding-schema/index.ts'),
    'app-shell/index': resolve(__dirname, 'src/app-shell/index.ts'),
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
          'react-router-dom',
          'relay-runtime',
          'antd',
          'antd-style',
          'graphql',
          // i18next and react-i18next are bundled to isolate BUI's i18n instance from the host app
        ],
      },
      sourcemap: true,
      outDir: 'dist',
      emptyOutDir: !isDevMode,
    },
    plugins: [
      react({
        babel: {
          plugins: [
            [
              'babel-plugin-react-compiler',
              {
                compilationMode: 'annotation',
              },
            ],
          ],
        },
      }),
      relay({
        module: 'esmodule',
        codegen: !isDevMode,
      }),
      dts({
        include: ['src/**/*', 'vite-env.d.ts'],
        exclude: ['**/*.{stories,test}.{ts,tsx}', 'src/locale/*.json'],
        rollupTypes: false,
        insertTypesEntry: true,
        compilerOptions: {
          preserveSymlinks: false,
        },
      }),
      svgr(),
      copyBrandingSchemaJson(),
    ],
    server: {
      watch: {
        ignored: ['**/__generated__/**'],
      },
    },
  };
});
