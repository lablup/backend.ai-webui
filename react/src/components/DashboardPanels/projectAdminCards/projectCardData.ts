/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { DashboardScope } from '../types';
import * as _ from 'lodash-es';

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

/** The legacy `compute_session_nodes` filter that matches exactly these sessions. */
export const legacySessionIdFilter = (ids: ReadonlyArray<string>) =>
  `id in [${ids.map((id) => JSON.stringify(id)).join(', ')}]`;

type Predicate = { name?: string; msg?: string };

/**
 * The scheduler's last word on a pending session from the legacy `status_data`
 * (the session list's status tooltip reads the same), else `status_info`.
 */
export const pendingReason = (
  statusInfo: string | null | undefined,
  statusData: string | null | undefined,
): string | null => {
  let parsed: unknown = null;
  try {
    parsed = statusData ? JSON.parse(statusData) : null;
  } catch {
    parsed = null;
  }
  const scheduler = _.get(parsed, 'scheduler') as
    { msg?: string; failed_predicates?: Array<Predicate> } | undefined;
  const failed = (scheduler?.failed_predicates ?? [])
    .map((predicate) => _.compact([predicate.name, predicate.msg]).join(': '))
    .filter(Boolean);
  if (failed.length > 0) return failed.join('; ');
  if (scheduler?.msg) return scheduler.msg;
  return statusInfo?.trim() ? statusInfo.trim() : null;
};
