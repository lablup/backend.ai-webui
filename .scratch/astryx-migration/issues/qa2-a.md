# QA2-A — tabs: full-width rail, card-type variant, BAICard tabList chrome

Agent A of QA round 2 on `to-astryx` (base `0a6899059`). Scope: the three tab
complaints. Sibling areas (selects / `BAIFetchKeyButton`, layout rhythm &
drawers, chat composer) untouched.

Probes and raw measurements:
`.scratch/astryx-migration/qa2a-*.mjs`,
`.scratch/astryx-migration/shots/qa2-a/*.json`.

---

## 1. Tab default — the rail must span the whole tab bar

### Root cause

Astryx's tab strip is `display: flex; max-width: 100%` with **no `width`**
(`@astryxdesign/core/src/TabList/TabList.tsx`, `styles.nav`). A `<nav>` in
normal block flow therefore fills its container and the `hasDivider` rail spans
the bar; a `<nav>` inside a **flex row** hugs its tabs and the rail stops at the
last tab.

Two wrappers put it in a flex row so they could sit `tabBarExtraContent` beside
it, and that is where every short rail came from:

| Wrapper | Old markup | Measured before (1600px viewport) |
|---|---|---|
| `BAICard` | `<HStack><TabList/>{tabBarExtraContent}</HStack>` | rail 534px under a 1264px bar (`/admin/resource-policy`) |
| `BAITabs` | `<div style={{display:'flex'}}><TabList/>…</div>` | rail 428px under a 1264px bar (`/session`) |

Direct `TabList` call sites — `EnvironmentPage`, `ResourcesPage`,
`MyEnvironmentPage`, `AgentSummaryPage` (all four since folded onto `BAICard`,
see §3), the drawers, `RuntimeParameterFormSection`, `SessionDetailContent`,
`UsageBucketChartContent` — were already inside column-stretch containers and
already spanned (measured 1264/1264).

### PILOT-DECISION — fixed by COMPOSITION, not by a theme override

Astryx's own recipe for "tabs on the left, actions on the right, rail across the
whole bar" is `astryx template TabListTabsWithActions`: the actions are a CHILD
of the `<nav>` with `margin-inline-start: auto`. That is what both wrappers do
now, and it is also what `BAITabList` bakes in so nobody re-introduces the flex
row by hand.

A `defineTheme({ components: { 'tab-list': { base: { width: '100%' } } } })`
override was considered and **rejected**:

- it is redundant once the composition is right — the `<nav>` is block-level;
- it fights the `bai-card__tabs` full-bleed, which needs `width: auto` so the
  negative margins can widen the box (an explicit `width: 100%` would pin the
  box to the content width and only *shift* it left, which is exactly the bug
  the first attempt produced — measured navW 1264 at navX 265 instead of 1310);
- it would churn the committed `astryx theme build` artifacts for no behaviour.

### Not changed — tab strips with no rail at all

Several drawers render `<TabList>` **without** `hasDivider`, so they have no
rule at all (legacy antd always drew one). That is a phase-3 decision, not a
width bug, and the drawers belong to QA2-C. Forcing `border-block-end` into the
theme's `tab-list.base` would make `hasDivider` unopt-outable, so it was not
done. **Follow-up**: decide whether `hasDivider` should be on by default in
`AgentDetailDrawerContent`, `RoleDetailDrawerContent`,
`StorageHostDetailDrawerContent`, `UsageBucketChartContent`,
`RuntimeParameterFormSection`, `SessionDetailContent`.

---

## 2. The second (card) tab style

### PILOT-DECISION — wrapper component + `className` + tokens

New BUI component `BAITabList` (`type: 'line' | 'card'`), paint in
`BAITabList.css`. `react/src/components/BAITabs.tsx` (the antd-shaped `items`
wrapper) now renders it, so all 8 of its call sites inherit the style.

Why not the alternatives — checked against `astryx docs styling` /
`astryx docs theme` / `astryx component TabList`:

- **`xstyle` (StyleX).** Astryx's first-choice route, unavailable here: the repo
  has no StyleX compiler (CLAUDE.md: "don't use xstyle/utility classes").
- **`defineTheme({ components })`.** The systematic route, and the right one for
  a new *default* — but it cannot express this style at all:
  - a custom variant key (`'variant:card'`) only renders if the component
    **reflects** that prop, and `TabList` reflects `size` only
    (`themeProps('tab-list', {size})`; the theming table lists `data-size`);
  - the look needs `tab` styled **conditionally on its ancestor strip**, and
    component overrides are flat per-component — `tab.base` would repaint every
    tab in the app;
  - it is global by construction, and the brief requires both styles at once
    (`FolderExplorerModalV2` renders card at `xl`, line below).
- **`astryx swizzle TabList`.** Forks the component source — including the
  roving-tabindex / keyboard-hint machinery — to change nothing but paint.
  Astryx reserves swizzle for deep customization; a permanent maintenance cost
  for a purely visual delta.
- **Chosen: `className` + design tokens**, selected via the stable `.astryx-*`
  class and reflected `data-*` attributes, which `astryx docs styling` calls
  "the preferred selector surface for new CSS". Same mechanism the repo already
  uses in `BAICard.css`, `BAISider.css`, `BAIText.css`.

### Metrics vs legacy

Legacy source: antd `Tabs` card tokens + the NEO recolour in
`git show origin/main:react/src/components/BAITabs.tsx` (FR-534).

| antd | value | ours | rendered |
|---|---|---|---|
| `cardHeight` = `controlHeightLG` | 40px | `--size-element-lg` (`size="lg"`) | **36px** |
| `cardPadding` inline | 16px | `--spacing-4` | 16px |
| `cardGutter` = `marginXXS/2` | 2px | `--spacing-0-5` | 2px |
| `cardBg` = `colorFillAlter` | `#0000000a` | `--color-background-muted` | `rgba(0,0,0,.04)` / `rgba(255,255,255,.08)` |
| active bg = `colorBgContainer` | `#fff` | `--color-background-card` | `#fff` / `#141414` |
| border | 1px `colorBorderSecondary` | `--border-width` / `--color-border` | 1px |
| radius = `borderRadiusLG` | 8px | `--radius-element` | 8px (exact) |
| NEO: rail + inactive bottom + active border | `colorPrimary` | `--color-accent` | `#ff7a00` / `#be5e06`, admin `#028df2` / `#0387bf` |

**PILOT-DECISION — tab height 36px, not antd's 40px.** 40px is not on Astryx's
element-size scale; a literal would pin the height against every future theme.
A 4px shorter strip is the cheaper of the two errors. Everything else is exact.

**PILOT-DECISION — the line style's hover pill is suppressed on card tabs**
(`--color-overlay-hover: transparent` scoped to the tab). The pill is an
absolutely-positioned overlay with `--radius-element` on all four corners; on a
top-rounded boxed tab it rounds the wrong ones. Card tabs signal hover with the
accent text colour, as antd did. The selected-state underline
(`.astryx-tab-indicator`) is likewise hidden — the box is the selected-state
device in this style.

### Where the card style was restored

Legacy `BAITabs` hard-coded `type="card"`, so **card is the default** in the
wrapper and all six historical sites get it back with no edit:
`ComputeSessionListPage`, `AdminComputeSessionListPage`, `VFolderNodeListPage`,
`AdminVFolderNodeListPage`, `ProjectAdminDataPage`, `StartFromURLModal`.
Two later adopters opt out, matching what they used on `main`:

- `DownloadModal` → `type="line"` (it was a plain antd `Tabs`) — verified.
- `FolderExplorerModalV2` → `type={xl ? 'card' : 'line'}`, the responsive split
  the phase-3 note had written off as "no Astryx counterpart" — verified in both
  states, card and line visible on the same screen.

---

## 3. `BAICard tabList` as built-in card chrome

antd put `tabList` inside `.ant-card-head`, so the rail *was* the head's
`border-bottom` (full card width) while the first tab's label sat on the body
inset. `BAICard` now reproduces that in the component, so all 19 call sites get
it with **zero edits**.

Mechanism: `bai-card__tabs` full-bleeds the `<nav>` out to the card's borders
and re-adds the inset as padding. The only arithmetic is the bleed/inset
identity, derived from the `padding` step `BAICard` hands Astryx `Card`
(`--spacing-6`, or `--spacing-3` for `size="small"` via `bai-card--compact`),
minus `--border-width` because Astryx's bordered `Card` subtracts the border
from its padding. `bai-card__tabs--top` welds the strip to the top edge when it
is the card's first row (no title, no cover) and reserves `--spacing-5` above it
so the rail lands at antd's `headerHeight`.

`max-width: none` is required: Astryx's strip carries `max-width: 100%`, which
otherwise clamps the bled box back to the card's content width while the
negative margin still shifts it left (measured: navX 265 / navW 1264 instead of
1310 — one inset short on the right).

### Measured (1600px viewport, both schemes)

| | before | after | antd legacy |
|---|---|---|---|
| rail extent on a 264→1576 card | 288→822 | **265→1575** (border to border) | head border, border to border |
| first tab label x | 300 | **288** | 288 (= `headerPadding` 24px) |
| header band (card top → rail) | 61 | **58** | 57 (`headerHeight` 56 + 1px border) |
| tab height / rail gap | 32 / 4 | 32 / 4 | 46 (antd line tab: 12+22+12) |

### Call-site census — `git grep -ln "tabList" react/src packages/backend.ai-ui/src`

26 files match the word; **19 are real `tabList={…}` props**. All 19 are
title-less (so all take the top weld) and none is `size="small"`:

`DeploymentRevisionCard`, `AdminDeploymentPage`, `AdminSessionPage`,
`AdminUsersPage`, `AgentSummaryPage`, `BrandingPage`, `ConfigurationsPage`,
`DiagnosticsPage`, `EnvironmentPage`, `MaintenancePage`, `MyEnvironmentPage`,
`ProjectPage`, `RBACManagementPage`, `ReservoirPage`, `ResourcePolicyPage`,
`ResourcesPage`, `SchedulerPage`, `StatisticsPage`, `UserSettingsPage`.

Non-matches: `RuntimeParameterFormSection` and `ResourceAllocationFormItems`
have a LOCAL `tabList` array feeding a bare `TabList` (unaffected);
`BAICardAstryx` is the phase-2 pilot copy; the rest are `BAICard`'s own
source / test / story.

Rendered and measured `edgeToEdge: true` in light **and** dark on:
resource-policy, statistics, users, project, maintenance, settings (configs),
scheduler, reservoir, diagnostics, branding, rbac, usersettings,
admin/deployments, admin/session, environment, resources (agent),
my-environment, agent-summary. `DeploymentRevisionCard` sits on a deployment
detail view; its host `AdminDeploymentPage` is covered, and it takes the same
code path with no props of its own that change it.

### Consequence — four pages folded back onto the prop

`AgentSummaryPage`, `MyEnvironmentPage`, `EnvironmentPage`, `ResourcesPage` were
hand-inlined `Card` + `VStack` + `TabList` copies of `BAICard tabList` (their
own comments said so: "matching the original tabbed-card anatomy"). Once
`BAICard` grew real chrome they would have been the only tabbed cards left with
an inset, floating strip — a NEW inconsistency introduced by this change. They
are folded back onto `BAICard tabList`, which is also what they used on `main`.

---

## Handoff from QA2-C (table rhythm) — both numbers incorporated

C's findings 3 and 4 land inside this partition; both are covered by the work
above, and re-measured after it (`qa2a-gap.mjs`, `shots/qa2-a/final-gap.json`):

**C-3 — the four hand-inlined pages and their 16px tab→content gap.**
`EnvironmentPage`, `ResourcesPage`, `MyEnvironmentPage`, `AgentSummaryPage` are
folded back onto `BAICard tabList` (§3 above), so they no longer hand-roll the
boundary at all. The **16px gap itself is correct and is kept**: antd's tabbed
`Card` set `body.paddingTop = token.padding` = 16px, legacy `BAICard` set it
explicitly for exactly the `tabList` case, and `use-bai-card.md` codifies it
("Cards with `tabList` keep their default body paddingTop … a flush body would
put the first row of content immediately under the tab underline, which reads
as broken"). `BAICard`'s `VStack gap={4}` = 16px reproduces it.

Measured rail→content on all six tabbed surfaces checked: **16px**, uniform.
antd: head bottom border at y=57 + 16px body padding → content at 73;
ours: rail bottom at 58 + 16 → content at 74. One pixel, from the header band.

**C-4 — `.astryx-card` computes `padding: 23px`, not 24.** Confirmed
(`cardPadding: "23px"` on every card measured) and it is *the* input to the
bleed: `--bai-card-inset: calc(var(--spacing-6) - var(--border-width))` = 23px,
which is why the rail lands at 265→1575 on a 264→1576 card — between the
borders, exactly where antd's `.ant-card-head` border-bottom sat. Hard-coding 24
would have overhung both borders by 1px. `bai-card--compact` does the same for
`size="small"` (`--spacing-3` − 1 = 11px), and `max(0px, …)` keeps the re-added
inset non-negative there.

C's own fix (zeroing the block-axis container bleed on `BAITableAstryx`'s dim
layer) is orthogonal — it changes the table's margins, not the card's padding or
the tab strip — so the two changes compose without conflict.

---

## Defects found, NOT fixed here (out of scope)

1. **`SchedulerPage` nests a `<button>` inside Astryx `Tab`'s `<button>`.**
   React logs `validateDOMNesting` / "This will cause a hydration error" on
   every render of `/admin/scheduler`. The tab's `endContent` is a `Tooltip`
   whose trigger is a reset `<button>` (added so the hint is keyboard
   reachable), and `Tab` is itself a `<button>`. Pre-existing on `0a6899059`
   (present in the `before` capture). The fix is not obviously correct — a
   non-interactive trigger loses keyboard reachability, and moving the hint out
   of the tab changes the design — so it needs a call rather than a patch.

2. **`useBAIBreakpoint` does not appear to react to a viewport resize.**
   Resizing 1600→1100 mid-session left `FolderExplorerModalV2` on the `xl`
   branch (card tabs); a page BORN at 1100 correctly renders the `line` branch.
   Could be a headless-Chromium `matchMedia` artifact, but the
   `useSyncExternalStore` subscription in
   `packages/backend.ai-ui/src/theme-shim/breakpoints.ts` is worth a look.
   Not tab-specific.

3. **`/session` and `/admin/session`: the filter toolbar overlaps the table
   header row.** Present in the `before` capture too; layout rhythm, QA2-C.

---

## Verification

- `bash scripts/verify.sh` → `=== ALL PASS ===` (Relay, Lint, Format,
  TypeScript, Vite warmup, StyleX sentinel, Astryx theme build, Terminology).
- `react` vitest: 63 files / 1168 tests pass.
- `backend.ai-ui` vitest: 23 files / 459 tests pass (+1 skipped), including the
  new `BAITabList.test.tsx` (10) and 4 new `BAICard` tab-anatomy tests.
- `pnpm --filter backend.ai-ui build` rebuilt after every CSS change.
- Storybook: `BAITabList.stories.tsx` (CSF 3) — `Line`, `Card`, `SideBySide`,
  `WithTabBarExtraContent`, `Sizes`.
- Live: own vite on 5910 (`qa2a-dev.sh`), Playwright login, light + dark.
  Shots in `.scratch/astryx-migration/shots/qa2-a/`:
  `before-{light,dark}-*` (11 surfaces) vs `final-{light,dark}-*` (16),
  `after2-*-card` (card-cropped, both schemes),
  `final-folder-explorer-xl-card` / `final-folder-explorer-narrow-line` /
  `final-download-modal-line` for the two tab styles.
  Raw numbers: `before-measurements.json`, `final-measurements.json`,
  `after2-measurements.json`, `final-gap.json`.
