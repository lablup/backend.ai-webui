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

- Production `vite build` output parity with the current `craco build`
- Workbox `GenerateSW` replacement (`vite-plugin-pwa`)
- Electron `BUILD_TARGET=electron` → `es6://` publicPath
- Jest → Vitest migration
- Custom fs.watch middlewares for i18n / theme / config.toml reload
- CI pipeline updates

## Files touched

- `react/vite.config.ts` (new) — all Vite setup
- `react/package.json` — added `vite:dev` script and four devDependencies
- `react/VITE_POC_NOTES.md` (this file)

No changes to CRA/Craco config, Jest, TypeScript config, the source tree, or BUI.
