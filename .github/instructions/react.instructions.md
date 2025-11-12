---
applyTo: "react/**/*.tsx,react/**/*.ts"
---

# React Component Guidelines for Backend.AI WebUI

These instructions apply to React components in the `/react` directory.

## React Compiler Optimization

### 'use memo' Directive (Recommended)
- **Prefer using the `'use memo'` directive** at the top of new component files
- React Compiler automatically optimizes memoization when this directive is present
- This is the modern, recommended approach over manual optimization

```typescript
'use memo';

import React from 'react';

const MyComponent: React.FC<Props> = ({ data }) => {
  // Component logic - React Compiler handles optimization
  return <div>{data}</div>;
};
```

### Manual Optimization Hooks (Use Sparingly)
- `useMemo` and `useCallback` can still be used when needed
- However, prefer `'use memo'` directive as React Compiler handles most cases automatically
- Only use manual hooks when you have specific performance bottlenecks identified through profiling
- Do NOT suggest adding `useMemo`/`useCallback` unnecessarily in code reviews

## React Composability

### Component Composition Principles
Always consider React composability when writing or reviewing components:

1. **Single Responsibility**
   - Each component should do one thing well
   - Extract complex logic into smaller, focused components

2. **Composition Over Props Drilling**
   - Use component composition instead of passing props through multiple levels
   - Consider using Recoil for global state management
   - Leverage children props and render props patterns

3. **Reusability**
   - Design components to be reusable across different contexts
   - Use generic prop types when appropriate
   - Avoid hard-coding values that could be props

4. **Custom Hooks for Logic Reuse**
   - Extract shared stateful logic into custom hooks
   - Keep components focused on presentation
   - Share business logic through hooks, not HOCs

### Good Composition Examples

```typescript
// ❌ Bad: Props drilling
<Parent>
  <Child theme={theme} user={user} config={config} />
</Parent>

// ✅ Good: Composition with Recoil
const themeState = atom({
  key: 'theme',
  default: 'light',
});

const Child = () => {
  const theme = useRecoilValue(themeState);
  // ...
};

// ✅ Good: Extracting reusable logic
const useUserData = () => {
  // Shared logic
};

const ComponentA = () => {
  const userData = useUserData();
  // ...
};
```

## GraphQL/Relay Integration

### Commonly Used Hooks
We primarily use these Relay hooks:
- **`useLazyLoadQuery`** - Fetch data on component mount
- **`useFragment`** - Read fragment data from parent query
- **`useRefetchableFragment`** - Fragment with refetch capability

```typescript
import { graphql, useLazyLoadQuery, useFragment, useRefetchableFragment } from 'react-relay';

// Lazy load query
const MyComponent = () => {
  const data = useLazyLoadQuery(
    graphql`
      query MyComponentQuery {
        user {
          id
          ...UserProfile_user
        }
      }
    `,
    {},
  );
  return <UserProfile userRef={data.user} />;
};

// Fragment usage
const UserProfile: React.FC<{ userRef: UserProfile_user$key }> = ({ userRef }) => {
  const data = useFragment(
    graphql`
      fragment UserProfile_user on User {
        id
        name
        email
      }
    `,
    userRef,
  );
  return <div>{data.name}</div>;
};

// Refetchable fragment
const UserList = ({ usersRef }) => {
  const [data, refetch] = useRefetchableFragment(
    graphql`
      fragment UserList_users on Query
      @refetchable(queryName: "UserListRefetchQuery") {
        users {
          id
          name
        }
      }
    `,
    usersRef,
  );

  return (
    <div>
      {data.users.map(user => <div key={user.id}>{user.name}</div>)}
      <button onClick={() => refetch({})}>Refresh</button>
    </div>
  );
};
```

### Modern Relay Patterns (Recommended)
If applicable, consider these newer patterns:
- **`@required` directive** - Type-safe null handling in fragments
- **`@alias` directive** - Rename fields for better semantics
- **Suspense boundaries** - Better loading state handling with concurrent features

### Fragment Colocation
- Colocate GraphQL fragments with components that use them
- Use Relay's fragment composition for nested data requirements

### Query Optimization
- Avoid over-fetching data - only request fields you need
- Use Relay's pagination for lists (`usePaginationFragment`)
- Consider using `@defer` and `@stream` for progressive loading

## Backend.AI UI Component Library

### Prefer BAI Components
- **Always prefer `backend.ai-ui` package components** over Ant Design equivalents
- Use `BAIFlex`, `BAIModal`, `BAIButton`, etc. instead of Ant Design components
- These components are custom-designed for Backend.AI WebUI

```typescript
// ✅ Good: Use BAI components
import { BAIModal, BAIFlex } from '@backend.ai/backend.ai-ui';

<BAIModal open={open} onOk={handleOk}>
  <BAIFlex direction="column" gap="md">
    {content}
  </BAIFlex>
</BAIModal>
```

### When to Use Ant Design
- Simple confirmation modals using App context
- When BAI component equivalent doesn't exist
- Temporary solutions while waiting for BAI component development

```typescript
// ✅ Good: Use App.useModal() for simple confirmations
import { App } from 'antd';

const MyComponent = () => {
  const { modal } = App.useApp();

  const handleDelete = () => {
    modal.confirm({
      title: 'Are you sure?',
      content: 'This action cannot be undone.',
      onOk: () => {
        // handle deletion
      },
    });
  };

  return <button onClick={handleDelete}>Delete</button>;
};
```

## Custom Utilities and Hooks

### useFetchKey Hook
- Check if `useFetchKey` is needed for data fetching patterns
- This hook manages fetch keys for cache invalidation
- Verify it's being used when component needs to refetch data

```typescript
import { useFetchKey } from './hooks/useFetchKey';

const MyComponent = () => {
  const [fetchKey, setFetchKey] = useFetchKey();

  // Use fetchKey in queries to trigger refetch
  const { data } = useQuery({
    queryKey: ['data', fetchKey],
    // ...
  });
};
```

### BAIUnmountAfterClose
- Check if `BAIUnmountAfterClose` is being used for modals/drawers with forms
- This component ensures proper cleanup of form state when modal closes
- Prevents stale data issues in modals

```typescript
import { BAIUnmountAfterClose } from './components';

<BAIModal open={open}>
  <BAIUnmountAfterClose open={open}>
    <FormComponent />
  </BAIUnmountAfterClose>
</BAIModal>
```

### Code Review Checklist for Custom Utils
When reviewing code, verify:
- [ ] `useFetchKey` is used when data needs manual refetching
- [ ] `BAIUnmountAfterClose` wraps modal/drawer content with forms
- [ ] Custom hooks are properly utilized where they provide value

## Error Handling

### Error Boundaries
- **Always use pre-defined error boundary components**
- `ErrorBoundaryWithNullFallback` - for silent error handling
- `BAIErrorBoundary` - for user-facing error UI
- Do NOT create new error boundary components without discussion

```typescript
// ✅ Good: Use existing error boundaries
import { ErrorBoundaryWithNullFallback, BAIErrorBoundary } from './components';

<BAIErrorBoundary>
  <FeatureComponent />
</BAIErrorBoundary>

// For silent failures
<ErrorBoundaryWithNullFallback>
  <OptionalComponent />
</ErrorBoundaryWithNullFallback>
```

### Loading States
- Always handle loading states in async operations
- Use Suspense boundaries where appropriate
- Provide skeleton loaders for better UX

## Ant Design (Secondary Usage)

### When BAI Components Are Not Available
- Use Ant Design components when no BAI equivalent exists
- Prefer using App context (`App.useApp()`) for modals, messages, notifications
- Access theme tokens via `theme.useToken()`
- **Only use `antd-style`** for creating styled components when styling cannot be achieved with Ant Design tokens alone

```typescript
import { theme, App } from 'antd';

const MyComponent = () => {
  const { token } = theme.useToken();
  const { message } = App.useApp();

  const handleSuccess = () => {
    message.success('Operation completed');
  };

  // Use token for styling
  return (
    <div style={{
      padding: token.padding,
      background: token.colorBgContainer
    }}>
      {/* content */}
    </div>
  );
};
```

### Theme Awareness
- Components should work in both light and dark themes
- Use theme tokens instead of hard-coded colors
- Test components in both theme modes

## TypeScript Best Practices

### Type Safety
- Always define prop interfaces
- Extend BAI/Ant Design's prop types when wrapping components
- Use discriminated unions for variant props

```typescript
// ✅ Good: Proper prop typing
interface MyComponentProps extends BAIModalProps {
  customProp: string;
  variant: 'primary' | 'secondary';
}

// ✅ Good: Discriminated unions
type Status =
  | { type: 'loading' }
  | { type: 'success'; data: Data }
  | { type: 'error'; error: Error };
```

### Generic Components
- Use generics for reusable components with different data types
- Properly constrain generic types

```typescript
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}

const List = <T,>({ items, renderItem }: ListProps<T>) => {
  return <>{items.map(renderItem)}</>;
};
```

## Internationalization (i18n)

- Always use i18n functions for user-facing text
- Refer to `/i18n-translation-instruction.md` for translation guidelines
- Never hard-code UI strings in English or other languages
- Use appropriate context for translations

## State Management

### Local State
- Use `useState` for component-local state
- Use `useReducer` for complex state logic

### Global State
- Use **Recoil** for global state management
- Use Relay for GraphQL-backed state
- Use React Context for simple UI state that doesn't need persistence

```typescript
// ✅ Good: Recoil for global state
import { atom, useRecoilState } from 'recoil';

const userSettingsState = atom({
  key: 'userSettings',
  default: {},
});

const Component = () => {
  const [settings, setSettings] = useRecoilState(userSettingsState);
  // ...
};
```

## Testing

### Component Tests
- Write tests for complex component logic
- Test user interactions, not implementation details
- Use React Testing Library conventions

### Accessibility in Tests
- Query by accessible roles and labels
- Ensure keyboard navigation works
- Test with screen reader expectations

## Performance

### Code Splitting
- Lazy load heavy components with `React.lazy()`
- Split routes at page boundaries
- Monitor bundle sizes

### Rendering Optimization
- Prefer `'use memo'` directive for new components
- Use `React.memo()` for expensive pure components only when profiling shows benefit
- Avoid premature optimization

## Code Review Checklist

When reviewing React code, check for:
- [ ] Component uses `'use memo'` directive if it's a new component
- [ ] Component follows composability principles (no props drilling, proper extraction)
- [ ] No unnecessary `useMemo`/`useCallback` (prefer 'use memo' directive)
- [ ] **BAI components are used instead of Ant Design equivalents**
- [ ] Ant Design modals use `App.useApp()` context instead of direct Modal import
- [ ] Relay hooks (`useLazyLoadQuery`, `useFragment`, `useRefetchableFragment`) are used correctly
- [ ] `useFetchKey` is used where data refetching is needed
- [ ] `BAIUnmountAfterClose` wraps modal/drawer forms
- [ ] Pre-defined error boundaries (`ErrorBoundaryWithNullFallback`, `BAIErrorBoundary`) are used
- [ ] GraphQL fragments are properly colocated
- [ ] TypeScript types are properly defined
- [ ] i18n is used for all user-facing text
- [ ] Recoil is used for global state when appropriate
- [ ] Error states and loading states are handled
- [ ] Component is accessible (ARIA, keyboard navigation)
- [ ] No security vulnerabilities (XSS, injection risks)
