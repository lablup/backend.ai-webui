/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { AuditLogScope } from '../../__generated__/AuditLogPanelScopedListQuery.graphql';
import { useDomainAuditScope } from './cards/AuditLogPanel';
import { projectAuditScope } from './projectAdminCards/projectCardData';
import type { ResourceKey } from './types';
import { useDashboardQueryScope } from './useDashboardFilters';

/**
 * The page's audit log scope for a custom panel, as the built-in audit log card
 * reads it: the viewer's own actions, the project, or on the superadmin page
 * every record (`CLUSTER_AUDIT_SCOPE`). Null for any other source.
 */
export const useAuditLogQueryScope = (
  source: ResourceKey,
): AuditLogScope | null => {
  'use memo';
  const { ownerId, projectId, domainId, domainName } = useDashboardQueryScope();
  const isAuditLog = source === 'auditLog';
  const domainScope = useDomainAuditScope(
    isAuditLog && !ownerId && !projectId ? { domainId, domainName } : null,
  );
  if (!isAuditLog) return null;
  if (ownerId) return { triggeredUser: [{ value: ownerId }] };
  if (projectId) return projectAuditScope(projectId);
  return domainScope;
};
