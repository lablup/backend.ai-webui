---
name: react-component-basics
description: >
  Use when creating a new React component under `react/src/` or
  `packages/backend.ai-ui/src/`, or refactoring one's file layout, import
  order, `'use memo'` placement, hook call order, or prop interface. Covers
  naming conventions (`BAI*`, `*Nodes`, `*Page`) and React 19 rules.
---

# React Component Basics

Baseline shape of a component file in this repo, extracted from patterns repeated
across recent 2025 PRs (e.g. `UserManagement.tsx`, `BAIUserNodes.tsx`,
`AdminComputeSessionListPage.tsx`, `FolderCreateModal.tsx`).

This skill is deliberately scoped to **structure and conventions**. For topic-specific
guidance see the sibling skills: `react-form`, `react-modal-drawer`, `react-layout`,
`react-relay-table`, `react-url-state`, `react-async-actions`,
`react-suspense-fetching`, `react-hooks-extraction`.

## Activation Triggers

- Creating a new `.tsx` component file
- Refactoring a component's file structure, imports, or props interface
- Questions like "where do I put 'use memo'?", "how are props named?",
  "what order do the hooks go in?"

## Gotchas

- **`'use memo'` shows "Unknown directive"** in TypeScript/ESLint. Intentional — React Compiler consumes it. Never remove, rename, or switch to backticks.
- **Hooks after an early return** silently break hook order. Put every hook at the top of the body before any `if (...) return`.
- **Variable names starting with uppercase** compile fine but violate project convention. Exceptions: component names, types/interfaces, enum members only.
- **`console.*` passes TypeScript** but is flagged by ESLint and swept by cleanups (FR-1749 #4802). Always `useBAILogger`.
- **Empty `catch {}` blocks** trip the security scanner (FR-1748 #4740). For intentional ignore write `catch { return undefined; }` explicitly.
- **`useMemoizedFn` from ahooks** is deprecated in favor of `useEffectEvent` (React 19.2+). See `.claude/rules/use-effect-event.md`. Don't introduce new usages.
- **`extends Omit<ParentProps, 'key'>` with the wrong Omit list** silently drops props. Mirror antd v6 names — `<Alert title>` not `<Alert message>`. See `.claude/rules/antd-v6-props.md`.
- **`React.FC<Props>` and `(props: Props) =>` both work**; the project mixes them. Don't introduce a `React.FC` → arrow migration in a scoped PR.

## 1. File Skeleton

Every component file follows this shape. Deviating is a red flag in review.

```tsx
/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
// 1. Generated types (Relay artifacts)
import {
  MyComponentFragment$data,
  MyComponentFragment$key,
} from '../__generated__/MyComponentFragment.graphql';

// 2. Local (same-package) imports — components, hooks, helpers
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import BAIRadioGroup from './BAIRadioGroup';

// 3. External imports — antd / BUI / lodash / relay / react
import { App, theme } from 'antd';
import {
  BAIButton,
  BAIFlex,
  BAIModal,
  useFetchKey,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

interface MyComponentProps extends Omit<ParentProps, 'overriddenKey'> {
  myFrgmt: MyComponentFragment$key;
  customizeColumns?: (base: BAIColumnType[]) => BAIColumnType[];
}

const MyComponent: React.FC<MyComponentProps> = ({
  myFrgmt,
  customizeColumns,
  ...tableProps
}) => {
  'use memo'; // always first line of the component body

  // i18n / theme / app context
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { message, modal } = App.useApp();

  // Relay
  const data = useFragment(graphql`...`, myFrgmt);

  // derived values (NEVER useState + useEffect)
  const derived = useMemo(() => computeFrom(data), [data]);

  // handlers
  const handleSave = async () => { /* ... */ };

  // JSX
  return (
    <BAIFlex direction="column" gap="sm">
      {/* ... */}
    </BAIFlex>
  );
};

export default MyComponent;
```

### Import Order (enforced by review)

1. Generated GraphQL types from `../__generated__/`
2. Local project imports (components, hooks, helpers — same package)
3. External packages: `antd` → `backend.ai-ui` → `lodash-es`/utility → `react`/`react-*`/`relay`

Within each group, sort alphabetically. Don't use `lodash`; use `lodash-es`.

## 2. `'use memo'` Directive

The React Compiler memoizes function bodies that begin with `'use memo'`. The directive has strict placement requirements:

- **Must be at the very beginning of the function body**, before any other code.
- Comments before the directive are allowed.
- Use double or single quotes (`"use memo"` or `'use memo'`) — **never backticks**.
- Cannot be placed conditionally or later in the function. Only the first directive is processed; additional directives are ignored.
- Do NOT remove existing `'use memo'`, even if tooling warns "Unknown directive".

```tsx
// ✅ Good
const MyComponent: React.FC<Props> = (props) => {
  'use memo'; // first line

  const { t } = useTranslation();
  // ...
};

// ✅ Good — comment before the directive is allowed
function AnotherComponent({ data }: Props) {
  // Optimized by React Compiler
  'use memo';

  return <div>{data}</div>;
}

// ❌ Bad — directive after a statement
function BadComponent({ data }: Props) {
  const value = 'test';
  'use memo';
  return <div>{data}</div>;
}

// ❌ Bad — conditional directive
function ConditionalBad({ data }: Props) {
  if (condition) {
    'use memo';
  }
  return <div>{data}</div>;
}

// ❌ Bad — backticks
function BacktickBad({ data }: Props) {
  `use memo`;
  return <div>{data}</div>;
}
```

Manual `useMemo` / `useCallback` should be reserved for profiled bottlenecks. Under `'use memo'` the compiler handles it automatically — reviewers will push back on speculative manual memoization.

## 3. Hook Call Order

Keep hooks in this order so readers can scan a component's dependencies at a glance:

1. `useTranslation()` / `theme.useToken()` / `App.useApp()`
2. Context hooks (`useCurrentProjectValue`, `useCurrentUserRole`, …)
3. Router / URL state (`useQueryStates`, `useLocation`, `useWebUINavigate`)
4. Relay hooks (`useLazyLoadQuery`, `useFragment`, `useMutation`)
5. `useState` / `useTransition` / `useToggle`
6. Derived `useMemo` / `useDeferredValue`
7. `useEffect` / `useEffectEvent`
8. Handler definitions (`handleFoo = async () => {}`)

The **top-level hooks rule** still applies: no hooks inside conditions, loops,
or after an early return.

## 4. Props Interface

### 4.1 Always extend the underlying component

When wrapping antd or a BUI component, extend its props via `Omit<>` so
consumers keep access to `className`, `style`, event handlers, etc. See
`.claude/rules/component-props-extension.md`.

```tsx
// ✅
interface FolderCreateModalProps extends BAIModalProps {
  onRequestClose: (response?: FolderCreationResponse) => void;
  initialValues?: Partial<FolderCreateFormItemsType>;
}

// ❌ Drops every antd Modal prop
interface FolderCreateModalProps {
  open: boolean;
  onRequestClose: () => void;
}
```

### 4.2 Prop Naming

| Kind | Convention | Example |
|---|---|---|
| Query fragment ref | `queryRef` | `queryRef: PageQuery$data` |
| Non-query fragment ref | `{typeName}Frgmt` | `userFrgmt`, `vfolderNodeFrgmt`, `usersFrgmt` (plural) |
| Change callback | `onChange` (not `setValue`) | `onChange?: (v: string) => void` |
| Table order callback | `onChangeOrder` | `onChangeOrder?: (order: ... \| null) => void` |
| Close callback | `onRequestClose` | `onRequestClose?: (result?) => void` |
| Column customizer | `customizeColumns` | `customizeColumns?: (base) => base` |
| Boolean flag | descriptive, not `isXxx` in props | `disableSorter`, `showResetButton`, `showTitle` |

Historical `setValue` props were migrated to `onChange` in FR-1720 (#4849).
Don't introduce new `setValue` props.

### 4.3 Discriminated Unions for Variants

Instead of loose optional props, use discriminated unions so TypeScript enforces
mutually exclusive fields.

```tsx
type CheckboxSettingItemProps = BaseProps & {
  type: 'checkbox';
  onChange?: (v?: boolean) => void;
  checkboxProps?: Omit<CheckboxProps, 'value' | 'onChange'>;
  selectProps?: never;
};
type SelectSettingItemProps = BaseProps & {
  type: 'select';
  onChange?: (v?: string) => void;
  selectProps?: Omit<SelectProps, 'value' | 'onChange'>;
  checkboxProps?: never;
};
type SettingItemProps = CheckboxSettingItemProps | SelectSettingItemProps;
```

## 5. Naming

### Components

- `BAI*` — Shared/generic component that lives (or will live) under `packages/backend.ai-ui/`
  (`BAIButton`, `BAIFlex`, `BAIModal`, `BAIUserNodes`).
- `*Nodes` — A Relay-backed table component bound to a GraphQL type
  (`BAIUserNodes`, `SessionNodes`, `VFolderNodes`). Always colocates a `@relay(plural: true)` fragment.
- `*Page` — Top-level route component under `react/src/pages/`
  (`ComputeSessionListPage`, `AdminComputeSessionListPage`).
- `*Modal` / `*Drawer` — UI shells. Partner component, not a page.
- `*FormItems` — Group of related `Form.Item`s extracted for reuse
  (`ResourceAllocationFormItems`, `SharedMemoryFormItems`).

### Derived Types

Export the "one row" type so consumers can type callbacks without re-deriving:

```tsx
export type UserNodeInList = NonNullable<BAIUserNodesFragment$data[number]>;

const availableUserSorterKeys = ['email', 'username', ...] as const;
export const availableUserSorterValues = [
  ...availableUserSorterKeys,
  ...availableUserSorterKeys.map((key) => `-${key}` as const),
] as const;
```

### Variables

- camelCase; never start a variable or prop with an uppercase letter.
- Fragment results named after the GraphQL type: `const users = useFragment(...)`, `const vfolderNode = useFragment(...)` — not `data`, not `result`.
- Don't abbreviate domain types ambiguously — `session`/`endpoint`/`vfolder` are distinct.

## 6. React 19 Rules That Apply Here

### 6.1 Derive, don't mirror

```tsx
// ❌
const [derived, setDerived] = useState(null);
useEffect(() => { setDerived(computeFrom(data)); }, [data]);

// ✅
const derived = useMemo(() => computeFrom(data), [data]);
```

### 6.2 `useEffectEvent` instead of disabling exhaustive-deps

If an effect calls a helper that closes over props but isn't part of the
synchronization key, wrap the helper in `useEffectEvent`. See
`.claude/rules/use-effect-event.md`. Do **not** disable
`react-hooks/exhaustive-deps` to omit a callback dep.

### 6.3 Under `'use memo'`, don't manually `useMemo`/`useCallback`

React Compiler handles it. Only add manual memoization when profiling proves
it's needed — reviewers will push back otherwise.

## 7. Ant Design v6 Props

This project runs antd v6. Always use v6 prop names (`title` instead of
`message` on `Alert`, `orientation` instead of `direction` on `Steps`, etc.).
See `.claude/rules/antd-v6-props.md`.

## 8. Logging

Never `console.log` — use `useBAILogger` from `backend.ai-ui`:

```tsx
const { logger } = useBAILogger();
logger.error('mutation failed', err);
```

## Related Skills

- **`react-form`** — when the component owns a `<Form>`
- **`react-modal-drawer`** — when it's a modal/drawer shell
- **`react-relay-table`** — when it's a `*Nodes` table component
- **`react-layout`** — `BAIFlex` and spacing details
- **`relay-patterns`** — full fragment architecture for data-fetching components
- **`fw:lead-frontend-coding-style`** — comprehensive umbrella style guide

## 9. Verification Checklist

Before committing a new component, confirm:

- [ ] `'use memo'` is the first line of the component body.
- [ ] Props interface `extends Omit<...>` the wrapped component's props.
- [ ] No `console.*`; uses `useBAILogger`.
- [ ] No hardcoded user-facing strings; everything goes through `t()`.
- [ ] No `useState + useEffect` for values derivable via `useMemo`.
- [ ] No `// eslint-disable-next-line react-hooks/exhaustive-deps` — use `useEffectEvent`.
- [ ] Naming follows §5 (`BAI*`, `*Nodes`, `*Page`, fragment-typed variable names).
- [ ] `bash scripts/verify.sh` passes.
