/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { AdminUsageReportViewKeypairEmailQuery } from '../../__generated__/AdminUsageReportViewKeypairEmailQuery.graphql';
import { UserStatsData, useSuspendedBackendaiClient } from '../../hooks';
import { useSuspenseTanQuery } from '../../hooks/reactQueryAlias';
import UsageReportDocument from './UsageReportDocument';
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
import { buildAllocationByDay } from './userUsageReportData';
import dayjs from 'dayjs';
import React from 'react';
import { fetchQuery, graphql, useRelayEnvironment } from 'react-relay';
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

// TODO(needs-backend): cluster-scope utilization series/averages (FR-3645).
// Prometheus-backed utilization is exposed per user only, and the
// prometheusQueryPreset* APIs belong to the deployment domain and must not be
// reused here, so admin utilization renders as unsupported until FR-3645.
const AdminUsageReportView: React.FC<AdminUsageReportViewProps> = ({
  period,
  periodLabel,
  scopeLabel,
  onData,
}) => {
  'use memo';
  const baiClient = useSuspendedBackendaiClient();
  const relayEnvironment = useRelayEnvironment();
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

  const data = assembleAdminUsageReportData({
    period,
    allocationByDay: useStatsBins
      ? buildAllocationByDay(allocation.statsBins, period)
      : buildAllocationByDayFromRecords(allocation.records, period),
    allocationComplete: statsCoverPeriod || allocation.recordsAvailable,
    sessionsSemantics: useStatsBins ? 'peakConcurrent' : 'launched',
    topUsers: allocation.topUsers,
    clusterName: baiClient._config._endpointHost || null,
    utilizationByDay: { cpu: {}, gpu: {}, mem: {} },
    utilizationAvgs: { cpuPercent: null, gpuPercent: null, memPercent: null },
    utilizationUnsupported: true,
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
