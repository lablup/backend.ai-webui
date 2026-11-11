/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { DashboardScope } from '../types';

/** The project admin page's project (the URL project); null on any other page. */
export const adminProjectId = (scope: DashboardScope): string | null =>
  scope.kind === 'projects' && Array.isArray(scope.projectIds)
    ? (scope.projectIds[0] ?? null)
    : null;

/**
 * The `scopedAuditLogsV2` scope of a project: its own entries and those of
 * the sessions, folders and deployments in it (checked on manager 26.10).
 */
export const projectAuditScope = (projectId: string) => ({
  entity: [{ entityType: 'project', entityId: projectId }],
});
