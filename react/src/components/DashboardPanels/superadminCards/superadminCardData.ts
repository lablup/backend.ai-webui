/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { AuditLogFilter } from '../../../__generated__/FailuresByEntityTypePanelQuery.graphql';
import { AUDIT_FAILURE_STATUSES } from '../memberCards/memberCardData';
import { withinWindow, type DateTimeWindow } from '../timeRange';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';

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

/**
 * The days a window touches, as `YYYY-MM-DD` in local time: a usage bucket is
 * one day, so a range shorter than a day reads the day (or two) it falls in.
 */
export const usageDays = (
  window: DateTimeWindow,
): { first: string; last: string } => ({
  first: dayjs(window.after).format('YYYY-MM-DD'),
  // `before` is exclusive.
  last: dayjs(window.before).subtract(1, 'ms').format('YYYY-MM-DD'),
});

/**
 * `periodStart` within `days`, as two ANDed exclusive bounds (one
 * `DateFilter` with both bounds applies only `before`, as `withinWindow` notes).
 */
export const usageDaysFilter = ({
  first,
  last,
}: {
  first: string;
  last: string;
}) => ({
  AND: [
    {
      periodStart: {
        after: dayjs(first).subtract(1, 'day').format('YYYY-MM-DD'),
      },
    },
    { periodStart: { before: dayjs(last).add(1, 'day').format('YYYY-MM-DD') } },
  ],
});

const toNumber = (value: unknown): number => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

type SlotEntry = { readonly resourceType: string; readonly quantity: unknown };

/** One slot's quantity from a `ResourceSlot`'s entries; 0 when absent. */
export const slotQuantity = (
  entries: ReadonlyArray<SlotEntry> | null | undefined,
  resourceType: string,
): number =>
  toNumber(
    _.find(entries, (entry) => entry.resourceType === resourceType)?.quantity,
  );

const SECONDS_PER_HOUR = 3600;
const BYTES_PER_GIB = 1024 ** 3;

/** A usage bucket's CPU (core-seconds) as core-hours. */
export const coreHours = (coreSeconds: number): number =>
  coreSeconds / SECONDS_PER_HOUR;

/** A usage bucket's memory (byte-seconds) as GiB-hours. */
export const gibHours = (byteSeconds: number): number =>
  byteSeconds / SECONDS_PER_HOUR / BYTES_PER_GIB;

/** A number with at most `digits` fraction digits, grouped. */
export const formatAmount = (value: number, digits = 1): string =>
  value.toLocaleString(undefined, { maximumFractionDigits: digits });

export interface UsageBucketRow {
  readonly projectId: string;
  readonly resourceGroupName: string;
  readonly project?: { readonly basicInfo: { readonly name: string } } | null;
  readonly resourceUsage: { readonly entries: ReadonlyArray<SlotEntry> };
}

export interface ProjectUsageTotal {
  projectId: string;
  projectName: string | null;
  /** The resource groups the summed buckets came from, by name. */
  resourceGroups: Array<string>;
  /** Core-seconds. */
  cpu: number;
  /** Byte-seconds. */
  mem: number;
}

/** Each project's buckets added up per slot, the heaviest CPU use first. */
export const sumUsageByProject = (
  rows: ReadonlyArray<UsageBucketRow>,
): Array<ProjectUsageTotal> =>
  _.orderBy(
    _.map(_.groupBy(rows, 'projectId'), (buckets, projectId) => ({
      projectId,
      projectName:
        _.find(buckets, (bucket) => !!bucket.project)?.project?.basicInfo
          .name ?? null,
      resourceGroups: _.sortBy(_.uniq(_.map(buckets, 'resourceGroupName'))),
      cpu: _.sumBy(buckets, (bucket) =>
        slotQuantity(bucket.resourceUsage.entries, 'cpu'),
      ),
      mem: _.sumBy(buckets, (bucket) =>
        slotQuantity(bucket.resourceUsage.entries, 'mem'),
      ),
    })),
    ['cpu', 'mem'],
    ['desc', 'desc'],
  );
