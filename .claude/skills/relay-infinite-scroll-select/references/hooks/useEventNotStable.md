# useEventNotStable Hook

## Overview

`useEventNotStable` is a custom implementation of React's (experimental) `useEffectEvent` hook. It creates a stable callback reference that always calls the latest version of the handler without needing dependencies.

## Purpose

Used in **useLazyPaginatedQuery** to create a stable `loadNext` function that doesn't change reference but always calls the latest handler logic.

## API

```typescript
export function useEventNotStable<Args extends unknown[], Return>(
  handler: (...args: Args) => Return,
): (...args: Args) => Return
```

## Implementation

```typescript
import { useCallback, useLayoutEffect, useRef } from 'react';

export function useEventNotStable<Args extends unknown[], Return>(
  handler: (...args: Args) => Return,
) {
  const handlerRef = useRef<typeof handler>(handler);

  // In a real implementation, this would run before layout effects
  useLayoutEffect(() => {
    handlerRef.current = handler;
  });

  return useCallback((...args: Args) => {
    // In a real implementation, this would throw if called during render
    const fn = handlerRef.current;
    return fn(...args);
  }, []);
}
```

## How It Works

1. **Store latest handler in ref**
   ```typescript
   const handlerRef = useRef<typeof handler>(handler);

   useLayoutEffect(() => {
     handlerRef.current = handler; // Update to latest
   });
   ```

2. **Return stable callback**
   ```typescript
   return useCallback((...args: Args) => {
     const fn = handlerRef.current; // Always get latest
     return fn(...args);
   }, []); // Empty deps = never changes
   ```

## Why useEventNotStable?

### Problem: Unstable Callbacks

```typescript
// ❌ Bad: New function on every render
const loadNext = () => {
  if (isLoadingNext || !hasNext) return;
  previousResult.current = data || [];
  startLoadingNextTransition(() => {
    setOffset(offset + limit);
  });
};

// BAISelect gets new loadNext every render → potential issues
<BAISelect endReached={loadNext} />
```

### Solution: Stable Reference

```typescript
// ✅ Good: Stable reference, latest logic
const loadNext = useEventNotStable(() => {
  if (isLoadingNext || !hasNext) return;
  previousResult.current = data || [];
  startLoadingNextTransition(() => {
    setOffset(offset + limit);
  });
});

// BAISelect always gets same loadNext reference
<BAISelect endReached={loadNext} />
```

## Usage in useLazyPaginatedQuery

```typescript
const loadNext = useEventNotStable(() => {
  if (isLoadingNext || !hasNext) return;
  previousResult.current = data || [];
  startLoadingNextTransition(() => {
    const nextOffset = offset + limit;
    setOffset(nextOffset);
  });
});

return {
  paginationData: data,
  result,
  loadNext, // ← Stable reference
  hasNext,
  isLoadingNext,
};
```

**Benefits:**
- `loadNext` reference never changes
- Always accesses latest `offset`, `limit`, `hasNext`, `isLoadingNext`
- No dependency array needed
- Prevents unnecessary re-renders in child components

## Comparison with useCallback

| Feature | useEventNotStable | useCallback |
|---------|------------------|-------------|
| **Reference Stability** | Always stable | Depends on deps |
| **Latest Values** | Always latest | Must be in deps |
| **Dependency Array** | Not needed | Required |
| **React Version** | Works now | Standard |
| **Use Case** | Event handlers, callbacks | General memoization |

## Example: Without vs With

### Without useEventNotStable

```typescript
// ❌ Problem: loadNext changes on every state change
const loadNext = useCallback(() => {
  if (isLoadingNext || !hasNext) return;
  previousResult.current = data || [];
  startLoadingNextTransition(() => {
    setOffset(offset + limit);
  });
}, [isLoadingNext, hasNext, data, offset, limit]); // Many deps!

// Causes BAISelect to re-evaluate endReached frequently
<BAISelect endReached={loadNext} />
```

### With useEventNotStable

```typescript
// ✅ Solution: Stable reference, latest values
const loadNext = useEventNotStable(() => {
  if (isLoadingNext || !hasNext) return;
  previousResult.current = data || [];
  startLoadingNextTransition(() => {
    setOffset(offset + limit);
  });
}); // No deps needed

// BAISelect only evaluates endReached when actually called
<BAISelect endReached={loadNext} />
```

## Best Practices

1. **Use for event handlers passed as props**
   ```typescript
   const handleClick = useEventNotStable(() => {
     // Access latest state without deps
     doSomething(latestState);
   });

   <Component onClick={handleClick} />
   ```

2. **Use in custom hooks for stable API**
   ```typescript
   export const useCustomHook = () => {
     const stableCallback = useEventNotStable(() => {
       // Latest logic
     });

     return { stableCallback };
   };
   ```

3. **Do NOT use for dependencies in useEffect**
   ```typescript
   // ❌ Bad: Won't trigger effect when logic changes
   useEffect(() => {
     stableCallback();
   }, [stableCallback]); // Never changes

   // ✅ Good: Use direct values instead
   useEffect(() => {
     doSomething(value);
   }, [value]);
   ```

## When to Use

✅ **Good Use Cases:**
- Event handlers passed to child components
- Callbacks in custom hooks
- Functions that need latest closure values
- Pagination callbacks like `loadNext`

❌ **Don't Use For:**
- useEffect dependencies
- useMemo dependencies
- useCallback dependencies
- Anything that should trigger re-computation

## Related: React's useEffectEvent

This hook is inspired by React's experimental `useEffectEvent`. When `useEffectEvent` becomes stable in React, consider migrating to the official API.

**Future Migration:**
```typescript
// Current
const loadNext = useEventNotStable(() => {
  // logic
});

// Future (when stable)
const loadNext = useEffectEvent(() => {
  // logic
});
```

## Note

From the implementation comment:
> "In a real implementation, this would throw if called during render"

This is a simplified version. React's official `useEffectEvent` would throw an error if called during the render phase, enforcing that it's only used for event handlers.
