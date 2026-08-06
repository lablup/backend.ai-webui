/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useBrowserNavigatedQueryEffect } from '.';
import { renderHook, act } from '@testing-library/react';

const WATCHED_KEYS = ['tab', 'filter'];

const goTo = (search: string) => {
  window.history.pushState({}, '', search);
};

describe('useBrowserNavigatedQueryEffect', () => {
  beforeEach(() => {
    goTo('?tab=users');
  });

  it('runs the callback when a browser navigation changes a watched key', () => {
    const onNavigated = vi.fn();
    const { rerender } = renderHook(() =>
      useBrowserNavigatedQueryEffect(WATCHED_KEYS, onNavigated),
    );

    act(() => {
      goTo('?tab=credentials');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    // The callback runs on the commit that follows the navigation; in the app
    // the router's own state update is what schedules it.
    rerender();

    expect(onNavigated).toHaveBeenCalledTimes(1);

    // The navigation is consumed: a later app-driven URL write must not
    // replay it.
    act(() => {
      goTo('?tab=credentials&filter=email');
    });
    rerender();
    expect(onNavigated).toHaveBeenCalledTimes(1);
  });

  it('stays silent for the app-s own URL writes and for unwatched keys', () => {
    const onNavigated = vi.fn();
    const { rerender } = renderHook(() =>
      useBrowserNavigatedQueryEffect(WATCHED_KEYS, onNavigated),
    );

    // pushState / replaceState never emit popstate, so this is invisible.
    act(() => {
      goTo('?tab=credentials');
    });
    rerender();
    expect(onNavigated).not.toHaveBeenCalled();

    // A navigation that leaves every watched key alone is not worth a reload.
    act(() => {
      goTo('?tab=credentials&unwatched=1');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    expect(onNavigated).not.toHaveBeenCalled();
  });
});
