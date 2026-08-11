# BAIUserSelectAstryx — the canonical template

Source: `packages/backend.ai-ui/src/components/fragments/BAIUserSelectAstryx.tsx`

## Why this file is the template

`BAIUserSelect` was the hardest select in the repo: Relay **offset** pagination
with scroll-driven `loadNext`, server-side search, `labelInValue`, and
single/multiple modes all at once. It was ported to `BAIComplexSelect` first
precisely because porting it proves the foundation; the other ~17 Relay-backed
wrappers were then converted by copying this recipe (ticket 26 → ticket 27).

**Copy this file, not the old antd one.** Every other `*SelectAstryx` in
`packages/backend.ai-ui/src/components/fragments/` is a variation on it.

## Key characteristics

- **Outer value**: plain `string | string[] | null` (`email` or `id`, via
  `valuePropName`) — same as the antd predecessor exposed
- **Relay hooks**: `useLazyLoadQuery` (value resolution) + `useLazyPaginatedQuery`
  (options)
- **Pagination**: offset (`limit` / `offset`)
- **Multiple mode**: full support via `multiple`
- **Search**: `useDebouncedDeferredValue` + server-side `ilike` filter
- **External refetch**: `useFetchKey` exposed through `ref`

## Imports (verbatim)

```typescript
import { BAIUserSelectAstryxPaginatedQuery } from '../../__generated__/BAIUserSelectAstryxPaginatedQuery.graphql';
import { BAIUserSelectAstryxValueQuery } from '../../__generated__/BAIUserSelectAstryxValueQuery.graphql';
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
import * as _ from 'lodash-es';
import {
  useDeferredValue,
  useImperativeHandle,
  useState,
  useTransition,
} from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';
```

Note `useBAIi18n` from `../../hooks/useBAIi18n` — **not** `useTranslation` from
`react-i18next`. An ESLint rule blocks the react-i18next imports anywhere under
`packages/backend.ai-ui/src/**` (FR-2986).

## Types and props

```typescript
export type AstryxUserNode = NonNullable<
  NonNullable<
    BAIUserSelectAstryxPaginatedQuery['response']['user_nodes']
  >['edges'][number]
>['node'];

export interface BAIUserSelectAstryxRef {
  refetch: () => void;
}

export interface BAIUserSelectAstryxProps extends Omit<
  BAIComplexSelectProps,
  'options' | 'value' | 'onChange' | 'searchValue' | 'onSearch' | 'total'
> {
  /** Plain key(s), as the antd `BAIUserSelect` exposes. */
  value?: string | Array<string> | null;
  onChange?: (
    value: string | Array<string> | undefined,
    option?: BAILabeledValue | Array<BAILabeledValue>,
  ) => void;
  filter?: string;
  excludeInactive?: boolean;
  valuePropName?: 'id' | 'email';
  open?: boolean;
  defaultOpen?: boolean;
  ref?: React.Ref<BAIUserSelectAstryxRef>;
}
```

**The `Omit` list is the recipe.** Omit exactly the six props the wrapper
re-declares or owns: `options`, `value`, `onChange`, `searchValue`, `onSearch`,
`total`. Everything else — `label`, `multiple`, `placeholder`, `isLoading`,
`isDisabled`, `emptyContent`, `listMaxHeight`, `triggerDisplay` … — passes
through untouched. `label` stays **required** at the call site: it is the
accessible name and every Astryx field needs one.

`open` / `defaultOpen` are re-declared here because `BAIComplexSelectProps` has
no such props (it only reports open state via `onOpenChange`); they exist so
`useControllableValue` can read them.

The second `option` argument on `onChange` (P3C-1) survives **here and only
here**. antd's `onChange(value, option)` was dropped wholesale by ticket 27, but
`BAIGraphQLPropertyFilter.renderInput` needs the human-readable label for the
filter chip while the raw UUID goes into the GraphQL filter, and that label is
not derivable at the call site.

## State

```typescript
const { t } = useBAIi18n();
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

const deferredOpen = useDeferredValue(controllableOpen);
const [searchStr, setSearchStr] = useState<string>('');
const debouncedDeferredValue = useDebouncedDeferredValue(searchStr);
const [isPendingRefetch, startRefetchTransition] = useTransition();
const [fetchKey, updateFetchKey] = useFetchKey();
const deferredFetchKey = useDeferredValue(fetchKey);

const deferredControllableValue = useDeferredValue(controllableValue);
const selectedKeys = _.compact(_.castArray(deferredControllableValue ?? []));
```

**P26-5** — `useControllableValue` is kept, so the wrapper stays drop-in for
both controlled and uncontrolled callers. The `as Record<string, unknown>` cast
is required: the hook takes a loose props bag.

`searchStr` is initialised to `''`, not `undefined`, because `searchValue` on
`BAIComplexSelect` is a controlled `string`.

There is **no `useOptimistic`** here any more. The old antd version needed
`optimisticSearchStr` because the search box lived inside rc-select; the Astryx
popup's search box is a plain controlled `TextInput` we own, so `searchStr`
already updates synchronously. Likewise there is no `optimisticValueWithLabel`
state — the value is rebuilt from `selectedKeys` on every render.

## Query 1 — selected-key → label resolution

```typescript
const { user_nodes: selectedUserNodes } =
  useLazyLoadQuery<BAIUserSelectAstryxValueQuery>(
    graphql`
      query BAIUserSelectAstryxValueQuery(
        $selectedFilter: String
        $first: Int!
        $skipSelected: Boolean!
      ) {
        user_nodes(filter: $selectedFilter, first: $first)
          @skip(if: $skipSelected) {
          edges {
            node {
              id
              email
            }
          }
        }
      }
    `,
    {
      selectedFilter: mergeFilterValues(
        [
          selectedKeys.length
            ? mergeFilterValues(
                _.map(selectedKeys, (value) =>
                  valuePropName === 'id'
                    ? `uuid == "${value}"`
                    : `email == "${value}"`,
                ),
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
    },
  );
```

### This query is now mandatory, not a nicety

In antd this was an optimisation: rc-select renders the raw value when no
option matches. On Astryx the trigger reads its text **from the value**, and a
value chosen on page 1 is no longer in `options` after `loadNext` has paged past
it. Without this query the trigger shows a raw UUID.

### Dynamic `first`

```typescript
first: Math.max(selectedKeys.length, 1),
```

Fetch exactly as many rows as there are selected keys — no over-fetch, no
under-fetch, works for 1 or 100 selections. The `Math.max(…, 1)` floor matters:
the query variable is `Int!` and `first: 0` is invalid, so the floor keeps the
variables well-formed on the render where `skipSelected` is `true` and the
field is skipped anyway.

> **History.** The antd original wrote `first: _.castArray(value).length`, which
> yields `0` on an empty selection. The `Math.max` floor and the
> `_.compact(_.castArray(v ?? []))` normalisation replaced it during the port.

### `@skip` + `fetchPolicy`

`@skip(if: $skipSelected)` drops the field entirely when nothing is selected,
and `fetchPolicy` falls back to `'store-only'` in the same condition — the query
never touches the network for an empty select.

## Query 2 — paginated options

```typescript
const { paginationData, result, loadNext, isLoadingNext } =
  useLazyPaginatedQuery<BAIUserSelectAstryxPaginatedQuery, AstryxUserNode>(
    graphql`
      query BAIUserSelectAstryxPaginatedQuery(
        $offset: Int!
        $limit: Int!
        $filter: String
        $order: String
      ) {
        user_nodes(
          offset: $offset
          first: $limit
          filter: $filter
          order: $order
        ) {
          count
          edges {
            node {
              id
              email
              username
              full_name
              status
              role
            }
          }
        }
      }
    `,
    { limit: 10 },
    {
      filter: mergeFilterValues([
        mergedFilter,
        debouncedDeferredValue
          ? `email ilike "%${debouncedDeferredValue}%"`
          : null,
      ]),
      order: 'email',
    },
    {
      // P26-6: the open state comes back out of the Astryx popup.
      fetchPolicy: deferredOpen ? 'network-only' : 'store-only',
      fetchKey: deferredFetchKey,
    },
    {
      getTotal: (r) => r.user_nodes?.count ?? undefined,
      getItem: (r) => r.user_nodes?.edges?.map((edge) => edge?.node),
      getId: (item) => item?.id,
    },
  );
```

**P26-6** — the `open ? 'network-only' : 'store-only'` trick survives the
migration. `ComplexSelector` keeps `isOpen` private, but
`BAIComplexSelect.onOpenChange` re-exposes it, so the popup still refetches on
open and stays quiet while closed.

`user_nodes` is a legacy connection whose offset mode is `first` + `offset` —
that mixed-looking pair is correct **here**. Do not copy it onto a Strawberry
`*V2` connection; see `.claude/rules/graphql-pagination.md`.

## Ref-exposed refetch

```typescript
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

## Options and value mapping

```typescript
const keyOfNode = (
  node: { id: string; email?: string | null } | null | undefined,
): string | undefined => {
  if (!node) return undefined;
  return valuePropName === 'id'
    ? toLocalId(node.id)
    : (node.email ?? undefined);
};

const options = _.compact(
  _.map(paginationData, (item) => {
    const key = keyOfNode(item);
    return key
      ? {
          value: key,
          label: item?.email ?? key,
          description: item?.full_name ?? undefined,
        }
      : null;
  }),
);

/** Plain keys -> labelInValue, resolving each label where we can. */
const labeledValue: BAIComplexSelectValue = (() => {
  const labeled: Array<BAILabeledValue> = _.map(selectedKeys, (key) => {
    const edge = _.find(
      selectedUserNodes?.edges,
      (e) => keyOfNode(e?.node) === key,
    );
    // Echoing the key as its own label is the antd fallback, made explicit.
    return { label: edge?.node?.email ?? key, value: key };
  });
  if (multiple) return labeled;
  return labeled[0] ?? null;
})();
```

Three things to copy exactly:

1. **A single `keyOfNode` helper** used by both `options` and `labeledValue`,
   so the two can never disagree about what a key is.
2. **`label` must be a string** (P26-3). The secondary information that antd
   put in an `optionRender` JSX fragment (`full_name` here) goes in the
   option's `description` slot instead.
3. **Selection order comes from `selectedKeys`**, not from the query result —
   map over the keys and look up the edge, never the reverse.

`labeledValue` returns `null` (not `undefined`) in single mode when nothing is
selected, matching `BAIComplexSelectValue`.

## Render

```tsx
return (
  <BAIComplexSelect
    placeholder={t('comp:BAIUserSelect.SelectUser')}
    {...selectProps}
    multiple={multiple}
    isLoading={
      isLoading ||
      controllableValue !== deferredControllableValue ||
      searchStr !== debouncedDeferredValue ||
      isPendingRefetch
    }
    isLoadingNext={isLoadingNext}
    total={result.user_nodes?.count ?? undefined}
    options={options}
    value={labeledValue}
    onChange={(next) => {
      const labeled = _.compact(_.castArray(next ?? []));
      const keys = _.map(labeled, (v) => v.value);
      // P3C-1: second argument carries the labelInValue pair(s).
      setControllableValue(
        multiple ? keys : keys[0],
        multiple ? labeled : labeled[0],
      );
    }}
    searchValue={searchStr}
    onSearch={setSearchStr}
    onOpenChange={setControllableOpen}
    endReached={loadNext}
  />
);
```

Ordering matters: `placeholder` sits **before** `{...selectProps}` (so a caller
can override it), and everything the wrapper owns sits **after** (so a caller
cannot break the wiring).

`isLoading` keeps all four conditions:

1. `isLoading` — the caller's own flag
2. `controllableValue !== deferredControllableValue` — a selection is settling
3. `searchStr !== debouncedDeferredValue` — the search is debouncing/deferring
4. `isPendingRefetch` — a `ref.refetch()` is in flight

`endReached={loadNext}` needs no `hasNext` guard: `useLazyPaginatedQuery`'s
`loadNext` is a no-op past the end, and `BAIComplexSelect` only fires
`endReached` on the not-at-bottom → at-bottom edge.

## Empty state (P26-7)

antd's `notFoundContent={<Skeleton.Input active size="small" block />}`
first-load placeholder is **gone**. `emptyContent` accepts a `ReactNode`, but a
skeleton row inside an Astryx popup drags an antd dependency back into a
migrated surface. The empty state is the shared "No results" text
(`comp:BAIComplexSelect.NoResults`) that `BAIComplexSelect` renders itself.

Pass nothing. Do not reintroduce a skeleton.

## Class taxonomy (ticket 27 CONVERSION-BRIEF)

The Astryx siblings label themselves in their file headers:

| Class | Key is | Value-resolution query | Examples |
|---|---|---|---|
| **A** name-valued | a display value in its own right | still present (the key can page out of `options`) | `BAIUserSelectAstryx` (email mode), `BAIKeypairSelectAstryx` (`access_key`) |
| **B** id-valued | the raw GraphQL `id` | required — the id is never displayable | `BAIVFolderSelectAstryx`, `BAIProjectSelectAstryx`, `BAIDeploymentSelectAstryx`, `BAIObjectStorageSelectAstryx` |
| **C** cursor-fragment | usually the name | none, when label === key | `BAIAdminResourceGroupSelectAstryx` (the only one) |

A and B share this file's shape exactly; only `keyOfNode` and the filter
predicate differ. C swaps the pagination engine — see
`BAIAdminResourceGroupSelectAstryx.md`.

## Checklist

- [ ] File named `*SelectAstryx.tsx` under `packages/backend.ai-ui/src/components/fragments/`
- [ ] `'use memo'` as the first statement in the component body
- [ ] Props `extends Omit<BAIComplexSelectProps, 'options' | 'value' | 'onChange' | 'searchValue' | 'onSearch' | 'total'>`
- [ ] Outer value typed as plain `string | Array<string> | null`
- [ ] `useControllableValue` for both `value` and `open`
- [ ] `useDeferredValue` on value, open and fetchKey
- [ ] `useDebouncedDeferredValue` on `searchStr`; **no `useOptimistic`**
- [ ] Value query with `@skip(if:)` + `first: Math.max(selectedKeys.length, 1)`
- [ ] Paginated query with `fetchPolicy: deferredOpen ? 'network-only' : 'store-only'`
- [ ] One `keyOfNode` helper shared by `options` and `labeledValue`
- [ ] `label` is a plain string; extras in `description` / `extra`
- [ ] `total` + `isLoadingNext` passed — **no hand-built `TotalFooter`**
- [ ] `endReached={loadNext}`
- [ ] No `emptyContent` skeleton (P26-7)
- [ ] `useBAIi18n`, not `react-i18next`
