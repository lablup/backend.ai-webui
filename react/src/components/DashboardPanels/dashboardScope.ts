/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { DashboardDomain, DashboardScope, PanelPage } from './types';
import type { BAIScopedResourceGroupSelectProps } from 'backend.ai-ui';
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

/** The resource groups a dashboard may offer, SFTP-only ones left out. */
export interface AllowedResourceGroups {
  /** In the order the picker lists them (by name). */
  names: ReadonlyArray<string>;
  /** False when the list stopped at its page size, so a name missing from it may still be allowed. */
  isComplete: boolean;
}

/** A card's resource group when it has none saved: the first allowed group. */
export const defaultResourceGroupOf = (
  allowed: AllowedResourceGroups,
): string | null => allowed.names[0] ?? null;

/**
 * The one resource group a card reads: its own setting (the first group of an
 * older multi-group setting) while the page's project may still use it, else
 * the default. Never the header's current resource group (ADR 0026).
 */
export const cardResourceGroup = (
  setting: ReadonlyArray<string> | undefined,
  allowed: AllowedResourceGroups,
): string | null => {
  const picked = setting?.[0];
  return picked && (!allowed.isComplete || allowed.names.includes(picked))
    ? picked
    : defaultResourceGroupOf(allowed);
};

/** The resource groups a card's setting can pick from: the page's projects, else the domain's. */
export const resourceGroupScopeOf = (
  scope: DashboardScope,
): BAIScopedResourceGroupSelectProps['scope'] =>
  scope.kind === 'mine'
    ? { project: scope.projectId ? [{ value: scope.projectId }] : [] }
    : scope.projectIds === 'all'
      ? { domain: [{ value: scope.domain.id }] }
      : { project: scope.projectIds.map((value) => ({ value })) };

/** What a card's read permission depends on: the page and its project, or its domain. */
export const dashboardScopeKey = (
  page: PanelPage,
  scope: DashboardScope,
): string =>
  scope.kind === 'mine'
    ? `${page}:${scope.projectId ?? ''}`
    : `${page}:${scope.projectIds === 'all' ? `domain:${scope.domain.id}` : scope.projectIds.join(',')}`;
