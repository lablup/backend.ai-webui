---
name: react-layout
description: >
  Use when laying out a page, card header, or action row with `BAIFlex`,
  choosing spacing values, or migrating `<Space>` / raw `<Flex>` to `BAIFlex`.
  Covers gap token scale, `token.*` spacing, `BAICard` extra alignment, and
  responsive grid patterns.
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
- Migrating existing `<Space>` or `<Flex>` (antd) usage

## Gotchas

- **`BAIFlex` `gap` string tokens** resolve via `(token as any)['size' + 'XS'.toUpperCase()]`. If a custom theme doesn't define `sizeXS`/`sizeMD`/etc., gap silently collapses to `'0px'`. Verify the theme when customizing.
- **`BAIFlex` does not always stretch children by default.** Effective `alignItems` comes from `align` (default: `center`) and can also be overridden by `style.alignItems`. Use `align="stretch"` when column-direction layouts should stretch their children.
- **`justify="between"` / `"around"`** are BAIFlex shorthands for `space-between` / `space-around`. Passing raw CSS values doesn't work.
- **`Space.direction` is deprecated for layout** (antd v6). `Space.Compact` is still canonical for button + dropdown grouping — don't migrate it to BAIFlex.
- **Hardcoded px breaks theming.** Admin primary colors (FR-1785 #4816) and dark mode rely on tokens. `padding: 8` compiles but diverges visually across themes.
- **`createStyles` from antd-style re-renders on theme change.** Prefer inline `style={{ padding: token.paddingSM }}` when tokens suffice; reserve `createStyles` for pseudo-class / nested antd-class selectors.
- **Tables without `scroll={{ x: 'max-content' }}`** overflow their parent on narrow viewports. Always set it on `BAITable`/`*Nodes`.
- **Responsive `grid={{ xs, sm, md, lg, xl, xxl }}`** uses antd breakpoints (`xxl` = 1600px). Don't invent a custom breakpoint — the design system caps at xxl on purpose.

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

### 1.3 `BAIFlex` vs `Flex` vs `Space`

| Use | When |
|---|---|
| `BAIFlex` | Always, by default |
| `Flex` (antd) | Only in BUI code that must not depend on the repo root (rare) |
| `Space` | Never for layout. Only the `Space.Compact` wrapper is still fine (e.g. grouped button + dropdown) |

FR-1326 (#4065) deduplicated the old internal `Flex` component into
`BAIFlex` from `backend.ai-ui`. FR-1331 (#4070) added Jest tests for
`BAIFlex` — the public API is stable and safe to extend.

## 2. Spacing values come from `theme.useToken()`

```tsx
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

### 4.1 Dashboard-style grid

For card grids that reflow by viewport:

```tsx
<List
  grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 3, xxl: 4 }}
  dataSource={panels}
  renderItem={(panel) => <List.Item><PanelCard {...panel} /></List.Item>}
/>
```

### 4.2 Splitter for resizable side-by-side

`<Splitter>` with `defaultSize` is the preferred pattern for filebrowser-like
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

Tables need `scroll={{ x: 'max-content' }}` to avoid layout breakage on wide
columns. Give them the `BAITable` wrapper, which already handles this plus
column resize / reordering.

```tsx
<BAIUserNodes usersFrgmt={…} scroll={{ x: 'max-content' }} />
```

## 8. Don't `antd-style` what tokens can do

`antd-style` / `createStyles` is fine for selectors you can't express with
inline `style` (pseudo-classes, nested antd class overrides). But if you're
setting `padding`, `margin`, `background`, `color`, or any value that maps to a
token — use tokens inline instead. It's cheaper and co-located with the JSX.

```tsx
// ✅ Inline tokens
<div style={{ padding: token.paddingSM, color: token.colorTextSecondary }} />

// ✅ antd-style for pseudo-selectors
const useStyles = createStyles(({ css }) => ({
  modal: css`
    .ant-modal-body { padding-top: 24px !important; }
  `,
}));
```

## Related Skills

- **`react-component-basics`** — page root shape (`<BAIFlex direction="column" align="stretch" gap="sm">`)
- **`react-relay-table`** — header row layout above tables
- **`react-modal-drawer`** — modal footer layout
- **`react-form`** — form field row spacing

## 9. Verification Checklist

- [ ] No hardcoded spacing values; all through `token.*` or `BAIFlex` gap strings.
- [ ] `BAIFlex` everywhere, not `Flex` (antd) or `Space` (except `Space.Compact`).
- [ ] Card with multi-element `extra` wraps content in `BAIFlex`.
- [ ] Tables have `scroll={{ x: 'max-content' }}`.
- [ ] Page root is `BAIFlex direction="column" align="stretch" gap="sm"`.
- [ ] Responsive grids use antd `grid` prop with the standard xs/sm/md/lg/xl/xxl scale.
- [ ] `createStyles` is used only for selectors inline `style` can't express.
