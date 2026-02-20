---
applyTo: "react/**/*.tsx,react/**/*.ts"
---

# React Component Guidelines for Backend.AI WebUI

These instructions apply to React components in the `/react` directory.

## React Compiler Optimization

### 'use memo' Directive (Recommended)

- This project uses the new **React Compiler**.
- We actively use React directives such as `use memo` and `use client` at the top components (NOT files).
- `use memo` is **intentional and valid** in this codebase.
- Even if tooling or TypeScript/ESLint shows something like:
  - `Unknown directive: 'use memo'.`
  - or similar warnings/errors
    these directives are still **correct and should not be removed or changed**.

### What should do

- When generating or editing React components:
  - Prefer adding `use memo` when it is beneficial for React Compiler.
  - **Never** remove existing `use memo` directives.
  - **Never** “fix” or “rename” `use memo` to something else.
  - **Never** add comments suggesting that `use memo` is unknown, invalid, or deprecated.

### Placement Rules for 'use memo'

The `'use memo'` directive has **strict placement requirements**:

- **Must be at the very beginning of a function body**, before any other code
- Comments before the directive are allowed
- Must use double or single quotes: `"use memo"` or `'use memo'` (**not backticks**)
- Cannot be placed conditionally or later in the function
- Only the first directive is processed; additional directives are ignored

```typescript
// ✅ Good: 'use memo' at the very beginning of function body
function MyComponent({ data }: Props) {
  'use memo';

  const [state, setState] = useState(0);
  // Component logic - React Compiler handles optimization
  return <div>{data}</div>;
}

// ✅ Good: Comments before 'use memo' are OK
const AnotherComponent: React.FC<Props> = ({ data }) => {
  // This component is optimized by React Compiler
  'use memo';

  return <div>{data}</div>;
};

// ❌ Bad: 'use memo' after other statements
function BadComponent({ data }: Props) {
  const value = 'test'; // ❌ Code before directive
  'use memo';
  return <div>{data}</div>;
}

// ❌ Bad: 'use memo' in conditional
function ConditionalBad({ data }: Props) {
  if (condition) {
    'use memo'; // ❌ Cannot be conditional
  }
  return <div>{data}</div>;
}

// ❌ Bad: Using backticks
function BacktickBad({ data }: Props) {
  `use memo`; // ❌ Must use quotes, not backticks
  return <div>{data}</div>;
}
```

### Manual Optimization Hooks (Use Sparingly)

- `useMemo` and `useCallback` can still be used when needed
- However, prefer `'use memo'` directive as React Compiler handles most cases automatically
- Only use manual hooks when you have specific performance bottlenecks identified through profiling
- Do NOT suggest adding `useMemo`/`useCallback` unnecessarily in code reviews

### useEffectEvent Hook (Recommended)

`useEffectEvent` extracts non-reactive logic from Effects, allowing access to latest props/state without making them dependencies.

**When to Use:**

- Access current values in Effects without triggering re-runs
- Separate what triggers the Effect from what it does
- Event handlers, logging, or analytics inside Effects

**Example:**

```typescript
const onConnected = useEffectEvent(() => {
  showNotification("Connected!", theme); // Latest theme, not reactive
});

useEffect(() => {
  const connection = createConnection(url);
  connection.on("connected", onConnected);
  return () => connection.disconnect();
}, [url]); // Only url triggers re-connection
```

**Restrictions:**

- Only call inside `useEffect`/`useLayoutEffect`/`useInsertionEffect`
- Never use to bypass legitimate dependencies
- Only for truly non-reactive logic (logging, analytics, non-triggering side effects)

**Benefits Over useCallback:**

```typescript
// ❌ Old: Re-subscribes on every change
const handler = useCallback(() => doSomething(a, b, c), [a, b, c]);

// ✅ New: Subscribe once, always latest values
const handler = useEffectEvent(() => doSomething(a, b, c));
useEffect(() => {
  subscribe(handler);
}, []);
```

## Rules of Hooks

All React Hooks (useState, useEffect, useContext, useMemo, useCallback, useLazyLoadQuery, etc.) must follow these fundamental rules:

### Rule 1: Only Call Hooks at the Top Level

**Don't call Hooks inside loops, conditions, nested functions, or try/catch/finally blocks.**

Always use Hooks at the top level of your React function, before any early returns.

**Why this matters:** React relies on the order in which Hooks are called to maintain state correctly between re-renders. Calling Hooks conditionally breaks this order.

```typescript
// ✅ Good: Hooks at the top level
function MyComponent({ condition }: Props) {
  const [count, setCount] = useState(0);
  const theme = useContext(ThemeContext);
  const data = useLazyLoadQuery(query, {});

  if (condition) {
    return <div>Condition met</div>;
  }

  return <div>{count}</div>;
}

// ❌ Bad: Hook inside a condition
function BadComponent({ condition }: Props) {
  if (condition) {
    const [count, setCount] = useState(0); // ❌ Conditional Hook call
  }
  return <div>Content</div>;
}

// ❌ Bad: Hook inside a loop
function BadLoop({ items }: Props) {
  const results = [];
  for (let i = 0; i < items.length; i++) {
    const data = useQuery(items[i]); // ❌ Hook in loop
    results.push(data);
  }
  return <div>{results}</div>;
}

// ❌ Bad: Hook after early return
function BadEarlyReturn({ condition }: Props) {
  if (condition) {
    return <div>Early return</div>;
  }

  const [count, setCount] = useState(0); // ❌ After conditional return
  return <div>{count}</div>;
}

// ❌ Bad: Hook in event handler
function BadEventHandler() {
  function handleClick() {
    const theme = useContext(ThemeContext); // ❌ Hook in event handler
  }
  return <button onClick={handleClick}>Click</button>;
}

// ❌ Bad: Hook in try/catch block
function BadTryCatch() {
  try {
    const data = useQuery(query); // ❌ Hook in try block
  } catch (error) {
    // ...
  }
  return <div>Content</div>;
}
```

### Rule 2: Only Call Hooks from React Functions

**Don't call Hooks from regular JavaScript functions.**

**✅ Call Hooks from:**
- React function components
- Custom Hooks (functions starting with `use`)

**❌ Don't call Hooks from:**
- Regular JavaScript functions
- Class components
- Event handlers

```typescript
// ✅ Good: Hook in component
function MyComponent() {
  const [count, setCount] = useState(0);
  return <div>{count}</div>;
}

// ✅ Good: Hook in custom Hook
function useCounter() {
  const [count, setCount] = useState(0);
  return { count, setCount };
}

// ❌ Bad: Hook in regular function
function calculateTotal() { // Not a component or custom Hook
  const [count, setCount] = useState(0); // ❌
  return count;
}
```

### Workarounds for Conditional Logic

When you need conditional behavior with Hooks:

```typescript
// ✅ Good: Call Hook unconditionally, use result conditionally
function MyComponent({ userId }: Props) {
  const userData = useUserData(userId); // Always called

  if (!userData) {
    return <div>Loading...</div>;
  }

  return <div>{userData.name}</div>;
}

// ✅ Good: Move conditional logic inside the Hook
function useOptionalFeature(enabled: boolean) {
  const [value, setValue] = useState(null); // Always called

  useEffect(() => {
    if (enabled) { // Condition inside the Hook
      // Do something
    }
  }, [enabled]);

  return value;
}

// ✅ Good: Use array.map instead of loop
function UserList({ userIds }: Props) {
  return (
    <div>
      {userIds.map((id) => (
        <UserItem key={id} userId={id} /> // Component uses hooks
      ))}
    </div>
  );
}
```

### ESLint Plugin

**Use `eslint-plugin-react-hooks`** to automatically catch violations:

```json
{
  "plugins": ["react-hooks"],
  "rules": {
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

## React Composability

### Component Composition Principles

Always consider React composability when writing or reviewing components:

1. **Single Responsibility**

   - Each component should do one thing well
   - Extract complex logic into smaller, focused components

2. **Composition Over Props Drilling**

   - Use component composition instead of passing props through multiple levels
   - Consider using Jotai for global state management
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

// ✅ Good: Composition with Jotai
const themeAtom = atom('light');

const Child = () => {
  const [theme] = useAtom(themeAtom);
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

### The customizeColumns Pattern

Replace array-based column extension with function-based composition for maximum flexibility.

**Problem with Array-Based Approach:**

```typescript
// ❌ Limited: Can only append columns
interface TableProps {
  extraColumns?: BAIColumnType[];
}

// Usage is inflexible
<UserTable extraColumns={[myColumn]} /> // Can only add at the end
```

**Solution: Function-Based Composition:**

```typescript
// ✅ Flexible: Full control over column order
interface TableProps {
  customizeColumns?: (baseColumns: BAIColumnType[]) => BAIColumnType[];
}

// Usage with full control
<UserNodes
  customizeColumns={(baseColumns) => [
    baseColumns[0],           // Keep email column first
    controlColumn,            // Insert control column second
    ...baseColumns.slice(1),  // Rest of base columns
  ]}
/>

// Can also filter, reorder, or replace columns
<UserNodes
  customizeColumns={(baseColumns) =>
    baseColumns
      .filter((col) => col.key !== 'hidden_column')
      .map((col) =>
        col.key === 'name' ? { ...col, width: 200 } : col
      )
  }
/>
```

**Benefits:**

- **Flexible Composition**: Insert, filter, reorder columns at any position
- **Reusability**: Base component works with different column configurations
- **Type Safety**: TypeScript ensures column customization is type-safe
- **Clean Architecture**: Follows separation of concerns principle

**When to Apply:**

- Table components with customizable columns
- Lists with configurable items
- Any component where consumers need control over child element ordering

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

### Relay Naming Conventions

Follow consistent naming patterns for Relay fragment props:

```typescript
// ✅ Good: Use 'queryRef' for Query fragments
interface ComponentProps {
  queryRef: ComponentQuery$key;
}

const Component: React.FC<ComponentProps> = ({ queryRef }) => {
  const data = useFragment(
    graphql`fragment Component_query on Query { ... }`,
    queryRef,
  );
};

// ✅ Good: Use specific naming for other types
interface UserProfileProps {
  userFrgmt: UserProfile_user$key; // For User type
  projectFrgmt: UserProfile_project$key; // For Project type
}

// ❌ Bad: Inconsistent naming
interface ComponentProps {
  fragmentData: ComponentQuery$key; // Not following convention
  queryKey: ComponentQuery$key; // Missing 'Ref' suffix
}
```

**Naming Rules:**

- Query fragments: Use `queryRef`
- Other types: Use `{typeName}Frgmt` (e.g., `userFrgmt`, `projectFrgmt`)
- For non-Query fragments, always include the `Frgmt` suffix to indicate it's a fragment reference

### Relay Fragment Architecture

Separate data fetching (query orchestrator) from presentation (fragment component) for better code organization and reusability.

**Architecture Pattern:**

```
┌─────────────────────────────────────┐
│     Query Orchestrator Component    │
│  - useLazyLoadQuery                 │
│  - Manages fetchKey, transitions    │
│  - Passes fragment refs to children │
└─────────────────────┬───────────────┘
                      │ fragment ref
                      ▼
┌─────────────────────────────────────┐
│       Fragment Component            │
│  - useFragment                      │
│  - Receives fragment ref as prop    │
│  - Focused on presentation          │
└─────────────────────────────────────┘
```

**Implementation Example:**

```typescript
// Query Orchestrator Component
const UserManagement: React.FC = () => {
  const [fetchKey, updateFetchKey] = useUpdatableState('first');
  const [isPendingRefetch, startRefetchTransition] = useTransition();

  const { users } = useLazyLoadQuery<UserManagementQuery>(
    graphql`
      query UserManagementQuery {
        users {
          ...UserNodes_users
        }
      }
    `,
    {},
    { fetchPolicy: 'store-and-network', fetchKey },
  );

  return (
    <UserNodes
      usersFrgmt={users}
      loading={isPendingRefetch}
      onRefresh={() => {
        startRefetchTransition(() => {
          updateFetchKey();
        });
      }}
    />
  );
};

// Fragment Component
interface UserNodesProps {
  usersFrgmt: UserNodes_users$key;
  loading?: boolean;
  onRefresh?: () => void;
  customizeColumns?: (cols: BAIColumnType[]) => BAIColumnType[];
}

const UserNodes: React.FC<UserNodesProps> = ({
  usersFrgmt,
  loading,
  onRefresh,
  customizeColumns,
}) => {
  const data = useFragment(
    graphql`
      fragment UserNodes_users on Query {
        users {
          id
          email
          username
          is_active
        }
      }
    `,
    usersFrgmt,
  );

  const baseColumns: BAIColumnType[] = [
    { key: 'email', title: 'Email', dataIndex: 'email' },
    { key: 'username', title: 'Username', dataIndex: 'username' },
  ];

  const columns = customizeColumns?.(baseColumns) ?? baseColumns;

  return (
    <BAITable
      dataSource={data.users}
      columns={columns}
      loading={loading}
    />
  );
};
```

**Benefits:**

- **Separation of Concerns**: Data fetching logic separate from presentation
- **Reusability**: Fragment components can be used with different queries
- **Type Safety**: Relay generates types for fragments
- **Colocation**: Fragment definition lives with the component that uses it
- **Composability**: Parent can customize child behavior through props

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

### BAIButton with action Prop

`BAIButton` provides built-in React Transition support through its `action` prop. This pattern automatically handles loading states during async operations.

**When to Use `action` vs `onClick`:**

| Scenario                                | Use `action` | Use `onClick` |
| --------------------------------------- | ------------ | ------------- |
| Async operations (API calls, mutations) | ✅           | ❌            |
| Simple state updates                    | ❌           | ✅            |
| Operations requiring loading feedback   | ✅           | ❌            |
| Navigation or routing                   | ✅           | ✅            |

**Usage Examples:**

```typescript
// ✅ Good: Use action for async operations
<BAIButton
  action={async () => {
    await commitMutation({ variables: { id } });
    updateFetchKey();
  }}
>
  Save Changes
</BAIButton>

// ❌ Bad: Combine action with onClick for mixed scenarios
<BAIButton
  action={async () => {
    await saveData();
  }}
  onClick={() => {
    setOtherState('updated');
  }}
>
  Submit
</BAIButton>

// ❌ Bad: Managing loading state manually
const [isLoading, setIsLoading] = useState(false);
<Button
  loading={isLoading}
  onClick={async () => {
    setIsLoading(true);
    await saveData();
    setIsLoading(false);
  }}
>
  Save
</Button>
```

**Benefits:**

- Automatic loading state management
- React Transition integration for responsive UI
- Prevents double clicks during execution
- Consistent UX across the application

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
import { useFetchKey } from "./hooks/useFetchKey";

const MyComponent = () => {
  const [fetchKey, setFetchKey] = useFetchKey();

  // Use fetchKey in queries to trigger refetch
  const { data } = useQuery({
    queryKey: ["data", fetchKey],
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

<BAIUnmountAfterClose open={open}>
  <BAIModal open={open} />
</BAIUnmountAfterClose>
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

### Empty Catch Blocks (Security Concern)

**Never use empty catch blocks** - they are a security concern and hide errors:

```typescript
// ❌ Bad: Empty catch block
try {
  await fetchData();
} catch (e) {
  // Silent failure - security risk
}

// ✅ Good: Explicit error handling with logger
try {
  await fetchData();
} catch (e) {
  logger.error("Failed to fetch data:", e);
  // Handle error appropriately
}

// ✅ Good: Explicitly ignore errors when intentional
try {
  await fetchData();
} catch {
  return undefined; // Explicit return for ignored errors
}
```

**Why this matters:**

- Empty catch blocks hide bugs and make debugging difficult
- Security scanners flag empty catches as vulnerabilities
- Makes code review harder - unclear if error is intentionally ignored
- Can mask critical failures in production

### Logging and Debugging

#### Console.log Prohibition

**Never use `console.log` or other console methods directly** - ESLint warns against it:

```json
// ESLint rule in package.json
"no-console": ["warn"]
```

**Why this rule exists:**

- Console statements should be removed before production
- Uncontrolled logging clutters browser console
- No way to filter or control log levels
- Cannot be easily disabled in production
- Makes it harder to find actual debug statements

#### Use useBAILogger Instead

**Always use `useBAILogger` hook** from `backend.ai-ui` package for all logging:

```typescript
import useBAILogger from '@backend.ai/backend.ai-ui/hooks/useBAILogger';

const MyComponent = () => {
  const { logger } = useBAILogger();

  // ✅ Good: Use logger methods
  logger.log('Component mounted');
  logger.debug('Debugging state:', state);
  logger.info('User action completed');
  logger.warn('Deprecated API used');
  logger.error('Failed to fetch data:', error);

  return <div>...</div>;
};
```

#### Log Levels

Use appropriate log levels for different scenarios:

- **`logger.log()`** - General logging (LogLevel.LOG)
- **`logger.debug()`** - Detailed debugging information (LogLevel.DEBUG)
- **`logger.info()`** - Informational messages (LogLevel.INFO)
- **`logger.warn()`** - Warning messages (LogLevel.WARN)
- **`logger.error()`** - Error messages (LogLevel.ERROR)

```typescript
// ✅ Good: Appropriate log levels
const handleSubmit = async () => {
  logger.debug("Form submitted with values:", formValues);

  try {
    const result = await submitData(formValues);
    logger.info("Data submitted successfully:", result.id);
  } catch (error) {
    logger.error("Failed to submit data:", error);
    throw error;
  }
};
```

#### Logger Features

**Automatic production control:**

```typescript
// Logger is automatically disabled in production
// No need to manually check NODE_ENV
logger.debug("This only logs in development");
```

**Contextual logging:**

```typescript
// Add context to logs for better debugging
const contextLogger = logger.withContext("userId", user.id);
contextLogger.info("User action performed");
```

**Plugin support:**

```typescript
// Logger supports plugins for custom behavior
logger.use({
  beforeLog: (context) => {
    // Modify or filter logs before output
    return context;
  },
  afterLog: (context) => {
    // Send logs to external service
  },
});
```

#### Migration from console.log

When you encounter `console.log` in existing code:

```typescript
// ❌ Bad: Using console directly
console.log("User logged in");
console.error("API error:", error);
console.warn("Deprecated feature used");

// ✅ Good: Use logger with appropriate levels
const { logger } = useBAILogger();
logger.info("User logged in");
logger.error("API error:", error);
logger.warn("Deprecated feature used");
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

### Variable Naming Convention

- **All variable names must start with a lowercase letter** (camelCase)
- This applies to local variables, function parameters, state variables, constants (non-enum), and hook return values

```typescript
// ✅ Good: Variables start with lowercase
const userName = 'John';
const [isLoading, setIsLoading] = useState(false);
const fetchKey = useFetchKey();
const handleSubmit = () => { /* ... */ };

// ❌ Bad: Variables starting with uppercase
const UserName = 'John';
const FetchKey = useFetchKey();
const HandleSubmit = () => { /* ... */ };
```

**Exceptions:**
- React component names (PascalCase): `const MyComponent = () => { ... }`
- Type/Interface names (PascalCase): `interface UserProps { ... }`
- Enum members (PascalCase): `enum Status { Active, Inactive }`

### Type Safety

- Always define prop interfaces
- Extend BAI/Ant Design's prop types when wrapping components
- Use discriminated unions for variant props
- Use `interface` for props instead of `type` when possible

```typescript
// ✅ Good: Proper prop typing
interface MyComponentProps extends BAIModalProps {
  customProp: string;
  variant: "primary" | "secondary";
}

// ✅ Good: Discriminated unions
type Status =
  | { type: "loading" }
  | { type: "success"; data: Data }
  | { type: "error"; error: Error };
```

### Discriminated Unions for Component Variants

Use TypeScript discriminated unions to create type-safe component variants:

```typescript
// ✅ Good: Type-safe prop variants
interface BaseSettingItemProps {
  title: ReactNode;
  description?: ReactNode;
  value?: string | boolean;
}

type CheckboxSettingItemProps = BaseSettingItemProps & {
  type: 'checkbox';
  onChange?: (value?: boolean) => void;
  checkboxProps?: Omit<CheckboxProps, 'value' | 'onChange'>;
  selectProps?: never; // Prevents accidental usage
};

type SelectSettingItemProps = BaseSettingItemProps & {
  type: 'select';
  onChange?: (value?: string) => void;
  selectProps?: Omit<SelectProps, 'value' | 'onChange'>;
  checkboxProps?: never; // Prevents accidental usage
};

type SettingItemProps = CheckboxSettingItemProps | SelectSettingItemProps;

// TypeScript enforces correct prop combinations
<SettingItem
  type="checkbox"
  onChange={(value: boolean) => {}} // ✅ Correctly typed as boolean
  checkboxProps={{ disabled: true }}
  // selectProps={...} // ❌ TypeScript error: selectProps not allowed
/>
```

### Standardized Callback APIs

Replace ad-hoc callbacks with standard naming conventions:

```typescript
// ❌ Bad: Inconsistent naming
interface OldProps {
  setValue?: (v: string) => void;
  onValueChange?: (v: string) => void;
  onAfterChange?: (v: string) => void;
}

// ✅ Good: Consistent with Ant Design patterns
interface NewProps {
  onChange?: (value: string) => void;
}
```

### Generic Components

- Use generics for reusable components with different data types
- Properly constrain generic types

```typescript
// ✅ Good: Generic with proper constraints
interface BAITableProps<T extends { id: string }> {
  dataSource: T[];
  columns: BAIColumnType<T>[];
  onRowClick?: (record: T) => void;
}

const BAITable = <T extends { id: string }>({
  dataSource,
  columns,
  onRowClick,
}: BAITableProps<T>) => {
  // Implementation
};

// Usage with type inference
<BAITable
  dataSource={users} // T inferred as User
  columns={userColumns}
  onRowClick={(user) => handleUserRowClick(user)} // user is typed as User
/>
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

- Use **Jotai** for global state management
- Use Relay for GraphQL-backed state
- Use React Context for simple UI state that doesn't need persistence

```typescript
// ✅ Good: Jotai for global state
import { atom, useAtom } from "jotai";

const userSettingsAtom = atom({});

const Component = () => {
  const [settings, setSettings] = useAtom(userSettingsAtom);
  // ...
};
```

## Refactoring Principles

### When to Refactor

1. **API Inconsistency**: When component APIs don't follow standard patterns
2. **Props Drilling**: When props pass through 3+ component levels
3. **Duplicate Logic**: When similar logic exists in multiple components
4. **Type Safety Gaps**: When `any` types or type assertions are used
5. **Performance Issues**: When profiling shows unnecessary re-renders

### Incremental Refactoring Approach

1. **Plan**: Document what changes and why
2. **Type First**: Update TypeScript interfaces before implementation
3. **Update Usages**: Change all component usages together
4. **Test**: Verify functionality in all affected areas
5. **i18n**: Add translations for all 21 supported languages

### Backward Compatibility

```typescript
// ✅ Good: Gradual migration with deprecation
interface Props {
  /** @deprecated Use onChange instead */
  setValue?: (v: string) => void;
  onChange?: (v: string) => void;
}

// In implementation
const handleChange = (value: string) => {
  onChange?.(value);
  setValue?.(value); // Support legacy prop during transition
};

// ❌ Bad: Breaking change without migration path
interface Props {
  onChange: (v: string) => void; // Removed setValue without warning
}
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

### E2E Tests

- Cover critical user flows
- Use Playwright-based E2E tests for full browser interactions
- The `.claude/agents/` directory has agents for E2E testing. Please use the following agents when writing E2E tests:
  - playwright-test-planner
    - Use this agent when you need to create comprehensive test plan for a web application or website.
  - playwright-test-generator
    - Use this agent when you need to create automated browser tests using Playwright.
  - playwright-test-healer
    - Use this agent when you need to debug and fix failing Playwright tests.

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

### React Compiler & Optimization

- [ ] Component uses `'use memo'` directive if it's a new component
- [ ] No unnecessary `useMemo`/`useCallback` (prefer 'use memo' directive)
- [ ] `useEffectEvent` is used for non-reactive logic in Effects when appropriate

### React Transitions

- [ ] `BAIButton` uses `action` prop for async operations
- [ ] No manual loading state management where `BAIButton` action suffices
- [ ] `useTransition` is used for non-urgent state updates
- [ ] `useDeferredValue` is used for optimistic rendering

### Component Composition

- [ ] Component follows composability principles (no props drilling, proper extraction)
- [ ] Function-based APIs (`customizeColumns`) over array-based (`extraColumns`)
- [ ] Components follow single responsibility principle
- [ ] Complex components are split into smaller, focused components

### Relay Architecture

- [ ] Query orchestrator components separate from fragment components
- [ ] Fragment refs are properly typed with generated `$key` types
- [ ] Fragment props follow naming conventions (`queryRef` for Query, `{typeName}Frgmt` for others)
- [ ] `@required` directive used for non-null fields
- [ ] Fragments are colocated with components that use them
- [ ] Relay hooks (`useLazyLoadQuery`, `useFragment`, `useRefetchableFragment`) are used correctly

### UI Components

- [ ] **BAI components are used instead of Ant Design equivalents**
- [ ] `BAIText` used for text rendering (theme management)
- [ ] CSS inheritance (`fontSize: 'inherit'`) preferred over hard-coded values
- [ ] Ant Design modals use `App.useApp()` context instead of direct Modal import
- [ ] `useFetchKey` is used where data refetching is needed
- [ ] `BAIUnmountAfterClose` wraps modal/drawer content with forms

### TypeScript

- [ ] Discriminated unions used for component variants
- [ ] No `any` types without justification
- [ ] Callback props follow standard naming (`onChange`, `onSubmit`)
- [ ] Generic components have proper constraints
- [ ] TypeScript types are properly defined

### Error Handling & State

- [ ] Pre-defined error boundaries (`ErrorBoundaryWithNullFallback`, `BAIErrorBoundary`) are used
- [ ] Error states and loading states are handled
- [ ] Jotai is used for global state when appropriate

### Internationalization & Accessibility

- [ ] i18n is used for all user-facing text
- [ ] Component is accessible (ARIA, keyboard navigation)

### Security & Quality

- [ ] No security vulnerabilities (XSS, injection risks)
- [ ] No empty catch blocks (use explicit error handling or `catch { return undefined; }`)
- [ ] No `console.log` or direct console methods (use `useBAILogger` instead)
- [ ] All 21 language translations included for new strings (if applicable)
- [ ] Unused props and variables removed

### Refactoring Quality (when applicable)

- [ ] Changes are incremental and reviewable
- [ ] All usages updated consistently
- [ ] Backward compatibility maintained where needed
