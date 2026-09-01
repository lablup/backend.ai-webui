// jest-dom adds custom matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import './src/__test__/matchMedia.mock.cjs';
import '@testing-library/jest-dom';
// Expose `vi` under the global name `jest` so `@testing-library/dom`'s
// `waitFor` detects "Jest fake timers are active" and switches to its
// timer-aware polling path. Without this, tests that combine
// `vi.useFakeTimers()` with `await waitFor(...)` hang — waitFor's default
// polling uses `setTimeout`, which never fires under faked timers.
// (None of our test code references `jest.*` directly anymore; this is
// purely a `@testing-library/dom` integration hook.)
import { vi } from 'vitest';

// The `@rc-component/motion` transitionend auto-completer that used to live
// here is gone (to-astryx final switch).
//
// It existed because antd v6's Modal / Drawer / Button-loading-icon animated
// through rc-motion, which waits for a real `transitionend` that jsdom never
// dispatches, leaving those components stuck in their active phase past every
// `waitFor` timeout. A MutationObserver watched the whole document for
// `*-(leave|enter|appear)-active` classes and fired a synthetic event.
//
// antd is uninstalled, so nothing in the tree produces those classes any more,
// and the observer ran on every class mutation in every BUI test for no
// subject. Astryx's own overlay surfaces are native `<dialog>` / `[popover]`
// elements — their jsdom gap is the method polyfill below, not animation.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).jest = vi;

// Polyfill the native <dialog> API for jsdom (to-astryx phase 3 / ticket B).
//
// Astryx `Dialog` renders a real <dialog> and calls `showModal()` / `close()`
// in an effect; jsdom implements the element but none of its methods, so such a
// test throws "dialog.showModal is not a function" during the passive-effect
// commit. Since FR-3578 the modal family goes through `BAIDialogPortal`
// instead, so this now covers only surfaces still on the native element — the
// lab `Drawer` and a direct `Dialog` render.
//
// The polyfill reproduces the observable contract the component depends on:
// `open` flips, `close` is dispatched, and `returnValue` is recorded. The
// top-layer/backdrop/focus-trap behaviour is a browser concern that jsdom
// cannot model either way, so it is deliberately not simulated.
if (
  typeof HTMLDialogElement !== 'undefined' &&
  typeof HTMLDialogElement.prototype.showModal !== 'function'
) {
  HTMLDialogElement.prototype.show = function show(this: HTMLDialogElement) {
    this.open = true;
  };
  HTMLDialogElement.prototype.showModal = function showModal(
    this: HTMLDialogElement,
  ) {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function close(
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

// Mock ResizeObserver for Ant Design v6 components
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock MessageChannel. Originally for antd's Form (`@rc-component/form`
// scheduled its batched updates through one); the self-hosted form engine that
// replaced it batches on macrotasks instead, but React's own scheduler still
// probes for MessageChannel, so the mock stays as a general jsdom polyfill.
if (typeof global.MessageChannel === 'undefined') {
  class MockMessagePort {
    onmessage: ((event: { data: unknown }) => void) | null = null;
    postMessage(data: unknown) {
      // Use queueMicrotask for more accurate async simulation
      queueMicrotask(() => {
        if (this.onmessage) {
          this.onmessage({ data });
        }
      });
    }
    start() {}
    close() {}
    addEventListener() {}
    removeEventListener() {}
    dispatchEvent() {
      return true;
    }
  }

  class MockMessageChannel {
    port1: MockMessagePort;
    port2: MockMessagePort;
    constructor() {
      this.port1 = new MockMessagePort();
      this.port2 = new MockMessagePort();
      // Connect ports for bidirectional communication
      const self = this;
      this.port1.postMessage = (data: unknown) => {
        queueMicrotask(() => {
          if (self.port2.onmessage) {
            self.port2.onmessage({ data });
          }
        });
      };
      this.port2.postMessage = (data: unknown) => {
        queueMicrotask(() => {
          if (self.port1.onmessage) {
            self.port1.onmessage({ data });
          }
        });
      };
    }
  }

  global.MessageChannel =
    MockMessageChannel as unknown as typeof MessageChannel;
}
