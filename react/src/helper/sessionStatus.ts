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

export interface SessionKernelBucket {
  /** Bucket label — a kernel status, or the status the bucket collapses into. */
  status: string;
  count: number;
}

/**
 * Kernel statuses the breakdown collapses, per phase, and the order the
 * buckets are shown in. The phase's own buckets always appear, at zero if
 * nothing is in them: "RUNNING 0" during a teardown is what says the session
 * is one kernel away from gone.
 */
const CREATING_BUCKET_ORDER: ReadonlyArray<string> = [
  'RUNNING',
  'CREATING',
  'PULLING',
  'PENDING',
];

const CREATING_BUCKET_OF: Readonly<Record<string, string>> = {
  RUNNING: 'RUNNING',
  PREPARING: 'CREATING',
  PREPARED: 'CREATING',
  CREATING: 'CREATING',
  PULLING: 'PULLING',
  PENDING: 'PENDING',
  SCHEDULED: 'PENDING',
};

const TERMINATING_BUCKET_ORDER: ReadonlyArray<string> = [
  'TERMINATED',
  'TERMINATING',
  'RUNNING',
];

const TERMINATING_BUCKET_OF: Readonly<Record<string, string>> = {
  TERMINATED: 'TERMINATED',
  TERMINATING: 'TERMINATING',
  RUNNING: 'RUNNING',
};

/**
 * Where the session's kernels currently are, as buckets ready to be drawn as a
 * stacked bar: the phase's own buckets first, in progress order, then any
 * status the phase does not name (ERROR, CANCELLED, …) under its own label.
 *
 * Returns `[]` for a settled session — there is no phase to group by.
 */
export const getSessionKernelBreakdown = (
  session: SessionKernelProgressInput,
): Array<SessionKernelBucket> => {
  const { phase } = getSessionKernelProgress(session);
  if (phase === null) {
    return [];
  }

  const [order, collapse] =
    phase === 'terminating'
      ? [TERMINATING_BUCKET_ORDER, TERMINATING_BUCKET_OF]
      : [CREATING_BUCKET_ORDER, CREATING_BUCKET_OF];

  // A Map keeps the phase's buckets ahead of the unexpected ones, which land
  // in the order the kernels report them.
  const counts = new Map<string, number>(order.map((bucket) => [bucket, 0]));
  for (const edge of session.kernel_nodes?.edges ?? []) {
    const status = edge?.node?.status;
    if (!status) {
      continue;
    }
    const bucket = collapse[status] ?? status;
    counts.set(bucket, (counts.get(bucket) ?? 0) + 1);
  }

  return Array.from(counts, ([status, count]) => ({ status, count }));
};
