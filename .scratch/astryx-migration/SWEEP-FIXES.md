# Sweep fixes — five defects (2 newly user-reported, 3 from the SWEEP-1 backlog)

Follow-up to `fa2e40c5c`. Same working rule as the previous two passes:
**land it in the theme where the theme can express it**; where Astryx exposes
no hook, a minimal scoped override is allowed and must carry its
justification in the code.

Evidence: `.scratch/astryx-migration/shots/sweep-fixes/{before,after}-*.png`
plus `{before,after}-measurements.json`. Capture scripts: `sweep-fixes-shots.mjs`
(A–D), `shot-progressbar.mjs` (E), `diag-cd.mjs` / `diag-d.mjs` / `diag-d2.mjs`
(diagnosis), `antd-neutral-tokens.mjs` (the legacy antd measurement).
Backend: the shared test cluster; credentials come from the environment and
are never committed.

---

## A. Backgrounds turned warm/yellowish ("누리끼리") — **theme tokens**

### Root cause

`defineTheme({ color: { accent } })` runs Astryx's HCT generator over the
accent seed, and that generator derives the **entire neutral ramp** —
backgrounds, surfaces, text, borders — as low-chroma tints of the accent hue.
Astryx's stock theme is blue-accented, which is exactly why its documented
neutrals are cool (`--color-background-body: #F1F4F7`,
`--color-text-primary: #0A1317`). Seed the same machinery with Backend.AI's
brand orange and it emits brown-tinted neutrals. Nothing was broken; the tint
*is* the accent, working as designed.

**The canonical knob was tried first and does not solve it.**
`color.neutralStyle` (`warm | cool | neutral`) was probed by building all
three variants with `astryx theme build`:

| `neutralStyle` | `--color-background-body` |
|---|---|
| (unset — shipped) | `light-dark(#FAEFE9, #180F08)` |
| `cool` | `light-dark(#FAEFE9, #180F08)` — byte-identical |
| `neutral` | `light-dark(#F6EFEC, #15100C)` — still warm |
| accent omitted entirely | `light-dark(#F0F0F6, #101015)` — but the accent ramp collapses to grey |

The accent hue dominates regardless, and dropping `color.accent` would undo
the ticket-02 pilot's measured requirement that the derived accent ramp
follows the brand. So the background family is pinned explicitly. That is
still a THEME-level fix: `defineTheme` documents token overrides as taking
precedence over scale-generated values, and it is the same mechanism
`ANTD_ALIGN_TOKENS` has used since ticket 02.

### The legacy targets (measured, not guessed)

`theme.getDesignToken()` over the shipped `resources/theme.json` seeds,
light + `darkAlgorithm` — `.scratch/astryx-migration/antd-neutral-tokens.mjs`:

| antd token | light | dark |
|---|---|---|
| `colorBgLayout` | `#f5f5f5` | `#000000` |
| `colorBgContainer` | `#ffffff` | `#141414` |
| `colorBgElevated` | `#ffffff` | `#1f1f1f` |
| `colorFillTertiary` | `rgba(0,0,0,0.04)` | `rgba(255,255,255,0.08)` |
| `colorFillSecondary` | `rgba(0,0,0,0.06)` | `#262626` |
| `colorFill` | `rgba(0,0,0,0.15)` | `rgba(255,255,255,0.18)` |
| `colorBgMask` | `rgba(0,0,0,0.45)` | `rgba(0,0,0,0.45)` |

**The page backdrop is the one value that is not simply `colorBgLayout`.**
Legacy `MainLayout` painted its `<Layout>` `backgroundColor: 'transparent'`
(verified in `origin/main`), so what the user actually saw was `<body>`, which
`resources/webui.css` set to `#F7F7F6` and `body.dark-theme { #191919 }`.
Those are the pinned values — they are what the legacy build rendered, and
they keep the boot curtain (which reads `--color-background-body` since
`54f950e05`) identical to legacy too.

Independent cross-check that the surface mapping is right: `theme.json`
declares `Layout.lightSiderBg: #FFF` and `siderBg: #141414`, and the rail is
painted from `--color-background-surface` (`SIDE_NAV_DENSITY`). Pinning
surface to `#FFFFFF`/`#141414` reproduces the legacy sider exactly — and the
measurement below confirms it did.

### Fix

`ANTD_NEUTRAL_SURFACES` in `react/src/astryx-theme/backendAiTheme.ts`, merged
into `defineTheme({tokens})` and folded into the name hash:

| Astryx token | antd source | light | dark |
|---|---|---|---|
| `--color-background-body` | legacy `<body>` (≈ `colorBgLayout`) | `#F7F7F6` | `#191919` |
| `--color-background-surface` | `colorBgContainer` | `#FFFFFF` | `#141414` |
| `--color-background-card` | `colorBgContainer` | `#FFFFFF` | `#141414` |
| `--color-background-popover` | `colorBgElevated` | `#FFFFFF` | `#1F1F1F` |
| `--color-background-muted` | `colorFillTertiary` | `rgba(0,0,0,0.04)` | `rgba(255,255,255,0.08)` |
| `--color-neutral` | `colorFillSecondary` | `rgba(0,0,0,0.06)` | `#262626` |
| `--color-overlay` | `colorBgMask` | `rgba(0,0,0,0.45)` | `rgba(0,0,0,0.45)` |
| `--color-skeleton` | `colorFill` | `rgba(0,0,0,0.15)` | `rgba(255,255,255,0.18)` |

`--color-skeleton` is in scope because the loading skeletons are the first
thing after the boot curtain on every route — squarely inside the reported
symptom ("everything from the loading curtain to the post-login screens").

`THEME_NAME_REV` bumped 3 → 4 and the prebuilt artifacts regenerated
(`bai-r3-…` → `bai-r4-…-h8ey8er`), the stale ones deleted and `built/index.ts`
repointed. Without that, stale built CSS silently wins — the known trap.

The literal `light-dark()` fallbacks in `index.html`'s critical `<style>` and
`resources/webui.css`'s `.splash` were moved to the same pair, so the
pre-theme window matches too.

### Deliberately NOT touched

Brand-accent surfaces are untouched: `--color-accent` and its ramp (verified
still `light-dark(#FF7A00, #be5e06)` in the rebuilt CSS), every
`--color-{status}`, and the `--color-background-{hue}` chips. The
accent-tinted **text / border / icon / track** tokens also stay — they are
either intentionally brand-tinted or so low-alpha the hue is imperceptible,
and re-deriving them is a separate, larger decision.
`--color-background-inverted` stays because antd's counterpart
(`colorBgSpotlight` = `rgba(0,0,0,0.85)` / `#424242`) is *not* an inversion in
dark mode, so adopting it would break the Astryx semantic.

### Measured

| | before | after | legacy target |
|---|---|---|---|
| boot curtain, light | `rgb(250,239,233)` | **`rgb(247,247,246)`** | `#F7F7F6` ✅ |
| body, light (login + 5 routes) | `rgb(250,239,233)` | **`rgb(247,247,246)`** | `#F7F7F6` ✅ |
| body, dark (4 routes) | `rgb(24,15,8)` | **`rgb(25,25,25)`** | `#191919` ✅ |
| sider, light | `rgb(255,251,248)` | **`rgb(255,255,255)`** | `#FFF` (`theme.json lightSiderBg`) ✅ |
| sider, dark | `rgb(33,26,22)` | **`rgb(20,20,20)`** | `#141414` (`theme.json siderBg`) ✅ |
| card, dark | `rgb(33,26,22)` | **`rgb(20,20,20)`** | `#141414` (`colorBgContainer`) ✅ |

Routes sampled in both modes: boot curtain (network-throttled early frame),
login, dashboard, session-launcher, admin→configurations, sessions. No
`pageerror` in either pass.

---

## B. Sider expanded/collapsed widths differed from legacy — **theme + one scoped rule**

### Root cause

Ticket 24 mapped antd `Layout.Sider width={240} collapsedWidth={74}` onto
`SideNav`'s own `260` / `48` under the visual-values policy ("take the Astryx
default"). Measured in `origin/main`:
`react/src/components/BAISider.tsx` → `SIDER_WIDTH = 240`,
`COLLAPSED_SIDER_WIDTH = 74`.

The policy was misapplied. A rail width is not a component *look* — it is a
page-layout metric the app owns, it shifts every route's content column, and
users read the 20px/26px difference immediately.

### Fix

* **Expanded → theme default.** `SIDE_NAV_DENSITY['side-nav'].base.width =
  '240px'`. `SideNav` exposes no `width` prop (its width is StyleX,
  `.x1hfn5x7 { width: 260px }` at specificity (0,5,0)), so the theme layer is
  the only knob — and `@layer astryx-theme` outranks `astryx-base` regardless
  of specificity, the same mechanism the existing density rules rely on.
* **Collapsed → `.bai-sider--collapsed` in `BAISider.css`.** It cannot go in
  the theme: StyleX toggles a *second* width class (`width: var(--spacing-12)`
  = 48px) on the **same** `.astryx-side-nav` element, and
  `components['side-nav']` can only emit `.astryx-side-nav { … }` — which
  would apply to both states and pin the collapsed rail to 240px. Astryx
  reflects no collapsed state onto the DOM, which is exactly why
  `BAISider` already sets `.bai-sider--collapsed` (for the nav-item padding,
  `SIDER-FIXES.md` §6). Same class, same justification, one more property.
* `SIDER_WIDTH` / `COLLAPSED_SIDER_WIDTH` restored to 240 / 74 as the
  documented source of truth.

### Measured

| | before | after | legacy |
|---|---|---|---|
| rail expanded | 260px | **240px** | 240 ✅ |
| rail collapsed | 48px | **74px** | 74 ✅ |

Both `.bai-sider` and the `.bai-sider-shell` wrapper report the same width, so
the `flex-shrink: 0` contract still holds. No label truncation at 240px
(`after-rail-expanded-{light,dark}.png`); all collapsed icons still render
centred in the 74px rail (`after-rail-collapsed-light.png`).

---

## C. Session-launcher "Next" / "Skip to review" — **Astryx Button slot API**

### Root cause

Both buttons passed the label **and** the trailing chevron as `children`:

```tsx
<Button variant="secondary" label={t('button.Next')} …>
  {t('button.Next')} <ChevronRight size="1em" />
</Button>
```

Astryx `Button` lays out three slots — `icon | label | endContent` — and
renders `children` **inside the label slot**, which is a truncating text span.
Measured DOM before the fix:

```html
<span class="xjp7ctv"><span class="xb3r6kr xlyipyv xeuugli">Next <svg …/></span></span>
```

An `<svg>` is an inline replaced element inside that span, so it broke onto a
second line inside a 32px-tall button — the chevron rendered below the word.
The sibling "Previous" button in the same footer already used the `icon` prop
correctly, which is what made these two the outliers.

Secondary cause of "reads as disabled": legacy had **two** emphasis levels
(Next = `type="primary" ghost`, Skip = plain default). The migration put both
on `secondary`, collapsing them into two identical grey blocks. Astryx's
variant enum is closed and has no outlined-primary, so the recorded
PILOT-DECISION (`primary ghost` → `secondary`) stands for Next; Skip moves to
`ghost` to restore the ordering.

### Fix

`endContent={<ChevronRight size="1em" />}` (the documented slot for "trailing
icon or badge", colour inherited from the variant) with the children removed;
`variant="ghost"` on Skip.

### Measured / verified

* Before: `Next` box `55×32` with the glyph clipped onto a second line;
  both buttons `rgba(33,26,22,0.1)`.
* After: `Next` `77×32`, chevron inline; `Skip to review` `138×32` on a
  transparent ghost fill. `{before,after}-launcher-footer-{light,dark}.png`.
* **Still works** — clicked through live:
  `Session Type → Environments & Resource Allocation` (Next), then
  `→ Confirm and Launch` (Skip to review), with the `Launch` button visible.

---

## D. Admin → Configurations booleans read as "plain gray squares" — **composition**

### Root cause — *not* what the report assumed

The report ("should be switches") and the SWEEP-1 row ("antd `Switch` under
the Astryx cascade, or a `Switch` → Astryx mapping that never landed") are
both wrong about the control. **Legacy was a checkbox, not a switch**:
`origin/main`'s `SettingItem.tsx` renders antd `<Checkbox>` for
`type === 'checkbox'`, and every boolean row in `ConfigurationsSettingList`
declares `type: 'checkbox'` — in `origin/main` and on this branch alike. No
`Switch` exists on this page in either version.

The Astryx `CheckboxInput` is also rendering correctly. Measured live:
`24×24`, `border-radius: 6px`, `1px solid`, enabled fill `#FFFFFF`, disabled
fill `rgba(0,0,0,0.04)` — and its `value` / `isDisabled` binding is correct
(every plugin row is legitimately `disabled`, as in legacy: these are
read-only capability indicators).

The actual defect is **layout**. Ticket 22's `SettingItem` wrapped the control
and its description in `BAIFlex direction="column"`, so the box sat alone on
its own line between the row title and the description text. antd rendered
`<Checkbox>{description}</Checkbox>` — box and text on one line. Stripped of
its adjacent label, a 24px box between two paragraphs reads as an anonymous
grey square, which is exactly what was reported.

### Fix

`direction="row" gap="sm" align="start"` on that wrapper. `align="start"`
reproduces antd's `.ant-checkbox { align-self: flex-start }` so the box stays
on the first text line when the description wraps. The `isLabelHidden`
PILOT-DECISION (rich-JSX description can't go in the string-only `label` prop)
is unchanged and still documented in place.

### Measured / verified

* `rowFlexDirection: "row"`, `sameLineAsDescription: true` for every plugin
  row (was `column`, box on its own line).
* Checkbox visuals unchanged and correct: `24x24`, `radius 6px`,
  `1px solid rgba(25,28,34,0.1)`, fill `rgba(0,0,0,0.04)` when disabled.
* **Binding round-trips** — toggled the "Display Only Changes" filter
  (client-side only, no config mutation persisted):
  `false → true → false`. No harmful setting was written.

---

## E. Mode-blind hardcodes — **shim token + Astryx token**

| file | was | now | why |
|---|---|---|---|
| `SimpleProgressWithLabel.tsx` (×2) | `#BFBFBF` | `token.colorTextQuaternary` | `#BFBFBF` **is** antd's `colorTextQuaternary` — `rgba(0,0,0,0.25)` composited on white. The theme-shim carries that token verbatim (`selfTokens`, verdict `'self'`) as a `[light, dark]` pair, so light mode is pixel-identical to legacy and dark gets `rgba(255,255,255,0.25)`. The file already imports `theme` from the shim. |
| `AssignRoleModal.tsx` | `#999` | `var(--color-text-secondary)` | antd's secondary/description grey; the Astryx token is the same role and is mode-aware. |

`--color-track` was considered for the progress bars and rejected: it is
Astryx's *slider/progress rail* token, and forcing it to 25% alpha to satisfy
one filled bar would darken every rail in the app.

### Measured

No element in the app resolves `rgb(191,191,191)` any more. The bars report
`rgba(0,0,0,0.25)` in light and `rgba(255,255,255,0.25)` in dark
(`after-progressbar-{light,dark}.png`).

---

## Files touched

| File | Defect(s) | Level |
|---|---|---|
| `react/src/astryx-theme/backendAiTheme.ts` | A, B | Theme (`ANTD_NEUTRAL_SURFACES`, `side-nav.width`, `THEME_NAME_REV` 3→4) |
| `react/src/astryx-theme/built/*` | A, B | Regenerated artifacts (`bai-r3…` → `bai-r4…-h8ey8er`) |
| `index.html`, `resources/webui.css` | A | Boot-curtain literal fallbacks realigned to the token |
| `react/src/components/BAISider.css` | B | Scoped `.bai-sider--collapsed` width, justified in-file |
| `react/src/components/BAISider.tsx` | B | Restored `SIDER_WIDTH` / `COLLAPSED_SIDER_WIDTH`, header note |
| `react/src/pages/SessionLauncherPage.tsx` | C | Astryx Button `endContent` slot + variant hierarchy |
| `react/src/components/SettingItem.tsx` | D | Row composition |
| `react/src/components/SimpleProgressWithLabel.tsx` | E | Shim token |
| `react/src/components/AssignRoleModal.tsx` | E | Astryx token |

`packages/backend.ai-ui` was **not** modified by this change set, so no BUI
rebuild is required.

## Verification

- `bash scripts/verify.sh` → **`=== ALL PASS ===`** (Relay, Lint, Format,
  TypeScript, Vite warmup, StyleX injection sentinel,
  `astryx theme build --check`, terminology + self-test).
- `react` vitest: **62 files / 1164 tests pass**.
- `packages/backend.ai-ui` vitest: **22 files / 449 pass, 1 skipped**.
- Live: no `pageerror` on any swept route in either mode.

## Follow-ups left open (unchanged from SWEEP-1)

Rows 5–10, 12, 13 of `SWEEP-1.md` are untouched by this pass. Two of them are
now *easier* to judge against a neutral background — #5 (info `Alert`s paint
antd's cool blue) no longer clashes with a warm surface, and #7/#8 (table
header rows cool-grey against warm cards) should be re-checked, since the
warm/cool mismatch that motivated them is gone.

---

## Superseded by POLISH-2

A later pass (`POLISH-2.md`) closed **SWEEP-1 row 5** — resolved as
*sanctioned*, not fixed: the info `Alert`'s cool blue IS the legacy applied
`colorInfo` (`#028DF2` / `#0387bf` from `resources/theme.json`), and `info` is
now a declared brand seed of the theme recipe. Astryx ships no `--color-info*`
token to pin, so there is nothing further to do there.

That pass also touched the theme recipe (`THEME_NAME_REV` 4 → 5: neutral BORDER
family + status ON-colours pinned to the legacy antd values) and did require a
`packages/backend.ai-ui` rebuild, unlike this change set. See `POLISH-2.md`.
