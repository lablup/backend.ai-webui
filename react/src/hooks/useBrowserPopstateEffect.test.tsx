/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * `useBrowserPopstateEffect` is the most delicate assembly in the page-owned
 * keyed-snapshot pilot (FR-3387). A `popstate` arms a ref, and the callback is
 * held back until nuqs' query state — applied inside a transition, so it lags
 * the address bar by at least one render — describes the entry the user
 * navigated to. The three cases below pin that state machine: silent while
 * nuqs lags, exactly one call on the render it catches up, and silent for the
 * page's own `setQueryParams` writes.
 */
import { useBrowserPopstateEffect } from '.';
import { renderHook, act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockUseOptimisticSearchParams = vi.fn();

vi.mock('nuqs/adapters/react-router/v6', () => ({
  useOptimisticSearchParams: () => mockUseOptimisticSearchParams(),
}));

/** nuqs hands out a fresh object every time its parsed state moves. */
const nuqsRendersWith = (search: string) => {
  mockUseOptimisticSearchParams.mockReturnValue(new URLSearchParams(search));
};

/** Back/forward: the address bar moves first, and only then nuqs follows. */
const browserNavigatesTo = (search: string) => {
  window.history.replaceState({}, '', search);
  window.dispatchEvent(new PopStateEvent('popstate'));
};

describe('useBrowserPopstateEffect', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.replaceState({}, '', '?tab=users');
    nuqsRendersWith('?tab=users');
  });

  it('stays silent while nuqs has not caught up with the address bar', () => {
    const onSettled = vi.fn();
    const { rerender } = renderHook(() => useBrowserPopstateEffect(onSettled));

    act(() => {
      browserNavigatesTo('?tab=credentials');
    });
    // The transition renders once more with the departed entry's params.
    nuqsRendersWith('?tab=users');
    rerender();

    expect(onSettled).not.toHaveBeenCalled();
  });

  it('fires exactly once, on the render where nuqs catches up', () => {
    const onSettled = vi.fn();
    const { rerender } = renderHook(() => useBrowserPopstateEffect(onSettled));

    act(() => {
      browserNavigatesTo('?tab=credentials&status=INACTIVE');
    });
    nuqsRendersWith('?tab=users');
    rerender();
    expect(onSettled).not.toHaveBeenCalled();

    // Key order is not a difference — the hook compares sorted params.
    nuqsRendersWith('?status=INACTIVE&tab=credentials');
    rerender();
    expect(onSettled).toHaveBeenCalledTimes(1);

    // The navigation is consumed: later renders must not replay it.
    nuqsRendersWith('?status=INACTIVE&tab=credentials');
    rerender();
    expect(onSettled).toHaveBeenCalledTimes(1);
  });

  it("stays silent for the page's own query-param writes", () => {
    const onSettled = vi.fn();
    const { rerender } = renderHook(() => useBrowserPopstateEffect(onSettled));

    // `setQueryParams` updates nuqs and writes the URL through
    // `pushState`/`replaceState`, neither of which emits `popstate`.
    act(() => {
      window.history.replaceState({}, '', '?tab=users&filter=email');
    });
    nuqsRendersWith('?tab=users&filter=email');
    rerender();

    expect(onSettled).not.toHaveBeenCalled();
  });
});
