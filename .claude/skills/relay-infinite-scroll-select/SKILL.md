---
name: relay-infinite-scroll-select
description: >
  Create Relay-based infinite scroll select components extending BAISelect.
  Supports name-based values (usePaginationFragment) and id-based values
  (useLazyLoadQuery + useLazyPaginatedQuery) with search, optimistic updates,
  and multiple selection modes.
---

# Relay Infinite Scroll Select Component Creator

## Activation Triggers

- "Create a Relay infinite scroll select for [entity]"
- "Build a select with GraphQL pagination"
- "Add [Entity]Select component with infinite scroll"
- "Create a select component that fetches from GraphQL"

## Quick Start Decision Tree

```
START: What type of value does your select use?

┌─────────────────────────────────────────────────────────────┐
│ Q: Is the select value the same as the display label?      │
│    (e.g., entity's name field is both value and label)     │
└─────────────────────────────────────────────────────────────┘
                         │
          ┌──────────────┴──────────────┐
          │                             │
         YES                           NO
          │                             │
          ▼                             ▼
   ┌─────────────┐             ┌─────────────┐
   │  Pattern A  │             │  Pattern B  │
   │  (Simple)   │             │  (Complex)  │
   └─────────────┘             └─────────────┘
          │                             │
          ▼                             ▼
Reference:                    Reference:
BAIAdminResourceGroupSelect   BAIVFolderSelect
```

## Pattern Comparison

| Criteria | Pattern A (Name-Based) | Pattern B (ID-Based) |
|----------|----------------------|-------------------|
| **Value Type** | String (name) | String (id/row_id) |
| **Relay Hook** | usePaginationFragment | useLazyLoadQuery + useLazyPaginatedQuery |
| **Queries** | 1 fragment | 2 queries |
| **Multiple Mode** | Single only | Full support |
| **Global ID** | Not needed | Conversion required |
| **Optimistic UI** | Not needed | Required |
| **State Management** | Simple | Complex |
| **Ref Export** | No | Yes (refetch support) |
| **Complexity** | 🟢 ~100 lines | 🟡 ~350 lines |
| **Use Case** | Name is unique identifier | ID different from name |

## Implementation Checklists

### Pattern A Checklist (Name-Based Value)

**Component Setup:**
- [ ] Import `usePaginationFragment` from 'react-relay'
- [ ] Import BAISelect, TotalFooter, Skeleton
- [ ] Create props interface extending `Omit<BAISelectProps, 'options' | 'labelInValue'>`
- [ ] Add `queryRef` prop for fragment key

**GraphQL Fragment:**
```typescript
graphql\`
  fragment YourComponent_fragment on Query
  @argumentDefinitions(
    first: { type: "Int", defaultValue: 10 }
    after: { type: "String" }
    filter: { type: "YourFilterType" }
  )
  @refetchable(queryName: "YourComponentPaginationQuery") {
    yourEntities(first: $first, after: $after, filter: $filter)
      @connection(key: "YourComponent_yourEntities") {
      count
      edges {
        node {
          id
          name
        }
      }
    }
  }
\`
```

**Required Checklist:**
- [ ] @argumentDefinitions (first, after, filter)
- [ ] @refetchable with unique queryName
- [ ] @connection with unique key
- [ ] count field for total
- [ ] Required fields (id, name)

**BAISelect Integration:**
- [ ] `ref={selectRef}` with useRef
- [ ] `options` from mapped edges
- [ ] `searchAction` with `refetch()` and `scrollTo(0)`
- [ ] `endReached={() => hasNext && loadNext(10)}`
- [ ] `notFoundContent` with Skeleton
- [ ] `footer` with TotalFooter

### Pattern B Checklist (ID-Based Value)

**Component Setup:**
- [ ] Import `useLazyLoadQuery`, `useDeferredValue`, `useTransition`
- [ ] Import `useLazyPaginatedQuery`, `useFetchKey` custom hooks
- [ ] Import `useControllableValue` from 'ahooks'
- [ ] Import `toLocalId`, `mergeFilterValues` helpers
- [ ] Add 'use memo' directive

**State Management:**
- [ ] `useControllableValue` for value and open
- [ ] `useDeferredValue` for controllableValue, open, fetchKey
- [ ] `useState` for searchStr and optimisticValueWithLabel
- [ ] `useTransition` for refetch
- [ ] `useFetchKey` for cache invalidation

**GraphQL Queries:**

Query 1 - Selected Values:
```typescript
graphql\`
  query YourComponentValueQuery(
    $selectedFilter: String
    $skipSelected: Boolean!
  ) {
    yourEntities(filter: $selectedFilter)
      @skip(if: $skipSelected) {
      edges {
        node {
          id
          row_id
          name
        }
      }
    }
  }
\`
```

Query 2 - Paginated Options:
```typescript
graphql\`
  query YourComponentPaginatedQuery(
    $offset: Int!
    $limit: Int!
    $filter: String
  ) {
    yourEntities(
      offset: $offset
      first: $limit
      filter: $filter
      order: "-created_at"
    ) {
      count
      edges {
        node {
          id
          row_id
          name
        }
      }
    }
  }
\`
```

**Query Checklist:**
- [ ] ValueQuery with @skip directive
- [ ] PaginatedQuery with offset/limit
- [ ] selectedFilter uses toLocalId() for Global IDs
- [ ] Both queries have id, row_id, name
- [ ] count field in PaginatedQuery

**Value-to-Label Mapping:**
- [ ] Build `controllableValueWithLabel` from selected query
- [ ] Maintain selection order with _.castArray
- [ ] Filter out null edges
- [ ] Fallback to value as label when no data

**Optimistic Updates:**
- [ ] `useState` for optimisticValueWithLabel
- [ ] Switch between optimistic and real value based on deferred comparison
- [ ] Preserve labels in onChange (handle React element labels)

**BAISelect Integration:**
- [ ] `labelInValue` prop
- [ ] `value` with optimistic switching
- [ ] `onChange` with label preservation
- [ ] `searchAction` with setState
- [ ] `endReached={() => loadNext()}`
- [ ] `labelRender`/`optionRender` for custom display
- [ ] `loading` with three conditions

**Ref Export:**
- [ ] `useImperativeHandle` for refetch
- [ ] `startRefetchTransition` wrapper
- [ ] Export ref interface type

## Common Patterns

### Multiple Mode Support

```typescript
// Always use _.castArray for uniform handling
_.castArray(controllableValue).map((value) => {
  // Process each value
});
```

### Search with Transitions

```typescript
searchAction={async (value) => {
  // Pattern A: Refetch
  selectRef.current?.scrollTo(0);
  refetch({ filter: value ? { name: { contains: value } } : null });

  // Pattern B: State update
  setSearchStr(value);
}}
```

### Global ID Conversion

```typescript
import { toLocalId, toGlobalId } from '../../helper';

// When filtering (valuePropName === 'id')
const filterValue = valuePropName === 'id' ? toLocalId(value) : value;
```

### Filter Merging

```typescript
import { mergeFilterValues } from '../BAIPropertyFilter';

const filter = mergeFilterValues([
  baseFilter,
  searchStr ? \`name ilike "%\${searchStr}%"\` : null,
  externalFilter,
], '&'); // Default operator
```

### Controllable Props

```typescript
const [value, setValue] = useControllableValue(props);
const [open, setOpen] = useControllableValue(props, {
  valuePropName: 'open',
  trigger: 'onOpenChange',
});
```

## Best Practices

### Performance

1. **Use 'use memo' directive (Pattern B)**
   ```typescript
   const YourSelect: React.FC<Props> = (props) => {
     'use memo';
     // Component logic
   };
   ```

2. **Defer values to prevent Suspense flicker**
   ```typescript
   const deferredOpen = useDeferredValue(open);
   const deferredValue = useDeferredValue(value);
   const deferredFetchKey = useDeferredValue(fetchKey);
   ```

3. **Optimize fetchPolicy**
   ```typescript
   // Selected values
   fetchPolicy: !_.isEmpty(value) ? 'store-or-network' : 'store-only'

   // Paginated options
   fetchPolicy: deferredOpen ? 'network-only' : 'store-only'
   ```

4. **Skip unnecessary queries**
   ```graphql
   @skip(if: $skipSelected)
   ```

### UX

1. **Always scroll to top on search**
   ```typescript
   selectRef.current?.scrollTo(0);
   ```

2. **Maintain selection order**
   ```typescript
   _.castArray(deferredValue)
     .map((v) => findEdge(v))
     .filter(Boolean);
   ```

3. **Handle React element labels**
   ```typescript
   const label = _.isString(v.label)
     ? v.label
     : (options.find((opt) => opt.value === v.value)?.label ?? v.value);
   ```

4. **Loading state priorities**
   ```typescript
   loading={
     loading ||
     controllableValue !== deferredControllableValue ||
     isPendingRefetch
   }
   ```

## Common Pitfalls & Solutions

| Pitfall | Impact | Solution |
|---------|--------|----------|
| Missing `_.castArray` | Single mode breaks | Always normalize values |
| Not using `deferredValue` | Suspense flicker | Defer controllable values |
| Missing `@skip` directive | Unnecessary queries | Add skip when empty |
| Not preserving labels | Lost labels on tag removal | Check if label is string or element |
| Hardcoded valuePropName | Inflexible component | Use prop: `'id' \| 'row_id'` |
| Direct option mutation | Stale data | Rebuild from query results |
| No scroll on search | Poor UX | Call `selectRef.current?.scrollTo(0)` |
| Wrong fetchPolicy | Performance issues | Use appropriate policy per query |

## TypeScript Patterns

### Props Interface

```typescript
export interface YourComponentSelectProps
  extends Omit<BAISelectProps, 'options' | 'labelInValue'> {
  // Pattern A
  queryRef?: YourFragment$key;

  // Pattern B
  valuePropName?: 'id' | 'row_id';
  filter?: string;
  ref?: React.Ref<YourComponentRef>;
}
```

### Ref Interface (Pattern B)

```typescript
export interface YourComponentRef {
  refetch: () => void;
}
```

### Type Extraction (Pattern B)

```typescript
export type YourEntityNode = NonNullable<
  NonNullable<
    YourPaginatedQuery['response']['yourEntities']
  >['edges'][number]
>['node'];
```

## Real-World Examples

### Example 1: Simple Entity Selection (Pattern A)

```typescript
// Scenario: Select resource group by name
<BAIAdminResourceGroupSelect
  queryRef={queryRef}
  placeholder="Select resource group"
  onChange={(name) => setSelectedGroup(name)}
/>
```

### Example 2: Multiple Selection with ID (Pattern B)

```typescript
const vfolderSelectRef = useRef<BAIVFolderSelectRef>(null);

<BAIVFolderSelect
  ref={vfolderSelectRef}
  valuePropName="id"
  mode="multiple"
  value={selectedFolderIds}
  onChange={setSelectedFolderIds}
  onClickVFolder={(id) => navigate(\`/folders/\${id}\`)}
/>

<Button onClick={() => vfolderSelectRef.current?.refetch()}>
  Refresh
</Button>
```

### Example 3: With External Filters (Pattern B)

```typescript
<BAIVFolderSelect
  filter={mergeFilterValues([
    'status != "DELETE_COMPLETE"',
    ownershipFilter ? \`ownership_type == "\${ownershipFilter}"\` : null,
  ])}
  excludeDeleted
  onChange={(ids) => handleSelection(ids)}
/>
```

## Quick Reference

### When to Use Which Pattern

**Pattern A** when:
- ✅ Entity name is unique
- ✅ Single selection sufficient
- ✅ Simple implementation preferred
- ✅ No Global ID conversion needed

**Pattern B** when:
- ✅ ID different from display name
- ✅ Multiple selection required
- ✅ Need external refetch capability
- ✅ Global ID conversion needed
- ✅ Optimistic UI updates important

### Reference Files

- **Pattern A**: `references/patterns/BAIAdminResourceGroupSelect.md`
- **Pattern B**: `references/patterns/BAIVFolderSelect.md`
- **Base Component**: `references/base/BAISelect.md`
- **Hooks**: `references/hooks/` (useFetchKey, useLazyPaginatedQuery, useEventNotStable)
- **Helpers**: `references/helpers/` (relay-helpers, mergeFilterValues)

### File Structure

```
YourEntitySelect.tsx
├── Imports (React, Relay, hooks, helpers)
├── Type definitions (Props, Ref, Node extraction)
├── Component with 'use memo'
│   ├── State management
│   ├── GraphQL queries
│   ├── Value-to-label mapping (Pattern B)
│   ├── useImperativeHandle (Pattern B)
│   ├── Options building
│   └── BAISelect integration
└── Export
```

## Internationalization

Use `comp:` prefix for component translations:

```typescript
t('comp:YourComponentSelect.PlaceHolder')
t('comp:YourComponentSelect.SelectEntity')
t('comp:YourComponentSelect.NoEntityFound')
```

## Additional Resources

For comprehensive examples and detailed implementation, refer to:
- `references/README.md` - File overview and usage notes
- Full pattern implementations in `references/patterns/`
- Base component API in `references/base/`
- Hook documentation in `references/hooks/`
- Helper utilities in `references/helpers/`
