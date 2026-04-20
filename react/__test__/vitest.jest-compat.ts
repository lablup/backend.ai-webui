// Vitest ↔ Jest compatibility shim for the FR-2609 migration.
//
// Instead of renaming every `jest.fn()`, `jest.mock()`, `jest.spyOn()` etc.
// call across ~39 test files in react/src, we expose `vi` under the name
// `jest` so existing tests run as-is. Newly authored tests should use `vi.*`
// directly — this shim is a migration aid, not a long-term convention.
//
// Vitest's `vi` object is mostly a drop-in for Jest:
//   - `jest.fn` → `vi.fn`
//   - `jest.mock` → `vi.mock` (behaviour is equivalent; hoisting rules differ
//     in corner cases around using captured variables in the factory)
//   - `jest.spyOn` → `vi.spyOn`
//   - `jest.useFakeTimers` / `jest.useRealTimers` → `vi.useFakeTimers` /
//     `vi.useRealTimers` (defaults differ slightly; see vitest docs)
//   - `jest.resetAllMocks` / `jest.clearAllMocks` / `jest.restoreAllMocks` →
//     `vi.resetAllMocks` / `vi.clearAllMocks` / `vi.restoreAllMocks`
//
// For APIs without a direct `vi` equivalent (e.g. `jest.requireActual`),
// the offending call will throw at test time and we fix it inline there.
import { vi } from 'vitest';

// `globals: true` in vitest.config.ts already exposes `vi` as a global.
// The line below ALSO exposes it as `jest` so prior Jest-style calls still
// resolve. Both globals co-exist; no name collision since `jest` is not
// otherwise defined under Vitest.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).jest = vi;
