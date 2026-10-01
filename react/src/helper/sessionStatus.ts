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

/**
 * Session statuses during which the manager is BUILDING the kernel set, so a
 * kernel that has reached RUNNING is one the session no longer waits for.
 */
const CREATING_SESSION_STATUSES: ReadonlyArray<string> = [
  'PREPARING',
  'PREPARED',
  'PULLING',
  'CREATING',
];

export interface SessionKernelProgress {
  /** Which way the kernel set is moving, or `null` when it is not moving. */
  phase: 'creating' | 'terminating' | null;
  /** Kernels that have reached the phase's target status. */
  done: number;
  /** Kernels the session is expected to have. */
  total: number;
  /** `done / total` in percent, or `undefined` when the fraction says nothing. */
  percent: number | undefined;
}

interface SessionKernelProgressInput {
  status?: string | null;
  cluster_size?: number | null;
  kernel_nodes?: {
    readonly edges: ReadonlyArray<
      | { readonly node?: { readonly status?: string | null } | null }
      | null
      | undefined
    >;
  } | null;
}

/**
 * How far a session is through starting up or tearing down, counted from the
 * kernels themselves.
 *
 * The count has to happen here because the manager ignores every argument of
 * `kernel_nodes`: `resolve_kernel_nodes` loads the session's whole kernel set
 * through a dataloader and reports `count` as its unfiltered length, so a
 * `filter: "status == ..."` alias returns the same number for every status.
 *
 * `percent` stays `undefined` — the caller draws an indeterminate ring — when
 * the fraction would be meaningless: a settled session, a single-node session
 * (0% or 100%, never anything between), or one whose kernels were not selected.
 */
export const getSessionKernelProgress = (
  session: SessionKernelProgressInput,
): SessionKernelProgress => {
  const status = session.status ?? '';
  const phase = CREATING_SESSION_STATUSES.includes(status)
    ? 'creating'
    : status === 'TERMINATING'
      ? 'terminating'
      : null;

  const edges = session.kernel_nodes?.edges ?? [];
  const doneStatus = phase === 'terminating' ? 'TERMINATED' : 'RUNNING';
  const done = edges.filter((edge) => edge?.node?.status === doneStatus).length;

  const clusterSize = session.cluster_size;
  const total =
    typeof clusterSize === 'number' && clusterSize > 0
      ? clusterSize
      : edges.length;

  const percent =
    phase === null || total <= 1 || edges.length === 0
      ? undefined
      : Math.min(100, Math.max(0, Math.round((done / total) * 100)));

  return { phase, done, total, percent };
};
