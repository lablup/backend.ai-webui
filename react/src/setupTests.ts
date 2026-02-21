/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '../__test__/matchMedia.mock.cjs';
import '@testing-library/jest-dom';

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
