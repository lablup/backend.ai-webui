/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type {
  DashboardBoardVars,
  DashboardDomain,
  DashboardModel,
  DashboardScope,
  PanelPage,
} from './types';
import * as _ from 'lodash-es';

export interface ResolveDashboardScopeInput {
  page: PanelPage;
  /** The project in the URL path (the header project). */
  urlProjectId: string | null;
  /** Projects the viewer administers; the project admin page's choices. */
  adminProjectIds: ReadonlyArray<string>;
  /** The filter values in effect: the board's, overridden by the URL query. */
  vars: Pick<DashboardBoardVars, 'project' | 'rg'>;
  pinned?: DashboardModel['pinned'];
  currentDomain: DashboardDomain;
}

const listOrAll = (value: Array<string> | 'all'): Array<string> | 'all' =>
  value === 'all' || value.length === 0 ? 'all' : _.uniq(value);

/**
 * Resolves the filter bar into the scope cards read. A board's pinned
 * projects win over every other source. On the project admin page an
 * unpinned board shows the URL project unless the URL query picks others,
 * and only projects the viewer administers survive.
 */
export const resolveDashboardScope = ({
  page,
  urlProjectId,
  adminProjectIds,
  vars,
  pinned,
  currentDomain,
}: ResolveDashboardScopeInput): DashboardScope => {
  const rgs = listOrAll(vars.rg);
  if (page === 'project') {
    return { kind: 'mine', projectId: urlProjectId, rgs };
  }
  const pinnedProjects = pinned?.project?.length ? pinned.project : null;
  if (page === 'projectAdmin') {
    const allowed = new Set(adminProjectIds);
    const candidates =
      pinnedProjects ?? (vars.project === 'all' ? [] : vars.project);
    const projectIds = _.uniq(candidates).filter((id) => allowed.has(id));
    return {
      kind: 'projects',
      projectIds:
        projectIds.length > 0 ? projectIds : _.compact([urlProjectId]),
      rgs,
      domain: currentDomain,
    };
  }
  return {
    kind: 'projects',
    projectIds: pinnedProjects
      ? _.uniq(pinnedProjects)
      : listOrAll(vars.project),
    rgs,
    domain: currentDomain,
  };
};

/** Whether the board's pins fix the project picker. Never on the member page. */
export const isProjectPinned = (
  page: PanelPage,
  pinned?: DashboardModel['pinned'],
) => page !== 'project' && !!pinned?.project?.length;

/**
 * The resource groups a card that reads one resource group at a time shows,
 * one row each: the selected ones, or the header's current group for "all".
 */
export const resourceGroupRows = (
  rgs: Array<string> | 'all',
  currentResourceGroup: string | null | undefined,
): Array<string> =>
  rgs === 'all' ? _.compact([currentResourceGroup]) : [...rgs];
