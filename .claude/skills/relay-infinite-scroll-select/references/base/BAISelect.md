# BAISelect - Base Component API

## Overview

`BAISelect` is an enhanced Ant Design Select component with additional features for infinite scrolling, async search, and custom footer content. All Relay-based select components should extend this base component.

## Key Features

- **Infinite Scroll**: `endReached` prop triggers when scrolling reaches bottom
- **Async Search**: `searchAction` prop for asynchronous search with transition
- **Custom Footer**: Display total count or custom content at bottom of dropdown
- **Scroll Detection**: Track scroll position with `atBottomStateChange`
- **Ghost Mode**: Transparent styling for overlay contexts
- **Auto Select**: Automatically select first option

## Props Interface

```typescript
export interface BAISelectProps<
  ValueType = any,
  OptionType extends BaseOptionType | DefaultOptionType = DefaultOptionType,
> extends SelectProps<ValueType, OptionType> {
  ref?: React.RefObject<GetRef<typeof Select<ValueType, OptionType>> | null>;
  ghost?: boolean;
  autoSelectOption?:
    | boolean
    | ((options: SelectProps<ValueType, OptionType>['options']) => ValueType);
  tooltip?: string;
  atBottomThreshold?: number;
  atBottomStateChange?: (atBottom: boolean) => void;
  bottomLoading?: boolean;
  footer?: React.ReactNode;
  endReached?: () => void;
  searchAction?: (value: string) => Promise<void>;
}
```

## Important Props

### `endReached: () => void`

Called when user scrolls to bottom of dropdown. Use this for infinite scroll pagination.

**Example:**
```typescript
<BAISelect
  endReached={() => {
    if (hasNext) {
      loadNext(10); // Load next 10 items
    }
  }}
/>
```

### `searchAction: (value: string) => Promise<void>`

Async search handler integrated with React transitions. Automatically shows loading state.

**Example:**
```typescript
<BAISelect
  searchAction={async (value) => {
    selectRef.current?.scrollTo(0); // Reset scroll
    refetch({
      filter: value ? { name: { contains: value } } : null,
    });
  }}
/>
```

**Important:**
- Wrapped in `useTransition()` automatically
- Loading state managed internally
- Always scroll to top on search for better UX

### `footer: React.ReactNode`

Display content at bottom of dropdown, typically for showing total count.

**Example:**
```typescript
<BAISelect
  footer={
    _.isNumber(totalCount) && totalCount > 0 ? (
      <TotalFooter loading={isLoadingNext} total={totalCount} />
    ) : undefined
  }
/>
```

**Layout:**
- Divider automatically added above footer
- Right-aligned by default
- Padding handled automatically

### `atBottomThreshold: number` (default: 30)

Pixel threshold for detecting bottom scroll. Lower value = more precise, higher value = triggers earlier.

### `atBottomStateChange: (atBottom: boolean) => void`

Callback when scroll position reaches/leaves bottom threshold.

### `ghost: boolean`

Transparent styling for use in overlay/floating contexts.

### `autoSelectOption: boolean | ((options) => value)`

Automatically select first option when options load.

**Example:**
```typescript
// Auto-select first option
<BAISelect autoSelectOption={true} />

// Custom selection logic
<BAISelect
  autoSelectOption={(options) => options.find(opt => opt.default)?.value}
/>
```

### `tooltip: string`

Tooltip text for the select component.

## Implementation

```typescript
import BAIFlex from './BAIFlex';
import { Divider, Select, SelectProps, theme, Tooltip, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { BaseOptionType, DefaultOptionType } from 'antd/es/select';
import { GetRef } from 'antd/lib';
import classNames from 'classnames';
import _ from 'lodash';
import React, { useLayoutEffect, useRef, useTransition } from 'react';

const useStyles = createStyles(({ css, token }) => ({
  ghostSelect: css\`
    &.ant-select {
      background-color: transparent;
      border-color: \${token.colorBgBase} !important;
      color: \${token.colorBgBase};

      &:hover {
        background-color: rgb(255 255 255 / 10%);
      }

      &:active {
        background-color: rgb(255 255 255 / 10%);
      }

      .ant-select-suffix {
        color: \${token.colorBgBase};
      }

      &:hover .ant-select-suffix {
        color: \${token.colorBgBase};
      }

      &:active .ant-select-suffix {
        color: \${token.colorBgBase};
      }
    }
  \`,
  customStyle: css\`
    /* Change the opacity of images and tags when dropdown is open */
    &.ant-select-open .ant-select-content .ant-select-content-value img,
    &.ant-select-open
      .ant-select-content
      .ant-select-content-value
      span.ant-tag {
      opacity: 0.5;
    }

    /* Change color of secondary/success/warning/danger text to placeholder when open */
    &.ant-select-open
      .ant-select-content
      .ant-select-content-value
      .ant-typography-secondary,
    &.ant-select-open
      .ant-select-content
      .ant-select-content-value
      .ant-typography-success,
    &.ant-select-open
      .ant-select-content
      .ant-select-content-value
      .ant-typography-warning,
    &.ant-select-open
      .ant-select-content
      .ant-select-content-value
      .ant-typography-danger {
      color: \${token.colorTextPlaceholder};
    }
  \`,
}));

function BAISelect<
  ValueType = any,
  OptionType extends BaseOptionType | DefaultOptionType = DefaultOptionType,
>({
  ref,
  autoSelectOption,
  ghost,
  tooltip = '',
  atBottomThreshold = 30,
  atBottomStateChange,
  footer,
  endReached,
  searchAction,
  ...selectProps
}: BAISelectProps<ValueType, OptionType>): React.ReactElement {
  const { value, options, onChange } = selectProps;
  const { styles } = useStyles();
  const lastScrollTop = useRef<number>(0);
  const isAtBottom = useRef<boolean>(false);
  const { token } = theme.useToken();
  const [isPending, startTransition] = useTransition();

  useLayoutEffect(() => {
    if (autoSelectOption && _.isEmpty(value) && options?.[0]) {
      if (_.isBoolean(autoSelectOption)) {
        onChange?.(options?.[0].value || options?.[0], options?.[0]);
      } else if (_.isFunction(autoSelectOption)) {
        onChange?.(autoSelectOption(options), options?.[0]);
      }
    }
  }, [value, options, onChange, autoSelectOption]);

  // Function to check if scroll has reached bottom
  const handlePopupScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!atBottomStateChange && !endReached) return;

    const target = e.target as HTMLElement;
    const scrollTop = target.scrollTop;
    lastScrollTop.current = scrollTop;

    const isAtBottomNow =
      target.scrollHeight - scrollTop - target.clientHeight <=
      atBottomThreshold;

    // Only notify when state changes
    if (isAtBottomNow !== isAtBottom.current) {
      isAtBottom.current = isAtBottomNow;
      atBottomStateChange?.(isAtBottomNow);

      if (isAtBottomNow) {
        endReached?.(); // Call endReached when at bottom
      }
    }
  };

  return (
    <Tooltip title={tooltip}>
      <Select<ValueType, OptionType>
        {...selectProps}
        loading={isPending || selectProps.loading}
        showSearch={
          selectProps.showSearch && _.isObject(selectProps.showSearch)
            ? {
                ...selectProps.showSearch,
                onSearch: async (value) => {
                  _.get(selectProps.showSearch, 'onSearch')?.(value);
                  startTransition(async () => {
                    await searchAction?.(value);
                  });
                },
              }
            : false
        }
        ref={ref}
        className={classNames(
          selectProps.className,
          styles.customStyle,
          ghost && styles.ghostSelect,
        )}
        onPopupScroll={(e) => {
          if (atBottomStateChange || endReached) handlePopupScroll(e);
          selectProps.onPopupScroll?.(e);
        }}
        popupRender={
          footer
            ? (menu) => {
                return (
                  <BAIFlex direction="column" align="stretch">
                    {menu}
                    <Divider
                      style={{
                        margin: 0,
                        marginBottom: token.paddingXS,
                      }}
                    />
                    <BAIFlex
                      direction="column"
                      align="end"
                      gap={'xs'}
                      style={{
                        paddingBottom: token.paddingXXS,
                        paddingInline: token.paddingSM,
                      }}
                    >
                      {_.isString(footer) ? (
                        <Typography.Text type="secondary">
                          {footer}
                        </Typography.Text>
                      ) : (
                        footer
                      )}
                    </BAIFlex>
                  </BAIFlex>
                );
              }
            : undefined
        }
      />
    </Tooltip>
  );
}

export default BAISelect;
```

## Key Implementation Details

### 1. Transition-Based Search

```typescript
const [isPending, startTransition] = useTransition();

showSearch={
  selectProps.showSearch && _.isObject(selectProps.showSearch)
    ? {
        ...selectProps.showSearch,
        onSearch: async (value) => {
          _.get(selectProps.showSearch, 'onSearch')?.(value);
          startTransition(async () => {
            await searchAction?.(value);
          });
        },
      }
    : false
}

loading={isPending || selectProps.loading}
```

- Wraps `searchAction` in `useTransition()`
- Automatically shows loading state during search
- Non-blocking UI updates

### 2. Scroll Detection Logic

```typescript
const handlePopupScroll = (e: React.UIEvent<HTMLDivElement>) => {
  if (!atBottomStateChange && !endReached) return;

  const target = e.target as HTMLElement;
  const scrollTop = target.scrollTop;

  const isAtBottomNow =
    target.scrollHeight - scrollTop - target.clientHeight <=
    atBottomThreshold;

  // Only notify when state changes
  if (isAtBottomNow !== isAtBottom.current) {
    isAtBottom.current = isAtBottomNow;
    atBottomStateChange?.(isAtBottomNow);

    if (isAtBottomNow) {
      endReached?.(); // Trigger pagination
    }
  }
};
```

- Check if scroll is within threshold of bottom
- Only trigger once per crossing
- Prevent duplicate calls

### 3. Custom Footer Rendering

```typescript
popupRender={
  footer
    ? (menu) => {
        return (
          <BAIFlex direction="column" align="stretch">
            {menu}
            <Divider
              style={{
                margin: 0,
                marginBottom: token.paddingXS,
              }}
            />
            <BAIFlex
              direction="column"
              align="end"
              gap={'xs'}
              style={{
                paddingBottom: token.paddingXXS,
                paddingInline: token.paddingSM,
              }}
            >
              {_.isString(footer) ? (
                <Typography.Text type="secondary">
                  {footer}
                </Typography.Text>
              ) : (
                footer
              )}
            </BAIFlex>
          </BAIFlex>
        );
      }
    : undefined
}
```

- Divider above footer
- Right-aligned content
- Support both string and ReactNode

### 4. Auto-Select Logic

```typescript
useLayoutEffect(() => {
  if (autoSelectOption && _.isEmpty(value) && options?.[0]) {
    if (_.isBoolean(autoSelectOption)) {
      onChange?.(options?.[0].value || options?.[0], options?.[0]);
    } else if (_.isFunction(autoSelectOption)) {
      onChange?.(autoSelectOption(options), options?.[0]);
    }
  }
}, [value, options, onChange, autoSelectOption]);
```

- Runs on options load
- Only when value is empty
- Support boolean or function

## Usage Patterns

### Pattern A (usePaginationFragment)

```typescript
<BAISelect
  ref={selectRef}
  options={selectOptions}
  searchAction={async (value) => {
    selectRef.current?.scrollTo(0);
    refetch({ filter: value ? { name: { contains: value } } : null });
  }}
  endReached={() => {
    hasNext && loadNext(10);
  }}
  footer={
    count > 0 ? (
      <TotalFooter loading={isLoadingNext} total={count} />
    ) : undefined
  }
/>
```

### Pattern B (useLazyLoadQuery + useLazyPaginatedQuery)

```typescript
<BAISelect
  ref={selectRef}
  options={availableOptions}
  searchAction={async (value) => {
    setSearchStr(value);
  }}
  endReached={() => {
    loadNext();
  }}
  labelInValue
  value={optimisticValueWithLabel}
  onChange={(value, option) => {
    // Handle change with label preservation
  }}
  footer={
    count > 0 ? (
      <TotalFooter loading={isLoadingNext} total={count} />
    ) : undefined
  }
/>
```

## Best Practices

1. **Always scroll to top on search**
   ```typescript
   searchAction={async (value) => {
     selectRef.current?.scrollTo(0); // ← Important!
     // ... handle search
   }}
   ```

2. **Check hasNext before loadNext**
   ```typescript
   endReached={() => {
     hasNext && loadNext(10); // ← Check hasNext
   }}
   ```

3. **Use Skeleton for initial load**
   ```typescript
   notFoundContent={
     _.isUndefined(data) ? (
       <Skeleton.Input active size="small" block />
     ) : undefined
   }
   ```

4. **Conditional footer rendering**
   ```typescript
   footer={
     _.isNumber(count) && count > 0 ? (
       <TotalFooter loading={isLoadingNext} total={count} />
     ) : undefined
   }
   ```

## Common Issues

### Issue 1: Search doesn't reset scroll

**Problem:** User searches but sees empty results because scroll is still at bottom.

**Solution:**
```typescript
searchAction={async (value) => {
  selectRef.current?.scrollTo(0); // ← Add this
  // ... rest of search logic
}}
```

### Issue 2: Multiple endReached calls

**Problem:** `endReached` called multiple times when scrolling at bottom.

**Solution:** Already handled internally - only triggers on state change.

### Issue 3: Loading state not showing during search

**Problem:** Search feels unresponsive.

**Solution:** Use `searchAction` prop instead of `showSearch.onSearch` - it's wrapped in transition automatically.
