/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */

export type UsageReportScope = 'admin' | 'user';
export type UsageReportPeriodType = 'weekly' | 'monthly';

export interface UsageReportPeriod {
  periodType: UsageReportPeriodType;
  /** Inclusive, `YYYY-MM-DD`. */
  startDate: string;
  /** Inclusive, `YYYY-MM-DD`. */
  endDate: string;
}

export interface UsageReportDailyPoint {
  /** `YYYY-MM-DD`. */
  date: string;
  /** Utilization percentages; null = no data for that day (retention). */
  cpuUtilPercent: number | null;
  gpuUtilPercent: number | null;
  memUtilPercent: number | null;
  /** Allocation figures; null = no data for that day. */
  gpuHours: number | null;
  cpuHours: number | null;
  sessions: number | null;
}

export interface UsageReportTotals {
  gpuHours: number | null;
  cpuHours: number | null;
  sessions: number | null;
}

export interface UsageReportUtilizationAvgs {
  cpuPercent: number | null;
  gpuPercent: number | null;
  memPercent: number | null;
}

export interface UsageReportTopUser {
  rank: number;
  email: string;
  gpuHours: number;
  cpuHours: number;
  sessions: number;
}

export interface UsageReportCoverage {
  /** True when the utilization series does not cover the whole period. */
  utilizationTruncated: boolean;
  /** First date (`YYYY-MM-DD`) with utilization data, null when none. */
  utilizationStartDate: string | null;
  /** Utilization retention window (days), null when unknown. */
  retentionDays: number | null;
}

export interface UsageReportData {
  scope: UsageReportScope;
  period: UsageReportPeriod;
  dailySeries: UsageReportDailyPoint[];
  totals: UsageReportTotals;
  utilizationAvgs: UsageReportUtilizationAvgs;
  /** Admin scope only. */
  topUsers?: UsageReportTopUser[];
  coverage: UsageReportCoverage;
  /** ISO timestamp of report generation. */
  generatedAt: string;
  clusterName: string | null;
}
