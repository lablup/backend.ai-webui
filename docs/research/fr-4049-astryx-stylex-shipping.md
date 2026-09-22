# How an Astryx/StyleX-based library ships to consumers

Research for FR-4049 (parent map FR-4046). Researched 2026-09-22 against
`origin/main` at `9345fbc87`.

## Question

`@lablup/ui-common` is to wrap and re-export Astryx, and backend.ai-webui's
`react/` and `packages/backend.ai-ui/` are to stop depending on
`@astryxdesign/*` directly. What must ui-common ship so that both of these work:

- (a) webui, which runs Astryx in StyleX mode (`xstyle`, and imports from
  `@astryxdesign/core/theme/tokens.stylex`)
- (b) consumers that do not use StyleX, such as all-smi

Can webui reach `xstyle` and the tokens only through ui-common?

## Answer

Ship **precompiled** JS and CSS, the way Astryx itself does. Do not ship
StyleX source for the consumer to compile.

1. **Astryx needs no consumer-side compiler.** `@astryxdesign/core`'s `dist/`
   is StyleX output: `stylex.create` calls are already replaced by class-name
   maps, and every rule is in one stylesheet, `dist/astryx.css`, inside
   `@layer astryx-base`. At runtime the consumer needs only the
   `@stylexjs/stylex` peer (for `stylex.props`) and three stylesheets. A
   non-StyleX consumer such as all-smi works unchanged if ui-common exposes the
   same stylesheets and keeps the same peer.
2. **ui-common exposes Astryx's CSS through CSS files of its own.** Each file is
   a one-line `@import` of the Astryx sheet. The consumer's bundler resolves the
   `@import` from ui-common's install location, so it works under pnpm's strict
   layout even though the app has no `@astryxdesign/core` of its own. Verified
   with webui's Vite 6.4.3.
3. **The tokens can be re-exported, but only from a subpath whose name ends in
   `.stylex`.** For example, `@lablup/ui-common/theme/tokens.stylex` containing
   `export * from '@astryxdesign/core/theme/tokens.stylex'`. The StyleX
   compiler never reads that file. It recognizes a theme import by the
   `.stylex` suffix on the import specifier. Every Astryx token key starts with
   `--`, so the compiler emits `var(--key)` literally, whatever file or package
   the import went through. A re-export from ui-common's root barrel, or from a
   subpath without the suffix, fails the build.
4. **`xstyle` needs no special handling in ui-common.** It is a runtime prop.
   webui compiles its own `stylex.create` into plain objects, and the wrapper
   forwards them to Astryx, where `stylex.props` merges them. webui still needs
   `@stylexjs/stylex` and `@stylexjs/unplugin` as direct dependencies, because
   it authors StyleX. What it drops is `@astryxdesign/*`.
5. **Styles that ui-common authors itself follow Astryx's recipe.** If
   ui-common writes its own `stylex.create`, it compiles them at its own build.
   It needs its own `classNamePrefix`: not `x` (Astryx) and not `webui`
   (webui). The compiled rules go into a layered stylesheet. Any `defineVars`
   it exports needs keys that start with `--`. A plain key is hashed with the
   *compiling* side's prefix, so the variable name that webui computes will not
   match the one that ui-common defined (reproduced below).

## Findings

### 1. What `@astryxdesign/core` actually publishes (0.6.2)

The root `pnpm-workspace.yaml` catalog pins `@astryxdesign/core`,
`theme-neutral` and `cli` to **0.6.2**, and `lab` to `0.3.0-canary.12db2a1`.
FR-4034 / #9854 made that bump. The "v0.5.4" in `CLAUDE.md`'s ASTRYX block is
stale. Source for all of this section:
`react/node_modules/@astryxdesign/core/package.json` and its `dist/`.

- `peerDependencies`: `@stylexjs/stylex ^0.19.0`, `react >=19`,
  `react-dom >=19`. The only runtime dependency is `intl-messageformat`.
- `sideEffects`: `**/*.stylex.ts`, `**/*.stylex.js`, `**/componentStyles.ts`,
  `**/*.css`.
- The CSS exports are:
  - `./reset.css` maps to `./src/reset.css`, which is `@layer reset`.
  - `./astryx.css` maps to `./dist/astryx.css`, 169 KB. The header reads
    "Astryx Pre-compiled StyleX CSS — all components", and everything is inside
    one `@layer astryx-base`.
  - `./tailwind-theme.css` maps to `./src/tailwind-theme.css`.
- The JS exports carry three conditions each: `source` (`./src/*.ts`), `types`
  and `default` (`./dist/*.js`). webui sets no `resolve.conditions`, so it
  resolves `default`, which is the precompiled dist.
- `dist/Button/Button.js` is compiled output. It has no `stylex.create`, and
  `const styles = { base: { kInvED: "x1wfwxd8 x13aywxo", …, $$css: true } }`.
  What remains is only `import * as stylex from '@stylexjs/stylex'` and the
  runtime `stylex.props(...)` calls.
- `dist/theme/tokens.stylex.js` is also compiled. `defineVars` is gone and the
  exports are plain objects:
  `export const colorVars = { "--color-accent": "var(--color-accent)", … }`.
  The file also exports `colorDefaults` and similar.
- The README states it for every setup: "Astryx ships pre-built CSS and JS …
  No build plugins needed". The StyleX setup ("Next.js + StyleX") is described
  as "Use the pre-built dist alongside StyleX for your own styles."
  `astryx docs getting-started` has the same install line:
  `npm install @astryxdesign/core @stylexjs/stylex @astryxdesign/theme-neutral`.
- `@astryxdesign/theme-neutral@0.6.2` exports `.` (source theme),
  `./built` (prebuilt JS) and `./theme.css`. Its peer is
  `@astryxdesign/core: 0.6.2`, an exact pin.
- `@astryxdesign/lab@0.3.0-canary.12db2a1` exports `.` and `./lab.css`. Its
  peers are `@stylexjs/stylex >=0.10.0`, a `@astryxdesign/core` canary pin that
  does not match 0.6.2, and lexical.

**Consequence.** A consumer that does not use StyleX needs:

- the CSS: `reset.css`, `astryx.css`, a theme's `theme.css`, plus `lab.css`
  when it uses lab components
- one copy of the `@stylexjs/stylex` runtime
- `<Theme>`

All three are satisfied by re-exporting.

### 2. How webui is configured today

**`react/vite.config.ts`**

- It uses `@stylexjs/unplugin/vite` 0.19.0 directly, with `useCSSLayers: false`
  so the output is unlayered and beats `@layer astryx-base`.
- It sets `cssInjectionTarget` to the entry `index-*.css`, which
  `scripts/verify.sh check_stylex_injection` guards.
- It sets `classNamePrefix: 'webui'`. The comment gives the reason: hashes
  collide with Astryx's `x`, which FR-3534 hit.
- It sets `unstable_moduleResolution: { type: 'commonJS', rootDir: projectRoot }`.
- `react/vitest.config.ts` wires the same plugin.
- Direct dependencies: `@stylexjs/stylex` 0.19.0, `@stylexjs/babel-plugin`
  0.19.0 and `@stylexjs/unplugin` 0.19.0.

**Global CSS.** `react/src/index.css` declares
`@layer reset, theme, base, astryx-base, astryx-theme, components, utilities;`.
It then `@import`s `@astryxdesign/core/reset.css`,
`@astryxdesign/core/astryx.css`, `@astryxdesign/lab/lab.css` and
`@astryxdesign/theme-neutral/theme.css`. The same order statement is repeated in
three places, and `scripts/migration-gates/layer-order-gate.mjs` guards it:

- `packages/backend.ai-ui/src/styles/backend.ai-ui.css`
- `.storybook/astryx.css`
- the root `index.html`

**StyleX usage in `react/src`**

- 16 files import `@stylexjs/stylex`.
- 8 import sites use `@astryxdesign/core/theme/tokens.stylex`. They import
  `colorVars`, `spacingVars` and `textSizeVars` as named imports.
- 14 files pass `xstyle=`.
- The only StyleX API used is `stylex.create`. There is no `defineVars`,
  `createTheme` or `keyframes`.

**BUI (`packages/backend.ai-ui`)**

- It has zero `@stylexjs/stylex` imports. It has one `xstyle=` in
  `BAIDialog.tsx`, which is a passthrough.
- Its own `vite.config.ts` (library build) and Storybook have **no** StyleX
  plugin.
- In the app, `react/vite.config.ts` aliases `backend.ai-ui` to
  `packages/backend.ai-ui/src`, so BUI source runs through react's StyleX
  pipeline anyway.
- BUI lists `@astryxdesign/core`, `theme-neutral` and `lab` as
  `peerDependencies` and marks all peers `external` in rollup.
- BUI ships its own `dist/backend.ai-ui.css` as `./styles.css`.

**Import volume.** react/ and BUI import `@astryxdesign/core/<Component>` from
about 40+ subpaths. Top counts: `Text` 183, `Button` 84, `IconButton` 79,
`Banner` 70. On top of that, `@astryxdesign/lab` has 11 imports,
`@astryxdesign/core/theme` has 17 and `@astryxdesign/core/utils` has 8. Dropping
the direct dependency means ui-common re-exports each of these subpaths, or a
codemod rewrites the import sites.

**Patches.** `pnpm-workspace.yaml` `patchedDependencies` patches
`@astryxdesign/core@0.6.2` (ComplexSelector) and the lab canary (TourStep).
pnpm applies patches by package@version wherever the package sits in the graph,
so the patches keep working when core becomes a transitive dependency through
ui-common. That is general pnpm behaviour, not re-tested here. They pin webui
to ui-common's exact Astryx version.

**A comment that is not accurate.** The `react/vite.config.ts` comment says the
plugin "only processes files that literally import `@stylexjs/stylex`, so
Astryx's precompiled dist/ is never re-transformed". Astryx's dist files *do*
import `@stylexjs/stylex`, for `stylex.props`, so the plugin does transform
them. Running the babel plugin over `dist/Button/Button.js` and
`dist/theme/tokens.stylex.js` collects **0 rules** and leaves the code
unchanged, so the effect is harmless. Only the wording is off.

### 3. How the StyleX compiler resolves imported `.stylex` variables

This is the answer to "does it resolve re-exported defineVars across packages?"
The source is `@stylexjs/babel-plugin@0.19.0`, `lib/index.js`.

- `StateManager.importPathResolver(importPath)` rejects any import specifier
  that does not end in `.stylex` (optionally followed by a JS extension). The
  check is `matchesFileSuffix(themeFileExtension)(importPath)` with the default
  `'.stylex'`. It tests the **specifier string**, not the resolved file.
- In `commonJS` mode it resolves the specifier with Node ESM resolution
  (`import-meta-resolve` `moduleResolve`), which honours `exports`, from the
  importing file. It returns `['themeNameRef', canonicalPath]`. The canonical
  path is `pkgName:relative/path`.
- `evaluateThemeRef` returns a proxy. `resolveVarGroupKey(key, fileName,
  exportName)` returns `var(${key})` **when the key starts with `--`**. For
  other keys it returns
  `var(--${classNamePrefix}${hash(fileName, exportName, key)})`. **The file's
  contents are never read.**
- The importing site accepts only named `ImportSpecifier` bindings. Namespace
  imports and default imports go to the `deopt` path.

StyleX docs agree
(<https://stylexjs.com/docs/learn/theming/defining-variables>):

- Variables must live in a `.stylex.{js,mjs,cjs,ts,tsx,jsx}` file.
- Every `defineVars` must be a named export, and "No other exports are allowed
  in the file".
- "To create variables with custom stable names … use a key that starts with
  `--`."

The babel-plugin configuration docs confirm `classNamePrefix` defaults to `'x'`.

#### Probe

The probe was a scratch script (not committed). It uses the babel plugin 0.19.0
with the same options as webui (`classNamePrefix: 'webui'`, `commonJS`), and a
fake `@lablup/ui-common` whose `dist/*.js` is
`export * from '@astryxdesign/core/theme/tokens.stylex'`.

| Import in app code | Result |
|---|---|
| `from '@astryxdesign/core/theme/tokens.stylex'` (today) | OK: `.webui1tgivj0{color:var(--color-text-primary)}`, `.webui1shk3sm{padding:var(--spacing-4)}` |
| `from '@lablup/ui-common/tokens.stylex'` (re-export) | **OK, byte-identical rules** |
| `from '@lablup/ui-common'` (root barrel) | FAIL: "Could not resolve the path to the imported file. Please ensure that the theme file has a .stylex.js or .stylex.ts extension" |
| `from '@lablup/ui-common/tokens'` (no suffix) | FAIL, same error |
| `import * as T from '…/tokens.stylex'` | FAIL: "Unsupported expression" |
| ui-common's own `stylex.defineVars({ accent, '--lablup-accent' })`, imported by the app | App emits `var(--webui1dy4q7q)` and `var(--lablup-accent)` |

The last row continues. When ui-common compiles that same `defineVars` file,
it defines `--x1dy4q7q` with prefix `x`, or `--webui1dy4q7q` with prefix
`webui`. So a hashed (non-`--`) variable exported precompiled by ui-common
**silently never matches** the name webui computes. Keys that start with `--`
are immune.

#### What unplugin does with packages

The source is `@stylexjs/unplugin@0.19.0`, `README.md` and `lib/core.js`.

- It transforms any JS file whose code imports an `importSources` entry,
  including files in `node_modules`.
- It auto-discovers direct dependencies whose manifest lists `@stylexjs/stylex`
  in `dependencies`, `peerDependencies` or `optionalDependencies`, and excludes
  them from Vite dependency optimization.
- `externalPackages` forces the same treatment for other packages.
- So a precompiled ui-common that declares `@stylexjs/stylex` as a peer is
  picked up automatically and costs nothing, as with Astryx today.

### 4. CSS re-export through ui-common under pnpm strict layout

The probe, a scratch script that was not committed, ran with webui's Vite 6.4.3. The app
cannot see `@astryxdesign/core`, which is a dependency of ui-common only.
ui-common exports `./styles/astryx.css`, which maps to a file containing
`@import '@astryxdesign/core/reset.css'; @import '@astryxdesign/core/astryx.css';`.
The app's CSS keeps its own `@layer` order statement first, then does
`@import '@lablup/ui-common/styles/astryx.css'`. The build emitted one 167 KB
CSS asset with both `@layer reset` and `@layer astryx-base` inlined. Vite
resolves a CSS `@import` from the importing file's real path, so the
indirection works.

The alternative is to copy `dist/astryx.css` into ui-common's `dist` at build
time. That also works, but it makes the CSS a second copy that can drift from
the JS if the two versions ever diverge. The `@import` form cannot drift.

## What ui-common should ship

**Keep Astryx external.** Mark `@astryxdesign/core`, and `theme-neutral` / `lab`
if they are re-exported, as rollup `external`. **Never bundle them.** Astryx
components rely on React context: `Theme`, `LinkProvider`, i18n, `SizeContext`.
A bundled second copy would split those contexts from the copy webui's other
code sees.

- Declare them as `dependencies` of ui-common, pinned exactly. That makes
  ui-common the single owner of the Astryx version.
- Declaring them as `peerDependencies` would also work. It keeps a single copy,
  but it forces each consumer to install and pin `@astryxdesign/*` itself,
  which defeats the goal.

**Declare `@stylexjs/stylex` as a `peerDependency`**, in the range Astryx
requires (`^0.19.0`). One runtime copy serves Astryx, ui-common and webui's own
compiled styles. This is also what triggers unplugin's auto-discovery.

**JS re-exports.** Provide one ui-common subpath per Astryx component that
consumers use, with the same subpath shape as Astryx's, so a codemod can
rewrite `@astryxdesign/core/X` to `@lablup/ui-common/astryx/X` or similar.
Also re-export `theme`, `hooks` and `utils`, and `lab` if it is kept. Re-export
the prop types, including `xstyle?: StyleXStyles`, unchanged.

**Tokens subpath.** Export
`"./theme/tokens.stylex": { "types": …, "import": "./dist/theme/tokens.stylex.js" }`,
and optionally `./theme/tokens`, which is not StyleX and serves JS resolvers.

- The file is exactly `export * from '@astryxdesign/core/theme/tokens.stylex'`.
- The subpath name **must** end in `.stylex`.
- Keep it out of the root barrel for StyleX use. A barrel import compiles only
  where no StyleX compiler touches it.
- Add `**/*.stylex.js` to `sideEffects`, mirroring Astryx.

**CSS subpaths.** Each is one line of `@import`:

- `./styles/astryx-reset.css`
- `./styles/astryx.css`
- `./styles/astryx-lab.css`
- one per theme, for example `./styles/astryx-theme-neutral.css`
- optionally `./styles/tailwind-theme.css`

The consumer keeps writing the `@layer` order statement first.

- This matches ui-common's existing CSS convention: `styles/base.css` and
  `styles/themes/*.css` are copied verbatim by `copyStyles()` in its
  `vite.config.ts`. So the new files are plain files under `src/styles/`, and
  the existing copy step already ships them.
- `check:pack` should assert that each one resolves.

**If ui-common authors StyleX itself**, meaning wrappers with their own
`stylex.create`:

- Compile at ui-common's build with `@stylexjs/unplugin`. The `@astryxdesign/build`
  Vite plugin is the other option, but it declares peer `vite ^8`, which
  ui-common already uses (`vite ^8.0.16`).
- Set `classNamePrefix` to something unique, such as `uc`, to avoid the
  collision class that FR-3534 hit.
- Emit one CSS file into a **named layer**, and document where it goes in the
  consumer's order statement.
- Any exported `defineVars` uses keys that start with `--`.
- The shipped JS then contains no `stylex.create`, so no consumer needs a
  compiler.
- Shipping uncompiled StyleX source instead would force all-smi to adopt a
  StyleX compiler. It would also make webui's output hash ui-common's styles
  under the `webui` prefix. Do not do this.

**What webui keeps directly.** It keeps `@stylexjs/stylex`,
`@stylexjs/unplugin` and `@stylexjs/babel-plugin`, for its own `stylex.create`
and `xstyle`. Its config is unchanged apart from the import specifiers.

**Case (a), webui.** webui rewrites three kinds of imports:

- the `@astryxdesign/*` component and theme imports, to ui-common subpaths
- `tokens.stylex` to `@lablup/ui-common/theme/tokens.stylex`
- the four CSS `@import`s in `react/src/index.css`, the BUI stylesheet and the
  Storybook `astryx.css`, to ui-common CSS subpaths

**Case (b), all-smi.** all-smi imports ui-common components plus the CSS
subpaths, and installs `@stylexjs/stylex` as the runtime peer. It needs no
compiler.

## Open uncertainties

- **Where ui-common's own layer goes** relative to `astryx-base` and
  `astryx-theme` is a design decision, not researched here. If it sits after
  `astryx-theme`, wrapper styles beat theme component overrides. If it sits
  before, they lose to themes.
- **The Astryx CLI.** `astryx component`, `astryx search` and the BUI
  integration in `packages/backend.ai-ui/astryx.integration.ts` read
  `@astryxdesign/cli` and core's `docs.mjs` from `node_modules`. webui can keep
  `@astryxdesign/cli` as a devDependency for tooling. Whether "no direct
  `@astryxdesign/*`" should cover devDependencies is a policy question for
  FR-4046.
- **Future StyleX versions.** The `--`-key, suffix-based resolution is
  unchanged in 0.19.0, which webui pins. It is internal to
  `unstable_moduleResolution` (the name says unstable), so re-run the probe on
  StyleX bumps.
- **The `source` export condition.** It would let a consumer compile Astryx from
  TS source (Astryx's `apps/example-nextjs-source`). It is not needed for either
  consumer and was not evaluated further.
- **`@astryxdesign/lab`'s peer** on a core canary does not match core 0.6.2.
  Today it works under webui's pnpm config. If ui-common re-exports lab, it
  inherits that mismatch and the lab patch.
- **Mixing prebuilt `theme-neutral/built` with runtime `<Theme>`** was not
  examined for ui-common. It is the same as today in webui.

## Sources

- `react/node_modules/@astryxdesign/core@0.6.2`: `package.json`, `README.md`,
  `CHANGELOG.md`, `dist/Button/Button.js`, `dist/theme/tokens.stylex.js`,
  `dist/astryx.css`
- `@astryxdesign/theme-neutral@0.6.2` and `@astryxdesign/lab@0.3.0-canary.12db2a1`:
  `package.json`
- `pnpm run astryx docs styling-libraries`, `docs getting-started` and
  `docs theme` (CLI 0.6.2)
- `@stylexjs/babel-plugin@0.19.0` `lib/index.js`: `importPathResolver`,
  `getCanonicalFilePath`, `resolveVarGroupKey`, and the import-specifier
  evaluation path
- `@stylexjs/unplugin@0.19.0`: `README.md` and `lib/core.js`
  (`discoverStylexPackages`, `shouldHandle`, `transformInclude`)
- StyleX docs: <https://stylexjs.com/docs/learn/theming/defining-variables> and
  <https://stylexjs.com/docs/api/configuration/babel-plugin>
- webui: `react/vite.config.ts`, `react/vitest.config.ts`, `react/src/index.css`,
  `packages/backend.ai-ui/{vite.config.ts,package.json,src/styles/backend.ai-ui.css}`,
  `pnpm-workspace.yaml`
- ui-common at `bdf2765`: `package.json` and `vite.config.ts` (`copyStyles`,
  `linkComponentStyles`), `README.md`
