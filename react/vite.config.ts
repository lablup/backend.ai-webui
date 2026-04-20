import react from '@vitejs/plugin-react';
import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import svgr from 'vite-plugin-svgr';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const buiSrc = resolve(projectRoot, 'packages/backend.ai-ui/src');
const buiArtifactDir = resolve(buiSrc, '__generated__');
const reactSrc = resolve(__dirname, 'src');
const reactArtifactDir = resolve(reactSrc, '__generated__');

/**
 * Project-root paths that craco's devServer.static block (craco.config.cjs:35-45)
 * serves during dev. Because our Vite `root` is `react/` (so pnpm can resolve
 * react/react-dom from react/node_modules), we need middleware to serve these
 * paths from projectRoot ourselves.
 *
 * These paths are strict prefixes (end with '/') or exact filenames. They do
 * NOT include `/react/` or `/src/` — those paths must fall through to Vite's
 * own handling so the React bundle and source modules are served correctly.
 */
const STATIC_PREFIXES_FROM_ROOT = [
  '/resources/',
  '/manifest/',
  '/dist/',
];
const STATIC_FILES_FROM_ROOT = new Set([
  '/config.toml',
  '/version.json',
  '/manifest.json',
  '/favicon.ico',
]);

const MIME: Record<string, string> = {
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.json': 'application/json',
  '.css': 'text/css',
  '.html': 'text/html',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.toml': 'text/plain; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
};

/**
 * Serve static assets from the project root (not from `react/`) and read the
 * project-root `index.html` as the SPA template. Mirrors the behaviour of the
 * existing craco devServer.static + HtmlWebpackPlugin setup.
 */
function projectRootStaticPlugin(): Plugin {
  const rootIndexHtml = resolve(projectRoot, 'index.html');

  return {
    name: 'bai-project-root-static',
    configureServer(server) {
      // Middleware order: this runs before Vite's internal middlewares, so we
      // can intercept `/` for the project-root index.html and static prefixes
      // for legacy assets.
      server.middlewares.use(async (req, res, next) => {
        if (!req.url) return next();
        const url = req.url.split('?')[0];

        // 1. Serve the project-root index.html at `/` and `/index.html`,
        //    running the full Vite transform chain (which includes our
        //    `transformIndexHtml` hook below + Vite's React Refresh and
        //    client script injection).
        if (url === '/' || url === '/index.html') {
          let html = readFileSync(rootIndexHtml, 'utf-8');
          html = await server.transformIndexHtml(req.url, html, req.originalUrl);
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.end(html);
          return;
        }

        // 2. Serve legacy static assets from projectRoot (mirrors craco
        //    devServer.static block).
        const isStaticPrefix = STATIC_PREFIXES_FROM_ROOT.some((p) =>
          url.startsWith(p),
        );
        const isStaticFile = STATIC_FILES_FROM_ROOT.has(url);
        if (isStaticPrefix || isStaticFile) {
          const filePath = join(projectRoot, url);
          if (!filePath.startsWith(projectRoot)) return next();
          if (existsSync(filePath) && statSync(filePath).isFile()) {
            const mime =
              MIME[extname(filePath).toLowerCase()] ?? 'application/octet-stream';
            res.setHeader('Content-Type', mime);
            createReadStream(filePath).pipe(res);
            return;
          }
        }

        next();
      });
    },

    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        return html
          .replace(
            '// DEV_JS_INJECTING',
            'globalThis.process = {env: {NODE_ENV: "development"}};',
          )
          .replace(
            '<!-- REACT_BUNDLE_INJECTING FOR DEV-->',
            '<script type="module" src="/src/index.tsx"></script>',
          )
          .replace(/\{\{nonce\}\}/g, '');
      },
    },
  };
}

export default defineConfig(({ command, mode }) => {
  Object.assign(process.env, loadEnv(mode, projectRoot, ''));

  // Electron target uses a custom `es6://` URL scheme; the main process
  // registers a protocol handler via `protocol.handle('es6', ...)` in
  // `electron-app/main.js` that resolves `es6://foo` to
  // `<electron-app>/app/foo` on disk. This matches the craco-era
  // `webpackConfig.output.publicPath = 'es6://'` override in
  // `react/craco.config.cjs`.
  //
  // We cannot set `base: 'es6://'` directly: Vite's external-URL regex is
  // `/^([a-z]+:)?\/\//`, and the `6` in `es6` breaks the `[a-z]+` group,
  // so Vite treats `es6://` as a malformed absolute path and strips the
  // scheme. The official escape hatch is `experimental.renderBuiltUrl`,
  // which is called per built asset and whose return value replaces the
  // default `base + filename` concatenation — no scheme validation.
  const isElectronBuild =
    command === 'build' && process.env.BUILD_TARGET === 'electron';

  return {
    base: '/',
    experimental: isElectronBuild
      ? {
          renderBuiltUrl(filename) {
            return `es6://${filename}`;
          },
        }
      : undefined,
    // Keep root at `react/` so pnpm's react/react-dom installed in
    // react/node_modules resolve correctly. Static assets from projectRoot
    // are handled by projectRootStaticPlugin above.
    root: __dirname,
    publicDir: false,
    envDir: projectRoot,
    cacheDir: resolve(__dirname, 'node_modules/.vite'),

    resolve: {
      // Force a single instance of shared singletons across the monorepo.
      //
      // BUI intentionally maintains its OWN i18n instance (see the note in
      // packages/backend.ai-ui/vite.config.ts). Do NOT add `i18next` or
      // `react-i18next` here — the design relies on each side having its
      // own default singleton. React, Relay, Jotai must still be deduped
      // so hooks/state sharing works across the monorepo.
      dedupe: [
        'react',
        'react-dom',
        'react-relay',
        'relay-runtime',
        'jotai',
      ],
      // Array form lets us mix regex aliases (for `src/` baseUrl imports) with
      // the workspace-package aliases. `find` is matched against the import
      // source; `replacement` replaces the match.
      alias: [
        // tsconfig.json baseUrl: "." allows `import 'src/hooks/x'` inside
        // react/. Replicate that here — regex form ensures we only rewrite
        // imports that start with `src/`, not ones like `backend.ai-ui/src/`.
        { find: /^src\//, replacement: reactSrc + '/' },

        // backend.ai-ui workspace package, dev-aliased to source (matches
        // craco.config.cjs:413-425).
        { find: /^backend\.ai-ui\/dist(\/|$)/, replacement: buiSrc + '$1' },
        { find: /^backend\.ai-ui$/, replacement: buiSrc },

        // Backend.AI client ESM library alias (matches craco.config.cjs:409-412).
        {
          find: /^backend\.ai-client-esm$/,
          replacement: resolve(projectRoot, 'dist/lib/backend.ai-client-esm.js'),
        },

        // ESM shims for CJS-only transitive deps of `react-i18next`.
        //
        // Why: `react-i18next` and `i18next` are intentionally excluded
        // from Vite's dep optimizer (see `optimizeDeps.exclude` below) so
        // two physical copies can coexist — that's what preserves BUI's
        // i18n Context isolation from the host app. The side effect is
        // that their CJS transitive deps (`void-elements`,
        // `use-sync-external-store/shim`) never go through the
        // optimizer's CJS→ESM transform, which breaks the browser's
        // native ESM `import default from 'cjs-pkg'` expectation.
        //
        // These aliases redirect those imports to hand-written ESM
        // shims under `react/vite-shims/` — `void-elements` is a plain
        // lookup object, and `use-sync-external-store/shim` re-exports
        // React 19's native `useSyncExternalStore`.
        {
          find: /^void-elements$/,
          replacement: resolve(__dirname, 'vite-shims/void-elements.mjs'),
        },
        {
          find: /^use-sync-external-store\/shim$/,
          replacement: resolve(
            __dirname,
            'vite-shims/use-sync-external-store-shim.mjs',
          ),
        },
      ],
    },

    optimizeDeps: {
      // Tell Vite exactly which files to scan for dependency optimization.
      // Without this, Vite crawls from `root` following all imports, which
      // pulled in stale legacy Lit plugins under scripts/temp-releases/ on
      // the first run.
      entries: [
        'src/index.tsx',
        'src/**/*.{ts,tsx}',
      ],
      exclude: [
        'backend.ai-ui',
        // BUI is designed to have its OWN i18n singleton separate from the
        // host app (see packages/backend.ai-ui/src/locale/index.ts +
        // BAIConfigProvider wraps children with <I18nextProvider i18n={buiI18n}>).
        //
        // Under CRA this worked because pnpm's per-package i18next/react-i18next
        // copies (split by typescript peer version) meant both `react-i18next`
        // copies had DIFFERENT React Context objects. BUI's Provider published
        // to its own Context; host's useTranslation read host's Context.
        //
        // Under Vite's dep optimizer the two copies collapse into one bundled
        // module = one Context object. BAIConfigProvider's Provider then
        // leaks into host components and they resolve host keys against BUI's
        // resource set (which only has BUI keys) → raw keys render.
        //
        // Excluding from optimization preserves natural pnpm-per-package
        // resolution and keeps the two Context objects distinct.
        'i18next',
        'react-i18next',
      ],
    },

    server: {
      host: process.env.HOST || '0.0.0.0',
      port: Number(process.env.PORT) || 9083,
      strictPort: false,
      open: false,
      fs: {
        // Allow Vite to read files from the whole monorepo so that the
        // alias to `../dist/lib/...` and `../packages/backend.ai-ui/src`
        // resolves without FS sandbox 403s.
        allow: [projectRoot],
      },
      watch: {
        ignored: [
          '**/node_modules/**',
          '**/build/**',
          '**/.git/**',
          '**/scripts/temp-releases/**',
          resolve(projectRoot, 'config.toml'),
        ],
      },
    },

    plugins: [
      // Must run before @vitejs/plugin-react so we own the HTML transform
      // and the index.html resolution.
      projectRootStaticPlugin(),

      react({
        babel: (id) => {
          const isBUI = id.startsWith(buiSrc);
          const isReactSrc = id.startsWith(reactSrc);
          const plugins: Array<string | [string, unknown]> = [
            ['babel-plugin-react-compiler', { compilationMode: 'annotation' }],
          ];
          if (isBUI) {
            plugins.push([
              'babel-plugin-relay',
              { artifactDirectory: buiArtifactDir },
            ]);
          } else if (isReactSrc) {
            plugins.push([
              'babel-plugin-relay',
              { artifactDirectory: reactArtifactDir },
            ]);
          }
          return { plugins };
        },
      }),

      svgr({
        include: '**/*.svg?react',
      }),

      nodePolyfills({
        include: ['buffer', 'stream'],
        globals: {
          Buffer: true,
          global: false,
          process: false,
        },
      }),
    ],

    build: {
      outDir: resolve(__dirname, 'build'),
      emptyOutDir: true,
      sourcemap: true,
    },
  };
});
