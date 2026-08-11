---
name: relay-infinite-scroll-select
description: >
  Create Relay-based infinite scroll select components on BAIComplexSelect
  (Astryx ComplexSelector), named *SelectAstryx. Covers offset pagination
  (useLazyLoadQuery + useLazyPaginatedQuery) and cursor pagination
  (usePaginationFragment), with server-side search, selected-value label
  resolution, and single/multiple modes.
---

# Relay Infinite Scroll Select Component Creator

## Activation Triggers

- "Create a Relay infinite scroll select for [entity]"
- "Build a select with GraphQL pagination"
- "Add [Entity]Select component with infinite scroll"
- "Create a select component that fetches from GraphQL"

## Read this first

**The base component is `BAIComplexSelect`, not `BAISelect`.**

antd is gone from this repo. `BAISelect` still exists and is still exported,
but it is now built on Astryx `Selector` / `MultiSelector`, where the
pagination props are **accepted and inert**:

- `endReached`, `atBottomStateChange`, `bottomLoading` — `Selector` owns its
  popup and emits no scroll event
- `searchAction` — `Selector` filters its own options client-side and exposes
  no `onSearch`

They survive in the signature only so the 12 components that declare
`interface XProps extends BAISelectProps` keep compiling. **A new Relay
infinite-scroll select built on `BAISelect` will compile, render, and silently
never paginate.** Use `BAISelect` only for a static, in-memory option list; for
its antd-shaped prop surface see `.claude/rules/antd-v6-props.md`.

`BAIComplexSelect` is built on Astryx's `ComplexSelector` — the only Astryx
select that hands the popup body back as a **render prop**. That is what keeps
`onPopupScroll → loadNext` alive. Full API: `references/base/BAIComplexSelect.md`.

**Naming**: new components go in
`packages/backend.ai-ui/src/components/fragments/` as `*SelectAstryx.tsx`,
alongside the ~18 siblings already there.

## Quick Start Decision Tree

```
START: where does the option data come from?

┌──────────────────────────────────────────────────────────────┐
│ Q: Does the parent already own a query you can hang a        │
│    @connection fragment on (a `queryRef` prop)?              │
└──────────────────────────────────────────────────────────────┘
                         │
          ┌──────────────┴──────────────┐
         NO                            YES
          │                             │
          ▼                             ▼
  offset pagination              cursor pagination
  useLazyPaginatedQuery          usePaginationFragment
          │                             │
          ▼                             ▼
┌─────────────────────────┐      ┌──────────────┐
│ Q: is the key also a    │      │   CLASS C    │
│    displayable label?   │      └──────────────┘
└─────────────────────────┘             │
     YES │        │ NO                  ▼
         ▼        ▼             BAIAdminResourceGroupSelectAstryx
     CLASS A   CLASS B
         │        │
         ▼        ▼
  BAIUserSelectAstryx   BAIVFolderSelectAstryx
  BAIKeypairSelectAstryx  BAIProjectSelectAstryx
```

**Start from offset pagination unless the `queryRef` already exists.** It needs
no plumbing through the parent, supports the open/closed `fetchPolicy` switch,
and is what ~17 of the ~18 wrappers do.

## Class Comparison

The Astryx siblings label themselves in their file headers (ticket-27
CONVERSION-BRIEF). These are the real classes, not invented categories.

| | **Class A** (name-valued) | **Class B** (id-valued) | **Class C** (cursor fragment) |
|---|---|---|---|
| **Key is** | a display value in its own right (`email`, `access_key`) | the raw GraphQL `id` / `row_id` | usually the `name` |
| **Pagination** | offset (`limit`/`offset`) | offset (`limit`/`offset`) | cursor (`first`/`after`/`@connection`) |
| **Hooks** | `useLazyLoadQuery` + `useLazyPaginatedQuery` | same | `usePaginationFragment` |
| **Queries** | 2 | 2 | 1 fragment |
| **Value-resolution query** | ✅ required | ✅ required | ❌ none (label === key) |
| **`queryRef` prop** | ❌ | ❌ | ✅ |
| **`fetchPolicy` open/closed switch** | ✅ | ✅ | ❌ n/a |
| **`useFetchKey` + ref refetch** | ✅ | ✅ | ❌ (fragment's own `refetch`) |
| **`endReached`** | `loadNext` | `loadNext` | `() => hasNext && loadNext(10)` |
| **Examples** | `BAIUserSelectAstryx`, `BAIKeypairSelectAstryx` | `BAIVFolderSelectAstryx`, `BAIProjectSelectAstryx`, `BAIDeploymentSelectAstryx`, `BAIObjectStorageSelectAstryx` | `BAIAdminResourceGroupSelectAstryx` (the only one) |

A and B share the same file shape exactly — only `keyOfNode` and the filter
predicate differ.

## Why the value-resolution query is now mandatory (A and B)

In antd this was a nicety: rc-select rendered the raw value when no option
matched. On Astryx **the trigger reads its text from the value**, and a value
chosen on page 1 is no longer in `options` after `loadNext` has paged past it.
Without the resolution query the trigger shows a raw UUID.

Class C escapes this only because label and value are definitionally identical
for resource groups.

## Implementation Checklist (Class A / B — the default)

Copy `BAIUserSelectAstryx.tsx`. It is the ticket-26 worked example and the
template the other wrappers followed.

**Component setup**

- [ ] File is `*SelectAstryx.tsx` under `packages/backend.ai-ui/src/components/fragments/`
- [ ] `'use memo'` as the first statement in the component body
- [ ] `useBAIi18n` from `../../hooks/useBAIi18n` — **never** `useTranslation`
      from `react-i18next` (ESLint blocks it under `packages/backend.ai-ui/src/**`, FR-2986)
- [ ] Props `extends Omit<BAIComplexSelectProps, 'options' | 'value' | 'onChange' | 'searchValue' | 'onSearch' | 'total'>`
- [ ] Outer value typed as plain `string | Array<string> | null` — the
      `labelInValue` shape stays *inside* the wrapper
- [ ] Export a `*Ref` interface if exposing `refetch`

**Imports (from `BAIUserSelectAstryx.tsx`, verbatim paths)**

```typescript
import { toLocalId } from '../../helper';
import useDebouncedDeferredValue from '../../helper/useDebouncedDeferredValue';
import { useControllableValue, useFetchKey } from '../../hooks';
import { useBAIi18n } from '../../hooks/useBAIi18n';
import { useLazyPaginatedQuery } from '../../hooks/usePaginatedQuery';
import BAIComplexSelect, {
  type BAIComplexSelectProps,
  type BAIComplexSelectValue,
  type BAILabeledValue,
} from '../BAIComplexSelect';
import { mergeFilterValues } from '../BAIPropertyFilter';
```

**State**

- [ ] `useControllableValue` for `value` (`trigger: 'onChange'`) and for `open`
      (`valuePropName: 'open'`, `trigger: 'onOpenChange'`,
      `defaultValuePropName: 'defaultOpen'`) — pass `selectProps as Record<string, unknown>`
- [ ] `useDeferredValue` on the controllable value, on open, and on the fetch key
- [ ] `useState<string>('')` for `searchStr` (empty string, not `undefined` —
      `searchValue` is a controlled `string`)
- [ ] `useDebouncedDeferredValue(searchStr)` for the query filter
- [ ] `useTransition` for the ref-driven refetch
- [ ] `useFetchKey` for cache invalidation
- [ ] `const selectedKeys = _.compact(_.castArray(deferredControllableValue ?? []))`

**Query 1 — value resolution**

```graphql
query YourComponentAstryxValueQuery(
  $selectedFilter: String
  $first: Int!
  $skipSelected: Boolean!
) {
  your_nodes(filter: $selectedFilter, first: $first)
    @skip(if: $skipSelected) {
    edges { node { id name } }
  }
}
```

```typescript
{
  selectedFilter: mergeFilterValues(
    [
      selectedKeys.length
        ? mergeFilterValues(
            _.map(selectedKeys, (value) => `name == "${value}"`),
            '|',
          )
        : null,
      mergedFilter,
    ],
    '&',
  ),
  first: Math.max(selectedKeys.length, 1),
  skipSelected: selectedKeys.length === 0,
},
{
  fetchPolicy: selectedKeys.length ? 'store-or-network' : 'store-only',
  fetchKey: deferredFetchKey,
}
```

- [ ] `@skip(if: $skipSelected)` so nothing is fetched for an empty selection
- [ ] `first: Math.max(selectedKeys.length, 1)` — dynamic, with a floor of 1
      (`first: 0` is invalid for an `Int!` variable even on the render where
      the field is skipped)
- [ ] `fetchPolicy` falls back to `'store-only'` in the same condition
- [ ] `toLocalId(value)` on the filter value when the outer key is a global id
      but the backend filters on local UUIDs

**Query 2 — paginated options**

```typescript
useLazyPaginatedQuery<YourPaginatedQuery, YourNode>(
  query,
  { limit: 10 },
  { filter: mergeFilterValues([mergedFilter, searchPredicate]), order: 'name' },
  {
    fetchPolicy: deferredOpen ? 'network-only' : 'store-only',
    fetchKey: deferredFetchKey,
  },
  {
    getTotal: (r) => r.your_nodes?.count ?? undefined,
    getItem: (r) => r.your_nodes?.edges?.map((edge) => edge?.node),
    getId: (item) => item?.id,
  },
);
```

- [ ] `count` selected on the connection — it feeds `total`
- [ ] `fetchPolicy: deferredOpen ? 'network-only' : 'store-only'` (P26-6)
- [ ] Search predicate built from the **debounced deferred** value, not `searchStr`
- [ ] Pagination arguments follow `.claude/rules/graphql-pagination.md` — one
      mode only. `*_nodes` legacy connections use `first` + `offset` as their
      offset mode; Strawberry `*V2` connections must use `limit` + `offset`.

**Options and value mapping**

- [ ] One `keyOfNode` helper, shared by `options` and `labeledValue`, so the
      two can never disagree about what a key is
- [ ] `label` is a **plain string** (P26-3); secondary text goes in
      `description`, trailing content in `extra`
- [ ] `labeledValue` maps over `selectedKeys` (preserving selection order) and
      looks up the edge — never the reverse
- [ ] Echo the key as its own label when the resolution query has not landed
- [ ] Return `labeled` in `multiple` mode, `labeled[0] ?? null` otherwise

**Render**

- [ ] `placeholder` **before** `{...selectProps}`; everything the wrapper owns **after**
- [ ] `isLoading` with all four conditions
- [ ] `total` + `isLoadingNext` — **no hand-built `TotalFooter`**
- [ ] `value={labeledValue}`, `onChange` unwraps back to plain keys
- [ ] `searchValue={searchStr}`, `onSearch={setSearchStr}`
- [ ] `onOpenChange={setControllableOpen}`
- [ ] `endReached={loadNext}`
- [ ] No `emptyContent` (see below)

## Class C differences (cursor fragment)

- [ ] `queryRef` prop typed with the **Astryx** `$key`, matching the `graphql`
      tag's own fragment name (P3C-6 — the legacy and Astryx `$key` types are
      structurally identical, so `tsc` will not catch a mismatch, but the
      component will find no data at runtime)
- [ ] `@argumentDefinitions(first, after, filter)` + `@refetchable(queryName:)`
      + `@connection(key:)`, all named after the Astryx file
- [ ] Search calls the fragment's `refetch({ filter })` — a structured filter
      object, not the `mergeFilterValues` string DSL
- [ ] `endReached={() => { hasNext && loadNext(10); }}`
- [ ] No value query, no `onOpenChange`, no `useFetchKey`, no debounce hook

## What changed from the antd era

Every item below is a **deliberate** decision (to-astryx tickets 26/27). Do not
"restore" any of them.

| antd `BAISelect` | Now on `BAIComplexSelect` |
|---|---|
| `showSearch` (bool \| object) | `hasSearch` (bool, default `true`) + `searchValue` / `onSearch` |
| `searchAction` (transition-wrapped) | `onSearch` fires per keystroke; **you** debounce upstream |
| `useOptimistic` for the search box | gone — the search box is a controlled `TextInput` we own, so `searchStr` is already synchronous |
| `selectRef.current?.scrollTo(0)` on search | gone — the component resets the highlight to index 0 per keystroke and scrolls it into view |
| `labelInValue` prop | implicit; the value **is** `{label, value}` |
| `optimisticValueWithLabel` state | gone — `labeledValue` is rebuilt from `selectedKeys` each render |
| `labelRender` / `optionRender` (ReactNode) | **P26-3**: `label` is a `string`; use `description` / `extra` |
| React-element labels in `onChange` | gone — labels are always strings, so no "recover the original label" dance |
| `tagRender`, removable chips | **P26-4**: trigger chips are display-only; deselect by clicking the row again |
| `mode="multiple"` | `multiple` |
| `loading` / `disabled` | `isLoading` / `isDisabled` |
| `notFoundContent={<Skeleton.Input/>}` | **P26-7**: dropped. Shared "No results" text |
| `footer={<TotalFooter …/>}` | `total` + `isLoadingNext` — the component renders the count row |
| `<Select>` needs no label | **`label` is required** (accessible name); pass `isLabelHidden` inside a form item |

### Empty state — no Skeleton (P26-7)

antd's `notFoundContent={<Skeleton.Input active size="small" block />}`
first-load placeholder was **deliberately dropped**. `emptyContent` does accept
a `ReactNode`, but a skeleton row inside an Astryx popup drags an antd
dependency back into a migrated surface.

`BAIComplexSelect` renders `t('comp:BAIComplexSelect.NoResults')` — "No results"
— whenever `options` is empty. **Pass nothing.** Only supply `emptyContent` for
a domain-specific empty message, and never a skeleton.

## Common Patterns

### Search: debounce upstream, surface the lag as `isLoading`

```typescript
const [searchStr, setSearchStr] = useState<string>('');
const debouncedDeferredValue = useDebouncedDeferredValue(searchStr);

// query filter uses the debounced deferred value
filter: mergeFilterValues([
  mergedFilter,
  debouncedDeferredValue ? `email ilike "%${debouncedDeferredValue}%"` : null,
]),

// the input stays on raw state, so typing is never laggy
<BAIComplexSelect searchValue={searchStr} onSearch={setSearchStr} />
```

`useDebouncedDeferredValue` combines `useDebounce` (default 200 ms) with
`useDeferredValue`: fewer GraphQL round-trips during fast typing, and no UI
blocking while the query runs.

### Loading state — four conditions

```typescript
isLoading={
  isLoading ||                                       // caller's own flag
  controllableValue !== deferredControllableValue || // a selection is settling
  searchStr !== debouncedDeferredValue ||            // debounce/defer window
  isPendingRefetch                                   // ref.refetch() in flight
}
```

Class C uses `isLoading` alone — it has no value query, no debounce window and
no ref refetch.

### fetchPolicy (P26-6)

```typescript
// value resolution: never hit the network for an empty selection
fetchPolicy: selectedKeys.length ? 'store-or-network' : 'store-only'

// options: refetch on open, stay quiet while closed
fetchPolicy: deferredOpen ? 'network-only' : 'store-only'
```

The second one only works because `BAIComplexSelect.onOpenChange` re-exposes
the open state that `ComplexSelector` otherwise keeps private.

### Ref-exposed refetch

```typescript
const [isPendingRefetch, startRefetchTransition] = useTransition();
const [fetchKey, updateFetchKey] = useFetchKey();
const deferredFetchKey = useDeferredValue(fetchKey);

useImperativeHandle(
  ref,
  () => ({
    refetch: () => {
      startRefetchTransition(() => {
        updateFetchKey();
      });
    },
  }),
  [updateFetchKey, startRefetchTransition],
);
```

### Filter merging

```typescript
import { mergeFilterValues } from '../BAIPropertyFilter';

const mergedFilter = mergeFilterValues([
  excludeInactive ? defaultActiveUserFilter : null,
  filter,          // caller's filter
]);               // default operator is '&'

// OR the per-key predicates, then AND with the caller's filter
mergeFilterValues(
  [
    selectedKeys.length
      ? mergeFilterValues(_.map(selectedKeys, (v) => `email == "${v}"`), '|')
      : null,
    mergedFilter,
  ],
  '&',
);
```

`null` entries are dropped. See `references/helpers/mergeFilterValues.md`.

### Global ID handling

There is no single rule — the two live wrappers genuinely differ, and both are
correct for their domain:

- `BAIUserSelectAstryx` in `'id'` mode: outer key is `toLocalId(node.id)`
- `BAIVFolderSelectAstryx` in `'id'` mode: outer key is the **raw global**
  `node.id` (`VFolderMountFormItem` stores global IDs), and `toLocalId` is used
  only for the display text and the filter value

**Match whatever the antd predecessor exposed.** Changing the outer key shape
silently breaks every call site and every mutation payload.

### Controllable props

```typescript
const [controllableValue, setControllableValue] = useControllableValue<
  string | Array<string> | null | undefined
>(selectProps as Record<string, unknown>, {
  valuePropName: 'value',
  trigger: 'onChange',
});
const [controllableOpen, setControllableOpen] = useControllableValue<boolean>(
  selectProps as Record<string, unknown>,
  {
    valuePropName: 'open',
    trigger: 'onOpenChange',
    defaultValuePropName: 'defaultOpen',
  },
);
```

`BAIComplexSelectProps` has no `open` / `defaultOpen` — re-declare them in your
own props interface so `useControllableValue` can read them (P26-5).

## Common Pitfalls & Solutions

| Pitfall | Impact | Solution |
|---|---|---|
| Extending `BAISelect` | compiles, renders, **never paginates** | extend `BAIComplexSelect` |
| Passing a ReactNode as `label` | `[object Object]` in the trigger / accessible name | `label` is a `string`; use `description` / `extra` |
| Omitting the value-resolution query | trigger shows a raw UUID once the value pages out of `options` | add Query 1 (Class A/B) |
| `first: selectedKeys.length` with no floor | invalid `Int!` variable at 0 | `Math.max(selectedKeys.length, 1)` |
| Hardcoded `first: 10` in the value query | selections past 10 lose their labels | dynamic `first` |
| Missing `@skip(if:)` | needless query for an empty select | add it, and pair with `'store-only'` |
| Filtering options by `searchStr` instead of the debounced value | a query per keystroke | use `useDebouncedDeferredValue` output |
| `searchStr` initialised to `undefined` | uncontrolled→controlled input warning | `useState<string>('')` |
| Reintroducing `Skeleton.Input` as `emptyContent` | pulls antd back into a migrated surface | shared "No results" (P26-7) |
| Hand-building a `TotalFooter` | duplicate count rows | pass `total` + `isLoadingNext` |
| Forgetting `label` | Astryx field has no accessible name | always pass `label`; add `isLabelHidden` inside a form item |
| Two divergent key derivations | options and selection disagree | one shared `keyOfNode` |
| Ordering `labeledValue` by query result | selection order scrambles in multiple mode | map over `selectedKeys` |
| Not deferring value/open/fetchKey | Suspense flicker | `useDeferredValue` on all three |
| Legacy `first`+`offset` copied onto a `*V2` connection | runtime "Only one pagination mode allowed" | `.claude/rules/graphql-pagination.md` |
| `useTranslation` from `react-i18next` inside BUI | ESLint error (FR-2986) | `useBAIi18n` |
| Class C: legacy `$key` type on `queryRef` | type-checks, finds no data at runtime | use the Astryx `$key` (P3C-6) |
| Class C: `endReached={loadNext}` without `hasNext` | over-fetch past the end | `() => hasNext && loadNext(10)` |

## TypeScript Patterns

### Props interface

```typescript
export interface YourSelectAstryxProps extends Omit<
  BAIComplexSelectProps,
  'options' | 'value' | 'onChange' | 'searchValue' | 'onSearch' | 'total'
> {
  /** Plain key(s), as the antd predecessor exposes. */
  value?: string | Array<string> | null;
  onChange?: (value: string | Array<string> | undefined) => void;
  filter?: string;
  valuePropName?: 'id' | 'row_id';
  open?: boolean;
  defaultOpen?: boolean;
  ref?: React.Ref<YourSelectAstryxRef>;
  // Class C only:
  // queryRef: YourSelectAstryx_yourFragment$key;
}
```

The `Omit` list is exactly those six. Everything else — `label`, `multiple`,
`placeholder`, `isLoading`, `isDisabled`, `emptyContent`, `listMaxHeight`,
`triggerDisplay`, `header`, `footer` … — passes through untouched. This follows
`.claude/rules/component-props-extension.md`.

`onChange` takes **one** argument. The second `option` argument exists only on
`BAIUserSelectAstryx` (P3C-1), because `BAIGraphQLPropertyFilter.renderInput`
needs the label for its filter chip and cannot derive it. Do not add it
speculatively.

### Ref interface

```typescript
export interface YourSelectAstryxRef {
  refetch: () => void;
}
```

### Node type extraction

```typescript
export type YourNode = NonNullable<
  NonNullable<
    YourSelectAstryxPaginatedQuery['response']['your_nodes']
  >['edges'][number]
>['node'];
```

### Value builder

```typescript
const labeledValue: BAIComplexSelectValue = (() => {
  const labeled: Array<BAILabeledValue> = _.map(selectedKeys, (key) => {
    const edge = _.find(selectedNodes?.edges, (e) => keyOfNode(e?.node) === key);
    return { label: edge?.node?.name ?? key, value: key };
  });
  if (multiple) return labeled;
  return labeled[0] ?? null;
})();
```

## Internationalization

Use the `comp:` prefix for component strings, and `useBAIi18n`:

```typescript
const { t } = useBAIi18n();
t('comp:YourSelect.PlaceHolder')
```

`BAIComplexSelect` supplies its own chrome strings —
`comp:BAIComplexSelect.Search`, `comp:BAIComplexSelect.NoResults`, and
`general.TotalItems` for the count row. Do not duplicate them.

Locale files live in `packages/backend.ai-ui/src/locale/`. See the
`i18n-patterns` skill for key naming and casing rules.

## Reference Files

- **Base component**: `references/base/BAIComplexSelect.md`
- **Class A / canonical template**: `references/patterns/BAIUserSelectAstryx.md`
- **Class B (id-valued)**: `references/patterns/BAIVFolderSelectAstryx.md`
- **Class C (cursor fragment)**: `references/patterns/BAIAdminResourceGroupSelectAstryx.md`
- **Hooks**: `references/hooks/` — `useFetchKey`, `useLazyPaginatedQuery`,
  `useEventNotStable`
- **Helpers**: `references/helpers/` — `relay-helpers` (`toLocalId`),
  `mergeFilterValues`

> **Terminology note.** The hook and helper references predate the Class A/B/C
> naming and still say "Pattern A" / "Pattern B". Read **Pattern A** as
> **Class C** (`usePaginationFragment`, name-valued) and **Pattern B** as
> **Classes A and B** (`useLazyLoadQuery` + `useLazyPaginatedQuery`). The hooks
> and helpers they document — `useEventNotStable`, `useFetchKey`,
> `useLazyPaginatedQuery`, `mergeFilterValues`, `toLocalId` — all still exist
> and are still exported unchanged.

Related project rules:

- `.claude/rules/graphql-pagination.md` — never mix pagination modes
- `.claude/rules/component-props-extension.md` — the `Omit<…Props, …>` pattern
- `.claude/rules/antd-v6-props.md` — the antd-shaped surface `BAISelect` still carries

## File Structure

```
YourSelectAstryx.tsx
├── File header comment (why it exists, class, PILOT-DECISIONs it inherits)
├── Imports (generated query types, helpers, hooks, BAIComplexSelect)
├── Type definitions (Node extraction, Ref, Props)
├── Module-level filter constants
├── Component with 'use memo'
│   ├── useBAIi18n + useControllableValue (value, open)
│   ├── Deferred / debounced state, useFetchKey, useTransition
│   ├── Query 1 — value resolution      (Class A/B)
│   ├── Query 2 — paginated options     (or the fragment, Class C)
│   ├── useImperativeHandle (refetch)   (Class A/B)
│   ├── keyOfNode → options → labeledValue
│   └── <BAIComplexSelect />
└── export default
```

Keep the file-header comment convention: every `*SelectAstryx.tsx` opens with a
short note on what it replaced, which class it is, and which PILOT-DECISIONs
shaped it. That is where the "why" lives.
