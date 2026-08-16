/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { RecentSearchHit, SearchHit } from './types';
import {
  RECENT_SEARCH_HITS_LIMIT,
  useRecentSearchHits,
} from './useRecentSearchHits';
import { act, renderHook } from '@testing-library/react';
import * as _ from 'lodash-es';
import { beforeEach, describe, expect, it } from 'vitest';

// The real `useBAISetting` drags in `DefaultProviders`; the store is all this
// hook needs (same shape as the other setting-backed hook tests).
let store: Record<string, unknown> = {};
vi.mock('../../hooks/useBAISetting', () => ({
  useBAISettingUserState: (name: string) => [
    store[name],
    (value: unknown) => {
      store[name] = value;
    },
  ],
}));

const makeHit = (id: string, labelKey: string): SearchHit => ({
  id,
  label: labelKey,
  kind: 'page',
  menuKey: 'session',
  scope: 'project',
  labelKey,
  breadcrumbKeys: [],
  group: '',
  target: { path: '/' },
  keywords: [],
  bodyKeys: [],
});

const push = (hit: SearchHit) => {
  const { result } = renderHook(() => useRecentSearchHits());
  act(() => result.current[1].push(hit));
};

const read = (): Array<RecentSearchHit> =>
  renderHook(() => useRecentSearchHits()).result.current[0];

describe('useRecentSearchHits', () => {
  beforeEach(() => {
    store = {};
  });

  it('starts empty', () => {
    expect(read()).toEqual([]);
  });

  it('pushes the newest hit to the front', () => {
    push(makeHit('page:a', 'webui.menu.Start'));
    push(makeHit('page:b', 'webui.menu.Data'));
    expect(_.map(read(), 'id')).toEqual(['page:b', 'page:a']);
    expect(read()[0]?.labelKey).toBe('webui.menu.Data');
    expect(read()[0]?.selectedAt).toEqual(expect.any(String));
  });

  it('de-duplicates a re-selected hit instead of growing', () => {
    push(makeHit('page:a', 'webui.menu.Start'));
    push(makeHit('page:b', 'webui.menu.Data'));
    push(makeHit('page:a', 'webui.menu.Start'));
    expect(_.map(read(), 'id')).toEqual(['page:a', 'page:b']);
  });

  it(`keeps at most ${RECENT_SEARCH_HITS_LIMIT} entries`, () => {
    _.times(RECENT_SEARCH_HITS_LIMIT + 3, (i) =>
      push(makeHit(`page:${i}`, 'webui.menu.Start')),
    );
    expect(read()).toHaveLength(RECENT_SEARCH_HITS_LIMIT);
    expect(read()[0]?.id).toBe(`page:${RECENT_SEARCH_HITS_LIMIT + 2}`);
  });

  it('stores the underlying hit id for a body-matched row', () => {
    push(makeHit('page:a#found=agent.Status', 'webui.menu.Start'));
    expect(read()[0]?.id).toBe('page:a');
  });

  it('clears', () => {
    push(makeHit('page:a', 'webui.menu.Start'));
    const { result } = renderHook(() => useRecentSearchHits());
    act(() => result.current[1].clear());
    expect(read()).toEqual([]);
  });
});
