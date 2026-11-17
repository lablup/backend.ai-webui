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
 * reads it: the viewer's own actions, the project, or the current domain. Null
 * for any other source, which reads nothing.
 */
export const useAuditLogQueryScope = (
  source: ResourceKey,
  fetchKey?: string,
): AuditLogScope | null => {
  'use memo';
  const { ownerId, projectId, domainId, domainName } = useDashboardQueryScope();
  const isAuditLog = source === 'auditLog';
  const domainScope = useDomainAuditScope(
    isAuditLog && !ownerId && !projectId ? { domainId, domainName } : null,
    fetchKey,
  );
  if (!isAuditLog) return null;
  if (ownerId) return { triggeredUser: [{ value: ownerId }] };
  if (projectId) return projectAuditScope(projectId);
  return domainScope;
};
