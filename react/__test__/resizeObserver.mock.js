/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
// Minimal ResizeObserver stub for jsdom (used by rc-resize-observer inside
// antd components such as Space.Compact / Button wave effects).
if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}
