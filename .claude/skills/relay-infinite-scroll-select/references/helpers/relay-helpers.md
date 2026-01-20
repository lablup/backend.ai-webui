# Relay Helper Functions

## Overview

Utility functions for working with Relay Global IDs and filtering arrays.

## Functions

### toGlobalId

Convert a local ID to a Relay Global ID.

**Signature:**
```typescript
export const toGlobalId = (type: KnownGlobalIdType, id: string): string
```

**Parameters:**
- `type`: The GraphQL type name (e.g., 'VirtualFolderNode', 'UserNode')
- `id`: The local ID (UUID or other identifier)

**Returns:** Base64-encoded Global ID string

**Example:**
```typescript
import { toGlobalId } from '../../helper';

const globalId = toGlobalId('VirtualFolderNode', '123e4567-e89b-12d3-a456-426614174000');
// => "VmlydHVhbEZvbGRlck5vZGU6MTIzZTQ1NjctZTg5Yi0xMmQzLWE0NTYtNDI2NjE0MTc0MDAw"
```

**Implementation:**
```typescript
export type KnownGlobalIdType =
  | 'VirtualFolderNode'
  | 'ComputeSessionNode'
  | 'KeyPairNode'
  | 'ScalingGroupNode'
  | 'UserNode';

export const toGlobalId = (type: KnownGlobalIdType, id: string): string => {
  return btoa(\`\${type}:\${id}\`);
};
```

### toLocalId

Extract the local ID from a Relay Global ID.

**Signature:**
```typescript
export const toLocalId = (globalId: string): string
```

**Parameters:**
- `globalId`: Base64-encoded Relay Global ID

**Returns:** Local ID (UUID or other identifier)

**Example:**
```typescript
import { toLocalId } from '../../helper';

const localId = toLocalId("VmlydHVhbEZvbGRlck5vZGU6MTIzZTQ1NjctZTg5Yi0xMmQzLWE0NTYtNDI2NjE0MTc0MDAw");
// => "123e4567-e89b-12d3-a456-426614174000"
```

**Implementation:**
```typescript
export const toLocalId = (globalId: string): string => {
  return atob(globalId).split(':')?.[1];
};
```

**Usage in Pattern B:**
```typescript
// When valuePropName is 'id', filter needs local UUID
const filterValue = valuePropName === 'id' ? toLocalId(value) : value;
return \`\${valuePropName} == "\${filterValue}"\`;

// In label rendering, show local ID for debugging
labelRender={({ label, value }) => (
  <>
    {label}
    <BAIText type="secondary">
      &nbsp; ({toLocalId(_.toString(value))})
    </BAIText>
  </>
)}
```

### filterOutEmpty

Filter out empty values from an array.

**Signature:**
```typescript
export const filterOutEmpty = <T>(
  arr: Array<T | undefined | null | '' | false | any[] | object>,
): Array<T>
```

**Parameters:**
- `arr`: Array that may contain empty values

**Returns:** New array with only non-empty values

**What is considered "empty":**
- `undefined`
- `null`
- Empty string (`''`)
- `false`
- `true`
- Empty arrays (`[]`)
- Empty objects (`{}`)

**Example:**
```typescript
import { filterOutEmpty } from '../../helper';

const arr = [
  'valid',
  null,
  undefined,
  '',
  'another valid',
  false,
  [],
  {},
];

const filtered = filterOutEmpty(arr);
// => ['valid', 'another valid']
```

**Implementation:**
```typescript
export const filterOutEmpty = <T>(
  arr: Array<T | undefined | null | '' | false | any[] | object>,
): Array<T> => _.filter(arr, (item) => !_.isEmpty(item)) as Array<T>;
```

**Usage in mergeFilterValues:**
```typescript
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

### filterOutNullAndUndefined

Filter out `null` and `undefined` from array of objects.

**Signature:**
```typescript
export function filterOutNullAndUndefined<T extends { [key: string]: any }>(
  arr: ReadonlyArray<T | null | undefined> | null | undefined,
): T[]
```

**Parameters:**
- `arr`: Array that may contain null/undefined values, or itself be null/undefined

**Returns:** New array with only non-null/non-undefined objects

**Example:**
```typescript
import { filterOutNullAndUndefined } from '../../helper';

const users = [
  { id: '1', name: 'Alice' },
  null,
  { id: '2', name: 'Bob' },
  undefined,
  { id: '3', name: 'Charlie' },
];

const validUsers = filterOutNullAndUndefined(users);
// => [{ id: '1', name: 'Alice' }, { id: '2', name: 'Bob' }, { id: '3', name: 'Charlie' }]

// Handle null/undefined array
const result = filterOutNullAndUndefined(null);
// => []
```

**Implementation:**
```typescript
export function filterOutNullAndUndefined<T extends { [key: string]: any }>(
  arr: ReadonlyArray<T | null | undefined> | null | undefined,
): T[] {
  if (arr === null || arr === undefined) {
    return [];
  }
  return arr.filter((item) => item !== null && item !== undefined);
}
```

**Usage in GraphQL result processing:**
```typescript
const validEdges = filterOutNullAndUndefined(data.items?.edges);
const items = validEdges.map((edge) => edge.node);
```

## Common Patterns

### Global ID Conversion in Filters

```typescript
import { toLocalId } from '../../helper';

// Build filter for selected values
const selectedFilter = mergeFilterValues(
  _.castArray(selectedValues).map((value) => {
    // Convert Global ID to local UUID for backend filter
    const filterValue = valuePropName === 'id' ? toLocalId(value) : value;
    return \`\${valuePropName} == "\${filterValue}"\`;
  }),
  '|', // OR operator
);
```

### Filtering Empty Values in Filter Arrays

```typescript
import { filterOutEmpty } from '../../helper';

const mergedFilter = mergeFilterValues([
  baseFilter,
  excludeDeleted ? deletedStatusFilter : null,
  searchStr ? \`name ilike "%\${searchStr}%"\` : null,
  externalFilter,
]);
// filterOutEmpty is called inside mergeFilterValues
```

### Processing GraphQL Edges

```typescript
import { filterOutNullAndUndefined } from '../../helper';

const data = useLazyLoadQuery(query, variables);

// Safe edge processing
const validEdges = filterOutNullAndUndefined(data.items?.edges);
const items = validEdges.map((edge) => edge.node);
```

## Best Practices

1. **Always use toLocalId for backend filters when valuePropName is 'id'**
   ```typescript
   // ✅ Good: Convert to local ID
   const filterValue = valuePropName === 'id' ? toLocalId(value) : value;

   // ❌ Bad: Use Global ID directly
   const filterValue = value; // Backend doesn't understand Global IDs
   ```

2. **Use filterOutEmpty in filter merging**
   ```typescript
   // ✅ Good: Automatically handled by mergeFilterValues
   mergeFilterValues([filter1, null, filter2]);

   // ❌ Bad: Manual filtering
   [filter1, filter2].filter(f => f).join('&');
   ```

3. **Use filterOutNullAndUndefined for GraphQL results**
   ```typescript
   // ✅ Good: Handle nullable edges
   const validEdges = filterOutNullAndUndefined(data.items?.edges);

   // ❌ Bad: Assume no nulls
   const edges = data.items.edges; // May contain nulls
   ```

## Type Definitions

```typescript
export type KnownGlobalIdType =
  | 'VirtualFolderNode'
  | 'ComputeSessionNode'
  | 'KeyPairNode'
  | 'ScalingGroupNode'
  | 'UserNode';
```

## Related Functions

- `mergeFilterValues` - Uses `filterOutEmpty` internally
- `BAIPropertyFilter` - Uses these helpers for filter logic
