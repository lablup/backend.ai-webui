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
import type { PanelComponentProps, PanelSettings } from '../types';
import { useResetPageOn } from '../useResetPageOn';
import ScopedCard from './ScopedCard';
import SessionList, {
  inResourceGroups,
  type SessionV2Filter,
} from './SessionList';
import { Text } from '@lablup/ui-common/Text';
import {
  BAILink,
  BAISessionNodesV2,
  BAIText,
  BAIUnmountAfterClose,
  filterOutNullAndUndefined,
  type BAIColumnType,
  type SessionV2InList,
} from 'backend.ai-ui';
import type { TFunction } from 'i18next';
import * as _ from 'lodash-es';
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

/** The scheduler's latest message for one session, on one line, the full text on hover. */
export const PendingReasonCell: React.FC<{
  /** `undefined` when the lookup did not return the session (failed, or not readable). */
  reason: string | null | undefined;
}> = ({ reason }) => {
  'use memo';
  const { t } = useTranslation();
  if (reason === undefined) return '-';
  return reason ? (
    <BAIText ellipsis={{ tooltip: reason }}>
      {reason.replace(/\s*\n\s*/g, ' ')}
    </BAIText>
  ) : (
    <Text type="supporting">{t('dashboard.card.NotTriedYet')}</Text>
  );
};

/** Shown on a new card; the other session columns start hidden in the column settings. */
export const PENDING_DEFAULT_COLUMNS = ['name', 'reason', 'elapsedTime'];

/**
 * Session name (a link to the scheduling history), the latest scheduling
 * reason and the time waited; every other session column is available from
 * the column settings.
 */
export const customizePendingColumns = (
  columns: Array<BAIColumnType<SessionV2InList>>,
  {
    reasons,
    t,
    onOpenHistory,
  }: {
    reasons: Reasons;
    t: TFunction;
    onOpenHistory: (session: SessionV2InList) => void;
  },
): Array<BAIColumnType<SessionV2InList>> => {
  const reasonColumn: BAIColumnType<SessionV2InList> = {
    key: 'reason',
    title: t('dashboard.card.LatestSchedulingReason'),
    // Takes the width left over, so a long message ellipsizes instead of widening the table.
    onCell: () => ({ style: { maxWidth: 0, width: '100%' } }),
    render: (_value: unknown, session: SessionV2InList) => (
      <PendingReasonCell
        reason={
          session.entityId in reasons ? reasons[session.entityId] : undefined
        }
      />
    ),
  };
  const customized = columns.map((column): BAIColumnType<SessionV2InList> => ({
    ...column,
    defaultHidden: !PENDING_DEFAULT_COLUMNS.includes(String(column.key)),
    ...(column.key === 'name'
      ? {
          render: (_value: unknown, session: SessionV2InList) => (
            <BAILink
              ellipsis
              onClick={(event) => {
                // The row opens the same history; one click, one modal.
                event.stopPropagation();
                onOpenHistory(session);
              }}
            >
              {session.metadata?.name ?? '-'}
            </BAILink>
          ),
        }
      : column.key === 'elapsedTime'
        ? { title: t('dashboard.card.Waiting') }
        : {}),
  }));
  const nameIndex = customized.findIndex((column) => column.key === 'name');
  return [
    ...customized.slice(0, nameIndex + 1),
    reasonColumn,
    ...customized.slice(nameIndex + 1),
  ];
};

const PendingSessionTable: React.FC<{
  scope: CardScope;
  resourceGroups: ReadonlyArray<string> | undefined;
  fetchKey: string;
  columnOverrides: PanelSettings['columnOverrides'];
  onChangeSettings?: PanelComponentProps['onChangeSettings'];
}> = ({
  scope,
  resourceGroups,
  fetchKey,
  columnOverrides,
  onChangeSettings,
}) => {
  'use memo';
  const { t } = useTranslation();
  // The id outlives `open` until after-close, so the closing modal keeps its content.
  const [historySessionId, setHistorySessionId] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionState({ current: 1, pageSize: PAGE_SIZE });
  useResetPageOn([scope, resourceGroups], setTablePaginationOption);
  const page = {
    limit: baiPaginationOption.limit,
    offset: baiPaginationOption.offset,
  };
  // Deferred together, so a page change keeps the current rows until the next page arrives.
  const deferredPage = useDeferredValue(page);
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
        limit={deferredPage.limit}
        offset={deferredPage.offset}
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
                  deferredPage.offset !== page.offset ||
                  deferredPage.limit !== page.limit
                }
                onRow={(session) => ({
                  onClick: () => openHistory(session),
                  style: { cursor: 'pointer' },
                })}
                customizeColumns={(columns) =>
                  customizePendingColumns(columns, {
                    reasons,
                    t,
                    onOpenHistory: openHistory,
                  })
                }
                tableSettings={
                  onChangeSettings
                    ? {
                        columnOverrides: columnOverrides ?? {},
                        onColumnOverridesChange: (overrides) =>
                          onChangeSettings({
                            columnOverrides: _.isEmpty(overrides)
                              ? undefined
                              : overrides,
                          }),
                      }
                    : undefined
                }
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
  panel,
  onChangeSettings,
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
          columnOverrides={panel.settings?.columnOverrides}
          onChangeSettings={onChangeSettings}
        />
      )}
    </ScopedCard>
  );
};

export default PendingSessionsPanel;
