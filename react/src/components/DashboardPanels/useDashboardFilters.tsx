/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useCurrentDomain } from '../../hooks';
import { useCurrentUserInfo } from '../../hooks/backendai';
import { useCurrentResourceGroupValue } from '../../hooks/useCurrentProject';
import type { ProjectContextOrNull } from '../../types/projectContext';
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
  /** The page's project from the URL path; `null` on the superadmin page. */
  project: ProjectContextOrNull;
  currentProjectId: string | null;
  currentResourceGroup: string | null;
}

/**
 * One dashboard page's shared state: the scope every card reads, from the
 * page alone, and the active board's refresh interval. Resource groups and
 * time ranges are each card's own settings (ADR 0018). `project` is the
 * page's URL project, passed in by the page (ADR 0001).
 */
export const useDashboardFilters = (
  page: PanelPage,
  boards: DashboardBoardsState,
  project: ProjectContextOrNull,
): DashboardFilters => {
  'use memo';
  const currentDomain = useCurrentDomain();
  const currentResourceGroup = useCurrentResourceGroupValue() ?? null;
  const urlProjectId = project?.id ?? null;
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
    project,
    currentProjectId: urlProjectId,
    currentResourceGroup,
  };
};

export interface DashboardFilterContextValue {
  scope: DashboardScope;
  project: ProjectContextOrNull;
  currentProjectId: string | null;
  currentResourceGroup: string | null;
}

export const DashboardFilterContext =
  createContext<DashboardFilterContextValue | null>(null);

export const useDashboardFilterContext = () => use(DashboardFilterContext);

/** The page's project for cards and the panel modal; `null` on the superadmin page. */
export const useDashboardProject = (): ProjectContextOrNull =>
  use(DashboardFilterContext)?.project ?? null;

/** The scope arguments of a custom panel's query: the viewer's own rows on the member page, else the page's project, else the current domain. */
export const useDashboardQueryScope = () => {
  'use memo';
  const filters = use(DashboardFilterContext);
  const project = filters?.project ?? null;
  const currentDomain = useCurrentDomain();
  const [currentUser] = useCurrentUserInfo();
  return {
    projectId: project?.id ?? null,
    domainName: currentDomain.name,
    domainId: currentDomain.id,
    ownerId: filters?.scope.kind === 'mine' ? (currentUser.uuid ?? null) : null,
  };
};
