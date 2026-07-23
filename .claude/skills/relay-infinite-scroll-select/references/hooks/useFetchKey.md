# useFetchKey Hook

## Overview

`useFetchKey` provides a mechanism for cache invalidation and refetching data in Relay queries. It returns a fetchKey that changes each time you call the update function, triggering a fresh network request.

## Purpose

Used in Pattern B (ID-based) components to:
- Invalidate Relay cache
- Force refetch of GraphQL queries
- Expose external refetch functionality via component ref

## API

```typescript
export const useFetchKey = () => {
  return [...useDateISOState(INITIAL_FETCH_KEY), INITIAL_FETCH_KEY] as const;
};

// Returns: [currentKey, updateKey, INITIAL_KEY]
// Type: readonly [string, (newValue?: string) => void, 'first']
```

## Usage

```typescript
const [fetchKey, updateFetchKey] = useFetchKey();

// Use in query options
useLazyLoadQuery(query, variables, {
  fetchPolicy: 'store-and-network',
  fetchKey: fetchKey, // ← Changes trigger refetch
});

// Trigger refetch
updateFetchKey(); // Generates new ISO timestamp
```

## Implementation

```typescript
export const INITIAL_FETCH_KEY = 'first';

export const useDateISOState = (initialValue?: string) => {
  'use memo';
  const [value, setValue] = useState(initialValue || new Date().toISOString());

  const update = useEventNotStable((newValue?: string) => {
    setValue(newValue || new Date().toISOString());
  });
  return [value, update] as const;
};

export const useUpdatableState = (initialValue: string) => {
  return useDateISOState(initialValue);
};

export const useFetchKey = () => {
  return [...useDateISOState(INITIAL_FETCH_KEY), INITIAL_FETCH_KEY] as const;
};
```

## Related: useDateISOState

Helper hook that maintains a timestamp state:

```typescript
const [timestamp, updateTimestamp] = useDateISOState('first');

// Update to current time
updateTimestamp(); // Sets to new Date().toISOString()

// Update to specific value
updateTimestamp('custom-value');
```

## Pattern B Integration

```typescript
const BAIVFolderSelect: React.FC<Props> = ({ ref, ...props }) => {
  const [fetchKey, updateFetchKey] = useFetchKey();
  const deferredFetchKey = useDeferredValue(fetchKey);

  // Use in queries
  useLazyLoadQuery(query, variables, {
    fetchPolicy: 'store-or-network',
    fetchKey: deferredFetchKey, // ← Deferred to prevent Suspense flicker
  });

  // Expose refetch via ref
  useImperativeHandle(
    ref,
    () => ({
      refetch: () => {
        startRefetchTransition(() => {
          updateFetchKey(); // ← Triggers refetch
        });
      },
    }),
    [updateFetchKey, startRefetchTransition],
  );
};
```

## Why useDeferredValue?

```typescript
const [fetchKey, updateFetchKey] = useFetchKey();
const deferredFetchKey = useDeferredValue(fetchKey);

// Use deferred value in queries
useLazyLoadQuery(query, variables, {
  fetchKey: deferredFetchKey, // ← Not direct fetchKey
});
```

**Reason**: Direct usage causes parent Suspense boundaries to show fallback UI during refetch. Deferring prevents this flicker.

## Example: External Refetch

```typescript
// Parent component
const MyComponent = () => {
  const selectRef = useRef<BAIVFolderSelectRef>(null);

  return (
    <>
      <BAIVFolderSelect ref={selectRef} />
      <Button onClick={() => selectRef.current?.refetch()}>
        Refresh
      </Button>
    </>
  );
};

// Child component (BAIVFolderSelect)
const BAIVFolderSelect = forwardRef<BAIVFolderSelectRef, Props>(
  (props, ref) => {
    const [fetchKey, updateFetchKey] = useFetchKey();

    useImperativeHandle(ref, () => ({
      refetch: () => {
        updateFetchKey(); // ← Parent can trigger this
      },
    }));

    return <BAISelect /* ... */ />;
  }
);
```

## Best Practices

1. **Always defer fetchKey**
   ```typescript
   const deferredFetchKey = useDeferredValue(fetchKey);
   ```

2. **Use with transitions for refetch**
   ```typescript
   startRefetchTransition(() => {
     updateFetchKey();
   });
   ```

3. **Combine with appropriate fetchPolicy**
   ```typescript
   useLazyLoadQuery(query, variables, {
     fetchPolicy: condition ? 'network-only' : 'store-only',
     fetchKey: deferredFetchKey,
   });
   ```

## When Not to Use

- **Pattern A (Name-based)**: Uses `refetch()` from `usePaginationFragment` instead
- **Cursor-based pagination**: Built-in refetch is usually sufficient
- **Read-only queries**: If no refetch needed, skip this hook
