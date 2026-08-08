# `to-astryx` → `main` merge checklist

**Status as of ticket 35: NOT merge-ready.** This document exists so the
decision is made on measurements rather than on a ticket count. Read
"Blocking" first; the rest only matters once those are closed.

The branch is *healthy* — `verify.sh` passes, both unit suites pass, the
production build succeeds. It is not *done*: the compliance goal of this
migration is the removal of the antd family, and 285 shipping files still
render antd. See `REMAINDER.md` (generated, re-runnable) for the inventory.

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

### 1. 285 files still render antd

`node scripts/migration-gates/antd-remainder-report.mjs` — current split:

| Owner | Files |
|---|---:|
| app · components | 149 |
| BUI · fragments | 46 |
| BUI · components | 45 |
| BUI · infrastructure (shims, hooks, helper) | 29 |
| app · pages | 9 |
| BUI · Table | 4 |
| app · other | 3 |

This is MIGRATION-SPEC Phase 3 ("재구축 버킷", estimated 22–30 agent-sessions);
tickets 25–30 landed a portion of it. Work the **taint hubs** first — the
report ranks direct-antd files by how many other files they make
antd-reachable, and BUI infrastructure sits at the top because effectively the
whole app imports it. Converting one hub clears its entire dependent set.

### 2. `@ant-design/x` cannot be converted away — it must be removed

`@ant-design/x` declares `peerDependencies { antd: ^6.1.1 }` and hard-depends
on `@ant-design/icons`, `@ant-design/cssinjs`, `@ant-design/colors` and
`@rc-component/*`. With `autoInstallPeers: true` that peer resolves into the
production graph, so **this one package keeps gate part (a) red no matter how
much first-party code is converted.**

Four call sites, kept as frontier by ticket 23:

- `react/src/components/Chat/ChatMessage.tsx` — `FileCard`
- `react/src/components/Chat/ChatSender.tsx` — `Attachments`, `Attachment`
- `react/src/components/Chat/ChatInput.tsx` — `AttachmentsProps` (type)
- `react/src/helper/index.tsx` — `AttachmentsProps` (type)

Needs a self-hosted attachment/file-card surface, per the spec's simplicity
policy (implement what the call sites actually use, drop the rest and record a
`PILOT-DECISION`).

### 3. The antd `ConfigProvider` / `App` stack is still load-bearing

`DefaultProviders.tsx`, `MainLayout.tsx`, `ThemeAdminProvider.tsx`,
`ThemeSecondaryProvider.tsx`, `ReverseThemeProvider.tsx` and `index.tsx` still
mount antd's providers. **This is correct right now** and must not be removed
early: those providers are what style the 285 unconverted files. They come out
*last*, after item 1 — removing them first would leave the remaining antd
components unstyled rather than migrated.

### 4. Gates must actually be green

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
`REMAINDER.md` first**: `anticon` is a first-party class name now (iconShim
renders it, BUI ships its CSS, three e2e specs locate by it), so part (b) will
keep firing on it after antd is gone. The fix is to rename the class and
repoint the locators, not to delete the signature.

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
