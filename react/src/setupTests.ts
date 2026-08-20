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
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

(globalThis as any).jest = vi;

// `isolate: false` shares the source-module registry across test files, so a
// file's `vi.mock` never reaches an importer another file already evaluated.
// This setup file re-runs before each test file: dropping the source-module
// cache here restores per-file mock semantics while keeping the shared jsdom
// environment and transform caches that make no-isolate fast.
vi.resetModules();

// Non-React residue survives RTL cleanup in the shared environment (Astryx's
// live-region singleton nodes, scroll-lock leftovers, body/html attributes):
// start each file with the pristine document a fresh jsdom would give it.
// Astryx re-attaches its live regions on the next announcement, so removal is safe.
if (typeof document !== 'undefined') {
  document.body.replaceChildren();
  for (const el of [document.body, document.documentElement]) {
    for (const { name } of Array.from(el.attributes)) {
      el.removeAttribute(name);
    }
  }
  // Web storage is per-jsdom under isolation; keep that per-file guarantee.
  localStorage.clear();
  sessionStorage.clear();
}

// RTL's auto-cleanup registers its afterEach at module-import time, which the
// shared module registry of `isolate: false` only executes for the first test
// file per worker — register it explicitly so every file unmounts its DOM.
afterEach(() => {
  cleanup();
});

// jsdom implements `<dialog>` as an element but not its modal API, so any
// component built on Astryx `Dialog` (every `BAIModalAstryx`, drawer and
// popover-dialog) throws `dialog.showModal is not a function` the moment it
// mounts open. Give the element the three methods Astryx calls and keep the
// `open` attribute in sync, which is what testing-library queries see.
if (typeof HTMLDialogElement !== 'undefined') {
  const proto = HTMLDialogElement.prototype as HTMLDialogElement & {
    showModal?: () => void;
    show?: () => void;
    close?: (returnValue?: string) => void;
  };
  if (typeof proto.showModal !== 'function') {
    proto.showModal = function showModal(this: HTMLDialogElement) {
      this.open = true;
    };
  }
  if (typeof proto.show !== 'function') {
    proto.show = function show(this: HTMLDialogElement) {
      this.open = true;
    };
  }
  if (typeof proto.close !== 'function') {
    proto.close = function close(
      this: HTMLDialogElement,
      returnValue?: string,
    ) {
      this.open = false;
      if (returnValue !== undefined) {
        this.returnValue = returnValue;
      }
      this.dispatchEvent(new Event('close'));
    };
  }
}

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
