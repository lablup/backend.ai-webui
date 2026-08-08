# to-astryx — polish pass 3

Six user-reported items on top of `ac3f7d76d`. Every number below is
**measured** in the running dev build (Playwright + `getComputedStyle`); legacy
targets come from `git show origin/main:<path>` and antd's own token values.

Evidence: `.scratch/astryx-migration/shots/polish-3/` (`before-*` / `after-*`
screenshots, light **and** dark, plus the raw dumps `before.json`,
`before-sider.json` / `after-sider.json`, `before-logo.json` /
`after-logo.json`, `before-start.json` / `after-start.json`,
`after-verify.json`, `after-notification.json`).
Probes: `polish3-diag.mjs`, `polish3-diag2.mjs`, `polish3-sider.mjs`,
`polish3-logo.mjs`, `polish3-start.mjs`, `polish3-notification.mjs`,
`polish3-verify.mjs`. No `pageerror` in any run.

---

## 1. Banner actions live in `endContent`

`Banner`'s own anatomy names the slot: *"Action button — a button for the user
to act on the message"*, rendered by the `endContent` prop ("Action content
rendered in the header area, end-aligned"). Anything action-shaped that was
sitting in `description` (or stacked above it) moves there.

### Census — every `<Banner>` in the app

**71 call sites across 47 files** (`.scratch/astryx-migration/banner-census.py`
— a JSX-aware scan that reads only *top-level* `<Banner>` props, so styling on
nested elements inside `title` / `description` is not miscounted). Grouped by
what they carry:

| group | count | verdict |
|---|---|---|
| title / description only, no action | 58 | nothing to do |
| action **already** in `endContent` | 10 | already correct |
| action in `description` | 3 | **MOVED** → 13 Banners now use `endContent` |
| action-shaped `children` | 0 | — |

Already correct (untouched): `AnnouncementAlert.tsx:45` (the announcement's
Edit button — it was already on `endContent`),
`ComputeSessionNodeItems/VSCodeDesktopConnectionModal.tsx:92` (Retry),
`DeploymentAddRevisionModal.tsx:1526` (Load current revision),
`DeploymentCurrentRevisionTab.tsx:81` (View revision),
`EduAppLauncher.tsx:906` (Refresh page),
`SessionLauncherPreview.tsx:90` (See detail),
`pages/DeploymentDetailPage.tsx:321 / 332 / 361 / 381` (switch project, start
chat test, add revision, add access token).

Moved:

| file | action | was | now |
|---|---|---|---|
| `react/src/components/BAIErrorBoundary.tsx:156` | "Reset error boundary" | first child of the `description` column, above the error dump | `endContent` |
| `react/src/components/EduAppLauncher.tsx:924` | "Open app in new window" (`Link`) | the whole `description` | `endContent` |
| `react/src/components/astryx-bui/BAINotificationStackAstryx.tsx:231` | Cancel / Retry / `toText` link | last row of the `description` `VStack` | `endContent` |

### Ticket 29 PILOT-DECISION 3 — superseded

`29-notification-rewire.md` decision 3 ("Actions moved out of the Banner's
`endContent` into the description column") is now struck through and marked
**SUPERSEDED — POLISH-3 item 1** in the ticket file, with the original
reasoning preserved. The tradeoff it measured is **accepted by the user**, and
it reproduces exactly as ticket 29 recorded it — measured again here on the
same harness (`theme-probe/notification29.html`, background task at 70%):

| | before (ticket 29) | after |
|---|---|---|
| notice box | 384 × 164 | 384 × 164 |
| title box | full content column | `w = 98.88`, **3 wrapped lines** |
| `Cancel` / `View folder` | own row under the message | header end area, `y = 680`, beside the ✕ (`x = 1212`) |

`before-notification-{light,dark}.png` (= ticket 29's
`29-2-progress-*.png`, same harness, same stage) →
`after-notification-{light,dark}.png`.

The `HStack ... wrap="wrap"` the actions already sat in is what absorbs the
narrow width — two buttons stack inside the end area instead of widening the
header. `description` now carries only the description text and the progress
bar; `hasActions` no longer forces a description column into existence.

---

## 2. Banner styling — the default, everywhere

**Answer to the question asked ("is any EXTRA styling applied to Banner
areas?"): essentially no, and the one exception is gone.**

Audited: every `<Banner>` call site's `style` / `xstyle` / `className`, plus
every stylesheet in the repo for a `.astryx-banner*` selector.

- **No app CSS targets `.astryx-banner` at all.** The only `.astryx-banner`
  rules in the tree are in the *generated* theme artifact
  (`react/src/astryx-theme/built/backendai-default-built.css:447-470`,
  `.astryx-banner.info/.success/.warning/.error`), and they come from Astryx's
  own `neutralTheme` base — `backendAiTheme.ts` declares **no** `banner`
  component block. Those are the Astryx defaults, not our styling.
- **`astryxBui.css` has no banner section.** Its `.bai-notification-stack*`
  rules style the *floating stack container* (fixed position at
  `bottom/right: --spacing-6`, 384px width, z-index, enter/exit keyframes) —
  the gap component's positioning, not the Banner's look. Nothing there
  touches padding, colour, radius or border of a Banner.
- **Removed — the one real case.** `AnnouncementAlert.tsx` wrapped its
  markdown title in `<div style={{ marginBottom: token.marginSM * -1 }}>` and
  appended a literal `'<p></p>'` to the message: a negative margin plus a
  dummy paragraph, whose only job was to cancel the bottom margin the markdown
  `<p>` override added *inside Banner's header box*. Both are gone; the
  paragraph override is now plainly `{ margin: 0 }`, so there is nothing to
  compensate. `theme.useToken()` and the `theme-shim` import drop out with it.

  Measured: the announcement Banner's box is **unchanged** — `1312 × 106.58`,
  `padding: 12px 16px` (Banner's own default) before **and** after, in both
  modes. The two hacks exactly cancelled, so removing them is visually
  neutral while returning the header to Banner's untouched padding contract.
  `before-announcement-{light,dark}.png` → `after-announcement-{light,dark}.png`.

- **Retained, with reason — 17 Banner-level `style` props, all layout.** Exactly
  17 of the 71 call sites pass a top-level `style`, and **none** of them sets a
  padding, colour, border, radius or shadow:

  | what | count | where |
  |---|---|---|
  | outer flow margin only (`marginTop` / `marginBottom` / `marginBlock` + `marginInline`) | 15 | `AgentEditorModal` ×2, `Chat/ChatCard` ×2, `Chat/CustomModelForm` ×2, `DeploymentAddRevisionModal` ×2, `DeploymentCurrentRevisionTab`, `EduAppLauncher` ×2, `LoginFormPanel`, `ProjectResourcePolicySettingModal`, `UserResourcePolicySettingModal`, `UserResourcePolicyV2SettingModal` |
  | `flexShrink: 0` | 1 | `BrandingSettingItems/ThemeJsonConfigModal` |
  | `width: '100%'` | 1 | `MyKeypairManagementModal:682` |

  These are *flow spacing / sizing between the banner and its neighbours*
  inside modals that do not lay out with a gap. Removing them would collapse
  those layouts, so they stay — listed here so the coming design pass can fold
  them into parent gaps deliberately rather than by accident.
- **Retained — content styling inside a slot:** `whiteSpace: 'pre-line'` on an
  error detail (`EduAppLauncher`), the `<ul>` reset in `BAIListAlertAstryx`,
  icon sizing in `MyKeypairManagementModal`. Not Banner styling.

No restyling was performed anywhere: the separate design pass is left a clean
default Banner to work from.

---

## 3. Sider — the "Admin Settings" row does not move when the menu flips

**Symptom (user).** The "Admin Settings" item in the normal menu and the
"← 관리자 설정" heading after entering admin mode sit at slightly different
positions, so toggling between the two menus makes the top row appear to jump.

**Measured before** (light, expanded, 1600×1000; identical in dark):

| | general menu — `SideNavItem` "Admin Settings" | admin menu — back-button header |
|---|---|---|
| row border box | `x 8, y 74, 224 × 40` | `x 8, y 72, 224 × 40` |
| row margin | `2px 0px` | `0px` |
| row padding | `0 / 24 / 0 / 24` | `0 / 0 / **4** / 16` |
| icon | `x 32, y 86` | `x 32, y 82` |
| **icon centre y** | **94** | **90** ← 4px high |
| label / heading x | 56 | 56 |

Horizontally the two were already exact (both icons at x=32, both texts at
x=56 — the `paddingInlineStart: 16px` + 32px `IconButton` adds up to the
nav row's `8 + 24 + 16 + 8`). The jump is **vertical**, and it has one cause:
`SIDE_NAV_DENSITY` gives `side-nav-item` **`height: 40px` *and*
`marginBlock: 2px`**; the admin header row copied the height but not the
margin, and carried a 4px `paddingBlockEnd` instead — which shrinks its
content box to 36px, so its centred content sits 2px high inside a box that
itself starts 2px early. 2 + 2 = the 4px the eye reads.

**Fix — level: props + the same theme metric, one call site.**
`react/src/components/MainLayout/WebUISider.tsx` — `paddingBlockEnd:
'var(--spacing-1)'` → `marginBlock: 'var(--spacing-0-5)'` (2px, i.e. exactly
`side-nav-item`'s `marginBlock`). No new number is introduced; the row now
states the menu-row metric rather than an independent one.

**Measured after — the two boxes are identical:**

| | general item | admin header |
|---|---|---|
| row border box | `x 8, y 74, 224 × 40` | `x 8, y 74, 224 × 40` |
| row margin | `2px 0px` | `2px 0px` |
| icon | `x 32, y 86, 16 × 16` | `x 32, y 86, 16 × 16` |
| **icon centre y** | **94** | **94** |
| text x | **56** | **56** ("Admin Settings", 16px/600) |

Same in dark. `before-sider-general-{light,dark}.png` /
`before-sider-admin-{light,dark}.png` →
`after-sider-general-{light,dark}.png` / `after-sider-admin-{light,dark}.png`.

The label's *weight* stays different on purpose (menu row 400/500, admin
header 600) — that is the section-heading treatment ticket 24 chose, and the
report was about position.

---

## 4. Header logo — LEFT-aligned, as legacy had it

**Symptom (user).** The logo is centred in the brand band; legacy deliberately
left-aligned it.

**Legacy** (`git show origin/main:react/src/components/BAISider.tsx`): the band
was a `BAIFlex` with `align={collapsed ? 'center' : 'start'}` and
`padding: collapsed ? undefined : '0 30px'` → the 159px wide-logo sat at
**x = 30** in the 240px rail, and only the collapsed rail centred its mark.

**Root cause.** The conversion expressed "collapsed?" as
`.logo-and-text-container:has(.logo-collapsed:not([hidden]))`. That selector is
true in **both** states: the collapsed mark is always in the DOM — `BAISider`
hides its *wrapper* with `display: none`, and `display: none` is not the
`hidden` attribute — so `:has()` matched permanently and `align-items: center`
applied to every rail.

Measured before (light and dark identical):

| | band | logo |
|---|---|---|
| expanded | `240 × 60`, `align-items: center`, padding-inline `24/24` | `img.logo-wide` **x = 40.5** (centred in the 192px content box) |
| collapsed | `74 × 60`, padding-inline `24/24` | `img.logo-collapsed` **w = 26** — squeezed: its natural 34px + 48px padding is 82px, wider than the 74px rail, so the mark was compressed by 8px |

**Fix — level: app CSS, `.bai-sider--collapsed` (existing sanctioned scope).**
`react/src/components/BAISider.css`:

- default = start (also `align-items`' initial value for the column box), so
  only the collapsed override is stated, keyed off the class `BAISider`
  already puts on the DOM for exactly this reason;
- `.bai-sider--collapsed .logo-and-text-container { align-self: stretch;
  align-items: center; padding-inline: 0 }`. `align-self: stretch` is
  load-bearing: `SideNav`'s collapsed header area is `align-items: center`, so
  dropping the padding would have shrunk the orange band to the mark's 34px
  (caught and fixed mid-pass — see `after-logo-collapsed-*.png`);
- `padding-inline` 24px → 32px (`--spacing-6` → `--spacing-8`). Legacy's inset
  was 30px; 32px is the nearest step on the spacing scale **and** exactly where
  every nav row's icon starts (8px scroll-column pad + 24px `side-nav-item`
  padding), so the brand mark and the menu column now share one optical left
  edge. Recorded rather than silently kept at 24 (6px from legacy).

**Measured after** (light and dark identical):

| | band | logo |
|---|---|---|
| expanded | `240 × 60`, `align-items: normal`, padding-inline `32/32` | `img.logo-wide` **x = 32** (legacy 30) |
| collapsed | `74 × 60` full-width band, `align-items: center`, padding-inline `0/0` | `img.logo-collapsed` **x = 20, w = 34** (natural size, centred) |

`before-logo-{expanded,collapsed}-{light,dark}.png` →
`after-logo-{expanded,collapsed}-{light,dark}.png`.

---

## 5. UserSettings search input fills the row

**Legacy** (`origin/main:react/src/components/SettingList.tsx`): an antd
`<Input prefix={<SearchOutlined/>}>` as the first item of a
`BAIFlex justify="start" gap="xs"` row. antd's `Input` carries `width: 100%`,
so as a flex item it claimed the whole row and shrank to leave room for the
"Display only changes" checkbox and the Reset button — i.e. it *filled the
remaining width*.

**Root cause.** Astryx `TextInput` sizes to its own content box instead.
Measured before, on `/usersettings` at 1600px: field `x 289, w 252` in a
`w 1262` row — a fixed 252px box with `flex-grow: 0; flex-basis: auto`, leaving
~1000px of empty row.

**Fix — level: component prop (Astryx-canonical), one call site.**
`react/src/components/SettingList.tsx` — `width="100%"` on the `TextInput`.
That is TextInput's own prop for this (*"Width of the field … e.g. '100%' …
Sizes the whole field (label, control, and status) so they stay aligned"*), and
it reproduces antd's mechanism exactly: a 100% basis that shrinks against its
siblings.

**Measured after** (identical in dark):

| element | before x / w | after x / w |
|---|---|---|
| search field | 289 / **252** | 289 / **1019.31** |
| "Display only changes" checkbox | — | 1316.31 / 135.69 |
| Reset | — | 1460 / 91 |
| row | 289 / 1262 | 289 / 1262 |

`before-settings-{light,dark}.png` → `after-settings-{light,dark}.png`.

---

## 6. Start page — item typography back to the legacy metrics

`StartPage` itself is byte-identical to `origin/main`; every difference is in
`ActionItemContent`, the board item's card body.

**Measured, legacy vs before vs after** (`Create New Storage Folder` card;
light and dark identical):

| element | legacy (origin/main) | before | after |
|---|---|---|---|
| card title | `Typography.Text strong` @ `token.fontSizeHeading4` = **20px** / 600 | `Text type="large"` = **16px** / 600 | **20px / 600** |
| description | `Typography.Text type="secondary"` @ `token.fontSizeSM` = 12px | `Text type="supporting"` = 12px / 400 | 12px / 400 (unchanged) |
| action button | `height: 40`, label @ `token.fontSizeHeading5` = 16px | `Button` (`md`) = **32px** tall, 14px label | `Button size="lg"` = **36px** tall, 14px label |

**Root cause (title).** `type="large"`'s size token is `--text-large-size` →
`--font-size-lg`, which this theme's `ANTD_ALIGN_TOKENS` pins to antd's
`fontSizeLG` = **16px**. Legacy's card title was `fontSizeHeading4` = 20px,
which is `--font-size-xl` (`1.25rem`, also pinned) — one step up.

**Fix — level: component prop.** `Text type="large" size="xl"
weight="semibold"`. `size` is Text's documented override (*"Explicit font size
override. Overrides the size from `type` but preserves other type
properties"*), so weight, leading and colour role still come from the semantic
type; only the step moves. No raw px, no theme change, no DOM/semantics change
(the title stays an inline `span`, so the existing `style` colour — accent for
user items, info blue for admin items — keeps working).
Measured after: `20px / 600`, line box 28.23px (legacy antd's
`lineHeightHeading4` × 20 = 28).

**Fix — level: component prop (button).** `size="lg"`. Recorded honestly: this
gets the button from 32px to **36px** against legacy's 40px, and does **not**
change the label (Astryx's `md` and `lg` steps share the 14px label, vs
legacy's 16px). Closing the last 4px + 2px would mean a theme override of
`button` `size:lg`, which repaints the eight other deliberate `size="lg"`
buttons in the app (`Page404`, `ForbiddenPage`, `InteractiveLoginPage`, four
session/app modals, `AgentActionButtons`) — strictly worse than the residue.
`lg` is the largest step in a closed enum (P5); the residue stops here.

`before-start-{light,dark}.png` → `after-start-{light,dark}.png`.

---

## Files changed

| file | item |
|---|---|
| `react/src/components/BAIErrorBoundary.tsx` | 1 |
| `react/src/components/EduAppLauncher.tsx` | 1 |
| `react/src/components/astryx-bui/BAINotificationStackAstryx.tsx` | 1 |
| `react/src/components/AnnouncementAlert.tsx` | 2 |
| `react/src/components/MainLayout/WebUISider.tsx` | 3 |
| `react/src/components/BAISider.css` | 4 |
| `react/src/components/SettingList.tsx` | 5 |
| `react/src/components/ActionItemContent.tsx` | 6 |
| `.scratch/astryx-migration/issues/29-notification-rewire.md` | 1 (PILOT-DECISION 3 superseded) |

No theme change, so `THEME_NAME_REV` stays at **5** and the built artifacts are
untouched (`astryx theme build --check` passes inside `verify.sh`). No
`packages/backend.ai-ui` source changed, so no BUI rebuild was required.

## Verification

- `bash scripts/verify.sh` → **`=== ALL PASS ===`** (Relay, Lint, Format,
  TypeScript, Vite warmup paths, StyleX injection sentinel,
  `astryx theme build --check`, Terminology + self-test).
- `react` vitest: **62 files / 1164 tests passed**.
- `packages/backend.ai-ui` vitest: **22 files / 449 passed, 1 skipped**.
- Live probes on the running dev build (light **and** dark): **0 `pageerror`**.
