/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { AuditLogPanelHistoryQuery } from '../../../__generated__/AuditLogPanelHistoryQuery.graphql';
import type {
  AuditLogFilter,
  AuditLogPanelQuery,
  AuditLogPanelQuery$data,
  AuditLogScope,
} from '../../../__generated__/AuditLogPanelQuery.graphql';
import { useSuspendedBackendaiClient } from '../../../hooks';
import { useBAIPaginationOptionState } from '../../../hooks/reactPaginationQueryOptions';
import type { CardScope } from '../cardScope';
import SuccessFailureStats from '../charts/SuccessFailureStats';
import {
  readSuccessFailure,
  successFailureVariables,
  type Outcome,
} from '../countAliases';
import {
  AUDIT_FAILURE_STATUSES,
  FAILURES_ONLY_FILTER,
  isFailuresOnlyFilter,
} from '../memberCards/memberCardData';
import { projectAuditScope } from '../projectAdminCards/projectCardData';
import { withinWindow, type DateTimeWindow } from '../timeRange';
import type { PanelComponentProps } from '../types';
import ScopedCard from './ScopedCard';
import {
  BAIAuditLogNodes,
  BAIFlex,
  BAISwitch,
  BAIText,
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

type CountData = Parameters<typeof readSuccessFailure>[2];

/** The counts that cannot change any more; refetched only when a bucket settles or on a manual refresh. */
const AuditLogHistory: React.FC<{
  variables: AuditLogPanelHistoryQuery['variables'];
  fetchKey: string;
  children: (data: CountData) => React.ReactNode;
}> = ({ variables, fetchKey, children }) => {
  'use memo';
  const data = useLazyLoadQuery<AuditLogPanelHistoryQuery>(
    graphql`
      query AuditLogPanelHistoryQuery(
        $scope: AuditLogScope!
        $previousSuccess: AuditLogFilter
        $previousFailure: AuditLogFilter
        $previousOn: Boolean!
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
        previousSuccess: scopedAuditLogsV2(
          scope: $scope
          filter: $previousSuccess
          limit: 1
        ) @include(if: $previousOn) @catch(to: NULL) {
          count
        }
        previousFailure: scopedAuditLogsV2(
          scope: $scope
          filter: $previousFailure
          limit: 1
        ) @include(if: $previousOn) @catch(to: NULL) {
          count
        }
        s0: scopedAuditLogsV2(scope: $scope, filter: $s0, limit: 1)
          @include(if: $s0On)
          @catch(to: NULL) {
          count
        }
        s1: scopedAuditLogsV2(scope: $scope, filter: $s1, limit: 1)
          @include(if: $s1On)
          @catch(to: NULL) {
          count
        }
        s2: scopedAuditLogsV2(scope: $scope, filter: $s2, limit: 1)
          @include(if: $s2On)
          @catch(to: NULL) {
          count
        }
        s3: scopedAuditLogsV2(scope: $scope, filter: $s3, limit: 1)
          @include(if: $s3On)
          @catch(to: NULL) {
          count
        }
        s4: scopedAuditLogsV2(scope: $scope, filter: $s4, limit: 1)
          @include(if: $s4On)
          @catch(to: NULL) {
          count
        }
        s5: scopedAuditLogsV2(scope: $scope, filter: $s5, limit: 1)
          @include(if: $s5On)
          @catch(to: NULL) {
          count
        }
        s6: scopedAuditLogsV2(scope: $scope, filter: $s6, limit: 1)
          @include(if: $s6On)
          @catch(to: NULL) {
          count
        }
        s7: scopedAuditLogsV2(scope: $scope, filter: $s7, limit: 1)
          @include(if: $s7On)
          @catch(to: NULL) {
          count
        }
        f0: scopedAuditLogsV2(scope: $scope, filter: $f0, limit: 1)
          @include(if: $f0On)
          @catch(to: NULL) {
          count
        }
        f1: scopedAuditLogsV2(scope: $scope, filter: $f1, limit: 1)
          @include(if: $f1On)
          @catch(to: NULL) {
          count
        }
        f2: scopedAuditLogsV2(scope: $scope, filter: $f2, limit: 1)
          @include(if: $f2On)
          @catch(to: NULL) {
          count
        }
        f3: scopedAuditLogsV2(scope: $scope, filter: $f3, limit: 1)
          @include(if: $f3On)
          @catch(to: NULL) {
          count
        }
        f4: scopedAuditLogsV2(scope: $scope, filter: $f4, limit: 1)
          @include(if: $f4On)
          @catch(to: NULL) {
          count
        }
        f5: scopedAuditLogsV2(scope: $scope, filter: $f5, limit: 1)
          @include(if: $f5On)
          @catch(to: NULL) {
          count
        }
        f6: scopedAuditLogsV2(scope: $scope, filter: $f6, limit: 1)
          @include(if: $f6On)
          @catch(to: NULL) {
          count
        }
        f7: scopedAuditLogsV2(scope: $scope, filter: $f7, limit: 1)
          @include(if: $f7On)
          @catch(to: NULL) {
          count
        }
      }
    `,
    variables,
    { fetchPolicy: 'store-and-network', fetchKey },
  );
  return children(data);
};

/** The list and the counts that still move, on the card's refresh. */
const AuditLogLive: React.FC<{
  variables: AuditLogPanelQuery['variables'];
  fetchKey: string;
  children: (data: AuditLogPanelQuery$data) => React.ReactNode;
}> = ({ variables, fetchKey, children }) => {
  'use memo';
  const data = useLazyLoadQuery<AuditLogPanelQuery>(
    graphql`
      query AuditLogPanelQuery(
        $scope: AuditLogScope!
        $filter: AuditLogFilter!
        $limit: Int!
        $offset: Int!
        $previousSuccess: AuditLogFilter
        $previousFailure: AuditLogFilter
        $previousOn: Boolean!
        $liveS0: AuditLogFilter
        $liveF0: AuditLogFilter
        $live0On: Boolean!
        $liveS1: AuditLogFilter
        $liveF1: AuditLogFilter
        $live1On: Boolean!
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
        previousSuccess: scopedAuditLogsV2(
          scope: $scope
          filter: $previousSuccess
          limit: 1
        ) @include(if: $previousOn) @catch(to: NULL) {
          count
        }
        previousFailure: scopedAuditLogsV2(
          scope: $scope
          filter: $previousFailure
          limit: 1
        ) @include(if: $previousOn) @catch(to: NULL) {
          count
        }
        liveS0: scopedAuditLogsV2(scope: $scope, filter: $liveS0, limit: 1)
          @include(if: $live0On)
          @catch(to: NULL) {
          count
        }
        liveF0: scopedAuditLogsV2(scope: $scope, filter: $liveF0, limit: 1)
          @include(if: $live0On)
          @catch(to: NULL) {
          count
        }
        liveS1: scopedAuditLogsV2(scope: $scope, filter: $liveS1, limit: 1)
          @include(if: $live1On)
          @catch(to: NULL) {
          count
        }
        liveF1: scopedAuditLogsV2(scope: $scope, filter: $liveF1, limit: 1)
          @include(if: $live1On)
          @catch(to: NULL) {
          count
        }
      }
    `,
    variables,
    { fetchPolicy: 'store-and-network', fetchKey },
  );
  return children(data);
};

const AuditLogTable: React.FC<{
  scope: AuditLogScope;
  range: string;
  refreshedAt: number;
  failuresOnly: boolean;
  fetchKey: string;
  manualFetchKey: string;
}> = ({
  scope,
  range,
  refreshedAt,
  failuresOnly,
  fetchKey,
  manualFetchKey,
}) => {
  'use memo';
  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionState({ current: 1, pageSize: 5 });
  const { plan, hasHistory, history, live } = successFailureVariables(
    auditOutcomeFilter,
    range,
    refreshedAt,
  );
  const variables = {
    plan,
    hasHistory,
    history: { scope, ...history },
    live: {
      scope,
      filter: {
        ...withinWindow('createdAt', plan.window),
        ...(failuresOnly ? FAILURES_ONLY_FILTER : {}),
      },
      limit: baiPaginationOption.limit,
      offset: baiPaginationOption.offset,
      ...live,
    },
  };
  const deferred = useDeferredValue(variables);

  const renderLog = (
    historyData: CountData | null,
    data: AuditLogPanelQuery$data,
  ) => (
    <BAIFlex direction="column" align="stretch" gap="sm">
      <SuccessFailureStats
        counts={readSuccessFailure(deferred.plan, historyData, data)}
        buckets={deferred.plan.buckets}
      />
      <BAIAuditLogNodes
        auditLogFrgmt={filterOutNullAndUndefined(
          data.logs?.edges.map((edge) => edge?.node),
        )}
        disableSorter
        loading={deferred !== variables}
        customizeColumns={(columns) =>
          columns
            .filter((column) => VISIBLE_COLUMNS.has(String(column.key)))
            .map((column) => ({
              ...column,
              defaultHidden: false,
              ...(column.key === 'description' && {
                render: (
                  _value: unknown,
                  record: { description?: string | null },
                ) =>
                  record.description ? (
                    <BAIText
                      copyable
                      ellipsis={{ tooltip: true }}
                      style={{ width: '100%' }}
                    >
                      {record.description}
                    </BAIText>
                  ) : (
                    '-'
                  ),
              }),
            }))
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

  const withHistory = (
    children: (data: CountData | null) => React.ReactNode,
  ) =>
    deferred.hasHistory ? (
      <AuditLogHistory variables={deferred.history} fetchKey={manualFetchKey}>
        {children}
      </AuditLogHistory>
    ) : (
      children(null)
    );

  return (
    <>
      {/* A sibling, so the history request starts alongside the live one instead of after it. */}
      {withHistory(() => null)}
      <AuditLogLive variables={deferred.live} fetchKey={fetchKey}>
        {(data) => withHistory((historyData) => renderLog(historyData, data))}
      </AuditLogLive>
    </>
  );
};

/** Whose audit log a scope reads: the viewer's own actions, or a project and the entities in it. */
export const auditLogScope = (
  scope: CardScope,
  userId: string,
): AuditLogScope =>
  scope.kind === 'mine'
    ? { triggeredUser: [{ value: userId }] }
    : projectAuditScope(scope.projectId);

/** The audit log in the page's scope over the card's range; "failures only" is saved on the board. */
const AuditLogPanel: React.FC<PanelComponentProps> = ({
  panel,
  scope,
  vars,
  fetchKey,
  manualFetchKey,
  onChangeFilter,
}) => {
  'use memo';
  const { t } = useTranslation();
  const baiClient = useSuspendedBackendaiClient();
  const failuresOnly = isFailuresOnlyFilter(panel.filter);
  const setFailuresOnly = (next: boolean) =>
    onChangeFilter?.(next ? FAILURES_ONLY_FILTER : null);

  return (
    <ScopedCard
      scope={scope}
      fetchKey={fetchKey}
      heading={{
        mine: {
          title: t('dashboard.card.MyActivity'),
          tooltip: t('dashboard.card.MyActivityTooltip'),
        },
        project: {
          title: t('auditLog.AuditLog'),
          tooltip: t('dashboard.card.ProjectAuditLogTooltip'),
        },
      }}
      extra={
        <BAISwitch
          size="sm"
          value={failuresOnly}
          onChange={(checked) => setFailuresOnly(checked)}
          disabled={!onChangeFilter}
        >
          {t('dashboard.card.FailuresOnly')}
        </BAISwitch>
      }
    >
      {(cardScope, key) => (
        <AuditLogTable
          // A new filter starts on the first page.
          key={String(failuresOnly)}
          scope={auditLogScope(cardScope, baiClient.user_uuid)}
          range={vars.range}
          refreshedAt={vars.refreshedAt}
          failuresOnly={failuresOnly}
          fetchKey={key}
          manualFetchKey={manualFetchKey}
        />
      )}
    </ScopedCard>
  );
};

export default AuditLogPanel;
