---
name: react-layout
description: >
  Use when laying out a page, card header, or action row with `BAIFlex`,
  choosing spacing values, or building a responsive grid. Covers gap token
  scale, `token.*` spacing, `BAICard` extra alignment, Astryx `Grid`, and
  `useBAIBreakpoint`.
---

# Layout & Spacing

This repo uses **`BAIFlex`** for every flex-based layout and **theme tokens**
for every spacing value. Hard-coded pixels and `<Space direction="…">` have
been actively removed across 2025.

## Activation Triggers

- Writing any JSX that arranges children horizontally/vertically
- Padding / margin decisions in a component
- Card header with `extra` that looks misaligned
- Responsive grid for dashboard-like pages
- Porting a leftover `<Row>/<Col>` or `Grid.useBreakpoint()` site

## Gotchas

- **`BAIFlex` `gap` string tokens** resolve via `(token as any)['size' + 'XS'.toUpperCase()]`. If a custom theme doesn't define `sizeXS`/`sizeMD`/etc., gap silently collapses to `'0px'`. Verify the theme when customizing.
- **`BAIFlex` does not always stretch children by default.** Effective `alignItems` comes from `align` (default: `center`) and can also be overridden by `style.alignItems`. Use `align="stretch"` when column-direction layouts should stretch their children.
- **`justify="between"` / `"around"`** are BAIFlex shorthands for `space-between` / `space-around`. Passing raw CSS values doesn't work.
- **`Space` is gone.** Grouped controls are Astryx `ButtonGroup` (buttons) or `InputGroup` (input + addon) — the old `Space.Compact` idiom. Everything else is `BAIFlex`.
- **Hardcoded px breaks theming.** Admin primary colors (FR-1785 #4816) and dark mode rely on tokens. `padding: 8` compiles but diverges visually across themes.
- **`antd-style` / `createStyles` are gone (to-astryx ticket 33).** Prefer inline `style={{ padding: token.paddingSM }}` when tokens suffice; for pseudo-class / descendant selectors, add a co-located `.css` file next to the component and import it there (P17).
- **Table overflow is no longer your problem — and `scroll` is a no-op.** Astryx's own scroll wrapper owns horizontal overflow inside `BAITableAstryx`, so `scroll={{ x: 'max-content' }}` is accepted and ignored. Don't add it to new tables; see `react-relay-table`.
- **Responsive layout is CSS-side, not viewport-keyed props.** Reach for Astryx `Grid columns={{ minWidth, max }}` first; only use `useBAIBreakpoint()` when the branch is genuinely JS logic. See `.scratch/astryx-migration/RESPONSIVE-POLICY.md` for the recipes and the `minWidth` sizing table.

## 1. `BAIFlex` is the layout primitive

### 1.1 API cheat sheet

```tsx
import { BAIFlex } from 'backend.ai-ui';

<BAIFlex
  direction="column"       // 'row' (default) | 'row-reverse' | 'column' | 'column-reverse'
  gap="sm"                 // token-size string or a number (px) or a [rowGap, colGap] tuple
  align="stretch"          // 'start' | 'end' | 'center' | 'baseline' | 'stretch'
  justify="between"        // 'start' | 'end' | 'center' | 'between' | 'around'
  wrap="wrap"              // 'nowrap' (default) | 'wrap' | 'wrap-reverse'
>
  {children}
</BAIFlex>
```

### 1.2 Gap token scale

`gap` accepts the theme's `size*` tokens as strings:

| `gap` value | Token | Typical |
|---|---|---|
| `'xxs'` | `token.sizeXXS` | 4px |
| `'xs'`  | `token.sizeXS`  | 8px |
| `'sm'`  | `token.sizeSM`  | 12px |
| `'ms'`  | `token.sizeMS`  | 16px |
| `'md'`  | `token.sizeMD`  | 20px |
| `'lg'`  | `token.sizeLG`  | 24px |
| `'xl'`  | `token.sizeXL`  | 32px |
| `'xxl'` | `token.sizeXXL` | 48px |

Numeric `gap` (e.g. `gap={10}`) is legal but should be rare — prefer tokens.

```tsx
// ✅ token-sized gaps
<BAIFlex direction="column" gap="sm">…</BAIFlex>
<BAIFlex justify="between" align="start" gap="xs" wrap="wrap">…</BAIFlex>

// ✅ asymmetric row/column gap (tuple)
<BAIFlex wrap="wrap" gap={['sm', 'md']}>…</BAIFlex>

// ⚠️ Avoid unless you have a specific px target
<BAIFlex gap={10}>…</BAIFlex>
```

### 1.3 `BAIFlex` vs the Astryx primitives

| Use | When |
|---|---|
| `BAIFlex` | Always, by default |
| `HStack` / `VStack` (Astryx) | Inside BUI components that already sit on Astryx primitives, where pulling in `BAIFlex` would be circular |
| `ButtonGroup` / `InputGroup` (Astryx) | Visually *joined* controls — a button + dropdown, or an input + addon. This is the old `Space.Compact` idiom |

`Space` and antd's `Flex` no longer exist. FR-1326 (#4065) deduplicated the old
internal `Flex` component into `BAIFlex` from `backend.ai-ui`; FR-1331 (#4070)
added tests for it — the public API is stable and safe to extend.

## 2. Spacing values come from `theme.useToken()`

`theme` comes from the **theme shim** — a drop-in for what antd used to
provide, returning the same `{ token, hashId, theme }` shape but backed by
Astryx tokens. Import it from the alias module, same as `form-engine`:

```tsx
import { theme } from '../theme-shim';   // react/src/**
import { theme } from 'backend.ai-ui';   // BUI re-exports it too

const { token } = theme.useToken();

<div style={{
  padding: token.paddingSM,
  marginTop: token.marginXS,
  background: token.colorBgContainer,
}} />
```

Common tokens used in this repo:

- `token.paddingXXS | paddingXS | paddingSM | padding | paddingMD | paddingLG`
- `token.marginXXS | marginXS | marginSM | margin | marginMD | marginLG`
- `token.size*` (for gap / flex)

Never hard-code values like `padding: 8`, `margin: '0 16px'`. They break theme
customization (dark mode, admin accent colors from FR-1785 #4816) and create
visual inconsistency.

## 3. `BAICard` with `extra` — use `BAIFlex` wrapper (FR-1292 #4007)

`BAICard`'s `extra` slot misaligns with the title when the extra contains
multiple elements. Wrap it in `BAIFlex`:

```tsx
<BAICard
  title={t('general.Users')}
  extra={
    <BAIFlex align="center" gap="xs">
      <BAIFetchKeyButton loading={...} value={fetchKey} onChange={updateFetchKey} />
      <Button type="primary" icon={<PlusIcon />}>{t('button.Add')}</Button>
    </BAIFlex>
  }
>
  …
</BAICard>
```

The wrapper's default `align="center"` guarantees vertical centering against
the title line-height.

## 4. Responsive Grid

The policy is **CSS-side first**: let the grid reflow on container width rather
than branching in JS on viewport breakpoints. Full recipes and the reasoning
live in `.scratch/astryx-migration/RESPONSIVE-POLICY.md`.

### 4.1 Dashboard-style grid — Astryx `Grid`

```tsx
import { Grid } from '@astryxdesign/core/Grid';

<Grid columns={{ minWidth: 280, max: 4 }} gap={4}>
  {panels.map((panel) => <PanelCard key={panel.id} {...panel} />)}
</Grid>
```

Sizing `minWidth`: take the width at which the layout should first go
multi-column and divide by the column count (2-up from 576px → ~280; 3-up from
768 → ~250; 4-up from 992 → ~240), then sanity-check against real content — a
stat card usually wants 240–300. `max` caps the track count at the widest step.
Astryx `gap` is in 4px units, so `gap={4}` is 16px.

Every conversion is a layout decision, not a mechanical swap: compare
before/after at the site's real *container* widths, not just viewport steps.

### 4.2 JS breakpoint branches — `useBAIBreakpoint`

Only when the branch is genuinely logic (not just picking a track count):

```tsx
import { useBAIBreakpoint } from '../theme-shim';

const { lg } = useBAIBreakpoint();
```

The return shape is the familiar `{ xs … xxl }` boolean map, and every key is
always present — no `?? true` / `?? false` fallbacks needed. `BAI_BREAKPOINTS`
is exported alongside it for the cases that need a raw px number.

If the "branch" only feeds a column count (`screens.md ? 3 : 1`), it is really
§4.1 — convert to `Grid` `minWidth` and delete the hook call.

### 4.3 Splitter for resizable side-by-side

Astryx's resizable split panel is the preferred pattern for filebrowser-like
split views. Don't hand-roll CSS resize handles.

## 5. `BAIRowWrapWithDividers` for divider-separated inline lists

FR-1363 (#4132) introduced `BAIRowWrapWithDividers` for horizontally wrapping
status rows with vertical dividers between items. Use it for metric rows where
pipe characters would otherwise be hand-inserted:

```tsx
<BAIRowWrapWithDividers>
  <StatItem label="CPU" value={cpu} />
  <StatItem label="Memory" value={mem} />
  <StatItem label="GPU" value={gpu} />
</BAIRowWrapWithDividers>
```

## 6. Page-level layout

Pages under `react/src/pages/` start with a vertical stretch `BAIFlex`:

```tsx
return (
  <BAIFlex direction="column" align="stretch" gap="sm">
    {/* header row */}
    <BAIFlex justify="between" align="start" gap="xs" wrap="wrap">
      <BAIFlex direction="row" gap="sm" align="start" wrap="wrap">
        {/* filters */}
      </BAIFlex>
      <BAIFlex gap="xs">
        {/* actions */}
      </BAIFlex>
    </BAIFlex>
    {/* main content */}
    <BAIUserNodes … />
  </BAIFlex>
);
```

Two invariants:
- `align="stretch"` so children (especially tables) fill width
- Outer `BAIFlex direction="column"` gap is `"sm"` by convention

## 7. Table containers

Give tables the `BAITableAstryx` wrapper. It handles horizontal overflow on wide
columns — via Astryx's own scroll wrapper — plus column resize / reordering.

```tsx
<BAIUserNodes usersFrgmt={…} />
```

Nothing to configure: the old `scroll={{ x: 'max-content' }}` prop is accepted
and ignored (see `react-relay-table`). For the container around it, let the page
root's `align="stretch"` give the table its width, and keep the table as the
only child of its block so Astryx's scroll wrapper can claim it.

## 8. Don't write a stylesheet for what tokens can do

A co-located `.css` file is the right tool for selectors you can't express with
inline `style` (pseudo-classes, descendant selectors, media queries). But if
you're setting `padding`, `margin`, `background`, `color`, or any value that
maps to a token — use tokens inline instead. It's cheaper and co-located with
the JSX.

`antd-style` / `createStyles` no longer exists in this repo (to-astryx ticket
33 removed the dependency). Values that must vary at runtime ride CSS custom
properties set inline; everything else is a static rule in the stylesheet, with
`var(--…)` Astryx tokens for every value.

```tsx
// ✅ Inline tokens
<div style={{ padding: token.paddingSM, color: token.colorTextSecondary }} />

// ✅ Co-located stylesheet for pseudo-/descendant selectors
import './AnnouncementEditModal.css';
// AnnouncementEditModal.css
// .announcement-markdown-preview > *:first-child { margin-top: 0; }
```

Own the class name you select on. Never write `.ant-*` selectors — that DOM no
longer renders — and prefer a `[data-bai-*]` attribute when you must reach into
a BUI component's internals (see `form-engine/FormItemVisual.tsx` for the full
attribute vocabulary).

## Related Skills

- **`react-component-basics`** — page root shape (`<BAIFlex direction="column" align="stretch" gap="sm">`)
- **`react-relay-table`** — header row layout above tables
- **`react-modal-drawer`** — modal footer layout
- **`react-form`** — form field row spacing

## 9. Verification Checklist

- [ ] No hardcoded spacing values; all through `token.*` or `BAIFlex` gap strings.
- [ ] `BAIFlex` for layout; `ButtonGroup` / `InputGroup` only for visually joined controls.
- [ ] Card with multi-element `extra` wraps content in `BAIFlex`.
- [ ] Tables carry no `scroll` prop (it is accepted and ignored).
- [ ] Page root is `BAIFlex direction="column" align="stretch" gap="sm"`.
- [ ] Responsive grids use Astryx `Grid columns={{ minWidth, max }}`, not a viewport-keyed prop map.
- [ ] `useBAIBreakpoint()` only where the branch is real JS logic, not a track count.
- [ ] A co-located `.css` file is used only for selectors inline `style` can't express, and selects no `.ant-*`.
