// Vitest ↔ Jest compatibility shim for the repo-root `/src` and `/scripts`
// test suites (FR-2609).
//
// Mirrors the shims in `react/__test__/vitest.jest-compat.ts` and
// `packages/backend.ai-ui/__test__/vitest.jest-compat.ts`. New tests should
// use `vi.*` directly; this is a migration aid.
import { vi } from "vitest";

// `globals: true` in vitest.config.ts exposes `vi`/`describe`/`test`/etc as
// globals. This line ALSO exposes `vi` as `jest` so prior Jest-style calls
// (`jest.fn()`, `jest.spyOn()`, etc.) still resolve.
// NOTE: `jest.mock()` calls are NOT hoisted by Vitest — only literal
// `vi.mock()` is. Any test using `jest.mock()` must migrate to `vi.mock()`.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).jest = vi;
