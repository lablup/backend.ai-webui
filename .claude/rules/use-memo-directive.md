---
description: When writing or editing React components or custom hooks
paths:
  - "react/**/*.{tsx,ts}"
  - "packages/backend.ai-ui/**/*.{tsx,ts}"
---

# 'use memo' Directive Rule

Always place `'use memo'` at the very top of the function body for **both React components and custom hooks** (`use*` functions).

## Why

This project uses the React Compiler in annotation mode (`babel-plugin-react-compiler`). The `'use memo'` directive opts the function in to full compiler optimization — automatic memoization of values, callbacks, and JSX without manual `useMemo`/`useCallback`. Omitting it from hooks means the hook's internals are not optimized, even if the components consuming it are.

## Pattern

```tsx
// ✅ Component — always add 'use memo'
function MyComponent({ id }: Props) {
  'use memo';

  return <div>{id}</div>;
}

// ✅ Custom hook — always add 'use memo'
const useMyData = (id: string) => {
  'use memo';

  return useQuery(id);
};

// ❌ Missing in hook — not optimized
const useMyData = (id: string) => {
  return useQuery(id);
};
```

## Rules

1. Add `'use memo'` as the **first statement** in the function body — before any hooks, variables, or logic.
2. Apply to **both components and custom hooks** (`use*` naming convention).
3. Comments before the directive are allowed.
4. Use single or double quotes — **not backticks**.
5. **Never remove** an existing `'use memo'` directive.
6. Do not add `'use memo'` inside helper functions that are not components or hooks (plain utilities, event handlers, etc.).
