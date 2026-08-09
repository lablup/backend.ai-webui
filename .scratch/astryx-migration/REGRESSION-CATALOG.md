# Astryx migration — full-app design-regression catalog (audit 1)

**Branch audited:** `to-astryx` @ `0a6899059` (`chore(astryx): regenerate remainder inventory after phase-3 wave 3`)
**Legacy baseline:** `origin/main` @ `0ba66d81e` — the direct merge-base, so `origin/main..to-astryx` *is* the migration.
**Backend:** `http://10.82.0.130:8090` · **App:** vite dev on `127.0.0.1:5950` · **Viewport:** 1600×1000
**Date:** 2026-08-09 · read-only audit, no app code modified.

---

## 0. How to read this catalog

### Fix-mechanism classes

| Class | Meaning | Where the fix lands |
|---|---|---|
| **T** | Fixable purely by an **Astryx THEME setting** — a `defineTheme()` token or a `components: {}` block. One edit, global effect. | `react/src/astryx-theme/backendAiTheme.ts`, `packages/backend.ai-ui/src/theme-shim/antdParity.ts` |
| **L** | Fixable by **LAYOUT composition** with Astryx primitives (`Layout`/`LayoutPanel`/`BAIFlex` gap/`Grid`/`Toolbar`) at the call site. | the page / component call site |
| **C** | Needs **component-level code** — structure, a new prop, conditional logic. | the BUI / app component |
| **F** | Already **in flight** by a sibling agent. Recorded with measurements so the owner has the data; deliberately not analysed deeply. | — |

Sibling-owned areas, all marked **F**: (a) tabs / `BAICard` `tabList` underline, (b) multi-select trigger
display + refresh button groups, (c) table-page layout rhythm + drawer headers, (d) chat composer.

### Severity

- **High** — broken layout, illegible/unreachable content, or a brand/identity signal that is simply gone.
- **Med** — noticeably off against legacy; a user who knew the old UI would spot it.
- **Low** — minor drift, only visible side-by-side.

### Evidence discipline

Every **current** value is *measured live* (Playwright, both modes, real header `Dark mode` toggle with
`document.documentElement.dataset.theme` asserted `= dark`). Every **legacy** value is *derived from
`origin/main` source + the antd 6.5.0 formulas* — the legacy build cannot be run here — cross-checked
against the measured parity tables in `packages/backend.ai-ui/src/theme-shim/antdParity.ts`,
`selfTokens.ts`, and the operator seeds in `resources/theme.json`.

### Artefacts

| Path | Contents |
|---|---|
| `shots/audit-1/<route>-{light,dark}.png` | 38 routes × 2 modes |
| `shots/audit-1/ov2-<route>--<overlay>-{light,dark}.png` | 13 modals / drawers / menus × 2 modes |
| `audit1-sweep-{light,dark}.json` | per-route probes: collisions, clipping, misalignment, table rhythm, card rhythm, sider clip, dark light-surfaces, shell metrics |
| `audit1-overlays2-{light,dark}.json` | per-overlay geometry: size, radius, bg, header/body/footer padding, title type, shadow |
| `audit1-tokens.json` | every relevant CSS custom property + rendered type scale, both modes |
| `audit1-spot.json` | targeted measurements (table chrome, banner, checkbox, gauge) |
| `audit1-buttons.mjs` | button-variant palette in both modes (F-5) |
| `audit1-*.mjs` | the probes themselves (re-runnable; see §6) |

**Coverage:** 38 routes (project scope 12, project-admin 4, admin 18, misc 4) × 2 modes = **76 route
captures**, all `settled=true` (no skeleton at capture time) and **zero uncaught page errors** in either
mode. Plus **16 distinct overlays** — 9 modals, 2 drawers, 3 menus/pickers, 1 confirm dialog, 1 table
settings dialog — giving **29 overlay captures** (13 light + 16 dark; the light pass missed three when
`/data` was slow on the backend, the dark pass caught them).

Overlays are opened by explicit, deterministic selectors and measured, then dismissed with `Escape`.
**Nothing is ever submitted**: no OK/Confirm/Delete is clicked, and the destructive-action allowlist in
the probe never fires a mutation. The `Move to trash bin` confirm dialog below was opened and measured
only.

---

## 1. Summary

### 1.1 Counts

68 findings. Where a finding has a compound class (`T / C`, `C / L`, …) it is counted under its
**primary** class — the one that does most of the work.

| Class | High | Med | Low | (owner-rated) | **Total** |
|---|---:|---:|---:|---:|---:|
| **T** — theme setting | 7 | 16 | 3 | — | **26** |
| **L** — layout composition | 1 | 3 | 2 | — | **6** |
| **C** — component work | 8 | 11 | 11 | — | **30** |
| **F** — sibling in flight | 3 | 1 | — | 2 | **6** |
| **Total** | **19** | **31** | **16** | **2** | **68** |

Read another way: **26 of 68 findings (38%) are theme-primary**, and they carry **7 of the 19**
High-severity items — several of which (G-1, G-3, G-5) each close three or four separate symptoms at
once. The theme file is by far the cheapest lever, and §1.3 ranks the pins by findings-closed-per-edit.

The remaining High items split into two clusters that are *not* theme-fixable: a **table-rendering
defect** (T-1/T-2/T-3 — the table paints outside its own layout box) and a set of **component contracts
that were dropped during conversion** (F-1 required marks, F-2 `hidden`, F-3 `BAITag`, F-4 `BAIAlert`,
F-5 `danger`, S-1/S-2 the sider).

### 1.2 Top 10 highest-impact fixes

| # | Finding | Class | Sev | Why it ranks here |
|---|---|---|---|---|
| 1 | **[T-1] Table content paints outside its container — pagination bar overlaps the last row by 16px** | F/C | High | Measured on **14 of 15** table routes in *both* modes. `a-data`: `tableBottom=656`, `pagerTop=640` with `margin-top: 8px` — the table's layout box is 24px shorter than what it paints. Every list page in the product is affected. |
| 2 | **[G-1] The neutral TEXT + ICON ramp was never pinned — everything is accent-tinted** | T | High | `--color-text-primary` = `#211A16` / `#EBE0DA` vs legacy `colorText` `#141414` / `#FFFFFF`; `--color-text-secondary` `#51443C` / `#B8A89F` vs `rgba(0,0,0,0.65)` / `rgba(255,255,255,0.65)`. Every string and every icon in the app. Dark mode never reaches white. One `ANTD_NEUTRAL_TEXT` block closes it. |
| 3 | **[G-3] The heading scale is off by two steps** | T | High | Measured: `Heading` 1..5 = **24/20/16/14/12** px vs antd `Typography.Title` **38/30/24/20/16**. 57 live `<Heading level={N}>` sites; drawer titles render at **12px**, the error page headline at **14px**, while modal titles *grew* to 20px — the hierarchy is inverted. |
| 4 | **[S-1] The admin sider menu is clipped and cannot scroll** | C/L | High | `nav.astryx-side-nav` has `overflow-y: hidden` and `scrollHeight − clientHeight = 71px`. Measured on **16/16 admin routes**: the last item (`Information`) sits **61px below the footer top**. *Branding* and *Information* are unreachable at a 1000px viewport. |
| 5 | **[S-2] The selected sider item lost its brand identity** | C | High | Legacy `BAIMenu` set `itemSelectedBg = rgba(255,122,0,0.15)` and antd's default `itemSelectedColor = colorPrimary`. Now the active row is flat `--color-neutral` grey and `BAISider.css:107` forces `--color-text-primary` on *every* item, so the label and icon are not orange either. The primary nav has no brand active state. |
| 6 | **[O-2/O-3] Every modal lost its padding rhythm and grew a 20px title** | T | High | Measured on 8 dialogs: body padding **16px on all four sides** (legacy `20px 24px`), header and footer **0**, title **20px/600** (legacy `.ant-modal-title` **16px**/600), radius **12px** (legacy `borderRadiusLG` 8). ~124 `<BAIModal>` call sites. `components: { dialog: … }` + `--radius-container` fix it centrally. |
| 7 | **[F-1] The required-field marker contract flipped, and is now inconsistent within one app** | C | High | Legacy shipped a `ConfigProvider.form.requiredMark` that rendered **no asterisk ever** plus a grey `(Optional)` on non-required labels. `Create User` now shows red `*` on every required field; `Create Project` (still antd `Form.Item`) shows `(optional)` and marks nothing as required. Both conventions ship side by side. 287 `BAIFormItem` call sites. |
| 8 | **[F-4] Info alerts turned saturated blue** | C/T | High | Legacy `BAIAlert` defaulted `ghostInfoBg = true` → bg `colorBgContainer` **#FFFFFF** + `1px colorBorder`. Measured now: `rgb(196,221,251)`, border **0**, padding `12px 16px` (legacy `16px 24px`), radius 12 (legacy 8), title weight 400 (legacy 500). Appears on Start, Configurations, project-admin pages, and every `Banner`. |
| 9 | **[G-2] Body line-height dropped 2px per line, and the two engines disagree** | T | High | `--text-body-leading` = **1.4286** → rendered `line-height: 20.0004px` at 14px. antd `lineHeight` = 1.5714 → **22px**, and the breadcrumb (still antd-rendered) *measures* 22px on the same page. Every paragraph, table cell and list in the app is 2px tighter than the chrome around it. |
| 10 | **[O-9] Every toast is now a brand-orange card** | T/C | High | `BAINotificationStackAdapter` maps the default notice to `Banner status="info"`, and Astryx `Banner info` paints `--color-accent-muted` — the brand orange in this theme. antd `notification` was a neutral `colorBgElevated` card, `20px 24px`, radius 8, `boxShadowSecondary`. Current: `12px 16px`, radius 12, `--shadow-high`. |

### 1.3 Which theme tokens fix the most at once

Ranked by findings closed per edit. All go in `react/src/astryx-theme/backendAiTheme.ts` (bump
`THEME_NAME_REV`, currently `6` at `:67`, and add the new keys to the hash array at `:528` — the file
documents at `:44-47` that a stale registration otherwise masks a recipe change).

| Rank | Token pin | Closes | Findings |
|---|---|---|---|
| **1** | `ANTD_NEUTRAL_TEXT` block: `--color-text-primary` `['#141414','#FFFFFF']`, `--color-text-secondary` `['rgba(0,0,0,0.65)','rgba(255,255,255,0.65)']`, `--color-text-disabled` `['rgba(0,0,0,0.25)','rgba(255,255,255,0.25)']`, `--color-icon-primary` `['#141414','#FFFFFF']`, `--color-icon-secondary` `['rgba(0,0,0,0.45)','rgba(255,255,255,0.45)']`, `--color-icon-disabled` `['rgba(0,0,0,0.25)','rgba(255,255,255,0.25)']` | the whole warm-cast complaint, app-wide | G-1, T-5, S-2 (partly), O-13 |
| **2** | `'--radius-container': '8px'` in `ANTD_ALIGN_TOKENS` (`antdParity.ts:70`) — the sibling `--radius-element` is *already* pinned to 8px for the same antd token | Dialog, Card, Banner, Tooltip, DropdownMenu radius in one line | G-5, O-1, T-4(card), F-4 |
| **3** | `'--text-heading-1-size': 'var(--font-size-4xl)'` … `'--text-heading-5-size': 'var(--font-size-lg)'` (plain strings — see §5) | the entire type hierarchy, 57 sites | G-3, O-3, O-7, R-5 |
| **4** | `components: { dialog: { base: { padding: '16px 24px', backgroundColor: 'var(--color-background-popover)' } } }` | modal gutters + the dark-mode modal surface (`#141414` → `#1F1F1F`) | O-2, O-10 |
| **5** | `'--text-body-leading': '1.5714'` (+ `--text-label-leading`, `--text-code-leading`) | line rhythm everywhere; removes the antd/Astryx disagreement inside one page | G-2, G-11 |
| **6** | `'--color-overlay-hover': ['rgba(0,0,0,0.06)','#262626']`, `'--color-overlay-pressed': ['rgba(0,0,0,0.15)','rgba(255,255,255,0.18)']` | dark-mode hover is currently 5% white on `#141414` — effectively invisible | G-4 |
| **7** | `ANTD_BOX_SHADOW_SECONDARY` also assigned to `--shadow-high` (`antdParity.ts`) | dialog + banner + popover elevation | G-6, O-5, O-9 |
| **8** | `'--size-element-sm': '24px'` | every `size="small"` control is 4px too tall; `mapping.ts:120-124` already calls this out and never pinned it | G-8, F-6 |

Two more that are one-liners but need design sign-off rather than parity reasoning:
`'--color-background-inverted': ['#141414','#FAFAFA']` (G-7 — the dark tooltip is currently a warm
white `#FFFBF8`, the exact hue the "누리끼리" ticket was opened to remove), and the `side-nav-item`
density block in S-3.

---

## 2. Findings by surface

### 2.1 GLOBAL — theme tokens (apply to every route, every overlay)

Measured with `audit1-tokens.mjs`; raw dump in `audit1-tokens.json`.

| # | What / where | Legacy expected (light / dark) | Measured current (light / dark) | Class | Sev | Suggested fix |
|---|---|---|---|---|---|---|
| **G-1** | Neutral **text + icon** ramp. `backendAiTheme.ts:128-138` explicitly defers these ("Deliberately NOT touched … re-deriving them is a separate, larger decision"), while the *surface* and *border* families were pinned. | `colorText` `#141414` / `#FFFFFF` (survives verbatim from `resources/theme.json:8,:43`); `colorTextSecondary` `rgba(0,0,0,0.65)` / `rgba(255,255,255,0.65)`; `colorTextDisabled` `rgba(0,0,0,0.25)` / `rgba(255,255,255,0.25)`; `colorIcon` = tertiary `rgba(0,0,0,0.45)` | `--color-text-primary` `#211A16` / `#EBE0DA`; `--color-text-secondary` `#51443C` / `#B8A89F`; `--color-text-disabled` `#9D8E85` / `#6A5C53`; `--color-icon-secondary` `#51443C` / `#B8A89F` | **T** | **High** | add an `ANTD_NEUTRAL_TEXT` block next to `ANTD_NEUTRAL_SURFACES` / `ANTD_NEUTRAL_BORDERS` (§1.3 #1) |
| **G-2** | Global **line-height**. | antd `lineHeight` 1.5714 → **22px** at 14px | `--text-body-leading` **1.4286** → rendered **20.0004px**. The breadcrumb, still antd-rendered, measures **22px** on the same page — the two engines disagree inside one screen. | **T** | **High** | `'--text-body-leading': '1.5714'` (+ label/code). Plain string, never a tuple. |
| **G-3** | **Heading scale.** `ANTD_ALIGN_TOKENS` pins `--font-size-lg` 16 and `--font-size-4xl` 38 but never remaps `--text-heading-*-size`, so the pins never reach a heading. | `Typography.Title` 1..5 = **38 / 30 / 24 / 20 / 16** | `Heading` 1..5 = **24 / 20 / 16 / 14 / 12** (measured). `--text-heading-1-size: 1.5rem`. | **T** | **High** | pin the five `--text-heading-N-size` vars (§1.3 #3) |
| **G-4** | `colorBgTextHover` → `--color-overlay-hover`. `resources/theme.json:49` declares the dark value **opaque** `#262626`. | `rgba(0,0,0,0.06)` / `#262626` | `#211A160D` (5%) / `#FFFFFF0D` (5%). On `#141414` a 5% white wash is effectively invisible — ghost buttons, menu rows and icon buttons have no hover state in dark mode. | **T** | **High** (dark) | `['rgba(0,0,0,0.06)','#262626']` |
| **G-5** | `--radius-container` — the radius source for Card, Dialog, Banner, Tooltip, DropdownMenu. | antd `borderRadiusLG` **8px** | **12px** (measured on cards *and* every dialog). Note `--radius-element` *is* pinned to 8px in `ANTD_ALIGN_TOKENS` for the identical antd token. | **T** | Med | `'--radius-container': '8px'` in `antdParity.ts:70` |
| **G-6** | Dialog / banner elevation. `ANTD_BOX_SHADOW_SECONDARY` exists in `antdParity.ts:47-50` but is assigned only to `--shadow-med`. | `0 6px 16px 0 rgba(0,0,0,.08), 0 3px 6px -4px rgba(0,0,0,.12), 0 9px 28px 8px rgba(0,0,0,.05)` | measured on dialogs: `oklch(0 0 0/0.1) 0 4px 6px, oklch(0 0 0/0.15) 0 12px 24px …` (`--shadow-high`, harder, plus a dark-mode inset hairline) | **T** | Med | assign the same recipe to `--shadow-high` |
| **G-7** | `--color-background-inverted` — the Tooltip surface. | antd `colorBgSpotlight` `rgba(0,0,0,0.85)` / `#424242` | `#211A16` / **`#FFFBF8`**. In dark mode the tooltip is a warm *white* bubble with dark text — inverted from legacy, and `#FFFBF8` is precisely the warm surface value the theme header quotes at `:79` as the reported defect. | **T** | Med | `['#141414','#FAFAFA']` at minimum; the semantic argument at `:136-138` for not adopting `colorBgSpotlight` wholesale still holds |
| **G-8** | `controlHeightSM`. `mapping.ts:120-124` documents the delta as "too big a delta for form rows" and never pins it. | **24px** | `--size-element-sm` = **28px** (measured) | **T** | Med | `'--size-element-sm': '24px'` — measure the blast radius on `size="sm"` buttons/selects first |
| **G-9** | `colorTextHeading`, `colorIcon`, `colorIconHover`, `fontSizeHeading2`, `controlHeightLG` are **absent from `TOKEN_MAP`** — `token.colorIcon` returns `undefined`. | mapped values | `undefined` | **C** (shim) | Low | add the five rows to `mapping.ts`; `mapping.ts:8-9` claims complete coverage |
| **G-10** | `--text-large-leading`. | antd `lineHeightLG` **1.5** | **1.4118** | **T** | Low | `'--text-large-leading': '1.5'` |
| **G-11** | `colorFillQuaternary` / `colorFillAlter` are exact in the JS shim but the CSS conversion aliased them to `--color-overlay-hover` / `--color-background-muted` — **2×–2.5× too opaque**. `ChatMessageContent.css:21-22`. | `rgba(0,0,0,0.02)` | `rgba(0,0,0,0.04)` / `#211A160D` | **C** | Low | point the two CSS vars at literal values |

**Verified clean (no drift) — worth stating so nobody re-litigates them:** the entire **spacing ladder**
(`--spacing-1..12` = 4/8/12/16/20/24/32/48 px, exact), the **font-size ladder** (12/14/16/20/24/38 exact,
with `--font-size-lg` and `--font-size-4xl` explicitly pinned), `--radius-none` 4 / `--radius-inner` 6 /
`--radius-element` 8, `--size-element-md` 32 = `controlHeight`, the **border family**
(`--color-border` `#F0F0F0`/`#303030`, `--color-border-emphasized` `#D9D9D9`/`#424242` — exact),
the **surface family** (`#FFFFFF`/`#141414` container, `#FFFFFF`/`#1F1F1F` popover, `#F7F7F6`/`#191919`
body), `--color-skeleton`, `--color-neutral`, `--shadow-med`, `--duration-slow` 300ms.

---

### 2.2 APP SHELL — sider, header, breadcrumb, page frame

Present on **all 38 routes**. Screenshots: any `*-light.png` / `*-dark.png`.

| # | What / where | Legacy expected | Measured current | Class | Sev | Suggested fix |
|---|---|---|---|---|---|---|
| **S-1** | **Admin sider menu is clipped and cannot scroll.** `nav.astryx-side-nav > div` | antd `Menu` in a scrollable column; every item reachable | `overflow-y: hidden`, `scrollHeight − clientHeight = **71px**`. Last item (`Information`) bottom is **61px below the footer top** on **16/16** admin routes (`Statistics`, project scope: −120px, fine). *Branding* and *Information* are unreachable at 1000px height. | **C** / **L** | **High** | `overflow-y: auto` on the scroll region, or give the footer `flex-shrink: 0` and let the nav column take the remainder. `react/src/components/MainLayout/WebUISider.tsx`, `BAISider.css` |
| **S-2** | **Selected nav row lost the brand accent.** `BAISider.css:107,118-128`; `react/src/components/BAIMenu.tsx` (the legacy `ConfigProvider` block was deleted) | bg `rgba(255,122,0,0.15)` (`colorPrimary` @15%), label + icon `colorPrimary` `#FF7A00` | bg `var(--color-neutral)` `rgba(0,0,0,0.06)` / `#262626`; label `var(--color-text-primary)` — `BAISider.css:107` matches *every* `a.astryx-side-nav-item` and outranks the `[data-selected]` rule | **C** | **High** | in `BAISider.css:118`: `background-color: var(--color-accent-muted)` + `color: var(--color-accent)`, and a rule for `[data-selected] .lucide`. Not reachable by `defineTheme` because selection is a `data-` attribute, not a class. |
| **S-3** | Nav row density. `SIDE_NAV_DENSITY` (`backendAiTheme.ts:357-399`) already exists for exactly this. | `itemHeight` **40**, `itemBorderRadius` **20** (pill), `fontSize` `fontSizeLG` **16** | height `--size-element-lg` **36**, radius `--radius-element` **8**, font-size measured **16px** ✓ (font is parity; height and radius are not) | **T** | Med | extend `SIDE_NAV_DENSITY` with `height: '40px'`, `borderRadius: '20px'` |
| **S-4** | Menu column lost its top inset. `WebUISider.tsx` (removed `paddingTop: token.paddingLG`) | ~28px between the orange band and the first row (24 `paddingLG` + 4 `itemMarginBlock`) | ~14px (`stickyTop paddingBlockEnd` 8 + `scrollableWithTop` 4 + item `marginBlock` 2) | **L** | Med | `paddingBlockStart: var(--spacing-5)` on the nav column |
| **S-5** | Sider footer links. `WebUISider.tsx:275-345` | `fontSize: 11`, `Typography.Link type="secondary"` → `colorTextSecondary` grey; wrapper `padding: 30, paddingTop: 0`; `Divider marginBottom: 16` | Astryx `Link` default `color='accent'` → brand **orange**, `fontSize: 'inherit'` → **14px**; only `paddingBlockEnd: 12` + SideNav's 8px inline pad; `VStack gap={2}` = 8px either side of the divider | **L** / **C** | Med | `<Link color="secondary">` ×4, wrap in `<Text type="supporting">` (12px) or `fontSize: 11`, restore `paddingInline: var(--spacing-8)` |
| **S-6** | Page backdrop in dark. `MainLayout.tsx:407` + `webui.css` | antd `.ant-layout` painted `colorBgLayout` = `#f5f5f5` / **`#000000`** on the *outer* Layout | `--color-background-body` `#F7F7F6` / **`#191919`** (measured `rgb(25,25,25)`). Light delta is imperceptible; dark is a visible lift off pure black. Documented as deliberate at `backendAiTheme.ts:115-121`. | **T** | Med (dark) | only if parity matters: dark `#000000`. Flagged so the diff is not mistaken for an oversight. |
| **S-7** | Header vertical spacer. `WebUIHeader.tsx:319-325` | antd `Divider orientation="vertical"`: 8px margin × 2 + 1px rule = **17px** | `<span style={{ width: token.marginXS }} />` = **8px** | **L** | Low | `token.margin` (16) or bump the parent `BAIFlex` gap |
| **S-8** | Breadcrumb trailing `/`. `WebUIBreadcrumb.tsx:47-73` | a `dummy_tail` item drew one extra separator after the last crumb | separators between items only | **C** | Low | add a final empty `<BreadcrumbItem isCurrent>` if the trailing slash is wanted |

**Verified clean:** header height **60px**, header padding `0 24px`, header bg `rgb(255,151,41)` (light) /
`rgb(232,138,40)` (dark) — matching `resources/theme.json` `Layout.headerBg`; header text `#ffffff` in
both modes (an intentional, documented fix — `WebUIHeader.tsx:144-190` — not a regression); sider width
**240px**; sider bg `#FFFFFF` / `#141414`; scrollbar thumb/track tokens.

---

### 2.3 TABLE PAGES — 15 routes

`p-session`, `p-deployments`, `p-my-environment`, `p-agent-summary`, `p-data`, `pa-session`,
`pa-deployments`, `pa-data`, `pa-users`, `a-session`, `a-deployments`, `a-data`, `a-users`,
`a-environment`, `a-reservoir`, `a-scheduler`, `a-agent`, `a-project`.
Most vivid screenshots: `pa-users-light.png`, `a-session-light.png`, `a-environment-light.png`,
`a-dashboard-dark.png`.

> Sibling agent (c) owns "table-page layout rhythm". T-1, T-2 and T-7 are **F** — recorded with the
> measurements because they are the highest-severity items in the whole app and the numbers below are
> new evidence. T-3 – T-6 look like separate defects and are catalogued in full.

| # | What / where | Legacy expected | Measured current | Class | Sev | Suggested fix |
|---|---|---|---|---|---|---|
| **T-1** | **Table paints outside its layout box; the pagination row lands on top of the last row.** `BAITableAstryx.tsx` | pagination is a normal following sibling | on `a-data`: `tableBottom = 656`, `tableParentBottom = 656`, `pagerTop = **640**`, `pager margin-top: 8px`, `pagerPos: static`. The pager was laid out as if the table ended at 632 → the last row overlaps it by **16px**. Reproduced on **14/15** table routes in **both** modes (`pagerOverlapsLastRow: 16`; `p-deployments`: **61**). The generic collision detector independently reports the same defect as a `1264×16` overlap between two children of `div.astryx-card > div.astryx-stack.vertical.gap-4`. | **F** / C | **High** | root-cause the height the table wrapper reports vs. what it paints (virtualisation / `maxHeight` / sticky last row) |
| **T-2** | **Toolbar row (filter segmented + search + refresh) collides with the table header.** | a `BAIFlex gap` between the toolbar and the table | measured gap to the table is inconsistent (`0 / 24 / 32 / 36 px` by route) and visually the segmented control's bottom edge is *cut* by the header row — see `a-session-light.png` ("Running/Finished" clipped over "Session Name"), `pa-users-light.png` ("Active/Inactive" over "E-Mail"), `a-environment-light.png` (Search box over "Status"). | **F** / L | **High** | one composition for the toolbar→table gap; suspect the same box-height defect as T-1 |
| **T-3** | **Column widths overlap; content is clipped with no horizontal scroll.** | antd `Table scroll={{x}}` gave a horizontal scrollbar when columns exceeded the wrapper | `tableW = 1312` == `wrapW = 1312` with `overflow-x: auto` — the table is forced to the wrapper width, so columns compress into each other instead of scrolling. Cell text overlaps between adjacent columns (`pa-users`: `test@lablup.com` over `e2fdba…`; `a-dashboard` dark: `Jun 4, 2026 1:41:59 A` truncated mid-string, Allocation/Utilization/Disk stacked on top of each other) and the rightmost columns are cut off (`Allowed Clien…`, `Cluster M…`). | **C** | **High** | restore a min-width per column + `overflow-x` on the wrapper so the table can exceed its container |
| **T-4** | **Table header lost its tint.** | antd `Table` `headerBg = colorFillAlter = rgba(0,0,0,0.02)` — a faint grey band | measured `thBg: rgba(0,0,0,0)` (fully transparent) on every table. The header is indistinguishable from the body except by weight. | **T** / C | Med | `components: { table: { header: { backgroundColor: ['rgba(0,0,0,0.02)','rgba(255,255,255,0.04)'] } } }`, or a `.bai-table thead` rule |
| **T-5** | Header type colour. | `.ant-table-thead > th` = 14px / 600 / `colorText` (`#141414`) | measured `14px/600/rgb(65,71,83)` (admin scope) and `rgb(81,68,60)` (project scope) — i.e. `--color-text-secondary`, warm and lighter | **T** | Med | closed by **G-1** |
| **T-6** | Cell padding. | antd `Table size="small"`: `cellPaddingBlockSM/InlineSM` = **8px / 8px** (default size = 16/16) | measured `4px 8px 4px 8px` (first column `… 24px`). Row height **37px** vs antd small ≈ 39px. Vertical padding is halved. | **T** / C | Med | `components: { table: { cell: { padding: '8px' } } }` |
| **T-7** | Refresh button group + auto-refresh interval selector rendering (`a-session`: an orange sliver above the group). | — | — | **F** | Med | sibling (b) |

**Verified clean:** row separator `1px solid rgb(240,240,240)` = `colorBorderSecondary` `#f0f0f0` — exact
parity; card wrapper border `1px #f0f0f0`, `box-shadow: none` — exact parity with antd
`Card variant="outlined"`.

---

### 2.4 OVERLAYS — modals, drawers, menus, toasts, tooltips

13 overlays captured in both modes. Screenshots `ov2-*`. Raw: `audit1-overlays2-{light,dark}.json`.

Measured across 8 dialogs (`create-deployment`, `table-settings`, `create-user`, `create-policy`,
`create-project`, `overlay-network-config`, `user-pref`, and their dark twins) — the numbers below were
**identical on every one**, so these are `BAIModal`/`Dialog` defaults, not call-site drift.

| # | What / where | Legacy expected | Measured current | Class | Sev | Suggested fix |
|---|---|---|---|---|---|---|
| **O-1** | Modal **body padding**. `BAIModal.tsx:724-752` — legacy's explicit `styles={{header,body,footer}}` block was deleted with no replacement; Astryx `Layout*` slots read `--astryx-dialog-padding`, which nothing sets, so they fall back to `--spacing-4`. | header `10px 24px`, body `20px 24px`, footer `12px 20px` | header `0`, **body `16px 16px 16px 16px`**, footer `0` — every dialog loses 8px of horizontal gutter | **T** | **High** | `components: { dialog: { base: { padding: '16px 24px' } } }` |
| **O-2** | Modal **title size**. `DialogHeader` hard-codes `Heading level={2}`. | `.ant-modal-title` **16px** / 600 | **20px** / 600 (measured on all 8) | **T** | **High** | closed by **G-3** (`--text-heading-2-size`), or a `dialog-header` block |
| **O-3** | Modal **radius**. | `borderRadiusLG` **8px** | **12px** | **T** | Med | closed by **G-5** |
| **O-4** | Modal **shadow**. | antd `boxShadowSecondary` | `--shadow-high` (`oklch(0 0 0/0.1) 0 4px 6px, oklch(0 0 0/0.15) 0 12px 24px, …`) | **T** | Med | closed by **G-6** |
| **O-5** | **Backdrop gained a 2px blur.** `::backdrop { background-color: var(--color-overlay); backdrop-filter: blur(2px) }` | flat `rgba(0,0,0,0.45)`, no blur (legacy `BAIModal` even passed `mask={{ blur: false }}`) | blur is clearly visible behind every dialog — see `ov2-a-users--create-user-light.png` | **C** / T | Med | global `dialog::backdrop, .astryx-drawer::backdrop { backdrop-filter: none }` |
| **O-6** | `styles.body` overrides are **inert for padding** (46 occurrences: `ContainerLogModal`, `FolderExplorerModal`, `BulkCreateUserFromCSVModal`, `DownloadModal`, `ThemeJsonConfigModal`, …). | `styles.body.padding = 0` reached `.ant-modal-body` → full-bleed | the style lands on an inner `<div>` *inside* `LayoutContent`, which keeps its own 16px gutter | **C** | Med | hoist `styles?.body` onto `<LayoutContent padding={…}>` |
| **O-7** | Modal max-height / max-width. | body `max-height: calc(100vh − 174px)`; **no** max-width cap | `maxHeight` defaults to **75vh** (measured 750px of 1000) and an unconditional `max-width: 90vw` — which is why `a-settings/overlay-network-config` measures **1440×232**, a full-bleed modal for one field | **C** | Med | pass `maxHeight={maxHeight ?? 'calc(100vh - 174px)'}`; review the 90vw cap for wide-declared modals |
| **O-8** | `mask={false}`, `zIndex`, `centered={false}` accepted and ignored (`LoginFormPanel.tsx:668`, `ContainerRegistryList.tsx:545`). | honoured by antd | native `<dialog>` top layer: always centered, always masked | **C** | Low | honour `centered={false}` via `Dialog.position`, or delete the two dead props |
| **O-9** | **Minimised modal now blocks the page.** `BAIModal.tsx:44-48,500-513` | `mask={false}` + `pointerEvents:'none'` + an injected scroll-unlock — the page stayed usable behind a 320px title bar; only the outward corners were rounded | `showModal()` always paints a backdrop and locks scroll; full `--radius-container` on all corners | **C** | Med | render the minimised state outside `<Dialog>` (a plain fixed bar) or use `Dialog isInline` |
| **O-10** | **Dialog surface in dark mode.** | antd `colorBgElevated` `#fff` / **`#1f1f1f`** — and the theme *already* pins `--color-background-popover` to exactly that, with the comment "dropdowns, popovers, **modals**" (`backendAiTheme.ts:148-149`) | measured `rgb(20,20,20)` = **`#141414`** = `--color-background-surface`. A modal is the same colour as the cards behind it. | **T** | Med | `components: { dialog: { base: { backgroundColor: 'var(--color-background-popover)' } } }` |
| **O-11** | **Drawer header.** `WEBUINotificationDrawer.tsx`, `AgentDetailDrawer.tsx`, `SessionDetailDrawer.tsx`, `RoleDetailDrawer.tsx`, `StorageHostDetailDrawer.tsx`, `ModelCardDrawer.tsx` | `Drawer.title` 16px/600 in a header with `padding 16px 24px` + a 1px `colorSplit` bottom border | measured **12px**/600, no divider, no header padding — `ov2-header--notification-drawer-light.png`, `ov2-a-agent--agent-detail-drawer-light.png` | **F** | **High** | sibling (c) |
| **O-12** | Notification drawer **width**. `WEBUINotificationDrawer.tsx` declares no `width`. | antd `Drawer` default **378px** | measured **280px** | **C** | Med | `size={378}` |
| **O-13** | **Toasts are brand-orange cards.** `BAINotificationStackAdapter.tsx:104` maps the default notice to `Banner status="info"`; Astryx `Banner info` paints `--color-accent-muted` = the brand orange in this theme. | antd `notification`: bg `colorBgElevated` (`#fff`/`#1f1f1f`), padding **20px 24px**, radius **8**, `boxShadowSecondary` | orange tint, padding `12px 16px`, radius **12**, `--shadow-high`. Stack geometry (384px, 24px inset, bottom-right, hover-pause) *is* faithful. | **T** / C | **High** | `components: { banner: { base: { backgroundColor: 'var(--color-background-popover)', padding: '20px 24px' } } }`; radius via G-5, shadow via G-6 |
| **O-14** | Notification stack gap. `astryxBui.css:120-137` | antd inter-notice margin **16** | `--spacing-3` = **12** | **C** | Low | `--spacing-4` |
| **O-15** | **Tooltip bubble.** `BAIQuestionIconWithTooltip.tsx`, `BAIAlertIconWithTooltip.tsx` | bg `rgba(0,0,0,0.85)` / **`#424242`**, white text, radius **6**, padding **6px 8px**, maxWidth 250, **has an arrow** | bg `var(--color-text-primary)` — light `#211A16`, **dark `#EBE0DA`**, i.e. a *light* bubble with dark text; padding **4px 8px**; radius **12**; maxWidth 300; no arrow | **T** | Med | `components: { tooltip: … }` + G-5 + G-7 |
| **O-16** | Dropdown surface: radius 12 (antd 8) and a new unconditional `max-height: 300px; overflow-y: auto` — long user/action menus now scroll where they used to grow. | radius 8, no cap | radius 12, capped | **T** / C | Low | G-5; lift the cap if it bites |
| **O-17** | `BAIDeleteConfirmModal.tsx:288-293` — "This action cannot be undone." | `<Typography.Text type="danger">`: one inline red line, no chrome | a full `<Banner status="error">`: tinted fill + icon + `12px/16px` padding + 12px radius → **~48px taller** on ~30 delete modals | **C** | Med | `<Text style={{ color: 'var(--color-error)' }}>` |
| **O-18** | `BAIDeleteConfirmModal.tsx:236-256` — the item-list box. | radius **4** (`borderRadiusSM`), padding `8px / 16px`, bg `colorFillQuaternary` `rgba(0,0,0,0.02)` | radius **6** (`--radius-inner`), padding `8px / 12px`, bg `--color-background-muted` `rgba(0,0,0,0.04)` (2× darker) | **C** | Low | literal values |
| **O-19** | `a-settings/overlay-network-config` title reads `"Overlay Network settingsAn overlay netwo…"` — the title and its description are concatenated with no separator. | title and description were distinct nodes | run together in the `DialogHeader` title slot | **C** / L | Med | move the description into the dialog body or a `subtitle` slot |
| **O-20** | `a-agent/agent-detail-drawer` in **dark** mode reports **6** light-painted surfaces inside the drawer (`lightSurf=6`) — the only overlay that does. | — | see `ov2-a-agent--agent-detail-drawer-dark.png` | **C** | Med | inspect the drawer's inner cards/tags for hardcoded light fills |

**Verified clean:** modal **width 520** (antd default) and the wide variants (800, 1100) match their
declared widths; scrim colour `--color-overlay` `rgba(0,0,0,0.45)` — exact parity; notification-drawer
`mask={false}` behaviour preserved; the notification stack's position/size/hover-pause; drawer **body**
padding on the detail drawers (all restore antd's 24px via `style={{ padding: 'var(--spacing-6)' }}`)
and their `size` mapping (`size="large"` → 736/800).

---

### 2.5 FORMS & CONTROLS

Note on architecture: the self-hosted **form engine is parked**. `<Form.Item>` is antd's again
(`.ant-form-item*` DOM is present on `a-branding` and `p-statistics`), and
`packages/backend.ai-ui/src/form-engine/FormItemVisual.tsx` is dead code today. The **live** shell is
`react/src/components/BAIFormItem.tsx` at **287 call sites**. Deviations that exist only in the parked
BUI copy are scored Low.

| # | What / where | Legacy expected | Current | Class | Sev | Suggested fix |
|---|---|---|---|---|---|---|
| **F-1** | **Required-marker contract flipped, and now two conventions ship together.** `BAIFormItem.tsx:66-76,200-212` vs `origin/main:DefaultProviders.tsx:353-368` | a custom `ConfigProvider.form.requiredMark`: **no asterisk ever**, plus a grey `(Optional)` suffix on non-required labels | `BAIFormItem` hand-renders a red SimSun `*` before every required label and never renders `(Optional)`; `requiredMark` is in `VisualOnlyProps` and silently dropped. **Measured side by side:** `ov2-a-users--create-user-light.png` shows `* Email / * User Name / * Password`; `ov2-a-project--create-project-light.png` (still antd `Form.Item`) shows `Description (optional)` and leaves the required `Name` field **unmarked**. `FolderCreateModalV2`, `OverlayNetworkSettingModal`, `SchedulerSettingModal` mix both in one modal. | **C** | **High** | read `ConfigContext.form.requiredMark` in `BAIFormItemBridge` and render the label through it |
| **F-2** | **`hidden` is a no-op → duplicated visible inputs.** `BAIFormItem.tsx:437-497` | `<Form.Item hidden>` → `display:none` via antd `ItemHolder` | `hidden` falls into `fieldProps` → `<Form.Item hidden noStyle>`, and `noStyle` short-circuits `ItemHolder`, so nothing hides. `FormItemWithUnlimited.tsx:66-81` depends on it — with *Unlimited* checked, the resource-policy modals render **two stacked number inputs**. The parked `form-engine/FormItemVisual.tsx:80,197` already implements it correctly. | **C** | **High** | lift `hidden` into `VisualOnlyProps` and apply `display:none` on the wrapper |
| **F-3** | **`BAITag`: ghost outline chip → solid filled badge.** `BAITag.tsx` | a `ConfigProvider` re-theme forcing `background: transparent`, `color: #999999`, `border-radius: 11px` pill, `paddingInline: 12`, 12px / lh 20 | Astryx `Badge variant={…}` — solid semantic fill, Astryx radius/padding, variant-owned label colour. Every session / agent / vfolder / route / deployment status chip in every table flips from a quiet grey-text outline to a saturated filled pill (`p-data-light.png`: yellow `READY` pills). | **C** | **High** | a `badge` component block pinning `background: transparent; border-radius: 11px; color: …`, or keep an outline wrapper class |
| **F-4** | **Info alerts turned blue.** `BAIAlert.tsx` | `ghostInfoBg` defaulted **true** → `background: colorBgContainer` **#FFFFFF** + `border-color: colorBorder` `#d9d9d9`; the `description={description \|\| ' '}` hack forced antd's with-description box: padding **16px 24px**, message 14px / **weight 500**, icon **22px**; `showIcon` gated the icon | measured: bg **`rgb(196,221,251)`**, border **0**, padding **`12px 16px`**, radius **12px**, text 14px / **weight 400**, icon always shown. Visible on `p-start`, `a-settings`, `pa-users`. In dark mode: `rgba(158,183,255,0.24)`. | **C** + **T** | **High** | restore the ghost-info rule as a `.bai-alert-ghost-info` class (the one live opt-out is `BAIProjectBulkEditModal`); pin title weight / icon size / padding via a `banner` block |
| **F-5** | **`danger` buttons lost their outline and gained a tint; in dark mode they are barely legible.** `BAIButton.tsx:150-156` | antd `danger` with no `type` = **transparent** bg + `1px colorError` border + `colorError` text | measured `variant="destructive"`: bg `--color-error-muted` = `rgba(255,77,79,0.2)` / `rgba(190,61,63,0.247)`, text `--color-error` `#FF4D4F` / **`#be3d3f`**, **`border-width: 0`**. So: the border is gone and a wash appears — and in dark that is `#be3d3f` text on a 25% `#be3d3f` wash over `#141414`, which reads as disabled. See `ov2-p-data--row-delete-confirm-dark.png`: the `Confirm` button on a destructive dialog. 23 call sites, including modal-footer *Reset* (`SettingList.tsx:275`, `FolderCreateModal.tsx:202`). | **C** | **High** | map bare `danger` → a variant that keeps `1px solid var(--color-error)` with a transparent fill; reserve the tinted `destructive` for `type="primary" danger`, and give it an on-error text colour rather than `--color-error` |
| **F-6** | Small controls grew. `BAIButton.tsx:157-160`, `BAISelect.tsx:445-450` | `controlHeightSM` **24px** | `--size-element-sm` **28px** | **T** | Med | closed by **G-8** |
| **F-7** | Helper / extra text. `BAIFormItem.tsx:127-128,229,262` | `.ant-form-item-explain` / `-extra` = `colorTextDescription` `rgba(0,0,0,0.45)` (pinned verbatim in `selfTokens.ts:23`) | `extraColor` = `--color-text-secondary`; and the `help` branch sets **no colour at all**, so help text inherits full-strength body colour | **T** + **C** | Med | set `--bai-form-item-extra-color` to the shim's `colorTextDescription` and apply it to the `help` div too |
| **F-8** | **Checkbox geometry.** `BAICheckbox.tsx` | antd `Checkbox`: **16×16**, 1px `#d9d9d9`, radius `borderRadiusSM` **4px** | measured `astryx-checkbox md`: **24×24**, 1px `#d9d9d9` ✓, radius **6px**. 50% larger — visible on `a-settings` where the toggles now dominate their rows. | **T** / C | Med | a `checkbox` size token, or `size="sm"` at the call sites |
| **F-9** | `BAIBulkEditFormItem.tsx:185-208` — "Keep as is" / "Clear" rows read as editable text fields. | `Input variant="filled"` (`colorFillTertiary` bg, borderless) + a `DownOutlined` suffix at `colorTextQuaternary` — a clearly non-editable affordance | plain outlined `TextInput`, no chevron — indistinguishable from a field the user can type into | **C** / L | Med | render a ghost `BAIButton` or a disabled-looking `Selector` trigger |
| **F-10** | `BAISelect.tsx:442` — multi-select search box disappears. | antd `Select` defaults `showSearch` **true** in `multiple`/`tags` mode | `hasSearch: showSearch !== false && showSearch !== undefined` → an omitted `showSearch` yields `false`, at ~20 `mode="multiple"`/`"tags"` sites | **C** | Med | default `hasSearch` to `true` when `mode` is `multiple` or `tags`. Overlaps sibling **(b)**. |
| **F-11** | `BAISelectionLabel.tsx:47-60` — clear-selection ✕ hit box 16px → 28px (a full `sm` control), widening the selection toolbar row. | bare 16px icon in a 4px-gap span | `IconButton variant="ghost" size="sm"` | **C** / L | Low | accept (a11y win); G-8 brings the box to 24px |
| **F-12** | `SimpleProgressWithLabel.tsx:80-92` — the percent-label row grew ~5px. | `Typography.Text` with `fontSize: 12, lineHeight: '12px'` beside a 12px bar → a 12px row | `<Text type="supporting">` with Astryx's own line-height (~17px) | **C** | Low | restore `lineHeight: '12px'`, or `height: 12` on the row |
| **F-13** | `BAILink.css:20-28` — link hover is a no-op. | `colorLink` → `colorLinkHover` = `palette(seed, 4)`, a visibly lighter step | `--color-text-accent` → `--color-accent`, and `backendAiTheme.ts:585-587` pins **both to the same tuple** — only the underline changes | **T** | Low | point `:hover` at a derived accent-hover token (the shim already computes `colorLinkHover`) |
| **F-14** | `BAICheckbox.tsx:70-90` — node labels flattened to a string. | antd rendered any `ReactNode` inline (links, `<Trans>`) | `nodeToAccessibleLabel(children)` joins text leaves and **drops all markup** | **C** | Low | keep the node in an `endContent` when `children` is not a string |
| **F-15** | `form-engine/FormItemVisual.tsx:196-233` (and the live `BAIFormItem.tsx:312-323`) — multi-line errors over-collapse. | antd measured the explain block's real height and offset by exactly that | a fixed `calc(var(--bai-form-item-margin-bottom) * -1)` = −24px regardless of line count → 2-line errors add ~22px of jump | **C** | Low | `ResizeObserver`, or cap the explain at one line |

**Verified clean:** `BAIFormItem` label→control gap 8px (= `.ant-form-vertical` label `padding-bottom`),
`marginBottom` 24 (= `marginLG`), label 14px, control-input `minHeight: 32` (= `controlHeight`);
`BAIBadge.css:29-36` gap 8px (= `.ant-badge-status-text` margin); `astryxFormControls` `width='100%'`
defaults; every hex literal in this scope is a `var(--token, #fallback)` last-resort argument — **no
mode-blind hardcoded colour renders anywhere in the form/control surface** (`SimpleProgressWithLabel`'s
two `#BFBFBF` were correctly re-routed to `token.colorTextQuaternary`).

---

### 2.6 PER-ROUTE notes

Only routes with something specific beyond the systemic items above.

| Route | Finding | Class | Sev |
|---|---|---|---|
| `/error`, any route-level failure (`RouteErrorContent.tsx:131-137`) | **R-1** Error headline collapsed from `fontSizeHeading3` **24px** (with `letterSpacing -0.015em`, `lineHeight 1.32`) to `Heading level={4}` = **14px** bold. The most important string on the page is now smaller than the body text around it. | **L** (+T via G-3) | **High** |
| `project/:p/admin/*` (`pa-users`, `pa-data`, `pa-session`, `pa-deployments`) | **R-2** The "only items belonging to the currently selected project are shown" notice renders in `main-layout-alert-wrapper` **above** the breadcrumb and full-bleed to the header, so the page's own title row is pushed below a banner that reads as chrome. Combined with F-4 it is a saturated blue band across the top of every project-admin page. See `pa-users-light.png`. | **L** | Med |
| `admin/environment` | **R-3** The `Full image path` column renders **empty** for every row — only the copy-to-clipboard icon is present. See `a-environment-light.png`. Not a token or layout issue. | **C** | Med |
| `admin/settings` | **R-4** The `Display Only Changes` label wraps to two lines and its checkbox is top-aligned against a two-line label. | **L** | Low |
| `admin/settings`, `admin/branding` | **R-5** These are the only two routes still rendering antd DOM (`.ant-form-item*`, `.ant-color-picker-*`) — they carry both engines' type metrics on one screen (antd `line-height: 22px` next to Astryx `20px`, per G-2). Worth prioritising in the antd-remainder plan for that reason alone. | **C** | Low |
| `project/:p/chat` | **R-6** Chat composer. | **F** | — |
| all card-tab pages (`a-environment`, `a-session`, `p-data`, `a-deployments`, …) | **R-7** `BAICard tabList` underline / tab styling. | **F** | — |

**Notably clean:** `p-start`, `p-dashboard`, `a-dashboard`, `p-statistics`, `a-diagnostics`,
`a-information`, `a-maintenance` and `m-unknown` show no route-specific defect beyond the global set —
their layouts, card grids and spacing read as faithful. The `BAIStatistic` segmented gauge
(`bai-statistic-steps`, 20 segments) that looks unusual on the dashboards is **parity**: legacy used the
same `Progress steps={…}` rendering.

---

## 3. Generic sweeps

Four blunt-instrument sweeps that have caught real bugs on this migration before. Results:

| Sweep | Method | Result |
|---|---|---|
| **Mode-blind hardcoded colours** | `git grep -nE "#[0-9A-Fa-f]{3,8}"` over `react/src` + `packages/backend.ai-ui/src` `*.tsx`, then **triage by what actually renders** (inline `style` attributes carrying a hex, measured in-page) | 45 source hits; **all but two are non-rendering** — doc comments, `var(--token, #fallback)` last-resort arguments, or brand-locked marks (`BAINvidiaIcon` `#76B900`, `BAICephIcon` `#EF424D`, the TOTP QR's `#ffffff`/`#000000`, which is a documented decision). The single in-page inline-hex hit on **all 38 routes** is `<html style="--token-colorPrimary:#ff7a00; --token-colorBgBase:#f7f7f6; …">` — the theme-shim writing antd tokens as CSS vars, expected. **Two genuine mode-blind literals remain:** `LogoPreviewer.tsx:107` (`repeating-conic-gradient(#e0e0e0, #f5f5f5)` — a light checkerboard that stays light in dark mode) and `helper/index.tsx:341` (`#ef5350`). Both **Low**, class **C**. |
| **`.ant-*` leftovers in the rendered DOM** | class census across all 38 routes × 2 modes | **`ant-app` on 38/38** (the `App` shim wrapper — harmless). Real antd component DOM survives on exactly **two** routes: `admin/branding` (`ant-color-picker-*`) and `project/:p/statistics` + `admin/branding` (`ant-form-item*`, `ant-row`, `ant-col`). See **R-5**. |
| **Zero-gap `BAIFlex`** | computed `gap: 0` on a flex/grid container whose class implies spacing, with children touching | 12 unique hits, **all false positives** on inspection: `astryx-side-nav` and `astryx-field` use per-item margins rather than container `gap`, which is the Astryx idiom. The historical hole here (four missing `size*` rungs silently flattening ~470 `BAIFlex gap` sites) is **closed** — the spacing ladder measures exact (§2.1 "Verified clean"). |
| **Light surfaces painted in dark mode** (`scan-light-surfaces` logic, re-run per route in dark) | luminance > 0.6 on any element ≥ 900px² while `data-theme=dark` | **0–3 per route, and every one is intentional**: Astryx `Badge` status tints at 24% alpha (`green`, `orange`, `blue`, `yellow`, `warning`), the `--color-skeleton` bar at 18%, and a progress track at 8%. The one that is **not** intentional is `div.astryx-banner.card.info` at `rgba(158,183,255,0.24)` — that is **F-4** again, seen from the dark side. Dark mode is otherwise clean: no white cards, no white text-on-white, no leaked light surfaces. |

Two more sweeps run and worth recording as negative results: **text clipping** (`overflow: hidden`
without `text-overflow: ellipsis` and real overflow) fires on exactly one element — the admin sider
column, which is **S-1**; **vertical misalignment** in `align-items: center` rows fires **zero** times
across all 76 captures.

---

## 4. What did NOT regress

Worth stating explicitly so this catalog is not read as "everything is broken". Measured, not assumed:

- **Spacing ladder** — `--spacing-1..12` = 4 / 8 / 12 / 16 / 20 / 24 / 32 / 48 px. Zero drift against
  antd's `marginXXS…XXL`. This was historically the biggest risk and it is closed.
- **Font-size ladder** — 12 / 14 / 16 / 20 / 24 / 38, with `--font-size-lg` and `--font-size-4xl`
  explicitly pinned. (The *heading* mapping is broken — G-3 — but the underlying scale is right.)
- **Radius primitives** — `--radius-none` 4, `--radius-inner` 6, `--radius-element` 8. Only the
  *container* rung was missed (G-5).
- **Border family** — `#F0F0F0` / `#303030` and `#D9D9D9` / `#424242`, exact.
- **Surface family** — `#FFFFFF` / `#141414`, `#FFFFFF` / `#1F1F1F`, `#F7F7F6` / `#191919`, exact.
- **The dark theme itself** — the toggle drives `data-theme` correctly on every route, and the
  light-surface scan is essentially clean (§3).
- **Header band** — height, padding, both-mode background, and white content, all parity.
- **Table row separators, card border and card elevation** — exact parity.
- **Notification stack geometry** — 384px, 24px inset, bottom-right, hover-pause.
- **Stability** — all 38 routes settle without a skeleton and **zero uncaught page errors** in either
  mode. No route 404s, no error boundaries triggered during the settled sweep.

---

## 5. Implementation gotcha for whoever does the theme work

`defineTheme()` serialises a `[light, dark]` tuple as `light-dark(a, b)`, and CSS `light-dark()`
accepts **colours only** — this is documented at `antdParity.ts:38-45` and confirmed in
`@astryxdesign/core/theme/defineTheme.ts:384-390`, where `resolveTokenValue()` wraps **any** array with
no type-level guard. A tuple on a non-colour token emits invalid CSS and the property **silently falls
back**; that is exactly how the `--shadow-med` bug shipped once.

So every token in this catalog that is **not a colour must be a plain string**:
`--text-*-leading`, `--text-heading-*-size`, `--font-size-*`, `--spacing-*`, `--radius-*`,
`--size-element-*`, `--border-width`, `--duration-*`, `--font-family-*`, `--font-weight-*`, `--ease-*`,
and the `--shadow-*` recipes (which take one string with `light-dark()` at each *colour position*).

This is cheap to honour because none of them are mode-dependent in antd either — `darkAlgorithm`
transforms colours, not the size / radius / duration ladders.

A second trap: tokens the shim reads with `kind: 'raw'` are un-`light-dark()`-ed in JS by
`resolveLightDark()` (`astryxVars.ts:113-148`). A tuple-serialised *length* therefore survives the JS
path and breaks **only** in CSS — invisible to `themeShim.test.ts`, visible only in the rendered page.

Finally: bump `THEME_NAME_REV` (`backendAiTheme.ts:67`, currently `6`) and add any new keys to the hash
array at `:528`. The file documents at `:44-47` that a stale registration otherwise silently masks a
recipe change — the first registration for a given `data-astryx-theme` name wins.

---

## 6. Reproducing this audit

```bash
git reset --hard to-astryx
pnpm install --prefer-offline
pnpm --filter backend.ai-ui build && pnpm --filter backend.ai-client build
cp config.toml.sample config.toml
# .env.development.local at the REPO ROOT (vite envDir = projectRoot, not react/)
#   VITE_DEFAULT_API_ENDPOINT / VITE_DEFAULT_EMAIL / VITE_DEFAULT_PASSWORD
cd react && npx vite --port 5950 --strictPort --host 127.0.0.1

node .scratch/astryx-migration/audit1-login.mjs          # writes audit1-state.json
MODE=light node .scratch/astryx-migration/audit1-sweep.mjs
MODE=dark  node .scratch/astryx-migration/audit1-sweep.mjs
MODE=light node .scratch/astryx-migration/audit1-overlays2.mjs
MODE=dark  node .scratch/astryx-migration/audit1-overlays2.mjs
node .scratch/astryx-migration/audit1-tokens.mjs
node .scratch/astryx-migration/audit1-spot.mjs
```

`audit1-sweep.mjs` waits for skeletons to clear before capturing (up to 30s) — the first pass of this
audit captured 23 of 38 routes mid-skeleton and had to be redone, so keep the settle loop.
`audit1-routes.mjs` and `audit1-collisions.mjs` are the superseded first-pass probes, kept for the
record.

**Secret hygiene.** Credentials live only in gitignored `.env.development.local` files (repo root and
`react/`) and appear in no artefact here. `audit1-login.mjs` writes a Playwright storage state to
`audit1-state.json`, which carries a live `backendaiwebui.sessionid` for the test backend — it is
**deliberately not committed**; re-run `audit1-login.mjs` to regenerate it before the other probes.
`audit1-routes-light.json` from the superseded un-settled first pass was also dropped, since 23 of its
38 routes were captured mid-skeleton and its numbers would mislead.
