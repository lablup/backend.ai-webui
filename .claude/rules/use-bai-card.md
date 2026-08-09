# Use BAICard for card containers

Always use `BAICard` from `backend.ai-ui` for card containers in this project.

## Why

`BAICard` wraps Astryx's `Card` with the Backend.AI design-system defaults:

- **No header divider** unless `tabList` / `showDivider` is set, for a flatter, cleaner look.
- **Status-based border colors** via the `status` prop (`'success' | 'error' | 'warning' | 'default'`), plus the `bai-card-error` hook the error-state tours anchor to.
- **Standardized title + extra layout**, with `bai-card__head` / `bai-card__extra` anchors on the header row and action slot.

Reaching for Astryx `Card` directly loses all three and produces visibly inconsistent headers — every card on a page should look the same.

### `styles={{ body: { paddingTop: 0 } }}` is obsolete — do not add it

This rule used to require that prop at every call site without `tabList`. It existed because `BAICard` wrapped **antd's** `Card`, whose `body.paddingTop` (≈24px) left a gap the Backend.AI design does not want, and baking the override into the component would have silently changed every existing call site.

`BAICard` renders Astryx `Card` now (to-astryx W2-D). Astryx has ONE `padding` step for the whole surface — header and body live inside the same padded box — so the flush-body look is **structural**, and the override has nothing to remove. `BAICardProps` still accepts `styles` for source compatibility with the ~34 call sites that pass it, and **ignores it** (see the PILOT-DECISION in `BAICard.tsx`).

So: do not add `styles={{ body: { paddingTop: 0 } }}` to new call sites, and drop it from files you are editing anyway. Do not go on a dedicated sweep for it — it is inert, not wrong. If you need a per-card inset, use `padding` or `size="small"`, which are the supported knobs.

## Rules

1. **Always import and use `BAICard`** from `backend.ai-ui` for card containers. Do not reach for Astryx `Card` directly.
2. **Do not pass `styles={{ body: { paddingTop: 0 } }}`** — see above. It is accepted and ignored.
3. **Do not add `marginTop` to the first child to "create breathing room"**. The flush-to-header look is intentional. If a layout genuinely needs vertical separation between the header and content, place that spacing **outside** the card (typically via the parent `BAIFlex` `gap`).
5. **Prefer BAICard's status / extra APIs over custom styling.** Use `status="error" | "warning" | "success"` instead of hand-rolling `style={{ borderColor }}`. Use the `extra` (any `ReactNode`) or `extraButtonTitle` + `onClickExtraButton` props for header actions instead of building a parallel header row above the card.
6. **Card-scoped actions go in `extra`, not in the body.** Any action that operates on the card as a whole — the orange primary "create / add" button, the refresh button (`BAIFetchKeyButton`), an "edit configuration" button, a section-level export — belongs in the card's header `extra` slot. Use a `BAIFlex gap="xs" align="center"` to group multiple actions, with the primary button rightmost.

   Only **content-scoped** controls stay in the body — i.e., things that filter, sort, or page through what is displayed (`BAIGraphQLPropertyFilter`, search inputs, view-mode toggles when they reshape the body content, sort selectors). If you find yourself duplicating a refresh button in the body when the card already has one in `extra`, remove the body one.

## Pattern

### ❌ Wrong — Astryx `Card` directly

```tsx
import { Card } from '@astryxdesign/core/Card';

<Card>
  <Content />
</Card>
```

### ✅ Correct — BAICard

```tsx
import { BAICard } from 'backend.ai-ui';

<BAICard title={t('section.Title')}>
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
        variant="primary"
        icon={<Plus size="1em" />}
        label={t('section.AddRule')}
        onClick={() => setIsCreateOpen(true)}
      />
    </BAIFlex>
  }
>
  <BAIFlex direction="column" align="stretch" gap="sm">
    <BAIGraphQLPropertyFilter style={{ flex: 1 }} {...filterProps} />
    <BAITable {...tableProps} />
  </BAIFlex>
</BAICard>
```

### ✅ Correct — tabbed BAICard

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

### ✅ Correct — BAICard with status

```tsx
<BAICard title={t('section.Errors')} status="error">
  <ErrorList />
</BAICard>
```

## Suspense pairing

When a card's content is data-driven and uses Suspense, place the Suspense boundary **inside** the BAICard so the title stays visible while the content loads:

```tsx
<BAICard title={t('section.Title')}>
  <Suspense fallback={<BAISkeleton active />}>
    <DataDrivenContent />
  </Suspense>
</BAICard>
```

This is the project convention for all loading cards: header always visible, body shows `Skeleton` during fetch. Do not wrap the entire `<BAICard>` in a `<Suspense>` — that hides the header during loading and produces inconsistent UX across the page.

## Verification

After editing a file that touches card containers, confirm:

- All card containers in the touched files are `<BAICard>`, not Astryx `Card`.
- No new `styles={{ body: { paddingTop: 0 } }}` was added.
- Card-scoped actions (refresh, primary create/add, edit, export) live in the card's `extra` slot — not duplicated in the body.
- Only content-scoped controls (filter, search, sort) remain inside the body.
- `bash scripts/verify.sh` passes.

## Related

- `component-props-extension.md` — the wrapper-component prop-extension pattern. `BAICardProps` is a partial exception: it keeps an antd-`Card`-SHAPED surface (so the ~200 call sites carried over from the antd era need no edit) while rendering Astryx, and documents each accepted-and-ignored prop as a PILOT-DECISION in `BAICard.tsx`.
- `BAICard` source: `packages/backend.ai-ui/src/components/BAICard.tsx`
