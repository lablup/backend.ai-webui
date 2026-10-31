/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useBAIPaginationOptionState } from '../../../hooks/reactPaginationQueryOptions';
import { useBAISettingUserState } from '../../../hooks/useBAISetting';
import type { CardScope } from '../cardScope';
import type { PanelComponentProps } from '../types';
import { useOpenSessionDetail } from '../useOpenSessionDetail';
import ScopedCard from './ScopedCard';
import SessionList from './SessionList';
import { BAILink, BAISessionNodesV2 } from 'backend.ai-ui';
import React, { useDeferredValue } from 'react';
import { useTranslation } from 'react-i18next';

const PAGE_SIZE = 5;
const ORDER_BY = [{ field: 'CREATED_AT' as const, direction: 'DESC' as const }];

const RecentSessionsTable: React.FC<{ scope: CardScope; fetchKey: string }> = ({
  scope,
  fetchKey,
}) => {
  'use memo';
  const openSessionDetail = useOpenSessionDetail();
  const [columnOverrides, setColumnOverrides] = useBAISettingUserState(
    'table_column_overrides.DashboardMyRecentSessions',
  );
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
      filter={{}}
      orderBy={ORDER_BY}
      limit={deferredLimit}
      offset={deferredOffset}
      fetchKey={fetchKey}
    >
      {({ count, rows }) => (
        <BAISessionNodesV2
          sessionsFrgmt={rows}
          disableSorter
          loading={
            deferredOffset !== baiPaginationOption.offset ||
            deferredLimit !== baiPaginationOption.limit
          }
          customizeColumns={(columns) =>
            columns.map((column) =>
              column.key === 'name'
                ? {
                    ...column,
                    render: (_value, session) =>
                      openSessionDetail ? (
                        <BAILink
                          type="hover"
                          onClick={() => openSessionDetail(session.entityId)}
                        >
                          {session.metadata?.name ?? '-'}
                        </BAILink>
                      ) : (
                        (session.metadata?.name ?? '-')
                      ),
                  }
                : column,
            )
          }
          pagination={{
            pageSize: tablePaginationOption.pageSize,
            current: tablePaginationOption.current,
            total: count,
            onChange: (current, pageSize) =>
              setTablePaginationOption({ current, pageSize }),
          }}
          tableSettings={{
            columnOverrides,
            onColumnOverridesChange: setColumnOverrides,
            defaultColumnOverrides: {
              sessionType: { hidden: false },
              createdAt: { hidden: false },
              accelerator: { hidden: true },
              cpu: { hidden: true },
              mem: { hidden: true },
              owner: { hidden: scope.kind === 'mine' },
            },
          }}
        />
      )}
    </SessionList>
  );
};

/** The newest sessions in the page's scope; a name opens the session drawer. */
const RecentSessionsPanel: React.FC<PanelComponentProps> = ({
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
        mine: { title: t('dashboard.card.MyRecentSessions') },
        project: { title: t('session.RecentlyCreatedSessions') },
      }}
    >
      {(cardScope, key) => (
        <RecentSessionsTable scope={cardScope} fetchKey={key} />
      )}
    </ScopedCard>
  );
};

export default RecentSessionsPanel;
