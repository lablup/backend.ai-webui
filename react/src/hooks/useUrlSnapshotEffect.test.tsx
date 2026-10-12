/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * `useUrlSnapshotEffect` queries the URL whenever it describes a state the
 * page has not queried, and withholds that until nuqs' query state agrees
 * with the address bar: nuqs applies external changes in a transition, so a
 * render can still carry the departed entry's params after the address bar
 * has moved (FR-3387). That window is not guaranteed to occur, only
 * tolerated, so the cases below drive it by hand.
 */
import { useUrlSnapshotEffect } from '.';
import { renderHook } from '@testing-library/react';
import { useRef } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockUseOptimisticSearchParams = vi.fn();

vi.mock('nuqs/adapters/react-router/v6', () => ({
  useOptimisticSearchParams: () => mockUseOptimisticSearchParams(),
}));

type Snapshot = { tab: string; status: string; order: string | null };

/** nuqs hands out a fresh object every time its parsed state moves. */
const nuqsRendersWith = (search: string) => {
  mockUseOptimisticSearchParams.mockReturnValue(new URLSearchParams(search));
};

/** The page as the hook sees it: the snapshot parsed from the URL. */
const parse = (search: string): Snapshot => {
  const params = new URLSearchParams(search);
  return {
    tab: params.get('tab') ?? 'users',
    status: params.get('status') ?? 'ACTIVE',
    order: params.get('order'),
  };
};

const renderPage = () => {
  const onSettled = vi.fn();
  const hook = renderHook(
    ({ search }: { search: string }) => {
      // The page records what it queried, as loadTabQuery does.
      const queriedRef = useRef<Snapshot | null>(null);
      const snapshot = parse(search);
      useUrlSnapshotEffect(snapshot, queriedRef, () => {
        queriedRef.current = snapshot;
        onSettled(snapshot);
      });
      return queriedRef;
    },
    { initialProps: { search: '?tab=users' } },
  );
  return { onSettled, ...hook };
};

describe('useUrlSnapshotEffect', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '?tab=users');
    nuqsRendersWith('?tab=users');
  });

  it('queries the URL once on mount, StrictMode re-runs included', () => {
    const { onSettled, rerender } = renderPage();
    expect(onSettled).toHaveBeenCalledTimes(1);
    expect(onSettled).toHaveBeenLastCalledWith(parse('?tab=users'));

    rerender({ search: '?tab=users' });
    expect(onSettled).toHaveBeenCalledTimes(1);
  });

  it('stays silent while nuqs has not caught up with the address bar', () => {
    const { onSettled, rerender } = renderPage();

    // An in-app link moved the address bar; nuqs still renders the old entry.
    window.history.pushState({}, '', '?tab=credentials');
    nuqsRendersWith('?tab=users');
    rerender({ search: '?tab=users' });

    expect(onSettled).toHaveBeenCalledTimes(1);
  });

  it('queries another tab, or other filters on the same tab, once nuqs agrees', () => {
    const { onSettled, rerender } = renderPage();

    window.history.pushState({}, '', '?tab=credentials');
    nuqsRendersWith('?tab=credentials');
    rerender({ search: '?tab=credentials' });
    expect(onSettled).toHaveBeenCalledTimes(2);
    expect(onSettled).toHaveBeenLastCalledWith(parse('?tab=credentials'));

    // No popstate is involved: the same tab with another filter counts too.
    window.history.pushState({}, '', '?tab=credentials&status=INACTIVE');
    nuqsRendersWith('?status=INACTIVE&tab=credentials');
    rerender({ search: '?tab=credentials&status=INACTIVE' });
    expect(onSettled).toHaveBeenCalledTimes(3);
    expect(onSettled).toHaveBeenLastCalledWith(
      parse('?tab=credentials&status=INACTIVE'),
    );

    // The change is consumed: later renders must not replay it.
    rerender({ search: '?tab=credentials&status=INACTIVE' });
    expect(onSettled).toHaveBeenCalledTimes(3);
  });

  it("stays silent for the page's own writes, which it queried first", () => {
    const { onSettled, rerender, result } = renderPage();

    // onTabChange: query, record, then mirror to the URL. nuqs updates at
    // once and flushes the address bar after a throttle.
    result.current.current = parse('?tab=credentials&status=INACTIVE');
    nuqsRendersWith('?tab=credentials&status=INACTIVE');
    rerender({ search: '?tab=credentials&status=INACTIVE' });
    window.history.replaceState({}, '', '?tab=credentials&status=INACTIVE');
    rerender({ search: '?tab=credentials&status=INACTIVE' });

    expect(onSettled).toHaveBeenCalledTimes(1);
  });

  it('treats an absent value as equal whether it is null or undefined', () => {
    const { onSettled, rerender, result } = renderPage();

    // A child reload mirrors `order: undefined`; the URL parses it as null.
    result.current.current = { tab: 'users', status: 'ACTIVE' } as Snapshot;
    rerender({ search: '?tab=users' });

    expect(onSettled).toHaveBeenCalledTimes(1);
  });
});
