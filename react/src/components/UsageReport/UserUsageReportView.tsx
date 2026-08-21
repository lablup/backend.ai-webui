/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { UserUsageReportViewMetricNamesQuery } from '../../__generated__/UserUsageReportViewMetricNamesQuery.graphql';
import {
  UserUsageReportViewUtilizationQuery,
  UserUsageReportViewUtilizationQuery$data,
} from '../../__generated__/UserUsageReportViewUtilizationQuery.graphql';
import { useSuspendedBackendaiClient } from '../../hooks';
import { useCurrentUserInfo } from '../../hooks/backendai';
import useUserUsageStats from '../../hooks/useUserUsageStats';
import UsageReportDocument from './UsageReportDocument';
import { UsageReportData, UsageReportPeriod } from './types';
import {
  DailyAllocation,
  assembleUserUsageReportData,
  buildAllocationByDay,
  buildUtilizationPercentByDay,
  percentFromAvgValues,
} from './userUsageReportData';
import { useBAILogger } from 'backend.ai-ui';
import dayjs from 'dayjs';
import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { graphql, useLazyLoadQuery } from 'react-relay';

interface UserUsageReportViewProps {
  period: UsageReportPeriod;
  periodLabel: string;
  scopeLabel: string;
  onData?: (data: UsageReportData) => void;
}

const UserUsageReportView: React.FC<UserUsageReportViewProps> = ({
  period,
  periodLabel,
  scopeLabel,
  onData,
}) => {
  'use memo';
  const baiClient = useSuspendedBackendaiClient();
  const { logger } = useBAILogger();
  const { data: statsData } = useUserUsageStats();
  const allocationByDay = buildAllocationByDay(statsData, period);
  const clusterName: string | null = baiClient._config._endpointHost || null;

  // user_utilization_metric needs manager >= 25.6.0 (spec §5).
  if (!baiClient.supports('user-metrics')) {
    return (
      <UsageReportDocument
        data={assembleUserUsageReportData({
          period,
          allocationByDay,
          utilizationByDay: null,
          utilizationAvgs: {
            cpuPercent: null,
            gpuPercent: null,
            memPercent: null,
          },
          clusterName,
        })}
        periodLabel={periodLabel}
        scopeLabel={scopeLabel}
        onData={onData}
      />
    );
  }
  // Utilization is best-effort (spec §5): a failed metrics query degrades to
  // the allocation-only document instead of erroring the whole report.
  return (
    <ErrorBoundary
      resetKeys={[period.startDate, period.endDate]}
      onError={(error) => {
        logger.warn('usage-report utilization degraded to allocation:', error);
      }}
      fallback={
        <UsageReportDocument
          data={assembleUserUsageReportData({
            period,
            allocationByDay,
            utilizationByDay: { cpu: {}, gpu: {}, mem: {} },
            utilizationAvgs: {
              cpuPercent: null,
              gpuPercent: null,
              memPercent: null,
            },
            clusterName,
          })}
          periodLabel={periodLabel}
          scopeLabel={scopeLabel}
          onData={onData}
        />
      }
    >
      <UserUtilizationLoader
        period={period}
        periodLabel={periodLabel}
        scopeLabel={scopeLabel}
        onData={onData}
        allocationByDay={allocationByDay}
        clusterName={clusterName}
      />
    </ErrorBoundary>
  );
};

interface UserUtilizationLoaderProps extends UserUsageReportViewProps {
  allocationByDay: Record<string, DailyAllocation>;
  clusterName: string | null;
}

// The accelerator util metric name (cuda_util, rocm_util, ...) is only known
// from the metadata query, so the metrics query runs in a nested component.
const UserUtilizationLoader: React.FC<UserUtilizationLoaderProps> = (props) => {
  'use memo';
  const { container_utilization_metric_metadata } =
    useLazyLoadQuery<UserUsageReportViewMetricNamesQuery>(
      graphql`
        query UserUsageReportViewMetricNamesQuery {
          container_utilization_metric_metadata {
            metric_names
          }
        }
      `,
      {},
      { fetchPolicy: 'store-and-network' },
    );
  const gpuMetricName =
    (container_utilization_metric_metadata?.metric_names ?? []).find(
      (name) =>
        name != null && name.endsWith('_util') && !name.startsWith('cpu'),
    ) ?? null;
  return <UserUtilizationMetrics {...props} gpuMetricName={gpuMetricName} />;
};

interface UserUtilizationMetricsProps extends UserUtilizationLoaderProps {
  gpuMetricName: string | null;
}

const UserUtilizationMetrics: React.FC<UserUtilizationMetricsProps> = ({
  period,
  periodLabel,
  scopeLabel,
  onData,
  allocationByDay,
  clusterName,
  gpuMetricName,
}) => {
  'use memo';
  const [userInfo] = useCurrentUserInfo();
  const startUnix = dayjs(period.startDate).startOf('day').unix();
  const endUnix = Math.max(
    startUnix + 1,
    Math.min(dayjs(period.endDate).endOf('day').unix(), dayjs().unix()),
  );
  // Hourly samples, averaged into daily buckets client-side.
  const metricProps = (metricName: string, valueType: string) => ({
    metric_name: metricName,
    start: String(startUnix),
    end: String(endUnix),
    step: '1h',
    value_type: valueType,
  });

  const queryData = useLazyLoadQuery<UserUsageReportViewUtilizationQuery>(
    graphql`
      query UserUsageReportViewUtilizationQuery(
        $user_id: UUID!
        $cpuCurrentProps: UserUtilizationMetricQueryInput!
        $cpuCapacityProps: UserUtilizationMetricQueryInput!
        $memCurrentProps: UserUtilizationMetricQueryInput!
        $memCapacityProps: UserUtilizationMetricQueryInput!
        $gpuCurrentProps: UserUtilizationMetricQueryInput!
        $gpuCapacityProps: UserUtilizationMetricQueryInput!
        $includeGpu: Boolean!
      ) {
        cpu_current: user_utilization_metric(
          user_id: $user_id
          props: $cpuCurrentProps
        ) {
          metrics {
            metric_name
            avg_value
            values {
              timestamp
              value
            }
          }
        }
        cpu_capacity: user_utilization_metric(
          user_id: $user_id
          props: $cpuCapacityProps
        ) {
          metrics {
            metric_name
            avg_value
            values {
              timestamp
              value
            }
          }
        }
        mem_current: user_utilization_metric(
          user_id: $user_id
          props: $memCurrentProps
        ) {
          metrics {
            metric_name
            avg_value
            values {
              timestamp
              value
            }
          }
        }
        mem_capacity: user_utilization_metric(
          user_id: $user_id
          props: $memCapacityProps
        ) {
          metrics {
            metric_name
            avg_value
            values {
              timestamp
              value
            }
          }
        }
        gpu_current: user_utilization_metric(
          user_id: $user_id
          props: $gpuCurrentProps
        ) @include(if: $includeGpu) {
          metrics {
            metric_name
            avg_value
            values {
              timestamp
              value
            }
          }
        }
        gpu_capacity: user_utilization_metric(
          user_id: $user_id
          props: $gpuCapacityProps
        ) @include(if: $includeGpu) {
          metrics {
            metric_name
            avg_value
            values {
              timestamp
              value
            }
          }
        }
      }
    `,
    {
      user_id: userInfo.uuid ?? '',
      cpuCurrentProps: metricProps('cpu_util', 'current'),
      cpuCapacityProps: metricProps('cpu_util', 'capacity'),
      memCurrentProps: metricProps('mem', 'current'),
      memCapacityProps: metricProps('mem', 'capacity'),
      // Placeholder metric name is never executed when $includeGpu is false.
      gpuCurrentProps: metricProps(gpuMetricName ?? 'cpu_util', 'current'),
      gpuCapacityProps: metricProps(gpuMetricName ?? 'cpu_util', 'capacity'),
      includeGpu: gpuMetricName != null,
    },
    { fetchPolicy: 'store-and-network' },
  );

  const firstMetricOf = (
    result: UserUsageReportViewUtilizationQuery$data['cpu_current'] | undefined,
  ) => result?.metrics?.[0];

  const cpuCurrent = firstMetricOf(queryData.cpu_current);
  const cpuCapacity = firstMetricOf(queryData.cpu_capacity);
  const memCurrent = firstMetricOf(queryData.mem_current);
  const memCapacity = firstMetricOf(queryData.mem_capacity);
  const gpuCurrent = firstMetricOf(queryData.gpu_current);
  const gpuCapacity = firstMetricOf(queryData.gpu_capacity);

  const data = assembleUserUsageReportData({
    period,
    allocationByDay,
    utilizationByDay: {
      cpu: buildUtilizationPercentByDay(
        cpuCurrent?.values,
        cpuCapacity?.values,
        period,
      ),
      gpu: buildUtilizationPercentByDay(
        gpuCurrent?.values,
        gpuCapacity?.values,
        period,
      ),
      mem: buildUtilizationPercentByDay(
        memCurrent?.values,
        memCapacity?.values,
        period,
      ),
    },
    utilizationAvgs: {
      cpuPercent: percentFromAvgValues(
        cpuCurrent?.avg_value,
        cpuCapacity?.avg_value,
      ),
      gpuPercent: percentFromAvgValues(
        gpuCurrent?.avg_value,
        gpuCapacity?.avg_value,
      ),
      memPercent: percentFromAvgValues(
        memCurrent?.avg_value,
        memCapacity?.avg_value,
      ),
    },
    clusterName,
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

export default UserUsageReportView;
