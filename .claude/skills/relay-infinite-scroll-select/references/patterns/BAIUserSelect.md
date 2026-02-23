# BAIUserSelect (Pattern B: Dynamic Query Parameters)

## Overview

This component demonstrates **Pattern B (Dynamic)**: Using `useLazyLoadQuery` + `useLazyPaginatedQuery` for infinite scroll with **full control over query parameters**. Supports both email and id as value/label via the `valuePropName` prop, demonstrating how the pattern adapts to different value types while maintaining dynamic control.

## Key Characteristics

- **Value Type**: `email` or `id` (configurable via `valuePropName` prop)
- **Relay Hooks**: `useLazyLoadQuery` + `useLazyPaginatedQuery`
- **Multiple Mode**: Full support
- **Queries**: 2 (ValueQuery for selected items + PaginatedQuery for options)
- **Search**: Optimistic updates with `useOptimistic` + `useDebouncedDeferredValue`
- **Complexity**: 🟡 Moderate
- **Key Features**:
  - ✅ Dynamic `first` parameter based on selection count
  - ✅ Dynamic filter composition from props
  - ✅ External refetch via ref
  - ✅ Optimistic search updates for immediate UI feedback
  - ✅ Debounced + deferred search queries for optimal performance
  - ✅ Optimistic value updates during selection
  - ✅ Configurable value property (email or id)

## When to Use

Use Pattern B (this pattern) when you need:
- ✅ Dynamic query parameters (filter, first, limit, order)
- ✅ Multiple selection support
- ✅ Ensure all selected values are fetched
- ✅ External refetch capability via ref
- ✅ Complex filter combinations
- ✅ Optimistic UI updates

**Note:** Even if your value is a simple name or email, use Pattern B if you need dynamic control. Pattern A is only for simple, static requirements.

## Key Innovation: Dynamic First Parameter

Unlike other patterns, BAIUserSelect dynamically sets the `first` parameter to match the number of selected values, ensuring all selections are fetched efficiently:

```typescript
const { user_nodes: selectedUserNodes } =
  useLazyLoadQuery<BAIUserSelectValueQuery>(
    graphql`
      query BAIUserSelectValueQuery(
        $selectedFilter: String
        $first: Int!
        $skipSelected: Boolean!
      ) {
        user_nodes(filter: $selectedFilter, first: $first)
          @skip(if: $skipSelected) {
          edges {
            node {
              id
              email
              username
              full_name
            }
          }
        }
      }
    `,
    {
      selectedFilter: /* ... */,
      first: _.castArray(deferredControllableValue).length, // 🔑 Key optimization
      skipSelected: _.isEmpty(deferredControllableValue),
    },
    {
      fetchPolicy: !_.isEmpty(deferredControllableValue)
        ? 'store-or-network'
        : 'store-only',
      fetchKey: deferredFetchKey,
    },
  );
```

### Why Dynamic First?

**Problem:**
- Default GraphQL pagination might return only first 10 results
- If user selects 50 users, only 10 would be fetched
- Missing data causes incomplete labels or validation errors

**Solution:**
- Calculate selection count: `_.castArray(deferredControllableValue).length`
- Pass as `first` parameter to fetch exactly what's needed
- No over-fetching, no under-fetching

## Implementation

```typescript
import { BAIUserSelectPaginatedQuery } from '../../__generated__/BAIUserSelectPaginatedQuery.graphql';
import { BAIUserSelectValueQuery } from '../../__generated__/BAIUserSelectValueQuery.graphql';
import { toLocalId } from '../../helper';
import useDebouncedDeferredValue from '../../helper/useDebouncedDeferredValue';
import { useFetchKey } from '../../hooks';
import { useLazyPaginatedQuery } from '../../hooks/usePaginatedQuery';
import { mergeFilterValues } from '../BAIPropertyFilter';
import BAISelect, { BAISelectProps } from '../BAISelect';
import BAIText from '../BAIText';
import TotalFooter from '../TotalFooter';
import { useControllableValue } from 'ahooks';
import { GetRef, Skeleton } from 'antd';
import _ from 'lodash';
import {
  useDeferredValue,
  useImperativeHandle,
  useOptimistic,
  useRef,
  useState,
  useTransition,
} from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

export type UserNode = NonNullable<
  NonNullable<
    BAIUserSelectPaginatedQuery['response']['user_nodes']
  >['edges'][number]
>['node'];

export interface BAIUserSelectRef {
  refetch: () => void;
}

export interface BAIUserSelectProps
  extends Omit<BAISelectProps, 'options' | 'labelInValue' | 'ref'> {
  filter?: string;
  excludeInactive?: boolean;
  valuePropName?: 'id' | 'email';
  onChange?: (value: string | string[] | undefined, option: any) => void;
  ref?: React.Ref<BAIUserSelectRef>;
}

// Default filter for active users only
const defaultActiveUserFilter = 'is_active == true';

const BAIUserSelect: React.FC<BAIUserSelectProps> = ({
  loading,
  filter,
  excludeInactive = false,
  valuePropName = 'email',
  ref,
  ...selectProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const selectRef = useRef<GetRef<typeof BAISelect>>(null);
  const [controllableValue, setControllableValue] = useControllableValue<
    string | string[] | undefined
  >(selectProps, {
    valuePropName: 'value',
    trigger: 'onChange',
  });
  const [controllableOpen, setControllableOpen] = useControllableValue<boolean>(
    selectProps,
    {
      valuePropName: 'open',
      trigger: 'onOpenChange',
      defaultValuePropName: 'defaultOpen',
    },
  );

  const deferredOpen = useDeferredValue(controllableOpen);
  const [searchStr, setSearchStr] = useState<string>();
  const debouncedDeferredValue = useDebouncedDeferredValue(searchStr); // 🔑 Debounce + defer for optimal performance
  const [optimisticSearchStr, setOptimisticSearchStr] =
    useOptimistic(searchStr); // 🔑 Optimistic search for immediate UI feedback
  const [isPendingRefetch, startRefetchTransition] = useTransition();
  const mergedFilter = mergeFilterValues([
    excludeInactive ? defaultActiveUserFilter : null,
    filter,
  ]);
  const [fetchKey, updateFetchKey] = useFetchKey();
  const deferredFetchKey = useDeferredValue(fetchKey);

  // Defer query refetch to prevent flickering during user selection
  const deferredControllableValue = useDeferredValue(controllableValue);

  // Query 1: Fetch selected user nodes with dynamic first parameter
  const { user_nodes: selectedUserNodes } =
    useLazyLoadQuery<BAIUserSelectValueQuery>(
      graphql`
        query BAIUserSelectValueQuery(
          $selectedFilter: String
          $first: Int!
          $skipSelected: Boolean!
        ) {
          user_nodes(filter: $selectedFilter, first: $first)
            @skip(if: $skipSelected) {
            edges {
              node {
                id
                email
                username
                full_name
              }
            }
          }
        }
      `,
      {
        selectedFilter: mergeFilterValues(
          [
            !_.isEmpty(deferredControllableValue)
              ? mergeFilterValues(
                  _.castArray(deferredControllableValue).map((value) => {
                    return `email == "${value}"`;
                  }),
                  '|',
                )
              : null,
            mergedFilter,
          ],
          '&',
        ),
        first: _.castArray(deferredControllableValue).length,
        skipSelected:
          _.isEmpty(deferredControllableValue) || valuePropName === 'id',
      },
      {
        fetchPolicy: !_.isEmpty(deferredControllableValue)
          ? 'store-or-network'
          : 'store-only',
        fetchKey: deferredFetchKey,
      },
    );

  // Query 2: Paginated options for dropdown
  const { paginationData, result, loadNext, isLoadingNext } =
    useLazyPaginatedQuery<BAIUserSelectPaginatedQuery, UserNode>(
      graphql`
        query BAIUserSelectPaginatedQuery(
          $offset: Int!
          $limit: Int!
          $filter: String
          $order: String
        ) {
          user_nodes(
            offset: $offset
            first: $limit
            filter: $filter
            order: $order
          ) {
            count
            edges {
              node {
                id
                email
                username
                full_name
                status
                role
              }
            }
          }
        }
      `,
      { limit: 10 },
      {
        filter: mergeFilterValues([
          mergedFilter,
          debouncedDeferredValue
            ? `email ilike "%${debouncedDeferredValue}%"`
            : null, // 🔑 Use debounced + deferred value in query
        ]),
        order: 'email',
      },
      {
        fetchPolicy: deferredOpen ? 'network-only' : 'store-only',
        fetchKey: deferredFetchKey,
      },
      {
        getTotal: (result) => result.user_nodes?.count ?? undefined,
        getItem: (result) =>
          result.user_nodes?.edges?.map((edge) => edge?.node),
        getId: (item) => item?.id,
      },
    );

  // Expose refetch function through ref
  useImperativeHandle(
    ref,
    () => ({
      refetch: () => {
        startRefetchTransition(() => {
          updateFetchKey();
        });
      },
    }),
    [updateFetchKey, startRefetchTransition],
  );

  const availableOptions = _.map(paginationData, (item) => ({
    label: item?.[valuePropName],
    value: item?.[valuePropName],
  }));

  const controllableValueWithLabel = selectedUserNodes?.edges
    ? // Sort by deferredControllableValue order to maintain selection order
      _.castArray(deferredControllableValue)
        .map((value) => {
          const edge = selectedUserNodes.edges.find(
            (edge) => edge?.node?.[valuePropName] === value,
          );
          return edge
            ? {
                label: edge.node?.[valuePropName],
                value: edge.node?.[valuePropName],
              }
            : null;
        })
        .filter(
          (item): item is { label: string; value: string } => item !== null,
        )
    : !_.isEmpty(deferredControllableValue)
      ? _.castArray(deferredControllableValue).map((value) => ({
          label: value,
          value: value,
        }))
      : undefined;

  const [optimisticValueWithLabel, setOptimisticValueWithLabel] = useState(
    controllableValueWithLabel,
  );

  return (
    <BAISelect
      ref={selectRef}
      placeholder={t('comp:BAIUserSelect.SelectUser')}
      loading={
        loading ||
        controllableValue !== deferredControllableValue ||
        searchStr !== debouncedDeferredValue || // 🔑 Loading during debounce + defer
        isPendingRefetch
      }
      {...selectProps}
      searchAction={async (value) => {
        setOptimisticSearchStr(value); // 🔑 Set optimistic value for immediate UI feedback
        setSearchStr(value); // 🔑 Set actual value (will be debounced + deferred)
        await selectProps.searchAction?.(value);
      }}
      showSearch={
        selectProps.showSearch === false
          ? false
          : {
              searchValue: optimisticSearchStr, // 🔑 Use optimistic value for immediate feedback
              autoClearSearchValue: true,
              filterOption: false,
              ...(_.isObject(selectProps.showSearch)
                ? _.omit(selectProps.showSearch, ['searchValue'])
                : {}),
            }
      }
      value={
        controllableValue !== deferredControllableValue
          ? optimisticValueWithLabel
          : controllableValueWithLabel
      }
      labelInValue
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
      onChange={(value, option) => {
        // _.castArray to handle both single and multiple mode uniformly
        const valueArray = _.isEmpty(value) ? [] : _.castArray(value);

        // In multiple mode, when removing tags, value.label is a React element
        // So we need to find the original label from availableOptions
        const valueWithOriginalLabel = valueArray.map((v) => {
          // If label is string, use it directly; if React element, find from options
          const label = _.isString(v.label)
            ? v.label
            : (availableOptions.find((opt) => opt.value === v.value)?.label ??
              v.value);
          return {
            label,
            value: v.value,
          };
        });

        setOptimisticValueWithLabel(valueWithOriginalLabel);

        const emailArray = valueArray.map((v) => _.toString(v.value));
        setControllableValue(emailArray, option);
      }}
      options={availableOptions}
      endReached={() => {
        loadNext();
      }}
      open={controllableOpen}
      onOpenChange={setControllableOpen}
      notFoundContent={
        _.isUndefined(paginationData) ? (
          <Skeleton.Input active size="small" block />
        ) : undefined
      }
      footer={
        _.isNumber(result.user_nodes?.count) && result.user_nodes.count > 0 ? (
          <TotalFooter
            loading={isLoadingNext}
            total={result.user_nodes.count}
          />
        ) : undefined
      }
    />
  );
};

export default BAIUserSelect;
```

## Key Points

### 1. Dynamic First Parameter Strategy

```typescript
query BAIUserSelectValueQuery(
  $selectedFilter: String
  $first: Int!        // 🔑 Required parameter
  $skipSelected: Boolean!
) {
  user_nodes(filter: $selectedFilter, first: $first)
    @skip(if: $skipSelected) {
    edges {
      node {
        id
        email
        username
        full_name
      }
    }
  }
}
```

```typescript
{
  selectedFilter: /* ... */,
  first: _.castArray(deferredControllableValue).length, // Dynamic calculation
  skipSelected: _.isEmpty(deferredControllableValue),
}
```

**Benefits:**
- ✅ Fetch exactly the number of selected items
- ✅ No over-fetching (performance optimization)
- ✅ No under-fetching (data completeness)
- ✅ Works with any selection count (1, 10, 100, etc.)

### 2. Email-Based Filter Construction

```typescript
selectedFilter: mergeFilterValues(
  [
    !_.isEmpty(deferredControllableValue)
      ? mergeFilterValues(
          _.castArray(deferredControllableValue).map((value) => {
            return `email == "${value}"`;
          }),
          '|', // OR operator for multiple values
        )
      : null,
    mergedFilter, // Additional filters
  ],
  '&', // AND operator
),
```

**Filter Logic:**
- Build `email == "user1@example.com" | email == "user2@example.com"` for multiple selections
- Uses email-based filtering (when `valuePropName='id'`, query is skipped via `skipSelected`)
- Combine with external filters using AND operator
- Null filters are automatically ignored by `mergeFilterValues`

### 3. Value-to-Label Mapping

```typescript
const controllableValueWithLabel = selectedUserNodes?.edges
  ? _.castArray(deferredControllableValue)
      .map((value) => {
        const edge = selectedUserNodes.edges.find(
          (edge) => edge?.node?.[valuePropName] === value,
        );
        return edge
          ? {
              label: edge.node?.[valuePropName],
              value: edge.node?.[valuePropName],
            }
          : null;
      })
      .filter(
        (item): item is { label: string; value: string } => item !== null,
      )
  : !_.isEmpty(deferredControllableValue)
    ? _.castArray(deferredControllableValue).map((value) => ({
        label: value,
        value: value,
      }))
    : undefined;
```

- **Dynamic property**: Uses `valuePropName` to support both email and id modes
- **Maintain selection order**: Map in the same order as `deferredControllableValue`
- **Fallback**: Use value as label if query not yet resolved

### 4. State Management Pattern

**Controllable Values:**
```typescript
const [controllableValue, setControllableValue] = useControllableValue<
  string | string[] | undefined
>(selectProps);

const [controllableOpen, setControllableOpen] = useControllableValue<boolean>(
  selectProps,
  {
    valuePropName: 'open',
    trigger: 'onOpenChange',
  },
);
```

**Deferred Values:**
```typescript
const deferredOpen = useDeferredValue(controllableOpen);
const deferredControllableValue = useDeferredValue(controllableValue);
const deferredFetchKey = useDeferredValue(fetchKey);
```

### 5. Custom Label Rendering

When using `valuePropName='id'`, display Global IDs as local IDs for better readability:

```typescript
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

**Key Points:**
- Use `toLocalId()` to convert Global IDs (e.g., `VXNlck5vZGU6MQ==`) to local IDs (e.g., `1`)
- Apply `BAIText` with `monospace` prop for consistent ID rendering
- Conditionally render based on `valuePropName` to support both email and id modes
- Apply to both `labelRender` (selected tags) and `optionRender` (dropdown options)

### 6. Multiple Mode Handling

```typescript
onChange={(value, option) => {
  // _.castArray to handle both single and multiple mode uniformly
  const valueArray = _.isEmpty(value) ? [] : _.castArray(value);

  // Handle React element labels when removing tags
  const valueWithOriginalLabel = valueArray.map((v) => {
    const label = _.isString(v.label)
      ? v.label
      : (availableOptions.find((opt) => opt.value === v.value)?.label ??
        v.value);
    return {
      label,
      value: v.value,
    };
  });

  setOptimisticValueWithLabel(valueWithOriginalLabel);

  const emailArray = valueArray.map((v) => _.toString(v.value));
  setControllableValue(emailArray, option);
}}
```

**Key Points:**
- Use `_.isEmpty()` to check for empty value before casting
- Use `_.castArray()` for uniform handling of single/multiple modes
- Preserve labels when removing tags
- Update optimistic state immediately

### 7. Loading State Management

```typescript
loading={
  loading ||
  controllableValue !== deferredControllableValue ||
  searchStr !== debouncedDeferredValue ||
  isPendingRefetch
}
```

**Loading Conditions:**
- `loading`: External loading prop from parent
- `controllableValue !== deferredControllableValue`: Selection in progress (optimistic UI)
- `searchStr !== debouncedDeferredValue`: Search query executing (debounce + defer period)
- `isPendingRefetch`: Manual refetch via ref in progress

**Four conditions:**
1. External `loading` prop
2. Value transition (optimistic update in progress)
3. Search query executing (during debounce + defer period)
4. Manual refetch triggered

## Advantages

✅ **Flexible value model**: Supports both email and id via `valuePropName` prop
✅ **Dynamic first parameter**: Always fetch complete data
✅ **Simplified ID handling**: When using id mode, ValueQuery is skipped via `skipSelected`
✅ **Multiple selection**: Full support with proper handling
✅ **Optimistic updates**: Smooth UX during selection
✅ **External refetch**: Exposed via ref
✅ **Filter composition**: Easy to combine filters

## Comparison with Other Patterns

| Feature | Pattern A (Simple) | Pattern B (BAIUserSelect) | Pattern B (BAIVFolderSelect) |
|---------|-------------------|--------------------------|----------------------------|
| Value Type | Name | Email / ID | ID / row_id |
| Dynamic Parameters | ❌ | ✅ Full control | ✅ Full control |
| Dynamic First | ❌ | ✅ | ✅ Possible |
| ID Conversion | ❌ | 🟡 Simplified (skip query for id mode) | ✅ Required |
| Multiple Mode | ❌ | ✅ | ✅ |
| External Refetch | ❌ | ✅ | ✅ |
| Queries | 1 | 2 (1 when id mode) | 2 |
| Complexity | 🟢 Simple | 🟡 Moderate | 🟡 Moderate |

**Key Insight:** Pattern B is characterized by **dynamic query parameter control**, not by value type. Both BAIUserSelect (email) and BAIVFolderSelect (ID) use Pattern B because they need dynamic features.

## Usage Examples

### Basic Usage
```typescript
const MyComponent = () => {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  return (
    <BAIUserSelect
      mode="multiple"
      value={selectedUsers}
      onChange={setSelectedUsers}
      placeholder="Select users"
    />
  );
};
```

### With External Refetch
```typescript
const MyComponent = () => {
  const userSelectRef = useRef<BAIUserSelectRef>(null);

  const handleRefresh = () => {
    userSelectRef.current?.refetch();
  };

  return (
    <>
      <BAIUserSelect
        ref={userSelectRef}
        mode="multiple"
      />
      <Button onClick={handleRefresh}>Refresh Users</Button>
    </>
  );
};
```

### With External Filter (Active Users Only)
```typescript
const MyComponent = () => {
  return (
    <BAIUserSelect
      excludeInactive  // Built-in prop
      filter="role == 'admin'"  // Additional filter
    />
  );
};
```

### With Search
```typescript
const MyComponent = () => {
  return (
    <BAIUserSelect
      showSearch
      placeholder="Search users by email"
    />
  );
};
```

### With ID Value Mode
```typescript
const MyComponent = () => {
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  return (
    <BAIUserSelect
      mode="multiple"
      valuePropName="id"  // Use Global IDs as value
      value={selectedUserIds}
      onChange={setSelectedUserIds}
      placeholder="Select users by ID"
    />
  );
};
```

## Best Practices

### 1. Always Use Dynamic First
```typescript
// ✅ Good: Dynamic first based on selection count
first: _.castArray(deferredControllableValue).length

// ❌ Bad: Hardcoded first
first: 10  // Will fail if user selects more than 10
```

### 2. Filter Merging
```typescript
// ✅ Good: Use mergeFilterValues for clean composition
selectedFilter: mergeFilterValues(
  [
    !_.isEmpty(deferredControllableValue)
      ? mergeFilterValues(
          _.castArray(deferredControllableValue).map((value) => {
            return `email == "${value}"`;
          }),
          '|',
        )
      : null,
    mergedFilter,
  ],
  '&',
)

// ❌ Bad: String concatenation
selectedFilter: emailFilter + ' & ' + externalFilter
```

### 3. Optimistic Search with Debounced Deferred Value
```typescript
// ✅ Good: Optimistic search + debounced deferred query for optimal performance
import useDebouncedDeferredValue from '../../helper/useDebouncedDeferredValue';

const [searchStr, setSearchStr] = useState<string>();
const debouncedDeferredValue = useDebouncedDeferredValue(searchStr); // 🔑 Debounce + defer
const [optimisticSearchStr, setOptimisticSearchStr] =
  useOptimistic(searchStr);

// Use debouncedDeferredValue in query filter
filter: mergeFilterValues([
  mergedFilter,
  debouncedDeferredValue ? `email ilike "%${debouncedDeferredValue}%"` : null,
])

// Set optimistic value and actual value
searchAction={async (value) => {
  setOptimisticSearchStr(value);  // Optimistic - immediate UI update
  setSearchStr(value);             // Actual state - will be debounced + deferred
  await selectProps.searchAction?.(value);
}}

// Use optimistic value in search input
showSearch={{
  searchValue: optimisticSearchStr,
  // ...
}}

// Loading state includes debounce + defer check
loading={
  loading ||
  controllableValue !== deferredControllableValue ||
  searchStr !== debouncedDeferredValue ||  // 🔑 Loading during debounce + defer
  isPendingRefetch
}

// ✅ Good: Use deferred values for controllable props
useLazyLoadQuery(query, {
  filter: debouncedDeferredValue,  // Debounced + deferred for search
  fetchKey: deferredFetchKey,       // Deferred for refetch
})

// ❌ Bad: Not using debounce - too many queries
filter: mergeFilterValues([
  mergedFilter,
  searchStr ? `email ilike "%${searchStr}%"` : null,  // Query on every keystroke
])

// ❌ Bad: Only useOptimistic without debounce
startTransition(() => {
  setSearchStr(value);  // Still queries too frequently
})

// ❌ Bad: Use immediate values (causes Suspense flicker)
useLazyLoadQuery(query, {
  filter: filter,
  fetchKey: fetchKey,
})
```

**Why useDebouncedDeferredValue?**
- ✅ Combines debounce (reduce query frequency) + defer (prevent UI blocking)
- ✅ Input shows optimistic value immediately (useOptimistic)
- ✅ Query executes with debounced + deferred value (optimal performance)
- ✅ Loading indicator shows during debounce + defer period
- ✅ Best balance between responsiveness and performance

## Common Pitfalls

| Pitfall | Impact | Solution |
|---------|--------|----------|
| Missing `first` parameter | Missing selected values | Add dynamic first calculation |
| Hardcoded `first: 10` | Incomplete data for >10 selections | Use `_.castArray(value).length` |
| Not using `_.castArray` | Single mode breaks | Always normalize values |
| Missing `@skip` directive | Unnecessary queries | Add skip when empty |
| Not preserving labels | Lost labels on tag removal | Check if label is string or element |

## Integration Checklist

- [ ] Import `useLazyLoadQuery` and `useLazyPaginatedQuery`
- [ ] Add `'use memo'` directive
- [ ] Implement dynamic `first` parameter
- [ ] Use `@skip(if: $skipSelected)` directive
- [ ] Defer all query variables
- [ ] Build email-based filter with OR operator
- [ ] Map selected emails to labels
- [ ] Handle optimistic updates
- [ ] Expose refetch via ref
- [ ] Handle React element labels in onChange
- [ ] Add proper loading states
- [ ] Add i18n translations with `comp:` prefix
