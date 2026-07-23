---
name: react-suspense-fetching
description: >
  Use when fetching Relay data with `useLazyLoadQuery`, choosing a
  `fetchPolicy`, placing Suspense boundaries, triggering a refetch after
  mutation, or deciding when `useTanQuery` (REST) is acceptable. Covers
  `fetchKey` + `useDeferredValue` and auto-refresh patterns.
---

# Data Fetching & Suspense

Patterns from `AdminComputeSessionListPage`, `UserManagement`, `useStartSession`,
FR-602 (#3249) Suspense, FR-1232 (#3989) Dashboard suspense, FR-941 (#3602)
no-fallback-on-auto-refresh, FR-527 (#3169) `BAIFetchKeyButton`, FR-1351 (#4104)
`useFetchKey` over `useUpdatableState`.

## Activation Triggers

- Writing a component that fetches via Relay `useLazyLoadQuery`
- Choosing between Suspense fallback and inline skeleton
- Variables change but don't want to retrigger a full Suspense fallback
- Mutations need to refresh list data
- Legacy REST endpoint: when is `useTanQuery` acceptable?

## Gotchas

- **`useLazyLoadQuery` suspends on every variable identity change.** Wrap `queryVariables` AND `fetchKey` in `useDeferredValue` or the UI tears on every keystroke/sort/page change.
- **`INITIAL_FETCH_KEY` equality** uses the imported constant, not a string literal. `import { INITIAL_FETCH_KEY } from 'backend.ai-ui'` — comparing against `'INITIAL_FETCH_KEY'` always returns false.
- **`fetchPolicy: 'network-only'` skips cache reads.** If the optimistic update hasn't landed yet, first render shows Suspense fallback. Choose `store-and-network` on initial load.
- **Auto-refreshing cards must NOT sit inside a narrow Suspense** — each tick flashes the fallback (the FR-941 regression). Use `useRefetchableFragment` + `useTransition` and put the Suspense higher.
- **`@catch(to: RESULT)` + `@required(action: THROW)` inside edges**: a thrown required inside the catch boundary makes the whole field `{ ok: false }`. Consumers must branch on `!ok`.
- **`useTanQuery` `queryKey` must include every reactive variable** or stale-closure bugs appear. `enabled: false` does NOT suppress queryKey tracking.
- **Imperative `fetchQuery` updates the store by node id** — components only re-render when their fragment shape matches. If nothing re-renders after `fetchQuery`, your fragment doesn't match the returned data.
- **Nested Suspense boundaries cascade inside-out** — innermost paints its fallback first. Place boundaries where *independent* subtrees can fail, not at every route.

## 1. The canonical orchestrator pattern

```tsx
const [queryParams, setQueryParams] = useQueryStates({ /* … */ });
const { baiPaginationOption } = useBAIPaginationOptionStateOnSearchParam({
  current: 1, pageSize: 10,
});

const [fetchKey, updateFetchKey] = useFetchKey();

const queryVariables = {
  first: baiPaginationOption.first,
  offset: baiPaginationOption.offset,
  filter: queryParams.filter,
  order: queryParams.order || '-created_at',
};

const deferredQueryVariables = useDeferredValue(queryVariables);
const deferredFetchKey = useDeferredValue(fetchKey);

const data = useLazyLoadQuery<QueryType>(
  graphql`…`,
  deferredQueryVariables,
  {
    fetchKey: deferredFetchKey,
    fetchPolicy: deferredFetchKey === INITIAL_FETCH_KEY
      ? 'store-and-network'   // first load — can use cached data while revalidating
      : 'network-only',        // subsequent refresh — always hit network
  },
);
```

### Why these four moving parts

| Piece | What it does |
|---|---|
| `useFetchKey()` | Gives a bumpable key so refresh buttons can force a re-query |
| `useDeferredValue(queryVariables)` | Variables change → next render starts fetching, but current UI keeps painting |
| `useDeferredValue(fetchKey)` | Same, for the refresh trigger |
| `fetchPolicy` dispatch on `INITIAL_FETCH_KEY` | First render: show cache if any; subsequent refresh: always re-fetch |

Loading indicator derives from the deferred-inequality, NOT a separate `useState`:

```tsx
const loading =
  deferredQueryVariables !== queryVariables ||
  deferredFetchKey !== fetchKey;
```

`BAIFetchKeyButton` uses that same derivation.

## 2. `useFetchKey`, not `useUpdatableState`

FR-1351 (#4104) migrated `ComputeSessionListPage` off `useUpdatableState('first')`.
Always use `useFetchKey`:

```tsx
import { useFetchKey, INITIAL_FETCH_KEY } from 'backend.ai-ui';

const [fetchKey, updateFetchKey] = useFetchKey();

// in a mutation:
onCompleted: () => { updateFetchKey(); message.success(...); }
```

## 3. Suspense fallback placement

### 3.1 Page boundary

Pages use a Suspense at the route level (it's already there via the router setup
after FR-2521 #6596). Individual page components **can** define a narrower
Suspense when they show rich skeletons for long queries.

```tsx
<Suspense fallback={<Skeleton active />}>
  <PageContents />
</Suspense>
```

Never put `<Suspense>` on a boundary that unmounts on every variable change —
that causes UI flashing. Rely on `useDeferredValue` instead to keep the old
UI painting while loading.

### 3.2 Card-shaped skeletons

Use `BAIFallbackCard` for card containers:

```tsx
<Suspense fallback={<BAIFallbackCard />}>
  <ResourcePanel />
</Suspense>
```

### 3.3 Button-shaped skeletons

Never render `<Button loading />` as a Suspense fallback. Use
`<Skeleton.Button size="small" active />`:

```tsx
<Suspense fallback={<Skeleton.Button size="small" active />}>
  <LazyFetchedButton />
</Suspense>
```

### 3.4 Do NOT show fallback on auto-refresh (FR-941)

When a card's data auto-refreshes (interval, subscription), a Suspense fallback
flashes each tick. Patterns to avoid this:

- Use `useRefetchableFragment` with `useTransition` so the transition keeps the
  old data while loading.
- Or gate the refresh behind `useDeferredValue` and don't wrap in a narrow
  Suspense — let the parent route handle it.

```tsx
const [isPending, startTransition] = useTransition();

startTransition(() => refetch({ /* new vars */ }));
// UI shows `isPending` as a subtle indicator, but prior data stays visible.
```

## 4. `fetchPolicy` selection

| Policy | Use |
|---|---|
| `store-and-network` | First load / navigating to a page — show cache if any, re-validate in background |
| `network-only` | User hit refresh, or mutation-triggered refresh — don't trust cache |
| `store-only` | Re-render from cache after an imperative `fetchQuery` populated the store |
| `store-or-network` | Rare — only cache if present; otherwise fetch. Don't re-validate |

The `deferredFetchKey === INITIAL_FETCH_KEY` dispatch is idiomatic: it's only
`store-and-network` on the very first render (and a `router.Nav` that resets the
fetchKey). Any refresh thereafter is `network-only`.

## 5. Imperative: `fetchQuery`

For side-effect callbacks that aren't part of a component's rendered query
(e.g. notification `onClick` resolvers, `useStartSession`):

```tsx
fetchQuery<MyQuery>(relayEnv, graphql`…`, { id: globalId }).toPromise()
  .then((result) => {
    // Relay store updates automatically for matched node IDs.
    // Other components reading those nodes re-render.
  });
```

Prefer this over `refetch` when you don't need to re-render your own component.

## 6. React-Query (`useTanQuery`) — only for REST

Relay is the default. `useTanQuery` / `useTanMutation` (TanStack Query, aliased
in `hooks/reactQueryAlias`) is used ONLY for legacy REST endpoints like
`baiClient.vfolder.list_allowed_types()` — calls that aren't exposed through
the GraphQL manager.

```tsx
const { data: allowedTypes, isFetching } = useTanQuery({
  queryKey: ['allowedTypes', modalProps.open],
  enabled: modalProps.open,
  queryFn: () =>
    modalProps.open ? baiClient.vfolder.list_allowed_types() : undefined,
});
```

Rules:

- `queryKey` must include any state the query depends on (don't rely on stale
  closures — FR-1260-ish lesson).
- `enabled` so the query doesn't run when the owning modal/drawer is closed.
- Mutations go through `useTanMutation` with strongly-typed `TData`, `TError`,
  `TVariables`.

## 7. Handling nullable / error result unions

Use Relay client `@catch(to: RESULT)` for GraphQL nodes that can fail at the
node level:

```graphql
computeSessionNodeResult: compute_session_nodes(...) @catch(to: RESULT) {
  edges @required(action: THROW) {
    node @required(action: THROW) { … }
  }
  count
}
```

Then:

```tsx
const { computeSessionNodeResult } = queryRef;
const sessions = computeSessionNodeResult.ok
  ? computeSessionNodeResult.value
  : null;
```

For lists, use `filterOutNullAndUndefined` / `filterOutEmpty` instead of
inline `.filter(Boolean)` to keep types narrow.

## 8. Error Boundaries

- `BAIErrorBoundary` — user-facing error UI (the default).
- `ErrorBoundaryWithNullFallback` — silent failure for non-critical widgets.

Place boundaries at component boundaries that should fail independently. Do
NOT wrap every single route in a new boundary — lift the common one up.
FR-1578 (#4430) cleaned up duplicate per-route boundaries.

```tsx
<BAIErrorBoundary>
  <FeatureSection />
</BAIErrorBoundary>

<ErrorBoundaryWithNullFallback>
  <OptionalBadge />
</ErrorBoundaryWithNullFallback>
```

## 9. Promise.allSettled for fan-out REST

When firing multiple REST calls, `Promise.allSettled` makes partial failures
explicit (FR-1384 #4165). See `react-async-actions` for the full pattern.

## Related Skills

- **`relay-patterns`** — fragment architecture (`useFragment`, `useRefetchableFragment`)
- **`react-url-state`** — deferred URL-backed query variables
- **`react-relay-table`** — orchestrator wiring for list queries
- **`react-async-actions`** — `updateFetchKey()` to trigger refresh after mutation
- **`relay-infinite-scroll-select`** — `usePaginationFragment` variant

## 10. Verification Checklist

- [ ] Query variables + fetchKey both go through `useDeferredValue`.
- [ ] `fetchPolicy` dispatches on `INITIAL_FETCH_KEY` vs later refresh.
- [ ] `useFetchKey`, not `useUpdatableState`.
- [ ] Auto-refreshing cards use transitions/refetch, not a Suspense boundary that flashes.
- [ ] Suspense fallback sized to the content (Skeleton.Button, BAIFallbackCard, etc.).
- [ ] REST-only dependency uses `useTanQuery` with a complete `queryKey` and `enabled` gating.
- [ ] Nodes that can fail at node-level use `@catch(to: RESULT)`.
- [ ] Error boundaries placed at independent-failure boundaries, not per-route.
