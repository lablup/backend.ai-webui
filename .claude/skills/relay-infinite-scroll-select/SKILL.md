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
START: Does your select need dynamic query parameters?

┌─────────────────────────────────────────────────────────────┐
│ Q: Do you need dynamic control over query parameters?      │
│    (filter, limit, first, order, etc.)                     │
│    OR need external refetch capability?                    │
└─────────────────────────────────────────────────────────────┘
                         │
          ┌──────────────┴──────────────┐
          │                             │
         NO                            YES
          │                             │
          ▼                             ▼
   ┌─────────────┐             ┌─────────────┐
   │  Pattern A  │             │  Pattern B  │
   │  (Simple)   │             │ (Dynamic)   │
   └─────────────┘             └─────────────┘
          │                             │
          ▼                             ▼
Reference:                    References:
BAIAdminResourceGroupSelect   BAIUserSelect (email-based)
                              BAIVFolderSelect (id-based)
```

## Pattern Comparison

| Criteria | Pattern A (Simple) | Pattern B (Dynamic) |
|----------|-------------------|-------------------|
| **Value Type** | String (name) | Any (name, email, id, row_id, etc.) |
| **Relay Hook** | usePaginationFragment | useLazyLoadQuery + useLazyPaginatedQuery |
| **Queries** | 1 fragment | 2 queries |
| **Dynamic First** | ❌ Not needed | ✅ **Default** (fetches all selected values) |
| **Dynamic Parameters** | ❌ Limited | ✅ Full control (filter, first, limit, order, etc.) |
| **Multiple Mode** | Single only | Full support |
| **Global ID** | Not needed | Can handle (if needed) |
| **Optimistic UI** | Not needed | Required |
| **State Management** | Simple | Complex |
| **Ref Export** | No | Yes (refetch support) |
| **Complexity** | 🟢 ~100 lines | 🟡 ~300-350 lines |
| **Use Case** | Simple, static requirements | Dynamic filters, external refetch, multiple props control |

### Pattern B Examples by Value Type

| Example | Value Type | Special Features |
|---------|-----------|------------------|
| **BAIUserSelect** | Email | Dynamic `first`, email filtering |
| **BAIVFolderSelect** | ID / row_id | Dynamic `first`, Global ID conversion, scope filtering |
| **Custom Select** | Name | Can use Pattern B even with name if dynamic control needed |

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
- [ ] `showSearch` with conditional handling (see showSearch Configuration section)
- [ ] `endReached={() => hasNext && loadNext(10)}`
- [ ] `notFoundContent` with Skeleton
- [ ] `footer` with TotalFooter

### Pattern B Checklist (ID-Based Value)

**Component Setup:**
- [ ] Import `useLazyLoadQuery`, `useDeferredValue`, `useTransition`, `useOptimistic`
- [ ] Import `useLazyPaginatedQuery`, `useFetchKey`, `useDebouncedDeferredValue` custom hooks
- [ ] Import `useControllableValue` from 'ahooks'
- [ ] Import `toLocalId`, `mergeFilterValues` helpers
- [ ] Add 'use memo' directive

**State Management:**
- [ ] `useControllableValue` for value and open
- [ ] `useDeferredValue` for controllableValue, open, and fetchKey
- [ ] `useState` for searchStr and optimisticValueWithLabel
- [ ] `useDebouncedDeferredValue` for searchStr (debounce + defer query execution)
- [ ] `useOptimistic` for optimisticSearchStr (immediate UI feedback) - simple pattern without dispatcher
- [ ] `useTransition` for refetch
- [ ] `useFetchKey` for cache invalidation

**GraphQL Queries:**

Query 1 - Selected Values (with Dynamic First):
```typescript
graphql\`
  query YourComponentValueQuery(
    $selectedFilter: String
    $first: Int!
    $skipSelected: Boolean!
  ) {
    yourEntities(filter: $selectedFilter, first: $first)
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

// Variables
{
  selectedFilter: /* filter based on selected values */,
  first: _.castArray(deferredControllableValue).length, // 🔑 Dynamic
  skipSelected: _.isEmpty(deferredControllableValue),
}
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
- [ ] **ValueQuery with dynamic `$first` parameter (REQUIRED for Pattern B)**
- [ ] PaginatedQuery with offset/limit
- [ ] selectedFilter uses toLocalId() for Global IDs (if using Global IDs)
- [ ] Both queries have required fields (id, name, or email)
- [ ] count field in PaginatedQuery
- [ ] **Variables include `first: _.castArray(value).length` (REQUIRED for Pattern B)**

**Value-to-Label Mapping:**
- [ ] Build `controllableValueWithLabel` from selected query
- [ ] Maintain selection order with _.castArray
- [ ] Filter out null edges
- [ ] Fallback to value as label when no data

**Optimistic Updates:**
- [ ] `useOptimistic` for optimisticSearchStr (search input feedback)
- [ ] `useState` for optimisticValueWithLabel (selection feedback)
- [ ] Switch between optimistic and real value based on deferred comparison
- [ ] Preserve labels in onChange (handle React element labels)

**BAISelect Integration:**
- [ ] `labelInValue` prop
- [ ] `value` with optimistic switching
- [ ] `onChange` with label preservation
- [ ] `searchAction` with `setOptimisticSearchStr` then `setSearchStr` (no transition wrapper needed)
- [ ] `showSearch` with conditional handling (see showSearch Configuration section)
- [ ] `showSearch.searchValue` set to `optimisticSearchStr` for immediate feedback
- [ ] `endReached={() => loadNext()}`
- [ ] `labelRender`/`optionRender` for custom display
- [ ] `loading` with four conditions: loading, value comparison, `searchStr !== debouncedDeferredValue`, isPendingRefetch

**Ref Export:**
- [ ] `useImperativeHandle` for refetch
- [ ] `startRefetchTransition` wrapper
- [ ] Export ref interface type

## Common Patterns

### showSearch Configuration

Both patterns should implement flexible `showSearch` handling to support:
1. Disabling search completely with `showSearch={false}`
2. Merging user-provided `showSearch` configurations
3. Using optimistic search strings for immediate feedback

**Pattern A: Basic showSearch**
```typescript
// State (if not already present)
const [searchStr, setSearchStr] = useState<string>();
const [optimisticSearchStr, setOptimisticSearchStr] =
  useOptimistic(searchStr);

// In searchAction
searchAction={async (value) => {
  setOptimisticSearchStr(value);  // Immediate UI feedback
  setSearchStr(value);             // Actual state for query
  selectRef.current?.scrollTo(0);
  refetch({ filter: value ? { name: { contains: value } } : null });
  await selectProps.searchAction?.(value);
}}

// In BAISelect
showSearch={
  selectProps.showSearch === false
    ? false
    : {
        searchValue: optimisticSearchStr,
        autoClearSearchValue: true,
        filterOption: false,
        ...(_.isObject(selectProps.showSearch)
          ? _.omit(selectProps.showSearch, ['searchValue'])
          : {}),
      }
}
```

**Pattern B: Advanced showSearch with debouncing**
```typescript
// State (already present in Pattern B)
const [searchStr, setSearchStr] = useState<string>();
const debouncedDeferredValue = useDebouncedDeferredValue(searchStr);
const [optimisticSearchStr, setOptimisticSearchStr] =
  useOptimistic(searchStr);

// In searchAction
searchAction={async (value) => {
  setOptimisticSearchStr(value);  // Immediate UI feedback
  setSearchStr(value);             // Actual state (will be debounced + deferred)
  await selectProps.searchAction?.(value);
}}

// In BAISelect
showSearch={
  selectProps.showSearch === false
    ? false
    : {
        searchValue: optimisticSearchStr,
        autoClearSearchValue: true,
        filterOption: false,
        ...(_.isObject(selectProps.showSearch)
          ? _.omit(selectProps.showSearch, ['searchValue'])
          : {}),
      }
}
```

**Why this pattern?**
- ✅ **Flexibility**: Parent can disable search with `showSearch={false}`
- ✅ **Extensibility**: Parent can provide custom `showSearch` config (except `searchValue`)
- ✅ **Consistency**: All relay select components follow the same pattern
- ✅ **Optimistic UI**: Uses `optimisticSearchStr` for immediate feedback
- ✅ **Type Safety**: TypeScript catches invalid configurations

**Usage Examples:**
```typescript
// Disable search completely
<BAIUserSelect showSearch={false} />

// Custom showSearch configuration
<BAIUserSelect
  showSearch={{
    placeholder: "Search by email...",
    maxLength: 50,
  }}
/>

// Default behavior (search enabled)
<BAIUserSelect />
```

**Common Pitfalls:**
```typescript
// ❌ Bad: Hardcoded showSearch object (not flexible)
showSearch={{
  autoClearSearchValue: true,
  filterOption: false,
}}

// ❌ Bad: No optimistic search (delayed feedback)
showSearch={{
  searchValue: searchStr,  // Use optimisticSearchStr instead
  autoClearSearchValue: true,
  filterOption: false,
}}

// ❌ Bad: Not checking showSearch === false
showSearch={{
  // Always shows search, can't be disabled
}}

// ✅ Good: Conditional with optimistic + merge
showSearch={
  selectProps.showSearch === false
    ? false
    : {
        searchValue: optimisticSearchStr,
        autoClearSearchValue: true,
        filterOption: false,
        ...(_.isObject(selectProps.showSearch)
          ? _.omit(selectProps.showSearch, ['searchValue'])
          : {}),
      }
}
```

### Dynamic First Parameter (Default in Pattern B)

**Pattern B always uses dynamic `first` parameter** to ensure all selected values are fetched:

```typescript
const { entity_nodes: selectedNodes } =
  useLazyLoadQuery<YourComponentValueQuery>(
    graphql`
      query YourComponentValueQuery(
        $selectedFilter: String
        $first: Int!
        $skipSelected: Boolean!
      ) {
        entity_nodes(filter: $selectedFilter, first: $first)
          @skip(if: $skipSelected) {
          edges {
            node {
              id
              name
            }
          }
        }
      }
    `,
    {
      selectedFilter: /* ... */,
      first: _.castArray(deferredControllableValue).length, // 🔑 Dynamic
      skipSelected: _.isEmpty(deferredControllableValue),
    },
  );
```

**Why this is the default in Pattern B:**
- ✅ Fetch exactly the number of selected items
- ✅ No over-fetching (performance)
- ✅ No under-fetching (data completeness)
- ✅ Works with any selection count (1, 10, 100, etc.)
- ✅ Essential for multiple selection mode
- ✅ Prevents data loss when users select many items

**Without dynamic first (NOT Pattern B):**
```typescript
// ❌ Bad: Hardcoded limit (Pattern A approach, not suitable for Pattern B)
first: 10  // Fails if user selects 50 items

// ❌ Bad: No first parameter
// May return only default number of results (usually 10)

// ✅ Good: Pattern B always uses dynamic first
first: _.castArray(deferredControllableValue).length
```

### Multiple Mode Support

```typescript
// Check for empty value before casting to avoid issues with empty arrays
const valueArray = _.isEmpty(value) ? [] : _.castArray(value);

// Process each value uniformly
valueArray.map((value) => {
  // Process each value
});
```

**Key Points:**
- Use `_.isEmpty()` to check for empty value before casting
- `_.castArray()` ensures uniform handling of single and multiple modes
- Prevents issues when value is undefined or empty array

### Search with Transitions

```typescript
// Pattern A: Refetch with transition and optimistic search
const [searchStr, setSearchStr] = useState<string>();
const [optimisticSearchStr, setOptimisticSearchStr] =
  useOptimistic(searchStr);

searchAction={async (value) => {
  setOptimisticSearchStr(value);  // Immediate UI feedback
  setSearchStr(value);             // Actual state for query
  selectRef.current?.scrollTo(0);
  refetch({ filter: value ? { name: { contains: value } } : null });
  await selectProps.searchAction?.(value);
}}

// Conditional showSearch with user config merge
showSearch={
  selectProps.showSearch === false
    ? false
    : {
        searchValue: optimisticSearchStr,
        autoClearSearchValue: true,
        filterOption: false,
        ...(_.isObject(selectProps.showSearch)
          ? _.omit(selectProps.showSearch, ['searchValue'])
          : {}),
      }
}

// Pattern B: Optimistic search with useDebouncedDeferredValue
import useDebouncedDeferredValue from '../../helper/useDebouncedDeferredValue';

const [searchStr, setSearchStr] = useState<string>();
const debouncedDeferredValue = useDebouncedDeferredValue(searchStr);
const [optimisticSearchStr, setOptimisticSearchStr] =
  useOptimistic(searchStr);

// Use debouncedDeferredValue (debounced + deferred) in query filter
filter: mergeFilterValues([
  mergedFilter,
  debouncedDeferredValue ? `email ilike "%${debouncedDeferredValue}%"` : null,
])

// searchAction sets optimistic value immediately, then actual value
searchAction={async (value) => {
  setOptimisticSearchStr(value);  // Optimistic update for immediate UI feedback
  setSearchStr(value);             // Actual state (will be debounced + deferred)
  await selectProps.searchAction?.(value);
}}

// Conditional showSearch with user config merge
showSearch={
  selectProps.showSearch === false
    ? false
    : {
        searchValue: optimisticSearchStr,
        autoClearSearchValue: true,
        filterOption: false,
        ...(_.isObject(selectProps.showSearch)
          ? _.omit(selectProps.showSearch, ['searchValue'])
          : {}),
      }
}

// Show loading when search query is executing
loading={
  loading ||
  controllableValue !== deferredControllableValue ||
  searchStr !== debouncedDeferredValue ||  // Loading during debounce + defer
  isPendingRefetch
}
```

**Why useDebouncedDeferredValue + useOptimistic for search?**
- ✅ Input field shows optimistic value immediately (best UX)
- ✅ Debounce reduces query frequency during fast typing (200ms default)
- ✅ `useDeferredValue` prevents UI blocking during query execution
- ✅ Query uses `debouncedDeferredValue` (debounced + deferred state)
- ✅ Works seamlessly with BAISelect's built-in startTransition wrapper
- ✅ React automatically manages the complete state transition flow
- ✅ Loading indicator shows during debounce + defer period
- ✅ Best balance between responsiveness and performance
- ✅ Prevents excessive GraphQL queries during fast typing

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

## Pattern B: Dynamic Query Parameters

### Core Capabilities

Pattern B (Dynamic) provides full control over GraphQL query parameters through props:

**1. Dynamic First Parameter (Default Behavior)**
```typescript
// ALWAYS fetch all selected values in Pattern B
first: _.castArray(deferredControllableValue).length
```
This is **not optional** - it's the defining characteristic of Pattern B that ensures data completeness.

**2. Dynamic Filter**
```typescript
// Combine multiple filters dynamically
filter={mergeFilterValues([
  'status == "ACTIVE"',
  searchStr ? `name ilike "%${searchStr}%"` : null,
  props.filter,  // External filter from props
])}
```

**3. Dynamic Limit**
```typescript
// Control pagination size via props
{ limit: props.pageSize || 10 }
```

**4. Dynamic Order**
```typescript
// Control sort order via props
order: props.sortBy || '-created_at'
```

**5. External Refetch**
```typescript
// Expose refetch via ref
const selectRef = useRef<YourSelectRef>(null);
selectRef.current?.refetch();
```

### When Pattern B is Essential

Even if your value is a simple name (not ID), use Pattern B when you need:

- ✅ Dynamic filter from parent component
- ✅ External refetch capability
- ✅ Control over fetchPolicy
- ✅ Multiple selection with optimistic updates
- ✅ Dynamic pagination size
- ✅ Custom sort order

**Example: Name-based but needs Pattern B**
```typescript
// Even though value is 'name', we need Pattern B for dynamic features
<YourEntitySelect
  value={selectedNames}           // Name-based value
  filter={externalFilter}         // 🔑 Dynamic filter
  pageSize={20}                   // 🔑 Dynamic limit
  sortBy="name"                   // 🔑 Dynamic order
  ref={selectRef}                 // 🔑 Refetch capability
/>
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

   **Search optimization with useDebouncedDeferredValue (Recommended):**
   ```typescript
   import useDebouncedDeferredValue from '../../helper/useDebouncedDeferredValue';

   const [searchStr, setSearchStr] = useState<string>();
   const debouncedDeferredValue = useDebouncedDeferredValue(searchStr, {
     wait: 200, // default
   });
   const [optimisticSearchStr, setOptimisticSearchStr] =
     useOptimistic(searchStr);
   ```

   **Why useDebouncedDeferredValue?**
   - ✅ Combines `useDebounce` + `useDeferredValue` for optimal search performance
   - ✅ Debounces user input to reduce query frequency (default 200ms)
   - ✅ Defers query execution to prevent UI blocking
   - ✅ Use `optimisticSearchStr` for immediate input feedback
   - ✅ Use `debouncedDeferredValue` in query filters
   - ✅ Better performance than debounce or defer alone
   - ✅ Prevents excessive GraphQL queries during fast typing

   **Pattern comparison:**
   ```typescript
   // ❌ Old: Only useDeferredValue (too many queries)
   const deferredSearchStr = useDeferredValue(searchStr);

   // ❌ Old: Only useDebounce (can still block UI)
   const debouncedSearchStr = useDebounce(searchStr);

   // ✅ New: Combined approach (optimal)
   const debouncedDeferredValue = useDebouncedDeferredValue(searchStr);
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

4. **Custom label rendering for IDs**
   ```typescript
   import { toLocalId } from '../../helper';
   import BAIText from '../BAIText';

   labelRender={({ label }) => {
     return valuePropName === 'id' && _.isString(label) ? (
       <BAIText monospace>{toLocalId(label)}</BAIText>
     ) : (
       label
     );
   }}
   optionRender={({ label }) => {
     return valuePropName === 'id' && _.isString(label) ? (
       <BAIText monospace>{toLocalId(label)}</BAIText>
     ) : (
       label
     );
   }}
   ```
   **Benefits:**
   - Convert Global IDs to local IDs for better readability
   - Consistent monospace rendering for ID values
   - Conditional rendering based on `valuePropName`

5. **Loading state priorities**
   ```typescript
   loading={
     loading ||
     controllableValue !== deferredControllableValue ||
     searchStr !== debouncedDeferredValue ||  // Show loading during debounce + defer
     isPendingRefetch
   }
   // Note: searchStr comparison is needed to show loading during debounce + defer period
   // useOptimistic handles immediate input feedback
   ```

## Common Pitfalls & Solutions

| Pitfall | Impact | Solution |
|---------|--------|----------|
| Missing `first` parameter | Incomplete selected values | **REQUIRED in Pattern B**: Add `$first: Int!` parameter |
| Hardcoded `first: 10` | Missing data for >10 selections | **Pattern B always uses**: `_.castArray(value).length` |
| Not checking `_.isEmpty()` before `_.castArray()` | Potential issues with empty values | Use `_.isEmpty(value) ? [] : _.castArray(value)` |
| Missing `_.castArray` | Single mode breaks | Always normalize values |
| Not using `deferredValue` | Suspense flicker | Defer controllable values (value, open, fetchKey) |
| Not using `useOptimistic` for search | Poor search UX | Use `useOptimistic` for immediate feedback |
| Not using `useDebouncedDeferredValue` | Too many queries | Use `useDebouncedDeferredValue` for search |
| Missing loading condition | No loading feedback | Add `searchStr !== debouncedDeferredValue` |
| Missing `@skip` directive | Unnecessary queries | Add skip when empty |
| Not preserving labels | Lost labels on tag removal | Check if label is string or element |
| Hardcoded valuePropName | Inflexible component | Use prop: `'id' \| 'row_id'` |
| Direct option mutation | Stale data | Rebuild from query results |
| No scroll on search | Poor UX | Call `selectRef.current?.scrollTo(0)` |
| Wrong fetchPolicy | Performance issues | Use appropriate policy per query |
| **Hardcoded `showSearch` object** | **Can't disable search** | **Use conditional pattern with `showSearch === false` check** |
| **Not using `optimisticSearchStr`** | **Delayed search feedback** | **Use `useOptimistic` for `searchValue`** |
| **Not merging user `showSearch`** | **Inflexible configuration** | **Merge with `_.omit(selectProps.showSearch, ['searchValue'])`** |

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

**Pattern A (Simple)** when:
- ✅ Simple, static requirements
- ✅ Single selection sufficient
- ✅ No need for dynamic query parameters
- ✅ Minimal code preferred
- ✅ No external refetch needed

**Pattern B (Dynamic)** when:
- ✅ Need dynamic query parameters (filter, first, limit, order, etc.)
- ✅ Multiple selection required
- ✅ Need external refetch capability via ref
- ✅ Need to control fetchPolicy dynamically
- ✅ Optimistic UI updates important
- ✅ Complex filter combinations needed
- ✅ Value different from display name (or needs special handling)
- ✅ Even name-based values if dynamic control needed

**Key insight:** Pattern B is not about the value type (email vs ID vs name), but about **dynamic control** over query parameters and component behavior.

### Reference Files

- **Pattern A (Simple)**: `references/patterns/BAIAdminResourceGroupSelect.md`
- **Pattern B (Dynamic)**:
  - Email-based with Dynamic First: `references/patterns/BAIUserSelect.md`
  - ID-based with Dynamic First & Global ID Conversion: `references/patterns/BAIVFolderSelect.md`
- **Base Component**: `references/base/BAISelect.md`
- **Hooks**: `references/hooks/` (useFetchKey, useLazyPaginatedQuery, useDebouncedDeferredValue, useEventNotStable)
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
