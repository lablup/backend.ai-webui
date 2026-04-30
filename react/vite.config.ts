import react from '@vitejs/plugin-react';
import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs';
import {
  dirname,
  extname,
  isAbsolute,
  join,
  relative,
  resolve,
} from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { VitePWA } from 'vite-plugin-pwa';
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
/**
 * Trigger a full page reload whenever a project-root runtime-fetched asset
 * changes on disk. Mirrors the `fs.watch` / `fs.watchFile` setup in the
 * craco devServer config (craco.config.cjs:80-147).
 *
 * Why this is needed: `i18next-http-backend` fetches `resources/i18n/*.json`
 * at runtime — those JSONs are NOT part of the Vite module graph, so Vite
 * will never HMR them. A full reload is the only way to pick up an edit.
 * `config.toml`, `resources/theme.json`, and the project-root `index.html`
 * are in the same category.
 *
 * Debounce: 300ms (matches craco). FSEvents on macOS can fire multiple
 * watcher events for a single save; editors that use atomic-save (write
 * temp → rename) produce two events. Debouncing collapses both into one
 * reload signal.
 */
function devAssetsReloadPlugin(): Plugin {
  const watchTargets = [
    resolve(projectRoot, 'config.toml'),
    resolve(projectRoot, 'index.html'),
    resolve(projectRoot, 'resources/i18n'),
    resolve(projectRoot, 'resources/theme.json'),
  ];

  return {
    name: 'bai-dev-assets-reload',
    apply: 'serve',
    configureServer(server) {
      // Vite's `server.watcher` is a chokidar instance. Add our target
      // paths so chokidar emits `change`/`add` events for them even when
      // they are outside the module graph.
      for (const target of watchTargets) {
        server.watcher.add(target);
      }

      let reloadTimer: NodeJS.Timeout | undefined;
      const scheduleReload = (changedPath: string) => {
        clearTimeout(reloadTimer);
        reloadTimer = setTimeout(() => {
          server.config.logger.info(
            `[bai] full reload triggered by ${changedPath}`,
            { clear: false, timestamp: true },
          );
          server.ws.send({ type: 'full-reload' });
        }, 300);
      };

      // Use `path.relative` so containment is detected correctly on Windows,
      // where chokidar emits paths with `\` separators that would never match
      // a `target + '/'` prefix.
      const isMatchedPath = (changedPath: string) =>
        watchTargets.some((target) => {
          const rel = relative(target, changedPath);
          return rel === '' || (!rel.startsWith('..') && !isAbsolute(rel));
        });

      const handler = (changedPath: string) => {
        if (isMatchedPath(changedPath)) {
          scheduleReload(changedPath);
        }
      };

      server.watcher.on('change', handler);
      server.watcher.on('add', handler);
      server.watcher.on('unlink', handler);

      server.httpServer?.on('close', () => {
        clearTimeout(reloadTimer);
      });
    },
  };
}

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
      handler(html, ctx) {
        // In dev (serve), ctx.server is defined; in build, it's undefined.
        // The build-time entry at `react/index.html` is a throwaway stub —
        // we always want to operate on the real project-root template.
        const realHtml = readFileSync(rootIndexHtml, 'utf-8');
        const isServe = !!ctx.server;

        // Always inject the app entry script at the REACT_BUNDLE_INJECTING
        // marker. In dev, Vite serves `/src/index.tsx` directly. In build,
        // Vite's HTML parser sees this tag, bundles `src/index.tsx`, and
        // rewrites the src to the hashed chunk URL.
        let out = realHtml.replace(
          '<!-- REACT_BUNDLE_INJECTING FOR DEV-->',
          '<script type="module" src="/src/index.tsx"></script>',
        );

        if (isServe) {
          // Dev-only: the webpack/craco pipeline injected a tiny
          // `process.env.NODE_ENV` shim here so dev-only code like
          // `if (process.env.NODE_ENV === 'development')` works in the
          // browser. Also strip `{{nonce}}` — the backend replaces it at
          // runtime in prod; in local dev we have no server-side CSP.
          out = out
            .replace(
              '// DEV_JS_INJECTING',
              'globalThis.process = {env: {NODE_ENV: "development"}};',
            )
            .replace(/\{\{nonce\}\}/g, '');
        } else {
          // Build: remove the dev-only marker comment entirely (so the
          // inline script block just has the runtime constants) and
          // PRESERVE `{{nonce}}` so the backend's CSP middleware can
          // substitute it per-request.
          out = out.replace('// DEV_JS_INJECTING', '');
        }

        return out;
      },
    },
  };
}

/**
 * Serve the Monaco AMD runtime at `/resources/monaco/vs/*` from
 * `react/node_modules/monaco-editor/min/vs/*` during dev. Mirrors the
 * `static` directory entry that lived in the deleted `react/craco.config.cjs`.
 *
 * `@monaco-editor/react` resolves the URL prefix via
 *   loader.config({ paths: { vs: '/resources/monaco/vs' } })
 * (see `react/src/helper/monacoEditor.ts`). Self-hosting keeps Monaco
 * working in offline / air-gapped deployments where jsDelivr is unreachable.
 *
 * Production is unchanged: the root `copymonaco` script (`package.json:32`)
 * copies the same tree into `build/web/resources/monaco/vs/`.
 *
 * `min/vs` is Monaco's prebuilt AMD bundle — used here rather than the ESM
 * tree because `@monaco-editor/react` consumes the AMD form to keep the
 * Monaco worker chunks intact for runtime lazy-loading.
 */
function monacoStaticPlugin(): Plugin {
  const monacoRoot = resolve(__dirname, 'node_modules/monaco-editor/min/vs');
  const URL_PREFIX = '/resources/monaco/vs/';

  return {
    name: 'bai-monaco-static',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url) return next();
        const url = req.url.split('?')[0];
        if (!url.startsWith(URL_PREFIX)) return next();

        const rel = url.slice(URL_PREFIX.length);
        const filePath = join(monacoRoot, rel);
        // Path-traversal guard: `join` normalizes `..`, so prefix comparison
        // catches any URL that escapes `monacoRoot`.
        if (!filePath.startsWith(monacoRoot)) return next();
        if (!existsSync(filePath) || !statSync(filePath).isFile()) {
          return next();
        }
        const mime =
          MIME[extname(filePath).toLowerCase()] ?? 'application/octet-stream';
        res.setHeader('Content-Type', mime);
        createReadStream(filePath).pipe(res);
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, projectRoot, '');
  Object.assign(process.env, env);

  // Comma-separated list of additional hostnames to whitelist for the dev
  // server's host check (Vite 6 default-blocks anything outside localhost
  // since CVE-2025-30208). Example for SwitchHosts users:
  //   VITE_ALLOWED_HOSTS=local.backend.ai,*.lablup.local
  // Reads from process.env first (shell override) so CI/scripts can set it
  // ad-hoc, then falls back to the .env.development.local entry.
  const allowedHostsRaw =
    process.env.VITE_ALLOWED_HOSTS ?? env.VITE_ALLOWED_HOSTS;
  const allowedHosts = allowedHostsRaw
    ? allowedHostsRaw
        .split(',')
        .map((h) => h.trim())
        .filter(Boolean)
    : undefined;

  // The Electron target's `es6://` publicPath is applied by
  // `scripts/patch-electron-publicpath.js` after the single web build
  // (per FR-2612 policy: one build, post-patch — never a second `vite build`).
  return {
    base: '/',
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
      port: Number(process.env.PORT) || 9081,
      strictPort: false,
      open: false,
      allowedHosts: allowedHosts,
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
          // Note: do NOT ignore config.toml here — `devAssetsReloadPlugin`
          // watches it explicitly for full-page-reload on change.
        ],
      },
    },

    plugins: [
      // Must run before @vitejs/plugin-react so we own the HTML transform
      // and the index.html resolution. Monaco's narrower prefix is matched
      // first so the more general projectRoot middleware never has to
      // reach into the filesystem for a `/resources/monaco/vs/*` request.
      monacoStaticPlugin(),
      projectRootStaticPlugin(),
      devAssetsReloadPlugin(),

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

      // Service worker generation (build only). Mirrors the options used
      // by craco's workbox-webpack-plugin GenerateSW call in
      // craco.config.cjs:390-400.
      //
      // Strategy `generateSW` produces a standalone SW file that precaches
      // the build manifest. We opt out of `registerType: 'autoUpdate'` to
      // preserve the legacy behaviour where index.html's inline script
      // registers `/sw.js` itself on load (see ../index.html:126-131).
      VitePWA({
        strategies: 'generateSW',
        filename: 'sw.js',
        injectRegister: false,
        // The repo ships its own `manifest.json` under the project root (with
        // the real Backend.AI icons, name, and colors) and `copyresource`
        // copies it into `build/web/`. Disable the plugin's auto-generated
        // `manifest.webmanifest` to avoid shipping two conflicting manifests
        // — the auto one picks up react/package.json metadata (wrong name,
        // wrong theme color, no icons) and also injects its own `<link rel=
        // "manifest">` tag that competes with the existing one in index.html.
        manifest: false,
        // Stay silent during dev — the registration happens only in prod.
        devOptions: { enabled: false },
        workbox: {
          skipWaiting: true,
          clientsClaim: true,
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
          globIgnores: ['**/*.map', '**/asset-manifest.json'],
        },
      }),
    ],

    build: {
      outDir: resolve(__dirname, 'build'),
      emptyOutDir: true,
      sourcemap: true,
      // Suppress the warning about chunk size; the app is large and this
      // matches the existing craco/webpack threshold expectation.
      chunkSizeWarningLimit: 2000,
    },
  };
});
