/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
// Typed mock provider behind the W1 data-model boundary. W2 (user scope) and
// W3 (admin scope) replace this per scope with real data wiring.
import {
  UsageReportData,
  UsageReportDailyPoint,
  UsageReportPeriod,
  UsageReportScope,
} from './types';
import dayjs from 'dayjs';

// Stock Prometheus retention (FR-3621); mock stand-in until W2/W3.
const MOCK_RETENTION_DAYS = 15;

const seededRandom = (seed: number) => {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
};

const round1 = (v: number) => Math.round(v * 10) / 10;

const sumOf = (
  series: UsageReportDailyPoint[],
  key: 'gpuHours' | 'cpuHours' | 'sessions',
): number | null => {
  const values = series
    .map((p) => p[key])
    .filter((v): v is number => v != null);
  return values.length ? round1(values.reduce((a, b) => a + b, 0)) : null;
};

const avgOf = (
  series: UsageReportDailyPoint[],
  key: 'cpuUtilPercent' | 'gpuUtilPercent' | 'memUtilPercent',
): number | null => {
  const values = series
    .map((p) => p[key])
    .filter((v): v is number => v != null);
  return values.length
    ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
    : null;
};

const MOCK_TOP_USERS: ReadonlyArray<[string, number, number, number]> = [
  ['alice@example.com', 412.5, 3120, 88],
  ['bob@example.com', 301.2, 2410, 71],
  ['researcher3@example.com', 244.0, 1988, 64],
  ['mlops@example.com', 199.8, 1544, 52],
  ['carol@example.com', 121.4, 1102, 41],
  ['dave@example.com', 88.9, 907, 33],
  ['eve@example.com', 61.2, 640, 20],
  ['frank@example.com', 33.0, 412, 12],
];

export const getMockUsageReportData = (
  scope: UsageReportScope,
  period: UsageReportPeriod,
): UsageReportData => {
  const start = dayjs(period.startDate);
  const end = dayjs(period.endDate);
  const nDays = end.diff(start, 'day') + 1;
  const rand = seededRandom(
    (scope === 'admin' ? 7 : 42) + start.valueOf() / 86_400_000,
  );
  const retentionEdge = dayjs().subtract(MOCK_RETENTION_DAYS, 'day');
  const scale = scope === 'admin' ? 38 : 1;

  let utilizationStartDate: string | null = null;
  let truncated = false;
  const dailySeries: UsageReportDailyPoint[] = [];
  for (let i = 0; i < nDays; i++) {
    const day = start.add(i, 'day');
    const inRetention = day.isAfter(retentionEdge) && !day.isAfter(dayjs());
    if (!inRetention) {
      truncated = true;
    } else if (utilizationStartDate === null) {
      utilizationStartDate = day.format('YYYY-MM-DD');
    }
    dailySeries.push({
      date: day.format('YYYY-MM-DD'),
      cpuUtilPercent: inRetention ? Math.round(35 + 40 * rand()) : null,
      gpuUtilPercent: inRetention ? Math.round(30 + 55 * rand()) : null,
      memUtilPercent: inRetention ? Math.round(45 + 35 * rand()) : null,
      gpuHours: round1((2 + 6 * rand()) * scale),
      cpuHours: Math.round((20 + 60 * rand()) * scale),
      sessions: Math.round((1 + 4 * rand()) * scale),
    });
  }

  return {
    scope,
    period,
    dailySeries,
    totals: {
      gpuHours: sumOf(dailySeries, 'gpuHours'),
      cpuHours: sumOf(dailySeries, 'cpuHours'),
      sessions: sumOf(dailySeries, 'sessions'),
    },
    utilizationAvgs: {
      cpuPercent: avgOf(dailySeries, 'cpuUtilPercent'),
      gpuPercent: avgOf(dailySeries, 'gpuUtilPercent'),
      memPercent: avgOf(dailySeries, 'memUtilPercent'),
    },
    topUsers:
      scope === 'admin'
        ? MOCK_TOP_USERS.map(([email, gpuHours, cpuHours, sessions], i) => ({
            rank: i + 1,
            email,
            gpuHours,
            cpuHours,
            sessions,
          }))
        : undefined,
    coverage: {
      utilizationTruncated: truncated,
      utilizationStartDate,
      retentionDays: MOCK_RETENTION_DAYS,
    },
    generatedAt: dayjs().toISOString(),
    clusterName: null,
  };
};
