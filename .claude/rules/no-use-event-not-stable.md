# No `useEventNotStable` — Use `useEffectEvent` or `useCallback` Instead

Do not use the project's custom `useEventNotStable` hook. Choose the correct replacement based on context:

- **Inside effects**: Use React 19.2's `useEffectEvent`
- **Returned from hooks / passed to JSX**: Use `useCallback` (with functional state updates to avoid stale closures)

## Why

`useEventNotStable` was a polyfill for stable-identity callbacks before React 19.2. Now that `useEffectEvent` is a stable API, and the project uses React Compiler with `'use memo'`, the custom hook is redundant.

**Important**: `useEffectEvent` callbacks can only be called from effects — React enforces this at lint time. If the callback is returned from a hook or passed as an event handler, use `useCallback` instead. Combine with functional state updates (`setState(prev => ...)`) to avoid stale closure issues.

## Rules

1. Do not introduce new `useEventNotStable` usage.
2. When editing a file that uses `useEventNotStable`, migrate it in the same change.
3. For effect-internal callbacks: use `useEffectEvent`.
4. For callbacks returned from hooks or passed to JSX: use `useCallback` + functional updates.

## Patterns

```tsx
// ❌ Deprecated custom hook
import { useEventNotStable } from 'backend.ai-ui';
const handler = useEventNotStable(() => doSomething(latestProp));

// ✅ Inside an effect
import { useEffectEvent } from 'react';
const onResolved = useEffectEvent(() => doSomething(latestProp));
useEffect(() => { onResolved(); }, [data]);

// ✅ Returned from a hook (cannot use useEffectEvent)
import { useCallback } from 'react';
const remove = useCallback((id: string) => {
  setState((prev) => prev.filter((item) => item.id !== id));
}, [setState]);
```
