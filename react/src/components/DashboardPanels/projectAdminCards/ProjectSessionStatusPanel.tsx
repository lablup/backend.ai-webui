/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type {
  ProjectSessionStatusPanelQuery,
  SessionV2Filter,
  SessionV2Status,
  SessionV2Type,
} from '../../../__generated__/ProjectSessionStatusPanelQuery.graphql';
import { getSessionV2StatusBuckets } from '../../../helper/sessionStatusBuckets';
import DonutChart from '../charts/DonutChart';
import StatRow from '../charts/StatRow';
import MemberCard, { NoProjectText } from '../memberCards/MemberCard';
import { toDonutRows } from '../memberCards/memberCardData';
import type { PanelComponentProps } from '../types';
import { adminProjectId } from './projectCardData';
import { BAIFlex, useSessionTypeLabel } from 'backend.ai-ui';
import React, { useDeferredValue } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

const STATUS_GROUPS = [
  { key: 'pending', statuses: ['PENDING'] },
  {
    key: 'starting',
    statuses: ['SCHEDULED', 'PREPARING', 'PREPARED', 'CREATING'],
  },
  { key: 'running', statuses: ['RUNNING'] },
  { key: 'terminating', statuses: ['TERMINATING'] },
] as const satisfies ReadonlyArray<{
  key: string;
  statuses: ReadonlyArray<SessionV2Status>;
}>;

const SESSION_TYPES = [
  { key: 'interactive', type: 'INTERACTIVE' },
  { key: 'batch', type: 'BATCH' },
  { key: 'inference', type: 'INFERENCE' },
  { key: 'system', type: 'SYSTEM' },
] as const satisfies ReadonlyArray<{ key: string; type: SessionV2Type }>;

type CountKey =
  (typeof STATUS_GROUPS)[number]['key'] | (typeof SESSION_TYPES)[number]['key'];

const ACTIVE_STATUSES = getSessionV2StatusBuckets(true).running;

const activeOfType = (type: SessionV2Type): SessionV2Filter => ({
  sessionType: { equals: type },
  status: { in: [...ACTIVE_STATUSES] },
});

const countFilters = (): Record<CountKey, SessionV2Filter> => ({
  pending: { status: { in: [...STATUS_GROUPS[0].statuses] } },
  starting: { status: { in: [...STATUS_GROUPS[1].statuses] } },
  running: { status: { in: [...STATUS_GROUPS[2].statuses] } },
  terminating: { status: { in: [...STATUS_GROUPS[3].statuses] } },
  interactive: activeOfType('INTERACTIVE'),
  batch: activeOfType('BATCH'),
  inference: activeOfType('INFERENCE'),
  system: activeOfType('SYSTEM'),
});

const SessionStatusCounts: React.FC<{
  projectId: string;
  fetchKey: string;
}> = ({ projectId, fetchKey }) => {
  'use memo';
  const { t } = useTranslation();
  const variables = useDeferredValue({ projectId, ...countFilters() });
  const data = useLazyLoadQuery<ProjectSessionStatusPanelQuery>(
    graphql`
      query ProjectSessionStatusPanelQuery(
        $projectId: UUID!
        $pending: SessionV2Filter!
        $starting: SessionV2Filter!
        $running: SessionV2Filter!
        $terminating: SessionV2Filter!
        $interactive: SessionV2Filter!
        $batch: SessionV2Filter!
        $inference: SessionV2Filter!
        $system: SessionV2Filter!
      ) {
        pending: projectSessionsV2(
          scope: { projectId: $projectId }
          filter: $pending
          limit: 1
        ) {
          count
        }
        starting: projectSessionsV2(
          scope: { projectId: $projectId }
          filter: $starting
          limit: 1
        ) {
          count
        }
        running: projectSessionsV2(
          scope: { projectId: $projectId }
          filter: $running
          limit: 1
        ) {
          count
        }
        terminating: projectSessionsV2(
          scope: { projectId: $projectId }
          filter: $terminating
          limit: 1
        ) {
          count
        }
        interactive: projectSessionsV2(
          scope: { projectId: $projectId }
          filter: $interactive
          limit: 1
        ) {
          count
        }
        batch: projectSessionsV2(
          scope: { projectId: $projectId }
          filter: $batch
          limit: 1
        ) {
          count
        }
        inference: projectSessionsV2(
          scope: { projectId: $projectId }
          filter: $inference
          limit: 1
        ) {
          count
        }
        system: projectSessionsV2(
          scope: { projectId: $projectId }
          filter: $system
          limit: 1
        ) {
          count
        }
      }
    `,
    variables,
    { fetchPolicy: 'store-and-network', fetchKey },
  );
  const statusLabels: Record<(typeof STATUS_GROUPS)[number]['key'], string> = {
    pending: 'PENDING',
    starting: t('dashboard.card.Starting'),
    running: 'RUNNING',
    terminating: 'TERMINATING',
  };
  const sessionTypeLabel = useSessionTypeLabel();
  return (
    <BAIFlex
      direction="column"
      align="stretch"
      gap="md"
      style={{ flex: 1, minHeight: 0 }}
    >
      <StatRow
        items={STATUS_GROUPS.map(({ key }) => ({
          key,
          label: statusLabels[key],
          value: String(data[key]?.count ?? 0),
        }))}
      />
      <DonutChart
        label={t('dashboard.card.ActiveByType')}
        emptyText={t('dashboard.card.NoActiveSessions')}
        columnLabels={{
          name: t('session.SessionType'),
          value: t('dashboard.card.Count'),
          percent: t('dashboard.card.Share'),
        }}
        rows={toDonutRows(
          SESSION_TYPES.map(({ key, type }) => ({
            key: type,
            label: sessionTypeLabel(type),
            count: data[key]?.count,
          })),
        )}
      />
    </BAIFlex>
  );
};
/** The project's sessions now, by status, and the active ones by type. */
const ProjectSessionStatusPanel: React.FC<PanelComponentProps> = ({
  scope,
  fetchKey,
}) => {
  'use memo';
  const { t } = useTranslation();
  const projectId = adminProjectId(scope);
  return (
    <MemberCard
      title={t('dashboard.card.SessionStatus')}
      tooltip={t('dashboard.card.SessionStatusTooltip')}
      fetchKey={fetchKey}
    >
      {(key) =>
        projectId ? (
          <SessionStatusCounts projectId={projectId} fetchKey={key} />
        ) : (
          <NoProjectText />
        )
      }
    </MemberCard>
  );
};

export default ProjectSessionStatusPanel;
