/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { AdminUsageReportViewKeypairEmailQuery } from '../../__generated__/AdminUsageReportViewKeypairEmailQuery.graphql';
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
import {
  UsageReportData,
  UsageReportPeriod,
  UsageReportTopUser,
} from './types';
import {
  DailyAllocation,
  buildAllocationByDay,
  buildUtilizationPercentByDay,
  percentFromAvgValues,
} from './userUsageReportData';
import { toLocalId, useBAILogger } from 'backend.ai-ui';
import dayjs from 'dayjs';
import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import {
  fetchQuery,
  graphql,
  useLazyLoadQuery,
  useRelayEnvironment,
} from 'react-relay';
import type { IEnvironment } from 'relay-runtime';

interface AdminUsageReportViewProps {
  period: UsageReportPeriod;
  periodLabel: string;
  scopeLabel: string;
  onData?: (data: UsageReportData) => void;
}

interface AdminAllocationResult {
  records: UsagePeriodRecord[];
  statsBins: UserStatsData[];
  recordsAvailable: boolean;
  topUsers: UsageReportTopUser[];
}

const AdminUsageReportView: React.FC<AdminUsageReportViewProps> = (props) => {
  'use memo';
  const { period, periodLabel, scopeLabel, onData } = props;
  const baiClient = useSuspendedBackendaiClient();
  const relayEnvironment = useRelayEnvironment();
  const { logger } = useBAILogger();
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
      const records =
        periodResult.status === 'fulfilled'
          ? parseUsagePeriodRecords(periodResult.value)
          : [];
      return {
        records,
        statsBins:
          statsResult.status === 'fulfilled' && Array.isArray(statsResult.value)
            ? statsResult.value
            : [],
        recordsAvailable: periodResult.status === 'fulfilled',
        topUsers: await resolveTopUserEmails(
          relayEnvironment,
          buildTopUsers(records, period),
        ),
      };
    },
  });

  // Stats bins include running sessions; period records on older managers are
  // terminated-only. Prefer bins whenever their trailing-30d window covers the
  // whole period (records still feed the top-users table).
  const statsCoverPeriod =
    allocation.statsBins.length > 0 &&
    !dayjs(period.startDate).isBefore(dayjs().subtract(30, 'day'), 'day');
  const useStatsBins = statsCoverPeriod || !allocation.recordsAvailable;
  const allocationProps: AdminAllocationProps = {
    allocationByDay: useStatsBins
      ? buildAllocationByDay(allocation.statsBins, period)
      : buildAllocationByDayFromRecords(allocation.records, period),
    allocationComplete: statsCoverPeriod || allocation.recordsAvailable,
    sessionsSemantics: useStatsBins ? 'peakConcurrent' : 'launched',
    topUsers: allocation.topUsers,
    clusterName: baiClient._config._endpointHost || null,
  };

  // Utilization is best-effort (spec §5): preset seeding or Prometheus
  // failures degrade to the allocation-only document, not the error view.
  return (
    <ErrorBoundary
      resetKeys={[period.startDate, period.endDate]}
      onError={(error) => {
        logger.warn('usage-report utilization degraded to allocation:', error);
      }}
      fallback={
        <UsageReportDocument
          data={assembleAdminUsageReportData({
            period,
            ...allocationProps,
            utilizationByDay: { cpu: {}, gpu: {}, mem: {} },
            utilizationAvgs: {
              cpuPercent: null,
              gpuPercent: null,
              memPercent: null,
            },
          })}
          periodLabel={periodLabel}
          scopeLabel={scopeLabel}
          onData={onData}
        />
      }
    >
      <AdminPresetLoader {...props} {...allocationProps} />
    </ErrorBoundary>
  );
};

interface AdminAllocationProps {
  allocationByDay: Record<string, DailyAllocation>;
  allocationComplete: boolean;
  sessionsSemantics: 'launched' | 'peakConcurrent';
  topUsers: UsageReportTopUser[];
  clusterName: string | null;
}

// Older managers omit `email` from usage-period rows; recover it from the
// keypair (KeyPair.user_id is the owner's email), best-effort per row.
const topUserEmailQuery = graphql`
  query AdminUsageReportViewKeypairEmailQuery($accessKey: String!) {
    keypair(access_key: $accessKey) {
      user_id
    }
  }
`;

const resolveTopUserEmails = (
  environment: IEnvironment,
  topUsers: UsageReportTopUser[],
): Promise<UsageReportTopUser[]> =>
  Promise.all(
    topUsers.map(async (user) => {
      if (user.email || !user.accessKey) {
        return user;
      }
      const result = await fetchQuery<AdminUsageReportViewKeypairEmailQuery>(
        environment,
        topUserEmailQuery,
        { accessKey: user.accessKey },
      )
        .toPromise()
        .catch(() => null);
      return { ...user, email: result?.keypair?.user_id ?? null };
    }),
  );

interface AdminPresetLoaderProps
  extends AdminUsageReportViewProps, AdminAllocationProps {}

const AdminPresetLoader: React.FC<AdminPresetLoaderProps> = (props) => {
  'use memo';
  const relayEnvironment = useRelayEnvironment();
  // Idempotent: query the report's reserved presets, create the missing ones.
  const { data: presetIds } = useSuspenseTanQuery<UsageReportPresetIds>({
    queryKey: ['UsageReportAdminPresets'],
    staleTime: Infinity,
    queryFn: () => ensureUsageReportPresets(relayEnvironment),
  });
  return <AdminUtilizationMetrics {...props} presetIds={presetIds} />;
};

interface AdminUtilizationMetricsProps extends AdminPresetLoaderProps {
  presetIds: UsageReportPresetIds;
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
  onData,
  presetIds,
  allocationByDay,
  allocationComplete,
  sessionsSemantics,
  topUsers,
  clusterName,
}) => {
  'use memo';
  const periodStart = dayjs(period.startDate).startOf('day');
  const now = dayjs();
  const periodEndRaw = dayjs(period.endDate).endOf('day');
  const clampedEnd = periodEndRaw.isAfter(now) ? now : periodEndRaw;
  // A future ?periodStart= must not yield start > end (Prometheus rejects it).
  const periodEnd = clampedEnd.isBefore(periodStart)
    ? periodStart.add(1, 'second')
    : clampedEnd;
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
    allocationByDay,
    allocationComplete,
    sessionsSemantics,
    topUsers,
    clusterName,
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
      onData={onData}
    />
  );
};

export default AdminUsageReportView;
