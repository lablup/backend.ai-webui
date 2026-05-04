/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
// jest-dom adds custom matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '../__test__/matchMedia.mock.cjs';
import '@testing-library/jest-dom';
// Expose `vi` under the global name `jest` so `@testing-library/dom`'s
// `waitFor` detects "Jest fake timers are active" and switches to its
// timer-aware polling path. Without this, tests that combine
// `vi.useFakeTimers()` with `await waitFor(...)` hang — waitFor's default
// polling uses `setTimeout`, which never fires under faked timers.
// (None of our test code references `jest.*` directly anymore; this is
// purely a `@testing-library/dom` integration hook.)
import { vi } from 'vitest';

(globalThis as any).jest = vi;

// Polyfill fetch for jsdom environment
if (typeof global.fetch === 'undefined') {
  global.fetch = () =>
    Promise.resolve({
      json: () => Promise.resolve({}),
      text: () => Promise.resolve(''),
      ok: true,
      status: 200,
    } as Response);
}
