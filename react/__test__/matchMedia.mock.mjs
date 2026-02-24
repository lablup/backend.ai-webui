/**
 * Mock for window.matchMedia() used in tests.
 * Provides a mock implementation of the matchMedia API for Jest tests.
 */

// Setup matchMedia mock before tests run
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
}

export {}; // Make this an ES module
