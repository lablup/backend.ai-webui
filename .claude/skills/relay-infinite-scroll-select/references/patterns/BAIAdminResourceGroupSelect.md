# BAIAdminResourceGroupSelect (Pattern A: Name-Based)

## Overview

This component demonstrates **Pattern A**: Using `usePaginationFragment` for infinite scroll when the entity's **name is both the value and the label**. This is the simpler pattern that requires only one GraphQL query.

## Key Characteristics

- **Value Type**: `name` field (string)
- **Relay Hook**: `usePaginationFragment`
- **Multiple Mode**: Single selection only
- **Queries**: 1 fragment with `@refetchable`
- **Search**: Refetch-based with filter
- **Complexity**: 🟢 Simple

## When to Use

Use this pattern when:
- The entity's display name (`name` field) is unique
- You want to use the name as the select value
- Single selection is sufficient
- You don't need Global ID conversion

## Implementation

```typescript
import { BAIAdminResourceGroupSelectPaginationQuery } from '../../__generated__/BAIAdminResourceGroupSelectPaginationQuery.graphql';
import { BAIAdminResourceGroupSelect_scalingGroupsV2Fragment$key } from '../../__generated__/BAIAdminResourceGroupSelect_scalingGroupsV2Fragment.graphql';
import BAISelect, { BAISelectProps } from '../BAISelect';
import TotalFooter from '../TotalFooter';
import { Skeleton } from 'antd';
import { GetRef } from 'antd/lib';
import _ from 'lodash';
import { useOptimistic, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePaginationFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

export interface BAIAdminResourceGroupSelectProps
  extends Omit<BAISelectProps, 'options' | 'labelInValue'> {
  queryRef: BAIAdminResourceGroupSelect_scalingGroupsV2Fragment$key;
}

const BAIAdminResourceGroupSelect = ({
  queryRef,
  loading,
  ...selectPropsWithoutLoading
}: BAIAdminResourceGroupSelectProps) => {
  const { t } = useTranslation();
  const selectRef = useRef<GetRef<typeof BAISelect>>(null);
  const [searchStr, setSearchStr] = useState<string>();
  const [optimisticSearchStr, setOptimisticSearchStr] =
    useOptimistic(searchStr);

  const { data, loadNext, isLoadingNext, refetch, hasNext } =
    usePaginationFragment<
      BAIAdminResourceGroupSelectPaginationQuery,
      BAIAdminResourceGroupSelect_scalingGroupsV2Fragment$key
    >(
      graphql\`
        fragment BAIAdminResourceGroupSelect_scalingGroupsV2Fragment on Query
        @argumentDefinitions(
          first: { type: "Int", defaultValue: 10 }
          after: { type: "String" }
          filter: { type: "ScalingGroupFilter" }
        )
        @refetchable(queryName: "BAIAdminResourceGroupSelectPaginationQuery") {
          allScalingGroupsV2(first: $first, after: $after, filter: $filter)
            @connection(key: "BAIAdminResourceGroupSelect_allScalingGroupsV2") {
            count
            edges {
              node {
                id
                name
              }
            }
          }
        }
      \`,
      queryRef,
    );

  const selectOptions = _.map(data.allScalingGroupsV2.edges, (item) => ({
    label: item.node.name,
    value: item.node.name, // since scaling group uses name as primary key, use name as value
  }));

  return (
    <BAISelect
      ref={selectRef}
      placeholder={t('comp:BAIAdminResourceGroupSelect.PlaceHolder')}
      showSearch={
        selectPropsWithoutLoading.showSearch === false
          ? false
          : {
              searchValue: optimisticSearchStr,
              autoClearSearchValue: true,
              filterOption: false,
              ...(_.isObject(selectPropsWithoutLoading.showSearch)
                ? _.omit(selectPropsWithoutLoading.showSearch, ['searchValue'])
                : {}),
            }
      }
      loading={loading}
      options={selectOptions}
      {...selectPropsWithoutLoading}
      searchAction={async (value) => {
        setOptimisticSearchStr(value);
        setSearchStr(value);
        selectRef.current?.scrollTo(0);
        refetch({
          filter: value
            ? {
                name: {
                  contains: value,
                },
              }
            : null,
        });
        await selectPropsWithoutLoading.searchAction?.(value);
      }}
      endReached={() => {
        hasNext && loadNext(10);
      }}
      notFoundContent={
        _.isUndefined(data) ? (
          <Skeleton.Input active size="small" block />
        ) : undefined
      }
      footer={
        _.isNumber(data.allScalingGroupsV2.count) &&
        data.allScalingGroupsV2.count > 0 ? (
          <TotalFooter
            loading={isLoadingNext}
            total={data.allScalingGroupsV2.count}
          />
        ) : undefined
      }
    />
  );
};

export default BAIAdminResourceGroupSelect;
```

## Key Points

### 1. Fragment Definition
```typescript
graphql\`
  fragment BAIAdminResourceGroupSelect_scalingGroupsV2Fragment on Query
  @argumentDefinitions(
    first: { type: "Int", defaultValue: 10 }
    after: { type: "String" }
    filter: { type: "ScalingGroupFilter" }
  )
  @refetchable(queryName: "BAIAdminResourceGroupSelectPaginationQuery") {
    allScalingGroupsV2(first: $first, after: $after, filter: $filter)
      @connection(key: "BAIAdminResourceGroupSelect_allScalingGroupsV2") {
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

- **@argumentDefinitions**: Define variables for pagination and filtering
- **@refetchable**: Enables refetching with new variables
- **@connection**: Relay's normalized cache key for pagination

### 2. Options Creation
```typescript
const selectOptions = _.map(data.allScalingGroupsV2.edges, (item) => ({
  label: item.node.name,  // Display name
  value: item.node.name,  // Value is same as name
}));
```

Simple mapping from edges to options. **No labelInValue needed** since value and label are the same.

### 3. Search Implementation

**State Management:**
```typescript
const [searchStr, setSearchStr] = useState<string>();
const [optimisticSearchStr, setOptimisticSearchStr] =
  useOptimistic(searchStr);
```

**showSearch Configuration:**
```typescript
showSearch={
  selectPropsWithoutLoading.showSearch === false
    ? false
    : {
        searchValue: optimisticSearchStr,
        autoClearSearchValue: true,
        filterOption: false,
        ...(_.isObject(selectPropsWithoutLoading.showSearch)
          ? _.omit(selectPropsWithoutLoading.showSearch, ['searchValue'])
          : {}),
      }
}
```

**searchAction:**
```typescript
searchAction={async (value) => {
  setOptimisticSearchStr(value);  // Immediate UI feedback
  setSearchStr(value);             // Actual state for query
  selectRef.current?.scrollTo(0);  // Reset scroll position
  refetch({
    filter: value
      ? {
          name: {
            contains: value,
          },
        }
      : null,
  });
  await selectPropsWithoutLoading.searchAction?.(value);
}}
```

**Key Points:**
- ✅ `useOptimistic` for immediate search input feedback
- ✅ Conditional `showSearch` allows disabling with `showSearch={false}`
- ✅ Merge user-provided `showSearch` config (except `searchValue`)
- ✅ Scroll to top on search for better UX
- ✅ Use `refetch` to reload data with new filter
- ✅ Filter structure matches GraphQL schema

### 4. Infinite Scroll
```typescript
endReached={() => {
  hasNext && loadNext(10);
}}
```

- Check `hasNext` before loading more
- Load 10 items at a time (configurable)

### 5. Loading States
```typescript
notFoundContent={
  _.isUndefined(data) ? (
    <Skeleton.Input active size="small" block />
  ) : undefined
}
```

Show skeleton during initial load, `undefined` when no results.

### 6. Footer with Total Count
```typescript
footer={
  _.isNumber(data.allScalingGroupsV2.count) &&
  data.allScalingGroupsV2.count > 0 ? (
    <TotalFooter
      loading={isLoadingNext}
      total={data.allScalingGroupsV2.count}
    />
  ) : undefined
}
```

Display total count in footer, with loading state during pagination.

## Advantages

✅ **Simple**: Only one query, minimal state management
✅ **Direct value mapping**: No need for labelInValue
✅ **Refetch-based search**: Easy to implement and understand
✅ **Built-in pagination**: Relay handles connection pagination

## Limitations

❌ **Name must be unique**: Cannot handle duplicate names
❌ **Single selection only**: No multiple mode in this example
❌ **No external refetch**: Cannot expose refetch via ref

## Usage Example

```typescript
import { graphql, useLazyLoadQuery } from 'react-relay';
import BAIAdminResourceGroupSelect from './BAIAdminResourceGroupSelect';

const MyComponent = () => {
  const query = useLazyLoadQuery(
    graphql\`
      query MyComponentQuery {
        ...BAIAdminResourceGroupSelect_scalingGroupsV2Fragment
      }
    \`,
    {}
  );

  return (
    <BAIAdminResourceGroupSelect
      queryRef={query}
      placeholder="Select a resource group"
      onChange={(name) => console.log('Selected:', name)}
    />
  );
};
```
