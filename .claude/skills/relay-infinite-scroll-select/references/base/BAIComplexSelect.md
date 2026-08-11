# BAIComplexSelect — Base Component API

Source: `packages/backend.ai-ui/src/components/BAIComplexSelect.tsx`
Barrel: `packages/backend.ai-ui/src/components/index.ts` (~L65–71)

## Overview

`BAIComplexSelect` is the popup body every Relay-backed infinite-scroll select
in this repo is built on. It is **not** an Ant Design wrapper — antd is gone
from this repo. It renders inside Astryx's `ComplexSelector`, which owns the
field, trigger, popover, focus restore and async change flow, and hands the
popup body back as a **render prop**.

That render prop is the whole reason this component exists. Of Astryx's four
ready-made selects:

- `Selector` / `MultiSelector` mount **every** option into the DOM even while
  closed (measured: 500 options → 2,513 nodes) and carry no label in their
  value;
- `Typeahead` / `Tokenizer` do take label-in-value items, but their
  `SearchSource` **replaces** the result list on every query and hard-slices it
  to `maxMenuItems` — there is no append path and no scroll callback, so
  `loadNext` has nothing to attach to.

`ComplexSelector` is the escape hatch. Because the popup body is ours, we can
own the scroll container, and `onPopupScroll → loadNext` survives the
migration. See the file header for the full rationale (to-astryx ticket 26).

## Exports

```typescript
import BAIComplexSelect, {
  type BAIComplexSelectProps,
  type BAIComplexSelectValue,
  type BAILabeledValue,
  type BAIComplexSelectOption,
} from '../BAIComplexSelect';
```

`BAIComplexSelectTriggerDisplay` is exported from the module but is **not**
re-exported from the `components/index.ts` barrel — import it from
`'../BAIComplexSelect'` directly if you need the type.

## Value contract

Deliberately identical to antd's `labelInValue`, so `Form.Item` / `BAIFormItem`
keep working with no `getValueProps` / `normalize` at the call site, and
mutation payloads are unchanged:

```typescript
export interface BAILabeledValue {
  label: string;
  value: string;
}

export type BAIComplexSelectValue =
  BAILabeledValue | Array<BAILabeledValue> | null;
```

- single mode → one `BAILabeledValue` object, or `null`
- `multiple` → an array

**The `labelInValue` shape lives strictly between the wrapper and
`BAIComplexSelect`.** Every `*SelectAstryx` wrapper keeps its OUTER contract as
plain key(s) (`string | string[] | null`), exactly as its antd predecessor
exposed. Callers never see `{label, value}`.

## Option shape

```typescript
export interface BAIComplexSelectOption {
  value: string;
  /** MUST be a string (P26-3) — it is the trigger text and accessible name. */
  label: string;
  /** Secondary line under the label (the old `optionRender` subtitle). */
  description?: React.ReactNode;
  /** Trailing rich content (badges, tags, meta). */
  extra?: React.ReactNode;
  disabled?: boolean;
}
```

`label` being a `string` is the one antd affordance the value contract could
not keep (P26-3): Astryx needs a string for the trigger, the accessible name
and the live region. **There is no `optionRender` / `labelRender`.** Rich
per-row content goes in `description` (secondary line) or `extra` (trailing).

## Props

Verbatim from the source. All optional except `label`.

| Prop | Type | Notes |
|---|---|---|
| `label` | `string` | **Required.** Accessible name — every Astryx field needs one. |
| `isLabelHidden` | `boolean` | Set this inside a `Form.Item` / `BAIFormItem`. |
| `value` | `BAIComplexSelectValue` | Array iff `multiple`. |
| `onChange` | `(value: BAIComplexSelectValue) => void` | Single argument — no antd-style `option` second arg. |
| `options` | `Array<BAIComplexSelectOption>` | |
| `multiple` | `boolean` | Replaces antd `mode="multiple"`. |
| `placeholder` | `string` | |
| `hasSearch` | `boolean` | Defaults `true`. Replaces antd `showSearch`. |
| `searchValue` | `string` | Controlled search text (server-side search). |
| `onSearch` | `(value: string) => void` | Fires on every keystroke — **debounce upstream**. |
| `searchPlaceholder` | `string` | Defaults to `t('comp:BAIComplexSelect.Search')`. |
| `isLoading` | `boolean` | Replaces antd `loading` — spinner on the trigger. |
| `isDisabled` / `isRequired` / `isOptional` | `boolean` | |
| `description` | `string` | Field help text. |
| `status` | `ComplexSelectorStatus` | |
| `size` | `ComplexSelectorSize` | |
| `width` | `SizeValue` | Defaults `'100%'`. |
| `endReached` | `() => void` | **Wire this to `loadNext`.** |
| `atBottomThreshold` | `number` | Defaults `30`. |
| `atBottomStateChange` | `(atBottom: boolean) => void` | |
| `isLoadingNext` | `boolean` | Spinner next to the count while the next page is in flight. |
| `total` | `number` | Renders the "Total N items" foot automatically. |
| `header` / `footer` | `React.ReactNode` | Above / below the option list. `footer` overrides the auto total foot. |
| `emptyContent` | `React.ReactNode` | Replaces antd `notFoundContent`. |
| `onOpenChange` | `(open: boolean) => void` | Re-exposes popup open state. |
| `listMaxHeight` | `number` | Scroll-viewport height. Defaults `260`. |
| `triggerDisplay` | `'labels' \| 'badges'` | Multiple-mode trigger. Defaults `'labels'`. |
| `maxTriggerTokens` | `number` | Defaults `3`, then `+N`. |
| `data-testid` | `string` | Listbox gets `${testId}-listbox`. |

## The four props that make infinite scroll work

### `endReached: () => void`

Fired once each time the option list is scrolled to within `atBottomThreshold`
px of the bottom. The predicate is `BAISelect`'s old one, unchanged, on a
scroll container we now own:

```typescript
const isAtBottomNow =
  el.scrollHeight - el.scrollTop - el.clientHeight <= atBottomThreshold;
if (isAtBottomNow !== isAtBottom.current) {
  isAtBottom.current = isAtBottomNow;
  atBottomStateChange?.(isAtBottomNow);
  if (isAtBottomNow) endReached?.();
}
```

It fires on the **false → true edge only**, never on every scroll event — so
you do not need to guard against duplicate `loadNext` calls yourself.

Offset pagination (`useLazyPaginatedQuery`) passes `loadNext` directly:

```tsx
endReached={loadNext}
```

Cursor pagination (`usePaginationFragment`) must still check `hasNext`:

```tsx
endReached={() => {
  hasNext && loadNext(10);
}}
```

### `total` + `isLoadingNext`

Do **not** build a `TotalFooter` yourself. When `footer` is not supplied and
`total` is a number `> 0`, `BAIComplexSelect` renders the count row itself,
with a `Spinner` while `isLoadingNext`:

```tsx
total={result.user_nodes?.count ?? undefined}
isLoadingNext={isLoadingNext}
```

(`TotalFooter` still exists in the package and is still Astryx-native, but no
`*SelectAstryx` wrapper uses it — the base component covers this now.)

### `onOpenChange: (open: boolean) => void`

`ComplexSelector` keeps `isOpen` to itself and always renders its popup subtree
(the native `popover` attribute does the hiding). `BAIComplexSelect` mounts a
tiny `OpenStateReporter` inside the render prop to report **both** edges back
out.

This is what keeps the `fetchPolicy` trick alive (P26-6):

```tsx
const [controllableOpen, setControllableOpen] = useControllableValue<boolean>(
  selectProps as Record<string, unknown>,
  { valuePropName: 'open', trigger: 'onOpenChange', defaultValuePropName: 'defaultOpen' },
);
const deferredOpen = useDeferredValue(controllableOpen);
// ...
{ fetchPolicy: deferredOpen ? 'network-only' : 'store-only' }
// ...
<BAIComplexSelect onOpenChange={setControllableOpen} />
```

### `searchValue` + `onSearch`

Server-side search. `onSearch` fires on **every keystroke** — the component
does no debouncing. Debounce in the wrapper with `useDebouncedDeferredValue`
and feed the debounced value to the query, while `searchValue` stays on the raw
state so the input is responsive:

```tsx
const [searchStr, setSearchStr] = useState<string>('');
const debouncedDeferredValue = useDebouncedDeferredValue(searchStr);
// query filter uses debouncedDeferredValue
<BAIComplexSelect searchValue={searchStr} onSearch={setSearchStr} />
```

`useOptimistic` for the search box is **no longer needed** — the search input
is a plain controlled `TextInput` inside our own popup, so `searchStr` already
updates synchronously. Surface the lag as `isLoading` instead:

```tsx
isLoading={
  isLoading ||
  controllableValue !== deferredControllableValue ||
  searchStr !== debouncedDeferredValue ||
  isPendingRefetch
}
```

## Empty state — no Skeleton (P26-7)

antd's `notFoundContent={<Skeleton.Input active size="small" block />}`
first-load placeholder was **deliberately dropped**. `emptyContent` does take a
`ReactNode`, but a skeleton row inside an Astryx popup drags an antd dependency
back into a migrated surface. The empty state is the shared "No results" text
built into the component:

```tsx
{options.length === 0
  ? (emptyContent ?? (
      <Text color="secondary">{t('comp:BAIComplexSelect.NoResults')}</Text>
    ))
  : /* option rows */}
```

**Do not pass `emptyContent` unless you have a domain-specific empty message.**
Never reintroduce a skeleton placeholder.

## Deliberate non-features

These are settled decisions, not gaps to fill. Do not "restore" them.

- **P26-1 — virtualization is deferred.** One DOM row per loaded option. The
  10–20 row pagination window is what keeps that bounded, which is exactly why
  the infinite-scroll UX had to be preserved rather than replaced by "top N per
  query".
- **P26-2 — keyboard/ARIA is a reasonable subset**, not an rc-select
  reimplementation. Implemented: ArrowDown opens, Up/Down/Home/End roving
  highlight, Enter commits, Escape closes, `role="listbox"`/`role="option"`,
  `aria-selected`, `aria-activedescendant` on the search box, highlight
  scrolled into view, polite live region on the result count. Not implemented
  and not planned: printable-character type-ahead, PageUp/PageDown, shift+arrow
  range selection, `aria-owns` trigger/listbox coupling (the popup is
  `role="dialog"` because `ComplexSelector` hardcodes that).
- **P26-3 — no `optionRender` / `labelRender`.** `label` is a `string`; rich
  content goes in `description` / `extra`.
- **P26-4 — no `tagRender`, and multiple-mode chips are display-only.**
  `ComplexSelector` renders `triggerLabel` inside its own `<button>`, so a
  removable `Token` would nest a button in a button. Deselecting is a second
  click on the option row; antd's chip "×" is gone.
- **QA2-B-1 — `triggerDisplay` defaults to `'labels'`**: the first
  `maxTriggerTokens` (3) selected labels comma-joined, then `, +N` —
  byte-identical to Astryx `MultiSelector triggerDisplay="labels"`, so a user
  cannot tell which engine is behind a given field. `'badges'` keeps the former
  `Token` chips for call sites that want them.

## What about `BAISelect`?

`BAISelect` still exists (`packages/backend.ai-ui/src/components/BAISelect.tsx`)
and is still exported. It is now built on Astryx `Selector` / `MultiSelector`,
with `SelectProps` / `BaseOptionType` / `DefaultOptionType` / `GetRef` declared
locally so the module drops out of the antd import graph. Its public prop
surface stays antd-`Select`-shaped because 12 components declare
`interface XProps extends BAISelectProps` and spread the bag straight through.
For that antd-shaped surface, see `.claude/rules/component-props-extension.md`.

**It is not the base for Relay-backed selects.** On Astryx `Selector` the
pagination props are accepted **and inert**:

- `endReached`, `atBottomStateChange`, `bottomLoading` — `Selector` owns its
  popup and emits no scroll event. They stay in the signature only so the 12
  extenders keep compiling; the scroll bookkeeping is deleted.
- `searchAction` — `Selector` filters its own options client-side and exposes
  no `onSearch`. Server-driven search is `Typeahead`/`ComplexSelector`
  territory by design.

Every paginated consumer moved to `BAIComplexSelect`; ticket p3-c retired all
19 legacy paginated wrappers. **A new Relay infinite-scroll select that extends
`BAISelect` will compile, render, and silently never paginate.**

Use `BAISelect` only for a static, in-memory option list.

## Minimal wiring

```tsx
<BAIComplexSelect
  label={t('comp:YourSelect.Label')}
  placeholder={t('comp:YourSelect.PlaceHolder')}
  {...selectProps}
  multiple={multiple}
  isLoading={isLoading || searchStr !== debouncedDeferredValue}
  isLoadingNext={isLoadingNext}
  total={result.your_nodes?.count ?? undefined}
  options={options}
  value={labeledValue}
  onChange={(next) => {
    const keys = _.map(_.compact(_.castArray(next ?? [])), (v) => v.value);
    setControllableValue(multiple ? keys : keys[0], undefined);
  }}
  searchValue={searchStr}
  onSearch={setSearchStr}
  onOpenChange={setControllableOpen}
  endReached={loadNext}
/>
```

## Related

- `../patterns/BAIUserSelectAstryx.md` — the canonical worked example
- `../patterns/BAIVFolderSelectAstryx.md` — id-valued variant
- `../patterns/BAIAdminResourceGroupSelectAstryx.md` — cursor-fragment variant
- `.claude/rules/component-props-extension.md` — the antd-shaped prop surface `BAISelect`
  still carries
