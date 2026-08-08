# `to-astryx` → `main` merge checklist

**Status as of phase 3 wave 3: NOT merge-ready.** This document exists so the
decision is made on measurements rather than on a ticket count. Read
"Blocking" first; the rest only matters once those are closed.

The branch is *healthy* — `verify.sh` passes, both unit suites pass, the
production build succeeds. It is not *done*: the compliance goal of this
migration is the removal of the antd family, and **58 shipping files still
render antd**. See `REMAINDER.md` (generated, re-runnable) for the inventory.

> **The counts below moved twice, and only once because work landed.**
> The old figure in this file was 285. Waves 1–3 genuinely closed three whole
> owner buckets (BUI · fragments, BUI · components, BUI · Table). But the
> report itself was also *lying in both directions* until p3-w3b fixed two
> parser bugs in `scripts/migration-gates/`:
>
> - **Comments counted as imports.** Migration comments here quote the antd
>   line they replaced (`// -import { Form } from 'antd';`). Three files —
>   `app-shim/bridge.ts`, `app-shim/index.tsx`, `form-engine/engine.ts` — were
>   ranked as the top antd hubs, at 577–579 taint each, while containing no
>   antd import at all. They are the *replacements*.
> - **Render files were being reported as type-only.** `classifyAntdImports`
>   matched with `[\s\S]*?` between `import` and `from 'antd'`, so a match
>   could begin at any earlier `import` keyword and swallow the statements
>   between. Nearly every file here opens with
>   `import type { …Fragment$key } from '…'`, so the captured clause began
>   with `type ` and the antd import was skipped.
>
> Both are fixed; treat any planning done against a pre-p3-w3b report as
> suspect. In particular, **do not plan off the hub ranking alone** — see
> "Work the hubs" below for why its top entries carry no convertible antd.

---

## Why this is binary

MIGRATION-SPEC §1 fixes the compliance model: because antd's `Form` was kept
until last, **there is no partial-compliance milestone.** Compliance is
achieved at one instant — when the last antd render disappears and
`antd-zero-gate.sh` turns green — and not before. A merge that lands 90% of
the migration delivers 0% of the compliance benefit while paying 100% of the
UX cost (§2.5: mixed antd/Astryx design surfaces shipping side by side).

That is the whole argument for the single-switch strategy, and it is the
reason this checklist does not offer a "merge the good parts" option.

---

## Blocking — must be closed before merge

### 1. 58 files still render antd

`node scripts/migration-gates/antd-remainder-report.mjs` — current split:

| Owner | Files | What it really is |
|---|---:|---|
| BUI · infrastructure (shims, hooks, helper) | 23 | 21 locale bundles + 1 test helper + **1** real conversion |
| app · components | 22 | the provider stack (item 3) + `@ant-design/x` (item 2) + genuine work |
| app · pages | 9 | genuine work |
| app · other | 2 | `react/src/index.tsx` (provider mount) + `helper/index.tsx` (see item 2) |
| BUI · fragments | 1 | `BAIRuntimeVariantPresetSettingModal` |
| BUI · components | 1 | `BAIConfigProvider` (item 3) |

Plus 4 **type-only** importers, which ship nothing and are erased by `tsc`:
`locale/index.ts`, `theme-shim/index.tsx`, `Chat/ChatInput.tsx`,
`hooks/reactPaginationQueryOptions.tsx`.

This is MIGRATION-SPEC Phase 3 ("재구축 버킷"). Three owner buckets that used to
be on this list — BUI · fragments (46), BUI · components (45), BUI · Table (4)
— are now closed.

**Work the hubs, but read the hub list correctly.** The report ranks
direct-antd files by how many other files they make antd-reachable, and BUI
infrastructure still sits at the top. That ranking is *not* a work queue:

| Hub | Taints | Convertible now? |
|---|---:|---|
| `locale/index.ts` | 658 | No — `import type { Locale }`, erased at build |
| `theme-shim/index.tsx` | 619 | No — `import type { GlobalToken }`, the token-shape contract ~600 call sites are typed against |
| `form-engine/index.ts` | 562 | No — this IS the park switch (item 5) |
| `useSchedulingHistoryExpandable.tsx` | 549 | **Yes** — the only genuinely convertible BUI-infra file left |
| `BAIConfigProvider.tsx` | 547 | No — item 3 |

So the actionable BUI-infrastructure item is exactly one file:
`packages/backend.ai-ui/src/hooks/useSchedulingHistoryExpandable.tsx` renders
an antd `Dropdown` + `Tooltip` kebab as the scheduling-history table's
`expandColumnTitle`. `DropdownMenu` + Astryx `Tooltip`, ~30 lines; the
precedent is `packages/backend.ai-ui/src/components/Table/BAINameActionCell.tsx`,
which builds the same overflow pattern.

`packages/backend.ai-ui/src/tests/storybook-mock-utils.ts` is a **scoping
artifact, not work**: it is test-only, absent from `src/index.ts` and from the
vite lib entries, imported only by four `*.stories.tsx` files that the scanner
itself excludes, and it taints 0 files. `EXCLUDE_DIR` covers `__tests__` but
not `tests/`. Fix the exclude list rather than converting it.

### 2. `@ant-design/x` cannot be converted away — it must be removed

`@ant-design/x` declares `peerDependencies { antd: ^6.1.1 }` and hard-depends
on `@ant-design/icons`, `@ant-design/cssinjs`, `@ant-design/colors` and
`@rc-component/*`. With `autoInstallPeers: true` that peer resolves into the
production graph, so **this one package keeps gate part (a) red no matter how
much first-party code is converted.**

Four call sites, kept as frontier by ticket 23:

- `react/src/components/Chat/ChatMessage.tsx` — `FileCard` (render)
- `react/src/components/Chat/ChatSender.tsx` — `Attachments`, `Attachment`,
  `Sender` (render), plus a deep `@ant-design/x/es/attachments` import
- `react/src/components/Chat/ChatInput.tsx` — `AttachmentsProps`, genuinely
  `import type`
- `react/src/helper/index.tsx` — `import { AttachmentsProps }`, **no `type`
  keyword**. This file was previously listed here as "(type)"; it is not. A
  type imported in value position keeps a 388-taint entry in the RENDER
  bucket. Adding `type` is a one-word change and should be done before any of
  the real work below.

Needs a self-hosted attachment/file-card surface, per the spec's simplicity
policy (implement what the call sites actually use, drop the rest and record a
`PILOT-DECISION`).

### 3. The antd `ConfigProvider` / `App` stack is still load-bearing

`DefaultProviders.tsx`, `MainLayout.tsx`, `ThemeAdminProvider.tsx`,
`ThemeSecondaryProvider.tsx`, `ReverseThemeProvider.tsx`, `index.tsx` **and
`packages/backend.ai-ui/src/components/provider/BAIConfigProvider/BAIConfigProvider.tsx`**
(the BUI-side mount, 547 taint — previously missing from this list) still mount
antd's providers. **This is correct right now** and must not be removed early:
those providers are what style the 58 unconverted files. They come out *last*,
after item 1 — removing them first would leave the remaining antd components
unstyled rather than migrated.

The `App` half is already solved and just needs repointing:
`packages/backend.ai-ui/src/app-shim/` is a complete Astryx-backed
`App.useApp()` / `message` / `modal` replacement (Layer + Toast), and most call
sites import from it today.

### 4. The form engine is PARKED, and unparking has a hidden prerequisite

`packages/backend.ai-ui/src/form-engine/engine.ts` is a **self-hosted,
antd-free** form engine. It is not wired up: `form-engine/index.ts` (BUI, 562
taint) and `react/src/form-engine/index.ts` (405 taint) both re-export antd's
`Form`. Ticket 34 pointed them at `./engine` and then reverted.

Unparking is a small edit — repoint both index files, restore
`<FormConfigProvider>` in `DefaultProviders.tsx` in place of
`<ConfigProvider form={{…}}>`, and swap the `.ant-form-*` e2e selectors back to
`[data-bai-form-item*]`. It is pinned by the 29-case acceptance suite
(`react/src/form-engine/formEngineAcceptance.test.tsx`).

**The prerequisite is localized validation messages.** Today the only source of
localized `${label}`-style validation templates is
`antdLocale.Form.defaultValidateMessages`, consumed in `DefaultProviders.tsx`.
`form-engine/messages.ts` ships English `${name}` fallbacks only, and BUI's own
`locale/*.json` has no generic validation templates. That is ~25 templates ×
21 languages — either translated, or vendored the way
`theme-shim/vendor/antdColors.ts` vendored antd's palette. Do this **before**
touching the locale bundles, not after.

### 5. Gates must actually be green

```bash
bash scripts/antd-zero-gate.sh          # parts (a) prod graph, (b) bundle, (c) import graph
node scripts/migration-gates/ant-selector-gate.mjs
node scripts/migration-gates/astryx-token-gate.mjs
```

Part (b) only runs after `pnpm run build`, so build first — and the build
needs a root `config.toml` (gitignored; `cp config.toml.sample config.toml`).
Without it the build aborts early, and before ticket 35 the gate would scan
the half-populated `build/web` and report **PASS**. That is fixed; part (b)
now refuses to trust a build that produced too few assets.

Do not add allowlist entries to make these pass — the gate's value is that it
cannot be negotiated with. **Read the "Gate caveats" section of
`REMAINDER.md` first**: `anticon` is a first-party class name now, so part (b)
will keep firing on it after antd is gone. `iconShim.tsx` emits `anticon`
(:118) and `anticon-spin` (:84), BUI ships the matching CSS in
`dist/backend.ai-ui.css`, and **two** live e2e locators still use it —
`e2e/user-profile/user-profile.spec.ts:250` (`.anticon-close`) and
`e2e/auto-scaling-rule-preset/preset-table-settings.spec.ts:298`
(`.anticon-check, [aria-label="check"]`). Every other `.anticon-*` hit under
`e2e/` is a comment recording that the class is gone. The fix is to rename the
shim's class to a BAI-namespaced one and repoint those two locators — **not**
to delete the signature, which is what would catch a real `@ant-design/icons`
reintroduction.

Also stale: `scripts/antd-zero-gate.sh` (lines 28–35) still carries a "KNOWN
CAVEAT" saying part (a) cannot go green while `@lobehub/fluent-emoji` /
`@lobehub/icons` are installed. Ticket 30 removed both — neither appears in any
`package.json`, and `react/src/components/brandIcons/generated/*` is the
replacement. Delete that caveat or it will send someone chasing a dependency
that no longer exists.

---

## The ordered path to antd-zero

Measured, not estimated. Steps 1–2 are independent; 3 gates 4; 5 must be last.

1. **`react/src/helper/index.tsx`: add the missing `type` keyword** (item 2).
   One word, −1 RENDER file, −388 taint.
2. **Convert the remaining real files** — 9 pages, the non-provider half of
   app · components, `BAIRuntimeVariantPresetSettingModal`, and the single BUI
   hook `useSchedulingHistoryExpandable`. Provider files are excluded here;
   they are step 5.
3. **Author first-party localized `validateMessages`** (item 4's prerequisite).
4. **Unpark the form engine** (item 4), then **delete the locale bridge
   atomically**: drop `antdLocale` from `BAILocale` (`locale/index.ts`), strip
   `import xx_XX from 'antd/es/locale/xx_XX'` from all 21 published
   `locale/*_*.ts` entries, and update `react/src/helper/bui-language.ts`, the
   four stories, `.storybook/localeConfig.ts` + `decorators.tsx`, and
   `src/tests/storybook-mock-utils.ts` in the same change. Astryx's
   `InternationalizationProvider` — already mounted inside `BAIConfigProvider`
   — becomes the only locale runtime. These 21 files are published build
   entries (`vite.config.ts` globs `src/locale/*_*.ts` → `dist/locale/*`), so
   this is one atomic edit, not 21 independent ones.
5. **The final provider switch** (item 3), then drop the two remaining
   `import type`s: `GlobalToken` from `theme-shim/index.tsx` and `Locale` from
   `locale/index.ts`.
6. **Remove `@ant-design/x`** (item 2) — self-hosted attachment/file-card
   surface. Not closable by conversion; the peer dep alone keeps part (a) red.
7. **Rename the `anticon` class and repoint the two e2e locators** (item 5).
8. **Build, then run the gates.** `cp config.toml.sample config.toml` →
   `pnpm run build` → all three gate scripts.

---

## Pre-merge steps for the user (once the above are closed)

### Live E2E — cannot run in an agent session

The Playwright suite needs a running Backend.AI cluster, which is not
available in the dev container. Static checks (lint over `e2e/`) run as part
of `verify.sh`; **they prove nothing about behaviour.**

```bash
pnpm run e2e            # requires a live cluster
```

Ticket 31 migrated e2e locators off `.ant-*` selectors onto `data-*` / BAI
anchors, so a selector-level failure after merge most likely means a component
lost its anchor attribute, not that the test is stale.

### Visual QA — priority screens

Ticket 33 flagged these as the screens where the styling-engine change is most
likely to surface. Check each in **both light and dark**:

1. Frameless header drag region (Electron)
2. `BAIModal` — maximized / minimized / fullscreen states
3. Notification drawer — left border in `margin-style`
4. Chat markdown rendering
5. Session Launcher (the form engine's acceptance surface, ticket 34)

The harness for a mechanical before/after check:

```bash
node scripts/migration-gates/visual-compare.mjs capture --url <url> --out <dir>
node scripts/migration-gates/visual-compare.mjs compare --before <a> --after <b> --out <c>
```

It judges layout anatomy and token compliance, **not pixel equality** — pixel
differences are expected and policy-sanctioned (component visuals follow
Astryx defaults; changes belong in the theme layer).

### Electron smoke

`make clean && make dep && pnpm run electron:d`. Ticket 33 verified the
pipeline; re-verify after the remaining conversions land.

### Push auth

The push needs the `workflow` scope if any `.github/workflows/` file changed:

```bash
gh auth refresh -s workflow
```

### Merge

Single merge, no squash — the per-ticket history is the migration's audit
trail and the rollback granularity (§2.5).

```bash
git checkout main && git pull
git merge --no-ff to-astryx
```

Resolve any `pnpm-lock.yaml` conflict by taking main's copy and re-resolving,
per `.claude/rules/pnpm-lockfile-conflicts.md`:

```bash
git restore --source=main pnpm-lock.yaml && pnpm install
```

---

## What ticket 35 did land

- Removed three dead production dependencies: `@ant-design/icons` (zero real
  imports remained), `@ant-design/cssinjs` (zero), and `@ant-design/colors`
  (two call sites repointed at the already-vendored, parity-tested port in
  `packages/backend.ai-ui/src/theme-shim/vendor/antdColors.ts`). Also dropped
  `@ant-design/icons` from BUI's optional peers. The antd-family production
  roots are now exactly three: `react → antd`, `react → @ant-design/x`,
  `backend.ai-ui → antd`.
- Added `scripts/migration-gates/antd-remainder-report.mjs` and the generated
  `REMAINDER.md`, so the remaining work is measured and re-measurable rather
  than estimated.
- Corrected the docs that had drifted: `AGENTS.md` (Astryx named as the
  component system; Electron 35 → 39), `README.md` (stale
  "webpack via Craco" → Vite; antd → Astryx).
