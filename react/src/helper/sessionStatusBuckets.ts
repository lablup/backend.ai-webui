/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { SessionV2Status } from 'backend.ai-ui';

/** Gated behind the client's `session-preemption-statuses` feature flag. */
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
 * manager's `SessionV2Status` enum actually accepts. Callers read
 * `supports('session-preemption-statuses')` and pass it in.
 */
export const getSessionV2StatusBuckets = (
  supportsPreemptionStatuses: boolean,
): Record<SessionStatusCategory, ReadonlyArray<SessionV2Status>> => ({
  running: supportsPreemptionStatuses
    ? RUNNING_STATUSES
    : RUNNING_STATUSES.filter(
        (status) => !PREEMPTION_STATUSES.includes(status),
      ),
  finished: FINISHED_STATUSES,
});
