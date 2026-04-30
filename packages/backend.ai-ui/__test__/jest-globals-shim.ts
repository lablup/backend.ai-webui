// `@jest/globals` re-export shim for Vitest (FR-2609).
//
// Some BUI tests import `{ describe, test, expect, jest }` from
// `'@jest/globals'`. Vitest's `globals: true` already makes these available
// as globals, and it also has direct named exports on `vitest` — but the
// two files that use this import style expect a module specifier of
// `@jest/globals`. The vitest.config alias maps that specifier to this file.
export {
  describe,
  test,
  it,
  expect,
  beforeAll,
  beforeEach,
  afterAll,
  afterEach,
  vi as jest,
} from 'vitest';
