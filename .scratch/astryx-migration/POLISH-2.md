# to-astryx — polish pass 2

Five user-reported defects plus one theme decision, on top of `89be09c19`.
Every value below is **measured** in the running dev build (Playwright +
`getComputedStyle`), not inferred; legacy targets come from
`theme.getDesignToken()` run over the shipped `resources/theme.json` seeds.

Evidence: `.scratch/astryx-migration/shots/polish-2/`
(`before-*` / `after-*`, plus the raw measurement dumps `diag2.json` /
`after.json`). Probes: `polish2-diag.mjs`, `polish2-diag2.mjs`,
`polish2-toggle.mjs`, `polish2-verify.mjs`, `polish2-buttongroup.mjs`.

---

## A. Collapsed sider — the top rows sat 13px to the left

**Symptom (user).** In the collapsed rail the first few menu items look tilted
/ skewed to the left compared with the rest.

**Measured before** (74px rail, 8px scroll-column padding → 58px content box;
every collapsed row is a 32px box). `offCenter` = icon centre minus rail centre:

| row | item `x` | offCenter |
|---|---|---|
| Admin Settings | 8 | **−13** |
| Start | 8 | **−13** |
| Dashboard | 8 | **−13** |
| Data, Sessions, My Environments, Chat, Deployments, Model Store, Statistics | 21 | 0 |

**Root cause.** `SideNav`'s scroll column is `align-items: center`. Rows that
live inside a `SideNavSection` are direct flex items of it: the section box
shrinks to its 32px content and is centred, carrying its rows along. Rows
rendered **without** a section sit in an intermediate full-width wrapper
(`align-items: normal`, measured 58px wide), so their children start at the
flex-start edge. Two different container contracts inside one rail.

Note this is *not* the earlier collapsed-rail icon asymmetry: `BAI*Icon`
`<span class="anticon">` hosts and bare lucide `<svg>` hosts appear on **both**
sides of the split, so the icon host is not the discriminator.

**Fix — level: app CSS, `.bai-sider--collapsed` (existing sanctioned scope).**
`react/src/components/BAISider.css` — one line added to the rule that already
stands the collapsed rail's density down:

```css
.bai-sider--collapsed .astryx-side-nav-item {
  padding-inline: 0;
  margin-inline: auto;   /* ← added */
}
```

Applied to the ITEM, not the container, so it holds at any nesting depth
`SideNav` chooses: both wrappers are `flex-direction: column`, so
`margin-inline: auto` centres the item on the cross axis wherever it lands.
Rows that were already correct have a parent exactly as wide as themselves, so
the auto margins resolve to 0 — no change to them.

Not a theme default: `components['side-nav-item']` emits a bare
`.astryx-side-nav-item` rule that applies to the EXPANDED rail too, and the
collapsed state is not reflected onto the DOM by Astryx (the reason
`.bai-sider--collapsed` exists at all — see the file header).

**Measured after.** All 10 rows: `x = 21`, `offCenter = 0`.
`before-rail-collapsed-light.png` → `after-rail-collapsed-light.png` /
`after-rail-collapsed-dark.png`.

---

## B. Collapsed sider toggle — pinned to a perfect circle

**Symptom (user).** The toggle reads as a tall oval; it must be a true circle.
(Legacy's elongated shape was itself a bug — parity is explicitly not wanted.)

**Measured before.** The geometry was already square in the current dev build:
`24.00 × 24.00`, `border-radius: 9999px`, in light **and** dark, collapsed
**and** expanded (`zoom-toggle-collapsed-ctx.png` at `deviceScaleFactor: 6`
shows a circle). No pseudo-element, transform, scale, outline or box-shadow
distorts it. So the shape is not currently wrong — but it was not *pinned*
either, and that is what allows it to drift back:

- `min-height: auto` (measured) with default `flex-shrink: 1`, while the button
  is a flex item of `SiderToggleButton`'s `BAIFlex direction="column"` — i.e.
  its **main axis there is vertical**. Height was negotiable against content
  (16px chevron in a measured `line-height: 20px` line box); width was not.
- Any later change to the wrapper's height, the icon size, or Astryx
  `IconButton`'s line-height therefore moves one axis alone → oval.

**Fix — level: app CSS, `.bai-sider-toggle` (existing sanctioned scope).**
Close the box on both axes and tie them together:

```css
flex: none;
aspect-ratio: 1;
width/min-width/max-width: 24px;
height/min-height/max-height: 24px;
```

**Measured after.** `24.00 × 24.00`, `aspect-ratio: 1 / 1`,
`border-radius: 9999px` — light and dark, expanded and collapsed. `w == h`.

---

## C. admin/users — "Create User" + "More" are now one attached control

**Symptom (user).** The primary button and the overflow menu render as two
separate pills; legacy was one attached control.

**Root cause.** `ButtonGroup` was already in place — the join is not the
problem. Astryx joins children through **context**, not wrappers
(`ButtonGroup.js`: "Children (Button, IconButton) consume the ButtonGroup
context to apply position-aware styles in pure CSS — no cloneElement or wrapper
divs needed"; the trailing-edge case is `IS_LAST_ITEM` in `Button.js`, which is
why a `[popover]` sibling does not break last-child detection). Only Astryx
`Button` / `IconButton` / `ToggleButton` read that context.

The primary child was `BAIButton`, i.e. an **antd** `Button`
(`packages/backend.ai-ui/src/components/BAIButton.tsx` wraps antd's), which is
invisible to the context. Measured before:

| child | element | border-radius |
|---|---|---|
| Create User | `button.ant-btn` | `6px` (all four corners) |
| More | `button.astryx-button` | `0px 8px 8px 0px` (correctly suppressed) |

So the Astryx half knew it was last; the antd half kept its full pill, leaving
a visible notch — and mismatched radii (6px vs 8px). `DropdownMenu` was already
fine: it renders an Astryx `Button` as its trigger, as a direct child.

**Fix — level: component composition (Astryx-canonical), one call site.**
`react/src/components/AdminUserManagement.tsx` — the primary child becomes an
Astryx `Button variant="primary"` with `label` (Astryx's spelling of antd
`type="primary"` + children).

**Measured after.**

| child | element | border-radius |
|---|---|---|
| Create User | `button.astryx-button` | `8px 0px 0px 8px` |
| More | `button.astryx-button` | `0px 8px 8px 0px` |

Inter-button gap `0`, group `157 × 32`. Menu opens correctly ("Bulk Create
Users" / "Bulk Create Users from CSV" both render and are clickable).
`before-users-buttongroup-light.png` → `after-users-buttongroup-light.png`,
`after-users-buttongroup-dark.png`, `after-users-menu-open-light.png`.

### Same pattern elsewhere — NOT fixed (follow-up sweep)

Surveyed all 12 `ButtonGroup` call sites. Two carry the identical antd-child
defect:

| file | line | children |
|---|---|---|
| `react/src/components/DeploymentBasicInfoCard.tsx` | 301 | antd `BAIButton` (Edit) + `DropdownMenu` (More) |
| `react/src/components/DeploymentRevisionHistoryTab.tsx` | 634 | `BAIPopconfirmAstryx` → antd `BAIButton` (Apply) + `DropdownMenu`; also has an intervening wrapper between the group and the button |

Clean (Astryx `Button`/`IconButton` throughout): `ShellScriptEditModal`,
`DeploymentAddRevisionModal`, `AgentActionButtons`, `SessionActionButtons`,
`SessionLauncherPage`. The remaining files only mention `ButtonGroup` in
comments explaining why it was *not* used.

---

## D. Breadcrumb bottom border — back to the legacy neutral

**Symptom (user).** The breadcrumb bar's bottom rule is a different colour from
legacy.

**Measured before / target / after** (`[data-testid="webui-breadcrumb"]`):

| | light | dark |
|---|---|---|
| before | `rgb(157,142,133)` = `#9D8E85` | `#74655D` |
| legacy antd `colorBorder` | `#d9d9d9` | `#424242` |
| **after** | **`rgb(217,217,217)` = `#D9D9D9`** | **`rgb(66,66,66)` = `#424242`** |

**Root cause.** `WebUIBreadcrumb` asks for `token.colorBorder`, and the shim
maps `colorBorder → --color-border-emphasized`. That mapping is *correct* —
antd's two-step ramp (`colorBorder` over `colorBorderSecondary`) is exactly
Astryx's `--color-border-emphasized` over `--color-border`. The VALUE was
wrong: like the background family fixed in `89be09c19`, both border tokens are
derived by Astryx's HCT generator from the brand accent, so an orange seed
yields warm greys. `ANTD_NEUTRAL_SURFACES` had deliberately skipped the border
tokens as "too low-alpha for the hue to show" — true for `--color-border` (10%
alpha), false for `--color-border-emphasized`, an opaque mid-grey.

**Fix — level: THEME DEFAULT.** New `ANTD_NEUTRAL_BORDERS` block in
`react/src/astryx-theme/backendAiTheme.ts`, same mechanism and justification as
`ANTD_NEUTRAL_SURFACES`. Both steps pinned so the ramp stays internally
consistent (hairline lighter than rule) rather than mixing one generated and
one legacy value:

```
--color-border            ['#F0F0F0', '#303030']   antd colorBorderSecondary / colorSplit
--color-border-emphasized ['#D9D9D9', '#424242']   antd colorBorder
```

No local hex anywhere; `WebUIBreadcrumb` is untouched.

---

## E. Header text/icons — white again, in both modes

**Symptom (user).** Header text was white in legacy, renders greyish now.
**Design decision (user):** the header BACKGROUND stays exactly as-is in both
modes; only the text/icon colour returns to legacy white.

**Measured before** (light mode, on the `#FF9729` band):

| element | colour | why |
|---|---|---|
| `Text` "Project", user name, menu icons | `rgb(235,224,218)` = `#EBE0DA` | inside `AstryxReverseTheme` → dark-mode `--color-text-primary` |
| `ant-select-content` (ProjectSelect value) | `rgb(247,247,246)` = `#F7F7F6` | `.bai-select-ghost` CSS uses `var(--color-background-body)` |
| header root inherited `color` | `#F7F7F6` | `color: token.colorBgBase` → `--color-background-body` |
| bell icon | `#FFFFFF` (light) / `rgb(20,20,20)` (dark) | antd `ReverseThemeProvider` ×3 |

**Root cause — one idea, three places.** Legacy spelled "white" as
`token.colorBgBase`, which antd resolves to `#fff` in light mode. The shim maps
`colorBgBase → --color-background-body` (the correct role mapping), and this
theme pins that token to the legacy PAGE backdrop `#F7F7F6` / `#191919`. The
same expression therefore stopped meaning white. Separately, a full theme flip
(`AstryxReverseTheme` / antd `ReverseThemeProvider`) reproduces legacy's
*mechanism* but not its *result*: it resolves `--color-text-primary` to the
other mode's ordinary body text (Astryx dark grey `#EBE0DA`), whereas antd's
flipped algorithm gave `rgba(255,255,255,0.85)` ≈ `rgb(255,239,223)` over the
orange. And "opposite of the page" only coincides with white in light mode —
in dark mode the flip resolved to the LIGHT palette and painted glyphs
near-black on a still-orange band.

**Fix — level: token context (Astryx-canonical) + token correction.**

1. `WebUIHeader.tsx`: `AstryxReverseTheme` → **`MediaTheme mode="dark"`** (both
   groups). `MediaTheme` is Astryx's primitive for "content on a surface of a
   different luminance"; its `defaultOnDarkTokens`
   (`@astryxdesign/core/theme/onMediaTokens`) map `--color-text-primary` and
   `--color-icon-primary` to `var(--color-on-dark)` — pure white — on top of the
   `color-scheme: dark` flip. It renders `display: contents`, so no layout cost.
   `mode` is **constant**: the orange band is a dark surface in both app modes,
   so its content is "on dark" in both. Same primitive the sider tooltip took in
   `c97189e60`.
   The `UserDropdownMenu` panel is a DOM descendant (Astryx renders its popover
   as an inline `[popover]` sibling, not a portal — measured), so it inherits
   the context; `color-scheme: dark` keeps `--color-background-popover` on its
   dark value, so it stays a dark panel with legible white text — which is also
   what legacy did (it wrapped the whole dropdown in `ReverseThemeProvider`).
2. `WebUIHeader.tsx` root: `color: token.colorBgBase` → `var(--color-on-dark)`.
3. `packages/backend.ai-ui/src/components/BAISelect.css`: the `ghost` variant's
   text/border/suffix `var(--color-background-body)` → `var(--color-on-dark)`.
   `ghost` exists solely for the header `ProjectSelect`.
4. `react/src/components/BAINotificationButton.tsx`: dropped two of the three
   nested `ReverseThemeProvider`s and the `Typography.Text` whose only job was
   to supply a colour; the `Bell` now carries
   `style={{ color: 'var(--color-on-dark)' }}` (on the glyph, not just the
   button — antd's `.ant-badge` declares its own `color` and intercepts
   inheritance). The remaining provider still carries the antd `Tooltip`.

`--color-on-dark` is `#ffffff` in both modes and is the Astryx token that
actually means "content on a dark/inverted surface"; `--color-on-accent` was
already pinned white for the same reason.

**Measured after — every header element, both modes: `rgb(255,255,255)`.**

| element | light | dark |
|---|---|---|
| header root `color` | `rgb(255,255,255)` | `rgb(255,255,255)` |
| header root `background` | `rgb(255,151,41)` *(unchanged)* | `rgb(232,138,40)` *(unchanged)* |
| `Text` "Project" | `rgb(255,255,255)` | `rgb(255,255,255)` |
| ProjectSelect value | `rgb(255,255,255)` | `rgb(255,255,255)` |
| bell / theme / help / user icons | `rgb(255,255,255)` | `rgb(255,255,255)` |
| user name | `rgb(255,255,255)` | `rgb(255,255,255)` |

`after-header-light.png`, `after-header-dark.png`.

---

## F. Semantic colours — pinned to the legacy applied values

**User design decision.** Info / Success / Error (+Warning) semantic colours
must equal the LEGACY applied colours, set via theme.

**What the theme actually emits.** Enumerated from the built artifact
(`built/backendai-default-built.css`), the semantic surface is exactly:
`--color-error` / `-muted` / `--color-on-error`, `--color-success` / `-muted` /
`--color-on-success`, `--color-warning` / `-muted` / `--color-on-warning`.
There is **no `--color-info*` family**: Astryx's `CoreTokenName`
(`theme/defineTheme.d.ts` + `tokens.stylex.js`) enumerates error / success /
warning and nothing else, and the `--color-info-*` variables visible in the
page are StyleX-hashed component-private vars, not theme surface. (The
`--color-*-blue` hue chips are *not* the info family — legacy antd's `blue`
presets come from its static palette, not from `colorInfo`, so repointing them
would be wrong.)

**Legacy targets** (`theme.getDesignToken()` over `resources/theme.json`,
light + `darkAlgorithm`):

| | light | dark |
|---|---|---|
| `colorError` | `#ff4d4f` | `#be3d3f` |
| `colorSuccess` | `#00bd9b` | `#068e76` |
| `colorWarning` | `#faad14` | `#d89614` |
| `colorInfo` | `#028df2` | `#0387bf` |
| `colorTextLightSolid` | `#fff` | `#fff` |

**Status hues — already correct, verified.** `--color-error` /
`--color-success` / `--color-warning` are built from `BAI_DEFAULT_SEEDS`, i.e.
straight from `resources/theme.json`, so they equal the legacy values by
construction. Measured live: `light-dark(#FF4D4F, #be3d3f)`,
`light-dark(#00BD9B, #068e76)`, `light-dark(#FAAD14, #d89614)`. Their `-muted`
steps follow Astryx's own 20%/25% alpha formula.

**Changed — the ON-colours.** `neutralTheme` derives these for contrast, so
they FLIPPED with the mode (measured: `--color-on-error` and
`--color-on-success` = `light-dark(#ffffff, #171717)`), while antd had one
token for the whole job — `colorTextLightSolid` — that is `#fff` under BOTH
algorithms. New `ANTD_STATUS_ON_COLORS` block pins:

```
--color-on-error   ['#ffffff', '#ffffff']
--color-on-success ['#ffffff', '#ffffff']
```

`--color-on-warning` is deliberately **left at the Astryx default** (`#171717`):
antd never painted text on a solid warning fill (its warning surfaces are
`colorWarningBg` + `colorText`, or `colorWarningBg` + `colorWarning`), so there
is no legacy value to match, and white on `#FAAD14` is ~1.9:1. Recorded rather
than silently skipped.

**Info — declared, not pinnable.** `info` is now a first-class brand seed:
added to `BAI_DEFAULT_SEEDS` (`#028DF2` / `#009BDD`→`#0387bf`),
`BuildBackendAiThemeOptions`, `resolveSeeds`, the theme-name **hash**, and
`themeOptionsFromConfig` (reads theme.json `colorInfo`). It is kept separate
from the `admin` accent even though they share a value today, so a deployment
can move one without dragging the other. Since Astryx has no `--color-info`
token to override, the informational blue continues to be rendered by the
antd-engine surfaces (`Alert type="info"`, `message.info`), which read
`colorInfo` from the shim's brand seeds — the same seed declared here. That
makes the blue theme-declared and rebrand-following rather than an accident of
the shim's fallback table.

→ **SWEEP-1 row 5 is resolved as SANCTIONED**, not outstanding: the cool blue
IS the legacy `colorInfo` (`#028DF2`, whose antd ramp gives
`colorInfoBg #e6f9ff` / `#111f27`).

**Theme identity.** `THEME_NAME_REV` **4 → 5**; the seed hash also moved
because `info`, `ANTD_NEUTRAL_BORDERS` and `ANTD_STATUS_ON_COLORS` all feed it.
Built artifacts regenerated (`bai-r4-default-brand-h8ey8er.*` deleted,
`bai-r5-default-brand-h1gij33a.*` generated, `built/index.ts` re-pointed) —
the stale-artifact trap; `scripts/verify.sh` runs the CLI's `--check`.
Verified in the built CSS:

```
--color-border-emphasized: light-dark(#D9D9D9, #424242)
--color-border:            light-dark(#F0F0F0, #303030)
--color-on-error:          light-dark(#ffffff, #ffffff)
--color-on-success:        light-dark(#ffffff, #ffffff)
```

---

## Files changed

| file | defect |
|---|---|
| `react/src/components/BAISider.css` | A, B |
| `react/src/components/AdminUserManagement.tsx` | C |
| `react/src/astryx-theme/backendAiTheme.ts` | D, F |
| `react/src/astryx-theme/built/*` (regenerated) | F |
| `react/src/components/MainLayout/WebUIHeader.tsx` | E |
| `react/src/components/BAINotificationButton.tsx` | E |
| `packages/backend.ai-ui/src/components/BAISelect.css` | E |

## Verification

- `bash scripts/verify.sh` → **`=== ALL PASS ===`** (Relay, Lint, Format,
  TypeScript, Vite warmup paths, StyleX injection sentinel,
  `astryx theme build --check`, Terminology).
- `react` vitest: **62 files / 1164 tests passed**.
- `packages/backend.ai-ui` vitest: **22 files / 449 passed, 1 skipped**.
- `packages/backend.ai-ui` rebuilt (`BAISelect.css` changed).
- No `pageerror` during any probe run.
