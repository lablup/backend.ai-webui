/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSuspendedBackendaiClient } from '.';
import type { SessionV2Status } from 'backend.ai-ui';

/**
 * Manager 26.8.0 added `PREEMPTED` / `RESCHEDULING` to `SessionV2Status`
 * (backend.ai#13126). An older manager rejects the *whole* query on enum
 * coercion, so sending them blanks the page instead of degrading (FR-3673).
 */
const PREEMPTION_STATUSES_MIN_MANAGER_VERSION = '26.8.0';
const PREEMPTION_STATUSES: ReadonlyArray<SessionV2Status> = [
  'PREEMPTED',
  'RESCHEDULING',
];

/** Sessions still occupying (or about to occupy) agent resources. */
const RUNNING_STATUSES: ReadonlyArray<SessionV2Status> = [
  'PENDING',
  'SCHEDULED',
  'PREPARING',
  'PREPARED',
  'CREATING',
  'RUNNING',
  'DEPRIORITIZING',
  'PREEMPTED',
  'RESCHEDULING',
  'TERMINATING',
];

/** Sessions kept for history only. */
const FINISHED_STATUSES: ReadonlyArray<SessionV2Status> = [
  'TERMINATED',
  'CANCELLED',
];

export const sessionStatusCategoryValues = ['running', 'finished'] as const;
export type SessionStatusCategory =
  (typeof sessionStatusCategoryValues)[number];

/**
 * The running / finished status buckets, narrowed to what the connected
 * manager's `SessionV2Status` enum actually accepts.
 */
export const useSessionV2StatusBuckets = (): Record<
  SessionStatusCategory,
  ReadonlyArray<SessionV2Status>
> => {
  'use memo';
  const baiClient = useSuspendedBackendaiClient();
  const supportsPreemptionStatuses = baiClient.isManagerVersionCompatibleWith(
    PREEMPTION_STATUSES_MIN_MANAGER_VERSION,
  );

  return {
    running: supportsPreemptionStatuses
      ? RUNNING_STATUSES
      : RUNNING_STATUSES.filter(
          (status) => !PREEMPTION_STATUSES.includes(status),
        ),
    finished: FINISHED_STATUSES,
  };
};
