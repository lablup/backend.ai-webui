/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { SearchHit } from './types';
import type { GlobalSearchSource } from './useGlobalSearchSource';
import * as _ from 'lodash-es';
import { useEffect, useRef } from 'react';

/** Quiet period after the last keystroke before the ranker runs. */
export const SEARCH_DEBOUNCE_MS = 120;

interface PendingSearch {
  timer: ReturnType<typeof setTimeout> | null;
  resolvers: Array<(hits: Array<SearchHit>) => void>;
}

/**
 * Delays the *trigger* of an otherwise synchronous source. `CommandPalette`
 * awaits `search()` and discards superseded results by generation, so returning
 * a promise costs nothing: the input still echoes every keystroke immediately
 * and narrows the previous rows optimistically while the timer runs.
 */
export const useDebouncedSearchSource = (
  source: GlobalSearchSource,
  delayMs: number = SEARCH_DEBOUNCE_MS,
): GlobalSearchSource => {
  'use memo';

  const pending = useRef<PendingSearch>({ timer: null, resolvers: [] });

  useEffect(() => {
    const state = pending.current;
    return () => {
      if (state.timer) clearTimeout(state.timer);
    };
  }, []);

  const flush = (hits: Array<SearchHit>) => {
    const { resolvers } = pending.current;
    pending.current.resolvers = [];
    _.forEach(resolvers, (resolve) => resolve(hits));
  };

  const clearTimer = () => {
    if (pending.current.timer) clearTimeout(pending.current.timer);
    pending.current.timer = null;
  };

  return {
    ...source,
    search: (query: string) =>
      new Promise<Array<SearchHit>>((resolve) => {
        pending.current.resolvers.push(resolve);
        clearTimer();
        pending.current.timer = setTimeout(() => {
          pending.current.timer = null;
          // Every superseded call resolves with the newest query's rows, so no
          // promise is left dangling and no intermediate empty list flashes.
          void Promise.resolve(source.search(query)).then(flush);
        }, delayMs);
      }),
    cancel: () => {
      clearTimer();
      flush([]);
      source.cancel?.();
    },
  };
};
