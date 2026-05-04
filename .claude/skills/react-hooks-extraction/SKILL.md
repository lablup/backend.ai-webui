---
name: react-hooks-extraction
description: >
  Use when refactoring logic out of a fat component into a custom hook,
  deciding hook vs helper, applying `useEffectEvent` to avoid stale closures,
  or designing a hook's return shape. Covers hook placement, naming, and
  parameterization conventions.
---

# Custom Hook Extraction

Patterns from FR-1653 (#4592) `useStartSession` extraction, FR-1656 (#4612)
filebrowser image hook, FR-1492 (#4303) `SharedMemoryFormItems`, FR-1472
(#4310) `useCurrentUserInfo`, FR-527 (#3169) `useFetchKey`, FR-1299-adjacent
custom hooks, and `use-effect-event.md` rule.

## Activation Triggers

- A component has grown past ~500 lines and has clusters of related logic
- Two or more components share the same state + effect + callback shape
- An `useEffect` calls a helper that closes over props; deps array fights you
- A mutation or API call needs the same "validate → run → notify → refetch"
  sequence in multiple places
- Question: "should this be a hook or a helper?"

## Gotchas

- **`'use memo'` works inside custom hooks too.** React Compiler memoizes hook bodies. Place it as the first line of the hook body, same as components (`useStartSession` does this).
- **Tuple return `[value, setter]`** signals "useState-like"; object return signals "useQuery-like". Consumers read them differently — choose based on semantics, not convenience.
- **Hooks returning JSX are still named `use*`**, not `render*`. If a hook would return a full `<Component/>`, reconsider — it probably wants to be a component.
- **`useEffectEvent` is effect-internal** — calling it outside `useEffect` / `useLayoutEffect` / `useInsertionEffect` has undefined behavior (React docs). Don't pass to JSX `onClick`.
- **`useSuspendedBackendaiClient()` suspends the caller.** Wrap the caller in `<Suspense>` or accept that the first render shows fallback.
- **i18n inside the hook** — call `useTranslation()` internally. Don't make callers pass `t` (project convention from lead coding style).
- **Parametrize per-call inputs on the returned function**, not on the hook argument. `const { startSession } = useStartSession(); startSession(values)` — not `useStartSession(values)`.
- **New `useMemoizedFn` usage from ahooks is forbidden** (`.claude/rules/use-effect-event.md`). Remove existing occurrences when you touch nearby code.

## 1. When to extract — decision rules

### 1.1 Extract as a hook when ALL hold

- The logic uses at least one React hook (`useState`, `useEffect`, `useLazyLoadQuery`, `useMutation`, …)
- The logic is reused OR will be soon OR is non-trivial (≥ ~30 lines dominating a component)
- You can name it `useSomething` such that the name describes what it returns or what it does

### 1.2 Extract as a plain function when

- No React hooks involved (pure transformation)
- I18n: prefer the function NOT taking `t` as an argument — instead make it a
  hook so it can call `useTranslation()` internally (a consistent repo
  convention, stated in the lead coding style)

### 1.3 Don't extract (yet) when

- Only used once and it's ≤ ~20 lines
- Extraction would cross a concern boundary unnaturally (e.g. splitting a
  validator that depends on three local states)
- You'd have to pass 5+ arguments to reconstruct the closure

Scope discipline: if extraction isn't obviously a net win, leave it inline and
note a TODO. The reviewer will push back on speculative hooks.

## 2. Where hooks live

| Path | Use |
|---|---|
| `react/src/hooks/useThing.ts` | Generic / cross-feature hook |
| `react/src/hooks/useThing.tsx` | Hook that returns JSX (notifications, overlays) |
| `react/src/components/FooBar/useFooBar.ts` | Hook specific to a component/feature |
| `packages/backend.ai-ui/src/hooks/useBaiLogger.ts` etc | Hooks generalizable to BUI |

`.tsx` extension only when the hook returns or constructs JSX.

## 3. Anatomy of a well-extracted hook

### 3.1 `useStartSession` — complex async action

```tsx
export const useStartSession = () => {
  'use memo';

  const { t } = useTranslation();                   // i18n inside
  const currentProject = useCurrentProjectValue();
  const { upsertNotification } = useSetBAINotification();
  const relayEnv = useRelayEnvironment();
  const baiClient = useSuspendedBackendaiClient();

  const [currentGlobalResourceGroup] = useCurrentResourceGroupState();

  const defaultFormValues: DeepPartial<SessionLauncherFormValue> = {
    sessionType: 'interactive',
    // …
  };

  const startSession = async (values: StartSessionValue): Promise<StartSessionResults> => {
    // …compose sessionInfo, POST, fetchQuery, upsertNotification…
  };

  return {
    startSession,
    defaultFormValues,
    supportsMountById: baiClient.supports('mount-by-id'),
  };
};
```

Patterns worth copying:

- `'use memo'` at the top of the hook body too.
- Collects all the required context inside — caller passes only data, not
  dependencies.
- Returns a **named object**, not a bare function, so future additions
  (`supportsMountById`) don't break call sites.
- Exports result-shape types (`StartSessionResults`, `StartSessionValue`) for
  callers.
- Accepts parameterized "values" as argument, not as hook argument. Hook
  argument is reserved for initial/configuration data.

### 3.2 `useFetchKey` — tiny state helper

```tsx
const [fetchKey, updateFetchKey] = useFetchKey();
```

`useFetchKey` (from `backend.ai-ui`) returns `[fetchKey, updateFetchKey, INITIAL_FETCH_KEY]`. Most call sites destructure the first two; pages that need to detect the initial render also pull in the third element to compare against `fetchKey` (e.g. switching `fetchPolicy` between `'store-and-network'` and `'network-only'`). The tuple shape mimics `useState` so call sites read naturally.

### 3.3 `useCurrentProject` — context selector

```tsx
const currentProject = useCurrentProjectValue();
const [resourceGroup, setResourceGroup] = useCurrentResourceGroupState();
```

Split read vs read-write variants: `useXValue` for read-only, `useXState` for
pair. Matches the Jotai convention.

### 3.4 `useControllableState` — controllable prop pattern

When a BUI component should support both controlled and uncontrolled modes,
use `useControllableState` (already in `react/src/hooks/`):

```tsx
const [value, setValue] = useControllableState({
  value: props.value,
  defaultValue: props.defaultValue,
  onChange: props.onChange,
});
```

## 4. Parameterization: what goes in arguments

| Kind | Where | Example |
|---|---|---|
| Configuration (rarely changes) | hook argument | `useFoo({ scope: 'global' })` |
| Per-call inputs | returned function's argument | `startSession(values)` |
| Context (server, project) | resolved inside the hook | `useSuspendedBackendaiClient()` inside |
| Callbacks (success / error) | on the returned function | or resolved via hook-owned notification |

Avoid making the hook signature reflect every callable option — prefer a
returned object of methods with their own signatures. Callers can destructure.

## 5. `useEffectEvent` — effect-internal helpers

React 19.2+ `useEffectEvent` separates "what triggers the effect" from "what
the effect does". Use it when you've been tempted to disable
`react-hooks/exhaustive-deps` to omit a callback.

```tsx
import { useEffect, useEffectEvent } from 'react';

const Child = ({ data, onLoaded }: Props) => {
  // Reads latest onLoaded without forcing it into deps
  const onResolved = useEffectEvent(() => {
    if (data) onLoaded(data);
  });

  useEffect(() => {
    onResolved();
  }, [data]);   // truly the only reactive dep
};
```

Rules (from `.claude/rules/use-effect-event.md`):

- Only call inside `useEffect` / `useLayoutEffect` / `useInsertionEffect`.
- Don't pass to JSX as `onClick` etc.
- Don't use to bypass legitimate dependencies — only for
  closures-the-effect-calls-but-doesn't-sync-on.
- Don't introduce new `ahooks` `useMemoizedFn`. Remove it when you see it
  nearby — `useEffectEvent` is the modern replacement.

## 6. Move-don't-abstract

Before spawning a hook, consider if the logic wants to live closer to where
it's used, not further. `SharedMemoryFormItems` (FR-1492 #4303) was extracted
from `ResourceAllocationFormItems` not to hide logic but because it had grown
into an independent concern.

Good signs for moving code into a hook:

- The caller only needs the return value, not the intermediate states
- Pulling it out reduces `useState` count in the caller
- Tests become easier (hook-level Jest vs component-level RTL)

Bad signs (don't extract yet):

- You'd have to pass 4+ args to reconstruct the closure
- Caller still needs to mirror the state for rendering
- The "hook" is really one `useMemo` wrapping a pure function

## 7. Testing hooks

Place Jest tests at `react/src/hooks/__tests__/useFoo.test.tsx` or colocated
as `useFoo.test.tsx`. Use `@testing-library/react`'s `renderHook`:

```tsx
import { renderHook, act } from '@testing-library/react';

const { result } = renderHook(() => useFetchKey());
act(() => { result.current[1](); });
expect(result.current[0]).not.toBe(INITIAL_FETCH_KEY);
```

For hooks that call Relay, use `RelayEnvironmentProvider` with a test env —
see `useControllableState.test.ts` for a mock environment example.

## 8. Returning JSX from a hook

Fine when the hook owns an overlay/notification pattern. Naming stays
`useX` (not `renderX`):

```tsx
export const useDeleteConfirm = () => {
  const { modal } = App.useApp();
  const confirm = (opts: Opts) => modal.confirm({ ... });
  return { confirm };
};
```

If a hook would return a full `<Component/>`, reconsider — that usually wants
to be a component, not a hook.

## Related Skills

- **`react-component-basics`** — base file layout and when logic stays inline
- **`react-async-actions`** — batch-operation hooks (`useStartSession` pattern)
- **`react-form`** — extracting `*FormItems` component groups
- **`relay-patterns`** — hooks that wrap Relay queries / mutations

## 9. Verification Checklist

- [ ] Hook uses at least one React hook internally (else it's a helper function).
- [ ] Named `use*` matching what it returns/does.
- [ ] `'use memo'` at the start of the hook body when it contains non-trivial work.
- [ ] Collects its own context (`useTranslation`, clients, atoms) — caller doesn't have to pass `t`.
- [ ] Returns a named object (not a tuple, unless mimicking `useState`).
- [ ] Effect dependencies are only values the effect truly syncs on; callbacks closed over via `useEffectEvent`.
- [ ] No `// eslint-disable-next-line react-hooks/exhaustive-deps`.
- [ ] No new `ahooks` `useMemoizedFn` introduced.
- [ ] Colocated with feature if feature-specific; under `react/src/hooks/` if cross-cutting.
- [ ] Has a Jest test when it owns non-trivial state or side-effects.
