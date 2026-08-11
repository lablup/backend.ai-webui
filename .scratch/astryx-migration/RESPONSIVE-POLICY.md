# Responsive Policy + Conversion Recipes (ticket 14)

**Status: PROVISIONAL — pending user ratification.** Open decision #5
(MIGRATION-SPEC §7) was to be settled with the user; the user was unavailable,
so this session evaluated both models against measured evidence and recorded
the choice here. Everything below is reversible — see "Flip cost" at the end.

This is the document page tickets **15–24** consult when they hit a
breakpoint-dependent site. Pilot conversions: `LightDarkColorPicker.tsx`,
`BAIContentWithDrawerArea.tsx`, `KeypairResourcePolicyInfoModal.tsx`
(shots: `.scratch/astryx-migration/shots/14/{before,after}-*.png`, harness:
`react/theme-probe/responsive.html`).

---

## 1. Census (measured on `to-astryx`, 2026-08-07)

| Category | Files | Sites | Notes |
|---|---|---|---|
| `Col` breakpoint props (`xs…xxxl`) | 13 | **89 props** on ~52 `<Col>` elements | xs×36 sm×22 lg×9 md×8 xl×8 xxl×4 xxxl×2 |
| `<Col>` / `<Row>` total | 21 | 72 Col / 32 Row | `gutter` ×25; **zero** `offset`/`push`/`pull` |
| `Grid.useBreakpoint()` | 18 | 18 calls | all branch JS behaviour (render tree, style mode, string format) |
| `token.screenXS/SM` as px constant | 3 | 3 | `ImageList`, `CustomizedImageList` (col width 480), `KeypairResourcePolicyInfoModal` (modal width 576) |

Two sites use antd v6's `xxxl` (2000px): `AIAgentPage`, `ModelStoreListPageV2`
— both are uniform card grids (absorbed by the minWidth model; the JS hook
deliberately does not carry `xxxl`).

Dominant pattern by far: **uniform N-up grids** (`xs={24} sm={12}`,
`xs={12} md={8}`, `xs={12} sm={8} lg={6} xl={4}` …) inside modals, cards, and
pages — "stack when narrow, N per row when wide". Truly asymmetric responsive
splits are rare (`SessionLauncherPage` form/side-panel, `Information.tsx`
xs={24} xxl={12}).

## 2. Decision (PROVISIONAL)

**Hybrid, CSS-first:**

1. **Track layout responsiveness** (all `Row`/`Col` breakpoint-prop sites) →
   **Astryx `Grid columns={{minWidth, max?}}`** — container-driven CSS.
2. **JS behaviour branches** (the 18 `Grid.useBreakpoint()` sites — render
   tree, layout *mode*, formatting) → **`useBAIBreakpoint()`** (theme-shim,
   ticket 08), a pure import swap.
3. **`token.screen*` px constants** → **`BAI_BREAKPOINTS.<step>`** where the
   value matches a step; they are constants, not responsiveness.

### Why (evidence, not preference)

- **Container-driven beats viewport-driven for the measured population.** 9 of
  the 13 files with responsive `Col` props render inside **modals or cards**,
  where antd's viewport-keyed spans are simply the wrong reference frame (a
  modal is 520–1000px wide regardless of a 2560px screen). `Grid minWidth`
  reflows on actual available width. The pilot showed this concretely: antd's
  `Col xl={6} lg={24}` stacked the two pickers *only* in the 992–1199px
  viewport band and crammed them side-by-side below 992; the Grid version
  stacks exactly when the container is too narrow (<600px) and is otherwise
  side-by-side — strictly more coherent.
- **Astryx has no breakpoint system at all** (MAPPING.md §3.9: verdict NONE
  for every breakpoint prop, no `screen*` tokens). A JS-side emulation of
  antd's 24-col × 7-breakpoint matrix would be a permanent antd-parity shim —
  exactly what MIGRATION-SPEC §0's simplicity policy forbids chasing.
- **CSS-side costs zero JS**: no re-render on resize, no first-paint flash, no
  resize listeners per component.
- **But CSS cannot branch a render tree.** The 18 hook sites mount/unmount
  components, switch drawer mode (`BAIContentWithDrawerArea`), collapse the
  sider, or change text format (`LoginSessionExtendButton`). Rendering both
  branches and hiding one via CSS breaks e2e selectors and a11y. Astryx's own
  `useMediaQuery` returns `false` on first render (flash on every one of
  these); `useBAIBreakpoint` (useSyncExternalStore, antd-identical values,
  correct first paint) is already built and live-verified in ticket 08.

### Rejected alternatives

- **Pure JS-side** (keep antd's model via a `BAIRow`/`BAICol` emulation):
  permanent parity shim (~200+ LOC), viewport-keyed layouts stay wrong inside
  modals, every relayout costs a React render. Rejected on simplicity policy.
- **Pure CSS-side** (media queries for everything): cannot express the 18
  behaviour branches without DOM duplication; Astryx exposes no named steps to
  reference from CSS anyway.

## 3. Recipes

### R1 — Uniform responsive grid (the ~80% case)

`<Row gutter={[x,y]}><Col xs={a} sm={b} …>` where all Cols carry the same
spans → `Grid columns={{minWidth, max?}}`:

```tsx
// before
<Row gutter={[16, 16]}>
  <Col xs={24} sm={12}>…</Col>  // ×N
</Row>
// after
import { Grid } from '@astryxdesign/core/Grid';
<Grid columns={{ minWidth: 280, max: 2 }} gap={4}>
  …  {/* the Col wrapper usually disappears entirely */}
</Grid>
```

**Choosing `minWidth`:** take the antd breakpoint where the layout first goes
multi-column and divide by the column count — `sm={12}` (2-up from 576px) →
576/2 ≈ **280**; `md={8}` (3-up from 768) → 768/3 ≈ **250**;
`lg={6}` (4-up from 992) → **240**; `xl={4}` (6-up) → **200**. Then sanity-check
against the *real content* (a stat card usually wants 240–300). **`max`** =
the column count at the widest antd step (e.g. `xxl={8}` → max 3;
`xxxl={6}` → max 4). `repeat` default `'fill'` keeps track widths consistent
(this is what reproduced the antd `xl={6}` quarter-width look in the pilot);
use `'fit'` only when items should stretch into leftover space.

**Gutter → gap** (Astryx gap unit = 4px): 8→`2`, 12→`3`, 16→`4`, 24→`6`;
asymmetric `[16,4]` → `columnGap={4} rowGap={1}`. Odd antd values snap to the
nearest step — a deliberate design-normalization, not a bug (simplicity
policy).

**Every site is still a layout decision** (MAPPING §3.9): the converted
behaviour differs *by design* in bands where antd's viewport keying was
incoherent (see pilot A). Compare before/after at the site's real container
widths, not just viewport steps.

### R2 — `Col span={n}` without breakpoint props (7 sites)

Not responsive. `<Col span={8}>`×3 → `Grid columns={3}` (divide 24 by the
common span). Mixed spans → `Grid columns={24}` + `GridSpan columns={n}` per
item. One-row toolbars (`Row gutter` only) → `HStack gap` / existing `BAIFlex`.

### R3 — `Grid.useBreakpoint()` JS branch (18 files)

Pure import swap — the return shape is antd's `{xs…xxl}` booleans (always
present, never `undefined`):

```tsx
// react/src/**
-import { Grid } from 'antd';
+import { useBAIBreakpoint } from '../theme-shim';
-const { lg } = Grid.useBreakpoint();
+const { lg } = useBAIBreakpoint();
// packages/backend.ai-ui/src/** → import { useBAIBreakpoint } from '../theme-shim' (BUI-internal) or 'backend.ai-ui'
```

Drop `?? true`/`?? false` fallbacks if present (keys are now total). If a
"branch" merely picks track counts (e.g. `screens.md ? 3 : 1` fed into a grid
`columns`), it is really R1 — convert to `Grid minWidth` and delete the hook
call. `xxxl` is intentionally absent from the hook; no JS site uses it.

### R4 — `token.screen*` as px constant (3 sites)

These never were responsive behaviour — they borrow a breakpoint number as a
width. Convert `width={token.screenSM}` → `width={BAI_BREAKPOINTS.sm}` (576 —
pilot C). **Caveat:** `token.screenXS` is **480**, but `BAI_BREAKPOINTS.xs` is
**0** (it's the floor of the boolean map, matching antd's responsiveObserver).
For the two `width: token.screenXS` table columns, keep the shim token (the
theme shim's selfTokens carries `screenXS: 480`) or inline `480` with a
comment — do NOT write `BAI_BREAKPOINTS.xs`.

### R5 — `Descriptions column={{xs:1, md:2 …}}` and other antd responsive-prop objects

antd components that accept responsive maps keep working while they remain
antd (translation frontier). When the component itself is migrated in its page
ticket, the map collapses into that component's replacement layout (usually
R1). Do not pre-convert these.

## 4. Shared infrastructure (landed in this ticket)

- `useBAIBreakpoint`, `useBAIActiveBreakpoint`, `BAI_BREAKPOINTS`,
  `BAI_BREAKPOINT_KEYS`, `BAI_BREAKPOINT_QUERIES`, types `BAIBreakpointKey` /
  `BAIScreenMap` are now exported from the theme shim:
  `react/src/theme-shim` (react app) and `backend.ai-ui` (everywhere).
- Probe harness: `react/theme-probe/responsive.html` (+ vite config now runs
  babel-plugin-relay for react/src and defines `global`, so probe pages can
  mount real Relay-fragment components with `relay-test-utils`).
- Capture: `pnpm exec node .scratch/astryx-migration/shots/14/capture.mjs <tag>`.

## 5. Flip cost (if the user overrules)

- **To JS-side everywhere:** build a `BAIResponsiveGrid` emulation over
  `useBAIActiveBreakpoint` (~1 session), then mechanically reverse R1
  conversions from git history (each conversion diff preserves the original
  spans). ~0.5 session per completed page ticket at flip time. R3/R4 sites are
  unaffected (they already use the hook/constants).
- **To CSS-only:** would additionally require dual-render-and-hide for the 18
  branch sites — not recommended; cost ~2 sessions plus e2e churn.
- The decision is **per-recipe, not per-file**: flipping changes only which
  recipe future tickets apply plus the (few) already-converted R1 sites.
