# GraphQL Pagination Argument Mode Rule

A GraphQL connection field exposes up to **three mutually-exclusive pagination
modes**. Within a single query you must use the arguments of **exactly one**
mode — never mix arguments from different modes.

| Mode | Arguments | Use for |
|---|---|---|
| Forward cursor | `first` + `after` | Infinite scroll / "load more" (cursor-based) |
| Backward cursor | `last` + `before` | Reverse infinite scroll |
| Offset | `limit` + `offset` | Page-number table pagination |

**Never combine across modes** — e.g. `first` + `offset`, `limit` + `after`,
`first` + `last`. The **Strawberry V2 connections** (`*V2` fields marked
`@join__field(graph: STRAWBERRY)` in `data/schema.graphql`, e.g.
`domainProjectsV2`, `adminProjectsV2`, `adminKeypairResourcePoliciesV2`)
**strictly enforce** this at runtime and reject mixed args with:

```
Invalid GraphQL parameters. (Only one pagination mode allowed:
(first/after) OR (last/before) OR (limit/offset))
```

## Why

The mistake is easy to make because `useBAIPaginationOptionState`
(`react/src/hooks/reactPaginationQueryOptions.tsx`) returns **both** `limit`
**and** `first` (the same `pageSize` value) plus `offset`:

```ts
baiPaginationOption: { limit: pageSize, first: pageSize, offset }
```

It is a footgun: grabbing `first` and `offset` from it compiles and type-checks
fine (both are valid `Int` query variables), but mixes cursor-mode `first` with
offset-mode `offset` and fails **only at runtime** against a V2 connection.

Some **legacy** connections (e.g. `user_nodes`, `*_nodes` on the non-Strawberry
graph) historically tolerate `first` + `offset` as their offset mode, which is
why mixed usage exists in older code (`UserManagement.tsx`, `AgentList.tsx`).
Do not copy that pattern onto a V2 connection.

## Rules

1. **Choose the mode from the UX**, then use only that mode's argument pair:
   - **Table pagination (page numbers)** → `limit` + `offset`.
   - **Infinite scroll / load-more** → `first` + `after` (cursor).
   - **Backward scroll** → `last` + `before`.
2. **For offset/table pagination, always use `limit`** (not `first`) alongside
   `offset`:
   - `limit: baiPaginationOption.limit`
   - `offset: baiPaginationOption.offset`
3. **For cursor pagination, use `first`/`after`** and read `pageInfo`
   (`hasNextPage`, `endCursor`); do **not** also pass `offset`/`limit`.
4. **Never pass arguments from two modes** in the same connection call, even if
   one is `null`/`undefined` — omit the other mode's arguments entirely.
5. When in doubt about a `*V2` field, check its signature in
   `data/schema.graphql` (it lists `before, after, first, last, limit, offset`)
   and pick **one** pair.

## Pattern

### ❌ Wrong — mixing `first` (cursor) with `offset` on a V2 connection

```tsx
// Runtime error: "Only one pagination mode allowed ..."
const queryVariables = {
  first: baiPaginationOption.first,   // cursor mode arg
  offset: baiPaginationOption.offset, // offset mode arg  ← mixed!
};
// query domainProjectsV2(first: $first, offset: $offset) { ... }
```

### ✅ Correct — offset/table pagination uses `limit` + `offset`

```tsx
const queryVariables = {
  limit: baiPaginationOption.limit,
  offset: baiPaginationOption.offset,
};
// query domainProjectsV2(limit: $limit, offset: $offset) {
//   count
//   edges { node { ... } }
// }
```

### ✅ Correct — infinite scroll uses `first` + `after`

```graphql
query Foo($first: Int, $after: String) {
  someV2(first: $first, after: $after) {
    edges { node { ... } cursor }
    pageInfo { hasNextPage endCursor }
  }
}
```

## Verification

- After wiring pagination on a `*V2` connection, confirm the query declares and
  passes **only one** of: `(first, after)`, `(last, before)`, `(limit, offset)`.
- Grep the query for the forbidden combinations:
  `first` + `offset`, `limit` + `after`, `first` + `last`.
- If you used `useBAIPaginationOptionState` for table pagination, verify you
  passed `baiPaginationOption.limit` (not `.first`) together with `.offset`.

## Related

- `react/src/hooks/reactPaginationQueryOptions.tsx` — `useBAIPaginationOptionState`
  (local state) and `useBAIPaginationOptionStateOnSearchParam` (URL state).
- `react/src/helper/index.tsx` — `convertToOrderBy` for the `orderBy` argument
  (orthogonal to pagination).
- Canonical `limit`/`offset` examples: `StorageProxyList.tsx`,
  `AutoScalingRuleList.tsx`, `AgentSelect.tsx`.
