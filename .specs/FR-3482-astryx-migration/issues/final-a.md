# final-A — the last app-side antd renders

Step (a) of the antd-zero endgame. Twelve files leave the antd import graph:
the three colour pickers, `InputNumberWithSlider`, the two modals, the five
`FairShareItems` files, and `FontFamilySettingItem`.

Gate delta (`node scripts/migration-gates/antd-import-graph.mjs`):
**direct antd importers 46 → 34.** What is left is the ConfigProvider agent's
(`DefaultProviders`, `MainLayout`, `Theme*Provider`, `index.tsx`, the locale
bundles, `theme-shim/index.tsx`), sibling B's three BUI files, and
`react/src/hooks/reactPaginationQueryOptions.tsx`.

---

## 1. antd `ColorPicker` — a genuine gap, rebuilt as `BAIColorPicker`

`packages/backend.ai-ui/src/components/BAIColorPicker.tsx` (+ `.css`).

Re-checked at the endgame before building anything: `astryx component
ColorPicker` and `astryx component ColorInput` both answer *"No component
named …"*; `astryx search "picker swatch hex"` returns only the Selector
family; the 155-entry `component --list` roster has no colour entry. The
MAPPING NONE grade stands, so the widget is built on the platform's
`<input type="color">` for the colour area plus Astryx chrome (`Popover`,
`TextInput`, `Button`) and the field styling copied from Astryx's own
`Field/inputStyles.stylex.ts`.

It is deliberately not a reimplementation of antd's picker: no HSB canvas, no
preset palettes, no alpha, no format switch. It covers the censused prop slice
of the three live call sites and nothing more — `value`, `onChangeComplete`,
`allowClear` + `onClear`, `showText`, `disabled`, `style`, `data-testid`.

### PILOT-DECISION — the value is a hex STRING on both edges

antd handed `onChangeComplete` a `Color` object and all three call sites
immediately called `.toHexString()` on it; `format="hex"` and
`disabledAlpha: true` existed to force exactly that. Carrying a colour class
across the boundary so every consumer can unwrap it is the antd accident, not
a requirement, so the callback emits `#rrggbb` and the two format props are
gone rather than kept as no-ops. `disabledAlpha` is not *dropped* — alpha
never exists here, which is what those call sites were asking for.

`toHexColor()` (exported) normalises `#rgb`, `#rrggbbaa`, `rgb()` and `rgba()`
into `#rrggbb`, and returns `null` rather than silently painting black for
anything it cannot parse — the swatch then shows its checkerboard, which reads
as "unset".

### PILOT-DECISION — `onChangeComplete` fires on commit, not on drag

antd distinguished `onChange` (live) from `onChangeComplete` (settled) and all
three call sites write a *setting*; a live callback would rebuild the theme on
every pointer move. The native input's `change` event is precisely antd's
"complete" signal, so it is subscribed on the node directly — React's
`onChange` is wired to `input`, which is the live one. The hex field commits
as soon as the typed text is a whole colour, or on Enter.

**Closing the popover commits nothing.** The first cut also committed the
draft on close, as a belt-and-braces path. It was a bug: after `onClear` the
close-commit re-sent the value the user had just cleared, so clearing the
accent silently did nothing. Caught by the live probe (`accent.afterClear`
still read `#00a86b`), not by any gate — lint, tsc and both vitest suites were
green with it in. Both real commit paths have already fired by the time the
popover closes, so the close path is now empty.

### Note — Astryx `Popover` keeps its content mounted

All fourteen Branding popovers are in the DOM at once (`[role="dialog"]` count
= 14 with none open). Nothing to fix, but any locator that reaches into a
popover must filter on `:visible`, and any effect inside popover content runs
whether or not the popover was ever opened.

### i18n

Four keys under `comp:BAIColorPicker` in `packages/backend.ai-ui/src/locale/en.json`
only. BUI's i18next is configured `fallbackLng: 'en'`, so the other 21 bundles
resolve through it until they are translated.

---

## 2. `theme.getDesignToken({ algorithm })` → `getDefaultDesignToken`

`react/src/helper/defaultDesignTokens.ts`, consumed by `ThemeColorPicker`,
`ThemeAccentColorPicker` and `FontFamilySettingItem`.

These three are theme-ALGORITHM *producers*: they do not paint with a token,
they display the value a cleared field falls back to. antd answered that by
running its palette algorithm over its own stock seeds. The theme-shim's
`buildTokens(mode, seeds)` is the same function — step 3 sets each seed token
to `palette(seed, mode)(6)` from the vendored, parity-tested port of
`@ant-design/colors` — so the helper feeds it antd's stock seeds.

Verified bit-identical against the still-installed package (measured, not
assumed):

| token | light | dark |
|---|---|---|
| colorPrimary / colorLink / colorInfo | `#1677ff` | `#1668dc` |
| colorError | `#ff4d4f` | `#dc4446` |
| colorSuccess | `#52c41a` | `#49aa19` |
| colorWarning | `#faad14` | `#d89614` |

Two deliberate differences, both the ratified visual-value policy:

1. **`colorText`** is an `astryx`-verdict token, so it resolves from the live
   cascade (`--color-text-primary`) instead of antd's `rgba(0,0,0,0.88)` /
   `rgba(255,255,255,0.85)`. `mapping.ts` already records this exact drift.
   For a "this is your fallback" swatch, the value the app actually paints is
   the more truthful one.
2. **`fontFamily`** is a seed rather than a derivation, so antd's stock stack
   is stated verbatim in the helper.

`components.Layout.headerBg` is **not** covered — `getDesignToken` never
returned component tokens either (measured: `undefined`), so the Branding
"header background" swatch had no fallback before this change and still has
none.

### Type-only antd imports still count

`ThemeColorPicker` reached `AliasToken` / `ComponentTokenMap` / `ColorPickerProps`
through `import type`. The import-graph gate parses import *specifiers*, so a
type-only one taints the file exactly like a value import. `ThemeConfigPath`
is now built from `keyof ReturnType<typeof getDefaultDesignToken>` — the same
set, reached through the shim's own signature — and the `components.` half
relaxes to `${string}.${string}` (its leaf was already untyped, and the seven
paths are literals at the `BrandingSettingList` call sites). The dead
`extends ColorPickerProps` on the props interface is deleted: the component
destructured `tokenName` and forwarded nothing.

---

## 3. `InputNumberWithSlider` — unparked

Parked in W2-B because two `sliderProps` keys had "no Astryx destination".
Both do. Nothing is dropped.

Per the frontier rule the two prop bags stay antd-SHAPED, restated locally as
`SliderMarks` / `InputNumberBag` / `SliderBag`, so none of the four call sites
(`RuntimeParameterFormSection`, `ClusterModeFormItems`,
`ResourceAllocationFormItems`, `Chat/ChatParametersSliders`) changes.

### RESOLVED — `tooltip.open`

W2-B recorded this as having no Astryx knob. It has one: `valueDisplay`. The
single consumer that passes it (`ResourceAllocationFormItems`, force-hiding
the accelerator tooltip when the image supports no accelerator) passes
`false | undefined` and never `true`, so `open === false → valueDisplay="none"`
covers the live behaviour exactly. A forced-*open* tooltip would still have no
equivalent, and no call site wants one.

### RESOLVED — JSX `marks` labels, via a marks overlay

Astryx `Slider.marks` takes a plain `string` label, and every consumer places
a `<RemainingMark />` (the resources-remaining chevron) at a computed
position. The sibling `BAIDynamicUnitInputNumberWithSlider` degraded those to
`nodeToAccessibleLabel` in W2-D, which for `RemainingMark` means an unlabelled
tick — the chevron disappears.

It did not have to. Astryx's mark geometry is plain and inset-free:
`marksContainer` spans the track container edge to edge, each mark sits at
`inset-inline-start: ${percent}%` with `translateX(-50%)`, and the label sits
`THUMB_SIZE / 2 + 4` below (`@astryxdesign/core/src/Slider/Slider.tsx`). So
node-valued marks render in a second absolutely-positioned layer built from
the **same formula**, over a `position: relative` wrapper.

The split is per-*label*, not per-mark: **every** in-range mark value is still
handed to Astryx so it draws its tick, and only the label rendering diverges.
The overlay is `pointer-events: none`, so dragging the rail underneath is
unaffected.

This is a better outcome than W2-D's, and it is the reusable half: the same
overlay could be lifted into `BAIDynamicUnitInputNumberWithSlider` to restore
the chevron on the memory slider, which today is the one field in the resource
panel that has lost it. **Queued, not done here** — that file is BUI and
outside this partition.

### PILOT-DECISION — per-mark `style` is honoured; `sliderProps.styles` is not

`RuntimeParameterFormSection` tints its max mark with
`{style: {color: colorTextSecondary}}`. A mark rendered in our own layer can
simply take that style, so it is applied. The string-labelled marks Astryx
draws cannot — and Astryx already paints marks in the secondary text colour,
which is what that style asked for.

`sliderProps.styles` was only ever set by this file itself, for
`disableMode="empty"` (hide the thumb and the filled track, leave the muted
rail). Astryx exposes no slot styling at all, so that is a two-line CSS rule
on `.bai-slider--empty` instead: `.astryx-slider-thumb` is a themeable class,
and the filled track is the element immediately after `.astryx-slider-track`
inside the track container. **Both targets verified against the live DOM**
(`.scratch/astryx-migration/final-a-empty-mode.mjs`) rather than assumed —
`trackFound`/`thumbFound` true, and the next sibling is the filled track
(`inset-inline-start: 0%; width: 0%`).

### PILOT-DECISION — the `useUpdatableState` remount hack is deleted

It held a `key` on the `InputNumber` and bumped it once on a `setTimeout(0)`
after mount, under a `FIXME: workaround to fix the issue that the value is not
updated when the value is controlled`. That is an antd `InputNumber` bug.
Astryx's `NumberInput` is a plain controlled native input, so remounting it
fixes nothing and only throws focus away. The same bug is why `onBlur` read
the raw DOM node for its step-snapping; it now reads the controlled value.

### Accessible names

Astryx requires a `label` on `InputGroup` / `NumberInput` / `Slider`; antd
required none. The component takes an optional `label` prop (per the
`NonLinearSlider` precedent, so a call site can name the field it sits under)
and otherwise falls back to one new key, `general.Value`, in
`resources/i18n/en.json`. The app's i18next is `fallbackLng: 'en'`.

---

## 4. FairShareItems — the deliberate `AlertProps` pass-through, closed

The five files kept `extends AlertProps` so the modal could space them. `style`
is the only key any call site passes (`FairShareWeightSettingModal`;
`FairShareList` passes none), measured — so it is restated locally rather than
re-exporting a whole component's props.

`Alert type="warning" showIcon` → Astryx `Banner status="warning"` (Banner
always shows the status icon, so `showIcon` has no counterpart and needs
none). `Banner` is what the surrounding page already uses — the info banner
directly beneath these alerts on the same modal — so this is the
Astryx-canonical composition, not a `BAIAlert` compatibility hop.

The two `*WarningIcon` files take antd `Tooltip title` → Astryx `Tooltip
content`.

---

## 5. `ModelCardDeployModal`

`Alert type="info" showIcon` → `Banner status="info"`.

`Space.Compact` wrapped a **single** child, so it welded nothing together; it
is dropped rather than translated into an `InputGroup`. The antd `Tooltip` +
icon-only `Button` pair collapses into one Astryx `IconButton`, which owns its
tooltip (and keeps the button focusable while disabled, via `aria-disabled`).

---

## 6. `BulkCreateUserFromCSVModal`

`Typography.Text` → `BAIText` — a pure rename, since `BAIText`'s public prop
surface is antd-shaped and every use here (`type`, `italic`, `style`) is on it.

### PILOT-DECISION — the red tooltip surface is dropped

The error cells passed antd `Tooltip color={colorError}` +
`styles={{container: {color: colorWhite}}}`. Astryx `Tooltip` owns its surface
and exposes no colour knob — the inverted media surface is the point of its
design. Nothing is lost semantically: the cell already carries the error in two
other channels, the `colorError` `CircleAlert` icon and the `type="danger"`
text. Confirmed live — the tooltips read *"Invalid email address"*, *"User Name
is required."*, *"At least 1 alphabet, 1 number and 1 special character is
required with at least 8 chars."*

---

## Live verification

Vite on 6001 (6000 is Chromium's blocked X11 port), Playwright, light + dark,
backend `10.82.0.130:8090`. Scripts: `final-a-probe.mjs`, `final-a-modals.mjs`,
`final-a-empty-mode.mjs`. Shots in `shots/final-a/`. **0 pageErrors** across
every route in both schemes.

| claim | evidence |
|---|---|
| pickers render | 14 `BAIColorPicker` triggers on Branding, both schemes |
| a picker opens and picks | popover opens (`:visible` count 1), hex field accepts `#12ab56`, trigger text and swatch follow (`rgb(18, 171, 86)`) |
| theme preview updates | User Settings accent: `--color-accent` `light-dark(#FF7A00, #be5e06)` → `light-dark(#00a86b, #be5e06)` in light, → `light-dark(#FF7A00, #00a86b)` in dark |
| clear works | trigger returns to the family colour: `#ff7a00` (light), `#dc6b03` (dark) |
| theme-algorithm fallback still reads | `FontFamilySettingItem` shows `'Ubuntu', Roboto, sans-serif` |
| slider renders with marks | 3 sliders, 6 Astryx ticks with labels `1` / `7` on the launcher's resources step |
| slider drives its form field | number `1 → 3` moves the thumb to `aria-valuenow=3`; ArrowRight on the thumb moves the field to `4` |
| CSV modal renders and validates | 2 rows loaded / 1 ready / 1 with errors, 4 error icons, `BAIText` danger + masked-password cells |
| a FairShare alert renders | `FairShareWeightSettingModal` opens with its Banners; the Scheduler page's info Banner renders in both schemes |

### Not reachable on this cluster

- **`ModelCardDeployModal`.** The `model-store` project has no models ("No
  models found"), so the drawer that owns the modal cannot be opened. Its two
  mechanisms are exercised elsewhere in the same run: Astryx `Banner` with
  `status`/`title`/`description`/`style` inside a `BAIModal`
  (`FairShareWeightSettingModal`), and Astryx `IconButton` with `tooltip` (the
  Scheduler row's gear). Worth a re-check on a cluster with a populated model
  store.
- **The node-mark overlay.** `RemainingMark` only renders when
  `remaining < max`; on an idle cluster `remaining == max`, and the max mark
  deliberately overwrites the remaining mark at the same key. Covered instead
  by `react/src/components/InputNumberWithSlider.test.tsx` (6 tests): the
  tick/label split, the `33.33%` position from Astryx's own `getPercent`
  formula, above-max filtering, per-mark style, and empty mode. The *pixel*
  agreement between the overlay and Astryx's tick is what still wants a live
  look on a busy cluster.
