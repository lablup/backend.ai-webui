# BAIVFolderSelect (Pattern B: ID-Based)

## Overview

This component demonstrates **Pattern B**: Using `useLazyLoadQuery` + `useLazyPaginatedQuery` for infinite scroll when the entity's **ID is different from the display name**. This is the more complex pattern that requires two GraphQL queries but provides maximum flexibility.

## Key Characteristics

- **Value Type**: `id` (Global ID) or `row_id` (UUID)
- **Relay Hooks**: `useLazyLoadQuery` + `useLazyPaginatedQuery`
- **Multiple Mode**: Full support
- **Queries**: 2 (ValueQuery for selected items + PaginatedQuery for options)
- **Search**: State-based with filter string
- **Complexity**: 🟡 Moderate

## When to Use

Use this pattern when:
- The entity's ID is different from the display name
- You need multiple selection support
- You need to convert between Global ID and local ID
- You want external refetch capability via ref
- You need optimistic UI updates

## Implementation

```typescript
import { BAIVFolderSelectPaginatedQuery } from '../../__generated__/BAIVFolderSelectPaginatedQuery.graphql';
import { BAIVFolderSelectValueQuery } from '../../__generated__/BAIVFolderSelectValueQuery.graphql';
import { toLocalId } from '../../helper';
import { useFetchKey } from '../../hooks';
import { useLazyPaginatedQuery } from '../../hooks/usePaginatedQuery';
import BAILink from '../BAILink';
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
  useRef,
  useState,
  useTransition,
} from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

export type VFolderNode = NonNullable<
  NonNullable<
    BAIVFolderSelectPaginatedQuery['response']['vfolder_nodes']
  >['edges'][number]
>['node'];

export interface BAIVFolderSelectRef {
  refetch: () => void;
}

export interface BAIVFolderSelectProps
  extends Omit<BAISelectProps, 'options' | 'labelInValue' | 'ref'> {
  currentProjectId?: string;
  onClickVFolder?: (value: string) => void;
  filter?: string;
  valuePropName?: 'id' | 'row_id';
  excludeDeleted?: boolean;
  ref?: React.Ref<BAIVFolderSelectRef>;
}

// Exclude deleted or deleting vfolders
const excludeDeletedStatusFilter =
  'status != "DELETE_PENDING" & status != "DELETE_ONGOING" & status != "DELETE_ERROR" & status != "DELETE_COMPLETE"';

const BAIVFolderSelect: React.FC<BAIVFolderSelectProps> = ({
  loading,
  currentProjectId,
  onClickVFolder,
  filter,
  excludeDeleted,
  valuePropName = 'id',
  ref,
  ...selectProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const selectRef = useRef<GetRef<typeof BAISelect>>(null);
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
  const deferredOpen = useDeferredValue(controllableOpen);
  const [searchStr, setSearchStr] = useState<string>();
  const [isPendingRefetch, startRefetchTransition] = useTransition();
  const mergedFilter = mergeFilterValues([
    excludeDeleted ? excludeDeletedStatusFilter : null,
    filter,
  ]);
  const [fetchKey, updateFetchKey] = useFetchKey();
  const deferredFetchKey = useDeferredValue(fetchKey);

  // Defer query refetch to prevent flickering during user selection
  const deferredControllableValue = useDeferredValue(controllableValue);

  const { vfolder_nodes: selectedVFolderNodes } =
    useLazyLoadQuery<BAIVFolderSelectValueQuery>(
      graphql\`
        query BAIVFolderSelectValueQuery(
          $selectedFilter: String
          $skipSelectedVFolder: Boolean!
          $scopeId: ScopeField
        ) {
          vfolder_nodes(
            scope_id: $scopeId
            filter: $selectedFilter
            permission: "read_attribute"
          ) @skip(if: $skipSelectedVFolder) {
            edges {
              node {
                name
                id
                row_id
              }
            }
          }
        }
      \`,
      {
        selectedFilter: mergeFilterValues(
          [
            !_.isEmpty(deferredControllableValue)
              ? mergeFilterValues(
                  _.castArray(deferredControllableValue).map((value) => {
                    // When valuePropName is 'id', convert Global ID to local UUID
                    // When valuePropName is 'row_id', use the value directly
                    const filterValue =
                      valuePropName === 'id' ? toLocalId(value) : value;
                    return \`\${valuePropName} == "\${filterValue}"\`;
                  }),
                  '|',
                )
              : null,
            mergedFilter,
          ],
          '&',
        ),
        skipSelectedVFolder: _.isEmpty(deferredControllableValue),
        scopeId: currentProjectId ? \`project:\${currentProjectId}\` : undefined,
      },
      {
        fetchPolicy: !_.isEmpty(deferredControllableValue)
          ? 'store-or-network'
          : 'store-only',
        fetchKey: deferredFetchKey,
      },
    );

  const { paginationData, result, loadNext, isLoadingNext } =
    useLazyPaginatedQuery<BAIVFolderSelectPaginatedQuery, VFolderNode>(
      graphql\`
        query BAIVFolderSelectPaginatedQuery(
          $offset: Int!
          $limit: Int!
          $scopeId: ScopeField
          $filter: String
          $permission: VFolderPermissionValueField
        ) {
          vfolder_nodes(
            scope_id: $scopeId
            offset: $offset
            first: $limit
            filter: $filter
            permission: $permission
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
          mergedFilter,
          searchStr ? \`name ilike "%\${searchStr}%"\` : null,
        ]),
        scopeId: currentProjectId ? \`project:\${currentProjectId}\` : undefined,
        permission: 'read_attribute' as const,
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
    label: item?.name,
    value: item?.[valuePropName],
  }));

  const controllableValueWithLabel = selectedVFolderNodes?.edges
    ? // Sort by deferredControllableValue order to maintain selection order
      _.castArray(deferredControllableValue)
        .map((value) => {
          const edge = selectedVFolderNodes.edges.find(
            (edge) => edge?.node?.[valuePropName] === value,
          );
          return edge
            ? {
                label: edge.node?.name,
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
      placeholder={t('comp:BAIVFolderSelect.SelectFolder')}
      loading={
        loading ||
        controllableValue !== deferredControllableValue ||
        isPendingRefetch
      }
      {...selectProps}
      searchAction={async (value) => {
        setSearchStr(value);
        await selectProps.searchAction?.(value);
      }}
      showSearch={{
        searchValue: searchStr,
        autoClearSearchValue: true,
        filterOption: false,
        ...(_.isObject(selectProps.showSearch)
          ? _.omit(selectProps.showSearch, ['searchValue'])
          : {}),
      }}
      labelRender={({ label, value }) => {
        return onClickVFolder ? (
          <BAILink onClick={() => onClickVFolder(_.toString(value))}>
            {label}
          </BAILink>
        ) : (
          <>
            {label}
            <BAIText type="secondary">
              &nbsp; (
              <BAIText
                ellipsis
                type="secondary"
                style={{
                  width: 80,
                }}
                monospace
              >
                {valuePropName === 'id'
                  ? toLocalId(_.toString(value))
                  : _.toString(value)}
              </BAIText>
              )
            </BAIText>
          </>
        );
      }}
      optionRender={({ label, value }) => (
        <>
          {label}
          <BAIText type="secondary">
            &nbsp; (
            <BAIText
              ellipsis
              style={{
                width: 80,
              }}
              type="secondary"
              monospace
            >
              {valuePropName === 'id'
                ? toLocalId(_.toString(value))
                : _.toString(value)}
            </BAIText>
            )
          </BAIText>
        </>
      )}
      value={
        controllableValue !== deferredControllableValue
          ? optimisticValueWithLabel
          : controllableValueWithLabel
      }
      labelInValue
      onChange={(value, option) => {
        // In multiple mode, when removing tags, value.label is a React element
        // So we need to find the original label from availableOptions
        const valueWithOriginalLabel = _.castArray(value).map((v) => {
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
        setControllableValue(
          _.castArray(value).map((v) => _.toString(v.value)),
          option,
        );
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
        _.isNumber(result.vfolder_nodes?.count) &&
        result.vfolder_nodes.count > 0 ? (
          <TotalFooter
            loading={isLoadingNext}
            total={result.vfolder_nodes.count}
          />
        ) : undefined
      }
    />
  );
};

export default BAIVFolderSelect;
```

## Key Points

### 1. Dual Query Architecture

**Query 1: Selected Values (useLazyLoadQuery)**
```typescript
const { vfolder_nodes: selectedVFolderNodes } =
  useLazyLoadQuery<BAIVFolderSelectValueQuery>(
    graphql\`
      query BAIVFolderSelectValueQuery(
        $selectedFilter: String
        $skipSelectedVFolder: Boolean!
        $scopeId: ScopeField
      ) {
        vfolder_nodes(
          scope_id: $scopeId
          filter: $selectedFilter
          permission: "read_attribute"
        ) @skip(if: $skipSelectedVFolder) {
          edges {
            node {
              name
              id
              row_id
            }
          }
        }
      }
    \`,
    {
      selectedFilter: /* ... */,
      skipSelectedVFolder: _.isEmpty(deferredControllableValue),
      scopeId: currentProjectId ? \`project:\${currentProjectId}\` : undefined,
    },
    {
      fetchPolicy: !_.isEmpty(deferredControllableValue)
        ? 'store-or-network'
        : 'store-only',
      fetchKey: deferredFetchKey,
    },
  );
```

- **@skip directive**: Skip query when no selection (optimization)
- **fetchPolicy**: `store-or-network` when has selection, `store-only` when empty
- **Purpose**: Get labels for currently selected IDs

**Query 2: Paginated Options (useLazyPaginatedQuery)**
```typescript
const { paginationData, result, loadNext, isLoadingNext } =
  useLazyPaginatedQuery<BAIVFolderSelectPaginatedQuery, VFolderNode>(
    graphql\`
      query BAIVFolderSelectPaginatedQuery(
        $offset: Int!
        $limit: Int!
        $scopeId: ScopeField
        $filter: String
        $permission: VFolderPermissionValueField
      ) {
        vfolder_nodes(
          scope_id: $scopeId
          offset: $offset
          first: $limit
          filter: $filter
          permission: $permission
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
    { /* other variables */ },
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
```

- **Offset-based pagination**: Not cursor-based
- **fetchPolicy**: `network-only` when open, `store-only` when closed
- **Purpose**: Get paginated list of available options

### 2. State Management

**Controllable Values**
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

- Use `useControllableValue` from ahooks for controlled/uncontrolled support
- Handle both `value` and `open` props

**Deferred Values**
```typescript
const deferredOpen = useDeferredValue(controllableOpen);
const deferredControllableValue = useDeferredValue(controllableValue);
const deferredFetchKey = useDeferredValue(fetchKey);
```

- Prevent parent Suspense from triggering
- Smooth transitions during async operations
- Critical for good UX

**Fetch Key Pattern**
```typescript
const [fetchKey, updateFetchKey] = useFetchKey();

// In ref handler
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
```

- Allow external refetch via ref
- Use transition for non-blocking update

### 3. Value-to-Label Mapping

```typescript
const controllableValueWithLabel = selectedVFolderNodes?.edges
  ? // Sort by deferredControllableValue order to maintain selection order
    _.castArray(deferredControllableValue)
      .map((value) => {
        const edge = selectedVFolderNodes.edges.find(
          (edge) => edge?.node?.[valuePropName] === value,
        );
        return edge
          ? {
              label: edge.node?.name,
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

- Map selected IDs to `{ label, value }` pairs
- Maintain selection order
- Fallback to value as label if no data yet

### 4. Optimistic Updates

```typescript
const [optimisticValueWithLabel, setOptimisticValueWithLabel] = useState(
  controllableValueWithLabel,
);

// In BAISelect value prop
value={
  controllableValue !== deferredControllableValue
    ? optimisticValueWithLabel  // Use optimistic during transition
    : controllableValueWithLabel // Use real data when stable
}
```

- Show user's selection immediately
- Switch to real data when query resolves
- Prevents flicker during selection

### 5. Multiple Mode Support

```typescript
onChange={(value, option) => {
  // In multiple mode, when removing tags, value.label is a React element
  // So we need to find the original label from availableOptions
  const valueWithOriginalLabel = _.castArray(value).map((v) => {
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
  setControllableValue(
    _.castArray(value).map((v) => _.toString(v.value)),
    option,
  );
}}
```

- **Critical**: Use `_.castArray()` to handle both single and array values
- Handle React element labels when removing tags
- Find original label from availableOptions

### 6. Global ID Conversion

```typescript
const filterValue =
  valuePropName === 'id' ? toLocalId(value) : value;
return \`\${valuePropName} == "\${filterValue}"\`;
```

- When `valuePropName === 'id'`, convert Global ID to local UUID
- Backend filter uses local IDs, not Global IDs
- `toLocalId()` from helper.ts

### 7. Filter Merging

```typescript
const mergedFilter = mergeFilterValues([
  excludeDeleted ? excludeDeletedStatusFilter : null,
  filter,
]);

// In search
filter: mergeFilterValues([
  mergedFilter,
  searchStr ? \`name ilike "%\${searchStr}%"\` : null,
]),
```

- Combine multiple filter conditions
- Null filters are ignored
- Default operator is `&` (AND)

### 8. Loading States

```typescript
loading={
  loading ||
  controllableValue !== deferredControllableValue ||
  isPendingRefetch
}
```

Three loading conditions:
1. External `loading` prop
2. Value transition (controllable !== deferred)
3. Manual refetch in progress

## Advantages

✅ **Flexible value type**: Support both Global ID and row_id
✅ **Multiple selection**: Full support with proper label handling
✅ **Optimistic updates**: Smooth UX during async operations
✅ **External refetch**: Expose refetch via ref
✅ **Global ID conversion**: Automatic handling
✅ **Filter composition**: Easy to add external filters
✅ **Deferred values**: No Suspense flicker

## Limitations

❌ **Complex**: Requires two queries and more state
❌ **More code**: ~350 lines vs ~100 lines for Pattern A
❌ **Higher token cost**: Uses more tokens for generation

## Usage Examples

### Basic Usage
```typescript
const MyComponent = () => {
  const [selectedFolders, setSelectedFolders] = useState<string[]>([]);

  return (
    <BAIVFolderSelect
      mode="multiple"
      value={selectedFolders}
      onChange={setSelectedFolders}
      currentProjectId="project-123"
      placeholder="Select folders"
    />
  );
};
```

### With External Refetch
```typescript
const MyComponent = () => {
  const vfolderSelectRef = useRef<BAIVFolderSelectRef>(null);

  const handleRefresh = () => {
    vfolderSelectRef.current?.refetch();
  };

  return (
    <>
      <BAIVFolderSelect
        ref={vfolderSelectRef}
        valuePropName="id"
        currentProjectId="project-123"
      />
      <Button onClick={handleRefresh}>Refresh</Button>
    </>
  );
};
```

### With External Filter
```typescript
const MyComponent = () => {
  const [ownershipFilter, setOwnershipFilter] = useState('');

  return (
    <BAIVFolderSelect
      filter={mergeFilterValues([
        'status != "DELETE_COMPLETE"',
        ownershipFilter ? \`ownership_type == "\${ownershipFilter}"\` : null,
      ])}
      excludeDeleted
    />
  );
};
```

### With Click Handler
```typescript
const MyComponent = () => {
  const navigate = useNavigate();

  return (
    <BAIVFolderSelect
      onClickVFolder={(folderId) => {
        navigate(\`/folders/\${folderId}\`);
      }}
    />
  );
};
```
