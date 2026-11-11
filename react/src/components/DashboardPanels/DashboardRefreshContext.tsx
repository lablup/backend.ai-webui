/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { RefreshScheduler } from './refreshScheduler';
import { type QueryKey, useQueryClient } from '@tanstack/react-query';
import { INITIAL_FETCH_KEY } from 'backend.ai-ui';
import React, {
  createContext,
  use,
  useEffect,
  useEffectEvent,
  useState,
  useSyncExternalStore,
  useTransition,
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
  /** A refresh is still rendering, its queries in flight. */
  isPending: boolean;
}

/** The scheduler id of a board card, matched to its board item by {@link useBoardItemVisibility}. */
export const panelRefreshId = (panelId: string) => `panel:${panelId}`;

/**
 * A fetch key the scheduler bumps, in a transition, on every refresh of the
 * dashboard; `isPending` holds while that transition waits for its queries.
 * Outside a provider it stays at the initial key.
 */
export const useDashboardFetchKey = (id: string): DashboardFetchState => {
  'use memo';
  const scheduler = useDashboardRefreshScheduler();
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<Omit<DashboardFetchState, 'isPending'>>(
    () => ({
      fetchKey: INITIAL_FETCH_KEY,
      manualFetchKey: INITIAL_FETCH_KEY,
      refreshedAt: Date.now(),
    }),
  );
  useEffect(() => {
    if (!scheduler) return;
    scheduler.setPending(id, isPending);
    return () => scheduler.setPending(id, false);
  }, [scheduler, id, isPending]);
  useEffect(() => {
    if (!scheduler) return;
    return scheduler.register(id, {
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
  }, [scheduler, id]);
  return { ...state, isPending };
};

/** Refetches a TanStack query on the dashboard timer, like a card's fetch key. */
export const useDashboardRefreshQuery = (queryKey: QueryKey) => {
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
      refresh: () => refetch(),
    });
  }, [scheduler, id]);
};

/**
 * Reports which board items inside `containerRef` are on screen, so an
 * automatic refresh skips the cards scrolled out of view. Items are observed
 * as they mount: the board renders none until it has measured its width.
 */
export const useBoardItemVisibility = (
  containerRef: React.RefObject<HTMLElement | null>,
) => {
  'use memo';
  const scheduler = useDashboardRefreshScheduler();
  useEffect(() => {
    const container = containerRef.current;
    if (
      !scheduler ||
      !container ||
      typeof IntersectionObserver === 'undefined' ||
      typeof MutationObserver === 'undefined'
    )
      return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const id = (entry.target as HTMLElement).dataset.boardItemId;
        if (id) scheduler.setVisible(panelRefreshId(id), entry.isIntersecting);
      });
    });
    const observed = new WeakSet<Element>();
    const observeItems = () => {
      container
        .querySelectorAll<HTMLElement>('[data-board-item-id]')
        .forEach((element) => {
          if (observed.has(element)) return;
          observed.add(element);
          observer.observe(element);
        });
    };
    observeItems();
    const mutationObserver = new MutationObserver(observeItems);
    mutationObserver.observe(container, { childList: true, subtree: true });
    return () => {
      mutationObserver.disconnect();
      observer.disconnect();
    };
  }, [scheduler, containerRef]);
};

const noopSubscribe = () => () => {};

/** When the dashboard last refreshed, automatically or by hand. */
export const useDashboardLastRefreshAt = (): number | null => {
  'use memo';
  const scheduler = useDashboardRefreshScheduler();
  return useSyncExternalStore(
    scheduler ? (listener) => scheduler.subscribe(listener) : noopSubscribe,
    () => scheduler?.getLastTickAt() ?? null,
  );
};

/** Whether any card's refresh is still in flight. */
export const useDashboardIsRefreshing = (): boolean => {
  'use memo';
  const scheduler = useDashboardRefreshScheduler();
  return useSyncExternalStore(
    scheduler ? (listener) => scheduler.subscribe(listener) : noopSubscribe,
    () => scheduler?.isRefreshing() ?? false,
  );
};
