/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type {
  MySessionsPanelQuery,
  SessionV2Filter,
  SessionV2Type,
} from '../../../__generated__/MySessionsPanelQuery.graphql';
import { getSessionV2StatusBuckets } from '../../../helper/sessionStatusBuckets';
import DonutChart from '../charts/DonutChart';
import type { PanelComponentProps } from '../types';
import MemberCard, { NoProjectText, mineProjectId } from './MemberCard';
import { toDonutRows } from './memberCardData';
import { useSessionTypeLabel } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React, { useDeferredValue } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

const ACTIVE_STATUSES = getSessionV2StatusBuckets(true).running;

const typeFilter = (
  projectId: string,
  sessionType: SessionV2Type,
): SessionV2Filter => ({
  projectId: { equals: projectId },
  sessionType: { equals: sessionType },
  status: { in: [...ACTIVE_STATUSES] },
});

const MySessionsDonut: React.FC<{ projectId: string; fetchKey: string }> = ({
  projectId,
  fetchKey,
}) => {
  'use memo';
  const { t } = useTranslation();
  const sessionTypeLabel = useSessionTypeLabel();
  const variables = {
    interactive: typeFilter(projectId, 'INTERACTIVE'),
    batch: typeFilter(projectId, 'BATCH'),
    inference: typeFilter(projectId, 'INFERENCE'),
    system: typeFilter(projectId, 'SYSTEM'),
  };
  const deferredVariables = useDeferredValue(variables);
  // Count aliases read only `count`; V2 connections reject `limit: 0`, so every card asks for 1 row.
  const data = useLazyLoadQuery<MySessionsPanelQuery>(
    graphql`
      query MySessionsPanelQuery(
        $interactive: SessionV2Filter!
        $batch: SessionV2Filter!
        $inference: SessionV2Filter!
        $system: SessionV2Filter!
      ) {
        interactive: mySessionsV2(filter: $interactive, limit: 1) {
          count
        }
        batch: mySessionsV2(filter: $batch, limit: 1) {
          count
        }
        inference: mySessionsV2(filter: $inference, limit: 1) {
          count
        }
        system: mySessionsV2(filter: $system, limit: 1) {
          count
        }
      }
    `,
    deferredVariables,
    { fetchPolicy: 'store-and-network', fetchKey },
  );

  // The four types are all of `SessionV2Type`, so their sum is the active total.
  const rows = toDonutRows([
    {
      key: 'INTERACTIVE',
      label: sessionTypeLabel('INTERACTIVE'),
      count: data.interactive?.count,
    },
    {
      key: 'BATCH',
      label: sessionTypeLabel('BATCH'),
      count: data.batch?.count,
    },
    {
      key: 'INFERENCE',
      label: sessionTypeLabel('INFERENCE'),
      count: data.inference?.count,
    },
    {
      key: 'SYSTEM',
      label: sessionTypeLabel('SYSTEM'),
      count: data.system?.count,
    },
  ]);

  return (
    <DonutChart
      label={t('session.MySessions')}
      emptyText={t('dashboard.card.NoActiveSessions')}
      total={_.sumBy(rows, 'value')}
      columnLabels={{
        name: t('session.SessionType'),
        value: t('dashboard.card.Count'),
        percent: t('dashboard.card.Share'),
      }}
      rows={rows}
    />
  );
};

/** The viewer's active sessions in the page's project, by session type. */
const MySessionsPanel: React.FC<PanelComponentProps> = ({
  scope,
  fetchKey,
}) => {
  'use memo';
  const { t } = useTranslation();
  const projectId = mineProjectId(scope);
  return (
    <MemberCard
      title={t('session.MySessions')}
      tooltip={t('dashboard.card.MySessionsTooltip')}
      fetchKey={fetchKey}
    >
      {(key) =>
        projectId ? (
          <MySessionsDonut projectId={projectId} fetchKey={key} />
        ) : (
          <NoProjectText />
        )
      }
    </MemberCard>
  );
};

export default MySessionsPanel;
