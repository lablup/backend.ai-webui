/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { useDashboardFiltersProjectsQuery } from '../../__generated__/useDashboardFiltersProjectsQuery.graphql';
import { useCurrentDomain } from '../../hooks';
import { useAccessibleProjects } from '../../hooks/useAccessibleProjects';
import {
  useCurrentProjectValue,
  useCurrentResourceGroupValue,
} from '../../hooks/useCurrentProject';
import { useCurrentUserProjectRoles } from '../../hooks/useCurrentUserProjectRoles';
import { useDashboardRefreshScheduler } from './DashboardRefreshContext';
import { activeBoardOf, selectBoard, updateBoard } from './dashboardConfig';
import {
  EMPTY_DASHBOARD_URL_STATE,
  effectiveVars,
  refreshToMs,
  urlToVars,
  varsToStore,
  varsToUrl,
} from './dashboardFilterUrl';
import { isProjectPinned, resolveDashboardScope } from './dashboardScope';
import type { DashboardBoardVars, DashboardScope, PanelPage } from './types';
import type { DashboardBoardsState } from './useDashboardBoards';
import * as _ from 'lodash-es';
import { parseAsArrayOf, parseAsString, useQueryStates } from 'nuqs';
import {
  createContext,
  use,
  useDeferredValue,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';

const dashboardUrlParsers = {
  project: parseAsArrayOf(parseAsString),
  rg: parseAsArrayOf(parseAsString),
  from: parseAsString,
  to: parseAsString,
  refresh: parseAsString,
};

export interface DashboardProjectOption {
  id: string;
  name: string;
}

export interface DashboardFilters {
  page: PanelPage;
  /** The values in effect: the board's, overridden by the URL query. */
  vars: DashboardBoardVars;
  scope: DashboardScope;
  /** The board's pins fix the project picker. */
  projectPinned: boolean;
  projectNameById: ReadonlyMap<string, string>;
  /** The project admin page's choices: the projects the viewer administers. */
  adminProjects: ReadonlyArray<DashboardProjectOption>;
  currentProjectId: string | null;
  currentResourceGroup: string | null;
  /** Applies a user's change: written to the URL and to the active board. */
  setVars: (
    patch: Partial<DashboardBoardVars>,
    projectNames?: ReadonlyMap<string, string>,
  ) => void;
}

/**
 * The filter bar's state for one dashboard page. Values come from the active
 * board, the URL query overrides them, and only a user's change writes back.
 */
export const useDashboardFilters = (
  page: PanelPage,
  boards: DashboardBoardsState,
): DashboardFilters => {
  'use memo';
  const currentDomain = useCurrentDomain();
  const currentProject = useCurrentProjectValue();
  const currentResourceGroup = useCurrentResourceGroupValue();
  const { projectAdminIds } = useCurrentUserProjectRoles();
  const { groups } = useAccessibleProjects();
  const scheduler = useDashboardRefreshScheduler();
  const [url, setUrl] = useQueryStates(dashboardUrlParsers, {
    history: 'replace',
  });

  const activeBoard = activeBoardOf(boards.config);
  const pinned = activeBoard.pinned;
  const urlProjectId = currentProject.id ?? null;
  // Names the project picker reported, so a new selection needs no lookup round trip.
  const [learnedProjects, setLearnedProjects] = useState<
    Array<DashboardProjectOption>
  >([]);
  const learnedIds = new Set(learnedProjects.map((project) => project.id));
  const learnedNames = new Set(learnedProjects.map((project) => project.name));
  const lookupKey = JSON.stringify(
    superadminProjectLookup(page, currentDomain.id, {
      ids: [
        ...(activeBoard.vars.project === 'all' ? [] : activeBoard.vars.project),
        ...(pinned?.project ?? []),
      ].filter((id) => !learnedIds.has(id)),
      names: (url.project ?? []).filter((name) => !learnedNames.has(name)),
    }),
  );
  // Deferred, so a lookup for a new board or link loads behind the current filter bar.
  const deferredLookupKey = useDeferredValue(lookupKey);

  const { scopedProjectsV2 } =
    useLazyLoadQuery<useDashboardFiltersProjectsQuery>(
      graphql`
        query useDashboardFiltersProjectsQuery(
          $scope: ProjectScope!
          $filter: ProjectV2Filter
          $limit: Int!
          $skip: Boolean!
        ) {
          scopedProjectsV2(scope: $scope, filter: $filter, limit: $limit)
            @skip(if: $skip) {
            edges {
              node {
                id
                entityId
                basicInfo {
                  name
                }
              }
            }
          }
        }
      `,
      JSON.parse(deferredLookupKey),
      { fetchPolicy: 'store-or-network' },
    );

  const knownProjects: Array<DashboardProjectOption> =
    page === 'admin'
      ? [
          ...learnedProjects,
          ..._.compact(
            _.map(scopedProjectsV2?.edges, (edge) =>
              edge?.node
                ? { id: edge.node.entityId, name: edge.node.basicInfo.name }
                : null,
            ),
          ),
        ]
      : _.compact(
          _.map(groups, (group) =>
            group?.id && group.name ? { id: group.id, name: group.name } : null,
          ),
        );
  const projectNameById = new Map(
    knownProjects.map((project) => [project.id, project.name]),
  );
  const projectIdByName = new Map(
    knownProjects.map((project) => [project.name, project.id]),
  );
  const adminProjectIdSet = new Set(projectAdminIds);
  const adminProjects =
    page === 'projectAdmin'
      ? knownProjects.filter((project) => adminProjectIdSet.has(project.id))
      : [];

  const vars = effectiveVars(
    page,
    activeBoard.vars,
    urlToVars(url, projectIdByName),
  );
  const scope = resolveDashboardScope({
    page,
    urlProjectId,
    adminProjectIds: projectAdminIds,
    vars,
    pinned,
    currentDomain,
  });

  useEffect(() => {
    scheduler?.setInterval(refreshToMs(vars.refresh));
  }, [scheduler, vars.refresh]);

  // Another board starts from its own values, so the previous board's URL query is dropped.
  const clearUrl = useEffectEvent(() => {
    if (_.some(url, (value) => value !== null))
      setUrl(EMPTY_DASHBOARD_URL_STATE);
  });
  const previousBoardIdRef = useRef(activeBoard.id);
  useEffect(() => {
    if (previousBoardIdRef.current === activeBoard.id) return;
    previousBoardIdRef.current = activeBoard.id;
    clearUrl();
  }, [activeBoard.id]);

  // Project admin: picking another header project returns to an unpinned board.
  const leavePinnedBoard = useEffectEvent(() => {
    if (page !== 'projectAdmin' || !isProjectPinned(page, pinned)) return;
    const unpinned = boards.config.boards.find(
      (board) => !isProjectPinned(page, board.pinned),
    );
    if (unpinned) boards.update((config) => selectBoard(config, unpinned.id));
  });
  const previousProjectIdRef = useRef(urlProjectId);
  useEffect(() => {
    if (previousProjectIdRef.current === urlProjectId) return;
    previousProjectIdRef.current = urlProjectId;
    leavePinnedBoard();
  }, [urlProjectId]);

  return {
    page,
    vars,
    scope,
    projectPinned: isProjectPinned(page, pinned),
    projectNameById,
    adminProjects,
    currentProjectId: urlProjectId,
    currentResourceGroup: currentResourceGroup ?? null,
    setVars: (patch, projectNames) => {
      const next: DashboardBoardVars = { ...vars, ...patch };
      if (projectNames?.size) {
        setLearnedProjects((prev) =>
          _.uniqBy(
            [
              ...Array.from(projectNames, ([id, name]) => ({ id, name })),
              ...prev,
            ],
            'id',
          ),
        );
      }
      setUrl(
        varsToUrl(next, new Map([...projectNameById, ...(projectNames ?? [])])),
      );
      boards.update((config) =>
        updateBoard(config, activeBoardOf(config).id, (board) => ({
          ...board,
          vars: varsToStore(page, board.vars, next),
        })),
      );
    },
  };
};

/** Variables of the superadmin's project-name lookup; skipped on other pages. */
const superadminProjectLookup = (
  page: PanelPage,
  domainId: string,
  { ids, names }: { ids: Array<string>; names: Array<string> },
): useDashboardFiltersProjectsQuery['variables'] => {
  const uniqueIds = _.uniq(ids);
  const uniqueNames = _.uniq(names);
  return {
    scope: { domain: [{ value: domainId }] },
    filter: {
      OR: [
        ...(uniqueIds.length ? [{ id: { in: uniqueIds } }] : []),
        ...(uniqueNames.length ? [{ name: { in: uniqueNames } }] : []),
      ],
    },
    limit: Math.max(1, uniqueIds.length + uniqueNames.length),
    skip: page !== 'admin' || uniqueIds.length + uniqueNames.length === 0,
  };
};

export interface DashboardFilterContextValue {
  scope: DashboardScope;
  vars: DashboardBoardVars;
  currentProjectId: string | null;
  currentResourceGroup: string | null;
}

export const DashboardFilterContext =
  createContext<DashboardFilterContextValue | null>(null);

export const useDashboardFilterContext = () => use(DashboardFilterContext);
