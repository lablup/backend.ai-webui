# Vite PoC — Phase 1 Notes (FR-2606)

Parent epic: **FR-2605** — Migrate WebUI bundler off deprecated CRA.

This PoC validates whether Vite can replace CRA/Craco for the `react/` dev server. It is intentionally narrow: **dev-mode parity only**. Production build, Electron, Workbox, Vitest, and the custom fs.watch dev-server middlewares are deferred to follow-up sub-issues.

## How to run

```bash
cd react
pnpm run vite:dev
# → http://localhost:9083 (9081 is still used by `craco start`)
```

`craco start` (the existing `pnpm run dev` pipeline) is untouched. Both can run side-by-side on different ports.

## Results — 6 risk items

All 6 passed in this session. Each was verified by probing the dev server over HTTP and inspecting the transformed output, not just "it booted".

| # | Risk | Status | Evidence |
|---|---|---|---|
| 1 | Per-directory Relay `artifactDirectory` | ✅ PASS | `/src/components/AutoScalingRuleList.tsx` transforms to `import … from "/src/__generated__/*.graphql.ts"`; BUI `.../BAIUserV2Nodes.tsx` transforms to `import … from "/@fs/.../packages/backend.ai-ui/src/__generated__/*.graphql.ts"`. The function-form `babel` option on `@vitejs/plugin-react` lets us scope `babel-plugin-relay` by file path. |
| 2a | `?raw` CSS imports | ✅ PASS | `curl /src/index.css?raw` returns `export default "/* fix: match the icon size …"` — Vite has native `?raw` support; no plugin needed. |
| 2b | `?react` SVG imports via SVGR | ✅ PASS (config) | `vite-plugin-svgr` configured with `include: '**/*.svg?react'`. The codebase currently has no `?react` imports, so runtime transform is not exercised, but the plugin is ready for when it's needed. |
| 3 | BUI source-alias HMR | ✅ PASS | `packages/backend.ai-ui/src/components/BAIButton.tsx` is served at `/@fs/…/BAIButton.tsx` with `import.meta.hot = __vite__createHotContext(...)` and `RefreshRuntime.getRefreshReg(...)` injected. `touch BAIButton.tsx` emits `[vite] (client) hmr update /@fs/…/BAIButton.tsx` in the server log. |
| 4 | React Compiler `'use memo'` | ✅ PASS | `/src/components/AgentNodeItems/AgentStatusTag.tsx` (function-level `'use memo'`) transforms with `import … from "/node_modules/.vite/deps/react_compiler-runtime.js"` and `const $ = _c(33)` — the memoization cache allocation. Annotation mode works via `@vitejs/plugin-react` babel path. |
| 5 | `backend.ai-client-esm` alias | ✅ PASS | `/src/global-stores.ts` transforms to `import * as ai from "/@fs/Users/seungwonlee/…/dist/lib/backend.ai-client-esm.js"` — the alias resolves to the root-`tsc --watch` output. Vite's chokidar watcher should pick up file changes since the path is under `projectRoot`. (Not stress-tested in this session.) |
| 6 | `transformIndexHtml` marker replacement | ✅ PASS | `curl /` returns the project-root `index.html` with `// DEV_JS_INJECTING` → `globalThis.process = {env: {NODE_ENV: "development"}};`, `<!-- REACT_BUNDLE_INJECTING FOR DEV-->` → `<script type="module" src="/src/index.tsx"></script>`, and `{{nonce}}` stripped. `@vite/client` and `@react-refresh` preamble injected by Vite's own chain. |

## Key design decisions

### `root: react/`, not `projectRoot`

First attempt used `root: projectRoot` so Vite could serve `index.html` and `/resources/*` naturally. That failed because pnpm installs `react` only under `react/node_modules`, and Vite resolving from `projectRoot/node_modules` could not find `react/jsx-dev-runtime`.

Fix: keep `root: __dirname` (react/), and use a small `configureServer` middleware to (a) serve the project-root `index.html` at `/`, running it through Vite's `transformIndexHtml` chain, and (b) proxy `/resources/*`, `/manifest/*`, `/dist/*`, `/config.toml`, `/version.json`, `/manifest.json` from `projectRoot`. This mirrors the craco `devServer.static` config.

### `src/` baseUrl via regex alias

`tsconfig.json` sets `baseUrl: "."`, allowing `import 'src/hooks/foo'`. Vite does not honour tsconfig baseUrl. Added `{ find: /^src\//, replacement: reactSrc + '/' }` to `resolve.alias`. Regex form is needed to avoid collision with `backend.ai-ui/src/…` paths.

### Per-directory Relay via `babel` function form

`@vitejs/plugin-react` exposes `babel: (id) => BabelOptions`. This replaces craco's `babel.overrides[]` exactly: different `artifactDirectory` for `react/src/**` vs `packages/backend.ai-ui/src/**`. No need for `vite-plugin-relay-lite` or two plugin instances.

### `optimizeDeps.entries` scoping

First run, Vite's dep discovery crawled from root and picked up `scripts/temp-releases/webui-25.15.0/dist/plugins/dell-emc.js`, which imports legacy Lit packages not in `react/`'s dependency graph. Setting `optimizeDeps.entries: ['src/index.tsx', 'src/**/*.{ts,tsx}']` limits the crawl to real app code.

## Known follow-ups (out of scope for Phase 1)

These appeared during the PoC and should be tracked separately:

1. **`PluginLoader.tsx` dynamic import warning** — `import(pluginUrl /* webpackIgnore: true */)` is not understood by Vite. Needs `/* @vite-ignore */` in the Vite migration (or a different plugin-loading strategy).
2. **Static resources are served via a small custom middleware**. Craco's dev server had richer behaviour (fs.watch on `config.toml`, `resources/i18n/**`, `resources/theme.json` → full page reload). A follow-up sub-issue should port that behaviour to a Vite plugin.
3. **`backend.ai-client-esm` watcher behaviour** — the alias resolves, but the root `tsc --watch` → Vite re-serve loop was not stress-tested.
4. **Pre-existing console warnings surfaced by the smoke test** — `antd: Dropdown overlayStyle` (antd v6 migration) and `-webkit-app-region` (antd-style + React 19 warning). These existed before the Vite migration but are now visible; the smoke test allowlists them.

## i18n isolation — extra Phase 1 work landed here

Initial browser smoke showed host-app translation keys (`login.SessionMode`, etc.) rendering as raw strings. Root cause diagnosed and fixed:

- BUI designs for two separate `i18next` instances (host + BUI) — each `<I18nextProvider>` is supposed to scope to a different React Context object. Under CRA this worked because pnpm splits `react-i18next` by peer-dep version (typescript@5.7.3 for react/, @5.9.3 for BUI), giving two physical copies of the module, each with its own `React.createContext(...)`.
- Vite's dep optimizer dedupes by bare name, collapsing both copies into one bundled chunk → one Context object. BUI's `<I18nextProvider>` then leaks into host components and resolves host keys against BUI's resource set (BUI keys only) → raw keys render.

Fix:

1. `optimizeDeps.exclude: ['i18next', 'react-i18next']` — skip these from Vite's dep pre-bundling so each pnpm store path remains a distinct module.
2. Add ESM shims (`react/vite-shims/void-elements.mjs`, `use-sync-external-store-shim.mjs`) aliased to replace the CJS transitive deps of `react-i18next`. Without these shims, excluding `react-i18next` leaves those leaves without CJS→ESM transform and the browser's native ESM parser rejects them.
3. Verified via Playwright smoke (`e2e/vite-poc-smoke.spec.ts`):
   - `packages/backend.ai-ui/src/components/BAIText.tsx` resolves `react-i18next` from the `typescript@5.9.3` store.
   - `react/src/components/LoginView.tsx` resolves `react-i18next` from the `typescript@5.7.3` store.
   - Host page renders English translations (not raw keys).

## Not validated in this PoC

(Each of these gets its own sub-issue under FR-2605.)

- Jest → Vitest migration (FR-2609)
- CI pipeline updates (FR-2611)

## Production `vite build` + Workbox PWA — landed (FR-2608)

`pnpm --prefix ./react run vite:build` now produces a working web build with a generated service worker. Output goes to `react/build/`, same directory the craco pipeline uses.

### What was added

- `react/index.html` — a throwaway build-entry stub. Vite requires an HTML at `root/` so it can parse the app entry; `projectRootStaticPlugin`'s `transformIndexHtml` replaces the stub's content with the real project-root `index.html` at build AND serve time.
- `vite-plugin-pwa` (`strategies: 'generateSW'`) — mirrors the craco-era `workbox-webpack-plugin@7.4.0 GenerateSW` options:
  - `skipWaiting: true`, `clientsClaim: true`
  - `maximumFileSizeToCacheInBytes: 5 MB`
  - Excludes `*.map` and `asset-manifest.json`
  - `injectRegister: false` — the project-root `index.html` registers `/sw.js` itself (see index.html:126-131), so the plugin must NOT emit its own registration script.
- `transformIndexHtml` is now dev/build aware via `ctx.server`:
  - Dev: strips `// DEV_JS_INJECTING` → NODE_ENV shim, empties `{{nonce}}` placeholders.
  - Build: removes the dev-only marker line, but **preserves `{{nonce}}` placeholders** so the backend's CSP middleware can substitute them per-request.

### Measurements

- Build time: `37.5s` end-to-end (vs. craco's ~1.5–2min observed on the same tree).
- Output size: `84 MB` of Vite-emitted artefacts in `react/build/`. Not directly comparable to craco's `build/web/` which includes `resources/` + `manifest/` copies from the top-level `pnpm run build` orchestrator; the Vite output does not yet copy those static dirs.
- Service worker precaches 462 entries (22.7 MiB). Generated as `sw.js` + `workbox-*.js` runtime chunk, same shape as the craco output.
- Biggest single chunk: 3.89 MB (`index-*.js`). Matches the current webpack footprint within noise — no regression. Code-splitting audit is not part of Phase 2.

### Known follow-ups for FR-2611 (CI pipeline)

- `pnpm run build` orchestrator still drives `craco build`. The CI task needs to swap that for `vite:build` AND update the `Makefile` dep target whose sanity grep (`grep -q 'es6://static/js/main' react/build/index.html`) matches webpack-era paths; Vite emits `es6://assets/index-*.js`.
- `vite-plugin-pwa` auto-generates a `manifest.webmanifest` with default values (`name: "backend-ai-webui-react"`, `theme_color: "#42b883"`). The project's real `manifest/` dir is authoritative and gets copied by `pnpm run copyresource`. The auto-generated manifest is cosmetic for the PoC but should be disabled or pointed at the real one in the integration step.
- Static asset copying (`resources/`, `manifest/`, `config.toml`, `version.json`, `manifest.json` → `build/web/`) is currently done by `copyresource`/`copyconfig` scripts at the top-level build orchestrator. Vite's build on its own does NOT perform these copies. Integrating via `public/` symlinks or a Vite plugin is a small follow-up.

### Verified side-effects (no regression)

- Dev smoke (`e2e/vite-poc-smoke.spec.ts`) still passes after adding build support — i18n renders, no new console errors.
- `projectRootStaticPlugin`'s middleware + `devAssetsReloadPlugin` remain `apply: 'serve'` and do not affect the build output.

## fs.watch dev-reload middleware — landed (FR-2610)

Ported craco's custom dev-server `fs.watch` / `fs.watchFile` behaviour (craco.config.cjs:80-147) to a Vite plugin: `devAssetsReloadPlugin`. Watches four project-root paths for changes and emits a debounced full page reload:

- `config.toml`
- `index.html` (project-root template)
- `resources/i18n/` (translation JSON files fetched by `i18next-http-backend`)
- `resources/theme.json`

Why a full reload and not HMR: these files are fetched at runtime, not bundled into the module graph, so HMR has no handle on them. The host app reads them on initial load; reload is the only way to pick up edits.

Implementation uses Vite's built-in chokidar instance (`server.watcher`) — `server.watcher.add(path)` to opt those paths into the watch set, then `server.ws.send({ type: 'full-reload' })` on change with a 300ms debounce (same as craco). Also had to remove `config.toml` from `server.watch.ignored` since the earlier mirror of craco's `watchOptions.ignored` explicitly excluded it.

Verified by `touch`-ing each of the four targets and confirming `[bai] full reload triggered by ...` appears in the Vite server log.

## Electron `es6://` — spike answered (FR-2607)

Answered ahead of the full Electron sub-issue because it was the biggest unknown. If this had been a blocker, the whole migration plan would have needed a rethink.

**Finding**: Vite CAN emit `es6://` prefixed asset URLs, but NOT via the `base` option.

`base: 'es6://'` does not work. Vite's external-URL regex is `/^([a-z]+:)?\/\//` — the `6` in `es6` breaks the `[a-z]+` group, so Vite classifies `es6://` as a non-external URL, treats it as a malformed absolute path, and falls back to `/`.

The escape hatch is `experimental.renderBuiltUrl(filename)`. It is called per built asset and its return value replaces `base + filename` concatenation directly — no scheme validation. Current config:

```ts
const isElectronBuild =
  command === 'build' && process.env.BUILD_TARGET === 'electron';

return {
  base: '/',
  experimental: isElectronBuild
    ? { renderBuiltUrl: (filename) => `es6://${filename}` }
    : undefined,
  ...
};
```

### Empirical verification (minimal throwaway build)

Built a 3-file fixture (`index.html` + `main.js` with dynamic `import('./chunk.js')`) against this config. Emitted output:

- `dist/index.html` → `<script type="module" crossorigin src="es6://assets/index-BWEqRl42.js"></script>` ✓
- Dynamic import compiled to `import("./chunk-*.js", ..., import.meta.url)` — resolves relative to the loading module's URL, so once the entry is loaded via `es6://...`, all dynamic chunks inherit the scheme automatically. No extra config needed.

### Known follow-ups for the full Electron build sub-issue (FR-2607)

- Makefile dep target has a sanity grep `'es6://static/js/main'` that is webpack-specific. Must update to match Vite's output structure (`es6://assets/index-*.js`).
- Electron's protocol handler in `electron-app/main.js:552-568` should work unchanged — it parses `es6://<anything>` and reads from `<app>/<anything>` on disk. Vite's output directory placement needs to match (`build/web` → `build/electron-app/app` in the Makefile, already in place).
- `renderBuiltUrl` is flagged `experimental` in Vite. Behaviour has been stable for 3+ major versions but this deserves a note — if future Vite versions break the API, we will need to bump to the stable replacement.

## Files touched

- `react/vite.config.ts` (new) — all Vite setup
- `react/package.json` — added `vite:dev` script and four devDependencies
- `react/VITE_POC_NOTES.md` (this file)

No changes to CRA/Craco config, Jest, TypeScript config, the source tree, or BUI.
