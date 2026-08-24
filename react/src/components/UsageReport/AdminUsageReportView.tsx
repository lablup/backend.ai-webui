/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { AdminUsageReportViewDefaultPresetQuery } from '../../__generated__/AdminUsageReportViewDefaultPresetQuery.graphql';
import { AdminUsageReportViewKeypairEmailQuery } from '../../__generated__/AdminUsageReportViewKeypairEmailQuery.graphql';
import { UserStatsData, useSuspendedBackendaiClient } from '../../hooks';
import { useSuspenseTanQuery } from '../../hooks/reactQueryAlias';
import UsageReportDocument from './UsageReportDocument';
import {
  UsageReportPresetLookup,
  resolveUsageReportPresets,
} from './adminDefaultPresets';
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

  // Stats bins cover only the trailing 30 days but count consistently across
  // manager versions; period records on older managers are terminated-only.
  // Prefer bins whenever their window covers the whole period (records still
  // feed the top-users table).
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

  // Utilization is best-effort (spec §5): lookup or Prometheus failures
  // degrade to the allocation-only document, not the error view.
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
      <AdminUtilizationLoader {...props} {...allocationProps} />
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

interface AdminUtilizationLoaderProps
  extends AdminUsageReportViewProps, AdminAllocationProps {}

const AdminUtilizationLoader: React.FC<AdminUtilizationLoaderProps> = (
  props,
) => {
  'use memo';
  const relayEnvironment = useRelayEnvironment();
  // The manager seeds default container-utilization presets via migration;
  // the report consumes them read-only (no WebUI-created presets).
  const { data: lookup } = useSuspenseTanQuery<UsageReportPresetLookup>({
    queryKey: ['UsageReportAdminDefaultPresets'],
    staleTime: Infinity,
    queryFn: () => resolveUsageReportPresets(relayEnvironment),
  });
  if (!lookup.presetId) {
    // No usable seeded preset (pre-26.3 manager): utilization unsupported.
    return (
      <UsageReportDocument
        data={assembleAdminUsageReportData({
          period: props.period,
          allocationByDay: props.allocationByDay,
          allocationComplete: props.allocationComplete,
          sessionsSemantics: props.sessionsSemantics,
          topUsers: props.topUsers,
          clusterName: props.clusterName,
          utilizationByDay: { cpu: {}, gpu: {}, mem: {} },
          utilizationAvgs: {
            cpuPercent: null,
            gpuPercent: null,
            memPercent: null,
          },
          utilizationUnsupported: true,
        })}
        periodLabel={props.periodLabel}
        scopeLabel={props.scopeLabel}
        onData={props.onData}
      />
    );
  }
  return <AdminUtilizationMetrics {...props} lookup={lookup} />;
};

interface AdminUtilizationMetricsProps extends AdminUtilizationLoaderProps {
  lookup: UsageReportPresetLookup;
}

type PresetSeries =
  AdminUsageReportViewDefaultPresetQuery['response']['cpu_result'];

/** Split one grouped-by-value_type execution into current/capacity points. */
const pointsByValueType = (result: PresetSeries, valueType: string) =>
  result?.result
    ?.find((series) =>
      series.metric.some(
        (label) => label.key === 'value_type' && label.value === valueType,
      ),
    )
    ?.values.map((point) => ({
      timestamp: point.timestamp,
      value: point.value,
    })) ?? null;

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
  lookup,
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

  const queryData = useLazyLoadQuery<AdminUsageReportViewDefaultPresetQuery>(
    graphql`
      query AdminUsageReportViewDefaultPresetQuery(
        $presetId: ID!
        $range: QueryTimeRangeInput!
        $cpuOptions: ExecuteQueryDefinitionOptionsInput!
        $memOptions: ExecuteQueryDefinitionOptionsInput!
        $gpuOptions: ExecuteQueryDefinitionOptionsInput!
        $includeGpu: Boolean!
      ) {
        cpu_result: prometheusQueryPresetResult(
          id: $presetId
          timeRange: $range
          options: $cpuOptions
        ) {
          result {
            metric {
              key
              value
            }
            values {
              timestamp
              value
            }
          }
        }
        mem_result: prometheusQueryPresetResult(
          id: $presetId
          timeRange: $range
          options: $memOptions
        ) {
          result {
            metric {
              key
              value
            }
            values {
              timestamp
              value
            }
          }
        }
        gpu_result: prometheusQueryPresetResult(
          id: $presetId
          timeRange: $range
          options: $gpuOptions
        ) @include(if: $includeGpu) {
          result {
            metric {
              key
              value
            }
            values {
              timestamp
              value
            }
          }
        }
      }
    `,
    {
      presetId: toLocalId(lookup.presetId ?? ''),
      // Hourly samples, averaged into daily buckets client-side (as in W2).
      range: {
        start: periodStart.toISOString(),
        end: periodEnd.toISOString(),
        step: '1h',
      },
      cpuOptions: {
        filterLabels: [{ key: 'container_metric_name', value: 'cpu_util' }],
        groupLabels: ['value_type'],
      },
      memOptions: {
        filterLabels: [{ key: 'container_metric_name', value: 'mem' }],
        groupLabels: ['value_type'],
      },
      gpuOptions: {
        filterLabels: [
          {
            key: 'container_metric_name',
            value: lookup.gpuMetricName ?? 'cpu_util',
          },
        ],
        groupLabels: ['value_type'],
      },
      includeGpu: lookup.gpuMetricName != null,
    },
    { fetchPolicy: 'store-and-network' },
  );

  const cpuByDay = buildUtilizationPercentByDay(
    pointsByValueType(queryData.cpu_result, 'current'),
    pointsByValueType(queryData.cpu_result, 'capacity'),
    period,
  );
  const memByDay = buildUtilizationPercentByDay(
    pointsByValueType(queryData.mem_result, 'current'),
    pointsByValueType(queryData.mem_result, 'capacity'),
    period,
  );
  const gpuByDay = queryData.gpu_result
    ? buildUtilizationPercentByDay(
        pointsByValueType(queryData.gpu_result, 'current'),
        pointsByValueType(queryData.gpu_result, 'capacity'),
        period,
      )
    : {};

  const data = assembleAdminUsageReportData({
    period,
    allocationByDay,
    allocationComplete,
    sessionsSemantics,
    topUsers,
    clusterName,
    utilizationByDay: { cpu: cpuByDay, gpu: gpuByDay, mem: memByDay },
    utilizationAvgs: {
      cpuPercent: meanOf(cpuByDay),
      gpuPercent: meanOf(gpuByDay),
      memPercent: meanOf(memByDay),
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

export default AdminUsageReportView;
