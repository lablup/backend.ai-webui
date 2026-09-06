/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * `useBrowserPopstateEffect` exists so a caller can read its own nuqs state
 * inside the callback (FR-3387). nuqs applies `popstate` in a transition, so a
 * render can still carry the departed entry's params after the address bar has
 * moved — the hook's job is to withhold the callback until the two agree. That
 * window is not guaranteed to occur, only tolerated, so the cases below drive
 * it by hand.
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
    window.history.replaceState({}, '', '?tab=users');
    nuqsRendersWith('?tab=users');
  });

  it('stays silent while nuqs has not caught up with the address bar', () => {
    const onSettled = vi.fn();
    const { rerender } = renderHook(() => useBrowserPopstateEffect(onSettled));

    act(() => {
      browserNavigatesTo('?tab=credentials');
    });
    // A render still carrying the departed entry's params must not release it.
    nuqsRendersWith('?tab=users');
    rerender();

    expect(onSettled).not.toHaveBeenCalled();
  });

  it("fires exactly once, once nuqs' params match the address bar", () => {
    const onSettled = vi.fn();
    const { rerender } = renderHook(() => useBrowserPopstateEffect(onSettled));

    act(() => {
      browserNavigatesTo('?tab=credentials&status=INACTIVE');
    });
    nuqsRendersWith('?tab=users');
    rerender();
    expect(onSettled).not.toHaveBeenCalled();

    // Key order is not a difference.
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
    window.history.replaceState({}, '', '?tab=users&filter=email');
    nuqsRendersWith('?tab=users&filter=email');
    rerender();

    expect(onSettled).not.toHaveBeenCalled();
  });
});
