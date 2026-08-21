/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
// Pure view-model builders for the admin-scope report (W3): REST usage records
// and seeded-preset results in, a `UsageReportData` out.
import {
  UsageReportData,
  UsageReportDailyPoint,
  UsageReportPeriod,
  UsageReportTopUser,
  UsageReportUtilizationAvgs,
} from './types';
import {
  DailyAllocation,
  UTILIZATION_RETENTION_DAYS,
  UtilizationByDay,
  listPeriodDays,
} from './userUsageReportData';
import dayjs, { Dayjs } from 'dayjs';

const round1 = (v: number) => Math.round(v * 10) / 10;

/** One per-kernel row of `GET /resource/usage/period`, normalized. */
export interface UsagePeriodRecord {
  email: string | null;
  /** null = payload carries no session identity for this row. */
  sessionId: string | null;
  cpuAllocated: number;
  gpuAllocated: number;
  createdAt: Dayjs | null;
  /** null = still running at fetch time. */
  terminatedAt: Dayjs | null;
}

const toNumber = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const looksLikeKernelRow = (v: object): boolean =>
  'created_at' in v || 'cpu_allocated' in v;

/**
 * The manager returns per-kernel rows grouped per project under `c_infos`,
 * as a dict or list of groups depending on version; accept every nesting.
 */
export const parseUsagePeriodRecords = (
  payload: unknown,
): UsagePeriodRecord[] => {
  const rows: Record<string, unknown>[] = [];
  const visit = (node: unknown) => {
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }
    if (typeof node !== 'object' || node == null) {
      return;
    }
    if (looksLikeKernelRow(node)) {
      rows.push(node as Record<string, unknown>);
      return;
    }
    Object.values(node).forEach(visit);
  };
  visit(payload);
  return rows.map((row) => {
    const created = row.created_at ? dayjs(String(row.created_at)) : null;
    const terminated = row.terminated_at
      ? dayjs(String(row.terminated_at))
      : null;
    return {
      email:
        typeof row.email === 'string' && row.email
          ? row.email
          : typeof row.access_key === 'string' && row.access_key
            ? row.access_key
            : null,
      sessionId:
        typeof row.session_id === 'string' && row.session_id
          ? row.session_id
          : null,
      cpuAllocated: toNumber(row.cpu_allocated),
      gpuAllocated: toNumber(row.gpu_allocated),
      createdAt: created?.isValid() ? created : null,
      terminatedAt: terminated?.isValid() ? terminated : null,
    };
  });
};

const clipPeriodEnd = (period: UsageReportPeriod): Dayjs => {
  const now = dayjs();
  const end = dayjs(period.endDate).endOf('day');
  return end.isAfter(now) ? now : end;
};

const overlapHours = (
  record: UsagePeriodRecord,
  windowStart: Dayjs,
  windowEnd: Dayjs,
): number => {
  if (!record.createdAt) {
    return 0;
  }
  const from = record.createdAt.isAfter(windowStart)
    ? record.createdAt
    : windowStart;
  const rawEnd = record.terminatedAt ?? windowEnd;
  const to = rawEnd.isBefore(windowEnd) ? rawEnd : windowEnd;
  return to.isAfter(from) ? to.diff(from, 'minute') / 60 : 0;
};

/**
 * Per-day allocation from per-kernel records: allocation × overlap hours per
 * day, sessions = sessions launched that day (a multi-container session's
 * kernel rows share one `session_id` and count once). Records cover the whole
 * period, so report-visible days get explicit zeros (zero usage, not missing
 * data).
 */
export const buildAllocationByDayFromRecords = (
  records: UsagePeriodRecord[],
  period: UsageReportPeriod,
): Record<string, DailyAllocation> => {
  const byDay: Record<string, DailyAllocation> = {};
  const periodStart = dayjs(period.startDate).startOf('day');
  const periodEnd = clipPeriodEnd(period);
  listPeriodDays(period).forEach((day) => {
    if (!dayjs(day).startOf('day').isAfter(periodEnd)) {
      byDay[day] = { cpuHours: 0, gpuHours: 0, sessions: 0 };
    }
  });
  const countedSessionIds = new Set<string>();
  records.forEach((record) => {
    if (!record.createdAt) {
      return;
    }
    const launchEntry = byDay[record.createdAt.format('YYYY-MM-DD')];
    if (launchEntry) {
      if (record.sessionId == null) {
        launchEntry.sessions += 1;
      } else if (!countedSessionIds.has(record.sessionId)) {
        countedSessionIds.add(record.sessionId);
        launchEntry.sessions += 1;
      }
    }
    const rawEnd = record.terminatedAt ?? periodEnd;
    const end = rawEnd.isBefore(periodEnd) ? rawEnd : periodEnd;
    let cursor = record.createdAt.isAfter(periodStart)
      ? record.createdAt
      : periodStart;
    while (cursor.isBefore(end)) {
      const nextDayStart = cursor.add(1, 'day').startOf('day');
      const sliceEnd = nextDayStart.isBefore(end) ? nextDayStart : end;
      const entry = byDay[cursor.format('YYYY-MM-DD')];
      if (entry) {
        const hours = sliceEnd.diff(cursor, 'minute') / 60;
        entry.cpuHours += record.cpuAllocated * hours;
        entry.gpuHours += record.gpuAllocated * hours;
      }
      cursor = sliceEnd;
    }
  });
  return byDay;
};

export const buildTopUsers = (
  records: UsagePeriodRecord[],
  period: UsageReportPeriod,
  limit = 10,
): UsageReportTopUser[] => {
  const windowStart = dayjs(period.startDate).startOf('day');
  const windowEnd = clipPeriodEnd(period);
  const byUser = new Map<
    string,
    {
      gpuHours: number;
      cpuHours: number;
      sessionIds: Set<string>;
      unkeyedSessions: number;
    }
  >();
  records.forEach((record) => {
    if (!record.email) {
      return;
    }
    const hours = overlapHours(record, windowStart, windowEnd);
    const entry = byUser.get(record.email) ?? {
      gpuHours: 0,
      cpuHours: 0,
      sessionIds: new Set<string>(),
      unkeyedSessions: 0,
    };
    entry.gpuHours += record.gpuAllocated * hours;
    entry.cpuHours += record.cpuAllocated * hours;
    // Per-kernel rows of one cluster session share a session_id; count once.
    if (record.sessionId == null) {
      entry.unkeyedSessions += 1;
    } else {
      entry.sessionIds.add(record.sessionId);
    }
    byUser.set(record.email, entry);
  });
  return [...byUser.entries()]
    .sort(([, a], [, b]) => b.gpuHours - a.gpuHours || b.cpuHours - a.cpuHours)
    .slice(0, limit)
    .map(([email, entry], index) => ({
      rank: index + 1,
      email,
      gpuHours: round1(entry.gpuHours),
      cpuHours: round1(entry.cpuHours),
      sessions: entry.sessionIds.size + entry.unkeyedSessions,
    }));
};

export const assembleAdminUsageReportData = ({
  period,
  allocationByDay,
  allocationComplete,
  topUsers,
  utilizationByDay,
  utilizationAvgs,
  clusterName,
}: {
  period: UsageReportPeriod;
  allocationByDay: Record<string, DailyAllocation>;
  /** True when built from per-kernel records covering the whole period. */
  allocationComplete: boolean;
  topUsers: UsageReportTopUser[];
  utilizationByDay: UtilizationByDay;
  utilizationAvgs: UsageReportUtilizationAvgs;
  clusterName: string | null;
}): UsageReportData => {
  const days = listPeriodDays(period);
  const dailySeries: UsageReportDailyPoint[] = days.map((date) => {
    const allocation = allocationByDay[date];
    return {
      date,
      cpuUtilPercent: utilizationByDay.cpu[date] ?? null,
      gpuUtilPercent: utilizationByDay.gpu[date] ?? null,
      memUtilPercent: utilizationByDay.mem[date] ?? null,
      gpuHours: allocation ? round1(allocation.gpuHours) : null,
      cpuHours: allocation ? round1(allocation.cpuHours) : null,
      sessions: allocation ? allocation.sessions : null,
    };
  });

  const hasUtil = (p: UsageReportDailyPoint) =>
    p.cpuUtilPercent != null ||
    p.gpuUtilPercent != null ||
    p.memUtilPercent != null;
  const utilCoveredDays = dailySeries.filter(hasUtil).length;
  const allocationCoveredDays = dailySeries.filter(
    (p) => p.cpuHours != null,
  ).length;
  const sumOf = (key: 'gpuHours' | 'cpuHours') => {
    const values = dailySeries
      .map((p) => p[key])
      .filter((v): v is number => v != null);
    return values.length ? round1(values.reduce((a, b) => a + b, 0)) : null;
  };
  const sessionValues = dailySeries
    .map((p) => p.sessions)
    .filter((v): v is number => v != null);

  return {
    scope: 'admin',
    period,
    dailySeries,
    totals: {
      gpuHours: sumOf('gpuHours'),
      cpuHours: sumOf('cpuHours'),
      // Records carry launches per day (sum); the stats-bin fallback carries
      // peak concurrency (max), matching the user-scope semantics.
      sessions: sessionValues.length
        ? allocationComplete
          ? sessionValues.reduce((a, b) => a + b, 0)
          : Math.max(...sessionValues)
        : null,
    },
    utilizationAvgs,
    topUsers,
    coverage: {
      utilizationTruncated:
        utilCoveredDays > 0 && utilCoveredDays < days.length,
      utilizationStartDate: dailySeries.find(hasUtil)?.date ?? null,
      retentionDays: UTILIZATION_RETENTION_DAYS,
      utilizationCoverage: utilCoveredDays / days.length,
      allocationCoverage: allocationCoveredDays / days.length,
      allocationTruncated:
        !allocationComplete &&
        allocationCoveredDays > 0 &&
        allocationCoveredDays < days.length,
    },
    sessionsSemantics: allocationComplete ? 'launched' : 'peakConcurrent',
    generatedAt: dayjs().toISOString(),
    clusterName,
  };
};
