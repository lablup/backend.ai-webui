/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useCurrentDomain } from '../../hooks';
import {
  useCurrentProjectValue,
  useCurrentResourceGroupValue,
} from '../../hooks/useCurrentProject';
import { activeBoardOf, updateBoard } from './dashboardConfig';
import { resolveDashboardScope } from './dashboardScope';
import { isRefreshOption, type RefreshOption } from './refreshScheduler';
import type { DashboardScope, PanelPage } from './types';
import type { DashboardBoardsState } from './useDashboardBoards';
import { createContext, use } from 'react';

export interface DashboardFilters {
  page: PanelPage;
  scope: DashboardScope;
  /** The active board's auto refresh interval. */
  refresh: RefreshOption;
  /** Saves a new auto refresh interval on the active board. */
  setRefresh: (refresh: RefreshOption) => void;
  currentProjectId: string | null;
  currentResourceGroup: string | null;
}

/**
 * One dashboard page's shared state: the scope every card reads, from the
 * page alone, and the active board's refresh interval. Resource groups and
 * time ranges are each card's own settings (ADR 0015).
 */
export const useDashboardFilters = (
  page: PanelPage,
  boards: DashboardBoardsState,
): DashboardFilters => {
  'use memo';
  const currentDomain = useCurrentDomain();
  const currentProject = useCurrentProjectValue();
  const currentResourceGroup = useCurrentResourceGroupValue();
  const urlProjectId = currentProject.id ?? null;
  const storedRefresh = activeBoardOf(boards.config).vars.refresh;

  return {
    page,
    scope: resolveDashboardScope({ page, urlProjectId, currentDomain }),
    refresh: isRefreshOption(storedRefresh) ? storedRefresh : 'off',
    setRefresh: (refresh) =>
      boards.update((config) =>
        updateBoard(config, activeBoardOf(config).id, (board) => ({
          ...board,
          vars: { ...board.vars, refresh },
        })),
      ),
    currentProjectId: urlProjectId,
    currentResourceGroup: currentResourceGroup ?? null,
  };
};

export interface DashboardFilterContextValue {
  scope: DashboardScope;
  currentProjectId: string | null;
  currentResourceGroup: string | null;
}

export const DashboardFilterContext =
  createContext<DashboardFilterContextValue | null>(null);

export const useDashboardFilterContext = () => use(DashboardFilterContext);
