---
name: react-url-state
description: >
  Use when page state (filter, order, tab, pagination, modal-open) must
  survive reload or be URL-shareable, or when migrating `use-query-params`
  to `nuqs`. Covers `useQueryStates`, `parseAs*` parsers, `history: 'replace'`,
  and pairing with `useDeferredValue` for React Transitions.
---

# URL State with nuqs

Patterns from FR-1683 (#4646) migration to nuqs, FR-1431 (#4252), FR-1412
(#4193), FR-706 (#3405), FR-567 (#3245), FR-1401 (#4179), FR-1058 (#3743).

## Activation Triggers

- Persisting filter / order / tab / pagination / modal open state across reloads
- A URL should be shareable and reproduce the same view
- Migrating existing `useQueryParams` / `useDeferredQueryParams` to `nuqs`
- Pairing URL-backed query variables with `useLazyLoadQuery` + Suspense

## Gotchas

- **`parseAsString.withDefault('')` OMITS the key from the URL** when value equals `''`; `parseAsString` (no default) keeps `null` and the key. Pick based on whether "empty" means "default".
- **Default `history: 'push'` adds a back-button entry per filter change** — user presses Back and lands on the previous filter instead of leaving the page. Always pass `{ history: 'replace' }` unless that's the desired UX.
- **`setQueryParams(null)` resets ALL keys in the group to defaults.** `setQueryParams({ key: null })` clears only that key. The AdminComputeSessionListPage tab switcher relies on this reset.
- **`parseAsStringLiteral(values)` silently coerces unknown URL values** to the default (or `undefined`) — no visible error. Type-safe on read but a typo in the URL doesn't fail loudly.
- **Without `useDeferredValue` on `queryVariables`**, `useLazyLoadQuery` suspends on every keystroke/sort/page change — Suspense fallback flashes. This is the whole FR-1683 motivation.
- **`useBAIPaginationOptionStateOnSearchParam` uses its own `useQueryStates`** — it doesn't share context with your page-level `useQueryStates`. Both write cleanly to URL but are independent.
- **Batched setters in the same tick merge**, not overwrite. `setQueryParams({ a: 1 }); setQueryParams({ b: 2 })` → `{ a: 1, b: 2 }`, not `{ b: 2 }`.
- **`useBAIPaginationOptionStateOnSearchParamLegacy` still exists** — don't introduce new usages; legacy only.

## 1. Import and hook shape

```tsx
import {
  parseAsString,
  parseAsInteger,
  parseAsBoolean,
  parseAsStringLiteral,
  useQueryStates,
} from 'nuqs';

const [queryParams, setQueryParams] = useQueryStates(
  {
    filter: parseAsString.withDefault(''),
    order: parseAsString,  // null means "no explicit order" — default in variables
    type: parseAsStringLiteral(['all', 'interactive', 'batch'] as const)
            .withDefault('all'),
    open: parseAsBoolean.withDefault(false),
    first: parseAsInteger.withDefault(20),
  },
  { history: 'replace' },   // always replace unless "Back" semantics are important
);
```

`queryParams.filter` is always a string (default `''`). `queryParams.order`
can be `null` — keep the actual default in the query variables so URLs stay
clean.

### 1.1 `withDefault` vs not

| Form | URL when value equals default | Param type |
|---|---|---|
| `parseAsString.withDefault('')` | omitted | `string` |
| `parseAsString` | omitted when null | `string \| null` |
| `parseAsStringLiteral([...]).withDefault('all')` | omitted | the literal union |

Only use `.withDefault()` when there's a semantically meaningful default. Keep
`order`/`search` nullable when a missing value means "use backend default".

### 1.2 `history: 'replace'`

Always pass `{ history: 'replace' }` unless the page treats filter/tab changes
as navigable history entries. Tabs usually do NOT — user expects Back to leave
the page, not cycle through filter states.

## 2. Sorter cycle: null → ascend → descend → null

When binding a sort column to URL state, keep `order` nullable and fall back
inside `queryVariables`:

```tsx
const [queryParams, setQueryParams] = useQueryStates({
  order: parseAsString,  // null, 'email', '-email', …
});

const queryVariables = {
  order: queryParams.order || '-created_at', // default lives here
};
```

In the `*Nodes`'s `onChangeOrder`:

```tsx
<BAIUserNodes
  order={queryParams.order}
  onChangeOrder={(next) => setQueryParams({ order: next })}
/>
```

`null` back into the setter clears the URL key — no `?order=` on the URL when
the user is on default. FR-460 / FR-883 established this cycle.

## 3. Pagination: `useBAIPaginationOptionStateOnSearchParam`

Don't hand-roll pagination URL state. Use the shared hook:

```tsx
import { useBAIPaginationOptionStateOnSearchParam }
  from 'src/hooks/reactPaginationQueryOptions';

const {
  baiPaginationOption,       // { limit, first, offset }  — for GraphQL variables
  tablePaginationOption,     // { pageSize, current }      — for antd table
  setTablePaginationOption,  // partial updater
} = useBAIPaginationOptionStateOnSearchParam({ current: 1, pageSize: 10 });
```

Internally it uses `parseAsInteger.withDefault(initial)` on `current`/`pageSize`
with `history: 'replace'`. Don't duplicate this anywhere.

## 4. Pair URL state with `useDeferredValue`

`useLazyLoadQuery` suspends on variable changes. To keep the UI responsive
while the next page loads, defer the variables:

```tsx
const queryVariables = {
  first: baiPaginationOption.first,
  offset: baiPaginationOption.offset,
  filter: mergeFilterValues([queryParams.filter, statusFilter]),
  order: queryParams.order || '-created_at',
};

const deferredQueryVariables = useDeferredValue(queryVariables);
const deferredFetchKey = useDeferredValue(fetchKey);

const { user_nodes } = useLazyLoadQuery(query, deferredQueryVariables, {
  fetchKey: deferredFetchKey,
  fetchPolicy: deferredFetchKey === INITIAL_FETCH_KEY
    ? 'store-and-network' : 'network-only',
});

// derive table "loading" from deferred inequality
const loading =
  deferredQueryVariables !== queryVariables ||
  deferredFetchKey !== fetchKey;
```

This is the whole transition contract. FR-1683's motivation was that `nuqs`
`useQueryStates` plays well with React Transitions, whereas the old
`useQueryParams` didn't. Don't bring back `useDeferredQueryParams`.

## 5. Tab-scoped state cache via `useRef`

When tabs represent independent views (session type all/interactive/batch…)
and each tab should remember its own filter/order/page, cache the per-tab
queryParams in a ref:

```tsx
const queryMapRef = useRef({
  [queryParams.type]: { queryParams, tablePaginationOption },
});

useEffect(() => {
  queryMapRef.current[queryParams.type] = { queryParams, tablePaginationOption };
}, [queryParams, tablePaginationOption]);

<BAITabs
  activeKey={queryParams.type}
  onChange={(key) => {
    const stored = queryMapRef.current[key] || { queryParams: {} };
    setQueryParams(null);                  // reset to defaults first
    setQueryParams({ ...stored.queryParams, type: key as TypeFilterType });
    setTablePaginationOption(stored.tablePaginationOption || { current: 1 });
  }}
/>
```

The `setQueryParams(null)` reset-to-defaults line is important — without it,
values from the previous tab leak into the next (e.g. filtering by "email"
stays applied when switching to a tab without that column).

## 6. Controlled modals via URL (deep-link support)

For modals users should be able to deep-link to (e.g. the Folder Explorer in
FR-1846 #4921):

```tsx
const [{ folder: folderId }, setFolderId] = useQueryStates({
  folder: parseAsString,
});

<BAIUnmountAfterClose>
  <FolderExplorerModal
    open={!!folderId}
    folderId={folderId || undefined}
    onRequestClose={() => setFolderId({ folder: null })}
  />
</BAIUnmountAfterClose>
```

Reload in the middle of an explorer session → the modal reopens on the same
folder. Use `history: 'push'` (default) for these so Back closes the modal.

## 7. Do NOT mix `useQueryParams` (legacy) and `nuqs`

The repo still contains `useQueryParams` from `use-query-params` for a few
legacy flows (`useRelayPaginationQueryOptions` etc). Do not introduce new
usages. Migrate when touching nearby code:

```tsx
// ❌ legacy
const [params, setParams] = useQueryParams({
  filter: StringParam,
  page: withDefault(NumberParam, 1),
});

// ✅ nuqs
const [params, setParams] = useQueryStates({
  filter: parseAsString.withDefault(''),
  page: parseAsInteger.withDefault(1),
}, { history: 'replace' });
```

`useBAIPaginationOptionStateOnSearchParamLegacy` still exists for backward
compat — prefer the non-legacy variant (nuqs-based) for anything new.

## 8. Typing URL-sized enums with `parseAsStringLiteral`

```tsx
const typeFilterValues = ['all', 'interactive', 'batch', 'inference', 'system'] as const;
type TypeFilterType = (typeof typeFilterValues)[number];

const [queryParams] = useQueryStates({
  type: parseAsStringLiteral(typeFilterValues).withDefault('all'),
});

// queryParams.type: TypeFilterType
```

Invalid `?type=foo` in the URL is coerced to `undefined` (or the default),
so consumers never have to defend against out-of-range strings.

## 9. When NOT to use URL state

- Ephemeral local state (modal open driven by button click, hover, selection in a form) → `useState`
- Global UI state that applies across routes (sidebar collapsed) → `jotai`
- Server/GraphQL state → Relay
- Form draft values → antd Form

URL state is for: what someone else pasting the URL should see.

## Related Skills

- **`react-suspense-fetching`** — pairing deferred URL variables with `useLazyLoadQuery`
- **`react-relay-table`** — table pagination / filter / order as URL state
- **`react-modal-drawer`** — deep-linking a modal via query param
- **`relay-patterns`** — fragment architecture on the data side

## 10. Verification Checklist

- [ ] Uses `nuqs` (`useQueryStates`, `parseAs*`), not `use-query-params`.
- [ ] `history: 'replace'` unless Back-button navigation through tab/filter changes is a desired feature.
- [ ] Defaults either live in `.withDefault()` (when omission means the default) or in the derived `queryVariables` (for sort keys that should fall back without appearing in URL).
- [ ] Query variables and fetchKey wrapped in `useDeferredValue` when feeding `useLazyLoadQuery`.
- [ ] Pagination binds through `useBAIPaginationOptionStateOnSearchParam`, not hand-rolled.
- [ ] Tab-scoped per-tab state cached via `useRef`, with a `setQueryParams(null)` reset before applying stored values.
- [ ] `useBAIPaginationOptionStateOnSearchParamLegacy` not introduced in new code.
