/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
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
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import React from 'react';
import { useTranslation } from 'react-i18next';

const ROW_LIMIT = 5;
const BASE_COLUMNS = [
  'name',
  'owner',
  'elapsedTime',
  'accelerator',
  'cpu',
  'mem',
];
const FILTER = { status: { in: ['RUNNING' as const] } };
// Oldest first, so the sessions past the threshold are a prefix of the list.
const ORDER_BY = [{ field: 'CREATED_AT' as const, direction: 'ASC' as const }];

const LongRunningSessionTable: React.FC<{
  scope: CardScope;
  timeRange: DateTimeWindow;
  fetchKey: string;
}> = ({ scope, timeRange, fetchKey }) => {
  'use memo';
  const openSessionDetail = useOpenSessionDetail();
  // Running longer than the card's range: created before the range began.
  const threshold = dayjs(timeRange.after);

  return (
    <SessionList
      scope={scope}
      filter={FILTER}
      orderBy={ORDER_BY}
      limit={ROW_LIMIT}
      offset={0}
      fetchKey={fetchKey}
    >
      {({ rows }) => (
        <BAISessionNodesV2
          sessionsFrgmt={_.takeWhile(
            rows,
            (row) =>
              !!row.lifecycle.createdAt &&
              dayjs(row.lifecycle.createdAt).isBefore(threshold),
          )}
          disableSorter
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
                      render: (_value: unknown, session: SessionV2InList) =>
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
                  : { ...column, defaultHidden: false },
              )
          }
          pagination={false}
        />
      )}
    </SessionList>
  );
};

/** Running sessions in the page's scope created before the card's range, oldest first. */
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
