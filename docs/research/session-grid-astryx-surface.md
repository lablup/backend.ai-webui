# Research: Astryx surface for a dense unit-grid (session resource grid) visualization

- Wayfinder map: #8786 · Research ticket: #8788
- Date: 2026-08-14 · Astryx `@astryxdesign/core` 0.3.0, `@astryxdesign/lab` 0.3.0-canary.12db2a1
- Method: primary sources only — `astryx` CLI output (`build`, `search`, `component`,
  `docs`, `template`), package sources under `react/node_modules/@astryxdesign/*`,
  the repo's migration gate scripts, the bundled `dataviz` skill, and repo grep.

The target: hundreds of small colored squares, unit-quantized per session,
fill color = utilization (0→100%), cells grouped per session with a
per-session border color, rendered inside the session-list `BAICard`.

---

## Q1 — Astryx primitives: what exists for a dense unit grid

`astryx build "dense grid of small colored squares showing per-session resource
utilization"` recommends the `dashboard-portfolio` page template plus the Grid
block family; nothing waffle-shaped exists in core. The full 155-component list
(`astryx component --list`) contains **no dataviz/heatmap/swatch component in
`@astryxdesign/core`** — no Box, no cell, no swatch primitive. What does exist:

| Piece | Where | Relevance |
|---|---|---|
| `Grid` / `GridSpan` | `@astryxdesign/core/Grid` | **Layout-only** CSS grid. `columns={n \| {minWidth, max, repeat}}`, `gap/rowGap/columnGap` restricted to spacing steps `0…10` (token-backed). Good for arranging *session groups*, not for painting hundreds of value-colored cells (children still need a colored-square component that core does not have). |
| `useGridFocus` | `@astryxdesign/core/hooks` | WAI-ARIA 2D-grid keyboard navigation (arrows, Home/End, Ctrl+Home/End, PageUp/Down). The sanctioned a11y layer if cells are focusable/interactive. |
| `StatusDot` | `@astryxdesign/core/StatusDot` | Five **semantic variants only** (`success/warning/error/accent/neutral`) — cannot express a 5-step utilization ramp. Not a cell primitive. |
| `Chart` + `ChartHeatmapGL` | `@astryxdesign/lab` | The only heatmap-shaped component in the Astryx universe. `ChartHeatmapGLProps = { xKey, yKey, valueKey, colorRange: string[], domain?, cellGap? }` (`react/node_modules/@astryxdesign/lab/dist/Chart/ChartHeatmapGL.d.ts:1-9`). WebGL-rendered, axis-lattice (x/y keys) oriented. The `Chart` family also ships `ChartAxis`, `ChartTooltip`, `ChartLegend`, `ChartDotGL`, `ChartStreamGL`, etc. |
| `useTheme` | `@astryxdesign/core/theme` | Doc-described as "programmatic access to theme tokens for non-CSS consumers like **SVG, canvas, Vega, D3, maps, or chart libraries**". Returns `{ name, mode: 'light'\|'dark', token(name) => string, tokens }`, memoized, mode-resolved (`dist/theme/useTheme.d.ts`). |
| `useChartColors` / `getChartColors` | `@astryxdesign/lab` (Chart) | The theme-aware **chart color API** — see Q2. |

`astryx search "heatmap"` → 1 hit: the `table-page-heatmap-status` template
("Outage Heatmap Table"). `search "grid"` → layout Grid + gallery templates.
`search "chart"` → `useTheme`, the two sales-table templates, and
`table-page-heatmap-status`.

**Conclusion:** there is no ready-made unit-grid component. This is either
(a) `@astryxdesign/lab` `ChartHeatmapGL` territory, or (b) a custom SVG/DOM
composition where color comes from the chart-color API and layout from
Grid/xstyle — i.e. "xstyle-on-primitives plus JS-resolved dataviz tokens".
`@astryxdesign/lab` is **already a dependency of `react/`** and already used in
app code (Tour, Stepper, Drawer, Stat — e.g. `react/src/pages/ReservoirPage.tsx:26`),
so reaching for it introduces nothing new.

## Q2 — Sequential color ramp (utilization 0→100%) within the token system

### The token palette

Astryx ships a dedicated **data-visualization token set**, defined in
`react/node_modules/@astryxdesign/core/src/theme/domainTokens/dataTokens.ts`
(exported as `dataTokenDefaults`, merged into every defined theme by
`defineTheme` — `dist/theme/defineTheme.js:131`):

- **Categorical (10):** `--color-data-categorical-{blue,orange,purple,green,pink,cyan,red,teal,brown,indigo}` — fixed order.
- **Neutral:** `--color-data-neutral`.
- **Sequential ramps, 5 stops each (5 = darkest → 1 = lightest), 9 hues:**
  `--color-data-{blue,shamrock,orange,pink,purple,red,teal,yellow,gray}-{5..1}`.

All are `light-dark()` values; the chromatic ramps are currently mode-invariant
(same value both modes), only the gray ramp differs per mode — i.e. the theme
owns dark-mode correctness of the ramp, not the consumer.

### The sanctioned access path — JS, not `var()`

**Critical finding:** the `--color-data-*` custom properties are **not emitted
into any shipped CSS**. Grep counts of `color-data` are **0** in all four
declared-CSS sources the token gate checks (`@astryxdesign/core/dist/astryx.css`,
`core/src/reset.css`, `@astryxdesign/theme-neutral/dist/theme.css`,
`react/src/astryx-theme/built/backendai-default-built.css`) and in `lab.css`.
Consequences:

1. `var(--color-data-blue-3)` in CSS or StyleX would be **undefined at runtime**
   (silent failure) and is flagged by the P19 token gate (see Q3).
2. The typed StyleX maps (`@astryxdesign/core/theme/tokens.stylex`) export
   `colorVars`, `spacingVars`, `radiusVars`, … but **no data-token map** —
   the `.d.ts` header says domain tokens (syntax, dataviz) "live separately".
3. The **only sanctioned access** is JS resolution:
   `useTheme().token('--color-data-blue-3')` (core) or, purpose-built for charts,
   **`useChartColors()`** from `@astryxdesign/lab`:

```ts
const colors = useChartColors();       // theme- and mode-aware
colors.sequential.blue(5)              // 5 stops, darkest→lightest order
colors.categorical(8)                  // first 8 of the 10 fixed-order hues
colors.diverging.positiveNegative(5)
colors.semantic.positive               // --color-data-categorical-green
colors.structural.grid                 // --color-border (chart chrome)
colors.alpha(hex, 0.5)
```

(`react/node_modules/@astryxdesign/lab/dist/Chart/getChartColors.js` — ramps are
`resolve('--color-data-{hue}-{5..1}')`; `pickFromRamp` subsamples for n < 5;
`getChartColors(theme, mode)` is the non-React variant for WebGL/SSR/tests.)

### Continuous vs stepped, and the `dataviz` skill's formula

The bundled `dataviz` skill (a session skill; **not** installed under
`~/.claude/skills` — it lives in Claude Code's bundled skill set, with a
runnable validator `scripts/validate_palette.js`) prescribes for **magnitude**
(utilization is magnitude):

- **Sequential = one hue, light→dark, monotone lightness** — never a rainbow,
  never multiple hues, and dark mode is *selected* (own validated steps against
  the dark surface), not an automatic flip.
- The categorical six-checks validator does **not** apply to a sequential ramp
  (it "will FAIL by design"); the sequential check is lightness monotonicity
  (`--ordinal` mode: monotone L, adjacent ΔL ≥ 0.06, light-end ≥ 2:1 on surface).
- Contrast relief: marks under 3:1 obligate a second read channel (visible
  labels, tooltip + table/list view).
- No raw hex: every color must come from the system's documented ramp — which is
  exactly what `colors.sequential.<hue>(n)` returns.

**Reconciliation:** Astryx's 5-stop ramps *are* the design-system parameter the
skill plugs in. The sanctioned construction is a **stepped/quantized ramp**:
bin utilization into 5 buckets (e.g. 0–20 … 80–100%) and map bucket → stop from
`colors.sequential.blue(5)` (reversed to lightest→darkest for 0→100%). Free-form
interpolation between stops would leave the documented palette and is not
sanctioned for hand-drawn cells. (`ChartHeatmapGL` interpolates internally on
the GPU, but from the `colorRange` stops you hand it — feed it the token ramp,
not literals: the upstream template's
`colorRange={['#dcfce7','#fee2e2','#fca5a5','#ef4444','#991b1b']}` is raw hex
and also mixes hues; **do not copy it** — use
`colorRange={colors.sequential.red(5)}`-style input instead.)

For the idle/0% cell, use `colors.sequential.gray(5)`'s lightest stop or
`--color-data-neutral` / `--color-background-muted` rather than stretching the
value ramp to include "empty".

Because `useChartColors()` re-resolves from the active theme context, light and
dark stay correct automatically wherever the component re-renders under the
`Theme` provider; a one-time validation of the chosen ramp against both surfaces
with the skill's validator (`--mode light` / `--mode dark --surface <card bg>`)
is the remaining due diligence.

## Q3 — Group separation: per-session borders + gaps without raw hex/px

### What the token gate enforces

`scripts/migration-gates/astryx-token-gate.mjs` (359 lines, P19) cross-checks
**every static `var(--…)` usage** in `react/src` + `packages/backend.ai-ui/src`
(ts/tsx/js/css/scss/less/html, excluding `__generated__`/`__tests__`/`tests`)
against the union of custom properties **declared** in:

1. `@astryxdesign/core` (`dist/astryx.css` + `src/reset.css`),
2. `@astryxdesign/theme-neutral/dist/theme.css`,
3. the built brand theme `react/src/astryx-theme/built/*.css`,
4. **the scanned source itself** — CSS `--x: …` declarations and JS/TSX quoted
   object keys `'--x': …` / `setProperty('--x', …)` count as declared.

Dynamic constructions (`var(--token-${i})`) can't be verified and are reported
separately. An allowlist (`token-gate.allowlist.json`) exists only for
documented override-hook designs (currently just `--bai-form-item-*`).
Informational by default; `--strict` exits 1. So: an undeclared
`var(--color-data-*)` fails the gate, but a component that **bridges a
JS-resolved color into its own custom property** (e.g.
`style={{ '--session-grid-accent': colors.categorical(n)[i] }}` consumed by
`var(--session-grid-accent)` in the same source) is both gate-clean (rule 4)
and runtime-correct. In SVG, no bridge is even needed — pass the resolved color
straight to `fill`/`stroke` props.

### Border palette (categorical, auto-assigned)

Two token-system options:

- **Preferred — chart categorical API:** `useChartColors().categorical(n)` →
  the 10 fixed-order `--color-data-categorical-*` values. Matches the `dataviz`
  skill's rules: fixed order, never cycled, **color follows the entity** (key
  the assignment to a stable session id order, not to the current filter/rank);
  an 11th+ session folds into a neutral/"other" treatment rather than a
  generated hue.
- **Alternative — CSS-declared named-hue border tokens:** the theme *does*
  declare `--color-border-{blue,cyan,gray,green,orange,pink,purple,red,teal,yellow}`
  in `astryx.css` (light/dark aware, e.g. blue `#0064E0` → `#2694FE`). These are
  reachable in StyleX via the typed `colorVars` map
  (`import {colorVars} from '@astryxdesign/core/theme/tokens.stylex'`; live
  precedent: `react/src/components/MainLayout/WebUISider.tsx:33,51-52`) and pass
  the gate as plain CSS vars. 10 hues — usable if the grid is DOM/StyleX-drawn.

### Gaps and geometry

- DOM route: `Grid` `gap/rowGap/columnGap` steps (each step maps to a
  `--spacing-*` token: `0.5`=2px, `1`=4px, …) or `spacingVars` in `xstyle`
  (precedent: `react/src/components/SessionFormItems/ResourceAllocationFormItems.tsx:43`).
- SVG route: compute cell size/gap in JS from `useTheme().token('--spacing-1')`
  etc., so no literal px enters the source; corner rounding from
  `--radius-*` tokens. The `dataviz` skill's mark spec (2px surface gap between
  adjacent fills; group separation by whitespace first, border second) maps to
  `--spacing-0-5` gaps between cells and `--spacing-1`+ between session groups.
- `ChartHeatmapGL` route: it exposes `cellGap` directly.

## Q4 — Precedents in the repo and in Astryx templates

Repo (all paths from repo root):

- **`react/src/hooks/useSessionNodeLiveStat.tsx`** — the data source. Parses a
  session's `live_stat`, yields per-resource-slot `{ current, capacity, pct }`
  (`pct` = current/capacity×100, Big.js, line ~117). The grid's utilization
  number already exists here; reuse, don't re-derive.
- **`react/src/components/SessionUsageMonitor.tsx`** — per-session utilization
  UI on Astryx `Grid`/`GridSpan` + the hook above; Relay fragment pattern to
  copy (`SessionUsageMonitorFragment` on `ComputeSessionNode`).
- **`packages/backend.ai-ui/src/components/BAISessionNodesV2.tsx`** — the
  session-list table fragment component (`live_stat` consumer) the grid view
  would sit beside.
- **`react/src/pages/ComputeSessionListPage.tsx:377`** — the `BAICard`
  (+ `BAITabs`) that hosts the session list; the resource-grid view lands here
  as a content-scoped view mode (Q5). Sibling pages:
  `AdminComputeSessionListPage.tsx`, `ProjectAdminSessionPage.tsx`.
- **`react/src/components/SessionMetricGraph.tsx` + `.css`** and
  **`react/src/components/FairShareItems/UsageBucketChartContent.tsx` + `.css`** —
  the two canonical "chart colored by tokens" precedents: recharts SVG, colors
  via co-located P17 CSS files whose every value is a declared `var(--…)` token
  (each file header documents the P19 check). Proof that SVG-with-JS/CSS-token
  colors is an accepted pattern in this repo. Also
  `react/src/components/AllocationHistoryStatistics.tsx` (recharts).
- **`react/src/components/AgentNodeItems/AgentResources.tsx`**,
  **`react/src/components/UsageProgress.tsx`** — other utilization renderers
  (progress-style, not unit grids).
- No existing waffle/unit-cell renderer exists in the repo — this will be the first.

Astryx templates (`astryx template --list`): the one true dataviz precedent is
**`table-page-heatmap-status`** ("Outage Heatmap Table") — `Chart` +
`ChartAxis` + `ChartHeatmapGL` from `@astryxdesign/lab` (usage shape at its
lines 403–416: `data`, `xKey`/`yKey`/`valueKey`, `colorRange`, inside a
`height`-bounded `Chart`). Caveats: it is reference code with **raw-hex
`colorRange` and hand-rolled avatar hexes that violate this repo's rules** —
copy the structure, not the colors. Also relevant: `dashboard-portfolio`
(the `astryx build` recommended start), the `Grid*` block templates for group
layout, and lab's `Stat`/`CircularProgress`/`Radial` for adjacent KPI needs.

## Q5 — Constraints summary

- **`use-bai-card.md`:** the grid lives *inside* the existing session-list
  `BAICard` (`ComputeSessionListPage.tsx:377`) — never a new Astryx `Card`.
  A table/grid **view-mode toggle is content-scoped** → it belongs in the card
  body (e.g. `SegmentedControl`/`ToggleButtonGroup` next to the existing
  filters), not in `extra`. Suspense boundary goes inside the card (header
  stays visible, `BAISkeleton` body). No `styles={{ body: { paddingTop: 0 } }}`
  on new call sites.
- **Tokens-only:** no raw hex, no raw px. Colors via `useChartColors()` /
  `useTheme().token()` (JS) or `colorVars`/`spacingVars` (StyleX); geometry via
  spacing/radius tokens. `var(--color-data-*)` in CSS is a P19 violation *and*
  broken at runtime (Q2). The token gate plus the astryx SELF-CHECK are the
  enforcement.
- **New file ⇒ no migration relaxation:** the `className=`/`style={{…}}`
  allowance is only for antd-era carryover files. A new component gets the full
  SELF-CHECK: no raw `<div>` layout, props-first, then `xstyle` +
  `stylex.create()` tokens. (SVG child elements inside an owned chart surface
  are the established exception in spirit — see the recharts precedents — and
  colors there are JS-resolved tokens.) If a needed style is genuinely
  inexpressible via props/xstyle, a co-located `.css` with declared `var(--…)`
  tokens (P17) is the documented escape, as in `SessionMetricGraph.css`.
- **React conventions:** `'use memo'` directive at the top of the component
  body; Relay fragment component (`useFragment`, prop named `{typeName}Frgmt`,
  e.g. `sessionFrgmt`) under the page's query orchestrator; `useBAILogger`;
  if shipped as a `BAI*` wrapper, follow `component-props-extension.md` (extend
  the wrapped component's/DOM props type).
- **Dataviz-skill obligations:** legend for the utilization ramp bins; tooltip
  per cell (hit target ≥ mark); identity never by color alone → session name
  labels on groups; a table view already exists (the current session table)
  which satisfies the "values readable another way" relief; run
  `validate_palette.js` (`--ordinal` for the ramp) once per mode before shipping.

---

## Recommended construction approach

### Approach A (recommended): custom SVG unit grid, colors from `useChartColors()`

A new fragment component (working name `SessionResourceUnitGrid`) that renders
one SVG per session group (or one SVG overall) of `<rect>` cells:

- **Data:** Relay fragment on `ComputeSessionNode` + `useSessionLiveStat` for
  `pct`; units quantized per session from `occupied_slots`.
- **Fill:** 5-bin stepped ramp `useChartColors().sequential.blue(5)` (reversed:
  lightest = low utilization), idle cells on the gray ramp/neutral. Stepped, not
  interpolated — matches both the token system and the dataviz sequential rule.
- **Group border:** per-session `stroke` from `colors.categorical(n)` keyed to a
  stable session-id order (color follows entity, never rank; >10 sessions fold
  to neutral).
- **Geometry:** cell size/gaps computed from `useTheme().token('--spacing-*')`,
  radius from `--radius-*`; group layout via Astryx `Grid`
  (`columns={{minWidth}}`, token `gap`), one SVG per group cell.
- **Interaction/a11y:** Astryx `Tooltip`/`HoverCard` per group + per-cell SVG
  `<title>` or a shared hover tooltip; `useGridFocus` if cells become focusable;
  visible session labels via `Text` (text tokens, never series color).
- **Why sanctioned:** `useTheme` is *documented* for exactly this ("SVG, canvas,
  D3…"); the repo's recharts components are prior art for token-colored SVG;
  zero `var()` usage in CSS keeps the P19 gate clean by construction; every
  color/length is a resolved token. Scales fine — hundreds of `<rect>`s is
  trivial SVG; `'use memo'` + memoized cell model handles re-render cost.

### Approach B (fallback): `@astryxdesign/lab` `ChartHeatmapGL`

Use the lab Chart stack as in the `table-page-heatmap-status` template, feeding
`colorRange={useChartColors().sequential.blue(5)}` and `cellGap`.

- **Pros:** exists today, dependency already in `react/`, WebGL scales to tens
  of thousands of cells, template precedent, `cellGap`/`domain` built in.
- **Cons:** it is an **x/y-lattice heatmap**, not a per-group waffle — no
  concept of session groups or per-group border colors (would need overlay
  hacks); per-cell tooltips/labels are the Chart family's, not per-entity;
  `@astryxdesign/lab` is canary-pinned. Choose it only if the design pivots to
  a pure lattice (e.g. sessions × time) or cell counts reach the tens of
  thousands.

Not recommended: a DOM-per-cell composition (no cell primitive exists in core —
StatusDot is semantic-variant-only; hundreds of DOM nodes with per-node style
bridging is the worst of both worlds).

**Next step (#8789):** prototype Approach A inside the session-list card behind
the existing tab/filter surface, validate the chosen ramp with the dataviz
validator in both modes, and run `bash scripts/verify.sh` +
`node scripts/migration-gates/astryx-token-gate.mjs --strict`.
