// Vitest ↔ Jest compatibility shim for the BUI package (FR-2609).
//
// BUI tests still use `jest.fn()`, `jest.mock()`, `jest.spyOn()` etc. Rather
// than rename every call site, we expose `vi` under the name `jest` so
// existing tests run unchanged. New tests should use `vi.*` directly.
//
// Mirrors `react/__test__/vitest.jest-compat.ts`.
import { vi } from 'vitest';

// `globals: true` in vitest.config.ts exposes `vi`/`describe`/`test`/etc as
// globals. This line ALSO exposes `vi` as `jest` so prior Jest-style calls
// still resolve.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).jest = vi;
