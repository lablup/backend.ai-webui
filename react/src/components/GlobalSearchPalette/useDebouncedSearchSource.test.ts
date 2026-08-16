/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { SearchHit } from './types';
import {
  SEARCH_DEBOUNCE_MS,
  useDebouncedSearchSource,
} from './useDebouncedSearchSource';
import type { GlobalSearchSource } from './useGlobalSearchSource';
import { act, renderHook } from '@testing-library/react';
import * as _ from 'lodash-es';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const hitOf = (id: string): SearchHit =>
  ({
    id,
    label: id,
    kind: 'page',
    menuKey: null,
    scope: null,
    labelKey: '',
    breadcrumbKeys: [],
    group: 'Workload',
    target: { path: `/${id}` },
    keywords: [],
    bodyKeys: [],
    auxiliaryData: { group: 'Workload' },
  }) as SearchHit;

const makeSource = () => {
  const search = vi.fn((query: string) => [hitOf(query)]);
  const bootstrap = vi.fn(() => [hitOf('bootstrap')]);
  const source: GlobalSearchSource = {
    search,
    bootstrap,
    getHit: (id: string) => hitOf(id),
  };
  return { source, search, bootstrap };
};

describe('useDebouncedSearchSource', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('runs the underlying search once, for the last query of a burst', async () => {
    const { source, search } = makeSource();
    const { result } = renderHook(() => useDebouncedSearchSource(source));

    const rows = [
      result.current.search('s'),
      result.current.search('se'),
      result.current.search('ses'),
    ];
    expect(search).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS);
    });

    expect(search).toHaveBeenCalledTimes(1);
    expect(search).toHaveBeenCalledWith('ses');
    // Superseded calls resolve too — with the newest query's rows, so no
    // promise dangles and no intermediate empty list reaches the palette.
    expect(_.map(await Promise.all(rows), (row) => row[0]?.id)).toEqual([
      'ses',
      'ses',
      'ses',
    ]);
  });

  it('does not delay bootstrap or getHit', async () => {
    const { source, bootstrap } = makeSource();
    const { result } = renderHook(() => useDebouncedSearchSource(source));

    expect(_.map(await result.current.bootstrap(), 'id')).toEqual([
      'bootstrap',
    ]);
    expect(bootstrap).toHaveBeenCalledTimes(1);
    expect(result.current.getHit('page:/session')?.id).toBe('page:/session');
  });

  it('drops a pending search when the palette cancels', async () => {
    const { source, search } = makeSource();
    const { result } = renderHook(() => useDebouncedSearchSource(source));

    const pending = result.current.search('ses');
    result.current.cancel?.();

    await act(async () => {
      vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS);
    });

    expect(search).not.toHaveBeenCalled();
    expect(await pending).toEqual([]);
  });
});
