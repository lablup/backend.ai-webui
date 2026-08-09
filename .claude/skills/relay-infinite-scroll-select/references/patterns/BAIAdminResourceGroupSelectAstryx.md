# BAIAdminResourceGroupSelectAstryx — cursor-fragment variant (Class C)

Source: `packages/backend.ai-ui/src/components/fragments/BAIAdminResourceGroupSelectAstryx.tsx`

Read `BAIUserSelectAstryx.md` first. This is the same recipe with a different
pagination engine and no value-resolution query.

## Why it is the odd one out

It is the **only** wrapper in this repo built on `usePaginationFragment` —
cursor pagination via a `queryRef` fragment key — rather than
`useLazyPaginatedQuery`'s offset pagination. Per the ticket-27 conversion brief
(§2.C), that changes exactly two lines of the recipe:

- `endReached` maps to `loadNext(pageSize)` guarded by `hasNext`
- `isLoadingNext` comes from the hook's own flag

Nothing else about the shape changes. The `queryRef` prop is unchanged from the
antd original — parents still supply the fragment data the same way.

## Key characteristics

- **Outer value**: plain `string | string[] | null` — the resource group `name`
- **Relay hook**: `usePaginationFragment` only (one fragment, no second query)
- **Pagination**: cursor (`first` / `after` / `@connection`)
- **Search**: `refetch({ filter })` — no debounce hook
- **No ref / no `useFetchKey`**: refetch is the fragment's own

## Why there is no value-resolution query

Resource groups use `name` as **both** their primary key and their display
label — the antd original said as much: *"since scaling group uses name as
primary key, use name as value"*.

Because label and value are always identical for this domain object, there is
nothing to resolve. In the offset-paginated wrappers the display name is a
*different field* than the key and can go missing from `options` after paging;
here it cannot.

```typescript
// label === value for this domain object, so labelInValue pairs can be
// constructed directly from the selected keys with no separate query.
const labeledValue: BAIComplexSelectValue = (() => {
  const labeled: Array<BAILabeledValue> = _.map(selectedKeys, (key) => ({
    label: key,
    value: key,
  }));
  if (multiple) return labeled;
  return labeled[0] ?? null;
})();
```

`label: key, value: key` is **not a fallback** here — it is definitionally
correct. Do not add a value query "for symmetry".

## Imports

```typescript
import { BAIAdminResourceGroupSelectAstryxPaginationQuery } from '../../__generated__/BAIAdminResourceGroupSelectAstryxPaginationQuery.graphql';
import { BAIAdminResourceGroupSelectAstryx_resourceGroupsFragment$key } from '../../__generated__/BAIAdminResourceGroupSelectAstryx_resourceGroupsFragment.graphql';
import { useControllableValue } from '../../hooks';
import { useBAIi18n } from '../../hooks/useBAIi18n';
import BAIComplexSelect, {
  type BAIComplexSelectProps,
  type BAIComplexSelectValue,
  type BAILabeledValue,
} from '../BAIComplexSelect';
import * as _ from 'lodash-es';
import { useState } from 'react';
import { usePaginationFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
```

Much shorter than the offset variants: no `useFetchKey`, no
`useDebouncedDeferredValue`, no `mergeFilterValues`, no `toLocalId`, no
`useLazyLoadQuery`.

## Props

```typescript
export interface BAIAdminResourceGroupSelectAstryxProps extends Omit<
  BAIComplexSelectProps,
  'options' | 'value' | 'onChange' | 'searchValue' | 'onSearch' | 'total'
> {
  queryRef: BAIAdminResourceGroupSelectAstryx_resourceGroupsFragment$key;
  /** Plain key(s), as the antd `BAIAdminResourceGroupSelect` exposes. */
  value?: string | Array<string> | null;
  onChange?: (value: string | Array<string> | undefined) => void;
}
```

### P3C-6 — the fragment key type must be the Astryx one

A real bug worth remembering. Ticket 27 first typed `queryRef` as the **legacy**
`BAIAdminResourceGroupSelect_resourceGroupsFragment$key` while the `graphql` tag
below declared `BAIAdminResourceGroupSelectAstryx_…`. The two happened to be
structurally identical, so `tsc` happily accepted a consumer that spread the
LEGACY fragment into this component — which would then find no data at runtime.

**When you convert a fragment component, rename the fragment AND re-point the
`$key` type together.** Structural identity means TypeScript will not catch it
for you.

## The fragment

```typescript
const { data, loadNext, isLoadingNext, refetch, hasNext } =
  usePaginationFragment<
    BAIAdminResourceGroupSelectAstryxPaginationQuery,
    BAIAdminResourceGroupSelectAstryx_resourceGroupsFragment$key
  >(
    graphql`
      fragment BAIAdminResourceGroupSelectAstryx_resourceGroupsFragment on Query
      @argumentDefinitions(
        first: { type: "Int", defaultValue: 10 }
        after: { type: "String" }
        filter: { type: "ResourceGroupFilter" }
      )
      @refetchable(
        queryName: "BAIAdminResourceGroupSelectAstryxPaginationQuery"
      ) {
        resourceGroups(first: $first, after: $after, filter: $filter)
          @connection(key: "BAIAdminResourceGroupSelectAstryx_resourceGroups")
          @since(version: "26.1.0") {
          count
          edges {
            node {
              id
              name
            }
          }
        }
      }
    `,
    queryRef,
  );
```

Required directives:

- `@argumentDefinitions(first, after, filter)` — cursor mode arguments only.
  Never mix in `limit` / `offset`; see `.claude/rules/graphql-pagination.md`.
- `@refetchable(queryName:)` — must be unique; name it after the Astryx file.
- `@connection(key:)` — must be unique; name it after the Astryx file. This is
  what makes `loadNext` append rather than replace.
- `count` on the connection — feeds `total`.
- `@since(version:)` here is a client directive gating the field on server
  version; carry it over unchanged when it exists on the original.

## Options and render

```typescript
const [searchStr, setSearchStr] = useState<string>('');

const options = _.compact(
  _.map(data.resourceGroups?.edges, (item) =>
    item?.node?.name
      ? { value: item.node.name, label: item.node.name }
      : null,
  ),
);

return (
  <BAIComplexSelect
    placeholder={t('comp:BAIAdminResourceGroupSelect.PlaceHolder')}
    {...selectProps}
    multiple={multiple}
    isLoading={isLoading}
    isLoadingNext={isLoadingNext}
    total={data.resourceGroups?.count ?? undefined}
    options={options}
    value={labeledValue}
    onChange={(next) => {
      const keys = _.map(_.compact(_.castArray(next ?? [])), (v) => v.value);
      setControllableValue(multiple ? keys : keys[0], undefined);
    }}
    searchValue={searchStr}
    onSearch={(next) => {
      setSearchStr(next);
      refetch({
        filter: next ? { name: { contains: next } } : null,
      });
    }}
    endReached={() => {
      hasNext && loadNext(10);
    }}
  />
);
```

Three Class-C-specific details:

1. **`endReached` checks `hasNext` explicitly.** The offset variants pass
   `loadNext` bare because `useLazyPaginatedQuery` guards on `!hasNext` and
   `isLoadingNext` inside the callback; the cursor variant keeps the guard at
   the call site, as the antd original did.
2. **`loadNext(10)` takes an explicit page size.** The offset variants call
   `loadNext` with no argument because the page size was fixed at
   `{ limit: 10 }` when the hook was set up.
3. **Search goes through `refetch`, not a filter variable.** The filter is a
   structured `ResourceGroupFilter` object (`{ name: { contains } }`), not the
   string DSL that `mergeFilterValues` builds. There is no debounce here —
   `refetch` is Relay's own and the option list is small.

`isLoading` is the caller's flag alone: there is no value query settling, no
debounce window, and no ref refetch to fold in.

There is also **no `onOpenChange`** — the `open ? 'network-only' : 'store-only'`
fetchPolicy trick (P26-6) belongs to `useLazyLoadQuery`-based wrappers.
`usePaginationFragment` reads from a query the parent already issued.

## Empty state (P26-7)

antd's `notFoundContent={<Skeleton.Input active size="small" block />}` is
dropped here as it is everywhere else. The empty state is the shared
"No results" text `BAIComplexSelect` renders itself.

## Parent wiring

The parent issues the query and spreads the fragment:

```tsx
const query = useLazyLoadQuery<MyPageQuery>(
  graphql`
    query MyPageQuery {
      ...BAIAdminResourceGroupSelectAstryx_resourceGroupsFragment
    }
  `,
  {},
);

<BAIAdminResourceGroupSelectAstryx
  queryRef={query}
  label={t('general.ResourceGroup')}
  onChange={(name) => setSelectedGroup(name)}
/>
```

## When to pick Class C at all

Only when the data already arrives as a `@connection` on a query the parent
owns. If you are starting from scratch, use the offset recipe
(`BAIUserSelectAstryx.md`): it needs no `queryRef` plumbing through the parent,
supports the open/closed `fetchPolicy` switch, and is what the other ~17
wrappers do.
