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

// window/document listeners registered by one file (e.g. TabCount's anonymous
// `beforeunload`) would otherwise run with stale module state during later
// files' events. Wrap add/removeEventListener once per worker to track live
// registrations; each per-file re-run of this setup disposes the leftovers.
// Only project-code registrations are tracked: node_modules registrants (e.g.
// react-dom's once-per-document `selectionchange`) stay cached across files
// and would not re-register after removal.
type TrackedListener = {
  type: string;
  listener: EventListenerOrEventListenerObject | null;
  options?: boolean | AddEventListenerOptions;
  remove: EventTarget['removeEventListener'];
};
const listenerTracker: { installed: boolean; live: TrackedListener[] } = ((
  globalThis as any
).__baiTestListenerTracker ??= { installed: false, live: [] });
if (!listenerTracker.installed && typeof document !== 'undefined') {
  listenerTracker.installed = true;
  const captureOf = (options?: boolean | AddEventListenerOptions) =>
    typeof options === 'boolean' ? options : !!options?.capture;
  // globalThis and window can hold distinct copies of the same methods.
  for (const holder of new Set<EventTarget>([
    globalThis as unknown as EventTarget,
    window,
    document,
  ])) {
    const originalAdd = holder.addEventListener.bind(holder);
    const originalRemove = holder.removeEventListener.bind(holder);
    holder.addEventListener = (
      type: string,
      listener: EventListenerOrEventListenerObject | null,
      options?: boolean | AddEventListenerOptions,
    ) => {
      // Stack frame 0 is "Error", 1 is this wrapper; 2 is the registrant.
      const caller = (new Error().stack ?? '').split('\n')[2] ?? '';
      if (!caller.includes('node_modules')) {
        listenerTracker.live.push({
          type,
          listener,
          options,
          remove: originalRemove,
        });
      }
      originalAdd(type, listener, options);
    };
    holder.removeEventListener = (
      type: string,
      listener: EventListenerOrEventListenerObject | null,
      options?: boolean | EventListenerOptions,
    ) => {
      const index = listenerTracker.live.findIndex(
        (entry) =>
          entry.remove === originalRemove &&
          entry.type === type &&
          entry.listener === listener &&
          captureOf(entry.options) === captureOf(options),
      );
      if (index !== -1) {
        listenerTracker.live.splice(index, 1);
      }
      originalRemove(type, listener, options);
    };
  }
}
for (const entry of listenerTracker.live.splice(0)) {
  entry.remove(entry.type, entry.listener, entry.options);
}

// RTL's auto-cleanup registers its afterEach at module-import time, which the
// shared module registry of `isolate: false` only executes for the first test
// file per worker — register it explicitly so every file unmounts its DOM.
afterEach(() => {
  cleanup();
});

// jsdom implements `<dialog>` as an element but not its modal API; Astryx
// `Dialog` and the lab `Drawer` call showModal/show/close the moment they mount.
// Mirrors `packages/backend.ai-ui/setupTests.ts` — keep the two in step.
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
