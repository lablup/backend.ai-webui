# useLazyPaginatedQuery Hook

## Overview

`useLazyPaginatedQuery` is a custom hook for **offset-based pagination** with Relay. It accumulates items across pages, handles loading states with transitions, and resets when filter variables change.

## Purpose

Essential for **Pattern B (ID-based)** components that need:
- Offset-based pagination (not cursor-based)
- Accumulated data across pages
- Automatic deduplication
- Filter change detection and reset

## API

```typescript
function useLazyPaginatedQuery<T, ItemType>(
  query: GraphQLTaggedNode,
  initialPaginationVariables: Pick<T['variables'], 'limit'>,
  otherVariables: Omit<Partial<T['variables']>, 'limit' | 'offset'>,
  options: Parameters<typeof useLazyLoadQuery<T>>[2],
  { getItem, getId, getTotal }: extraOptions<T['response'], ItemType>,
): {
  paginationData: ItemType[] | undefined;
  result: T['response'];
  loadNext: () => void;
  hasNext: boolean;
  isLoadingNext: boolean;
}
```

## Parameters

### 1. `query: GraphQLTaggedNode`

GraphQL query with `$offset` and `$limit` variables:

```graphql
query MyPaginatedQuery(
  $offset: Int!
  $limit: Int!
  $filter: String
) {
  items(offset: $offset, first: $limit, filter: $filter) {
    count
    edges {
      node {
        id
        name
      }
    }
  }
}
```

### 2. `initialPaginationVariables: Pick<T['variables'], 'limit'>`

Initial page size (never changes after first render):

```typescript
{ limit: 10 }
```

### 3. `otherVariables: Omit<Partial<T['variables']>, 'limit' | 'offset'>`

All other query variables (filter, scopeId, etc.):

```typescript
{
  filter: mergeFilterValues([baseFilter, searchFilter]),
  scopeId: projectId ? `project:${projectId}` : undefined,
  permission: 'read_attribute' as const,
}
```

**Important**: When these change, pagination resets automatically.

### 4. `options: Parameters<typeof useLazyLoadQuery<T>>[2]`

Relay query options:

```typescript
{
  fetchPolicy: deferredOpen ? 'network-only' : 'store-only',
  fetchKey: deferredFetchKey,
}
```

### 5. `extraOptions: { getItem, getId, getTotal }`

Extractors for pagination logic:

```typescript
{
  getTotal: (result) => result.vfolder_nodes?.count ?? undefined,
  getItem: (result) => result.vfolder_nodes?.edges?.map((edge) => edge?.node),
  getId: (item) => item?.id,
}
```

## Return Value

```typescript
{
  paginationData: ItemType[] | undefined;  // Accumulated items
  result: T['response'];                    // Current page result
  loadNext: () => void;                     // Load next page
  hasNext: boolean;                         // More pages available?
  isLoadingNext: boolean;                   // Loading next page?
}
```

## Implementation

```typescript
export function useLazyPaginatedQuery<T, ItemType>(
  query: GraphQLTaggedNode,
  initialPaginationVariables: Pick<T['variables'], 'limit'>,
  otherVariables: Omit<Partial<T['variables']>, 'limit' | 'offset'>,
  options: Parameters<typeof useLazyLoadQuery<T>>[2],
  { getItem, getId, getTotal }: extraOptions<T['response'], ItemType>,
) {
  const previousResult = useRef<T['response'][]>([]);
  const [isLoadingNext, startLoadingNextTransition] = useTransition();

  // limit doesn't change after the first render
  const [limit] = useState(initialPaginationVariables.limit);
  const [offset, setOffset] = useState(0);

  const previousOtherVariablesRef = useRef(otherVariables);

  const isNewOtherVariables = !_.isEqual(
    previousOtherVariablesRef.current,
    otherVariables,
  );

  // Fetch the initial data using useLazyLoadQuery
  const result = useLazyLoadQuery<T>(
    query,
    {
      limit: isNewOtherVariables ? initialPaginationVariables.limit : limit,
      offset: isNewOtherVariables ? 0 : offset,
      ...otherVariables,
    },
    options,
  );

  const data = useMemo(() => {
    const items = getItem(result);
    if (isNewOtherVariables) {
      previousResult.current = [];
    }
    return items
      ? _.uniqBy([...previousResult.current, ...items], getId)
      : undefined;
  }, [result]);

  const hasNext = offset + limit < (getTotal(result) as number);

  const loadNext = useEventNotStable(() => {
    if (isLoadingNext || !hasNext) return;
    previousResult.current = data || [];
    startLoadingNextTransition(() => {
      const nextOffset = offset + limit;
      setOffset(nextOffset);
    });
  });

  useEffect(() => {
    // Reset the offset and limit when otherVariables change after success rendering
    if (isNewOtherVariables) {
      previousOtherVariablesRef.current = otherVariables;
      setOffset(0);
    }
  }, [isNewOtherVariables]);

  return {
    paginationData: data,
    result,
    loadNext,
    hasNext,
    isLoadingNext,
  };
}
```

## Key Features

### 1. Automatic Pagination Reset

```typescript
const isNewOtherVariables = !_.isEqual(
  previousOtherVariablesRef.current,
  otherVariables,
);

// Reset when variables change
if (isNewOtherVariables) {
  previousResult.current = [];
  setOffset(0);
}
```

**Example**: When search changes, pagination starts from page 1.

### 2. Item Accumulation & Deduplication

```typescript
const data = useMemo(() => {
  const items = getItem(result);
  if (isNewOtherVariables) {
    previousResult.current = [];
  }
  return items
    ? _.uniqBy([...previousResult.current, ...items], getId)
    : undefined;
}, [result]);
```

- Accumulates items from all loaded pages
- Uses `_.uniqBy(getId)` to prevent duplicates
- Resets on variable change

### 3. Transition-Based Loading

```typescript
const loadNext = useEventNotStable(() => {
  if (isLoadingNext || !hasNext) return;
  previousResult.current = data || [];
  startLoadingNextTransition(() => {
    const nextOffset = offset + limit;
    setOffset(nextOffset);
  });
});
```

- Uses `useTransition()` for non-blocking updates
- Prevents multiple simultaneous loads
- Checks `hasNext` before loading

### 4. hasNext Calculation

```typescript
const hasNext = offset + limit < (getTotal(result) as number);
```

- Compares current offset + limit with total count
- Returns `false` when all items loaded

## Usage Example

```typescript
const { paginationData, result, loadNext, isLoadingNext } =
  useLazyPaginatedQuery<BAIVFolderSelectPaginatedQuery, VFolderNode>(
    graphql\`
      query BAIVFolderSelectPaginatedQuery(
        $offset: Int!
        $limit: Int!
        $filter: String
      ) {
        vfolder_nodes(
          offset: $offset
          first: $limit
          filter: $filter
          order: "-created_at"
        ) {
          count
          edges {
            node {
              id
              name
              row_id
            }
          }
        }
      }
    \`,
    { limit: 10 },
    {
      filter: mergeFilterValues([
        baseFilter,
        searchStr ? \`name ilike "%\${searchStr}%"\` : null,
      ]),
    },
    {
      fetchPolicy: deferredOpen ? 'network-only' : 'store-only',
      fetchKey: deferredFetchKey,
    },
    {
      getTotal: (result) => result.vfolder_nodes?.count ?? undefined,
      getItem: (result) =>
        result.vfolder_nodes?.edges?.map((edge) => edge?.node),
      getId: (item) => item?.id,
    },
  );

// Use in BAISelect
<BAISelect
  options={_.map(paginationData, (item) => ({
    label: item?.name,
    value: item?.id,
  }))}
  endReached={() => loadNext()}
  footer={
    _.isNumber(result.vfolder_nodes?.count) ? (
      <TotalFooter
        loading={isLoadingNext}
        total={result.vfolder_nodes.count}
      />
    ) : undefined
  }
/>
```

## Comparison with usePaginationFragment

| Feature | useLazyPaginatedQuery | usePaginationFragment |
|---------|----------------------|---------------------|
| **Pagination Type** | Offset-based | Cursor-based |
| **Data Accumulation** | Manual with `_.uniqBy` | Automatic via `@connection` |
| **Relay Hook** | `useLazyLoadQuery` | Built-in fragment hook |
| **Reset on Filter** | Automatic | Manual refetch |
| **Complexity** | Higher | Lower |
| **Use Case** | Offset pagination APIs | Cursor pagination (standard) |

## Best Practices

1. **Use with deferredValue**
   ```typescript
   const deferredOpen = useDeferredValue(open);
   useLazyPaginatedQuery(query, variables, otherVars, {
     fetchPolicy: deferredOpen ? 'network-only' : 'store-only',
   });
   ```

2. **Reset pagination on search**
   - Automatically handled when `otherVariables` changes
   - Search string changes → `otherVariables` changes → reset to page 1

3. **Check hasNext before loadNext**
   ```typescript
   endReached={() => {
     if (!isLoadingNext) {
       loadNext(); // Already checks hasNext internally
     }
   }}
   ```

4. **Use result for count, paginationData for items**
   ```typescript
   // For total count
   result.vfolder_nodes?.count

   // For accumulated items
   paginationData // Already deduplicated
   ```

## Dependencies

- `useEventNotStable`: Stable callback reference
- `useLazyLoadQuery`: Relay's lazy query hook
- `lodash`: For `_.uniqBy` and `_.isEqual`
- React: `useState`, `useMemo`, `useRef`, `useEffect`, `useTransition`
