/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { PendingSessionsPanelAttemptsQuery } from '../../../__generated__/PendingSessionsPanelAttemptsQuery.graphql';
import type { PendingSessionsPanelReasonQuery } from '../../../__generated__/PendingSessionsPanelReasonQuery.graphql';
import { useBAIPaginationOptionState } from '../../../hooks/reactPaginationQueryOptions';
import { legacyScopeId, type CardScope } from '../cardScope';
import {
  legacySessionIdFilter,
  pendingReason,
} from '../projectAdminCards/projectCardData';
import type { PanelComponentProps } from '../types';
import { useOpenSessionDetail } from '../useOpenSessionDetail';
import './PendingSessionsPanel.css';
import ScopedCard from './ScopedCard';
import SessionList from './SessionList';
import { Text } from '@lablup/ui-common/Text';
import {
  BAIFlex,
  BAILink,
  BAISchedulingHistoryTable,
  BAISessionNodesV2,
  BAISkeleton,
  BAIText,
  filterOutNullAndUndefined,
  type SessionV2InList,
} from 'backend.ai-ui';
import React, { Suspense, useDeferredValue } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

const PAGE_SIZE = 5;
const ATTEMPT_COLUMNS = ['updatedAt', 'phase', 'result', 'attempts', 'message'];
const VISIBLE_COLUMNS = new Set(['name', 'owner', 'elapsedTime']);
const PENDING_FILTER = { status: { in: ['PENDING' as const] } };
// Longest waiting first.
const ORDER_BY = [{ field: 'CREATED_AT' as const, direction: 'ASC' as const }];

type Reasons = Readonly<Record<string, string | null>>;

/** The legacy session node's scheduler message for the listed sessions, in one query. */
const PendingReasons: React.FC<{
  scope: CardScope;
  sessionIds: ReadonlyArray<string>;
  fetchKey: string;
  children: (reasons: Reasons) => React.ReactNode;
}> = ({ scope, sessionIds, fetchKey, children }) => {
  'use memo';
  const data = useLazyLoadQuery<PendingSessionsPanelReasonQuery>(
    graphql`
      query PendingSessionsPanelReasonQuery(
        $scopeId: ScopeField!
        $filter: String!
        $first: Int!
        $skip: Boolean!
      ) {
        compute_session_nodes(
          scope_id: $scopeId
          filter: $filter
          first: $first
        ) @skip(if: $skip) @catch(to: RESULT) {
          edges {
            node {
              row_id
              status_info
              status_data
            }
          }
        }
      }
    `,
    {
      scopeId: legacyScopeId(scope),
      filter: legacySessionIdFilter(sessionIds),
      first: Math.max(1, sessionIds.length),
      skip: sessionIds.length === 0,
    },
    { fetchPolicy: 'store-and-network', fetchKey },
  );
  // A failed lookup leaves every reason unknown instead of failing the card.
  const connection = data.compute_session_nodes;
  return children(
    Object.fromEntries(
      filterOutNullAndUndefined(
        connection?.ok ? connection.value?.edges.map((edge) => edge?.node) : [],
      ).map((node) => [
        String(node.row_id),
        pendingReason(node.status_info, node.status_data),
      ]),
    ),
  );
};

/** The session's scheduling attempts, newest first. */
const SchedulingAttempts: React.FC<{ sessionId: string }> = ({ sessionId }) => {
  'use memo';
  const data = useLazyLoadQuery<PendingSessionsPanelAttemptsQuery>(
    graphql`
      query PendingSessionsPanelAttemptsQuery($scope: SessionScope!) {
        sessionScopedSchedulingHistories(
          scope: $scope
          orderBy: [{ field: UPDATED_AT, direction: DESC }]
          limit: 5
        ) {
          edges {
            node {
              ...BAISchedulingHistoryTableFragment
            }
          }
        }
      }
    `,
    { scope: { sessionId } },
    { fetchPolicy: 'store-and-network' },
  );
  return (
    <BAIFlex
      direction="column"
      align="stretch"
      className="bai-pending-attempts"
    >
      <BAISchedulingHistoryTable
        schedulingHistoryFrgmt={filterOutNullAndUndefined(
          data.sessionScopedSchedulingHistories?.edges.map(
            (edge) => edge?.node,
          ),
        )}
        disableSorter
        pagination={false}
        scroll={{}}
        customizeColumns={(columns) =>
          columns
            .filter((column) => ATTEMPT_COLUMNS.includes(String(column.key)))
            .map((column) =>
              column.key === 'message'
                ? {
                    ...column,
                    onCell: () => ({ style: { width: '100%', maxWidth: 0 } }),
                    render: (
                      _value: unknown,
                      record: { message?: string | null },
                    ) =>
                      record.message ? (
                        <BAIText ellipsis={{ tooltip: record.message }}>
                          {record.message.replace(/\s*\n\s*/g, ' ')}
                        </BAIText>
                      ) : (
                        '-'
                      ),
                  }
                : column,
            )
        }
      />
    </BAIFlex>
  );
};

const PendingSessionTable: React.FC<{
  scope: CardScope;
  fetchKey: string;
}> = ({ scope, fetchKey }) => {
  'use memo';
  const { t } = useTranslation();
  const openSessionDetail = useOpenSessionDetail();
  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionState({ current: 1, pageSize: PAGE_SIZE });
  const deferredOffset = useDeferredValue(baiPaginationOption.offset);
  const deferredLimit = useDeferredValue(baiPaginationOption.limit);

  return (
    <SessionList
      scope={scope}
      filter={PENDING_FILTER}
      orderBy={ORDER_BY}
      limit={deferredLimit}
      offset={deferredOffset}
      fetchKey={fetchKey}
    >
      {({ count, rows }) => (
        <PendingReasons
          scope={scope}
          sessionIds={rows.map((row) => row.entityId)}
          fetchKey={fetchKey}
        >
          {(reasons) => (
            <BAISessionNodesV2
              sessionsFrgmt={rows}
              disableSorter
              loading={
                deferredOffset !== baiPaginationOption.offset ||
                deferredLimit !== baiPaginationOption.limit
              }
              customizeColumns={(columns) => [
                ...columns
                  .filter((column) => VISIBLE_COLUMNS.has(String(column.key)))
                  .map((column) =>
                    column.key === 'name'
                      ? {
                          ...column,
                          defaultHidden: false,
                          render: (
                            _value: unknown,
                            session: SessionV2InList,
                          ) =>
                            openSessionDetail ? (
                              <BAILink
                                type="hover"
                                onClick={() =>
                                  openSessionDetail(session.entityId)
                                }
                              >
                                {session.metadata?.name ?? '-'}
                              </BAILink>
                            ) : (
                              (session.metadata?.name ?? '-')
                            ),
                        }
                      : column.key === 'elapsedTime'
                        ? {
                            ...column,
                            defaultHidden: false,
                            title: t('dashboard.card.Waiting'),
                          }
                        : { ...column, defaultHidden: false },
                  ),
                {
                  key: 'reason',
                  title: t('dashboard.card.Reason'),
                  render: (_value: unknown, session: SessionV2InList) => {
                    // Absent: the lookup did not return the session (failed, or not readable).
                    if (!(session.entityId in reasons)) return '-';
                    const reason = reasons[session.entityId];
                    return reason ? (
                      <BAIText ellipsis={{ tooltip: reason }}>{reason}</BAIText>
                    ) : (
                      <Text type="supporting">
                        {t('dashboard.card.NotTriedYet')}
                      </Text>
                    );
                  },
                },
              ]}
              expandable={{
                expandedRowRender: (session) => (
                  <Suspense fallback={<BAISkeleton />}>
                    <SchedulingAttempts sessionId={session.entityId} />
                  </Suspense>
                ),
              }}
              pagination={{
                pageSize: tablePaginationOption.pageSize,
                current: tablePaginationOption.current,
                total: count,
                onChange: (current, pageSize) =>
                  setTablePaginationOption({ current, pageSize }),
              }}
            />
          )}
        </PendingReasons>
      )}
    </SessionList>
  );
};

/** Pending sessions in the page's scope, longest waiting first, with the scheduler's last message. */
const PendingSessionsPanel: React.FC<PanelComponentProps> = ({
  scope,
  fetchKey,
}) => {
  'use memo';
  const { t } = useTranslation();
  return (
    <ScopedCard
      scope={scope}
      fetchKey={fetchKey}
      heading={{
        project: {
          title: t('dashboard.card.PendingSessions'),
          tooltip: t('dashboard.card.PendingSessionsTooltip'),
        },
      }}
    >
      {(cardScope, key) => (
        <PendingSessionTable scope={cardScope} fetchKey={key} />
      )}
    </ScopedCard>
  );
};

export default PendingSessionsPanel;
