# Dark-mode / token-propagation regression cluster — diagnosis & fix

**Branch:** `to-astryx` · **Date:** 2026-08-08
**Reported symptoms:** (1) in dark mode many surfaces stay LIGHT; (2) layout broken
in many places — spacing/gaps collapsed, elements mispositioned.

Everything below is measured, not inferred. Capture scripts and before/after
screenshots live in `.scratch/astryx-migration/shots/fix-dark/`.

---

## TL;DR

The two symptoms have **two different** root causes, and neither is the one the
brief hypothesised (portals / unresolved tokens / dev-vs-build layer order — all
three were checked and are **clean**, see "Hypotheses ruled out").

| # | Root cause | Symptom | Blast radius |
|---|---|---|---|
| 1 | `theme-shim` `TOKEN_MAP` is missing the `sizeSM` / `sizeMS` / `sizeMD` / `sizeLG` rungs; `BAIFlex` resolves named gaps by name, so those four produce `gap: undefined` and React drops the declaration | collapsed spacing | **~470 call sites** (`gap="sm"` 275, `gap="md"` 180, `gap="lg"` 19) |
| 2 | `theme-shim` `useToken()`'s provider-less fallback is hard-pinned to `'light'` **and** cached once globally (so it also freezes whatever cascade existed on the first call — usually the *neutral* fallback scope, not the brand theme) | light surfaces in a dark page | every subtree rendered outside `ThemeShimProvider`: route `errorElement` / `BAIErrorBoundary` (they sit ABOVE the provider stack in `routes.tsx`), Storybook, the `theme-probe` harnesses |
| 3 | antd's static-method holder (`ConfigProvider.config({ holderRender })` in `react/src/index.tsx`) carried the CSP nonce but **no theme algorithm** | statically-invoked `message.*` / `notification.*` / `Modal.*` paint light on a dark page | all static antd surfaces |
| 4 | (latent, hardening) `BAIFlex`'s array-gap branch built `` `${getGapSize(a)}px ${getGapSize(b)}px` `` while `getGapSize(undefined)` returned the string `'0px'` → `"0pxpx …"`, invalid CSS, both axes dropped | collapsed spacing | 1 array call site today; a trap for the next one |

---

## Evidence

### Root cause 1 — missing `size*` rungs (collapsed spacing)

`packages/backend.ai-ui/src/components/BAIFlex.tsx` resolved a named gap by
string concatenation:

```ts
return typeof size === 'string' ? (token as any)['size' + size.toUpperCase()] : size;
```

`packages/backend.ai-ui/src/theme-shim/mapping.ts` defined only
`sizeXXS`, `sizeXS`, `size`, `sizeXL`, `sizeXXL` — the ladder had a hole exactly
where the app uses it most. `token.sizeSM` etc. are `undefined`, so `gap` is
`undefined`, so React emits **no** `gap` declaration at all and the flex packs to 0.
The `as any` cast is why TypeScript never complained.

Measured on the dashboard harness (`probe-gap.mjs`, counts BAIFlex's inline `gap`):

```
before: { "0px": 17, "8px": 13, "(none)": 2, "4px": 7 }   ← "(none)" = declaration dropped
after : { "0px": 17, "8px": 13, "24px":  2, "4px": 7 }
```

The committed snapshot was a frozen record of the bug — `BAIFlex.test.tsx`
rendered `gap="sm"` and `__snapshots__/BAIFlex.test.tsx.snap` contained **no**
`gap` property. It passed because the test's `vi.mock('antd')` was inert:
BAIFlex stopped importing antd's `theme` during the migration and reads
`../theme-shim` instead, so the mock's carefully-listed `sizeSM: 12` never
reached the component.

Visible before/after: `before-h-resources-dark.png` vs `after-h-resources-dark.png`
(label/value rows and the tab strip regain their spacing), and
`before-app-dark-oslight.png` vs `after-app-dark-oslight.png` (the login card
grows taller as the logo/field gaps come back).

### Root cause 2 — `useToken()` fallback pinned to light + neutral scope

`packages/backend.ai-ui/src/theme-shim/index.tsx`:

```ts
let fallbackValue: ShimValue | undefined;
export function useToken(): ShimValue {
  const ctx = use(ThemeShimContext);
  if (ctx) return ctx;
  fallbackValue ??= { token: buildTokens('light', FALLBACK_SEEDS), … };  // ← always light, forever
  return fallbackValue;
}
```

Measured on the dashboard harness in dark mode (`scan-light-surfaces.mjs`, which
reports every element painting a light background together with the rules that
set it):

```
div 628x64  inline background-color: rgb(255,255,255)   ← BAIBoardItemTitle, token.colorBgContainer
div 132x114 inline background-color: rgb(241,244,247)   ← ResourceStatistics,  token.colorBgLayout
```

`#FFFFFF` / `#F1F4F7` are **theme-neutral's light** values — not even the brand
theme's (`#FFFBF8` / `#FAEFE9`). That pins down both halves of the bug: the mode
was wrong *and* the cached entry was computed before the root Astryx `<Theme>`
had synced `data-astryx-theme` onto `<html>`, so it probed `FALLBACK_SCOPE`
(`'neutral'`) and then never re-probed.

`before-h-dashboard-dark.png` shows the white header bars and the light GPU tile;
`after-h-dashboard-dark.png` shows them dark. The remaining light-surface hit
after the fix is the translucent `astryx-segmented-control` (by design).

This path is reachable in the **app**, not only in harnesses: every route in
`react/src/routes.tsx` wraps `<DefaultProvidersForReactRoot>` in
`<BAIErrorBoundary>` and declares `errorElement: <ErrorView />` — both OUTSIDE
the provider stack, so any crash fallback rendered light-on-dark.

### Root cause 3 — antd static holder had no algorithm

`ConfigProvider.config({ holderRender })` existed only to inject the CSP nonce.
antd builds that holder from `globalConfig()`, i.e. outside the app's
`ConfigProvider`, so static `message` / `notification` / `Modal` calls rendered
with antd's **default (light)** algorithm regardless of the app's mode — the
exact "renders outside the themed subtree" hazard the Astryx side already solves
by syncing `data-theme` onto `<html>`. Two files still call antd's static
`message` (`ImportRepoForm.tsx`, `TOTPActivateModal.tsx`), and the holder is a
runtime surface for compiled plugins too.

---

## Hypotheses ruled out (measured)

**Astryx theme mode does not propagate into portals — FALSE.** Astryx's `Theme`
syncs *both* `data-theme` and `data-astryx-theme` onto `<html>` when it is the
root theme (`Theme.tsx: useRootThemeSync`), and `AstryxBrandTheme` is mounted
app-wide in `DefaultProviders`. Measured on the login screen with a toast **and**
an app-shim dialog open (`probe-overlays.mjs`, `probe-toast2.mjs`), OS preference
deliberately set OPPOSITE to the app's mode:

```
html: data-theme=dark, data-astryx-theme=bai-r1-default-brand-h14z92nn, color-scheme=dark
every direct child of <body> (incl. portal roots): color-scheme=dark,
  --spacing-4=16px, --color-background-surface=light-dark(#FFFBF8,#211A16)
app-shim dialog: background rgb(33,26,22)  ✓ dark
app-shim toast : shell rgb(255,251,248) + MediaTheme text rgb(23,23,23)  ✓ correct —
  Astryx toasts are INVERTED by design (light surface in dark mode); the text
  colour comes from the `[data-astryx-media="light"]` block, which our built
  theme CSS does emit.
```

The ticket-29 notification stack was also opened in both modes
(`after-notif-dark.png`): dark surfaces, correct contrast.

**CSS tokens unresolved outside the themed scope — FALSE.** Dumped all 226 custom
properties resolving at `<html>` (`tokens-html.json`) and diffed them against
every `var(--…)` referenced in `react/src` + `packages/backend.ai-ui/src` and
every Astryx variable named by `TOKEN_MAP`. Zero unresolved app-code tokens
(`--color-background-app` is used only by a probe page; `--radius-md` only in a
comment). `--spacing-4` resolves to `16px` at `<html>`, `<body>`, every portal
root and deep page content, in both modes.

**Dev vs production `@layer` / StyleX injection order — FALSE.** Ran
`pnpm run build:react-only`; the built `assets/index-*.css` opens with
`@layer reset,theme,base,astryx-base,astryx-theme,components,utilities;` as its
first rule, matching the dev-server cascade (both were captured via
`document.styleSheets` in the running app).

**The theme-shim mis-probes in dark — FALSE.** Replicated the shim's own probe
inside the running app (`probe-shim.mjs`): every colour token resolves to its
dark side in dark mode (`--color-background-surface` → `rgb(33,26,22)`,
`--color-background-body` → `rgb(24,15,8)`, `--color-text-primary` →
`rgb(235,224,218)`) and to its light side in light mode. `ThemeShimProvider`'s
`MutationObserver` re-probe on `data-theme` / `data-astryx-theme` works.

---

## Fixes applied

1. **`packages/backend.ai-ui/src/theme-shim/mapping.ts`** — completed the `size*`
   ladder: `sizeSM` → `--spacing-3` (12), `sizeMS` → `--spacing-4` (16),
   `sizeMD` → `--spacing-5` (20), `sizeLG` → `--spacing-6` (24). Comment records
   why the ladder must stay complete.
2. **`packages/backend.ai-ui/src/components/BAIFlex.tsx`** — replaced the
   `token['size' + …]` string concatenation with an explicit `GAP_TOKEN` table
   keyed on `GlobalToken`, so a future hole is a **compile error** here instead
   of a silent 0 gap. `getGapSize(undefined)` now returns the number `0` (was
   `'0px'`), which also fixes the `"0pxpx"` array-gap trap.
3. **`packages/backend.ai-ui/src/theme-shim/index.tsx`** — the provider-less
   `useToken()` fallback now reads the live document scope
   (`html[data-theme]`, falling back to `prefers-color-scheme`) and the live
   theme name (`html[data-astryx-theme]`), and caches **per (mode, theme-name)**
   instead of once globally. Deliberately no subscription: `useToken()` is called
   per table cell, so a per-call `useSyncExternalStore` would install thousands
   of listeners to serve a path the app root never takes; reading two attributes
   at render time is enough because a mode flip re-renders the owning tree.
4. **`react/src/index.tsx`** — the static-method holder is now wrapped in a
   `StaticHolderTheme` that keeps the CSP nonce **and** applies
   `darkAlgorithm`/`defaultAlgorithm`. It seeds from `globalThis.isDarkMode` and
   subscribes to `change:backendaiwebui.setting.isDarkMode` (both published by
   `ThemeModeProvider`, the single source of truth) so a mid-session toggle
   repaints a holder that antd creates once and never remounts.
5. **`packages/backend.ai-ui/src/components/BAIFlex.test.tsx`** — the inert
   `vi.mock('antd')` now mocks `../theme-shim` (what BAIFlex actually imports),
   plus a `test.each` regression guard asserting all eight named gaps resolve to
   a concrete px value. The snapshot update in this commit is the bug's
   fingerprint: `gap="sm"` went from *no gap declaration* to `gap: 12px`.

Design decisions (PILOT-DECISIONs) were not touched; no per-page colour patching
was done.

---

## Verification

- `bash scripts/verify.sh` → `=== ALL PASS ===` (Relay / Lint / Format /
  TypeScript / Vite warmup / StyleX cssInjectionTarget / Astryx theme build /
  Terminology).
- `pnpm --filter backend.ai-ui build` → OK; BUI vitest **22 files, 449 passed**,
  1 skipped.
- react vitest (`cd react && pnpm run test`) → **62 files, 1164 passed**.
- `pnpm run build:react-only` → OK (also used as the layer-order evidence above).

---

## What still needs a logged-in backend

No cluster is reachable from this box, so only the login screen, the in-app
`/stylex-probe` route (which is behind the login gate — reconfirmed, see
`after-stylex-probe-{light,dark}.png`) and the `theme-probe` harnesses could be
driven. Still to check once a backend is available:

1. **The authenticated shell end-to-end in dark mode** — header, sider, page
   chrome, tables, detail drawers, modals on real data. The harnesses cover
   dashboard / resources / environments / sessions / frame chrome only, and
   several harness pages hard-pin `mode="light"` so they cannot report dark
   regressions at all (`form`, `sessions`, `deployments`, `settings`, `select26`,
   `table25`, `users21`, `brand`).
2. **Spacing on dense pages.** The gap fix restores `sm`/`ms`/`md`/`lg`
   everywhere, which changes the vertical rhythm of every list, table toolbar and
   form row that used them. This needs a visual pass — it is a *restoration*, but
   pages tuned around the collapsed spacing may now look loose.
3. **Statically-invoked antd surfaces in dark** (`ImportRepoForm`,
   `TOTPActivateModal`, and any compiled plugin using `message.*`) to confirm the
   `holderRender` algorithm lands.
4. **The route `errorElement` / `BAIErrorBoundary` fallback in dark** — now served
   by the document-following fallback, but only a real crash renders it.
5. **Nested-theme regions** (`AstryxAdminTheme` / `AstryxSecondaryTheme` /
   `AstryxReverseTheme`). Their mode re-passing is correct by construction and
   was measured in ticket 02's harness, but no authenticated surface that uses
   them was reachable here.

### Noted for the page-sweep phase (not fixed — out of scope for plumbing)

Only four hardcoded colours survive in app code; two are brand icon colours
(`BAICephIcon` `#EF424D`, `BAINvidiaIcon` `#76B900`, both intentional) and two
are mode-blind greys that read wrong on dark:

- `react/src/components/SimpleProgressWithLabel.tsx:75` — `backgroundColor: '#BFBFBF'`
  (the light-grey progress track visible in `after-h-resources-dark.png`).
- `react/src/components/AssignRoleModal.tsx:295` — `color: '#999'`.

`react/theme-probe/deployments.tsx:191` references `var(--color-background-app)`,
which is not an Astryx token and resolves to nothing — probe-only, but it should
become `--color-background-body` when that harness is next touched.

---

## Capture / measurement scripts

All under `.scratch/astryx-migration/shots/fix-dark/`:

| script | what it does |
|---|---|
| `probe-app.mjs [tag]` | login screen in themeMode light/dark × OS light/dark; DOM attrs, computed tokens at html/body/react-root/portal roots, screenshots |
| `probe-harness.mjs [tag]` | every `theme-probe` page in light + dark, full-page screenshots + per-page theme state |
| `scan-light-surfaces.mjs <url>` | **in dark mode, lists every element painting a light background together with the CSS rules that set it** — the tool that located both dark-mode root causes |
| `probe-gap.mjs <url>` | counts BAIFlex's inline `gap` values; `"(none)"` is the collapsed-spacing signature |
| `probe-shim.mjs` | replicates the theme-shim's CSS probe inside the app for both modes |
| `probe-overlays.mjs` / `probe-toast.mjs` / `probe-toast2.mjs` / `probe-notif.mjs` | portal proofs with a toast / dialog / notification stack OPEN |
| `dump-tokens.mjs` | dumps every custom property resolving at `<html>` (input to the token diff) |
| `probe-stylex-page.mjs` | opens the in-app `/stylex-probe` route (confirms the login gate) |
