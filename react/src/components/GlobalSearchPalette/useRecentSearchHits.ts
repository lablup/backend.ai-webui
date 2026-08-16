/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useBAISettingUserState } from '../../hooks/useBAISetting';
import { baseHitId } from './rank';
import type { RecentSearchHit, SearchHit } from './types';
import { useEventNotStable } from 'backend.ai-ui';
import * as _ from 'lodash-es';

export const RECENT_SEARCH_HITS_LIMIT = 5;

/**
 * The last few hits the user selected, persisted per user. Mirrors
 * `useRecentSessionHistory`; only the id/kind/key are stored so the label and
 * the visibility gate are re-resolved live.
 */
export const useRecentSearchHits = () => {
  'use memo';

  const [recentSearchHits, setRecentSearchHits] =
    useBAISettingUserState('recentSearchHits');

  const push = useEventNotStable((hit: SearchHit) => {
    const id = baseHitId(hit.id);
    const entry: RecentSearchHit = {
      id,
      kind: hit.kind,
      labelKey: hit.labelKey,
      selectedAt: new Date().toISOString(),
    };
    setRecentSearchHits(
      _.take(
        [entry, ..._.reject(recentSearchHits ?? [], (item) => item.id === id)],
        RECENT_SEARCH_HITS_LIMIT,
      ),
    );
  });

  const clear = useEventNotStable(() => setRecentSearchHits([]));

  return [recentSearchHits ?? [], { push, clear }] as const;
};
