/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { FailedOperationsPanelQuery } from '../../../__generated__/FailedOperationsPanelQuery.graphql';
import TrendStat from '../charts/TrendStat';
import {
  bucketCounts,
  bucketVariables,
  countDelta,
  failureSentiment,
  previousWindow,
} from '../countAliases';
import MemberCard, { NoProjectText } from '../memberCards/MemberCard';
import { bucketize, type DateTimeWindow } from '../timeRange';
import type { PanelComponentProps } from '../types';
import { auditOutcomeFilter } from './ProjectAuditLogPanel';
import { adminProjectId, projectAuditScope } from './projectCardData';
import React, { useDeferredValue } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

const failureFilter = (window: DateTimeWindow) =>
  auditOutcomeFilter('failure', window);

const FailedOperationsStat: React.FC<{
  projectId: string;
  range: string;
  timeRange: DateTimeWindow;
  fetchKey: string;
}> = ({ projectId, range, timeRange, fetchKey }) => {
  'use memo';
  const { t } = useTranslation();
  const buckets = bucketize(range, new Date(timeRange.before).getTime());
  const variables = useDeferredValue<FailedOperationsPanelQuery['variables']>({
    scope: projectAuditScope(projectId),
    failure: failureFilter(timeRange),
    previousFailure: failureFilter(previousWindow(timeRange)),
    ...bucketVariables('f', buckets, failureFilter),
  });
  const data = useLazyLoadQuery<FailedOperationsPanelQuery>(
    graphql`
      query FailedOperationsPanelQuery(
        $scope: AuditLogScope!
        $failure: AuditLogFilter!
        $previousFailure: AuditLogFilter!
        $f0: AuditLogFilter
        $f0On: Boolean!
        $f1: AuditLogFilter
        $f1On: Boolean!
        $f2: AuditLogFilter
        $f2On: Boolean!
        $f3: AuditLogFilter
        $f3On: Boolean!
        $f4: AuditLogFilter
        $f4On: Boolean!
        $f5: AuditLogFilter
        $f5On: Boolean!
        $f6: AuditLogFilter
        $f6On: Boolean!
        $f7: AuditLogFilter
        $f7On: Boolean!
      ) {
        failure: scopedAuditLogsV2(scope: $scope, filter: $failure, limit: 1) {
          count
        }
        previousFailure: scopedAuditLogsV2(
          scope: $scope
          filter: $previousFailure
          limit: 1
        ) {
          count
        }
        f0: scopedAuditLogsV2(scope: $scope, filter: $f0, limit: 1)
          @include(if: $f0On) {
          count
        }
        f1: scopedAuditLogsV2(scope: $scope, filter: $f1, limit: 1)
          @include(if: $f1On) {
          count
        }
        f2: scopedAuditLogsV2(scope: $scope, filter: $f2, limit: 1)
          @include(if: $f2On) {
          count
        }
        f3: scopedAuditLogsV2(scope: $scope, filter: $f3, limit: 1)
          @include(if: $f3On) {
          count
        }
        f4: scopedAuditLogsV2(scope: $scope, filter: $f4, limit: 1)
          @include(if: $f4On) {
          count
        }
        f5: scopedAuditLogsV2(scope: $scope, filter: $f5, limit: 1)
          @include(if: $f5On) {
          count
        }
        f6: scopedAuditLogsV2(scope: $scope, filter: $f6, limit: 1)
          @include(if: $f6On) {
          count
        }
        f7: scopedAuditLogsV2(scope: $scope, filter: $f7, limit: 1)
          @include(if: $f7On) {
          count
        }
      }
    `,
    variables,
    { fetchPolicy: 'store-and-network', fetchKey },
  );
  const failure = data.failure?.count ?? 0;
  const delta = countDelta(failure, data.previousFailure?.count ?? 0);
  return (
    <TrendStat
      label={t('dashboard.card.Failed')}
      value={String(failure)}
      description={t('dashboard.card.VsPreviousRange')}
      delta={{ ...delta, sentiment: failureSentiment(delta) }}
      trend={bucketCounts(data, 'f', buckets.length)}
      trendColor="negative"
    />
  );
};

/** Audit log entries of the project that ended in an error or were denied, in the card's range. */
const FailedOperationsPanel: React.FC<PanelComponentProps> = ({
  scope,
  vars,
  fetchKey,
}) => {
  'use memo';
  const { t } = useTranslation();
  const projectId = adminProjectId(scope);
  return (
    <MemberCard
      title={t('dashboard.card.FailedOperations')}
      tooltip={t('dashboard.card.FailedOperationsTooltip')}
      fetchKey={fetchKey}
    >
      {(key) =>
        projectId ? (
          <FailedOperationsStat
            projectId={projectId}
            range={vars.range}
            timeRange={vars.timeRange}
            fetchKey={key}
          />
        ) : (
          <NoProjectText />
        )
      }
    </MemberCard>
  );
};

export default FailedOperationsPanel;
