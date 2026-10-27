/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useBAIPaginationOptionState } from '../../../hooks/reactPaginationQueryOptions';
import type { CardScope } from '../cardScope';
import type { DateTimeWindow } from '../timeRange';
import type { PanelComponentProps } from '../types';
import { useOpenSessionDetail } from '../useOpenSessionDetail';
import ScopedCard from './ScopedCard';
import SessionList, { crossProjectColumns } from './SessionList';
import {
  BAILink,
  BAISessionNodesV2,
  type SessionV2InList,
} from 'backend.ai-ui';
import React, { useDeferredValue } from 'react';
import { useTranslation } from 'react-i18next';

const PAGE_SIZE = 5;
const BASE_COLUMNS = [
  'name',
  'owner',
  'elapsedTime',
  'accelerator',
  'cpu',
  'mem',
];
// Oldest first.
const ORDER_BY = [{ field: 'STARTS_AT' as const, direction: 'ASC' as const }];

const LongRunningSessionTable: React.FC<{
  scope: CardScope;
  timeRange: DateTimeWindow;
  fetchKey: string;
}> = ({ scope, timeRange, fetchKey }) => {
  'use memo';
  const openSessionDetail = useOpenSessionDetail();
  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionState({ current: 1, pageSize: PAGE_SIZE });
  // Running longer than the card's range: started before the range began. One bound only.
  const filter = {
    status: { in: ['RUNNING' as const] },
    startsAt: { before: timeRange.after },
  };
  const deferredFilter = useDeferredValue(filter);
  const deferredOffset = useDeferredValue(baiPaginationOption.offset);

  return (
    <SessionList
      scope={scope}
      filter={deferredFilter}
      orderBy={ORDER_BY}
      limit={baiPaginationOption.limit}
      offset={deferredOffset}
      fetchKey={fetchKey}
    >
      {({ count, rows }) => (
        <BAISessionNodesV2
          sessionsFrgmt={rows}
          disableSorter
          loading={
            deferredOffset !== baiPaginationOption.offset ||
            deferredFilter !== filter
          }
          customizeColumns={(columns) =>
            columns
              .filter((column) =>
                [...BASE_COLUMNS, ...crossProjectColumns(scope)].includes(
                  String(column.key),
                ),
              )
              .map((column) =>
                column.key === 'name'
                  ? {
                      ...column,
                      defaultHidden: false,
                      render: (_value: unknown, session: SessionV2InList) => (
                        <BAILink
                          type="hover"
                          onClick={() => openSessionDetail(session.entityId)}
                        >
                          {session.metadata?.name ?? '-'}
                        </BAILink>
                      ),
                    }
                  : { ...column, defaultHidden: false },
              )
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
    </SessionList>
  );
};

/** Running sessions in the page's scope that started before the card's range, oldest first. */
const LongRunningSessionsPanel: React.FC<PanelComponentProps> = ({
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
          title: t('dashboard.card.LongRunningSessions'),
          tooltip: t('dashboard.card.LongRunningSessionsTooltip'),
        },
        domain: {
          title: t('dashboard.card.LongRunningSessions'),
          tooltip: t('dashboard.card.DomainLongRunningSessionsTooltip'),
        },
      }}
    >
      {(cardScope, key) => (
        <LongRunningSessionTable
          scope={cardScope}
          timeRange={vars.timeRange}
          fetchKey={key}
        />
      )}
    </ScopedCard>
  );
};

export default LongRunningSessionsPanel;
