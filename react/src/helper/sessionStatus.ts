/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */

/**
 * Session statuses the manager is still moving through — the session is being
 * scheduled, started, restarted or torn down, so its kernel set is in flux.
 */
const TRANSITIONAL_SESSION_STATUSES: ReadonlyArray<string> = [
  'RESERVED',
  'PREEMPTED',
  'RESCHEDULING',
  'SCHEDULED',
  'RESTARTING',
  'TERMINATING',
  'PENDING',
  'PREPARING',
  'PREPARED',
  'CREATING',
  'PULLING',
];

export const isTransitionalSessionStatus = (status?: string | null): boolean =>
  TRANSITIONAL_SESSION_STATUSES.includes(status ?? '');
