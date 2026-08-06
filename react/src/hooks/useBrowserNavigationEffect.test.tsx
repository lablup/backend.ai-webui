/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useBrowserNavigationEffect } from '.';
import { renderHook, act } from '@testing-library/react';

describe('useBrowserNavigationEffect', () => {
  beforeEach(() => {
    window.history.pushState({}, '', '?tab=users');
  });

  it('runs the callback after a browser navigation, without waiting for another render', () => {
    const onNavigated = vi.fn();
    renderHook(() => useBrowserNavigationEffect(onNavigated));

    act(() => {
      window.history.pushState({}, '', '?tab=credentials');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    expect(onNavigated).toHaveBeenCalledTimes(1);

    act(() => {
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    expect(onNavigated).toHaveBeenCalledTimes(2);
  });

  it('stays silent for the app-s own URL writes', () => {
    const onNavigated = vi.fn();
    const { rerender } = renderHook(() =>
      useBrowserNavigationEffect(onNavigated),
    );

    // pushState / replaceState never emit popstate.
    act(() => {
      window.history.pushState({}, '', '?tab=credentials');
      window.history.replaceState({}, '', '?tab=credentials&filter=email');
    });
    rerender();

    expect(onNavigated).not.toHaveBeenCalled();
  });
});
