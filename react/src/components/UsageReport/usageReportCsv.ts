/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { UsageReportData } from './types';

const escapeCell = (value: string | number | null): string => {
  if (value === null) {
    return '';
  }
  if (typeof value === 'number') {
    return String(Math.round(value * 100) / 100);
  }
  return /[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
};

const toLine = (cells: (string | number | null)[]): string =>
  cells.map(escapeCell).join(',');

/**
 * One CSV per report: the daily series, a `total` row carrying the period
 * averages/totals, and (admin scope) an appended top-users section.
 * Headers are stable machine-readable keys, not localized labels.
 */
export const buildUsageReportCsv = (data: UsageReportData): string => {
  const lines: string[] = [
    toLine([
      'date',
      'cpuUtil',
      'gpuUtil',
      'memUtil',
      'gpuHours',
      'cpuHours',
      'sessions',
    ]),
  ];
  data.dailySeries.forEach((point) => {
    lines.push(
      toLine([
        point.date,
        point.cpuUtilPercent,
        point.gpuUtilPercent,
        point.memUtilPercent,
        point.gpuHours,
        point.cpuHours,
        point.sessions,
      ]),
    );
  });
  lines.push(
    toLine([
      'total',
      data.utilizationAvgs.cpuPercent,
      data.utilizationAvgs.gpuPercent,
      data.utilizationAvgs.memPercent,
      data.totals.gpuHours,
      data.totals.cpuHours,
      data.totals.sessions,
    ]),
  );

  if (data.scope === 'admin' && data.topUsers?.length) {
    lines.push('');
    lines.push(
      toLine(['rank', 'user', 'accessKey', 'gpuHours', 'cpuHours', 'sessions']),
    );
    data.topUsers.forEach((user) => {
      lines.push(
        toLine([
          user.rank,
          user.email,
          user.accessKey,
          user.gpuHours,
          user.cpuHours,
          user.sessions,
        ]),
      );
    });
  }

  return lines.join('\n');
};
