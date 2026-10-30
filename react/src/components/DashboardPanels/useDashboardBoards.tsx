/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { App } from '../../app-shim';
import {
  useDomainAppConfig,
  useMyAppConfig,
  usePublicDomainAppConfig,
  useRefetchMyAppConfig,
  useUpdateMyUserAppConfig,
} from '../../hooks/useAppConfig';
import { activeBoardOf, resolveBoards } from './dashboardConfig';
import {
  applyPageUpdate,
  createDashboardWriter,
  type PageWrite,
} from './dashboardStore';
import type {
  DashboardConfig,
  DashboardModel,
  DashboardPageConfig,
  PanelDefinition,
  PanelPage,
} from './types';
import type { WriteBatch } from './writeQueue';
import { useErrorMessageResolver } from 'backend.ai-ui';
import { atom, useSetAtom, useAtomValue } from 'jotai';
import * as _ from 'lodash-es';
import { useEffect } from 'react';

/** Written page configs the refetched `userConfig` does not reflect yet. */
const optimisticDashboardAtom = atom<DashboardConfig>({});

type DashboardWrite = (
  batch: WriteBatch<PanelPage, PageWrite>,
) => Promise<void>;

// Set by the mounted board, which owns the Relay environment and the jotai store.
let currentWrite: DashboardWrite | null = null;

// One queue for the whole app: each upsert rewrites the user's whole document.
const dashboardWriter = createDashboardWriter({
  write: (batch) =>
    currentWrite
      ? currentWrite(batch)
      : Promise.reject(new Error('No dashboard is mounted')),
});

export interface DashboardBoardsState {
  config: DashboardPageConfig;
  activeBoard: DashboardModel;
  /** What a new board and "Reset layout" start from. */
  template: DashboardModel;
  /** Applies `update` to the page's boards at once; the write replays it on the server's value. */
  update: (
    update: (config: DashboardPageConfig) => DashboardPageConfig,
  ) => void;
}

/**
 * One page's boards in `userConfig.dashboard`, falling back to the role template.
 *
 * Only this hook writes `userConfig.dashboard`, and only into the USER
 * fragment: the read is deep-merged across scopes, which mixes board arrays.
 */
export const useDashboardBoards = (
  page: PanelPage,
  definitions: ReadonlyArray<PanelDefinition>,
): DashboardBoardsState => {
  'use memo';
  const { message } = App.useApp();
  const { getErrorMessage } = useErrorMessageResolver();
  const storedDashboard = useMyAppConfig<Record<string, unknown>>('dashboard');
  const domainTemplates = useDomainAppConfig('dashboardTemplates');
  const publicTemplates = usePublicDomainAppConfig('dashboardTemplates');
  const updateMyUserAppConfig = useUpdateMyUserAppConfig();
  const refetchMyAppConfig = useRefetchMyAppConfig();
  const optimistic = useAtomValue(optimisticDashboardAtom);
  const setOptimistic = useSetAtom(optimisticDashboardAtom);

  const resolve = (stored: unknown) =>
    resolveBoards({
      stored,
      templates: { domainTemplates, publicTemplates },
      definitions,
      page,
    });
  const { config, template } = resolve(
    optimistic[page] ?? storedDashboard?.[page],
  );

  // An optimistic value is dropped once its own write settles; a newer one stays.
  const settle =
    (batch: WriteBatch<PanelPage, PageWrite>) =>
    (prev: DashboardConfig): DashboardConfig => {
      let next = prev;
      batch.forEach(({ optimistic: written }, writtenPage) => {
        if (next[writtenPage] === written) next = _.omit(next, writtenPage);
      });
      return next;
    };

  useEffect(() => {
    currentWrite = async (batch) => {
      try {
        for (const [writtenPage, { update, resolve: resolveStored }] of batch) {
          // Replayed on the value the server holds now, so edits made elsewhere survive.
          await updateMyUserAppConfig(
            ['dashboard', writtenPage],
            (stored: unknown) => update(resolveStored(stored)),
          );
        }
      } catch (error) {
        setOptimistic(settle(batch));
        message.error(getErrorMessage(error));
        throw error;
      }
      // The write landed: a failed refetch keeps the optimistic copy rather than a stale one.
      await refetchMyAppConfig().then(
        () => setOptimistic(settle(batch)),
        () => {},
      );
    };
  });

  useEffect(() => {
    const flushWhenHidden = () => {
      if (document.visibilityState === 'hidden') dashboardWriter.flush();
    };
    const flush = () => {
      dashboardWriter.flush();
    };
    document.addEventListener('visibilitychange', flushWhenHidden);
    window.addEventListener('pagehide', flush);
    return () => {
      document.removeEventListener('visibilitychange', flushWhenHidden);
      window.removeEventListener('pagehide', flush);
      flush();
    };
  }, []);

  return {
    config,
    activeBoard: activeBoardOf(config),
    template,
    update: (update) => {
      const next = applyPageUpdate(config, update);
      if (!next) return;
      setOptimistic((prev) => ({ ...prev, [page]: next }));
      dashboardWriter
        .save(page, {
          update,
          resolve: (stored) => resolve(stored).config,
          optimistic: next,
        })
        .catch(() => {});
    },
  };
};
