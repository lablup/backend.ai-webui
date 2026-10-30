---
description: Use React 19.2's useEffectEvent to keep useEffect dependencies precise
paths:
  - "react/**/*.{tsx,ts}"
  - "packages/backend.ai-ui/**/*.{tsx,ts}"
---

# `useEffectEvent` Convention

This project targets **React 19.2+** which exposes `useEffectEvent` as a stable
API (`@version 19.2.0` in `@types/react`). Use it to keep `useEffect` dependency
arrays focused on the values that genuinely drive synchronization, while still
reading the latest props/state/closures inside the effect body.

## Why

`useEffect` re-runs whenever any value in its dep array changes by identity.
When you call helper callbacks (`onSomething`, `logger`, parent props) from
inside an effect:

- Including them in deps causes spurious re-runs every time the parent
  re-renders, because their identity changes.
- Omitting them with `// eslint-disable-next-line react-hooks/exhaustive-deps`
  silently captures stale closures.
- Wrapping each one in `useCallback` and propagating that everywhere creates
  cascading dep arrays that are hard to maintain.
- A "memoized fn" helper (the `ahooks` `useMemoizedFn` pattern) is not
  available: `ahooks` is not a dependency of this repo.

`useEffectEvent` solves all of these. It returns a stable function whose body
always reads the *latest* values from the surrounding closure. The dep array
of the surrounding `useEffect` only needs the values that actually represent
"things this effect should re-synchronize on."

## Rules

1. Whenever an `useEffect` body needs to call a helper that closes over props,
   state, or context but is **not** part of the synchronization key, wrap that
   helper in `useEffectEvent` and call it from the effect.
2. The `useEffect` dep array should contain **only** the values the effect
   genuinely synchronizes against — typically 0–2 entries: primary inputs
   like a fetched ID, a query parameter, or `active`/`apiEndpoint` flags.
   Helper callbacks, loggers, and parent props that you only *call* from
   inside the effect must not appear in deps; move them into a
   `useEffectEvent` callback instead.
3. Do **not** disable `react-hooks/exhaustive-deps` to omit deps. Either:
   include the value in deps (because the effect should re-react to it), or
   move the access into a `useEffectEvent` callback.
4. `useEffectEvent` callbacks are **not** safe to call outside of effects.
   Treat them as effect-internal helpers, not as event handlers passed to JSX
   (use a plain function under `'use memo'` for that — see
   `react-compiler-memoization.md`).
5. Prefer `useEffectEvent` over any "stable callback that reads the latest
   closure" helper. BUI has one — `useLatestCallback` in
   `packages/backend.ai-ui/src/hooks/internal/useLatest.ts` — but it exists
   solely so the ported `useControllableValue` / storage-state hooks can keep
   their stable-setter contract. Do not use it in application code.

## Pattern

### ❌ Without `useEffectEvent`: stale closure or spurious re-runs

```tsx
const Child: React.FC<{ data: Data; onLoaded: (d: Data) => void }> = ({
  data,
  onLoaded,
}) => {
  useEffect(() => {
    if (data) {
      onLoaded(data); // closure over `onLoaded`
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]); // ← omitted `onLoaded`; stale closure if parent updates it
};
```

```tsx
useEffect(() => {
  if (data) onLoaded(data);
}, [data, onLoaded]); // ← `onLoaded` re-fires the effect on every parent
                      //   re-render; effect re-runs even when `data`
                      //   hasn't changed
```

### ✅ With `useEffectEvent`: precise deps, latest closure

```tsx
import { useEffect, useEffectEvent } from 'react';

const Child: React.FC<{ data: Data; onLoaded: (d: Data) => void }> = ({
  data,
  onLoaded,
}) => {
  // Read the latest `onLoaded` from the closure without forcing it
  // into the dep array.
  const onResolved = useEffectEvent(() => {
    if (data) {
      onLoaded(data);
    }
  });

  useEffect(() => {
    onResolved();
  }, [data]); // ← only the genuine reactive dep
};
```

### Pattern for "fire once on mount" with closures

```tsx
const onMount = useEffectEvent(() => {
  // Reads latest props/closures every time it is called.
  doExpensiveSetup({ foo, bar, onDone });
});

useEffect(() => {
  onMount();
}, []); // ← only when mount key changes (and `key` prop on JSX
        //   guarantees a fresh mount, not in-place updates)
```

**StrictMode caveat**: empty-dep effects fire **twice** in dev StrictMode.
If the side effect is not idempotent (starts a network request, opens a
window, etc.), guard with a `useRef` flag, or rely on the parent's `key`
prop to remount cleanly so identity is the synchronization key.

## React 19.2 trap: no `useEffectEvent` inside `memo()` / `forwardRef()`

React 19.2.x republishes a `useEffectEvent` implementation only for plain
function-component fibers. Inside a `React.memo(Comp)` without a compare
function (a `SimpleMemoComponent` fiber) or a `forwardRef()` component, every
effect event keeps its **first render's** closure for the component's whole
life (facebook/react#34818, fixed in React 19.3 by facebook/react#34831).
`memo(Comp, areEqual)` is not affected: it renders `Comp` in a child
function-component fiber. `Form.useWatch` is built on an effect event, so a
`memo()`-wrapped component that watches a field silently drops a change back
to a value it has already seen — the session launcher's accelerator bug
(#10705). Until React is on 19.3 (#10706):

- do not wrap a component that calls `useEffectEvent`, directly or through a
  hook such as `Form.useWatch`, in `React.memo()` without a compare function
  or in `forwardRef()`;
- removing such a wrapper costs nothing when every rendering parent is
  compiled: its JSX element is then referentially stable, so the child bails
  out as before. Compiled means the parent body starts with `'use memo'` and
  `pnpm --filter ./react exec eslint <parent file>` reports no React Compiler
  diagnostic for it (a bailout leaves the parent uncompiled). A parent that is
  not compiled re-renders the child on every render — check each parent
  before removing.

## When NOT to use `useEffectEvent`

- **For values the effect *should* react to**. Example: a query parameter that,
  when changed, must trigger a re-fetch. Keep these in deps.
- **For event handlers passed to JSX** (`onClick`, `onChange`, etc.). The
  React Compiler under `'use memo'` already memoizes regular functions, so
  write a plain function. `useEffectEvent` callbacks are documented
  as effect-internal and have undefined behavior outside of effects.
- **In components without `'use memo'`**: prefer adding the directive (per
  `react.instructions.md`) before adopting `useEffectEvent`. The two work
  together; using one without the other is a partial solution and you will
  still be re-creating helper functions on every render.

## Verification

After editing a file that uses `useEffect`, ensure:

- No `useMemoizedFn`-style stable-callback helper is used outside BUI's own
  ported hooks (project-wide convention).
- No `// eslint-disable-next-line react-hooks/exhaustive-deps` introduced just
  to drop a callback dep — convert to `useEffectEvent` instead.
- `bash scripts/verify.sh` passes; `react-hooks/exhaustive-deps` lint should be
  satisfied without disable comments.
- No `useEffectEvent` (or `Form.useWatch`) runs inside a `React.memo()` /
  `forwardRef()` component while React is 19.2 (the trap above).

## Related

- `'use memo'` directive (`react.instructions.md`): the React Compiler removes
  the need for `useCallback`/`useMemo` for regular values and JSX-passed
  callbacks. `useEffectEvent` complements this for the effect-internal case
  where the compiler cannot express "ignore this dep for re-synchronization".
- `component-props-extension.md`: wrapper component prop conventions,
  including the frozen antd-v6-shaped prop vocabulary section.
