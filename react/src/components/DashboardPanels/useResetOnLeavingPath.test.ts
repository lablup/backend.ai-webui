/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useResetOnLeavingPath } from './useResetOnLeavingPath';
import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

describe('useResetOnLeavingPath', () => {
  afterEach(() => window.history.replaceState(null, '', '/'));

  it('resets when the page path changed before unmount', () => {
    window.history.replaceState(null, '', '/admin/dashboard');
    const reset = vi.fn();
    const { unmount } = renderHook(() => useResetOnLeavingPath(reset));
    window.history.pushState(null, '', '/admin/session');
    unmount();
    expect(reset).toHaveBeenCalledTimes(1);
  });

  it('keeps the state when remounted on the same path (a refresh or a query change)', () => {
    window.history.replaceState(null, '', '/admin/dashboard');
    const reset = vi.fn();
    const { unmount } = renderHook(() => useResetOnLeavingPath(reset));
    window.history.pushState(null, '', '/admin/dashboard?board=2');
    unmount();
    expect(reset).not.toHaveBeenCalled();
  });
});
