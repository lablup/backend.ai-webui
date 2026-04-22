---
description: When writing or editing React components and hooks that need memoization
---

# React Compiler Memoization Rule

This project runs **React 19.2** with **`babel-plugin-react-compiler` in annotation mode**. Memoization is the React Compiler's job, not the developer's. Do not reach for `useMemo` / `useCallback` as a first instinct — add the `'use memo'` directive to the component or hook body instead, and write plain values and plain functions.

## Why

1. The compiler analyzes dependencies and inserts caching automatically, including cases that are hard or impossible to express with manual `useMemo` / `useCallback` dependency arrays (e.g., stable references across conditional code paths, partial memoization of branches).
2. Manual dependency arrays drift out of sync as code evolves — the compiler's view is always up to date with the code it compiles.
3. `useCallback` cascades: wrapping one function in `useCallback` forces every caller that depends on its identity (child components, other hooks) to also memoize. The compiler breaks this cascade.
4. Inline arrow functions passed to JSX (`onClick`, `action`, etc.) are already memoized by the compiler under `'use memo'`; wrapping them is noise.
5. Consistent adoption across the codebase keeps the memoization story legible — reviewers don't have to decide case-by-case whether a given `useCallback` is load-bearing or ceremonial.

## Rules

1. **Add `'use memo'` at the top of every component body and every custom hook body** that would benefit from memoization. This is almost all of them. Never remove an existing `'use memo'` directive.
2. **Do not introduce `useMemo` or `useCallback`** in new code. Replace existing usages with plain values and plain functions when you touch them, and add `'use memo'` if the enclosing function doesn't already have it.
3. **Callbacks passed to JSX** (`onClick`, `onChange`, `action`, `onSubmit`, …) must be plain inline or named functions. The compiler memoizes them.
4. **Values derived from props / state** should be plain `const` declarations. If the derivation is expensive *and* measurably slow, consider extracting to a separate module or a hook — but still no `useMemo`.
5. **Exception — `useEffectEvent`**: when you need a callback inside an effect that should read the latest props/state without triggering re-runs, use `useEffectEvent` (see `use-effect-event.md`). This is complementary to `'use memo'` and does not replace it.
6. **Exception — identity-sensitive external APIs**: if a third-party API requires a stable reference across renders (e.g., a subscription that can only be installed once), prefer `useRef` or an effect-scoped closure over `useCallback`. `useCallback`'s identity guarantees are still weaker than the compiler's.

## Pattern

### ✅ Correct — plain functions, `'use memo'` directive

```tsx
const UserProfile: React.FC<Props> = ({ user, onSelect }) => {
  'use memo';
  const { t } = useTranslation();

  const fullName = `${user.firstName} ${user.lastName}`;

  const handleClick = () => {
    onSelect(user.id);
  };

  return (
    <button onClick={handleClick}>
      {t('userProfile.Greet', { name: fullName })}
    </button>
  );
};
```

### ✅ Correct — custom hook with plain returned functions

```tsx
export const useSomething = (): [Value, (next: Value) => void] => {
  'use memo';
  const [value, setValue] = useState<Value>(initial);

  const update = (next: Value) => {
    setValue(next);
    // side effects here, reading latest closure values
  };

  return [value, update];
};
```

### ❌ Wrong — manual `useCallback` wrapping a simple handler

```tsx
const UserProfile: React.FC<Props> = ({ user, onSelect }) => {
  // no 'use memo'
  const handleClick = useCallback(() => {
    onSelect(user.id);
  }, [onSelect, user.id]);

  return <button onClick={handleClick}>...</button>;
};
```

### ❌ Wrong — `useMemo` for trivial derivations

```tsx
const UserProfile: React.FC<Props> = ({ user }) => {
  // no 'use memo'
  const fullName = useMemo(
    () => `${user.firstName} ${user.lastName}`,
    [user.firstName, user.lastName],
  );
  return <span>{fullName}</span>;
};
```

## Migration

When editing a file that contains `useMemo` or `useCallback`:

1. Add `'use memo'` to the enclosing component / hook body if it is not already there.
2. Unwrap each `useMemo(() => expr, deps)` into `const value = expr;`.
3. Unwrap each `useCallback(fn, deps)` into the original function body, as a plain `const fn = (...)` or inline in JSX.
4. Drop the `useMemo` / `useCallback` import if it becomes unused.
5. Run `bash scripts/verify.sh` — the React Compiler is part of the build pipeline; if the compiler cannot safely memoize something (e.g., mutation in a closure), the lint rule `react-hooks/*` or the build itself will surface the problem.

## Verification

After editing a memoization-relevant file, confirm:

- `'use memo'` appears on the first line of the component / hook body.
- No new `useMemo` or `useCallback` imports or calls were introduced.
- `bash scripts/verify.sh` passes — the compiler is exercised during `pnpm run lint` and the TypeScript build.
- For hooks: existing call sites still behave correctly. The compiler's output is observably equivalent to the hand-rolled version in almost every case; if not, the compiler surfaces a diagnostic.

## Related

- `use-effect-event.md` — companion rule for the `useEffectEvent` primitive used inside effects.
- `CLAUDE.md` → "React Essentials" — project-wide React conventions, including the `'use memo'` requirement.
