/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { RefreshScheduler, refreshIntervalMs } from './refreshScheduler';
import type { RefreshInterval } from './types';
import { type QueryKey, useQueryClient } from '@tanstack/react-query';
import { INITIAL_FETCH_KEY } from 'backend.ai-ui';
import React, {
  createContext,
  startTransition,
  use,
  useEffect,
  useEffectEvent,
  useState,
  useSyncExternalStore,
} from 'react';

let fetchKeySeq = 0;

const DashboardRefreshContext = createContext<RefreshScheduler | null>(null);

/** Owns a dashboard page's refresh fan-out; the dashboard's refresh control drives it. */
export const DashboardRefreshProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  'use memo';
  const [scheduler] = useState(() => new RefreshScheduler());
  return (
    <DashboardRefreshContext value={scheduler}>
      {children}
    </DashboardRefreshContext>
  );
};

export const useDashboardRefreshScheduler = () => use(DashboardRefreshContext);

export interface DashboardFetchState {
  fetchKey: string;
  /** Changes only on a manual refresh, for data that cannot change by itself. */
  manualFetchKey: string;
  /** When the key last changed; the stable `now` for range filters. */
  refreshedAt: number;
}

/** The scheduler id of a board card, matched to its board item by {@link useBoardItemVisibility}. */
export const panelRefreshId = (panelId: string) => `panel:${panelId}`;

/**
 * A fetch key the scheduler bumps, in a transition, once `min` has elapsed
 * since the last bump. Outside a provider it stays at the initial key.
 */
export const useDashboardFetchKey = (
  id: string,
  min: RefreshInterval,
): DashboardFetchState => {
  'use memo';
  const scheduler = useDashboardRefreshScheduler();
  const [state, setState] = useState<DashboardFetchState>(() => ({
    fetchKey: INITIAL_FETCH_KEY,
    manualFetchKey: INITIAL_FETCH_KEY,
    refreshedAt: Date.now(),
  }));
  useEffect(() => {
    if (!scheduler) return;
    return scheduler.register(id, {
      minMs: refreshIntervalMs(min),
      refresh: (at, manual) =>
        startTransition(() => {
          fetchKeySeq += 1;
          const fetchKey = `${new Date(at).toISOString()}#${fetchKeySeq}`;
          setState((previous) => ({
            fetchKey,
            manualFetchKey: manual ? fetchKey : previous.manualFetchKey,
            refreshedAt: at,
          }));
        }),
    });
  }, [scheduler, id, min]);
  return state;
};

/** Refetches a TanStack query on the dashboard timer, like a card's fetch key. */
export const useDashboardRefreshQuery = (
  queryKey: QueryKey,
  min: RefreshInterval,
) => {
  'use memo';
  const scheduler = useDashboardRefreshScheduler();
  const queryClient = useQueryClient();
  const id = `query:${JSON.stringify(queryKey)}`;
  const refetch = useEffectEvent(() => {
    queryClient.refetchQueries({ queryKey });
  });
  useEffect(() => {
    if (!scheduler) return;
    return scheduler.register(id, {
      minMs: refreshIntervalMs(min),
      refresh: () => refetch(),
    });
  }, [scheduler, id, min]);
};

/**
 * Reports which board items inside `containerRef` are on screen, so an
 * automatic refresh skips the cards scrolled out of view.
 */
export const useBoardItemVisibility = (
  containerRef: React.RefObject<HTMLElement | null>,
  itemIds: ReadonlyArray<string>,
) => {
  const scheduler = useDashboardRefreshScheduler();
  const idsKey = itemIds.join('\n');
  useEffect(() => {
    const container = containerRef.current;
    if (!scheduler || !container || typeof IntersectionObserver === 'undefined')
      return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const id = (entry.target as HTMLElement).dataset.boardItemId;
        if (id) scheduler.setVisible(panelRefreshId(id), entry.isIntersecting);
      });
    });
    container
      .querySelectorAll<HTMLElement>('[data-board-item-id]')
      .forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [scheduler, containerRef, idsKey]);
};

const noopSubscribe = () => () => {};

/** When the dashboard last refreshed, automatically or by hand. */
export const useDashboardLastRefreshAt = (): number | null => {
  const scheduler = useDashboardRefreshScheduler();
  return useSyncExternalStore(
    scheduler ? (listener) => scheduler.subscribe(listener) : noopSubscribe,
    () => scheduler?.getLastTickAt() ?? null,
  );
};
