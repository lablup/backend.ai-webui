/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type {
  SchedulingFailuresPanelQuery,
  SessionSchedulingHistoryFilter,
} from '../../../__generated__/SchedulingFailuresPanelQuery.graphql';
import { useBAIPaginationOptionState } from '../../../hooks/reactPaginationQueryOptions';
import ScopedCard from '../cards/ScopedCard';
import DonutChart from '../charts/DonutChart';
import { toDonutRows } from '../memberCards/memberCardData';
import { withinWindow, type DateTimeWindow } from '../timeRange';
import type { PanelComponentProps } from '../types';
import { useOpenSessionDetail } from '../useOpenSessionDetail';
import {
  SCHEDULING_FAILURE_RESULTS,
  type SchedulingFailureResult,
} from './superadminCardData';
import {
  BAIFlex,
  BAILink,
  BAISchedulingHistoryNodes,
  BAIText,
  filterOutNullAndUndefined,
} from 'backend.ai-ui';
import React, { useDeferredValue } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

const ALIAS: Record<
  SchedulingFailureResult,
  'failure' | 'giveUp' | 'expired' | 'needRetry'
> = {
  FAILURE: 'failure',
  GIVE_UP: 'giveUp',
  EXPIRED: 'expired',
  NEED_RETRY: 'needRetry',
};

const resultFilter = (
  window: DateTimeWindow,
  results: ReadonlyArray<SchedulingFailureResult>,
): SessionSchedulingHistoryFilter => ({
  ...withinWindow('createdAt', window),
  result: { in: [...results] },
});

const SchedulingFailures: React.FC<{
  timeRange: DateTimeWindow;
  fetchKey: string;
}> = ({ timeRange, fetchKey }) => {
  'use memo';
  const { t } = useTranslation();
  const openSessionDetail = useOpenSessionDetail();
  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionState({ current: 1, pageSize: 5 });
  const variables: SchedulingFailuresPanelQuery['variables'] = {
    filter: resultFilter(timeRange, SCHEDULING_FAILURE_RESULTS),
    failure: resultFilter(timeRange, ['FAILURE']),
    giveUp: resultFilter(timeRange, ['GIVE_UP']),
    expired: resultFilter(timeRange, ['EXPIRED']),
    needRetry: resultFilter(timeRange, ['NEED_RETRY']),
    limit: baiPaginationOption.limit,
    offset: baiPaginationOption.offset,
  };
  const deferredVariables = useDeferredValue(variables);
  const data = useLazyLoadQuery<SchedulingFailuresPanelQuery>(
    graphql`
      query SchedulingFailuresPanelQuery(
        $filter: SessionSchedulingHistoryFilter!
        $failure: SessionSchedulingHistoryFilter!
        $giveUp: SessionSchedulingHistoryFilter!
        $expired: SessionSchedulingHistoryFilter!
        $needRetry: SessionSchedulingHistoryFilter!
        $limit: Int!
        $offset: Int!
      ) {
        failure: adminSessionSchedulingHistories(filter: $failure, limit: 1) {
          count
        }
        giveUp: adminSessionSchedulingHistories(filter: $giveUp, limit: 1) {
          count
        }
        expired: adminSessionSchedulingHistories(filter: $expired, limit: 1) {
          count
        }
        needRetry: adminSessionSchedulingHistories(
          filter: $needRetry
          limit: 1
        ) {
          count
        }
        histories: adminSessionSchedulingHistories(
          filter: $filter
          orderBy: [{ field: CREATED_AT, direction: DESC }]
          limit: $limit
          offset: $offset
        ) {
          count
          edges {
            node {
              id
              phase
              errorCode
              message
              ...BAISchedulingHistoryNodesFragment
              session {
                entityId
                metadata {
                  name
                }
                project {
                  basicInfo {
                    name
                  }
                }
              }
            }
          }
        }
      }
    `,
    deferredVariables,
    { fetchPolicy: 'store-and-network', fetchKey },
  );
  const rows = filterOutNullAndUndefined(
    data.histories?.edges.map((edge) => edge?.node),
  );
  const rowById = new Map(rows.map((row) => [row.id, row]));

  return (
    <BAIFlex
      direction="column"
      align="stretch"
      gap="md"
      style={{ flex: 1, minHeight: 0 }}
    >
      <DonutChart
        label={t('dashboard.card.SchedulingFailures')}
        emptyText={t('dashboard.card.NoSchedulingFailures')}
        columnLabels={{
          name: t('dashboard.card.SchedulingResult'),
          value: t('dashboard.card.Count'),
          percent: t('dashboard.card.Share'),
        }}
        rows={toDonutRows(
          SCHEDULING_FAILURE_RESULTS.map((result) => ({
            key: result,
            label: result,
            count: data[ALIAS[result]]?.count,
          })),
        )}
      />
      <BAISchedulingHistoryNodes
        schedulingHistoryFrgmt={rows}
        disableSorter
        size="small"
        loading={deferredVariables !== variables}
        customizeColumns={(columns) => {
          const pick = (key: string) => columns.find((c) => c.key === key);
          const message = pick('message');
          return filterOutNullAndUndefined([
            pick('createdAt'),
            {
              key: 'session',
              title: t('session.SessionName'),
              render: (_value: unknown, history: { id: string }) => {
                const session = rowById.get(history.id)?.session;
                return session ? (
                  <BAILink
                    type="hover"
                    onClick={() => openSessionDetail(session.entityId)}
                  >
                    {session.metadata.name}
                  </BAILink>
                ) : (
                  '-'
                );
              },
            },
            {
              key: 'project',
              title: t('general.Project'),
              render: (_value: unknown, history: { id: string }) =>
                rowById.get(history.id)?.session?.project?.basicInfo.name ??
                '-',
            },
            pick('result'),
            message && {
              ...message,
              title: t('dashboard.card.Reason'),
              onCell: undefined,
              render: (_value: unknown, history: { id: string }) => {
                const row = rowById.get(history.id);
                const reason = row?.errorCode ?? row?.message ?? row?.phase;
                return (
                  <BAIText
                    ellipsis={{ tooltip: reason }}
                    style={{ maxWidth: 320 }}
                  >
                    {reason}
                  </BAIText>
                );
              },
            },
          ]);
        }}
        pagination={{
          pageSize: tablePaginationOption.pageSize,
          current: tablePaginationOption.current,
          total: data.histories?.count ?? 0,
          onChange: (current, pageSize) =>
            setTablePaginationOption({ current, pageSize }),
        }}
      />
    </BAIFlex>
  );
};

/** Scheduling attempts that did not place a session in the card's range, by result, newest first. */
const SchedulingFailuresPanel: React.FC<PanelComponentProps> = ({
  scope,
  vars,
  fetchKey,
}) => {
  'use memo';
  const { t } = useTranslation();
  const heading = {
    title: t('dashboard.card.SchedulingFailures'),
    tooltip: t('dashboard.card.SchedulingFailuresTooltip'),
  };
  return (
    <ScopedCard
      scope={scope}
      fetchKey={fetchKey}
      heading={{ project: heading, domain: heading }}
    >
      {(_cardScope, key) => (
        <SchedulingFailures timeRange={vars.timeRange} fetchKey={key} />
      )}
    </ScopedCard>
  );
};

export default SchedulingFailuresPanel;
