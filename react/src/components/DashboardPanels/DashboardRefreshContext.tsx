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

/** Owns a dashboard page's one refresh timer; the filter bar sets its interval. */
export const DashboardRefreshProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  'use memo';
  const [scheduler] = useState(() => new RefreshScheduler());
  useEffect(() => scheduler.start(), [scheduler]);
  return (
    <DashboardRefreshContext value={scheduler}>
      {children}
    </DashboardRefreshContext>
  );
};

export const useDashboardRefreshScheduler = () => use(DashboardRefreshContext);

export interface DashboardFetchState {
  fetchKey: string;
  /** When the key last changed; the stable `now` for range filters. */
  refreshedAt: number;
}

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
    refreshedAt: Date.now(),
  }));
  useEffect(() => {
    if (!scheduler) return;
    return scheduler.register(id, {
      minMs: refreshIntervalMs(min),
      refresh: (at) =>
        startTransition(() => {
          fetchKeySeq += 1;
          setState({
            fetchKey: `${new Date(at).toISOString()}#${fetchKeySeq}`,
            refreshedAt: at,
          });
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

const noopSubscribe = () => () => {};

/** When the dashboard last refreshed, automatically or by hand. */
export const useDashboardLastRefreshAt = (): number | null => {
  const scheduler = useDashboardRefreshScheduler();
  return useSyncExternalStore(
    scheduler ? (listener) => scheduler.subscribe(listener) : noopSubscribe,
    () => scheduler?.getLastTickAt() ?? null,
  );
};
