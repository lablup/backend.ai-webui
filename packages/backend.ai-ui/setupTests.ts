// Auto-complete `@rc-component/motion` (used by antd v6 Modal, Drawer,
// Button-loading-icon) animations under jsdom. rc-motion attaches a
// `transitionend` listener on each element that has a `-leave-active`,
// `-enter-active`, or `-appear-active` class, and waits for the browser to
// dispatch that event. jsdom does not run real CSS animations, so the
// event never fires; antd components then stay stuck in the active phase
// past `waitFor` timeouts.
//
// Jest's older jsdom didn't expose the vendor-prefixed style props that
// rc-motion probes for support detection, so its `supportTransition` flag
// resolved to false and the active-phase classes were applied
// synchronously — masking this issue. jsdom 29 (used by Vitest) exposes
// those props, so `supportTransition` is true and we have to manually fire
// the end event.
//
// Approach: a MutationObserver watches the whole document for class
// additions matching `*-(leave|enter|appear)-active`, and queues a
// microtask to dispatch a synthetic `transitionend` on the element. This
// is exactly what a real browser would do once the CSS transition
// completes — rc-motion's listener fires its `onInternalMotionEnd`
// callback, the active class gets removed, and the test sees the expected
// post-transition DOM.
if (typeof MutationObserver !== 'undefined' && typeof document !== 'undefined') {
  const ACTIVE_CLASS_RE = /(?:-(?:leave|enter|appear))-active(?:\s|$)/;
  const fireTransitionEnd = (el: Element) => {
    if (!(el instanceof HTMLElement)) return;
    const evt = new Event('transitionend', { bubbles: true });
    // rc-motion checks `event.target !== element` and `!event.deadline`
    // so the dispatch must come FROM the element itself.
    el.dispatchEvent(evt);
  };
  const checkAndFire = (el: Element) => {
    if (ACTIVE_CLASS_RE.test(el.className ?? '')) {
      queueMicrotask(() => fireTransitionEnd(el));
    }
  };
  const observer = new MutationObserver((records) => {
    for (const r of records) {
      if (r.type === 'attributes' && r.attributeName === 'class') {
        checkAndFire(r.target as Element);
      } else if (r.type === 'childList') {
        r.addedNodes.forEach((n) => {
          if (n instanceof Element) checkAndFire(n);
        });
      }
    }
  });
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
    subtree: true,
    childList: true,
  });
}

// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import './src/__test__/matchMedia.mock.cjs';
import '@testing-library/jest-dom';

// Mock ResizeObserver for Ant Design v6 components
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock MessageChannel for Ant Design Form (used by @rc-component/form)
// This provides a minimal mock that allows form internals to work
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

  global.MessageChannel = MockMessageChannel as unknown as typeof MessageChannel;
}
