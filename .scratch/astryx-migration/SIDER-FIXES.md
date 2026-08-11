# Sider polish — five user-reported defects (+ one regression found in verification)

Follow-up to `54f950e05` (sider density via `SIDE_NAV_DENSITY`, toggle-button
overlay slot, live theme toggle). Same working rule as that commit: **land it in
the theme where the theme can express it**; where Astryx exposes no hook, a
minimal scoped override is allowed and must carry its justification in the code.

All five reports reproduced on `to-astryx` against `http://10.82.0.130:8090`.
Evidence: `.scratch/astryx-migration/shots/sider-fixes/before-*.png` /
`after-*.png` (light + dark × expanded + collapsed × general + admin, plus the
toggle's hover and tooltip states). Capture scripts: `sider-shots.mjs`,
`admin-states.mjs`, `tooltip-zoom.mjs`, `collapsed-icons.mjs`.

---

## 1. Toggle button style — **scoped CSS, justified**

**Root cause.** Ticket 24 mapped antd `Button shape="circle" size="small"` onto
Astryx `IconButton size="sm"` and accepted the Astryx look. That look is a 28px
rounded square (`--radius-element`, 8px) on the `secondary` fill — measured
`28×28`, `border-radius: 8px`, `background: rgba(33,26,22,0.1)`, `border: none`.
Legacy was a 24px **circle** on the container surface with a hairline border and
`boxShadow: 'none'` set explicitly. Astryx has no `shape` enum and its size /
radius scales are closed (P5), so none of that is reachable from props.

**Fix level.** Instance-scoped CSS (`.bai-sider-shell button.bai-sider-toggle`
in `react/src/components/BAISider.css`), **not** a theme default.

**Justification.** The only theme knob is
`components: {button: {'variant:secondary+size:sm': …}}`, which emits a bare
`.astryx-button.secondary.sm` — i.e. *every* small secondary button in the app.
Re-shaping the whole button scale to match one floating control would be
strictly wrong. Astryx's own styling policy names this fallback ("component
props first; else style/className with tokens"), and every value is a token:

| antd (legacy) | here |
|---|---|
| `controlHeightSM` = 24px | `24px` (no Astryx size token is 24; `--size-element-sm` is 28) |
| `shape="circle"` → `border-radius: 50%` | `var(--radius-full)` |
| `colorBgContainer` | `var(--color-background-surface)` |
| `colorBorderSecondary` (the `ConfigProvider` override) | `var(--color-border)` |
| `boxShadow: 'none'` | `none` |
| `colorTextTertiary` (icon) | `var(--color-icon-secondary)` |

Hover keeps legacy semantics (antd's default button held its fill and moved
border/text onto the primary hover ramp) → `var(--color-accent)`, not Astryx's
grey overlay fill.

**Measured after:** `24×24`, `border-radius: 9999px`,
`background: rgb(255,251,248)`, `border: 1px solid rgba(33,26,22,0.1)`,
`box-shadow: none`, `color: rgb(81,68,60)`.

---

## 2. Tooltip shortcut → `Kbd` — **component composition + `MediaTheme`**

**Root cause.** `IconButton`'s own `tooltip` prop is a plain `string` (P2), so
ticket 24 folded the shortcut into the label text: the tooltip literally read
`Collapse [`. Legacy rendered it as a key badge
(`BAIText keyboardWithLightBorder`).

**Fix level.** Component — compose Astryx `Tooltip` (whose `content` is a
`ReactNode`) around the `IconButton` and render `<Kbd keys="[" />`.
`placement="end"` is the logical form of antd's `placement="right"`.
`Tooltip` uses a `display: contents` wrapper, so the absolute positioning of the
overlay slot is untouched.

**Second-order finding — `MediaTheme` is required, not decorative.** The tooltip
surface is inverted *by hand*: `useTooltip`'s container hardcodes
`background: var(--color-text-primary)` / `color: var(--color-background-surface)`
but does **not** flip the token context. So a nested component still resolves its
own tokens against the *page* surface. `Kbd` paints itself with
`--color-neutral` on `--color-text-secondary`, which came out as a dark chip on
a dark tooltip — measured `rgba(33,26,22,0.1)` fill / `rgb(81,68,60)` text on a
`rgb(33,26,22)` tooltip, effectively invisible (see
`after-light-tooltip-zoom.png` in the intermediate state). Wrapping the content
in `<MediaTheme mode={mode === 'dark' ? 'light' : 'dark'}>` — Astryx's own
answer for "media overlays, scrims, toasts, **and tooltips**" — flips
`data-astryx-media`, and the theme's `onDark`/`onLight` block (already present in
the built CSS) resolves the badge correctly. `MediaTheme` renders
`display: contents`, so it costs no layout. Mode is the *opposite* of the app's,
because the tooltip surface is.

**Measured after:** light app → chip `rgba(235,224,218,0.2)` on
`rgb(33,26,22)`; dark app → chip `rgba(33,26,22,0.1)` on `rgb(235,224,218)`.
Legible in both.

---

## 3. Section title size / position — **theme where possible, scoped CSS for the bare span**

**Root cause.** Two pieces, and only one is theme-addressable.

`SideNavSection` renders its title as a bare `<span>` inside a bare `<div>`
header — neither carries an `astryx-*` class. `defineTheme({components})` can
only emit `.astryx-<name><variant-classes>`: style keys become **class suffixes
on the element that owns the class** (see the CLI's `parseStyleKey`), never
descendant combinators. `54f950e05` recorded this and deferred the values on the
visual-values policy; the user has now asked for the legacy metrics.

Measured legacy target, derived from antd's own sources:

* `.ant-menu-item-group-title` → `font-size: groupTitleFontSize`, and
  `prepareComponentToken` derives that from the **global** `fontSize` (14px) —
  *not* from `BAIMenu`'s `components.Menu.fontSize = fontSizeLG`, which only
  overrides the item font. So 14px.
* `BAIMenu`'s `createStyles`: `…-group-title div span { font-weight: 500 }` and
  `.expanded …-group-title { padding-left: paddingXL /* 32px */ }`.
* Astryx defaults were `--text-supporting-size` = `0.75rem` = **12px**,
  `--font-weight-semibold` = **600**, `--spacing-2` = 8px → **16px** from the
  rail edge.

**Fix level.**
* **Theme** (`SIDE_NAV_DENSITY`): `side-nav-section` `paddingBlockStart`
  `20px → 16px`. `SideNavSection`'s own header adds `--spacing-1` (4px) on top,
  so 16 here lands on the legacy 20px gap. Bumped `THEME_NAME_REV` 2 → 3 and
  regenerated the built artifacts (the seed hash does **not** cover component
  rules, so without the REV bump the stale built CSS would silently win).
* **Scoped CSS** (`BAISider.css`, `.bai-sider` only): `padding-inline-start:
  var(--spacing-6)` on the header, `font-size: var(--font-size-base)` +
  `font-weight: var(--font-weight-medium)` on the title span. Two rules because
  the two properties live on two boxes — the span *declares* its own font-size
  and weight through StyleX, so inheritance from the header would never reach
  it. StyleX output is single-class (0,1,0); these selectors outrank it, the
  same mechanism the existing `a.astryx-side-nav-item` rules use.

`color` is **not** overridden anywhere: antd's `groupTitleColor`
(`colorTextDescription`) and Astryx's `--color-text-secondary` are the same
role, so the Astryx default stands.

**Measured after:** `14px` / `500` / `x = 32` (was `12px` / `600` / `x = 16`).

---

## 4. Admin back button — **props + spacing tokens**

**Root cause.** Ticket 24 dropped the legacy geometry (`40×42` box,
`marginLeft: token.margin`, `marginBottom: 4`) as "hand-set sizes". Those sizes
were load-bearing: they aligned the back arrow with the menu icons below it.
Without them the button sat at `x = 8` (just the scroll column's padding) while
every nav icon starts at 32 — the arrow was a full 16px to the left of the
column it heads.

**Fix level.** Props + tokens only, no inline pixels:
`HStack gap={0} height={40}` + `paddingInlineStart: var(--spacing-4)` (expanded
only). The arithmetic: `SideNav`'s scroll column contributes 8px,
`SIDE_NAV_DENSITY` gives `side-nav-item` `padding-inline: 24px`, so a row's 16px
icon occupies 32–48 from the rail edge and its label starts at 56. A 32px
(`--size-element-md`) icon button offset by `--spacing-4` puts its glyph at
exactly 32–48, and `gap={0}` puts the heading at exactly 56 — the icon→label gap
becomes the button's own padding rather than a stack gap. `height={40}` restores
the menu-item row height (the same 40px the theme gives `side-nav-item`) without
resizing the button.

Collapsed, the offset is dropped: the 48px rail centers the button itself and
16px of inline padding would push it out of the rail.

**Measured after:** button `x = 24`, `32×32`, glyph 16px → 32–48; heading at 56.
Was `x = 8`.

---

## 5. Model Store icon overflow — **BUI source bug (`iconShim`), not sizing**

**Root cause — not a size prop at all.** `packages/backend.ai-ui/src/icons/iconShim.tsx`
built its inner SVG props as:

```ts
const innerSvgProps = { ...svgBaseProps, className, style, viewBox };
```

Every `BAI*Icon` renders an SVGR component whose generated JSX is
`<svg viewBox="0 0 24 24" … {...props}/>` — the spread comes **last**, so
passing `viewBox: undefined` did not "leave it alone", it **erased the file's
own viewBox** (React omits undefined attributes). Confirmed in the DOM: all
`.anticon` SVGs reported `viewBox: null` while their source files declare one.

Without a viewBox an SVG has no user-unit → CSS-pixel mapping.
`width/height: 1em` still sized the *box* to 16px, but the paths kept drawing at
raw user units, so a 24-unit glyph rendered ~24px inside a 16px box and was
clipped. Model Store is the most visible case because its source is the largest
viewBox of the bespoke set (`0 0 24 24`; siblings are `0 0 17 17` /
`0 0 14 16`) — but **all 51 `BAI*Icon` components were affected**, everywhere in
the app, not just the rail.

antd's own `IconBase` guards exactly this (`if (!viewBox) delete
innerSvgProps.viewBox`); ticket 07's shim dropped the guard.

**Fix level.** BUI source — spread `viewBox` only when supplied. Requires
`pnpm --filter backend.ai-ui build` (done).

**Measured after:** `Sessions → 0 0 14 16`, `My Environments → 0 0 17 17`,
`Deployments → 0 0 17 17`, `Model Store → 0 0 24 24`; all render 16×16 with no
clipping, optically matching the lucide siblings.

---

## 6. (Found while verifying) Collapsed rail lost half its icons — regression from `54f950e05`

Not user-reported, but it is one of the states this change set had to verify, and
it is a regression from the previous sider commit — so it is fixed here.

**Root cause.** `SIDE_NAV_DENSITY` gives `side-nav-item`
`padding-inline: 24px`. That rule is emitted into `@layer astryx-theme`, which by
this project's layer order sits **above** `astryx-base` — where `SideNav`'s
prebuilt StyleX lives, *including its own* `itemCollapsed { padding-inline: 0 }`.
So the expanded density also applied to the 48px collapsed rail: measured
`width: 48px`, `padding: 24px/24px` → a content box of exactly **0px**.

The symptom was selective, which is what hid it: an `<svg>` is a replaced element
whose `min-width: auto` resolves to **0** when it has only a viewBox and no
intrinsic width, so the bare lucide glyphs (Start, Dashboard, Data, Chat,
Statistics, Admin Settings) shrank to zero and **disappeared**, while the
`BAI*Icon` glyphs survived — those sit inside a `<span class="anticon">`, a
non-replaced flex item whose automatic minimum size is its 16px min-content.
Visible in `before-light-collapsed.png` / `before-dark-collapsed.png`.

**Fix level.** Scoped CSS + one class. `BAISider` sets `bai-sider--collapsed`
(Astryx reflects no collapsed state onto the DOM — `themeProps('side-nav')`
carries no `data-*` for it), and `BAISider.css` stands the inline padding back
down for that state. Unlayered app CSS at (0,2,0), so it wins over the theme
layer. The theme keeps owning the expanded density.

**Measured after:** all 10 collapsed rail icons render at 16×16 (was: 6 of 10 at
0×16).

---

## Files touched

| File | Defect(s) | Level |
|---|---|---|
| `packages/backend.ai-ui/src/icons/iconShim.tsx` | 5 | BUI source bug fix |
| `react/src/astryx-theme/backendAiTheme.ts` | 3 | Theme (`SIDE_NAV_DENSITY`, `THEME_NAME_REV` 2→3) |
| `react/src/astryx-theme/built/*` | 3 | Regenerated artifacts (`bai-r2…` → `bai-r3…`) |
| `react/src/components/SiderToggleButton.tsx` | 1, 2 | Component composition |
| `react/src/components/BAISider.css` | 1, 3, 6 | Scoped overrides, justified in-file |
| `react/src/components/BAISider.tsx` | 6 | Collapsed-state class |
| `react/src/components/MainLayout/WebUISider.tsx` | 4 | Props + spacing tokens |

`SWEEP-1.md` row 11 ("Sider group titles … deliberately deferred") is resolved by
defect 3 above.

## Verification

- `pnpm --filter backend.ai-ui build` — clean (required by defect 5).
- `bash scripts/verify.sh` → **`=== ALL PASS ===`** (Relay, Lint, Format,
  TypeScript, Vite warmup, StyleX injection sentinel,
  `astryx theme build --check`, terminology + self-test).
- `react` vitest: **62 files / 1164 tests pass**.
- `packages/backend.ai-ui` vitest: **22 files / 449 pass, 1 skipped**.
- root vitest: **5 files / 104 pass**.
- Screenshots in `.scratch/astryx-migration/shots/sider-fixes/`:
  `{before,after}-light-expanded`, `-light-collapsed`, `-light-admin`,
  `-light-admin-expanded`, `-light-admin-collapsed`, `-light-toggle-hover`,
  `-light-toggle-tooltip`, `-light-tooltip-zoom`, and the `dark-` counterparts.
