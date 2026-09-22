# Research: who consumes `@lablup/ui-common`, and what they touch

Resolves Jira FR-4052 / issue [#9896](https://github.com/lablup/backend.ai-webui/issues/9896)
(wayfinder research, parent map FR-4046).

**Question.** `@lablup/ui-common` (v0.1.0-alpha.19) will replace its 17
home-grown components and its `[data-theme]` token contract with Astryx, which
is a breaking change. An upgrade tool has to migrate existing consumers. Who
are they, and which exports, props, CSS entrypoints, themes and token variables
do they actually use?

**Method.** Primary sources only, at these exact revisions (fetched 2026-09-22):

| Source | Revision | Visibility |
|---|---|---|
| `lablup/ui-common` | `bdf2765` (= `0.1.0-alpha.19` + test-only commit) | public |
| `lablup/backend.ai-go` | `595de6a8f` | private |
| `lablup/continuum-hub` (`webui/`) | `15a27f9bc` | internal |
| `lablup/mlxcel` (`webui/`) | `6f257ab14` | public |
| `lablup/ui-ai` | `b39bf2925` | private |
| `lablup/ui-charts` | `57fdcce34` | private |
| `lablup/all-smi` | `5d3486b5b` | public |
| Astryx | `@astryxdesign/core` 0.5.4 (`pnpm run astryx component --list` in this repo) | — |

How consumers were found: `gh search code "@lablup/ui-common"`, then
`gh search code ui-common --owner lablup --filename package.json`, then the
`all-smi` issue tracker. The npm registry has no dependents index for the
package; npm reports 653 downloads in the last 30 days
(`api.npmjs.org/downloads/point/last-month/@lablup/ui-common`).

How usage was counted: a TypeScript-AST scan (`typescript` 5.9.3
`createSourceFile`) of every `.ts`/`.tsx` file, resolving each
`import … from "@lablup/ui-common…"` binding to its export and counting JSX
elements and attribute names. Test, spec, story and e2e files are excluded from
prop and token counts. Where a consumer routes the package through its own
barrel or wrapper, a second pass counts the call sites behind that seam
("via wrapper"). Token counts are `var(--token-X)` occurrences in CSS/TS/TSX
with comments stripped in CSS, plus quoted `'--token-X'` string references in
JS. The scan scripts are not committed. Numbers are exact for what the scan
matched, and they are lower bounds wherever props arrive through `{...spread}`.

---

## 1. Consumers

| Consumer | Kind | Pinned version | Imports via | CSS entrypoint | Themes it ships over the contract |
|---|---|---|---|---|---|
| **backend.ai-go** | product (Tauri app) | `0.1.0-alpha.7` exact (`package.json:56`) | root barrel `@lablup/ui-common` (834 imports), `/hooks` (7) | **none.** Its own `src/themes/**` define the tokens | 5 families: bliss, glass (+glass-legacy), orange, reverie, stained |
| **continuum-hub** `webui/` | product | `0.1.0-alpha.19` exact (`webui/package.json:25`) | subpaths `…/components/<Name>` and `/hooks`, re-exported through `src/components/common/index.ts` | `styles/base.css`, imported in `src/styles/theme.ts:40` as the underlay | the same 5 families (vendored from backend.ai-go) |
| **mlxcel** `webui/` | product | `0.1.0-alpha.19` exact (`webui/package.json:19`) | subpaths only, confined to 6 adapter files `src/design-system/common-*.tsx` (`docs/webui/ui-common.md`) | `styles/base.css` in `src/main.tsx:17` | mlxcel, glass (`src/design-system/themes/contract.css`) |
| **@lablup/ui-ai** | library | peer `>=0.1.0-alpha.0 <0.2.0`, dev `alpha.0` | root barrel | none (reads tokens only) | none |
| **@lablup/ui-charts** | library | peer `>=0.1.0-alpha.17 <0.2.0`, dev `alpha.18` | subpaths and `/hooks` | none (reads tokens only) | none |
| **all-smi** | *planned*, no code | — | — | — | — |

**all-smi is not a consumer yet.** The ui-common README names it
(`README.md:5-6`), but all-smi is a Rust-only repository with no
`package.json`. The browser Remote View that would consume ui-common is open
issue [lablup/all-smi#304](https://github.com/lablup/all-smi/issues/304)
("add a browser Remote View with @lablup/ui-common"), with the Rust side in
#305. There is no branch or PR for it. If #304 is implemented after the Astryx
release, it can start on the new API and needs no migration.

**Transitive consumers.** backend.ai-go depends on `@lablup/ui-ai@0.1.0-alpha.5`
and continuum-hub on `@lablup/ui-charts@0.1.0-alpha.1`. Both libraries declare a
peer range capped at `<0.2.0`. If the Astryx release is `0.2.0`, it falls
outside both peer ranges, so ui-ai and ui-charts need a coordinated release
before or together with any product upgrade.

**Version skew.** backend.ai-go is still on alpha.7. Everything from alpha.8 to
alpha.19 is additive: the scrollbar tokens, the control-height ladder,
`fontSizeXXL`, `Select`, and new props such as Drawer `preventDismiss`, DataTable
`isRowClickable`, Tooltip `toggleable` and StatCard `labelNode`
(`CHANGELOG.md:8-349`). The tool therefore does not need an alpha.7→alpha.19
step. It does need to accept alpha.7 source as input.

---

## 2. ui-common's public surface (alpha.19)

### 2.1 Entry points (`package.json` `exports`)

- `.` (root barrel `src/index.ts`): all components and hooks.
- `./components/*`: one subpath per component directory. Several also have a
  `default` export: BaseCard, DataTable, ProgressBar, Skeleton and the
  Skeleton* variants, StatusTag.
- `./hooks`: `usePrefersReducedMotion`.
- `./styles/base.css`: the token contract (`:root`) plus global scrollbar rules.
- `./styles/themes/*.css`: ships `orange-light.css` and `orange-dark.css`,
  under `[data-theme="orange-light|dark"]`.
- Each component's CSS is imported by the component (`sideEffects: ["**/*.css"]`).
  Consumers never import it by hand.
- `src/icons/AlertCircleIcon.tsx` is used internally and not exported.

### 2.2 Components, props and Astryx counterparts

These are the 17 component directories (21 component exports). Props come from
the exported `*Props` interfaces. The Astryx column comes from
`pnpm run astryx component --list` (310 entries, 0.5.4) and
`astryx component <Name>`.

| ui-common export | Props (alpha.19) | Astryx 0.5.4 counterpart | Fit |
|---|---|---|---|
| `Button` | children, onClick, onDoubleClick, onMouseDown, onMouseEnter, onKeyDown, type, disabled, variant (`primary\|secondary\|danger\|success\|ghost\|text\|outline`), size (`xsmall\|small\|medium\|large`), shape (`default\|circle`), fullWidth, icon, iconPosition, iconOnly, inline, loading, active, ariaLabel, title, role, id, tabIndex, aria-pressed/checked/selected/expanded/haspopup/controls/describedby/busy, className, style, data-testid; `forwardRef` | `Button` (variant `primary\|secondary\|ghost\|destructive`, size `sm\|md\|lg`, isLoading, isDisabled, isIconOnly, icon, width, label) + `IconButton` | **Direct.** Renames: danger→destructive, loading→isLoading, disabled→isDisabled, iconOnly→isIconOnly, fullWidth→width="100%", size ladder. No success/text/outline variants, no `shape`, `inline` or `active` |
| `Badge` | children, variant (`default\|primary\|success\|warning\|danger\|info`), size (`small\|medium`), className | `Badge` (variant `neutral\|info\|success\|warning\|error\|<hue>`, label, icon) or `Token` (size, color) | **Partial.** Astryx `Badge` is meant for counts and loud status. In this repo, ADR 0007 routes settled values to `Token`, so which one to use depends on the call site |
| `BaseCard` | children, className, style, onClick, onKeyDown, clickable, variant (`default\|installed\|available`), direction, state (`idle\|loading\|active\|disabled\|warning`), hoverable, ariaLabel, role, ariaChecked, tabIndex, testId | `Card` / `ClickableCard` / `SelectableCard` | **Partial.** clickable→ClickableCard, ariaChecked→SelectableCard. `variant`, `state` and `direction` have no counterpart |
| `DataTable<T>` | columns (`DataTableColumn`: id, header, render, minWidth, initialWidth, noResize, alwaysVisible, className, align, sortable, sortValueAccessor, sortComparator, defaultSortDirection), rows, getRowKey, emptyState, loadingState, loading, columnState, onColumnStateChange, className, ariaLabel, testId, onRowClick, isRowClickable, rowClassName, sortColumnId, sortDirection, onSortChange | `Table` + `useTableSortable`, `useTableColumnResize`, column-visibility plugin | **Direct, reshaped.** rows→data, getRowKey→idKey, column {id, render}→{key, renderCell}, widths via `pixel()`/`proportional()`. Row click and persisted `columnState` must be rebuilt on top of plugins |
| `Drawer` | isOpen, onClose, title, subtitle, width (`narrow\|medium\|wide\|string`), children, footer, className, ariaLabelledBy, ariaDescribedBy, closeLabel, preventDismiss, onDismissAttempt | **none in core.** (`Dialog`, `LayoutPanel`, `BottomSheet`; this repo's BUI has `BAIDrawer`) | **None** |
| `EmptyState` | illustration, title, description, primaryAction {label,onClick}, secondaryAction {label,href?,onClick?}, children, className, showIllustration | `EmptyState` (title, description, icon, actions, headingLevel, isCompact) | **Direct.** illustration→icon; action objects must become `actions` ReactNode. `headingLevel` also covers mlxcel's h2 workaround |
| `ErrorState` | tone (`danger\|warning\|accent`), icon, title, message, primaryAction, secondaryAction, className, showIcon | none (`EmptyState` with an icon, or `Banner`) | **None** |
| `PageHeader` | title, description, actions, error, errorDetail, onRetry, retryLabel, onErrorDismiss, className, dismissErrorLabel | none (compose `LayoutHeader`/heading `Text` + `Toolbar` + `Banner`) | **None** |
| `PageLayout` | children, variant (`standard\|wide\|full`), className, + `HTMLAttributes<div>` | `Layout` / `LayoutContent` (inside `AppShell`) | **Partial.** Width variants become layout constraints |
| `ProgressBar` | value, variant (`primary\|success\|error\|warning`), size (`sm\|md\|lg`), showLabel, label, className, animated, ariaLabel | `ProgressBar` (value, max, label, isLabelHidden, hasValueLabel, variant `accent\|success\|warning\|error\|neutral`, isIndeterminate) | **Direct.** primary→accent, showLabel→hasValueLabel, ariaLabel→label+isLabelHidden, `value={null}`→isIndeterminate. No size |
| `Skeleton` | width, height, variant (`rect\|circle\|text`), className, testId, loadingLabel, decorative | `Skeleton` (width, height, radius, index) | **Direct.** circle→radius="rounded". No loadingLabel |
| `SkeletonCard` / `SkeletonText` / `SkeletonChart` / `SkeletonRow` | variant / lines, spacing / variant (`bar\|line\|pie\|area`), height / showAvatar, showActions, count; + className, testId, loadingLabel | none | **None** (compose from `Skeleton`) |
| `SmoothHeight` | active, children, className | none (`Collapsible` is a disclosure widget, not a height animator) | **None** |
| `Select<T>` | value, onChange, onBlur, options (`SelectOption`: value, label, description, icon, disabled), label, placeholder, disabled, size (`small\|default\|medium\|large`), fullWidth, className, searchable, searchPlaceholder, aria-label, aria-describedby, invalid, noOptionsLabel | `Selector` (hasSearch, searchPlaceholder, emptyText, size `sm\|md\|lg`, width, status, isDisabled, isLabelHidden, …) | **Direct.** searchable→hasSearch, noOptionsLabel→emptyText, invalid→status |
| `StatCard` | label, labelNode, value, valueSuffix, hint, icon, tone, trend {direction,label,ariaLabel}, onClick, loading, ariaLabel, className, testId, format, animate, sparkline, emphasis | none | **None** |
| `StatusTag` | state (`running\|preparing\|idle\|busy\|stopping\|terminated\|error`), label, size, pulse, className | `StatusDot` (variant `success\|warning\|error\|accent\|neutral`, label, isPulsing) or `Token` | **Partial.** Needs a fixed map from state to variant. pulse→isPulsing |
| `Tabs` | tabs (`TabItem`: id, label, content, labelExtra, labelPrefix, groupId), groups, defaultTab, activeTab, onTabChange, className, panelClassName, ariaLabel, showOverflowControls, showGroupLabels, overflowMode (`dropdown\|menu`), variant (`underlined\|segmented\|compact`), fillContainer, renderPanel, moreTabsLabel, selectTabLabel, scrollLeftLabel, scrollRightLabel | `TabList`/`Tab` (value, onChange, overflow, layout), `SegmentedControl` for `segmented`, `TabMenu` | **Partial.** Astryx does not render panels, so `content`/`renderPanel` move to the caller. `groups` has no counterpart |
| `Tooltip` | content, children, className, contentClassName, tooltipId, tabIndex, toggleable | `Tooltip` (content, children, placement, delay, touchTrigger, isOpen, …) | **Direct.** toggleable ≈ touchTrigger="tap". No tooltipId or contentClassName |
| `usePrefersReducedMotion` (hook) | — | none exported | **None.** Keep it or inline a `matchMedia` hook |
| `formatCompactNumber` | `(n) => string` | none | **None.** `Intl.NumberFormat({notation:'compact'})` |

Exported types: `BadgeProps`, `BaseCardProps`, `BaseCardVariant`,
`BaseCardState`, `ButtonProps`, `DataTableColumn`, `DataTableProps`,
`DataTablePersistedState`, `SortDirection`, `DrawerProps`, `EmptyStateProps`,
`EmptyStateAction`, `EmptyStateSecondaryAction`, `ErrorStateProps`,
`ErrorTone`, `ErrorAction`, `PageHeaderProps`, `PageLayoutProps`,
`PageLayoutVariant`, `ProgressBarProps`, `ProgressBarVariant`,
`ProgressBarSize`, `SelectOption`, `SelectProps`, `Skeleton*Props`,
`SmoothHeightProps`, `StatCardProps`, `StatCardEmphasis`, `StatCardTone`,
`StatCardTrend`, `StatCardTrendDirection`, `StatusTagProps`, `StatusKind`,
`TabsProps`, `TabItem`, `TabGroupMeta`, `TabOverflowMode`, `TabVariant`,
`TooltipProps`. (`BaseCardDirection` is declared but not re-exported.)

**Scorecard.** 7 exports have a direct Astryx counterpart (Button, DataTable,
EmptyState, ProgressBar, Skeleton, Select, Tooltip). 5 are partial (Badge,
BaseCard, PageLayout, StatusTag, Tabs). 9 component exports and both helpers
have none (Drawer, ErrorState, PageHeader, SmoothHeight, StatCard, and
SkeletonCard/Text/Chart/Row).

### 2.3 The token contract: 122 names, not 119

`README.md:77` and the header of `src/styles/base.css` both say "119
`--token-*` custom properties". That number is stale: `base.css` declares
**122** at alpha.19. Counting the declared names in `base.css` at each release
tag through the GitHub contents API gives 113 at alpha.0-7, 115 at alpha.8
(scrollbar pair), 116 at alpha.9 (`fontSizeXXL`), 119 at alpha.10-18
(control-height ladder), and **122 at alpha.19**. alpha.19 added
`colorTextDisabled`, `colorTextPlaceholder` and `colorPrimaryBgHover` for
`Select` (`CHANGELOG.md:50-53`) but did not update the "119" prose.
`tokenContract.test.ts` only asserts `> 100`, so nothing caught the drift.
backend.ai-go, pinned to alpha.7, was built against the 113-name contract.
`orange-light.css` and `orange-dark.css` each re-set 55 of the 122, all of them
color, shadow, button, focus and tab values.

| Group | Count | Names |
|---|---|---|
| button | 40 | `buttonBorderRadius`, `buttonHoverTransform`, `buttonActiveTransform`, and `button{Primary,Secondary,Danger,Success,Ghost}{Bg,BgHover,BgActive,Border,BorderHover,Shadow,ShadowHover,Backdrop,Text}` (37 of those combinations are declared) |
| color | 33 | antd-v5 names: `colorPrimary*`, `colorSuccess*`, `colorError`, `colorWarning`, `colorInfo`, `colorLink*`, `colorText*`, `colorBg*`, `colorBorder*`, `colorFill*` |
| type | 12 | `fontFamily`, `fontSize{XXS,SM,,LG,XL,XXL}`, `fontSizeHeading1-4`, `fontSizeDisplay4` |
| shape | 11 | `borderRadius{SM,,LG,XL}`, `boxShadow{,Secondary,Tertiary,DrawerRight}`, `controlHeight{SM,,LG}` |
| spacing | 8 | `padding{XXS,XS,SM,,MD,LG,XL}`, `marginXXS` |
| motion | 5 | `motionDuration{Fast,Mid,Slow}`, `themeTransition{Duration,Timing}` |
| focus | 4 | `focusRing{Color,Width,Style,Offset}` |
| z-index | 4 | `zIndex{Drawer,DrawerContent,Popover,Tooltip}` |
| tabs | 3 | `tabActiveBg`, `tabHoverBg`, `tabFocusShadow` |
| scrollbar | 2 | `scrollbarSize`, `scrollbarRadius` |

Component CSS and TSX read 121 of the 122. `fontSizeHeading2` is declared but
no component reads it, because StatCard moved off it in alpha.9.

**Prior art in this repo.** Most of the non-button names follow antd-v5
design-token naming (`colorTextSecondary`, `paddingSM`, `borderRadiusLG`, …).
This repository already has an antd→Astryx token mapping,
`packages/backend.ai-ui/src/theme-shim/mapping.ts`, which covers 99 antd names.
**47 of ui-common's 122 tokens resolve through it today** (e.g. `paddingSM` →
`--spacing-3`, `colorText` → `--color-text-primary`, `borderRadiusLG` →
`--radius-element`). The 75 without a mapping are the 40 button tokens and
35 others: focus ring, z-index, motion, tab, scrollbar, theme transition,
`fontSizeHeading2/XXL/XXS/Display4`, `borderRadiusXL`, three box shadows,
`colorBgMask`, `colorBgTextActive`, and the `colorPrimary*`/`colorSuccess*`
state variants. The full per-token table is in the appendix.

---

## 3. What each consumer uses

### 3.1 Component call sites (JSX elements, non-test)

"direct" counts JSX that imports the package itself. "via wrapper" counts JSX
of the same name imported from the consumer's own barrel or wrapper. That is
`@/components/common[/…]` in backend.ai-go and continuum-hub, and
`design-system/primitives` / `common-*` in mlxcel.

| Export | backend.ai-go direct / via wrapper | continuum-hub direct / via barrel | mlxcel adapter / via adapter | ui-ai | ui-charts | **Total** |
|---|---|---|---|---|---|---|
| Button | 1368 / – | 9 / 425 | 2 / 61 | 5 | 1 | **1871** |
| Badge | 434 / – | 2 / 137 | 1 / 7 | – | – | **581** |
| EmptyState | 1 / 102 | 1 / 114 | 1 / 6 | – | – | **225** |
| Skeleton | 1 / 84 | 1 / 69 | 1 / – | – | – | **156** |
| DataTable | 3 / – | 1 / 47 (+17 `UrlStateDataTable`) | 1 / 1 | – | – | **70** |
| Drawer | 1 / 33 | 1 / 53 | 1 / 2 | – | – | **91** |
| StatusTag | 6 / – | 0 / 99 | 1 / (as `StatusBadge`) | – | – | **106** |
| Select | – (alpha.7 has none; the app has its own) | 1 / 99 | 1 / 17 | – | – | **118** |
| BaseCard | 83 / – | 0 / 29 | 1 / (as `Card`) | – | 1 | **114** |
| StatCard | 24 / – | 1 / 35 | 1 / 2 | – | 1 | **64** |
| PageHeader | 1 / 25 | 1 / 31 | 1 / 8 | – | – | **67** |
| PageLayout | 26 / – | 1 / 32 | 1 / – | – | – | **60** |
| ProgressBar | 27 / – | 0 / 10 | 1 / 5 | – | 1 | **44** |
| Tabs | 1 / 21 | 1 / 11 | 1 / 2 | – | – | **37** |
| Tooltip | 24 / – | 4 / – | 1 / 4 | – | – | **33** |
| ErrorState | 15 / – | – | 1 / (as `ErrorBanner`) | – | – | **16** |
| SkeletonCard | 1 / 15 | 1 / 2 | – | – | – | **19** |
| SmoothHeight | 8 / – | – | 1 / 1 | 1 | – | **11** |
| SkeletonRow | 1 / 8 | 1 / 0 | – | – | – | **10** |
| SkeletonChart | 1 / 5 | 1 / 0 | – | – | 1 | **8** |
| SkeletonText | 1 / 1 | 1 / 2 | – | – | – | **5** |
| `usePrefersReducedMotion` | 7 files | 2 files | – | 1 file | 2 files | 12 files |
| `formatCompactNumber` | 1 file (`src/pages/StatisticsPage.tsx`, 9 calls) | – | – | – | – | 1 file |

Every component export is used by at least one consumer. The 3,706 call sites
counted here include the one wrapper site per wrapped component, so a wrapped
component is counted once more than it is rendered. Button and Badge alone are
66% of the total, and both have direct or near-direct Astryx counterparts. The
no-counterpart components (Drawer, PageHeader, StatCard,
ErrorState, SmoothHeight, the four Skeleton composites) account for about 290
call sites. Nearly all of them sit behind wrappers the consumers already own.

### 3.2 Props actually passed (non-test, direct plus via wrapper)

- **Button.** backend.ai-go (1368): variant 1354, onClick 1349, size 890,
  className 621, disabled 609, ariaLabel 471, title 229, iconOnly 225,
  loading 185, icon 144, inline 66, aria-expanded 59, active 59,
  aria-pressed 48, type 46, data-testid 25, fullWidth 23, ref 22, and 11 rarer
  props. continuum-hub (434): variant, onClick, size 296, loading 126,
  disabled 126, ariaLabel 39, className 26, fullWidth 12, iconOnly 7, icon 7,
  inline 5, shape 2. ui-ai (5): variant, className, onClick, ariaLabel,
  inline, aria-expanded, aria-controls, iconOnly, size, title. mlxcel wraps it
  as `Button{tone,busy}` / `IconButton{label,icon}` and passes
  `inline`/`variant`/`loading`/`ariaLabel`/`aria-busy`/`iconOnly`/`icon`/`title`
  in `common-adapters.tsx`.
- **Badge.** backend.ai-go: variant 434, size 297, className 25. continuum-hub:
  variant 135, size 41, className 2.
- **BaseCard.** backend.ai-go: className 83, ariaLabel 37, onClick 34,
  clickable 28, **state 22**, **direction 14**, role 8, hoverable 7, testId 7,
  onKeyDown 6, **variant 5**, ariaChecked 4, tabIndex 4. continuum-hub:
  className 29, hoverable 18, variant 2. So backend.ai-go uses the three props
  with no Astryx counterpart 41 times.
- **EmptyState.** illustration, title and description on every call (go 102,
  hub 114); primaryAction go 29 / hub 43; showIllustration 6 / 23;
  secondaryAction 1 (hub).
- **Drawer.** go 33: isOpen, onClose, title, width 31, subtitle 18,
  className 15, footer 14, ariaLabelledBy 12, ariaDescribedBy 7. hub 53: plus
  **preventDismiss 30 / onDismissAttempt 30** (the alpha.11 dismissal guard),
  footer 42.
- **DataTable.** hub 47 (+17 UrlStateDataTable): columns, rows, getRowKey,
  ariaLabel on every call; emptyState 42, loading 38, loadingState 24,
  onRowClick 14, isRowClickable 4, persistKey 4 (a hub-local wrapper prop),
  rowClassName 2. go 3: plus onRowClick 3.
- **Select.** hub 99: value/onChange/options on every call, aria-label 73,
  fullWidth 58, label 25, size 23, disabled 12, searchable 8. mlxcel's
  adapter passes label, disabled, invalid, aria-describedby, fullWidth,
  noOptionsLabel and searchPlaceholder.
- **StatusTag.** hub 99: state, label, pulse 41, size 6. go 6: state, label.
- **StatCard.** go 24: label, value, loading on every call; icon 14,
  format 14, animate 14, ariaLabel 14, hint 12, tone 7, emphasis 6,
  sparkline 2, trend 1. hub 35: label, value, loading, tone 21, hint 5.
- **PageHeader.** go 25: title, description 21, actions 16, error 10,
  onErrorDismiss 8. hub 31: plus errorDetail 21, onRetry 21.
- **Tabs.** go 21: tabs, activeTab, onTabChange, ariaLabel, className 19,
  variant 15, **renderPanel 15**, fillContainer 5, panelClassName 5. hub 11:
  variant 8, overflowMode 1.
- **Skeleton.** go 84: height 80, width 66. hub 69: height 64, width 4.
- **Tooltip.** go 24: content, tabIndex 8, className 4, contentClassName 2,
  tooltipId 2. hub 4: toggleable 1, contentClassName 1.
- **ProgressBar.** go 27: value, variant 25, size 22, ariaLabel 18,
  animated 7, showLabel 5. hub 10. ui-charts 1 (value, size, variant, ariaLabel).
- **PageLayout.** variant (go 10 of 26, hub 32 of 32).
- **ErrorState.** go 15: title, message, primaryAction 14, tone 6,
  secondaryAction 2.

### 3.3 Where the imports live

- **backend.ai-go.** 582 non-test files import the package. The largest groups
  are `src/components/Squad` (78), `src/components/common` (46),
  `src/pages/Settings` (29), `src/components/Data` (29) and
  `src/components/ChatInterface` (28). Drawer, EmptyState, PageHeader, Skeleton,
  SkeletonCard and Tabs are wrapped once each, in
  `src/components/common/{Drawer,EmptyState,PageHeader,Skeleton,Tabs}/`, and
  call sites import the wrapper. Everything else (Button, Badge, BaseCard,
  StatCard, Tooltip, PageLayout, ProgressBar, ErrorState) is imported directly
  across the tree. DataTable is imported in `src/components/Models/ModelListTable.tsx`,
  `src/components/Sessions/SessionListTable.tsx` and
  `src/pages/Sessions/SessionsHistoryTab.tsx`. **46 test files** call
  `vi.mock("@lablup/ui-common")`.
- **continuum-hub.** All package imports sit in 22 files, mostly
  `src/components/common/**` (a barrel `index.ts` plus wrappers for DataTable,
  Drawer, EmptyState, PageHeader, Select, Skeleton, StatCard, Tabs). Feature
  code imports `@/components/common` (261 imports). Tooltip is imported
  directly in `src/components/common/Term/Term.tsx` and
  `src/components/fleet/FleetTable.tsx`, and the hook in two
  `src/components/observatory/*Panel.tsx` files.
- **mlxcel.** All package imports are in 6 adapter files
  (`src/design-system/common-{adapters,select,overlays,feedback,layout,data}.tsx`)
  plus the `base.css` import in `src/main.tsx`. This boundary is a documented
  rule (`docs/webui/ui-common.md`). The adapters expose a product-owned API
  (`tone`, `busy`, `body`, `open`), so migrating mlxcel means rewriting those 6
  files and leaving feature code alone.
- **ui-ai.** Uses Button in `src/chat/{ToolResultView,ReasoningBlock,CodeBlock,ToolCallView}.tsx`,
  SmoothHeight in `ReasoningBlock.tsx` and the hook in `StreamingContent.tsx`.
- **ui-charts.** Uses `src/charts/DashboardPanel.tsx` (BaseCard, Button,
  SkeletonChart), `src/charts/TrendStat.tsx` (StatCard, ProgressBar), and the
  hook in `PercentileBandChart.tsx` and `TimeSeriesChart.tsx`.

### 3.4 Tokens: consumers read and define them

| | backend.ai-go | continuum-hub | mlxcel | ui-ai | ui-charts |
|---|---|---|---|---|---|
| `var(--token-*)` reads of ui-common's 122 names (non-test) | **19,845** in 611 files, 78 distinct | **2,360** in 109 files, 64 distinct | 3 (+16 JS string refs), in 2 files | 217 in 7 files, 33 distinct | 210 in 16 files, 25 distinct |
| ui-common token names the consumer **defines** itself | 113 of 122 (962 declarations) | 115 of 122 (793 declarations) | **all 122** (135 declarations) | 0 | 0 |
| ui-common names it does *not* define (supplied by `base.css` or not at all) | boxShadowDrawerRight, buttonPrimaryBackdrop, buttonSuccessBackdrop, colorBgMask, controlHeight{SM,,LG}, scrollbar{Size,Radius}. **No `base.css` import**, so these resolve only through component fallbacks | boxShadowDrawerRight, buttonPrimaryBackdrop, buttonSuccessBackdrop, colorBgMask, marginXXS, scrollbar{Size,Radius}, supplied by the imported `base.css` | — | all (inherits the host's) | all (inherits the host's) |
| Other `--token-*` names in the same namespace, not in ui-common | 198 distinct read (e.g. `marginXS` 1293, `marginMD` 624, `fontFamilyMono` 184) | 86 distinct read | 0 | 11 (`fontFamilyMono`, `colorErrorBorder`, …) | 2 (`borderRadiusPill`, `borderRadiusXS`) |

Most readers already own their tokens. ui-common's contract was extracted from
backend.ai-go's `src/themes/base.css` (`base.css` header), and continuum-hub
vendored the same five theme families. In both products `--token-*` is the
product's own design-token system, and ui-common happens to share its names.
Of the 22,600-odd reads, only about 430 (in ui-ai and ui-charts) rely on
ui-common's contract without the product defining it. **The upgrade tool does
not have to rewrite the products' 22k token reads.** Those keep working as long
as the product keeps its own theme files. What breaks is narrower:

1. **Library reads.** ui-ai (33 tokens) and ui-charts (25 tokens) resolve
   tokens that exist only if the host defines them. Once the host moves to
   Astryx they must either map to Astryx vars or ship a compatibility shim.
2. **Theme authoring.** mlxcel's `src/design-system/themes/contract.css` and
   `common-tokens.css` exist *only* to feed ui-common's 122 names from mlxcel's
   own semantic tokens. After the upgrade those files must feed Astryx's
   variables instead. continuum-hub and backend.ai-go define ui-common names
   inside their per-family theme files, which have 110 `[data-theme="bliss-*"]`
   blocks each, and those files also feed their own components.
3. **Scrollbar/global rules.** continuum-hub and mlxcel get the global
   scrollbar styling from `base.css`, and that goes away with it.

**Namespace collision to watch.** Some product-defined custom properties already
use names that Astryx 0.5.4 declares in `astryx.css`. backend.ai-go defines
`--color-border`, `--color-error`, `--color-success`, `--color-text-primary`,
`--color-text-secondary` and `--color-warning`. continuum-hub defines
`--color-border` and `--color-text-{primary,secondary}`. mlxcel defines
`--color-{error,success,warning}`. When `astryx.css` loads next to these, cascade
order decides which value wins, both for Astryx components and for the
product's own CSS.

### 3.5 DOM coupling: ui-common's BEM class names

The package's class names are unprefixed BEM (`.button`, `.drawer__content`,
`.tabs__tab--active`, 247 selectors across 22 blocks). Consumers target them
directly, and Astryx does not preserve them.

| | backend.ai-go | continuum-hub | mlxcel | ui-charts |
|---|---|---|---|---|
| distinct ui-common classes targeted in CSS | 152, in 44 files | 56, in 21 files | 54, in 5 files (52 in `design-system/common-components.css`) | 1 (`.stat-card__value`) |
| JS DOM hooks (`querySelector`/`closest`/`classList`) on them, non-test | 3 (`.select__dropdown--portal` in 3 `ChatInterface/*Popup.tsx`) | 2 (`.drawer` in `reports/ReportPreviewFrame.tsx:150,201`) | 6: `.empty-state__title` (`common-adapters.tsx:41`), `.select__trigger` (`common-select.tsx:32`), `.drawer` (`common-overlays.tsx:47,62`), `.error-state{,__title}` (`common-feedback.tsx:19,22`) | 0 |
| test files querying those classes | 22 | 19 | 9 | — |

In backend.ai-go most hits are its per-component CSS under
`src/components/common/{Tabs,Select,EmptyState,Drawer,PageHeader,Skeleton}/`,
plus the bliss theme files (24 each). Some of those files style
backend.ai-go's own pre-extraction copies (its local `Select` shares the
`.select__*` names), so 152 is an upper bound. In continuum-hub the hits are
the bliss theme files and `src/styles/shared-contrast.css`. mlxcel's hits are
mostly its adapter stylesheet. These call sites cannot be migrated by
rewriting props. They are why a codemod for this package needs a
"manual-review" report.

### 3.6 Build and test configuration touchpoints

- `server.deps.inline: ['@lablup/ui-common']` in Vitest config appears in
  mlxcel (`webui/vitest.config.ts:11`), continuum-hub
  (`webui/vite.config.ts:99`) and ui-charts (`vite.config.ts:200`).
  backend.ai-go's `vitest.config.ts:23` also special-cases the package path.
  This is needed because components import their own CSS.
- `.npmrc` for GitHub Packages exists in backend.ai-go and continuum-hub/webui.
- mlxcel's `scripts/check-theme-selectors.mjs:59` hard-codes
  `@lablup/ui-common/styles/themes/`, and `theme-stylesheets.test.ts:139`
  asserts `base.css` is the first import.

---

## 4. What this means for the upgrade tool

1. **Scope is four repositories plus two libraries' releases.** Those are
   backend.ai-go, continuum-hub, mlxcel, ui-ai and ui-charts. all-smi has no
   code. ui-ai and ui-charts must publish versions whose peer range admits the
   new ui-common before the products can move.
2. **Most of the work can be mechanical.** About 1,870 Button, 225 EmptyState,
   156 Skeleton, 118 Select, 70 DataTable, 44 ProgressBar and 33 Tooltip call
   sites map to direct Astryx counterparts, and the prop renames are
   enumerable from §2.2. Button alone is 1,368 direct call sites in
   backend.ai-go.
3. **About 290 call sites have no counterpart** (Drawer 91, PageHeader 67,
   StatCard 64, Skeleton composites 42, ErrorState 16, SmoothHeight 11). Each
   consumer already reaches them through wrappers it owns, except backend.ai-go
   for StatCard/ErrorState/SmoothHeight and the hub barrel. That makes a thin
   compatibility component per missing piece more realistic than per-call-site
   rewriting.
4. **Tokens: rewrite reads only in libraries, and rewrite theme bindings in
   products.** Product reads of `--token-*` belong to the products' own token
   systems. The tool should (a) map reads in ui-ai and ui-charts, reusing
   `theme-shim/mapping.ts`, which already covers 47 of the 122 names, and (b)
   convert the theme files that *define* the contract (mlxcel `contract.css`
   and the hub/go family files) into Astryx theme definitions. The 40 button
   tokens and the focus-ring, z-index, motion and tab tokens have no mapping
   yet.
5. **Report, do not rewrite, DOM coupling.** The tool should list the 263
   class-targeting CSS selectors, the 11 JS DOM hooks, the 50 class-querying
   test files and the 46 `vi.mock("@lablup/ui-common")` test files as
   manual-review items.
6. **Fix the published "119".** It should say 122 (`README.md:77`,
   `src/styles/base.css` header). An upgrade tool that validates against "the
   119 names" will miss three.

---

## Appendix: all 122 tokens

Reads = non-test `var()` plus quoted-string references, in the order
backend.ai-go / continuum-hub / mlxcel / ui-ai / ui-charts. "Redefined by" =
consumers whose own CSS declares the name (go, hub, mlx). The last column is
the entry in this repo's `packages/backend.ai-ui/src/theme-shim/mapping.ts`
(verdict and Astryx variable); "—" means no mapping exists.

| # | Token (`--token-*`) | Group | base.css value | Themed in orange-dark | Reads: bai-go / hub / mlxcel / ui-ai / ui-charts | Redefined by | webui `theme-shim/mapping.ts` |
|---|---|---|---|---|---|---|---|
| 1 | borderRadius | shape | `0.375rem` |  | 312 / 48 / 0 / 4 / 0 | go, hub, mlx | `astryx --radius-inner` |
| 2 | borderRadiusLG | shape | `0.5rem` |  | 360 / 33 / 0 / 7 / 4 | go, hub, mlx | `aligned --radius-element` |
| 3 | borderRadiusSM | shape | `0.25rem` |  | 677 / 28 / 0 / 10 / 7 | go, hub, mlx | `astryx --radius-none` |
| 4 | borderRadiusXL | shape | `0.75rem` |  | 29 / 7 / 0 / 0 / 0 | go, hub, mlx | — |
| 5 | boxShadow | shape | `0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1...` | yes | 50 / 15 / 0 / 0 / 0 | go, hub, mlx | — |
| 6 | boxShadowDrawerRight | shape | `-4px 0 20px rgba(0, 0, 0, 0.15)` |  | 4 / 1 / 0 / 0 / 0 | mlx | — |
| 7 | boxShadowSecondary | shape | `0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -...` | yes | 106 / 20 / 0 / 0 / 5 | go, hub, mlx | `aligned --shadow-med` |
| 8 | boxShadowTertiary | shape | `0 1px 3px rgba(0, 0, 0, 0.1)` |  | 10 / 1 / 0 / 0 / 1 | go, hub, mlx | — |
| 9 | buttonActiveTransform | button | `scale(0.97)` |  | 5 / 0 / 2 / 0 / 0 | go, hub, mlx | — |
| 10 | buttonBorderRadius | button | `0.375rem` |  | 9 / 0 / 0 / 0 / 0 | go, hub, mlx | — |
| 11 | buttonDangerBg | button | `transparent` |  | 0 / 0 / 3 / 0 / 0 | go, hub, mlx | — |
| 12 | buttonDangerBgActive | button | `rgba(255, 77, 79, 0.2)` |  | 0 / 0 / 0 / 0 / 0 | go, hub, mlx | — |
| 13 | buttonDangerBgHover | button | `rgba(255, 77, 79, 0.1)` |  | 0 / 0 / 0 / 0 / 0 | go, hub, mlx | — |
| 14 | buttonDangerBorder | button | `1px solid #c82333` |  | 0 / 0 / 0 / 0 / 0 | go, hub, mlx | — |
| 15 | buttonDangerShadow | button | `none` |  | 0 / 0 / 0 / 0 / 0 | go, hub, mlx | — |
| 16 | buttonDangerShadowHover | button | `var(--token-buttonDangerShadow)` |  | 0 / 0 / 0 / 0 / 0 | go, hub, mlx | — |
| 17 | buttonDangerText | button | `#c82333` |  | 0 / 0 / 0 / 0 / 0 | go, hub, mlx | — |
| 18 | buttonGhostBackdrop | button | `none` | yes | 0 / 0 / 0 / 0 / 0 | go, hub, mlx | — |
| 19 | buttonGhostBg | button | `transparent` | yes | 0 / 0 / 0 / 0 / 0 | go, hub, mlx | — |
| 20 | buttonGhostBgActive | button | `#f5f5f5` |  | 0 / 0 / 0 / 0 / 0 | go, hub, mlx | — |
| 21 | buttonGhostBgHover | button | `rgba(255, 122, 0, 0.06)` | yes | 0 / 0 / 0 / 0 / 0 | go, hub, mlx | — |
| 22 | buttonGhostBorder | button | `1px solid transparent` | yes | 0 / 0 / 0 / 0 / 0 | go, hub, mlx | — |
| 23 | buttonGhostBorderHover | button | `1px solid transparent` |  | 0 / 0 / 0 / 0 / 0 | go, hub, mlx | — |
| 24 | buttonGhostShadow | button | `none` | yes | 0 / 0 / 0 / 0 / 0 | go, hub, mlx | — |
| 25 | buttonGhostShadowHover | button | `none` | yes | 0 / 0 / 0 / 0 / 0 | go, hub, mlx | — |
| 26 | buttonHoverTransform | button | `translateY(-1px)` |  | 5 / 0 / 0 / 0 / 0 | go, hub, mlx | — |
| 27 | buttonPrimaryBackdrop | button | `none` |  | 0 / 1 / 0 / 0 / 0 | mlx | — |
| 28 | buttonPrimaryBg | button | `var(--token-colorPrimary)` | yes | 0 / 0 / 5 / 0 / 0 | go, hub, mlx | — |
| 29 | buttonPrimaryBgActive | button | `var(--token-colorPrimaryActive)` |  | 0 / 0 / 0 / 0 / 0 | go, hub, mlx | — |
| 30 | buttonPrimaryBgHover | button | `#e86e00` | yes | 0 / 0 / 0 / 0 / 0 | go, hub, mlx | — |
| 31 | buttonPrimaryBorder | button | `none` | yes | 0 / 0 / 0 / 0 / 0 | go, hub, mlx | — |
| 32 | buttonPrimaryShadow | button | `0 2px 4px rgba(255, 122, 0, 0.2)` | yes | 0 / 0 / 0 / 0 / 0 | go, hub, mlx | — |
| 33 | buttonPrimaryShadowHover | button | `0 4px 8px rgba(255, 122, 0, 0.25)` | yes | 0 / 0 / 0 / 0 / 0 | go, hub, mlx | — |
| 34 | buttonSecondaryBackdrop | button | `none` | yes | 0 / 0 / 2 / 0 / 0 | go, hub, mlx | — |
| 35 | buttonSecondaryBg | button | `transparent` | yes | 0 / 0 / 0 / 0 / 0 | go, hub, mlx | — |
| 36 | buttonSecondaryBgActive | button | `#f5f5f5` |  | 0 / 0 / 0 / 0 / 0 | go, hub, mlx | — |
| 37 | buttonSecondaryBgHover | button | `rgba(255, 122, 0, 0.06)` | yes | 0 / 0 / 0 / 0 / 0 | go, hub, mlx | — |
| 38 | buttonSecondaryBorder | button | `1px solid var(--token-colorBorder)` | yes | 0 / 0 / 0 / 0 / 0 | go, hub, mlx | — |
| 39 | buttonSecondaryBorderHover | button | `1px solid rgba(255, 122, 0, 0.3)` | yes | 0 / 0 / 0 / 0 / 0 | go, hub, mlx | — |
| 40 | buttonSecondaryShadow | button | `none` | yes | 0 / 0 / 0 / 0 / 0 | go, hub, mlx | — |
| 41 | buttonSecondaryShadowHover | button | `0 2px 6px rgba(0, 0, 0, 0.06), inset 0 1px 0 ...` |  | 0 / 0 / 0 / 0 / 0 | go, hub, mlx | — |
| 42 | buttonSuccessBackdrop | button | `none` |  | 0 / 1 / 0 / 0 / 0 | mlx | — |
| 43 | buttonSuccessBg | button | `var(--token-colorSuccess)` | yes | 0 / 0 / 0 / 0 / 0 | go, hub, mlx | — |
| 44 | buttonSuccessBgActive | button | `var(--token-colorSuccessActive)` |  | 0 / 0 / 0 / 0 / 0 | go, hub, mlx | — |
| 45 | buttonSuccessBgHover | button | `#006654` | yes | 0 / 0 / 0 / 0 / 0 | go, hub, mlx | — |
| 46 | buttonSuccessBorder | button | `none` | yes | 0 / 0 / 0 / 0 / 0 | go, hub, mlx | — |
| 47 | buttonSuccessShadow | button | `0 2px 4px rgba(0, 189, 155, 0.2)` | yes | 0 / 0 / 0 / 0 / 0 | go, hub, mlx | — |
| 48 | buttonSuccessShadowHover | button | `var(--token-buttonSuccessShadow)` |  | 0 / 0 / 0 / 0 / 0 | go, hub, mlx | — |
| 49 | colorBgContainer | color | `#ffffff` | yes | 564 / 42 / 2 / 3 / 9 | go, hub, mlx | `astryx --color-background-surface` |
| 50 | colorBgElevated | color | `#ffffff` | yes | 105 / 13 / 0 / 0 / 5 | go, hub, mlx | `astryx --color-background-popover` |
| 51 | colorBgLayout | color | `#f5f5f5` | yes | 188 / 23 / 0 / 1 / 0 | go, hub, mlx | `astryx --color-background-body` |
| 52 | colorBgMask | color | `rgba(0, 0, 0, 0.45)` |  | 2 / 1 / 0 / 0 / 0 | mlx | — |
| 53 | colorBgTextActive | color | `rgba(0, 0, 0, 0.08)` |  | 1 / 1 / 0 / 0 / 0 | go, hub, mlx | — |
| 54 | colorBgTextHover | color | `rgba(0, 0, 0, 0.04)` |  | 47 / 1 / 0 / 0 / 0 | go, hub, mlx | `astryx --color-overlay-hover` |
| 55 | colorBorder | color | `#d9d9d9` | yes | 590 / 40 / 2 / 11 / 19 | go, hub, mlx | `astryx --color-border-emphasized` |
| 56 | colorBorderSecondary | color | `#e5e7eb` | yes | 675 / 87 / 0 / 8 / 9 | go, hub, mlx | `astryx --color-border` |
| 57 | colorError | color | `#c82333` | yes | 560 / 35 / 0 / 10 / 1 | go, hub, mlx | `brand` |
| 58 | colorFillQuaternary | color | `#fafafa` | yes | 145 / 21 / 1 / 3 / 1 | go, hub, mlx | `self` |
| 59 | colorFillSecondary | color | `#f3f4f6` | yes | 422 / 58 / 0 / 5 / 0 | go, hub, mlx | `self` |
| 60 | colorFillTertiary | color | `#f9fafb` | yes | 274 / 25 / 0 / 7 / 6 | go, hub, mlx | `self` |
| 61 | colorInfo | color | `#0066cc` | yes | 53 / 7 / 0 / 8 / 0 | go, hub, mlx | `brand` |
| 62 | colorLink | color | `#ff7a00` | yes | 2 / 2 / 0 / 2 / 0 | go, hub, mlx | `brand` |
| 63 | colorLinkHover | color | `#7c3aed` |  | 1 / 0 / 0 / 2 / 0 | go, hub, mlx | `derive` |
| 64 | colorPrimary | color | `#ff7a00` | yes | 1610 / 115 / 2 / 10 / 9 | go, hub, mlx | `brand` |
| 65 | colorPrimaryActive | color | `#cc6200` | yes | 25 / 12 / 0 / 0 / 0 | go, hub, mlx | — |
| 66 | colorPrimaryBg | color | `rgba(255, 122, 0, 0.1)` | yes | 219 / 12 / 0 / 1 / 0 | go, hub, mlx | `derive` |
| 67 | colorPrimaryBgHover | color | `rgba(255, 122, 0, 0.16)` |  | 14 / 0 / 0 / 0 / 0 | go, hub, mlx | — |
| 68 | colorPrimaryBorder | color | `rgba(255, 122, 0, 0.2)` | yes | 40 / 3 / 0 / 0 / 1 | go, hub, mlx | — |
| 69 | colorSuccess | color | `#007a63` | yes | 346 / 39 / 0 / 4 / 0 | go, hub, mlx | `brand` |
| 70 | colorSuccessActive | color | `#005244` | yes | 4 / 2 / 0 / 4 / 0 | go, hub, mlx | — |
| 71 | colorSuccessBg | color | `rgba(0, 189, 155, 0.05)` | yes | 46 / 3 / 0 / 0 / 0 | go, hub, mlx | — |
| 72 | colorSuccessBorder | color | `rgba(0, 189, 155, 0.4)` | yes | 14 / 2 / 0 / 3 / 0 | go, hub, mlx | — |
| 73 | colorSuccessBorderHover | color | `rgba(0, 189, 155, 0.6)` | yes | 0 / 0 / 0 / 0 / 0 | go, hub, mlx | `derive` |
| 74 | colorSuccessBoxShadow | color | `0 4px 12px rgba(0, 189, 155, 0.15)` | yes | 0 / 0 / 0 / 0 / 0 | go, hub, mlx | — |
| 75 | colorText | color | `#141414` | yes | 1427 / 138 / 0 / 14 / 12 | go, hub, mlx | `astryx --color-text-primary` |
| 76 | colorTextDisabled | color | `#767676` |  | 14 / 1 / 0 / 0 / 0 | go, hub, mlx | `astryx --color-text-disabled` |
| 77 | colorTextPlaceholder | color | `#767676` |  | 19 / 2 / 0 / 0 / 0 | go, hub, mlx | `self` |
| 78 | colorTextQuaternary | color | `#bfbfbf` |  | 105 / 0 / 0 / 0 / 0 | go, hub, mlx | `self` |
| 79 | colorTextSecondary | color | `#595959` | yes | 1262 / 132 / 0 / 11 / 17 | go, hub, mlx | `astryx --color-text-secondary` |
| 80 | colorTextTertiary | color | `#737373` | yes | 747 / 96 / 0 / 10 / 21 | go, hub, mlx | `self` |
| 81 | colorWarning | color | `#9a5d00` | yes | 259 / 30 / 0 / 6 / 6 | go, hub, mlx | `brand` |
| 82 | controlHeight | shape | `2.5rem` |  | 0 / 5 / 0 / 0 / 0 | hub, mlx | `astryx --size-element-md` |
| 83 | controlHeightLG | shape | `2.75rem` |  | 0 / 3 / 0 / 0 / 0 | hub, mlx | — |
| 84 | controlHeightSM | shape | `2rem` |  | 0 / 3 / 0 / 0 / 0 | hub, mlx | `self` |
| 85 | focusRingColor | focus | `#b95b06` | yes | 276 / 13 / 0 / 7 / 0 | go, hub, mlx | — |
| 86 | focusRingOffset | focus | `2px` | yes | 20 / 9 / 0 / 0 / 0 | go, hub, mlx | — |
| 87 | focusRingStyle | focus | `solid` | yes | 23 / 8 / 0 / 0 / 0 | go, hub, mlx | — |
| 88 | focusRingWidth | focus | `2px` | yes | 23 / 11 / 0 / 0 / 0 | go, hub, mlx | — |
| 89 | fontFamily | type | `"Ubuntu Sans", "Pretendard Variable", -apple-...` |  | 19 / 5 / 0 / 0 / 0 | go, hub, mlx | `brand` |
| 90 | fontSize | type | `0.875rem` |  | 1468 / 57 / 0 / 9 / 0 | go, hub, mlx | `astryx --font-size-base` |
| 91 | fontSizeDisplay4 | type | `1.75rem` |  | 10 / 3 / 0 / 0 / 0 | go, hub, mlx | — |
| 92 | fontSizeHeading1 | type | `2rem` |  | 5 / 3 / 0 / 0 / 0 | go, hub, mlx | `aligned --font-size-4xl` |
| 93 | fontSizeHeading2 | type | `1.5rem` |  | 1 / 4 / 0 / 0 / 0 | go, hub, mlx | — |
| 94 | fontSizeHeading3 | type | `1.25rem` |  | 3 / 6 / 0 / 0 / 0 | go, hub, mlx | `astryx --font-size-2xl` |
| 95 | fontSizeHeading4 | type | `1rem` |  | 4 / 11 / 0 / 0 / 1 | go, hub, mlx | `astryx --font-size-xl` |
| 96 | fontSizeLG | type | `1rem` |  | 189 / 19 / 0 / 0 / 0 | go, hub, mlx | `aligned --font-size-lg` |
| 97 | fontSizeSM | type | `0.75rem` |  | 1353 / 195 / 0 / 7 / 22 | go, hub, mlx | `astryx --font-size-sm` |
| 98 | fontSizeXL | type | `1.25rem` |  | 49 / 6 / 0 / 0 / 0 | go, hub, mlx | `astryx --font-size-xl` |
| 99 | fontSizeXXL | type | `1.5rem` |  | 26 / 6 / 0 / 0 / 0 | go, hub, mlx | — |
| 100 | fontSizeXXS | type | `0.5rem` |  | 14 / 2 / 0 / 0 / 0 | go, hub, mlx | — |
| 101 | marginXXS | spacing | `4px` |  | 893 / 1 / 0 / 1 / 0 | go, mlx | `astryx --spacing-1` |
| 102 | motionDurationFast | motion | `0.1s` |  | 1060 / 38 / 0 / 6 / 1 | go, hub, mlx | — |
| 103 | motionDurationMid | motion | `0.2s` |  | 244 / 16 / 0 / 3 / 0 | go, hub, mlx | — |
| 104 | motionDurationSlow | motion | `0.3s` |  | 2 / 1 / 0 / 0 / 0 | go, hub, mlx | `aligned --duration-slow` |
| 105 | padding | spacing | `0.75rem` |  | 85 / 53 / 0 / 10 / 0 | go, hub, mlx | `astryx --spacing-4` |
| 106 | paddingLG | spacing | `1.5rem` |  | 280 / 120 / 0 / 0 / 2 | go, hub, mlx | `astryx --spacing-6` |
| 107 | paddingMD | spacing | `1rem` |  | 770 / 173 / 0 / 0 / 3 | go, hub, mlx | `astryx --spacing-5` |
| 108 | paddingSM | spacing | `0.5rem` |  | 998 / 280 / 0 / 17 / 12 | go, hub, mlx | `astryx --spacing-3` |
| 109 | paddingXL | spacing | `2rem` |  | 71 / 37 / 0 / 0 / 0 | go, hub, mlx | `astryx --spacing-8` |
| 110 | paddingXS | spacing | `0.25rem` |  | 436 / 149 / 0 / 9 / 15 | go, hub, mlx | `astryx --spacing-2` |
| 111 | paddingXXS | spacing | `0.125rem` |  | 130 / 48 / 0 / 4 / 21 | go, hub, mlx | `astryx --spacing-1` |
| 112 | scrollbarRadius | scrollbar | `0.25rem` |  | 0 / 0 / 0 / 0 / 0 | mlx | — |
| 113 | scrollbarSize | scrollbar | `0.5rem` |  | 0 / 0 / 0 / 0 / 0 | mlx | — |
| 114 | tabActiveBg | tabs | `rgba(255, 122, 0, 0.1)` | yes | 6 / 1 / 0 / 0 / 0 | go, hub, mlx | — |
| 115 | tabFocusShadow | tabs | `0 0 0 3px rgba(255, 122, 0, 0.15)` | yes | 4 / 0 / 0 / 0 / 0 | go, hub, mlx | — |
| 116 | tabHoverBg | tabs | `var(--token-colorFillSecondary)` | yes | 1 / 0 / 0 / 0 / 0 | go, hub, mlx | — |
| 117 | themeTransitionDuration | motion | `0.25s` |  | 23 / 14 / 0 / 0 / 0 | go, hub, mlx | — |
| 118 | themeTransitionTiming | motion | `ease-in-out` |  | 22 / 14 / 0 / 0 / 0 | go, hub, mlx | — |
| 119 | zIndexDrawer | z-index | `1100` |  | 3 / 1 / 0 / 0 / 0 | go, hub, mlx | — |
| 120 | zIndexDrawerContent | z-index | `1101` |  | 3 / 2 / 0 / 0 / 0 | go, hub, mlx | — |
| 121 | zIndexPopover | z-index | `1150` |  | 5 / 1 / 0 / 0 / 0 | go, hub, mlx | — |
| 122 | zIndexTooltip | z-index | `1300` |  | 6 / 2 / 0 / 0 / 0 | go, hub, mlx | — |
