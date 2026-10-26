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
import { useBAISettingUserState } from '../../hooks/useBAISetting';
import {
  activeBoardOf,
  resolveBoards,
  type LocalBoardSources,
} from './dashboardConfig';
import { createDashboardWriter, withMigratedFlag } from './dashboardStore';
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
  batch: WriteBatch<PanelPage, DashboardPageConfig>,
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
  /** Applies `update` to the page's boards: shown at once, written after the debounce. */
  update: (
    update: (config: DashboardPageConfig) => DashboardPageConfig,
  ) => void;
}

/**
 * One page's boards in `userConfig.dashboard`, falling back to this browser's
 * localStorage board (migrated once) and then to the role template.
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

  const [localBoard, setLocalBoard] = useBAISettingUserState(
    `dashboard_board.${page}`,
  );
  const [legacyLayout, setLegacyLayout] = useBAISettingUserState(
    'dashboard_board_items',
  );
  const [legacyAdminLayout, setLegacyAdminLayout] = useBAISettingUserState(
    'admin_dashboard_board_items',
  );
  const [legacyCustomPanels, setLegacyCustomPanels] = useBAISettingUserState(
    'custom_dashboard_panels',
  );
  const local: LocalBoardSources = {
    board: localBoard,
    layout: legacyLayout,
    adminLayout: legacyAdminLayout,
    customPanels: legacyCustomPanels,
  };
  const clearLocal = () => {
    setLocalBoard(undefined);
    if (page === 'project') {
      setLegacyLayout(undefined);
      setLegacyCustomPanels(undefined);
    } else if (page === 'admin') {
      setLegacyAdminLayout(undefined);
    }
  };

  const { config, template, migration } = resolveBoards({
    stored: optimistic[page] ?? storedDashboard?.[page],
    local,
    templates: { domainTemplates, publicTemplates },
    definitions,
    page,
  });

  // An optimistic value is dropped once its own write settles; a newer one stays.
  const settle =
    (batch: WriteBatch<PanelPage, DashboardPageConfig>) =>
    (prev: DashboardConfig): DashboardConfig => {
      let next = prev;
      batch.forEach((written, writtenPage) => {
        if (next[writtenPage] === written) next = _.omit(next, writtenPage);
      });
      return next;
    };

  useEffect(() => {
    currentWrite = async (batch) => {
      try {
        for (const [writtenPage, written] of batch) {
          await updateMyUserAppConfig(['dashboard', writtenPage], written);
        }
        await refetchMyAppConfig();
        setOptimistic(settle(batch));
      } catch (error) {
        setOptimistic(settle(batch));
        message.error(getErrorMessage(error));
        throw error;
      }
    };
  });

  useEffect(() => {
    if (!migration) return;
    const started = dashboardWriter.migrate(page, migration, clearLocal);
    if (started) setOptimistic((prev) => ({ ...prev, [page]: migration }));
  });

  return {
    config,
    activeBoard: activeBoardOf(config),
    template,
    update: (update) => {
      const next = withMigratedFlag(update(config));
      setOptimistic((prev) => ({ ...prev, [page]: next }));
      dashboardWriter.save(page, next).catch(() => {});
    },
  };
};
