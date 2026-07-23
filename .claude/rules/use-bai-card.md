# Use BAICard Over antd Card

Always use `BAICard` from `backend.ai-ui` instead of antd's `<Card>` component for card containers in this project. Apply `styles={{ body: { paddingTop: 0 } }}` at every call site **that does not use `tabList`** so the body sits flush against the header. Cards with `tabList` keep their default body paddingTop — see "Tabbed cards keep their paddingTop" below.

## Why

`BAICard` wraps antd's `Card` with the Backend.AI design-system defaults:

- **Hidden header divider** when `tabList` / `showDivider` is not used. The default antd `Card` renders a horizontal line under the title; `BAICard` removes it for a flatter, cleaner look.
- **Status-based border colors** via the `status` prop (`'success' | 'error' | 'warning' | 'default'`).
- **Standardized title + extra layout** using `BAIFlex` (`justify="between"`, `align="center"`, `wrap="wrap"`, `gap="sm"`) so headers across the app are visually aligned.

The Backend.AI card design intends the body to sit **flush against the header** — antd's default `body.paddingTop` (≈24px) leaves a visible gap that is not part of our design language. `BAICard` does not bake `body.paddingTop: 0` into the component itself (it would change every existing call site silently and surprise other apps that consume `backend.ai-ui`), so each call site applies it explicitly via `styles={{ body: { paddingTop: 0 } }}`. This is the project convention.

Mixing `Card` and `BAICard`, or omitting the `paddingTop: 0` style, produces visibly inconsistent header dividers and spacing — every card on a page should look the same.

## Rules

1. **Always import and use `BAICard`** from `backend.ai-ui` for new card containers. Do not introduce new `import { Card } from 'antd'` for card UI.
2. **When editing a file that uses `<Card>` from `antd`, migrate it to `<BAICard>` in the same change.** The migration is typically a pure rename: `BAICardProps extends Omit<CardProps, 'extra'>`, so every standard Card prop (`title`, `tabList`, `activeTabKey`, `onTabChange`, `size`, `style`, `styles`, `bordered`, `variant`, etc.) passes through unchanged. Drop the `Card` import after the rename.
3. **Always pass `styles={{ body: { paddingTop: 0 } }}`** when using `BAICard` **without `tabList`**. This is non-negotiable for visual consistency. If the call site already declares other `styles.body` keys (e.g. `padding`, `backgroundColor`), merge `paddingTop: 0` into that same object — do not drop the existing keys.

   **Exception — tabbed cards.** When the card uses `tabList`, **do not** pass `paddingTop: 0`. The tabs render *as the bottom edge of the header*, and a flush body would put the first row of content immediately under the tab underline, which reads as broken. `BAICard` already sets `body.paddingTop` to `token.padding` (or `token.paddingSM` for `size="small"`) automatically when `tabList` is present — accept that default. If you genuinely need to override `body` styling on a tabbed card, do so without touching `paddingTop`.
4. **Do not add `marginTop` to the first child to "create breathing room"**. The flush-to-header look is intentional. If a layout genuinely needs vertical separation between the header and content, place that spacing **outside** the card (typically via the parent `BAIFlex` `gap`).
5. **Prefer BAICard's status / extra APIs over custom styling.** Use `status="error" | "warning" | "success"` instead of hand-rolling `style={{ borderColor }}`. Use the `extra` (any `ReactNode`) or `extraButtonTitle` + `onClickExtraButton` props for header actions instead of building a parallel header row above the card.
6. **Card-scoped actions go in `extra`, not in the body.** Any action that operates on the card as a whole — the orange primary "create / add" button, the refresh button (`BAIFetchKeyButton`), an "edit configuration" button, a section-level export — belongs in the card's header `extra` slot. Use a `BAIFlex gap="xs" align="center"` to group multiple actions, with the primary button rightmost.

   Only **content-scoped** controls stay in the body — i.e., things that filter, sort, or page through what is displayed (`BAIGraphQLPropertyFilter`, search inputs, view-mode toggles when they reshape the body content, sort selectors). If you find yourself duplicating a refresh button in the body when the card already has one in `extra`, remove the body one.

## Pattern

### ❌ Wrong — antd Card

```tsx
import { Card } from 'antd';

<Card title={t('section.Title')}>
  <Content />
</Card>
```

### ❌ Wrong — BAICard without `paddingTop: 0`

```tsx
import { BAICard } from 'backend.ai-ui';

<BAICard title={t('section.Title')}>
  <Content />
</BAICard>
```

### ✅ Correct — BAICard with `paddingTop: 0`

```tsx
import { BAICard } from 'backend.ai-ui';

<BAICard title={t('section.Title')} styles={{ body: { paddingTop: 0 } }}>
  <Content />
</BAICard>
```

### ✅ Correct — card-scoped actions (refresh + add) in `extra`, content-scoped filter in body

```tsx
<BAICard
  title={t('section.Rules')}
  extra={
    <BAIFlex gap="xs" align="center">
      <BAIFetchKeyButton loading={isPending} value="" onChange={refetch} />
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => setIsCreateOpen(true)}
      >
        {t('section.AddRule')}
      </Button>
    </BAIFlex>
  }
  styles={{ body: { paddingTop: 0 } }}
>
  <BAIFlex direction="column" align="stretch" gap="sm">
    <BAIGraphQLPropertyFilter style={{ flex: 1 }} {...filterProps} />
    <BAITable {...tableProps} />
  </BAIFlex>
</BAICard>
```

### ✅ Correct — tabbed BAICard (no `paddingTop: 0`; default kept)

```tsx
<BAICard
  activeTabKey={activeTab}
  onTabChange={setActiveTab}
  tabList={[
    { key: 'a', label: 'Tab A' },
    { key: 'b', label: 'Tab B' },
  ]}
>
  <Content />
</BAICard>
```

### ❌ Wrong — `paddingTop: 0` on a tabbed card

```tsx
// Don't do this — content collides with the tab underline.
<BAICard
  activeTabKey={activeTab}
  tabList={[...]}
  styles={{ body: { paddingTop: 0 } }}
>
  <Content />
</BAICard>
```

### ✅ Correct — BAICard with status

```tsx
<BAICard
  title={t('section.Errors')}
  status="error"
  styles={{ body: { paddingTop: 0 } }}
>
  <ErrorList />
</BAICard>
```

### ✅ Correct — merging into existing body styles

```tsx
<BAICard
  title={t('section.Title')}
  styles={{ body: { paddingTop: 0, padding: token.paddingLG } }}
>
  <Content />
</BAICard>
```

## Suspense pairing

When a card's content is data-driven and uses Suspense, place the Suspense boundary **inside** the BAICard so the title stays visible while the content loads:

```tsx
<BAICard
  title={t('section.Title')}
  styles={{ body: { paddingTop: 0 } }}
>
  <Suspense fallback={<Skeleton active />}>
    <DataDrivenContent />
  </Suspense>
</BAICard>
```

This is the project convention for all loading cards: header always visible, body shows `Skeleton` during fetch. Do not wrap the entire `<BAICard>` in a `<Suspense>` — that hides the header during loading and produces inconsistent UX across the page.

## Verification

After editing a file that touches card containers, confirm:

- `import { Card } from 'antd'` is removed from the modified files (unless `Card` is genuinely needed for a non-container use case, which is rare).
- All `<Card>` JSX usages in the touched files are `<BAICard>`.
- Every `<BAICard>` call site **without `tabList`** has `styles={{ body: { paddingTop: 0 } }}` (merged into existing `body` styles when present).
- Tabbed `<BAICard>` call sites do **not** declare `paddingTop` on `body` — they keep BAICard's automatic tab-aware paddingTop.
- Card-scoped actions (refresh, primary create/add, edit, export) live in the card's `extra` slot — not duplicated in the body.
- Only content-scoped controls (filter, search, sort) remain inside the body.
- `bash scripts/verify.sh` passes — TypeScript should accept the prop forwarding because `BAICardProps` extends `Omit<CardProps, 'extra'>`.

## Related

- `component-props-extension.md` — `BAICardProps` follows the wrapper-component prop-extension pattern documented there.
- `antd-v6-props.md` — when migrating, also apply v6 prop renames to any antd primitives nested inside the card.
- `BAICard` source: `packages/backend.ai-ui/src/components/BAICard.tsx`
