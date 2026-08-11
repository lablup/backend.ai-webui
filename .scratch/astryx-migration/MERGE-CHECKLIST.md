# `to-astryx` → `main` merge checklist

**Status: the migration's compliance goal is MET.** `antd` is not a dependency
of any workspace, no shipping file imports it, and `scripts/antd-zero-gate.sh`
is green on all three parts. What is left before merge is *verification*, not
migration work — and one of those steps (the live e2e suite) cannot run in an
agent session at all. Read "Blocking" for what that means.

Everything above the divider in `REMAINDER.md` is regenerated from
`scripts/migration-gates/antd-remainder-report.mjs`; this file is the human
decision record.

---

## Why this was binary

MIGRATION-SPEC §1 fixes the compliance model: because antd's `Form` and its
`ConfigProvider` were kept until last, **there was no partial-compliance
milestone.** Compliance is achieved at one instant — when the last antd render
disappears and `antd-zero-gate.sh` turns green — and not before. A merge that
landed 90% of the migration would have delivered 0% of the compliance benefit
while paying 100% of the UX cost (§2.5: mixed antd/Astryx design surfaces
shipping side by side).

That is the whole argument for the single-switch strategy, and it is why this
checklist never offered a "merge the good parts" option.

---

## What the final switch removed

The five items this file listed as blocking are all closed. For the record, in
the order they came out:

1. **The 21 antd locale bundles.** `packages/backend.ai-ui/src/locale/*_*.ts`
   re-exported `antd/es/locale/*` into `BAILocale.antdLocale`, and were
   published as the `backend.ai-ui/dist/locale/*` package export (globbed into
   `vite.config.ts`'s lib entries). Their only consumer was antd's
   `ConfigProvider locale` prop. Deleted with the export, the vite glob, the
   `react/tsconfig.json` path alias, and the `Locale` type import in
   `locale/index.ts` — the single biggest transitive drop, since that barrel
   tainted 681 files. `BAILocale` is now `{ lang: string }`, published from
   BUI's main entry, and `react/src/helper/bui-language.ts` derives its map
   from `SUPPORTED_LANGUAGES` instead of restating 21 imports.

2. **The theme producers.** `ReverseThemeProvider`, `ThemeAdminProvider` and
   `ThemeSecondaryProvider` each built an antd `ThemeConfig` and installed it
   through a nested `ConfigProvider`, reading `ConfigProvider.ConfigContext` to
   inherit the parent's algorithm. All three are deleted. Their Astryx
   counterparts (`react/src/astryx-theme/AstryxAdminTheme` /
   `AstryxSecondaryTheme` / `AstryxReverseTheme`, ticket 02, mode re-passed
   explicitly because a nested `<Theme>` falls back to `system`) were already
   built and, for `AstryxAdminTheme`, already mounted alongside the antd half.

   Two call sites needed a decision rather than a rename, because by the final
   switch **neither antd provider was affecting anything** — every descendant
   had already converted, so each was re-theming an empty set:
   - `StartPage`'s deployment card → `AstryxSecondaryTheme`. This restores the
     secondary accent on the card's action button, which had silently reverted
     to the brand accent when `ActionItemContent` converted. See "Known
     partial fidelity" below for what it does *not* restore.
   - `BAINotificationButton` → `MediaTheme mode="dark"`, wrapping only the
     trigger. That is the same primitive `WebUIHeader` wraps the sibling band
     controls in, so the bell's tooltip now matches theirs. The notification
     drawer stays outside it: Astryx renders overlays as inline siblings, not
     portals, so a drawer inside an on-dark context paints as a dark surface in
     light mode.

3. **The provider stack.** `DefaultProviders` no longer mounts `ConfigProvider`
   or antd's `<App>`; `MainLayout`'s admin scope is `AstryxAdminTheme` alone;
   `react/src/index.tsx` no longer installs a `holderRender` for antd's static
   methods. `BAIConfigProvider` keeps its Astryx
   `InternationalizationProvider` + BUI locale wiring (ticket 30) and lost its
   antd leg, along with the `theme` / `csp` / `modal` / `drawer` / `tag`
   pass-through props that only that leg could consume.

   `globalThis.baiNonce` now has **no consumer in the React tree**: antd's
   cssinjs was the last runtime `<style>` injector, and Astryx injects none.
   The nonce is still emitted for `index.html`'s inline scripts.

4. **The two surviving type imports**, which shipped nothing but kept antd
   required for `tsc` and kept ~640 files inside the import-graph gate:
   - `GlobalToken` (`theme-shim/index.tsx`) → `theme-shim/tokenType.ts`, a
     generated-then-frozen capture of antd 6.5.0's token shape produced with
     the TypeScript checker at removal time. ~494 alias tokens with their exact
     `string` / `number` types, so none of the ~500 `token.*` reads across the
     app lost a type. Per-component token blocks are typed openly (only
     `token.Layout?.{headerBg,headerHeight}` is ever read).
   - `SorterResult` (`hooks/reactPaginationQueryOptions.tsx`) → the two picked
     members restated inline.

5. **The dependency.** `antd` is out of `react/package.json`, out of BUI's
   `peerDependencies` + `peerDependenciesMeta`, and out of the
   `pnpm-workspace.yaml` catalog (along with the already-unused
   `@ant-design/icons` catalog entry). `react/src/fix_antd.css` is deleted
   (nothing imported it). `react/vite.config.ts` drops `antd` /
   `@ant-design/icons` / `@ant-design/colors` from `optimizeDeps.include`.

   **One antd-family package remains and should:** `@ant-design/colors`, a
   `devDependency` of `packages/backend.ai-ui`, is the reference implementation
   that `theme-shim/themeShim.test.ts` asserts the vendored
   `theme-shim/vendor/antdColors.ts` is bit-identical to. It ships in nothing
   and is invisible to gate part (a), which walks production dependencies only.

### Things that had to be frozen rather than deleted

Three artifacts were computed *from* antd and are now constants. Each says so
in its own header, including how to regenerate deliberately:

| Artifact | Was | Why frozen |
|---|---|---|
| `theme-shim/tokenType.ts` | `import type { GlobalToken } from 'antd'` | ~500 call sites are typed against this shape |
| `theme-shim/antdDesignTokenFixture.ts` | `antdTheme.getDesignToken()` computed live in `themeShim.test.ts` | the parity test's expected values; the file's own header always said "when the npm package is removed, freeze these" |
| `resources/antdThemeConfig.schema.json` | generated by `scripts/gen-theme-schema.cjs` from antd's `.d.ts` | `resources/theme.json` is still authored in antd token names — that vocabulary is what the theme-shim reads |

The form-engine acceptance suite
(`react/src/form-engine/formEngineAcceptance.test.tsx`) is the fourth case and
was handled differently: it ran `describe.each` over `[['antd', AntdForm],
['engine', EngineForm]]` so the antd row acted as a live oracle. Its header
planned for this exact moment — the antd row is dropped and the engine row
becomes a plain regression suite. The 29 assertions are unchanged and carry the
oracle's verdict forward because they passed against real antd on every run up
to this commit.

### Migration scaffolding that was removed with its subject

- **`react/theme-probe/` (55 files)** — the A/B harness that rendered the same
  screen on both stacks side by side (`form.html?variant=antd|bai` and 20 more
  pages). Its "before" side no longer exists. It was never part of the app
  build, tsconfig, lint or prettier scope, so it would have sat there importing
  an uninstalled package indefinitely.
- **the `visual-harness` job** in `.github/workflows/astryx-migration-gates.yml`,
  which drove that harness — and, later, the whole workflow plus
  `scripts/migration-gates/visual-compare.mjs` and `report.sh` with it. The
  visual comparer had been kept "for any future before/after", but nothing
  called it, and the informational workflow only ever triggered on
  `to-astryx`, which this merge retires. Automated verification past the
  antd-zero gate was judged to have stopped earning its keep (2026-08-11).
- **the `@rc-component/motion` `transitionend` auto-completer** in
  `packages/backend.ai-ui/setupTests.ts`, a MutationObserver on every class
  mutation in every BUI test, for animations nothing produces any more.
- **`react/src/pages/SessionLauncherPage.css`**, whose single rule targeted
  `.ant-radio`.

### Dead `.ant-*` selectors that were still being queried

The `.ant-*` gate surfaced four live queries — not comments — that had stopped
matching anything when their components converted. Each failed *silently*,
which is why they survived:

- `SessionLauncherErrorTourProps` (`.ant-card-head`) and
  `AdminDeploymentPresetValidationTour` (`.ant-card-extra`) — both anchor a
  product-tour step to part of `BAICard`'s header. `BAICard` was rebuilt on
  Astryx in W2-D and stopped emitting those classes; a null tour anchor
  degrades to an unanchored step rather than throwing. `BAICard` now emits
  `bai-card__head` / `bai-card__extra` **as anchors**, both tours point at
  them, and `BAICard.test.tsx` has two assertions so this cannot recur
  silently.
- `DeploymentAddRevisionModal`'s scroll-to-first-error scoped its query with
  `.ant-modal-body`, dead since `BAIModal` became an Astryx `Dialog` — so the
  whole selector returned null and a failed submit scrolled nowhere. Now
  `dialog[open]`.
- `useKeyboardShortcut`'s `'.ant-modal, dialog[open]'` — the first alternative
  is dead; the second already covered every modal.

---

## Blocking — must be closed before merge

### 1. The live e2e suite has not been run

This is the one genuine blocker and it **cannot be closed in an agent
session**: the Playwright suite needs a running Backend.AI cluster.

```bash
pnpm run e2e            # requires a live cluster
```

Two things make this higher-risk than a normal pre-merge e2e run:

- **846 `.ant-*` references remain under `e2e/`** —
  `node scripts/migration-gates/ant-selector-gate.mjs` for the list. Ticket 31
  moved the bulk of the locators onto `data-*` / BAI anchors, but the
  `e2e/visual_regression/**` suites and a handful of functional specs
  (`e2e/serving/endpoint-route-table.spec.ts`, `e2e/auth/password-expiry.spec.ts`
  among them) still select antd DOM that no longer exists. **Expect these to
  fail, and read a failure as a stale locator, not a broken feature**, unless
  the same screen also fails a `data-*`-anchored assertion. Re-anchoring them
  is follow-up work sized off the actual failure list rather than off the grep.
- The visual-regression baselines were captured against antd rendering. They
  will not match and need re-baselining as a deliberate step.

### 2. Visual QA — priority screens, both modes

The final switch removed the app's entire theming layer in one commit, so a
theming regression would be global rather than local. The agent sweep covered
this (see "Live verification performed" below), but a human pass on these is
still worth it — ticket 33 flagged them as where the styling-engine change is
most likely to surface:

1. Frameless header drag region (Electron)
2. `BAIModal` — maximized / minimized / fullscreen states
3. Notification drawer — left border in `margin-style`
4. Chat markdown rendering
5. Session Launcher (the form engine's acceptance surface, ticket 34)

### 3. Electron smoke

`make clean && make dep && pnpm run electron:d`. Ticket 33 verified the
pipeline; it has not been re-verified since the provider stack came out.

---

## Known partial fidelity (accepted, recorded)

**`StartPage`'s deployment card is only partly on the secondary accent.**
`AstryxSecondaryTheme` re-themes the Astryx CSS cascade, so the card's action
button takes the secondary accent again. Its title and icon colours come from
`theme.useToken().colorPrimary` — and `ThemeShimProvider` is mounted **once**
at the app root, not per subtree, so the shim hands out the brand accent
regardless of nested Astryx themes. Before the migration antd's
`theme.useToken()` *was* per-subtree, so those two elements were teal.

Fixing it properly means either making the shim probe the live cascade per
consumer (it deliberately does not — `useToken()` is called per table cell and
a per-call subscription would cost thousands) or converting
`ActionItemContent`'s three token reads to Astryx custom properties. The second
is the right answer and is a small, self-contained follow-up; it is not the
final switch's job.

**`BAIBulkEditFormItem` + `BAISelect` reverts to "Keep as is" on selection.**
Found while converting `BAIBulkEditFormItem.test.tsx` off antd's `Select`.
Picking an option blurs the Astryx `Selector` trigger *before* the form value
commits, so `handleControlBlur` reads `undefined` and resets the mode. Not a
regression this commit introduces and not reachable in the app — both call
sites pair the form item with `AstryxFormNumberInput` and `BAICheckbox`, never
a select — so the test uses a local `<select>` double (documented in the file)
rather than turning four mode-machine tests into tests of Astryx's popup-blur
ordering. Worth a follow-up before anyone pairs the two.

---

## Verification performed

### Gates

```bash
bash scripts/antd-zero-gate.sh          # (a) prod graph, (b) build output, (c) import graph
node scripts/migration-gates/ant-selector-gate.mjs
node scripts/migration-gates/astryx-token-gate.mjs
node scripts/migration-gates/antd-remainder-report.mjs
```

Part (b) only runs after `pnpm run build`, and the build needs a root
`config.toml` (gitignored; `cp config.toml.sample config.toml`). Without it the
build aborts early and part (b) refuses to trust the half-populated
`build/web` — it asserts a minimum asset count rather than reporting PASS over
six static files.

**Do not add allowlist entries to make these pass.** The gate's value is that
it cannot be negotiated with. Part (b)'s `anticon` signature in particular must
stay: final-B renamed the first-party icon class to `bai-icon` precisely so
that a match there means a real `@ant-design/icons` reintroduction. One
documented false positive remains and is not fixable from our side —
`build/web/assets/main-*.js` bundles the Chat token counter's `cl100k_base` /
`o200k` BPE vocabularies, and `" anticon"` is one of their ~200k merge tokens.
If that chunk is the *only* hit, the build is clean.

Measured on the final-switch commit, before → after:

| Surface | Before (`3e0f432bd`) | After |
|---|---|---|
| Gate (a) production graph | 2 roots: `backend-ai-webui-react → antd`, `backend.ai-ui → antd` | clean |
| Gate (b) bundle scan | not runnable (antd shipped) | PASS, 607 js/css files scanned |
| Gate (c) import graph | 966 scanned · 31 direct · 695 antd-reachable · 293 free (29.7%) | 966 scanned · **0 direct · 0 reachable · 966 free (100%)** |
| `.ant-*` refs in app source | 155 in 47 files | 69 in 35 files, all prose |
| `pnpm why antd` | 2 workspaces | empty |

### Static

- `bash scripts/verify.sh` → `=== ALL PASS ===` (Relay / Lint / Format /
  TypeScript / warmup / StyleX / Astryx theme build / Terminology)
- react vitest: 65 files, 1148 passed. BUI vitest: 37 files + 1 skipped,
  548 passed.
- `pnpm run build` — full production build green.
- `pnpm why antd` → empty.

### Live verification performed

Dev server on 6020 against the shared test cluster, Playwright, both modes,
dark entered through the HEADER BUTTON (the `useThemeMode` path, not
`colorScheme`) so the flip exercises the same source of truth the removed
`ConfigProvider` used to be driven from in parallel.

**17 routes × 2 modes + 5 overlay surfaces × 2 modes. 0 pageErrors anywhere.**

- Routes: start / dashboard / data / session / session-start / deployments /
  chat / model-store / statistics / my-environment, admin users / settings /
  information / environment / agent / storage-settings, and usersettings.
- Overlays — the families that used to render OUTSIDE the themed subtree and
  were the entire reason for `ConfigProvider.config({ holderRender })`: the
  folder-create modal, the notification drawer, the user-dropdown panel, an
  app-shim toast, and the project selector's popup.
- Every route reported `data-theme` = the expected mode and
  `data-astryx-theme` = `bai-r8-default-brand-h48p6jt`, i.e. the brand theme
  actually mounted rather than falling back to theme-neutral.
- Header band follows the mode through the theme-shim's component tokens:
  `rgb(255,151,41)` light → `rgb(232,138,40)` dark, matching `theme.json`'s
  `Layout.headerBg` per mode.
- Overlays in dark: modal `rgb(31,31,31)`, drawer `rgb(20,20,20)`, both with
  white text. The user-dropdown panel is on-dark in BOTH modes, which is its
  own `MediaTheme` and the behaviour to preserve.
- **Zero antd DOM nodes** on every route and every overlay. (The probe matches
  on a class-token boundary; `[class*="ant-"]` reports 55–99 phantom hits per
  page because Cloudscape's `awsui_variant-default_…` contains the substring.)
- Admin scope renders the admin accent with no antd half present — verified
  visually on `admin/users` in dark (blue create button, tab underline, icons).
- The notification bell's tooltip and glyph now measure **identical** to its
  sibling band controls (`button-theme`, `button-help`) in both modes, which is
  the point of the `MediaTheme` swap.

Scripts and evidence: `final-switch-login.mjs`, `final-switch-sweep.mjs`,
`final-switch-belltip.mjs`, `final-switch-sweep-{light,dark}.json`, and
`shots/final-switch/`. The Playwright storage state is deliberately NOT
committed — it holds a live `backendaiwebui.sessionid` (`.gitignore` entry
added).

---

## Merge

Single merge, no squash — the per-ticket history is the migration's audit trail
and the rollback granularity (§2.5).

```bash
git checkout main && git pull
git merge --no-ff to-astryx
```

Resolve any `pnpm-lock.yaml` conflict by taking main's copy and re-resolving,
per `.claude/rules/pnpm-lockfile-conflicts.md`:

```bash
git restore --source=main pnpm-lock.yaml && pnpm install
```

The push needs the `workflow` scope, because
`.github/workflows/astryx-migration-gates.yml` is **deleted**:

```bash
gh auth refresh -s workflow
```

### After merge

The informational gates workflow is gone — it only ever triggered on
`to-astryx`, and it always exited 0. What survives is the part that protects the
invariant rather than reporting on it: `scripts/antd-zero-gate.sh` (+ its
`antd-import-graph.mjs` part-c resolver), `astryx-token-gate.mjs` and
`ant-selector-gate.mjs`, all reachable from the `astryx-migration-fix` skill's
verification bar.

The follow-up is unchanged and is now the ONLY automated defence: make
`scripts/antd-zero-gate.sh` a **blocking** check on `main`. That is what turns
"antd is gone" into "antd cannot come back", and with the informational
workflow retired there is nothing else standing between this migration and a
slow reintroduction.
