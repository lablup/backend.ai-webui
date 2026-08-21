/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  AdminUsageReportViewUtilizationQuery,
  AdminUsageReportViewUtilizationQuery$data,
} from '../../__generated__/AdminUsageReportViewUtilizationQuery.graphql';
import { UserStatsData, useSuspendedBackendaiClient } from '../../hooks';
import { useSuspenseTanQuery } from '../../hooks/reactQueryAlias';
import UsageReportDocument from './UsageReportDocument';
import {
  UsageReportPresetIds,
  ensureUsageReportPresets,
} from './adminPresetSeed';
import {
  UsagePeriodRecord,
  assembleAdminUsageReportData,
  buildAllocationByDayFromRecords,
  buildTopUsers,
  parseUsagePeriodRecords,
} from './adminUsageReportData';
import { UsageReportPeriod } from './types';
import {
  buildAllocationByDay,
  buildUtilizationPercentByDay,
  percentFromAvgValues,
} from './userUsageReportData';
import { toLocalId } from 'backend.ai-ui';
import dayjs from 'dayjs';
import React from 'react';
import { graphql, useLazyLoadQuery, useRelayEnvironment } from 'react-relay';

interface AdminUsageReportViewProps {
  period: UsageReportPeriod;
  periodLabel: string;
  scopeLabel: string;
}

const AdminUsageReportView: React.FC<AdminUsageReportViewProps> = (props) => {
  'use memo';
  const relayEnvironment = useRelayEnvironment();
  // Idempotent: query the report's reserved presets, create the missing ones.
  const { data: presetIds } = useSuspenseTanQuery<UsageReportPresetIds>({
    queryKey: ['UsageReportAdminPresets'],
    staleTime: Infinity,
    queryFn: () => ensureUsageReportPresets(relayEnvironment),
  });
  return <AdminAllocationLoader {...props} presetIds={presetIds} />;
};

interface AdminAllocationLoaderProps extends AdminUsageReportViewProps {
  presetIds: UsageReportPresetIds;
}

interface AdminAllocationResult {
  records: UsagePeriodRecord[];
  statsBins: UserStatsData[];
  recordsAvailable: boolean;
}

const AdminAllocationLoader: React.FC<AdminAllocationLoaderProps> = (props) => {
  'use memo';
  const baiClient = useSuspendedBackendaiClient();
  const { period } = props;
  const { data: allocation } = useSuspenseTanQuery<AdminAllocationResult>({
    queryKey: ['UsageReportAdminAllocation', period.startDate, period.endDate],
    queryFn: async () => {
      const [periodResult, statsResult] = await Promise.allSettled([
        baiClient.resources.usage_per_period(
          dayjs(period.startDate).format('YYYYMMDD'),
          dayjs(period.endDate).format('YYYYMMDD'),
        ),
        baiClient.resources.admin_stats(),
      ]);
      return {
        records:
          periodResult.status === 'fulfilled'
            ? parseUsagePeriodRecords(periodResult.value)
            : [],
        statsBins:
          statsResult.status === 'fulfilled' && Array.isArray(statsResult.value)
            ? statsResult.value
            : [],
        recordsAvailable: periodResult.status === 'fulfilled',
      };
    },
  });
  return <AdminUtilizationMetrics {...props} allocation={allocation} />;
};

interface AdminUtilizationMetricsProps extends AdminAllocationLoaderProps {
  allocation: AdminAllocationResult;
}

type PresetResult = AdminUsageReportViewUtilizationQuery$data['cpu_series'];

const seriesPoints = (result: PresetResult) => result?.result?.[0]?.values;

const lastValueOf = (result: PresetResult): string | null => {
  const values = result?.result?.[0]?.values;
  return values?.length ? values[values.length - 1].value : null;
};

const meanOf = (byDay: Record<string, number>): number | null => {
  const values = Object.values(byDay);
  return values.length
    ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
    : null;
};

const AdminUtilizationMetrics: React.FC<AdminUtilizationMetricsProps> = ({
  period,
  periodLabel,
  scopeLabel,
  presetIds,
  allocation,
}) => {
  'use memo';
  const periodStart = dayjs(period.startDate).startOf('day');
  const now = dayjs();
  const periodEndRaw = dayjs(period.endDate).endOf('day');
  const periodEnd = periodEndRaw.isAfter(now) ? now : periodEndRaw;
  const periodHours = Math.max(
    1,
    Math.ceil(periodEnd.diff(periodStart, 'hour', true)),
  );

  const queryData = useLazyLoadQuery<AdminUsageReportViewUtilizationQuery>(
    graphql`
      query AdminUsageReportViewUtilizationQuery(
        $cpuSeriesId: ID!
        $gpuSeriesId: ID!
        $memSeriesId: ID!
        $cpuAvgId: ID!
        $gpuAvgId: ID!
        $memAvgId: ID!
        $seriesRange: QueryTimeRangeInput!
        $avgRange: QueryTimeRangeInput!
        $avgWindow: String!
      ) {
        cpu_series: prometheusQueryPresetResult(
          id: $cpuSeriesId
          timeRange: $seriesRange
        ) {
          result {
            values {
              timestamp
              value
            }
          }
        }
        gpu_series: prometheusQueryPresetResult(
          id: $gpuSeriesId
          timeRange: $seriesRange
        ) {
          result {
            values {
              timestamp
              value
            }
          }
        }
        mem_series: prometheusQueryPresetResult(
          id: $memSeriesId
          timeRange: $seriesRange
        ) {
          result {
            values {
              timestamp
              value
            }
          }
        }
        cpu_avg: prometheusQueryPresetResult(
          id: $cpuAvgId
          timeRange: $avgRange
          timeWindow: $avgWindow
        ) {
          result {
            values {
              timestamp
              value
            }
          }
        }
        gpu_avg: prometheusQueryPresetResult(
          id: $gpuAvgId
          timeRange: $avgRange
          timeWindow: $avgWindow
        ) {
          result {
            values {
              timestamp
              value
            }
          }
        }
        mem_avg: prometheusQueryPresetResult(
          id: $memAvgId
          timeRange: $avgRange
          timeWindow: $avgWindow
        ) {
          result {
            values {
              timestamp
              value
            }
          }
        }
      }
    `,
    {
      cpuSeriesId: toLocalId(presetIds.cpuUtilSeries),
      gpuSeriesId: toLocalId(presetIds.gpuUtilSeries),
      memSeriesId: toLocalId(presetIds.memUtilSeries),
      cpuAvgId: toLocalId(presetIds.cpuUtilAvg),
      gpuAvgId: toLocalId(presetIds.gpuUtilAvg),
      memAvgId: toLocalId(presetIds.memUtilAvg),
      // Hourly samples, averaged into daily buckets client-side (as in W2).
      seriesRange: {
        start: periodStart.toISOString(),
        end: periodEnd.toISOString(),
        step: '1h',
      },
      // Single evaluation at period end; `{window}` reaches back over it.
      avgRange: {
        start: periodEnd.toISOString(),
        end: periodEnd.toISOString(),
        step: '1h',
      },
      avgWindow: `${periodHours}h`,
    },
    { fetchPolicy: 'store-and-network' },
  );

  // The seeded ratio templates already yield percent; no capacity series.
  const cpuByDay = buildUtilizationPercentByDay(
    seriesPoints(queryData.cpu_series),
    null,
    period,
  );
  const gpuByDay = buildUtilizationPercentByDay(
    seriesPoints(queryData.gpu_series),
    null,
    period,
  );
  const memByDay = buildUtilizationPercentByDay(
    seriesPoints(queryData.mem_series),
    null,
    period,
  );

  const data = assembleAdminUsageReportData({
    period,
    allocationByDay: allocation.recordsAvailable
      ? buildAllocationByDayFromRecords(allocation.records, period)
      : buildAllocationByDay(allocation.statsBins, period),
    allocationComplete: allocation.recordsAvailable,
    topUsers: buildTopUsers(allocation.records, period),
    utilizationByDay: { cpu: cpuByDay, gpu: gpuByDay, mem: memByDay },
    utilizationAvgs: {
      cpuPercent:
        percentFromAvgValues(lastValueOf(queryData.cpu_avg), null) ??
        meanOf(cpuByDay),
      gpuPercent:
        percentFromAvgValues(lastValueOf(queryData.gpu_avg), null) ??
        meanOf(gpuByDay),
      memPercent:
        percentFromAvgValues(lastValueOf(queryData.mem_avg), null) ??
        meanOf(memByDay),
    },
  });

  return (
    <UsageReportDocument
      data={data}
      periodLabel={periodLabel}
      scopeLabel={scopeLabel}
    />
  );
};

export default AdminUsageReportView;
