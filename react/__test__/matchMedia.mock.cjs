/**
 * matchMedia mock for Jest testing environment
 * 
 * This mock is loaded before tests run to provide a basic matchMedia implementation
 * for components that use media queries. It avoids direct jest.fn() calls at module
 * load time to work properly with ES modules.
 */

// Simple mock function that returns false for all queries
const mockMatchMedia = (query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: () => {}, // deprecated
  removeListener: () => {}, // deprecated
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => false,
});

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: mockMatchMedia,
});
