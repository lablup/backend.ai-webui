/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
// Pure view-model builders for the user-scope report (W2). Relay/REST results
// go in, a `UsageReportData` comes out; components stay presentation-only.
import { UserStatsData } from '../../hooks';
import {
  UsageReportData,
  UsageReportDailyPoint,
  UsageReportPeriod,
  UsageReportUtilizationAvgs,
} from './types';
import dayjs from 'dayjs';

/** `user_stats()` returns trailing-30d allocation figures in 15-minute bins. */
const ALLOCATION_BIN_HOURS = 0.25;

/** Stock Prometheus retention (FR-3621); not discoverable via API. */
export const UTILIZATION_RETENTION_DAYS = 15;

const round1 = (v: number) => Math.round(v * 10) / 10;

const clampPercent = (v: number) => Math.min(100, Math.max(0, v));

export const listPeriodDays = (period: UsageReportPeriod): string[] => {
  const start = dayjs(period.startDate);
  const nDays = dayjs(period.endDate).diff(start, 'day') + 1;
  return Array.from({ length: nDays }, (_, i) =>
    start.add(i, 'day').format('YYYY-MM-DD'),
  );
};

export interface DailyAllocation {
  cpuHours: number;
  gpuHours: number;
  /** Peak concurrent sessions within the day (bins carry no launch counts). */
  sessions: number;
}

export const buildAllocationByDay = (
  stats: UserStatsData[],
  period: UsageReportPeriod,
): Record<string, DailyAllocation> => {
  const byDay: Record<string, DailyAllocation> = {};
  stats.forEach((bin) => {
    const day = dayjs(bin.date * 1000).format('YYYY-MM-DD');
    if (day < period.startDate || day > period.endDate) {
      return;
    }
    const entry = (byDay[day] ??= { cpuHours: 0, gpuHours: 0, sessions: 0 });
    entry.cpuHours += (bin.cpu_allocated?.value ?? 0) * ALLOCATION_BIN_HOURS;
    entry.gpuHours += (bin.gpu_allocated?.value ?? 0) * ALLOCATION_BIN_HOURS;
    entry.sessions = Math.max(entry.sessions, bin.num_sessions?.value ?? 0);
  });
  return byDay;
};

export interface UtilizationMetricPoint {
  timestamp: number | null | undefined;
  value: string | null | undefined;
}

type MetricPointList =
  readonly (UtilizationMetricPoint | null | undefined)[] | null | undefined;

/**
 * Daily mean of current/capacity percent samples. When no capacity series
 * exists at all, `current` values are treated as already-percent.
 */
export const buildUtilizationPercentByDay = (
  currentPoints: MetricPointList,
  capacityPoints: MetricPointList,
  period: UsageReportPeriod,
): Record<string, number> => {
  const capacityByTimestamp = new Map<number, number>();
  capacityPoints?.forEach((point) => {
    const capacity = Number(point?.value);
    if (point?.timestamp != null && Number.isFinite(capacity)) {
      capacityByTimestamp.set(Number(point.timestamp), capacity);
    }
  });
  const sums: Record<string, { sum: number; count: number }> = {};
  currentPoints?.forEach((point) => {
    const current = Number(point?.value);
    if (point?.timestamp == null || !Number.isFinite(current)) {
      return;
    }
    const timestamp = Number(point.timestamp);
    const capacity = capacityByTimestamp.get(timestamp);
    let percent: number | null = null;
    if (capacity != null && capacity > 0) {
      percent = (current / capacity) * 100;
    } else if (capacityByTimestamp.size === 0) {
      percent = current;
    }
    if (percent == null || !Number.isFinite(percent)) {
      return;
    }
    const day = dayjs(timestamp * 1000).format('YYYY-MM-DD');
    if (day < period.startDate || day > period.endDate) {
      return;
    }
    const entry = (sums[day] ??= { sum: 0, count: 0 });
    entry.sum += clampPercent(percent);
    entry.count += 1;
  });
  return Object.fromEntries(
    Object.entries(sums).map(([day, { sum, count }]) => [
      day,
      Math.round(sum / count),
    ]),
  );
};

/** KPI percent from the API's range `avg_value`s (current ÷ capacity). */
export const meanOfDailyPercents = (
  byDay: Record<string, number>,
): number | null => {
  const values = Object.values(byDay);
  return values.length
    ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
    : null;
};

export interface UtilizationByDay {
  cpu: Record<string, number>;
  gpu: Record<string, number>;
  mem: Record<string, number>;
}

export const assembleUserUsageReportData = ({
  period,
  allocationByDay,
  utilizationByDay,
  utilizationAvgs,
  clusterName,
}: {
  period: UsageReportPeriod;
  allocationByDay: Record<string, DailyAllocation>;
  /** null = user-metrics unsupported by the manager. */
  utilizationByDay: UtilizationByDay | null;
  utilizationAvgs: UsageReportUtilizationAvgs;
  clusterName: string | null;
}): UsageReportData => {
  const days = listPeriodDays(period);
  const dailySeries: UsageReportDailyPoint[] = days.map((date) => {
    const allocation = allocationByDay[date];
    return {
      date,
      cpuUtilPercent: utilizationByDay?.cpu[date] ?? null,
      gpuUtilPercent: utilizationByDay?.gpu[date] ?? null,
      memUtilPercent: utilizationByDay?.mem[date] ?? null,
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
    scope: 'user',
    period,
    dailySeries,
    totals: {
      gpuHours: sumOf('gpuHours'),
      cpuHours: sumOf('cpuHours'),
      // Peak concurrent sessions in the period; see DailyAllocation.sessions.
      sessions: sessionValues.length ? Math.max(...sessionValues) : null,
    },
    utilizationAvgs,
    coverage: {
      utilizationTruncated:
        utilizationByDay != null &&
        utilCoveredDays > 0 &&
        utilCoveredDays < days.length,
      utilizationStartDate: dailySeries.find(hasUtil)?.date ?? null,
      retentionDays: utilizationByDay ? UTILIZATION_RETENTION_DAYS : null,
      utilizationCoverage: utilizationByDay
        ? utilCoveredDays / days.length
        : null,
      allocationCoverage: allocationCoveredDays / days.length,
      allocationTruncated:
        allocationCoveredDays > 0 && allocationCoveredDays < days.length,
      utilizationUnsupported: utilizationByDay == null,
    },
    sessionsSemantics: 'peakConcurrent',
    generatedAt: dayjs().toISOString(),
    clusterName,
  };
};
