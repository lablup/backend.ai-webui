/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { AuditLogPanelAdminHistoryQuery } from '../../../__generated__/AuditLogPanelAdminHistoryQuery.graphql';
import type { AuditLogPanelAdminQuery } from '../../../__generated__/AuditLogPanelAdminQuery.graphql';
import type { AuditLogPanelScopedHistoryQuery } from '../../../__generated__/AuditLogPanelScopedHistoryQuery.graphql';
import type {
  AuditLogFilter,
  AuditLogPanelScopedQuery,
  AuditLogPanelScopedQuery$data,
  AuditLogScope,
} from '../../../__generated__/AuditLogPanelScopedQuery.graphql';
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

type LiveVariables = Omit<AuditLogPanelScopedQuery['variables'], 'scope'>;
type HistoryVariables = Omit<
  AuditLogPanelScopedHistoryQuery['variables'],
  'scope'
>;
type LiveData = AuditLogPanelScopedQuery$data;
type CountData = Parameters<typeof readSuccessFailure>[2];

// TODO(needs-backend): BA-8746 - one count grouped by time bucket and status would
// replace the per-bucket success/failure aliases in the four queries below.
interface QueryProps<TVariables, TData> {
  variables: TVariables;
  fetchKey: string;
  children: (data: TData) => React.ReactNode;
}

/**
 * Whose audit log a scope reads: the viewer's own actions, or a project and
 * the entities in it. Null on the superadmin page, which reads
 * `adminAuditLogsV2`: a domain entity scope leaves out the sessions, folders
 * and deployments in it (checked on manager 26.10; ADR 0018).
 */
export const auditLogScope = (
  scope: CardScope,
  userId: string,
): AuditLogScope | null => {
  switch (scope.kind) {
    case 'mine':
      return { triggeredUser: [{ value: userId }] };
    case 'project':
      return projectAuditScope(scope.projectId);
    case 'domain':
      return null;
  }
};

const ScopedAuditLogHistory: React.FC<
  QueryProps<HistoryVariables, CountData> & { scope: AuditLogScope }
> = ({ scope, variables, fetchKey, children }) => {
  'use memo';
  const data = useLazyLoadQuery<AuditLogPanelScopedHistoryQuery>(
    graphql`
      query AuditLogPanelScopedHistoryQuery(
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
    { scope, ...variables },
    { fetchPolicy: 'store-and-network', fetchKey },
  );
  return children(data);
};

const AdminAuditLogHistory: React.FC<
  QueryProps<HistoryVariables, CountData>
> = ({ variables, fetchKey, children }) => {
  'use memo';
  const data = useLazyLoadQuery<AuditLogPanelAdminHistoryQuery>(
    graphql`
      query AuditLogPanelAdminHistoryQuery(
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
        previousSuccess: adminAuditLogsV2(filter: $previousSuccess, limit: 1)
          @include(if: $previousOn)
          @catch(to: NULL) {
          count
        }
        previousFailure: adminAuditLogsV2(filter: $previousFailure, limit: 1)
          @include(if: $previousOn)
          @catch(to: NULL) {
          count
        }
        s0: adminAuditLogsV2(filter: $s0, limit: 1)
          @include(if: $s0On)
          @catch(to: NULL) {
          count
        }
        s1: adminAuditLogsV2(filter: $s1, limit: 1)
          @include(if: $s1On)
          @catch(to: NULL) {
          count
        }
        s2: adminAuditLogsV2(filter: $s2, limit: 1)
          @include(if: $s2On)
          @catch(to: NULL) {
          count
        }
        s3: adminAuditLogsV2(filter: $s3, limit: 1)
          @include(if: $s3On)
          @catch(to: NULL) {
          count
        }
        s4: adminAuditLogsV2(filter: $s4, limit: 1)
          @include(if: $s4On)
          @catch(to: NULL) {
          count
        }
        s5: adminAuditLogsV2(filter: $s5, limit: 1)
          @include(if: $s5On)
          @catch(to: NULL) {
          count
        }
        s6: adminAuditLogsV2(filter: $s6, limit: 1)
          @include(if: $s6On)
          @catch(to: NULL) {
          count
        }
        s7: adminAuditLogsV2(filter: $s7, limit: 1)
          @include(if: $s7On)
          @catch(to: NULL) {
          count
        }
        f0: adminAuditLogsV2(filter: $f0, limit: 1)
          @include(if: $f0On)
          @catch(to: NULL) {
          count
        }
        f1: adminAuditLogsV2(filter: $f1, limit: 1)
          @include(if: $f1On)
          @catch(to: NULL) {
          count
        }
        f2: adminAuditLogsV2(filter: $f2, limit: 1)
          @include(if: $f2On)
          @catch(to: NULL) {
          count
        }
        f3: adminAuditLogsV2(filter: $f3, limit: 1)
          @include(if: $f3On)
          @catch(to: NULL) {
          count
        }
        f4: adminAuditLogsV2(filter: $f4, limit: 1)
          @include(if: $f4On)
          @catch(to: NULL) {
          count
        }
        f5: adminAuditLogsV2(filter: $f5, limit: 1)
          @include(if: $f5On)
          @catch(to: NULL) {
          count
        }
        f6: adminAuditLogsV2(filter: $f6, limit: 1)
          @include(if: $f6On)
          @catch(to: NULL) {
          count
        }
        f7: adminAuditLogsV2(filter: $f7, limit: 1)
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

const ScopedAuditLog: React.FC<
  QueryProps<LiveVariables, LiveData> & { scope: AuditLogScope }
> = ({ scope, variables, fetchKey, children }) => {
  'use memo';
  const data = useLazyLoadQuery<AuditLogPanelScopedQuery>(
    graphql`
      query AuditLogPanelScopedQuery(
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
    { scope, ...variables },
    { fetchPolicy: 'store-and-network', fetchKey },
  );
  return children(data);
};

const AdminAuditLog: React.FC<QueryProps<LiveVariables, LiveData>> = ({
  variables,
  fetchKey,
  children,
}) => {
  'use memo';
  const data = useLazyLoadQuery<AuditLogPanelAdminQuery>(
    graphql`
      query AuditLogPanelAdminQuery(
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
        logs: adminAuditLogsV2(
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
        previousSuccess: adminAuditLogsV2(filter: $previousSuccess, limit: 1)
          @include(if: $previousOn)
          @catch(to: NULL) {
          count
        }
        previousFailure: adminAuditLogsV2(filter: $previousFailure, limit: 1)
          @include(if: $previousOn)
          @catch(to: NULL) {
          count
        }
        liveS0: adminAuditLogsV2(filter: $liveS0, limit: 1)
          @include(if: $live0On)
          @catch(to: NULL) {
          count
        }
        liveF0: adminAuditLogsV2(filter: $liveF0, limit: 1)
          @include(if: $live0On)
          @catch(to: NULL) {
          count
        }
        liveS1: adminAuditLogsV2(filter: $liveS1, limit: 1)
          @include(if: $live1On)
          @catch(to: NULL) {
          count
        }
        liveF1: adminAuditLogsV2(filter: $liveF1, limit: 1)
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
  scope: AuditLogScope | null;
  /** The viewer's own actions: every row's actor is the viewer, so the column is left out. */
  hideTriggeredBy: boolean;
  range: string;
  refreshedAt: number;
  failuresOnly: boolean;
  fetchKey: string;
  manualFetchKey: string;
}> = ({
  scope,
  hideTriggeredBy,
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
    history,
    live: {
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

  const renderLog = (historyData: CountData | null, data: LiveData) => (
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
            .filter(
              (column) =>
                VISIBLE_COLUMNS.has(String(column.key)) &&
                !(hideTriggeredBy && column.key === 'triggeredBy'),
            )
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
    !deferred.hasHistory ? (
      children(null)
    ) : scope ? (
      <ScopedAuditLogHistory
        scope={scope}
        variables={deferred.history}
        fetchKey={manualFetchKey}
      >
        {children}
      </ScopedAuditLogHistory>
    ) : (
      <AdminAuditLogHistory
        variables={deferred.history}
        fetchKey={manualFetchKey}
      >
        {children}
      </AdminAuditLogHistory>
    );

  return (
    <>
      {/* A sibling, so the history request starts alongside the live one instead of after it. */}
      {withHistory(() => null)}
      {scope ? (
        <ScopedAuditLog
          scope={scope}
          variables={deferred.live}
          fetchKey={fetchKey}
        >
          {(data) => withHistory((historyData) => renderLog(historyData, data))}
        </ScopedAuditLog>
      ) : (
        <AdminAuditLog variables={deferred.live} fetchKey={fetchKey}>
          {(data) => withHistory((historyData) => renderLog(historyData, data))}
        </AdminAuditLog>
      )}
    </>
  );
};

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
        domain: {
          title: t('auditLog.AuditLog'),
          tooltip: t('dashboard.card.ClusterAuditLogTooltip'),
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
          hideTriggeredBy={cardScope.kind === 'mine'}
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
