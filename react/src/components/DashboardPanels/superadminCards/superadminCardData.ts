/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { AuditLogFilter } from '../../../__generated__/FailuresByEntityTypePanelQuery.graphql';
import { AUDIT_FAILURE_STATUSES } from '../memberCards/memberCardData';
import { withinWindow, type DateTimeWindow } from '../timeRange';

/** Scheduling results that mean an attempt did not place the session, in donut order. */
export const SCHEDULING_FAILURE_RESULTS = [
  'FAILURE',
  'GIVE_UP',
  'EXPIRED',
  'NEED_RETRY',
] as const;
export type SchedulingFailureResult =
  (typeof SCHEDULING_FAILURE_RESULTS)[number];

/** Sign-in attempts that were refused; logouts, revocations and expiries are not failures. */
export const LOGIN_FAILURE_RESULTS = [
  'FAILED_INVALID_CREDENTIALS',
  'FAILED_USER_INACTIVE',
  'FAILED_BLOCKED',
  'FAILED_PASSWORD_EXPIRED',
  'FAILED_REJECTED_BY_HOOK',
  'FAILED_SESSION_ALREADY_EXISTS',
] as const;

/** Agent statuses, in donut order. */
export const AGENT_STATUSES = [
  'ALIVE',
  'LOST',
  'RESTARTING',
  'TERMINATED',
] as const;
export type AgentStatus = (typeof AGENT_STATUSES)[number];

/**
 * Audit log entity types the failure card counts one by one (the ones the
 * manager wrote most on 26.10); every other type is one more alias, `other`.
 */
export const AUDIT_ENTITY_TYPES = [
  'session',
  'vfolder',
  'deployment',
  'user',
  'project',
  'resource_group',
  'artifact_registry',
] as const;

export type AuditEntityType = (typeof AUDIT_ENTITY_TYPES)[number];

/** The count alias of each entity type the failure card queries. */
export const ENTITY_TYPE_ALIASES = {
  session: 'session',
  vfolder: 'vfolder',
  deployment: 'deployment',
  user: 'user',
  project: 'project',
  resource_group: 'resourceGroup',
  artifact_registry: 'artifactRegistry',
} as const satisfies Record<AuditEntityType, string>;

/** Failure counts per entity type, plus every other type as `other`. */
export const entityTypeFailureFilters = (
  window: DateTimeWindow,
): Record<
  (typeof ENTITY_TYPE_ALIASES)[AuditEntityType] | 'other',
  AuditLogFilter
> => {
  const failures = (entityType: AuditLogFilter['entityType']) => ({
    ...withinWindow('createdAt', window),
    status: { in: [...AUDIT_FAILURE_STATUSES] },
    entityType,
  });
  const byType = (type: AuditEntityType) => failures({ equals: type });
  return {
    session: byType('session'),
    vfolder: byType('vfolder'),
    deployment: byType('deployment'),
    user: byType('user'),
    project: byType('project'),
    resourceGroup: byType('resource_group'),
    artifactRegistry: byType('artifact_registry'),
    other: failures({ notIn: [...AUDIT_ENTITY_TYPES] }),
  };
};

/** Legacy session statuses by launch outcome; every status is in exactly one. */
export const LAUNCH_OUTCOME_STATUSES = {
  started: [
    'RESERVED',
    'SCHEDULED',
    'PREPARING',
    'PULLING',
    'PREPARED',
    'CREATING',
    'RUNNING',
    'RESTARTING',
    'RUNNING_DEGRADED',
    'DEPRIORITIZING',
    'TERMINATING',
    'TERMINATED',
  ],
  failed: ['CANCELLED', 'ERROR'],
  pending: ['PENDING', 'PREEMPTED', 'RESCHEDULING'],
} as const;
export type LaunchOutcome = keyof typeof LAUNCH_OUTCOME_STATUSES;
export const LAUNCH_OUTCOMES: ReadonlyArray<LaunchOutcome> = [
  'started',
  'failed',
  'pending',
];

/** Minilang for the sessions created within `window` whose status is one of `outcome`'s. */
export const launchOutcomeFilter = (
  window: DateTimeWindow,
  outcome: LaunchOutcome,
): string =>
  `created_at >= ${JSON.stringify(window.after)} & created_at < ${JSON.stringify(window.before)} & status in [${LAUNCH_OUTCOME_STATUSES[outcome].map((status) => JSON.stringify(status)).join(',')}]`;

/** Mean and median of the time from creation to scheduling, over the sessions that have both. */
export const queueWaitStats = (
  sessions: ReadonlyArray<{
    readonly created_at?: string | null;
    readonly scheduled_at?: string | null;
  }>,
): { sampled: number; meanMs: number; medianMs: number } | null => {
  const waits = sessions
    .flatMap(({ created_at, scheduled_at }) =>
      created_at && scheduled_at
        ? [new Date(scheduled_at).getTime() - new Date(created_at).getTime()]
        : [],
    )
    .filter((wait) => Number.isFinite(wait) && wait >= 0)
    .sort((a, b) => a - b);
  if (waits.length === 0) return null;
  const middle = Math.floor(waits.length / 2);
  return {
    sampled: waits.length,
    meanMs: waits.reduce((sum, wait) => sum + wait, 0) / waits.length,
    medianMs:
      waits.length % 2 === 1
        ? waits[middle]
        : (waits[middle - 1] + waits[middle]) / 2,
  };
};
