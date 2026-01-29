// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import './src/__test__/matchMedia.mock';
import '@testing-library/jest-dom';

// Mock ResizeObserver for Ant Design v6 components
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

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
