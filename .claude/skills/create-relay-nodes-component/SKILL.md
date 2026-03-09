---
name: create-relay-nodes-component
description: |
  Generate Relay-based Nodes components with BAITable integration following
  established patterns (BAIUserNodes, SessionNodes, BAISchedulingHistoryNodes, BAIRouteNodes).
  Automatically creates component file with GraphQL fragment, type definitions,
  column configurations, and customization patterns. Minimal user input required -
  just provide GraphQL type name and the skill generates a complete starting template.
allowed-tools: Read, Write, Glob, Grep, AskUserQuestion
---

# Create Relay Nodes Component Skill

## Purpose

This skill generates reusable Relay-based Nodes components that:

- Follow established patterns from BAISchedulingHistoryNodes, BAIRouteNodes, BAISessionHistorySubStepNodes
- Integrate seamlessly with BAITable for data display
- Use Relay fragments for efficient GraphQL data fetching
- Support column customization via `customizeColumns` pattern
- Include sorting with `disableSorter` toggle and table features out of the box
- Provide complete starting templates with TODOs for customization

## When to Use

Activate this skill when users ask to:

- Create a new Nodes component for displaying GraphQL data
- Generate a table component using Relay fragments
- Build a list view component with Backend.AI UI patterns
- Create reusable data display components with sorting/filtering

## Required Information

### Minimal User Input

**1. GraphQL Type Name** (Required)
- Examples: `UserNode`, `ComputeSessionNode`, `SessionSchedulingHistory`
- This determines all other naming and structure

**2. Component Location** (Optional - has smart defaults)
- Default for `*Node` types: `packages/backend.ai-ui/src/components/`
- Default for other types: `packages/backend.ai-ui/src/components/fragments/`
- User can override if needed

### Auto-Generated Details

The skill automatically determines:
- Component name: `UserNode` → `BAIUserNodes`
- Entity name: `UserNode` → `User`
- Fragment prop name: `usersFrgmt`
- Import paths based on location
- Basic column structure

## Implementation Steps

### Step 1: Ask User for GraphQL Type

Use `AskUserQuestion` to get the GraphQL type name:

```typescript
{
  questions: [
    {
      question: "What is the GraphQL type name for this component?",
      header: "GraphQL Type",
      options: [
        {
          label: "UserNode",
          description: "For User entity list"
        },
        {
          label: "ComputeSessionNode",
          description: "For Session entity list"
        },
        {
          label: "SessionSchedulingHistory",
          description: "For connection-type entities"
        },
        {
          label: "Other",
          description: "Specify custom GraphQL type name"
        }
      ],
      multiSelect: false
    }
  ]
}
```

If user selects "Other", prompt for the custom type name.

### Step 2: Determine Component Location

Ask about location only if needed:

```typescript
{
  questions: [
    {
      question: "Where should the component be created?",
      header: "Location",
      options: [
        {
          label: "packages/backend.ai-ui/src/components/ (Recommended for Node types)",
          description: "Default location for *Node components"
        },
        {
          label: "packages/backend.ai-ui/src/components/fragments/",
          description: "For *Connection or fragment-specific components"
        },
        {
          label: "react/src/components/",
          description: "For React-specific (non-shared) components"
        }
      ],
      multiSelect: false
    }
  ]
}
```

### Step 3: Generate Component Name and Variables

Based on GraphQL type, auto-generate:

```typescript
// Example transformations:
// UserNode → BAIUserNodes, User, usersFrgmt
// ComputeSessionNode → BAIComputeSessionNodes, Session, sessionsFrgmt
// Route → BAIRouteNodes, Route, routesFrgmt

function generateComponentDetails(graphqlType: string) {
  // Remove "Node" or "Connection" suffix
  const cleanName = graphqlType
    .replace(/Node$/, '')
    .replace(/Connection$/, '');

  // Generate component name with BAI prefix and Nodes suffix
  const componentName = `BAI${cleanName}Nodes`;

  // Extract entity name (e.g., "User" from "UserNode")
  const entityName = cleanName.replace(/^.*(?=[A-Z])/, '');

  // Generate fragment prop name (lowercase + Frgmt suffix)
  const entityLowercase = entityName.toLowerCase();
  const fragmentProp = `${entityLowercase}${entityLowercase.endsWith('s') ? '' : 's'}Frgmt`;

  return {
    componentName,
    entityName,
    fragmentProp,
    graphqlType
  };
}
```

### Step 4: Generate Component File

Create complete TypeScript file with this structure:

**CRITICAL PATTERNS (must follow):**

1. **Column keys must be camelCase** — `'createdAt'`, `'status'`, NOT `'CREATED_AT'`.
   The query orchestrator uses `convertToOrderBy()` from `react/src/helper/index.tsx`
   to convert camelCase to `{ field: 'CREATED_AT', direction: 'ASC' }` for Strawberry queries.

2. **Use `filterOutEmpty` + `_.map` with `disableSorter`** — not `satisfies`.
   This enables runtime sorter toggling.

3. **Never hardcode `pagination={false}`** — let the consumer control pagination via `...tableProps`.

4. **Callback props for domain-specific interactions** — use `onClickXxx` callbacks
   instead of embedding navigation/modal logic. The consumer wires these up.

5. **Use `'use memo'` directive** at the top of the component body for React Compiler optimization.

```typescript
import {
  {ComponentName}Fragment$data,
  {ComponentName}Fragment$key,
} from '../../__generated__/{ComponentName}Fragment.graphql';
import { filterOutEmpty, filterOutNullAndUndefined } from '../../helper';
import {
  BAIColumnsType,
  BAIColumnType,
  BAITable,
  BAITableProps,
} from '../Table';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

// =============================================================================
// Type Definitions
// =============================================================================

export type {Entity}InList = NonNullable<{ComponentName}Fragment$data[number]>;

// Sorter keys must be camelCase — convertToOrderBy() handles UPPER_SNAKE_CASE conversion
const available{Entity}SorterKeys = [
  'createdAt',
  // TODO: Add more sortable fields in camelCase
] as const;

export const available{Entity}SorterValues = [
  ...available{Entity}SorterKeys,
  ...available{Entity}SorterKeys.map((key) => `-${key}` as const),
] as const;

const isEnableSorter = (key: string) => {
  return _.includes(available{Entity}SorterKeys, key);
};

// =============================================================================
// Props Interface
// =============================================================================

export interface {ComponentName}Props
  extends Omit<
    BAITableProps<{Entity}InList>,
    'dataSource' | 'columns' | 'onChangeOrder'
  > {
  {fragmentProp}: {ComponentName}Fragment$key;
  customizeColumns?: (
    baseColumns: BAIColumnsType<{Entity}InList>,
  ) => BAIColumnsType<{Entity}InList>;
  disableSorter?: boolean;
  onChangeOrder?: (
    order: (typeof available{Entity}SorterValues)[number] | null,
  ) => void;
  // TODO: Add domain-specific callback props (e.g., onClickSessionId, onClickErrorData)
}

// =============================================================================
// Component
// =============================================================================

const {ComponentName} = ({
  {fragmentProp},
  customizeColumns,
  disableSorter,
  onChangeOrder,
  ...tableProps
}: {ComponentName}Props) => {
  'use memo';
  const { t } = useTranslation();

  // TODO: Customize fragment fields based on your GraphQL schema
  const data = useFragment<{ComponentName}Fragment$key>(
    graphql`
      fragment {ComponentName}Fragment on {GraphQLType} @relay(plural: true) {
        id @required(action: NONE)
        # TODO: Add fields you need from the GraphQL type
      }
    `,
    {fragmentProp},
  );

  // =============================================================================
  // Column Definitions — keys must be camelCase
  // =============================================================================

  const baseColumns = _.map(
    filterOutEmpty<BAIColumnType<{Entity}InList>>([
      {
        key: 'id',
        title: 'ID',
        dataIndex: 'id',
        fixed: 'left',
      },
      // TODO: Add more columns with camelCase keys
      // {
      //   key: 'createdAt',
      //   title: t('comp:{ComponentName}.CreatedAt'),
      //   dataIndex: 'createdAt',
      //   sorter: isEnableSorter('createdAt'),
      //   render: (value) => dayjs(value).format('ll LT'),
      // },
    ]),
    (column) => {
      return disableSorter ? _.omit(column, 'sorter') : column;
    },
  );

  const allColumns = customizeColumns
    ? customizeColumns(baseColumns)
    : baseColumns;

  return (
    <BAITable
      rowKey={'id'}
      dataSource={filterOutNullAndUndefined(data)}
      columns={allColumns}
      scroll={{ x: 'max-content' }}
      onChangeOrder={(order) => {
        onChangeOrder?.(
          (order as (typeof available{Entity}SorterValues)[number]) || null,
        );
      }}
      {...tableProps}
    />
  );
};

export default {ComponentName};
```

### Step 5: Query Orchestrator Pattern

When integrating into a page, follow this pattern for pagination/order
that avoids full-page suspense on pagination changes:

```typescript
// In the query orchestrator (page component):
import { useDeferredValue, useState } from 'react';
import { convertToOrderBy } from '../helper';

// Simple state — no need for useBAIPaginationOptionState unless URL persistence is needed
const [routePagination, setRoutePagination] = useState({ current: 1, pageSize: 10 });
const [routeOrder, setRouteOrder] = useState<string | null>(null);

// useDeferredValue keeps previous UI visible while new data loads
const deferredPagination = useDeferredValue(routePagination);
const deferredOrder = useDeferredValue(routeOrder);

// In query variables:
const { data } = useLazyLoadQuery(query, {
  // ... other vars
  routeFirst: deferredPagination.pageSize,
  routeOffset: (deferredPagination.current - 1) * deferredPagination.pageSize,
  // convertToOrderBy converts camelCase 'createdAt' → { field: 'CREATED_AT', direction: 'ASC' }
  routeOrderBy: convertToOrderBy(deferredOrder) ?? undefined,
});

// In JSX — pagination.onChange wires directly to state setter:
<BAIRouteNodes
  routesFrgmt={...}
  order={routeOrder}
  onChangeOrder={setRouteOrder}
  pagination={{
    ...routePagination,
    total: data?.routes?.count,
    showSizeChanger: true,
    onChange: (page, pageSize) => {
      setRoutePagination({ current: page, pageSize });
    },
  }}
/>
```

**Key points:**
- `useDeferredValue` wraps pagination/order state so React shows stale data while loading
- `convertToOrderBy(camelCaseString)` converts to `{ field: 'UPPER_SNAKE', direction }` for Strawberry
- `pagination` is passed via `...tableProps` — never hardcode `pagination={false}` in the Nodes component
- For queries co-located in a parent query, use `@skipOnClient(if: $skip)` for feature-gated fields

### Step 6: Provide Next Steps to User

After generation, show comprehensive next steps:

````markdown
Component generated successfully!

**Generated File:**
`{full_path_to_generated_file}`

**Next Steps:**

1. **Run Relay Compiler** to generate fragment types:
   ```bash
   pnpm run relay
   ```

2. **Customize GraphQL Fragment:**
   - Add fields you need from {GraphQLType}
   - Consider performance: only request fields you'll display

3. **Define Table Columns:**
   - Customize the `baseColumns` array
   - Use **camelCase** keys that match fragment field names
   - Add callback props (`onClickXxx`) for interactive columns

4. **Update Sortable Fields:**
   - Edit `available{Entity}SorterKeys` with camelCase field names
   - Only include fields that support sorting in your API

5. **Add Internationalization:**
   - Add translation keys to locale files

6. **Export from barrel:**
   - Add export to the appropriate `index.ts`

7. **Verify:**
   ```bash
   bash scripts/verify.sh
   ```
````

## Architecture Pattern

Generated components follow the **Relay Fragment Architecture**:

```
┌─────────────────────────────────────┐
│   Query Orchestrator Component      │
│   - useLazyLoadQuery                │
│   - useState for pagination/order   │
│   - useDeferredValue for smoothness │
│   - convertToOrderBy for Strawberry │
│   - Passes fragment refs            │
└───────────────┬─────────────────────┘
                │ fragment ref
                ▼
┌─────────────────────────────────────┐
│   Nodes Component (Generated)       │
│   - useFragment                     │
│   - Receives fragment ref as prop   │
│   - baseColumns + customizeColumns  │
│   - disableSorter toggle            │
│   - onClickXxx callback props       │
│   - Renders BAITable                │
└─────────────────────────────────────┘
```

**Benefits:**
- Separation of data fetching from presentation
- Reusability across different queries
- Type-safe with Relay-generated types
- Colocated fragments with components
- Flexible via `customizeColumns` pattern

## Common Customization Patterns

### Adding Custom Actions Column

```typescript
customizeColumns={(baseColumns) => [
  ...baseColumns,
  {
    key: 'actions',
    title: 'Actions',
    fixed: 'right',
    render: (__, record) => (
      <BAIButton size="small" onClick={() => handleEdit(record)}>
        Edit
      </BAIButton>
    ),
  },
]}
```

### Filtering Columns

```typescript
customizeColumns={(baseColumns) =>
  baseColumns.filter((col) => col.key !== 'unwanted_column')
}
```

### Reordering Columns

```typescript
customizeColumns={(baseColumns) => {
  const nameCol = baseColumns.find((col) => col.key === 'name');
  const others = baseColumns.filter((col) => col.key !== 'name');
  return nameCol ? [nameCol, ...others] : others;
}}
```

## Best Practices

1. **Column Keys**
   - Always use **camelCase** keys matching GraphQL field names
   - `convertToOrderBy()` handles conversion to `UPPER_SNAKE_CASE` for Strawberry `OrderBy` inputs
   - Never use UPPER_SNAKE_CASE in column keys — that breaks `BAITable` order matching

2. **Fragment Fields**
   - Only request fields you'll actually display
   - Use `@required(action: NONE)` for critical fields
   - Consider nested fragments for related data

3. **Pagination**
   - Never hardcode `pagination={false}` in the Nodes component
   - Let the consumer pass pagination via `...tableProps`
   - Use `useDeferredValue` in the query orchestrator for smooth transitions

4. **Sorting**
   - Use `disableSorter` prop to conditionally disable all sorters
   - `filterOutEmpty` + `_.map` pattern handles sorter removal
   - Keep `availableSorterKeys` in sync with API capabilities

5. **Callback Props**
   - Use `onClickXxx` callbacks for domain-specific interactions (navigation, modals)
   - Don't embed navigation logic inside the Nodes component — keep it presentation-only

6. **Type Safety**
   - Always run Relay compiler after fragment changes
   - Use generated `$key` and `$data` types
   - Export type definitions for reuse

7. **React Compiler**
   - Always include `'use memo'` directive at the top of the component body

## Reference Files

| File | Purpose |
|------|---------|
| `BAISchedulingHistoryNodes.tsx` | Template with customizeColumns, disableSorter, expandable rows |
| `BAISessionHistorySubStepNodes.tsx` | Minimal template with customizeColumns |
| `BAIRouteNodes.tsx` | Template with callback props (onClickSessionId, onClickErrorData) |
| `BAIAgentTable.tsx` | Complex example with many columns |

Location: `packages/backend.ai-ui/src/components/fragments/`

## Notes

- Generated components are **starting templates** requiring customization
- Components compile after running `pnpm run relay`
- Follow `customizeColumns` pattern for flexibility
- Always test with real GraphQL data before finalizing
- Use `bash scripts/verify.sh` to validate Relay, Lint, Format, and TypeScript
