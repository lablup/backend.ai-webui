---
name: create-relay-nodes-component
description: |
  Generate Relay-based Nodes components with BAITable integration following
  established patterns (BAIUserNodes, SessionNodes, BAISchedulingHistoryNodes).
  Automatically creates component file with GraphQL fragment, type definitions,
  column configurations, and customization patterns. Minimal user input required -
  just provide GraphQL type name and the skill generates a complete starting template.
allowed-tools: Read, Write, Glob, Grep, AskUserQuestion
---

# Create Relay Nodes Component Skill

## Purpose

This skill generates reusable Relay-based Nodes components that:

- Follow established patterns from BAIUserNodes, SessionNodes, BAISchedulingHistoryNodes
- Integrate seamlessly with BAITable for data display
- Use Relay fragments for efficient GraphQL data fetching
- Support column customization via `customizeColumns` pattern
- Include sorting, filtering, and table features out of the box
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
- Examples: `UserNode`, `ComputeSessionNode`, `SessionSchedulingHistoryConnection`
- This determines all other naming and structure

**2. Component Location** (Optional - has smart defaults)
- Default for `*Node` types: `packages/backend.ai-ui/src/components/`
- Default for `*Connection` types: `packages/backend.ai-ui/src/components/fragments/`
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
          label: "SessionSchedulingHistoryConnection",
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
// SessionSchedulingHistoryConnection → BAISchedulingHistoryNodes, History, historiesFrgmt

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

```typescript
import {
  BAITable,
  BAITableProps,
  BAIColumnType,
  BAIText,
  filterOutEmpty,
  filterOutNullAndUndefined,
} from '..'; // Adjust import path based on location
import {
  {ComponentName}Fragment$data,
  {ComponentName}Fragment$key,
} from '../__generated__/{ComponentName}Fragment.graphql';
import dayjs from 'dayjs';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

// =============================================================================
// Type Definitions
// =============================================================================

export type {Entity}InList = NonNullable<{ComponentName}Fragment$data[number]>;

// TODO: Add sortable field keys based on your GraphQL type
const available{Entity}SorterKeys = [
  'id',
  'created_at',
  'modified_at',
  // Add more sortable fields here
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

interface {ComponentName}Props
  extends Omit<
    BAITableProps<{Entity}InList>,
    'dataSource' | 'columns' | 'onChangeOrder'
  > {
  {fragmentProp}: {ComponentName}Fragment$key;
  customizeColumns?: (
    baseColumns: BAIColumnType<{Entity}InList>[],
  ) => BAIColumnType<{Entity}InList>[];
  disableSorter?: boolean;
  onChangeOrder?: (
    order: (typeof available{Entity}SorterValues)[number] | null,
  ) => void;
}

// =============================================================================
// Component
// =============================================================================

const {ComponentName}: React.FC<{ComponentName}Props> = ({
  {fragmentProp},
  customizeColumns,
  disableSorter,
  onChangeOrder,
  ...tableProps
}) => {
  'use memo';
  const { t } = useTranslation();

  // TODO: Customize fragment fields based on your GraphQL schema
  const data = useFragment(
    graphql`
      fragment {ComponentName}Fragment on {GraphQLType} @relay(plural: true) {
        id @required(action: NONE)
        # TODO: Add fields you need from the GraphQL type
        # Common fields to consider:
        # created_at
        # modified_at
        # status
        # name
        # email
      }
    `,
    {fragmentProp},
  );

  // =============================================================================
  // Column Definitions
  // =============================================================================

  const baseColumns = _.map(
    filterOutEmpty<BAIColumnType<{Entity}InList>>([
      // TODO: Customize columns based on your data structure
      {
        key: 'id',
        title: 'ID',
        render: (__, record) => (
          <BAIText copyable ellipsis monospace style={{ maxWidth: 100 }}>
            {record.id}
          </BAIText>
        ),
        required: true,
      },
      // TODO: Add more columns here
      // Example column template:
      // {
      //   key: 'field_name',
      //   title: t('comp:{ComponentName}.FieldTitle'),
      //   dataIndex: 'field_name',
      //   sorter: isEnableSorter('field_name'),
      //   render: (__, record) => {
      //     return <BAIText>{record.field_name}</BAIText>;
      //   },
      // },
      {
        key: 'created_at',
        title: t('comp:{ComponentName}.CreatedAt'),
        dataIndex: 'created_at',
        sorter: isEnableSorter('created_at'),
        render: (__, record) => dayjs(record.created_at).format('lll'),
        defaultSortOrder: 'descend',
      },
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
      resizable
      rowKey={'id'}
      size="small"
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

// =============================================================================
// TODO List
// =============================================================================

/**
 * TODO: Complete the following steps to finalize this component:
 *
 * 1. **GraphQL Fragment**:
 *    - Add all required fields from the {GraphQLType} type
 *    - Consider performance: only request fields you'll display
 *    - Run `pnpm run relay` to generate TypeScript types
 *
 * 2. **Column Definitions**:
 *    - Customize the `baseColumns` array with your data fields
 *    - Add appropriate render functions for complex data types
 *    - Consider using specialized components (BAIText, BooleanTag, etc.)
 *
 * 3. **Sortable Fields**:
 *    - Update `available{Entity}SorterKeys` with sortable field names
 *    - Verify fields are actually sortable in your GraphQL API
 *    - Remove `sorter` prop from columns that shouldn't be sortable
 *
 * 4. **Internationalization**:
 *    - Add translation keys to `packages/backend.ai-ui/src/locale/en.json`:
 *      {
 *        "comp:{ComponentName}": {
 *          "FieldTitle": "Display Name",
 *          "CreatedAt": "Created At",
 *          // Add more field labels
 *        }
 *      }
 *    - Translate to all 21 supported languages
 *
 * 5. **TypeScript**:
 *    - Run `pnpm run typecheck` to verify no type errors
 *    - Fix any type mismatches or missing fields
 *
 * 6. **Usage Example**:
 *    // In a query orchestrator component:
 *    const data = useLazyLoadQuery(
 *      graphql`
 *        query MyQuery {
 *          items {
 *            ...{ComponentName}Fragment
 *          }
 *        }
 *      `,
 *      {},
 *    );
 *
 *    return (
 *      <{ComponentName}
 *        {fragmentProp}={data.items}
 *        customizeColumns={(baseColumns) => [
 *          // Optionally customize column order or add extra columns
 *          ...baseColumns,
 *        ]}
 *        onChangeOrder={(order) => {
 *          // Handle sorting change
 *        }}
 *      />
 *    );
 */
```

### Step 5: Provide Next Steps to User

After generation, show comprehensive next steps:

````markdown
✅ Component generated successfully!

📁 **Generated File:**
`{full_path_to_generated_file}`

📝 **Next Steps:**

1. **Run Relay Compiler** to generate fragment types:
   ```bash
   cd packages/backend.ai-ui && pnpm run relay
   ```

2. **Customize GraphQL Fragment:**
   - Open the generated file
   - Find the `TODO` comment in the fragment definition
   - Add fields you need from {GraphQLType}
   - Example fields: `name`, `email`, `status`, `created_at`

3. **Define Table Columns:**
   - Customize the `baseColumns` array
   - Add columns for each field you want to display
   - Use appropriate render functions:
     - `<BAIText>` for text fields
     - `<BooleanTag>` for boolean flags
     - `<StatusTag>` for status fields
     - `dayjs().format()` for dates

4. **Update Sortable Fields:**
   - Edit `available{Entity}SorterKeys` array
   - Only include fields that support sorting in your API
   - Remove `sorter` prop from non-sortable columns

5. **Add Internationalization:**
   - File: `packages/backend.ai-ui/src/locale/en.json`
   - Add section for your component:
     ```json
     {
       "comp:{ComponentName}": {
         "FieldName": "Display Name",
         "CreatedAt": "Created At"
       }
     }
     ```
   - Translate to all 21 supported languages

6. **Verify TypeScript:**
   ```bash
   pnpm run typecheck
   ```

7. **Use in Parent Component:**
   ```typescript
   const data = useLazyLoadQuery(
     graphql`
       query ParentQuery {
         items {
           ...{ComponentName}Fragment
         }
       }
     `,
     {},
   );

   return <{ComponentName} {fragmentProp}={data.items} />;
   ```

📚 **Reference Components:**
- `BAIUserNodes.tsx` - Full example with many columns
- `BAISchedulingHistoryNodes.tsx` - Minimal example
- `SessionNodes.tsx` - Complex example with custom cells

🎯 **Key Patterns to Follow:**
- ✅ Use `customizeColumns` for flexible column composition
- ✅ Use `@required(action: NONE)` for critical fields
- ✅ Filter out empty columns with `filterOutEmpty`
- ✅ Use `'use memo'` directive for React Compiler optimization
- ✅ Provide `onChangeOrder` callback for parent sorting control
````

## Architecture Pattern

Generated components follow the **Relay Fragment Architecture**:

```
┌─────────────────────────────────────┐
│   Query Orchestrator Component      │
│   - useLazyLoadQuery                │
│   - Manages fetchKey, transitions   │
│   - Passes fragment refs             │
└───────────────┬─────────────────────┘
                │ fragment ref
                ▼
┌─────────────────────────────────────┐
│   Nodes Component (Generated)       │
│   - useFragment                     │
│   - Receives fragment ref as prop   │
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
  baseColumns[0], // First column (usually ID)
  {
    key: 'actions',
    title: 'Actions',
    fixed: 'right',
    render: (__, record) => (
      <BAIFlex gap="xs">
        <BAIButton size="small" onClick={() => handleEdit(record)}>
          Edit
        </BAIButton>
      </BAIFlex>
    ),
  },
  ...baseColumns.slice(1), // Rest of columns
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
  return [nameCol, ...others];
}}
```

## Best Practices

1. **Fragment Fields**
   - Only request fields you'll actually display
   - Use `@required(action: NONE)` for critical fields
   - Consider nested fragments for related data

2. **Column Rendering**
   - Use specialized BAI components (BAIText, BooleanTag, StatusTag)
   - Format dates with dayjs consistently
   - Handle null/undefined values gracefully

3. **Sorting**
   - Verify API supports sorting on each field
   - Keep `availableSorterKeys` in sync with actual capabilities
   - Provide descriptive column titles

4. **Type Safety**
   - Always run Relay compiler after fragment changes
   - Use generated `$key` and `$data` types
   - Export type definitions for reuse

5. **Internationalization**
   - Use `t('comp:{ComponentName}.Key')` pattern
   - Add translations for all 21 languages
   - Keep translation keys descriptive

## Troubleshooting

### Type Errors After Generation

**Problem:** TypeScript shows missing fragment type imports

**Solution:** Run Relay compiler
```bash
cd packages/backend.ai-ui && pnpm run relay
```

### Import Path Issues

**Problem:** Cannot resolve generated type imports

**Solution:** Adjust import path based on file location:
- `src/components/`: use `../__generated__/`
- `src/components/fragments/`: use `../../__generated__/`

### Missing Translations

**Problem:** Column titles show translation keys

**Solution:** Add keys to locale files:
```json
{
  "comp:ComponentName": {
    "FieldTitle": "Display Name"
  }
}
```

### Sorter Not Working

**Problem:** Clicking column headers doesn't sort

**Solution:**
1. Check field is in `availableSorterKeys`
2. Verify GraphQL API supports sorting on this field
3. Implement `onChangeOrder` handler in parent component

## Reference Files

| File | Purpose |
|------|---------|
| `BAIUserNodes.tsx` | Comprehensive example (15+ columns) |
| `BAISchedulingHistoryNodes.tsx` | Minimal template |
| `SessionNodes.tsx` | Complex example with fragments |
| `.github/instructions/react.instructions.md` | React guidelines |

Location: `packages/backend.ai-ui/src/components/`

## Notes

- Generated components are **starting templates** requiring customization
- Components compile after running `pnpm run relay`
- TODO comments guide customization steps
- Follow `customizeColumns` pattern for flexibility
- Always test with real GraphQL data before finalizing
