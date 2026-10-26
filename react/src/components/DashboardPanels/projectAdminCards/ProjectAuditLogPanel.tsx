/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type {
  AuditLogFilter,
  ProjectAuditLogPanelQuery,
} from '../../../__generated__/ProjectAuditLogPanelQuery.graphql';
import { useBAIPaginationOptionState } from '../../../hooks/reactPaginationQueryOptions';
import SuccessFailureChart from '../charts/SuccessFailureChart';
import SuccessFailureStats from '../charts/SuccessFailureStats';
import {
  readSuccessFailure,
  successFailureVariables,
  type Outcome,
} from '../countAliases';
import MemberCard, { NoProjectText } from '../memberCards/MemberCard';
import {
  AUDIT_FAILURE_STATUSES,
  FAILURES_ONLY_FILTER,
  isFailuresOnlyFilter,
} from '../memberCards/memberCardData';
import { withinWindow, type DateTimeWindow } from '../timeRange';
import type { PanelComponentProps } from '../types';
import { adminProjectId, projectAuditScope } from './projectCardData';
import { Switch } from '@lablup/ui-common/Switch';
import {
  BAIAuditLogNodes,
  BAIFlex,
  filterOutNullAndUndefined,
} from 'backend.ai-ui';
import React, { useDeferredValue } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

const VISIBLE_COLUMNS = new Set([
  'createdAt',
  'triggeredBy',
  'operation',
  'entityType',
  'status',
  'description',
]);

export const auditOutcomeFilter = (
  outcome: Outcome,
  window: DateTimeWindow,
): AuditLogFilter => ({
  ...withinWindow('createdAt', window),
  status:
    outcome === 'success'
      ? { equals: 'SUCCESS' }
      : { in: [...AUDIT_FAILURE_STATUSES] },
});

const ProjectAuditLog: React.FC<{
  projectId: string;
  range: string;
  timeRange: DateTimeWindow;
  failuresOnly: boolean;
  fetchKey: string;
  onShowFailures: () => void;
}> = ({
  projectId,
  range,
  timeRange,
  failuresOnly,
  fetchKey,
  onShowFailures,
}) => {
  'use memo';
  const { t } = useTranslation();
  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionState({ current: 1, pageSize: 5 });
  const { buckets, variables: countVariables } = successFailureVariables(
    auditOutcomeFilter,
    range,
    timeRange,
  );
  const variables: ProjectAuditLogPanelQuery['variables'] = {
    scope: projectAuditScope(projectId),
    filter: {
      ...withinWindow('createdAt', timeRange),
      ...(failuresOnly ? FAILURES_ONLY_FILTER : {}),
    },
    limit: baiPaginationOption.limit,
    offset: baiPaginationOption.offset,
    ...countVariables,
  };
  const deferredVariables = useDeferredValue(variables);
  const data = useLazyLoadQuery<ProjectAuditLogPanelQuery>(
    graphql`
      query ProjectAuditLogPanelQuery(
        $scope: AuditLogScope!
        $filter: AuditLogFilter!
        $limit: Int!
        $offset: Int!
        $success: AuditLogFilter!
        $failure: AuditLogFilter!
        $previousSuccess: AuditLogFilter!
        $previousFailure: AuditLogFilter!
        $s0: AuditLogFilter
        $s0On: Boolean!
        $s1: AuditLogFilter
        $s1On: Boolean!
        $s2: AuditLogFilter
        $s2On: Boolean!
        $s3: AuditLogFilter
        $s3On: Boolean!
        $s4: AuditLogFilter
        $s4On: Boolean!
        $s5: AuditLogFilter
        $s5On: Boolean!
        $s6: AuditLogFilter
        $s6On: Boolean!
        $s7: AuditLogFilter
        $s7On: Boolean!
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
        logs: scopedAuditLogsV2(
          scope: $scope
          filter: $filter
          orderBy: [{ field: CREATED_AT, direction: DESC }]
          limit: $limit
          offset: $offset
        ) {
          count
          edges {
            node {
              ...BAIAuditLogNodesFragment
            }
          }
        }
        success: scopedAuditLogsV2(scope: $scope, filter: $success, limit: 1) {
          count
        }
        failure: scopedAuditLogsV2(scope: $scope, filter: $failure, limit: 1) {
          count
        }
        previousSuccess: scopedAuditLogsV2(
          scope: $scope
          filter: $previousSuccess
          limit: 1
        ) {
          count
        }
        previousFailure: scopedAuditLogsV2(
          scope: $scope
          filter: $previousFailure
          limit: 1
        ) {
          count
        }
        s0: scopedAuditLogsV2(scope: $scope, filter: $s0, limit: 1)
          @include(if: $s0On) {
          count
        }
        s1: scopedAuditLogsV2(scope: $scope, filter: $s1, limit: 1)
          @include(if: $s1On) {
          count
        }
        s2: scopedAuditLogsV2(scope: $scope, filter: $s2, limit: 1)
          @include(if: $s2On) {
          count
        }
        s3: scopedAuditLogsV2(scope: $scope, filter: $s3, limit: 1)
          @include(if: $s3On) {
          count
        }
        s4: scopedAuditLogsV2(scope: $scope, filter: $s4, limit: 1)
          @include(if: $s4On) {
          count
        }
        s5: scopedAuditLogsV2(scope: $scope, filter: $s5, limit: 1)
          @include(if: $s5On) {
          count
        }
        s6: scopedAuditLogsV2(scope: $scope, filter: $s6, limit: 1)
          @include(if: $s6On) {
          count
        }
        s7: scopedAuditLogsV2(scope: $scope, filter: $s7, limit: 1)
          @include(if: $s7On) {
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
    deferredVariables,
    { fetchPolicy: 'store-and-network', fetchKey },
  );
  const counts = readSuccessFailure(data, buckets.length);

  return (
    <BAIFlex direction="column" align="stretch" gap="sm">
      <SuccessFailureStats
        counts={counts}
        showTrend={false}
        onClickFailure={failuresOnly ? undefined : onShowFailures}
      />
      <SuccessFailureChart
        buckets={buckets}
        successTrend={counts.successTrend}
        failureTrend={counts.failureTrend}
        labels={{
          success: t('dashboard.card.Succeeded'),
          failure: t('dashboard.card.Failed'),
          chart: t('dashboard.card.AuditLogTrend'),
        }}
      />
      <BAIAuditLogNodes
        auditLogFrgmt={filterOutNullAndUndefined(
          data.logs?.edges.map((edge) => edge?.node),
        )}
        disableSorter
        loading={deferredVariables !== variables}
        customizeColumns={(columns) =>
          columns
            .filter((column) => VISIBLE_COLUMNS.has(String(column.key)))
            .map((column) => ({ ...column, defaultHidden: false }))
        }
        pagination={{
          pageSize: tablePaginationOption.pageSize,
          current: tablePaginationOption.current,
          total: data.logs?.count ?? 0,
          onChange: (current, pageSize) =>
            setTablePaginationOption({ current, pageSize }),
        }}
      />
    </BAIFlex>
  );
};

/** The audit log of the project and the entities in it over the card's range; "failures only" is saved on the board. */
const ProjectAuditLogPanel: React.FC<PanelComponentProps> = ({
  panel,
  scope,
  vars,
  fetchKey,
  onChangeFilter,
}) => {
  'use memo';
  const { t } = useTranslation();
  const projectId = adminProjectId(scope);
  const failuresOnly = isFailuresOnlyFilter(panel.filter);
  const setFailuresOnly = (next: boolean) =>
    onChangeFilter?.(next ? FAILURES_ONLY_FILTER : null);

  return (
    <MemberCard
      title={t('auditLog.AuditLog')}
      tooltip={t('dashboard.card.ProjectAuditLogTooltip')}
      fetchKey={fetchKey}
      extra={
        <Switch
          size="sm"
          value={failuresOnly}
          onChange={(checked) => setFailuresOnly(checked)}
          disabled={!onChangeFilter}
        >
          {t('dashboard.card.FailuresOnly')}
        </Switch>
      }
    >
      {(key) =>
        projectId ? (
          <ProjectAuditLog
            // A new filter starts on the first page.
            key={String(failuresOnly)}
            projectId={projectId}
            range={vars.range}
            timeRange={vars.timeRange}
            failuresOnly={failuresOnly}
            fetchKey={key}
            onShowFailures={() => setFailuresOnly(true)}
          />
        ) : (
          <NoProjectText />
        )
      }
    </MemberCard>
  );
};

export default ProjectAuditLogPanel;
