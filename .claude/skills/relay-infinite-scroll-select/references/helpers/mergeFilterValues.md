# mergeFilterValues - Filter Composition Utility

## Overview

`mergeFilterValues` composes multiple GraphQL filter strings into a single filter expression with a specified operator. It automatically filters out empty values and wraps each filter in parentheses.

## Main Function: mergeFilterValues

**Signature:**
```typescript
export function mergeFilterValues(
  filterStrings: Array<string | undefined | null>,
  operator: string = '&',
): string | undefined
```

**Parameters:**
- `filterStrings`: Array of filter strings (can include `undefined` or `null`)
- `operator`: Logical operator to join filters (default: `'&'` for AND)
  - `'&'` - AND operator (all conditions must be true)
  - `'|'` - OR operator (any condition can be true)

**Returns:** Combined filter string or `undefined` if no valid filters

**Example:**
```typescript
import { mergeFilterValues } from '../BAIPropertyFilter';

// AND operator (default)
const filter = mergeFilterValues([
  'status == "RUNNING"',
  'name ilike "%test%"',
  null, // ignored
  undefined, // ignored
]);
// => '(status == "RUNNING")&(name ilike "%test%")'

// OR operator
const filter = mergeFilterValues([
  'id == "123"',
  'id == "456"',
  'id == "789"',
], '|');
// => '(id == "123")|(id == "456")|(id == "789")'

// All empty
const filter = mergeFilterValues([null, undefined, '']);
// => undefined
```

## Implementation

```typescript
import _ from 'lodash';
import { filterOutEmpty } from '../../helper';

export function mergeFilterValues(
  filterStrings: Array<string | undefined | null>,
  operator: string = '&',
) {
  const mergedFilter = _.join(
    _.map(filterOutEmpty(filterStrings), (str) => \`(\${str})\`),
    operator,
  );
  return mergedFilter ? mergedFilter : undefined;
}
```

**Process:**
1. Filter out empty values using `filterOutEmpty`
2. Wrap each filter in parentheses `(filter)`
3. Join with operator
4. Return `undefined` if result is empty string

## Helper Function: trimFilterValue

**Signature:**
```typescript
function trimFilterValue(filterValue: string): string
```

**Purpose:** Remove `%` wildcards from filter values for display purposes.

**Example:**
```typescript
trimFilterValue('%search%');  // => 'search'
trimFilterValue('search%');   // => 'search'
trimFilterValue('%search');   // => 'search'
trimFilterValue('search');    // => 'search'
```

**Implementation:**
```typescript
function trimFilterValue(filterValue: string): string {
  return filterValue.replace(/^%|%$/g, '');
}
```

**Usage:** Primarily used in BAIPropertyFilter for displaying filter values in tags.

## Common Patterns

### Pattern 1: Combining Base Filter and Search

```typescript
const mergedFilter = mergeFilterValues([
  baseFilter, // e.g., 'status != "DELETE_COMPLETE"'
  searchStr ? \`name ilike "%\${searchStr}%"\` : null,
]);

// Example result: '(status != "DELETE_COMPLETE")&(name ilike "%test%")'
```

### Pattern 2: Multiple Optional Filters

```typescript
const filter = mergeFilterValues([
  excludeDeleted ? 'status != "DELETE_COMPLETE"' : null,
  projectId ? \`project_id == "\${projectId}"\` : null,
  ownershipType ? \`ownership_type == "\${ownershipType}"\` : null,
  externalFilter, // from parent component
]);
```

### Pattern 3: OR Conditions for Selected Values

```typescript
const selectedFilter = mergeFilterValues(
  _.castArray(selectedValues).map((value) => {
    return \`id == "\${value}"\`;
  }),
  '|', // OR operator
);

// Result: '(id == "123")|(id == "456")|(id == "789")'
```

### Pattern 4: Nested Filter Composition

```typescript
const excludedStatusFilter = mergeFilterValues([
  'status != "DELETE_PENDING"',
  'status != "DELETE_ONGOING"',
  'status != "DELETE_ERROR"',
  'status != "DELETE_COMPLETE"',
], '&');

const finalFilter = mergeFilterValues([
  excludedStatusFilter,
  searchFilter,
  externalFilter,
]);
```

## Usage in Pattern B (BAIVFolderSelect)

### Selected Values Query

```typescript
const { vfolder_nodes: selectedVFolderNodes } = useLazyLoadQuery(
  graphql\`
    query BAIVFolderSelectValueQuery(
      $selectedFilter: String
      $skipSelectedVFolder: Boolean!
    ) {
      vfolder_nodes(filter: $selectedFilter)
        @skip(if: $skipSelectedVFolder) {
        edges {
          node {
            id
            name
          }
        }
      }
    }
  \`,
  {
    selectedFilter: mergeFilterValues(
      [
        !_.isEmpty(selectedValues)
          ? mergeFilterValues(
              _.castArray(selectedValues).map((value) => {
                const filterValue = valuePropName === 'id'
                  ? toLocalId(value)
                  : value;
                return \`\${valuePropName} == "\${filterValue}"\`;
              }),
              '|', // OR for selected values
            )
          : null,
        baseFilter,
      ],
      '&', // AND with base filter
    ),
    skipSelectedVFolder: _.isEmpty(selectedValues),
  },
);
```

### Paginated Options Query

```typescript
const { paginationData, result } = useLazyPaginatedQuery(
  query,
  { limit: 10 },
  {
    filter: mergeFilterValues([
      baseFilter,
      excludeDeleted ? excludeDeletedStatusFilter : null,
      searchStr ? \`name ilike "%\${searchStr}%"\` : null,
      externalFilter,
    ]),
    scopeId: projectId ? \`project:\${projectId}\` : undefined,
  },
  options,
  extractors,
);
```

## Best Practices

1. **Always use mergeFilterValues instead of manual string concatenation**
   ```typescript
   // ✅ Good: Handles empty values automatically
   mergeFilterValues([filter1, null, filter2]);

   // ❌ Bad: Manual concatenation with conditionals
   [filter1, filter2].filter(Boolean).join('&');
   ```

2. **Use appropriate operator for context**
   ```typescript
   // AND for combining different conditions
   mergeFilterValues([statusFilter, searchFilter], '&');

   // OR for multiple values of same field
   mergeFilterValues(
     ids.map((id) => \`id == "\${id}"\`),
     '|',
   );
   ```

3. **Wrap complex filters in mergeFilterValues**
   ```typescript
   const excludedStatuses = mergeFilterValues([
     'status != "DELETE_PENDING"',
     'status != "DELETE_ONGOING"',
   ], '&');

   const finalFilter = mergeFilterValues([
     excludedStatuses,
     otherFilters,
   ]);
   ```

4. **Use with conditional filters**
   ```typescript
   // ✅ Good: Null values are filtered out
   mergeFilterValues([
     baseFilter,
     condition ? conditionalFilter : null,
     anotherCondition ? anotherFilter : null,
   ]);

   // ❌ Bad: Manual null checking
   let filters = [baseFilter];
   if (condition) filters.push(conditionalFilter);
   if (anotherCondition) filters.push(anotherFilter);
   const finalFilter = filters.join('&');
   ```

## Filter Syntax Reference

Backend.AI GraphQL filter syntax:

```typescript
// Equality
'field == "value"'

// Inequality
'field != "value"'

// Comparison
'field > 10'
'field < 100'
'field >= 10'
'field <= 100'

// Case-insensitive LIKE
'field ilike "%pattern%"'
'field ilike "prefix%"'
'field ilike "%suffix"'

// Logical operators
'condition1 & condition2'  // AND
'condition1 | condition2'  // OR

// Grouping
'(condition1 & condition2) | condition3'
```

## Common Patterns

### Exclude Deleted Items

```typescript
const excludeDeletedStatusFilter =
  'status != "DELETE_PENDING" & ' +
  'status != "DELETE_ONGOING" & ' +
  'status != "DELETE_ERROR" & ' +
  'status != "DELETE_COMPLETE"';

// Or use mergeFilterValues
const excludeDeletedStatusFilter = mergeFilterValues([
  'status != "DELETE_PENDING"',
  'status != "DELETE_ONGOING"',
  'status != "DELETE_ERROR"',
  'status != "DELETE_COMPLETE"',
], '&');
```

### Search with Wildcards

```typescript
const searchFilter = searchStr
  ? \`name ilike "%\${searchStr}%"\`
  : null;
```

### Multiple ID Matching

```typescript
const idFilter = mergeFilterValues(
  _.castArray(ids).map((id) => \`id == "\${id}"\`),
  '|',
);
```

## Dependencies

- `lodash` - For `_.join`, `_.map`
- `filterOutEmpty` from `../../helper` - Removes empty values
