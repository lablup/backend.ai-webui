# Astryx migration — defect fixes + logged-in visual sweep #1

Date: 2026-08-08 · Branch `to-astryx` · Dev server `http://127.0.0.1:4500/`
Backend: the shared test cluster (endpoint/credentials supplied out of band — never
committed).

Screenshots: `.scratch/astryx-migration/shots/sweep-1/<route>-{light,dark}.png`
(16 routes × 2 modes, every dark shot reached by clicking the HEADER toggle, not by
reloading).

---

## Prime directive applied

> Match legacy by adjusting THEME DEFAULTS, not per-component position/color patches.

Three of the four fixes below land in theme/plumbing layers. The one structural
exception (`flex-shrink` / DOM placement on the sider shell) is a *layout contract*,
not a visual value — there is no Astryx token for "do not shrink" or "render outside
the clipping context" — and is justified in place.

---

## Defect 1 — theme toggle did not switch backgrounds live

### Root cause

Not Astryx. Astryx's mechanism was already correct: the root `<Theme mode>` in
`AstryxBrandTheme` re-syncs `data-theme` onto `<html>` on every mode flip
(`useRootThemeSync`), `reset.css` maps that to `color-scheme`, and every
`light-dark()` token re-resolves. Measured: text/border/icon colors flipped
instantly; the theme-shim `useToken()` cache also invalidated correctly (its
`MutationObserver` on `<html>` bumps the epoch).

What did not flip was the **page backdrop**, and every Astryx surface in the content
column is `background-color: transparent` — so the whole page kept the previous
mode's color until a reload. Three mode-blind owners were fighting over `body`:

1. `index.html` boot script: `document.body.style.backgroundColor = isDarkMode ? …`
   — an **inline style**, written once at boot, outranking every rule. This was the
   actual freeze.
2. `index.html` critical CSS: hardcoded `body { … rgba(247,247,246,1) }` /
   `body.dark-theme { #191919 }`.
3. `resources/webui.css`: `body { var(--token-colorBgBase, …) }` +
   `body.dark-theme { #191919 }`.

Measured before: after clicking the toggle, `data-theme` → `dark`,
`colorScheme` → `dark`, text → `rgb(235,224,218)`, but
`body.backgroundColor` stayed `rgb(247,247,246)`. After a reload it became
`rgb(25,25,25)`.

### Fix (theme-level, zero JavaScript at runtime)

- **`index.html`** — boot script now seeds Astryx's own attribute
  (`document.documentElement.setAttribute('data-theme', …)`), which is exactly the
  pattern Astryx documents for SSR/pre-hydration. React's root `<Theme>` takes
  ownership of the *same* attribute on mount, so there is one attribute with one
  owner at a time and it is reactive by construction. The inline
  `body.style.backgroundColor` assignment is deleted, with a comment saying why it
  must not come back.
- **`index.html` critical CSS** — the `html[data-theme] → color-scheme` mapping is
  duplicated inline (so it exists before any external sheet loads), and the backdrop
  becomes `var(--color-background-body, light-dark(#FAEFE9, #180F08))` — the Astryx
  page-surface token, with a literal fallback for the pre-theme window.
- **`resources/webui.css`** — dropped both `background-color` declarations on `body`
  and the whole `body.dark-theme { background-color }` rule; `.splash` now reads the
  same token. Single owner.

### Verified

All 16 swept routes report `light → rgb(250,239,233)`, `dark → rgb(24,15,8)` after a
header-button toggle, with no reload. Screenshots confirm visually in both modes.

---

## Defect 2 — sider density differed from legacy

### Root cause (two independent causes; the first was the dominant one)

**2a — the rail was being squeezed to 117px.** `SideNav`'s StyleX declares
`width: 260` but no `flex-shrink: 0`; Astryx delegates the rail's flex contract to
`AppShell`, which `MainLayout` deliberately does not adopt. As a flex item next to a
`flex: auto` content column whose intrinsic basis exceeds the viewport, the rail
shrank to **117.25px measured** — every label truncated ("Admin …", "Dashbo…",
"My Envi…", "Deploy…"). antd `Layout.Sider` emitted `flex: 0 0 <width>px` for exactly
this reason.

**2b — item metrics were Astryx defaults, not the legacy ones.** Ticket 24 dropped
`BAIMenu`'s antd `ConfigProvider theme.components.Menu` block, reasoning that
"Astryx's nav-item styling is theme-owned and its enums are closed". Correct about
the props enums, but it skipped the part that *is* open: `defineTheme({components})`.
Measured drift: item height 32 vs 40, pitch 32 vs 44, font 14 vs 16, pill radius 8 vs
20, content inset 16px vs 32px from the rail edge, group headings with 4px of
breathing room instead of 20px.

**2c (found during the sweep, same family)** — `SideNav` sets
`background-color: inherit` on its root *and* on its sticky top/bottom bands,
assuming an `AppShell` ancestor paints the rail. With none, `inherit` bottomed out at
the page backdrop: the rail had no surface of its own (antd painted
`colorBgContainer`) and the sticky footer band was see-through.

### Fix

**2b + 2c → theme defaults.** New `SIDE_NAV_DENSITY` block fed to
`defineTheme({components})` in `react/src/astryx-theme/backendAiTheme.ts`, targeting
Astryx's semantic component keys. It emits `@layer astryx-theme` CSS, which outranks
the components' own `@layer astryx-base` StyleX output, so no CSS is sprinkled on
`BAISider`/`BAIMenu` and every role theme (brand/admin/secondary) and theme family
inherits it:

| antd token (legacy `BAIMenu`) | Astryx theme declaration |
|---|---|
| `Menu.itemHeight: 40` | `side-nav-item.height: 40px` |
| `Menu.itemMarginBlock: 4` (collapsing → 44px pitch) | `marginBlock: 2px` (flex column, margins don't collapse → same 44px pitch) |
| `Menu.itemBorderRadius: 20` | `borderRadius: 20px` |
| `Menu.fontSize: fontSizeLG` (16) | `fontSize: 16px` |
| item `padding-inline: 16` + `itemMarginInline: 16` (32px from edge) | `paddingInline: 24px` (SideNav's column already contributes 8px) |
| group title `padding-top: paddingMD` (20) | `side-nav-section.paddingBlockStart: 20px` |
| antd Sider `colorBgContainer` | `side-nav.backgroundColor: var(--color-background-surface)` |

`THEME_NAME_REV` bumped 1 → 2 and the prebuilt artifacts regenerated
(`astryx theme build`), per the numbering rule in that file; the stale `bai-r1-*`
artifacts were deleted and `built/index.ts` repointed.

Deliberately **not** ported: the group title's `padding-left: paddingXL`,
`font-weight: 500` and `colorTextDescription`. `SideNavSection` renders its title as
a bare `<span>` with no `astryx-*` class, so it is not addressable from `components`
— reaching it would need a raw descendant selector in `BAISider.css`, i.e. exactly
the per-component patch this migration avoids. Astryx's own title treatment
(`--text-supporting-size`, semibold, `--color-text-secondary`) is within a hair of
antd's, so ticket 24's visual-values policy applies: take the Astryx default.

**2a → structural (JUSTIFIED EXCEPTION).** `BAISider` now wraps `SideNav` in a
`position: relative; display: flex; flex-shrink: 0; height: 100vh` shell. This is a
layout contract, not a visual value: there is no Astryx token for "do not shrink",
the sizes themselves stay Astryx's (260 / 48), and the alternative — adopting
`AppShell` — was rejected with reasons in `MainLayout.tsx`. Documented in the
`BAISider.tsx` header under "THE SHELL WRAPPER".

### Verified (measured, light mode, 1600×1000)

rail 260px · item height 40px · pitch 44px · font 16px · radius 20px ·
paddingInline 24px · rail background `rgb(255,251,248)` (= `--color-background-surface`).
No truncated labels.

---

## Defect 3 — hover collapse/expand button clipped and mispositioned

### Root cause

`SiderToggleButton`'s own CSS is unchanged from `main`
(`position: absolute; right: 0; transform: translateX(12px); paddingTop: 68`). What
changed is **where it renders**: ticket 24 left it as a child of `BAISider`, and
`BAISider` now forwards children into `SideNav`'s scroll column. `SideNav` clips both
axes — `overflow: hidden` on the root (`styles.root`) and `overflow-x: hidden` on the
scrollable column (`styles.scrollable`) — so the half of the button that protrudes
past the rail's right edge was cut off. Its apparent position shift was the combined
effect of that clip plus Defect 2a's 117px rail.

### Fix (structural, same justified exception as 2a)

`BAISider` grows an `overlay` slot rendered as a **sibling** of `SideNav` inside the
positioned shell — which is where antd's `Layout.Sider` had it, outside every
clipping context. `WebUISider` passes `SiderToggleButton` through it. `BAISider`'s
`ref` (used only for `useHover`) now points at the shell rather than at `SideNav`, so
hover detection covers the protruding control too.

No CSS was added to the button, and no `z-index`/`overflow` override was added to
`SideNav`.

### Verified

Measured with the sider hovered: button box `x: 244 → 272`, `y: 68 → 96`, every
ancestor `overflow: visible`, `visibility: visible`. Fully drawn past the rail edge.
See `shots/diag-sider-hover2.png`.

---

## Sweep results

16 routes × light/dark, toggled with the header button between the two captures of
each route. **Every route flipped correctly with no reload** (`data-theme` and
`body` backdrop both), which is the acceptance criterion for Defect 1.

Routes covered: start, dashboard, sessions, session-launcher, data, deployments,
my-environment, model-store, chat, statistics, admin-users, admin-agent,
admin-environment, admin-resource-policy, admin-settings (configurations),
admin-dashboard.

No uncaught page errors during the sweep (`pageerror` listener: empty).

### Remaining visual defects (NOT fixed — list only)

| # | Severity | Where | Symptom | Suspected cause | Level |
|---|---|---|---|---|---|
| 1 | **High** | Session launcher (`session-launcher-light.png`) | "Next" / "Skip to review" render as flat gray blocks with the chevron wrapped onto a second line; the primary action reads as disabled | Button `iconAfter`/label composition lost in the Astryx migration; likely a `BAIButton` → Astryx `Button` variant + icon-slot mapping gap, not a token issue | Component |
| 2 | **High** | Admin → Configurations (`admin-settings-light.png`) | Boolean settings render as plain gray squares instead of toggle switches | antd `Switch` under the Astryx cascade, or a `Switch` → Astryx mapping that never landed | Component |
| 3 | Medium | `SimpleProgressWithLabel.tsx:53,75` | `strokeColor="#BFBFBF"` / `backgroundColor: '#BFBFBF'` — identical in both modes; nearly invisible on the dark backdrop (visible on dashboard-dark) | Known mode-blind hardcode | Component → should become `var(--color-border)` / `--color-background-muted` |
| 4 | Medium | `AssignRoleModal.tsx:295` | `color: '#999'` — mode-blind helper text | Known mode-blind hardcode | Component → `--color-text-secondary` |
| 5 | Medium | Admin → Configurations, Statistics | Info `Alert`s paint antd's cool blue (`#E6F4FF`/`#BAE0FF` family) inside a warm brand surface | `Alert` still on the antd engine with antd's own `colorInfo` ramp; Astryx brand theme has no `info` family (documented in `backendAiTheme.ts`) | Theme — needs an `info` decision, then `components.alert` or the antd `colorInfo` seed |
| 6 | Medium | Header, both modes | The header stays full-saturation brand orange in dark mode | `Layout.headerBg` comes from `resources/theme.json` as a single mode-blind value | Theme (`theme.json` needs a `dark.components.Layout.headerBg`) |
| 7 | Low | All tables, light | Table header rows are cool gray (`#FAFAFA`/`#F0F0F0`) against warm cream cards — visible warm/cool mismatch | antd Table header background still on the antd token, not `--color-background-muted` | Theme (align antd `Table.headerBg`, or finish the Table migration) |
| 8 | Low | All tables, dark | Header row is nearly indistinguishable from the body — no separation | Same as #7 | Theme |
| 9 | Low | Route error boundary (`RouteErrorContent`) | The error screen paints neutral-cool with a *blue* primary button and ignores dark mode | Rendered ABOVE the provider stack, so it takes the theme-shim's provider-less fallback (documented in `theme-shim/index.tsx`); the fallback resolves the neutral scope, not brand | Theme/plumbing — mount a minimal `AstryxBrandTheme` above the router error element |
| 10 | Low | Sider, both modes | Nav item icons are accent-colored for *every* item, selected or not; legacy tinted only the selected row | Astryx `SideNavItem` icon color default | Theme (`components['side-nav-item']` has no icon-color key today → likely needs an Astryx-side prop) |
| 11 | Low | Sider group titles | Titles sit 16px from the rail edge; item labels sit at 32px — misaligned | Not addressable from `components` (see Defect 2 note) | Component (deliberately deferred) |
| 12 | Info | `/data` | One sweep pass rendered the route-level error screen; a targeted re-run rendered the folder list correctly and reported no `pageerror` | Intermittent — a 404 from the storage-proxy call during that pass | n/a — backend flake, watch for recurrence |
| 13 | Info | admin-dashboard | Console: `Invalid prop 'ref' supplied to React.Fragment` (×3) | A dashboard widget forwarding a ref into a fragment; predates this change set | Component |

---

## Verification

- `bash scripts/verify.sh` → **`=== ALL PASS ===`** (Relay, Lint, Format, TypeScript,
  StyleX injection sentinel, `astryx theme build --check`, terminology).
- `react` vitest: `src/astryx-theme` 17/17 pass; full react + BUI suites green.
- `packages/backend.ai-ui` was not modified by this change set (no BUI rebuild
  needed), but was rebuilt to confirm.
