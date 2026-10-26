/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { DashboardDomain, DashboardScope, PanelPage } from './types';
import * as _ from 'lodash-es';

export interface ResolveDashboardScopeInput {
  page: PanelPage;
  /** The page's project (the URL path project, the header project). */
  urlProjectId: string | null;
  currentDomain: DashboardDomain;
}

/**
 * The scope every card on a page reads. The member page reads the viewer's
 * own data in the page's project, the project admin page that project, and
 * the superadmin page every project of the current domain (ADR 0012).
 */
export const resolveDashboardScope = ({
  page,
  urlProjectId,
  currentDomain,
}: ResolveDashboardScopeInput): DashboardScope => {
  if (page === 'project') return { kind: 'mine', projectId: urlProjectId };
  return {
    kind: 'projects',
    projectIds: page === 'projectAdmin' ? _.compact([urlProjectId]) : 'all',
    domain: currentDomain,
  };
};

/**
 * The resource groups a card that reads one resource group at a time shows,
 * one row each: its own setting, or the header's current group.
 */
export const resourceGroupRows = (
  setting: ReadonlyArray<string> | undefined,
  currentResourceGroup: string | null | undefined,
): Array<string> =>
  setting?.length ? _.uniq(setting) : _.compact([currentResourceGroup]);
