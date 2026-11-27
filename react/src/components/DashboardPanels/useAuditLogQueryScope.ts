/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { AuditLogScope } from '../../__generated__/AuditLogPanelScopedListQuery.graphql';
import { resolveCardScope } from './cardScope';
import { CLUSTER_AUDIT_SCOPE } from './cards/AuditLogPanel';
import { projectAuditScope } from './projectAdminCards/projectCardData';
import type { ResourceKey } from './types';
import {
  useDashboardFilterContext,
  useDashboardQueryScope,
} from './useDashboardFilters';

/**
 * The page's audit log scope for a custom panel, as the built-in audit log card
 * reads it: the viewer's own actions, the project, or on the superadmin page
 * every record (`CLUSTER_AUDIT_SCOPE`). Null for any other source, and while
 * the page has no project.
 */
export const useAuditLogQueryScope = (
  source: ResourceKey,
): AuditLogScope | null => {
  'use memo';
  const filters = useDashboardFilterContext();
  const { ownerId } = useDashboardQueryScope();
  if (source !== 'auditLog' || !filters) return null;
  // The viewer's own actions need no project, so an unresolved URL project does not empty them.
  if (filters.scope.kind === 'mine') {
    return ownerId ? { triggeredUser: [{ value: ownerId }] } : null;
  }
  const cardScope = resolveCardScope(filters.scope);
  if (!cardScope) return null;
  switch (cardScope.kind) {
    case 'domain':
      return CLUSTER_AUDIT_SCOPE;
    case 'mine':
    case 'project':
      return projectAuditScope(cardScope.projectId);
  }
};
