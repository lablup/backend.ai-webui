/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type {
  IdleCheckItem,
  IdleChecks,
} from '../components/ComputeSessionNodeItems/SessionIdleChecks';

/** A user may own dozens of sessions: the watcher pages this many at most. */
export const SESSION_MONITOR_FETCH_LIMIT = 50;
/** Rows the popover shows; the rest collapse into an "N more" link. */
export const SESSION_MONITOR_VISIBLE_LIMIT = 5;
export const SESSION_MONITOR_POLL_INTERVAL_MS = 60_000;
export const SESSION_MONITOR_NOT_FINISHED_FILTER =
  'status != "TERMINATED" & status != "CANCELLED"';
/** Seconds left that raise an idle-termination alert, loosest first. */
export const IDLE_ALERT_THRESHOLDS_SEC = [30 * 60, 10 * 60] as const;
/** Sessions under this many seconds count toward the attention badge. */
export const ATTENTION_THRESHOLD_SEC = 30 * 60;
const ALERT_RECORD_TTL_MS = 24 * 60 * 60 * 1000;
export const SESSION_MONITOR_ALERT_STORAGE_KEY =
  'backendaiwebui.sessionMonitor.alerted';

export type IdleCheckKey = keyof IdleChecks;

export type NearestIdleCheck = {
  key: IdleCheckKey;
  remaining: number;
  remainingTimeType: IdleCheckItem['remaining_time_type'];
};

export type SessionMonitorEntry = {
  id: string;
  name: string | null;
  status: string | null;
  createdAt: string | null;
  nearest: NearestIdleCheck | null;
  /** Epoch ms the nearest idle check expires at; null without a check. */
  deadline: number | null;
};

const STARTING_STATUSES = [
  'PENDING',
  'SCHEDULED',
  'PREPARING',
  'PULLING',
  'PREPARED',
  'CREATING',
];
/** Server-side counts: the page is capped, the counts must not be. */
export const SESSION_MONITOR_RUNNING_FILTER = 'status == "RUNNING"';
export const SESSION_MONITOR_STARTING_FILTER = `status in [${STARTING_STATUSES.map(
  (status) => `"${status}"`,
).join(',')}]`;

export const isStartingStatus = (status: string | null | undefined) =>
  !!status && STARTING_STATUSES.includes(status);

export const isRunningStatus = (status: string | null | undefined) =>
  status === 'RUNNING';

/**
 * The check that will end the session soonest. A `grace_period` item counts
 * the time until the first reclamation decision, not until termination, so
 * it is not a deadline.
 */
export const getNearestIdleCheck = (
  idleChecks: IdleChecks | null | undefined,
): NearestIdleCheck | null => {
  let nearest: NearestIdleCheck | null = null;
  for (const key of [
    'utilization',
    'network_timeout',
    'session_lifetime',
  ] as const) {
    const item = idleChecks?.[key];
    if (
      !item ||
      item.remaining_time_type !== 'expire_after' ||
      typeof item.remaining !== 'number' ||
      item.remaining < 0
    ) {
      continue;
    }
    if (!nearest || item.remaining < nearest.remaining) {
      nearest = {
        key,
        remaining: item.remaining,
        remainingTimeType: item.remaining_time_type,
      };
    }
  }
  return nearest;
};

export const toSessionMonitorEntry = (
  node: {
    id: string;
    name?: string | null;
    status?: string | null;
    created_at?: string | null;
  },
  idleChecks: IdleChecks | null | undefined,
  fetchedAt: number,
): SessionMonitorEntry => {
  const nearest = getNearestIdleCheck(idleChecks);
  return {
    id: node.id,
    name: node.name ?? null,
    status: node.status ?? null,
    createdAt: node.created_at ?? null,
    nearest,
    deadline: nearest ? fetchedAt + nearest.remaining * 1000 : null,
  };
};

export type SessionMonitorSort = 'deadline' | 'newest' | 'name';
export const SESSION_MONITOR_ROW_OPTIONS = [3, 5, 10, 20] as const;

/** Default: soonest deadline first, then newest session first. */
export const rankSessions = (
  entries: ReadonlyArray<SessionMonitorEntry>,
  sort: SessionMonitorSort = 'deadline',
): SessionMonitorEntry[] =>
  [...entries].sort((a, b) => {
    if (sort === 'name') {
      return (a.name ?? '').localeCompare(b.name ?? '');
    }
    if (sort === 'deadline') {
      if (a.deadline !== null && b.deadline !== null) {
        if (a.deadline !== b.deadline) return a.deadline - b.deadline;
      } else if (a.deadline !== null) {
        return -1;
      } else if (b.deadline !== null) {
        return 1;
      }
    }
    return (b.createdAt ?? '').localeCompare(a.createdAt ?? '');
  });

export type SessionMonitorSummary = {
  fetchedAt: number;
  total: number;
  running: number;
  starting: number;
  attentionCount: number;
  nearest: SessionMonitorEntry | null;
};

/**
 * `counts` come from the server and cover the whole scope; `attentionCount`
 * and `nearest` can only see the fetched page (`idle_checks` is not sortable
 * server-side), which is the user's own sessions in the alerting mode.
 */
export const summarizeSessions = (
  entries: ReadonlyArray<SessionMonitorEntry>,
  total: number,
  fetchedAt: number,
  counts?: { running: number; starting: number },
): SessionMonitorSummary => {
  const ranked = rankSessions(entries);
  const nearest = ranked.find((entry) => entry.deadline !== null) ?? null;
  return {
    fetchedAt,
    total,
    running:
      counts?.running ??
      entries.filter((entry) => isRunningStatus(entry.status)).length,
    starting:
      counts?.starting ??
      entries.filter((entry) => isStartingStatus(entry.status)).length,
    attentionCount: entries.filter(
      (entry) =>
        entry.deadline !== null &&
        entry.deadline - fetchedAt <= ATTENTION_THRESHOLD_SEC * 1000,
    ).length,
    nearest,
  };
};

/** Prefixes `(N) ` to the title, replacing any earlier badge; N=0 strips it. */
export const applyAttentionTitleBadge = (title: string, count: number) => {
  const base = title.replace(/^\(\d+\) /, '');
  return count > 0 ? `(${count}) ${base}` : base;
};

export type AlertedRecords = Record<string, number>;

export const alertRecordKey = (sessionId: string, thresholdSec: number) =>
  `${sessionId}:${thresholdSec}`;

export const readAlertedRecords = (
  storage: Pick<Storage, 'getItem'> | undefined,
  now: number,
): AlertedRecords => {
  try {
    const raw = storage?.getItem(SESSION_MONITOR_ALERT_STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : {};
    if (!parsed || typeof parsed !== 'object') return {};
    return Object.fromEntries(
      Object.entries(parsed as Record<string, unknown>).filter(
        ([, at]) => typeof at === 'number' && now - at < ALERT_RECORD_TTL_MS,
      ),
    ) as AlertedRecords;
  } catch {
    return {};
  }
};

export const writeAlertedRecords = (
  storage: Pick<Storage, 'setItem'> | undefined,
  records: AlertedRecords,
) => {
  try {
    storage?.setItem(
      SESSION_MONITOR_ALERT_STORAGE_KEY,
      JSON.stringify(records),
    );
  } catch {
    // Storage may be unavailable (private mode); alerts then repeat per load.
  }
};

export type DueAlert = {
  entry: SessionMonitorEntry;
  thresholdSec: number;
};

/**
 * One alert per session per pass, at the tightest threshold it has crossed;
 * every crossed threshold is recorded so a later pass does not re-raise the
 * looser one.
 */
export const pickDueAlerts = (
  entries: ReadonlyArray<SessionMonitorEntry>,
  alerted: AlertedRecords,
  now: number,
): { due: DueAlert[]; alerted: AlertedRecords } => {
  const next: AlertedRecords = { ...alerted };
  const due: DueAlert[] = [];
  for (const entry of entries) {
    if (entry.deadline === null || !isRunningStatus(entry.status)) continue;
    const remainingSec = (entry.deadline - now) / 1000;
    const crossed = IDLE_ALERT_THRESHOLDS_SEC.filter(
      (threshold) => remainingSec <= threshold,
    );
    if (crossed.length === 0) continue;
    const unseen = crossed.filter(
      (threshold) => !(alertRecordKey(entry.id, threshold) in next),
    );
    if (unseen.length === 0) continue;
    const tightest = Math.min(...unseen);
    due.push({ entry, thresholdSec: tightest });
    crossed.forEach((threshold) => {
      next[alertRecordKey(entry.id, threshold)] = now;
    });
  }
  return { due, alerted: next };
};
