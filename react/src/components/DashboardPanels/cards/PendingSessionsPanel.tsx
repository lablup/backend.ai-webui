/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { PendingSessionsPanelReasonQuery } from '../../../__generated__/PendingSessionsPanelReasonQuery.graphql';
import { useBAIPaginationOptionState } from '../../../hooks/reactPaginationQueryOptions';
import SessionSchedulingHistoryModal from '../../SessionSchedulingHistoryModal';
import { legacyScopeId, type CardScope } from '../cardScope';
import {
  legacySessionIdFilter,
  pendingReason,
} from '../projectAdminCards/projectCardData';
import type { PanelComponentProps } from '../types';
import ScopedCard from './ScopedCard';
import SessionList, {
  crossProjectColumns,
  inResourceGroups,
  type SessionV2Filter,
} from './SessionList';
import { Text } from '@lablup/ui-common/Text';
import {
  BAIFlex,
  BAILink,
  BAISessionNodesV2,
  BAIText,
  BAIUnmountAfterClose,
  filterOutNullAndUndefined,
  type SessionV2InList,
} from 'backend.ai-ui';
import React, { Suspense, useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

const PAGE_SIZE = 5;
const PENDING_FILTER: SessionV2Filter = { status: { in: ['PENDING'] } };
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

/** One pending session: the scheduler's last message, then its name and how long it has waited. */
export const PendingSessionRow: React.FC<{
  /** `undefined` when the lookup did not return the session (failed, or not readable). */
  reason: string | null | undefined;
  name: string;
  waited: React.ReactNode;
  /** The session's project, on the cross-project (superadmin) card. */
  project?: React.ReactNode;
  onOpenHistory: () => void;
}> = ({ reason, name, waited, project, onOpenHistory }) => {
  'use memo';
  const { t } = useTranslation();
  return (
    <BAIFlex direction="column" align="stretch" gap="xxs">
      {reason ? (
        <BAIText ellipsis={{ tooltip: reason }}>
          {reason.replace(/\s*\n\s*/g, ' ')}
        </BAIText>
      ) : (
        <Text type="supporting">
          {reason === null ? t('dashboard.card.NotTriedYet') : '-'}
        </Text>
      )}
      <BAIFlex gap="xs" style={{ minWidth: 0 }}>
        <BAILink
          type="hover"
          ellipsis
          onClick={(event) => {
            // The row opens the same history; one click, one modal.
            event.stopPropagation();
            onOpenHistory();
          }}
        >
          {name}
        </BAILink>
        {project ? (
          <Text type="supporting" size="sm">
            {project}
          </Text>
        ) : null}
        <Text type="supporting" size="sm">
          {t('dashboard.card.Waiting')} {waited}
        </Text>
      </BAIFlex>
    </BAIFlex>
  );
};

const PendingSessionTable: React.FC<{
  scope: CardScope;
  resourceGroups: ReadonlyArray<string> | undefined;
  fetchKey: string;
}> = ({ scope, resourceGroups, fetchKey }) => {
  'use memo';
  // The id outlives `open` until after-close, so the closing modal keeps its content.
  const [historySessionId, setHistorySessionId] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionState({ current: 1, pageSize: PAGE_SIZE });
  const deferredOffset = useDeferredValue(baiPaginationOption.offset);
  const deferredLimit = useDeferredValue(baiPaginationOption.limit);
  const openHistory = (session: SessionV2InList) => {
    setHistorySessionId(session.entityId);
    setIsHistoryOpen(true);
  };

  return (
    <>
      <SessionList
        scope={scope}
        filter={inResourceGroups(PENDING_FILTER, resourceGroups)}
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
                showHeader={false}
                loading={
                  deferredOffset !== baiPaginationOption.offset ||
                  deferredLimit !== baiPaginationOption.limit
                }
                onRow={(session) => ({
                  onClick: () => openHistory(session),
                  style: { cursor: 'pointer' },
                })}
                customizeColumns={(columns) => {
                  const columnOf = (key: string) =>
                    columns.find((column) => column.key === key);
                  const elapsed = columnOf('elapsedTime');
                  const project = crossProjectColumns(scope).includes('project')
                    ? columnOf('project')
                    : undefined;
                  return [
                    {
                      key: 'pending',
                      onCell: () => ({ style: { maxWidth: 0, width: '100%' } }),
                      render: (_value: unknown, session: SessionV2InList) => (
                        <PendingSessionRow
                          reason={
                            session.entityId in reasons
                              ? reasons[session.entityId]
                              : undefined
                          }
                          name={session.metadata?.name ?? '-'}
                          waited={elapsed?.render?.(undefined, session, 0)}
                          project={project?.render?.(undefined, session, 0)}
                          onOpenHistory={() => openHistory(session)}
                        />
                      ),
                    },
                  ];
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
      {historySessionId ? (
        <Suspense fallback={null}>
          <BAIUnmountAfterClose>
            <SessionSchedulingHistoryModal
              open={isHistoryOpen}
              sessionId={historySessionId}
              onCancel={() => setIsHistoryOpen(false)}
              afterClose={() => setHistorySessionId(null)}
            />
          </BAIUnmountAfterClose>
        </Suspense>
      ) : null}
    </>
  );
};

/** Pending sessions in the page's scope, longest waiting first, with the scheduler's last message. */
const PendingSessionsPanel: React.FC<PanelComponentProps> = ({
  scope,
  vars,
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
        domain: {
          title: t('dashboard.card.PendingSessions'),
          tooltip: t('dashboard.card.DomainPendingSessionsTooltip'),
        },
      }}
    >
      {(cardScope, key) => (
        <PendingSessionTable
          scope={cardScope}
          resourceGroups={vars.resourceGroup ? [vars.resourceGroup] : undefined}
          fetchKey={key}
        />
      )}
    </ScopedCard>
  );
};

export default PendingSessionsPanel;
