import react from '@vitejs/plugin-react';
import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs';
import {
  basename,
  dirname,
  extname,
  isAbsolute,
  join,
  relative,
  resolve,
} from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import compression from 'compression';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { VitePWA } from 'vite-plugin-pwa';
import svgr from 'vite-plugin-svgr';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const require = createRequire(import.meta.url);

// `vite-plugin-node-polyfills` injects bare-specifier imports of its own shim
// paths (`vite-plugin-node-polyfills/shims/{buffer,global,process}`) during
// production build via `@rollup/plugin-inject`. With
// `enableGlobalVirtualStore: true` (pnpm-workspace.yaml) the importer of those
// injected statements lives under `~/Library/pnpm/store/v11/links/...`, and
// Rollup's walk-up resolution from there cannot reach the plugin in the
// project tree. Pre-resolving each shim's absolute entry via Node's require
// once and aliasing makes resolution independent of importer location.
const polyfillShimAlias = (name: 'buffer' | 'global' | 'process') => ({
  find: new RegExp(`^vite-plugin-node-polyfills/shims/${name}$`),
  replacement: require.resolve(`vite-plugin-node-polyfills/shims/${name}`),
});
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
 * will never HMR them on its own. `config.toml`, `resources/theme.json`,
 * and the project-root `index.html` are in the same category.
 *
 * Host i18n JSONs are special-cased: instead of a full reload, we emit a
 * custom HMR event (`bai:host-i18n-changed`) that the host's i18n bootstrap
 * (react/src/components/DefaultProviders.tsx) listens for and answers with
 * `i18n.reloadResources(lng)` + `changeLanguage`. This preserves app state
 * (open modals, forms, Relay cache) on copy edits.
 *
 * BUI's locale JSONs (packages/backend.ai-ui/src/locale/*.json) are NOT
 * watched here — they are statically imported by BUI's `locale/index.ts`
 * so Vite already tracks them in the module graph. BUI's bootstrap
 * registers its own `import.meta.hot.accept` boundary to update its
 * (separate) i18n instance.
 *
 * Debounce: full-reload uses 300ms (matches craco); host i18n hot-reload
 * uses a tighter 150ms because the update preserves UI state and the
 * shorter wait makes copy edits feel near-instant. Both debounces exist
 * because FSEvents on macOS can fire multiple watcher events for a single
 * save, and editors that use atomic-save (write temp → rename) produce
 * two events. Debouncing collapses each burst into one signal.
 */
function devAssetsReloadPlugin(): Plugin {
  const i18nHostDir = resolve(projectRoot, 'resources/i18n');
  const fullReloadTargets = [
    resolve(projectRoot, 'config.toml'),
    resolve(projectRoot, 'index.html'),
    resolve(projectRoot, 'resources/theme.json'),
  ];
  const watchTargets = [...fullReloadTargets, i18nHostDir];

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
      let i18nTimer: NodeJS.Timeout | undefined;

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

      const scheduleI18nUpdate = (lng: string) => {
        clearTimeout(i18nTimer);
        i18nTimer = setTimeout(() => {
          server.config.logger.info(
            `[bai] host i18n hot-reload: ${lng}`,
            { clear: false, timestamp: true },
          );
          server.ws.send({
            type: 'custom',
            event: 'bai:host-i18n-changed',
            data: { lng },
          });
        }, 150);
      };

      // Use `path.relative` so containment is detected correctly on Windows,
      // where chokidar emits paths with `\` separators that would never match
      // a `target + '/'` prefix.
      const isUnder = (target: string, changedPath: string) => {
        const rel = relative(target, changedPath);
        return rel === '' || (!rel.startsWith('..') && !isAbsolute(rel));
      };

      const handler = (changedPath: string) => {
        // Host i18n JSON → custom HMR event (no full reload).
        if (
          isUnder(i18nHostDir, changedPath) &&
          changedPath.endsWith('.json')
        ) {
          scheduleI18nUpdate(basename(changedPath, '.json'));
          return;
        }
        // Other watched assets → full reload (existing behaviour).
        if (fullReloadTargets.some((t) => isUnder(t, changedPath))) {
          scheduleReload(changedPath);
        }
      };

      server.watcher.on('change', handler);
      server.watcher.on('add', handler);
      server.watcher.on('unlink', handler);

      server.httpServer?.on('close', () => {
        clearTimeout(reloadTimer);
        clearTimeout(i18nTimer);
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
/**
 * Gzip-compress every dev-server response. Vite's dev server does NOT compress
 * by default — source modules, optimized dep bundles, even multi-MB chunks all
 * go over the wire raw. On a local LAN that's fine; on a high-RTT remote
 * connection the total session payload (typically 20–40MB on a hard refresh of
 * this app) saturates available throughput and pulls every parallel HTTP/2
 * stream's completion time up to the same `total_bytes / bandwidth` value —
 * which is exactly the "every chunk takes ~8 s regardless of size" pattern.
 *
 * Plain `compression` middleware (the same one Express uses) drops aggregate
 * JS payload by ~75–80%. It's `apply: 'serve'` so the production build is
 * untouched.
 *
 * Why this is placed BEFORE the other middlewares: connect runs middlewares
 * in registration order, and compression needs to wrap the response stream
 * before any later middleware writes to it (it hooks `res.write` /
 * `res.end`). Placing it first means everything downstream — projectRoot
 * static, Monaco static, Vite's own internal middlewares — flows through
 * the gzip transform.
 *
 * Portless passes through `Content-Encoding` unchanged (verified via curl),
 * so the gzip frames reach the browser intact and the browser inflates.
 */
function devCompressionPlugin(): Plugin {
  return {
    name: 'bai-dev-compression',
    apply: 'serve',
    configureServer(server) {
      // `threshold: 0`: compress even tiny responses. The CPU cost of
      // compressing 1–2 KB is negligible (sub-millisecond) and the benefit
      // accrues on aggregate session bytes, not per-file.
      //
      // Brotli quality stays at the `compression` package default (q4).
      //
      // Tried q6 — it produces ~10% smaller wire bytes for a 2.8MB chunk
      // (508KB → 457KB), but on a hard refresh (100+ concurrent module
      // requests) the per-request CPU cost climbed enough that libuv's
      // default 4-thread pool saturated, and total wall time for the slowest
      // chunk regressed from ~4s to ~6s. The wire-size win is dwarfed by
      // the compression-queue tail under burst load. q4 is the sweet spot.
      server.middlewares.use(compression({ threshold: 0 }));
    },
  };
}

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

        // backend.ai-client workspace package, dev-aliased to source so HMR
        // tracks the SDK without rebuilding tsup output.
        {
          find: /^backend\.ai-client$/,
          replacement: resolve(projectRoot, 'packages/backend.ai-client/src/index.ts'),
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

        // See `polyfillShimAlias` definition at the top of this file.
        polyfillShimAlias('buffer'),
        polyfillShimAlias('global'),
        polyfillShimAlias('process'),
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
      // Pre-declare the heavy dependencies that are imported on the first-paint
      // path. Without this list, Vite still finds them via the `entries` scan,
      // but only AFTER scanning the source tree — and the scan + optimize are
      // serialised. Listing them here lets the dep optimizer kick off immediately
      // at startup in parallel with the source scan, so by the time the browser
      // requests `/src/index.tsx` the bundled deps are already on disk.
      //
      // Listing rules:
      // - Top-level packages used by the eagerly-imported component graph
      //   (index.tsx → App → DefaultProviders → routes → MainLayout / LoginView).
      // - Subpath imports whose specifier is the actual entry the app uses —
      //   e.g. `react-dom/client` (for `createRoot`) and
      //   `nuqs/adapters/react-router/v6` (the only nuqs entry that ships the
      //   adapter). Listing these saves the optimizer a discover-and-reload
      //   cycle the first time the source scan reaches them. Pure deep-import
      //   conveniences with no separate entry (e.g. `antd/es/locale/ko_KR`)
      //   are NOT listed — the entries scan picks them up automatically.
      // - Do NOT list anything in `exclude` below (`backend.ai-ui`,
      //   `backend.ai-client`, `i18next`, `react-i18next`).
      // - When a new heavy top-level dep starts being imported on the first
      //   render path, add it here.
      include: [
        'react',
        'react-dom',
        'react-dom/client',
        'react-router-dom',
        'antd',
        'antd-style',
        '@ant-design/icons',
        '@ant-design/colors',
        'jotai',
        'react-relay',
        'relay-runtime',
        '@tanstack/react-query',
        'nuqs',
        'nuqs/adapters/react-router/v6',
        'dayjs',
        'lodash',
        'ahooks',
      ],
      exclude: [
        'backend.ai-ui',
        // backend.ai-client is dev-aliased to its source entry (see
        // resolve.alias above). Excluding it from the dep optimizer keeps
        // Vite serving the SDK as on-the-fly source modules so edits in
        // packages/backend.ai-client/src trigger HMR instead of requiring
        // a tsup rebuild + full reload.
        'backend.ai-client',
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
      // Pre-transform the modules that are *eagerly* imported on first paint,
      // so they are ready before the browser asks for them. This mainly helps
      // remote dev sessions where the request waterfall (browser → server →
      // transform → response, per file) is dominated by RTT: with warmup the
      // transform cost has already been paid and the response is served from
      // Vite's in-memory module cache.
      //
      // Rules of thumb (per Vite docs):
      // - Only warm up files on the FIRST-PAINT critical path. Anything
      //   behind `React.lazy()` / dynamic import will be transformed when
      //   the user navigates there and warming it up just steals startup CPU.
      // - Paths are relative to the config root (`react/`).
      // - Cross-root paths (`../packages/...`) are supported.
      //
      // Reference: https://vite.dev/guide/performance#warm-up-frequently-used-files
      warmup: {
        clientFiles: [
          // Entry module the browser fetches first.
          './src/index.tsx',
          // index.tsx's synchronous imports.
          './src/App.tsx',
          './src/global-stores.ts',
          './src/RelayEnvironment.ts',
          './src/helper/customThemeConfig.ts',
          './src/hooks/useThemeMode.tsx',
          './src/components/DefaultProviders.tsx',
          // App.tsx → routes.tsx and everything routes.tsx imports eagerly.
          // Lazy-loaded pages are intentionally NOT listed here — they are
          // fetched on navigation. Only the non-lazy imports at the top of
          // routes.tsx need warmup.
          './src/routes.tsx',
          './src/components/BAIErrorBoundary.tsx',
          './src/components/ErrorBoundaryWithNullFallback.tsx',
          './src/components/FlexActivityIndicator.tsx',
          './src/components/LocationStateBreadCrumb.tsx',
          './src/components/LoginView.tsx',
          './src/components/MainLayout/MainLayout.tsx',
          './src/components/MainLayout/WebUIHeader.tsx',
          './src/components/MainLayout/WebUISider.tsx',
          './src/components/STokenLoginBoundary.tsx',
          './src/components/WebUINavigate.tsx',
          // Pages marked "High priority" in routes.tsx (eagerly imported,
          // not behind React.lazy).
          './src/pages/ComputeSessionListPage.tsx',
          './src/pages/Page404.tsx',
          './src/pages/VFolderNodeListPage.tsx',
          // Hooks barrel — pulled in by virtually every page/component the
          // first render touches (useSuspendedBackendaiClient, useCurrentProject,
          // useBAISetting, etc. all re-export from here).
          './src/hooks/index.tsx',
          // backend.ai-ui is excluded from `optimizeDeps` (see the long note
          // above on i18n Context isolation), so its barrel is served as
          // on-the-fly source modules every time. Warming the barrel — which
          // is `export *` over components/helper/hooks/icons — primes the
          // most-frequently-touched BUI surface during startup instead of on
          // the browser's critical path.
          '../packages/backend.ai-ui/src/index.ts',
        ],
      },
    },

    plugins: [
      // Must run before @vitejs/plugin-react so we own the HTML transform
      // and the index.html resolution. Monaco's narrower prefix is matched
      // first so the more general projectRoot middleware never has to
      // reach into the filesystem for a `/resources/monaco/vs/*` request.
      // Compression must come first so its res.write/res.end hooks wrap
      // every downstream middleware's writes (see comment on the plugin).
      devCompressionPlugin(),
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
          // Why not `Buffer: true` in dev:
          //   With `true`, the plugin prepends
          //     `import __buffer_polyfill from 'vite-plugin-node-polyfills/shims/buffer';`
          //     `globalThis.Buffer = globalThis.Buffer || __buffer_polyfill;`
          //   to every chunk that touches Buffer. Vite's dep optimizer also
          //   wraps that same shim into a CJS-interop chunk — so the chunk
          //   that *exports* `__vite__cjsImport0_vitePluginNodePolyfills_
          //   shims_buffer` also *imports* it (via the injected prelude),
          //   and the import lands in the same chunk before the export is
          //   initialized → TDZ on first browser load. `'build'` scopes
          //   the injection to the production rollup build only.
          //
          // Why this is safe to do here:
          //   No app code under `react/src` or `packages/backend.ai-ui/src`
          //   references the Buffer global. The only Buffer.* call that
          //   survives into the prod bundle is `Buffer.byteLength` inside
          //   `cross-fetch/dist/browser-ponyfill.js` (pulled transitively
          //   by `i18next-http-backend`), and that lives on a Node-only
          //   code path the browser ponyfill never enters. The polyfill
          //   itself could likely be removed entirely; see follow-up.
          Buffer: 'build',
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
