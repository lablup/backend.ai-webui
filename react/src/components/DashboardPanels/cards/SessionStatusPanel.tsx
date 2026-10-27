/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { SessionStatusPanelDomainQuery } from '../../../__generated__/SessionStatusPanelDomainQuery.graphql';
import type { SessionStatusPanelMineQuery } from '../../../__generated__/SessionStatusPanelMineQuery.graphql';
import type {
  SessionStatusPanelProjectQuery,
  SessionV2Filter,
  SessionV2Status,
  SessionV2Type,
} from '../../../__generated__/SessionStatusPanelProjectQuery.graphql';
import { getSessionV2StatusBuckets } from '../../../helper/sessionStatusBuckets';
import type { CardScope } from '../cardScope';
import DonutChart from '../charts/DonutChart';
import StatRow from '../charts/StatRow';
import { toDonutRows } from '../memberCards/memberCardData';
import type { PanelComponentProps } from '../types';
import ScopedCard from './ScopedCard';
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

// `active` is every active session, the total the donut shows in its hole.
type CountKey =
  | (typeof STATUS_GROUPS)[number]['key']
  | (typeof SESSION_TYPES)[number]['key']
  | 'active';

type StatusCounts = Readonly<
  Record<CountKey, { readonly count: number } | null | undefined>
>;

const ACTIVE_STATUSES = getSessionV2StatusBuckets(true).running;

/** One count alias per status group and per active session type, narrowed by `base`. */
export const sessionCountFilters = (
  base: SessionV2Filter = {},
): Record<CountKey, SessionV2Filter> => {
  const withStatus = (statuses: ReadonlyArray<SessionV2Status>) => ({
    ...base,
    status: { in: [...statuses] },
  });
  const activeOfType = (type: SessionV2Type): SessionV2Filter => ({
    ...withStatus(ACTIVE_STATUSES),
    sessionType: { equals: type },
  });
  return {
    pending: withStatus(STATUS_GROUPS[0].statuses),
    starting: withStatus(STATUS_GROUPS[1].statuses),
    running: withStatus(STATUS_GROUPS[2].statuses),
    terminating: withStatus(STATUS_GROUPS[3].statuses),
    interactive: activeOfType('INTERACTIVE'),
    batch: activeOfType('BATCH'),
    inference: activeOfType('INFERENCE'),
    system: activeOfType('SYSTEM'),
    active: withStatus(ACTIVE_STATUSES),
  };
};

/** The statuses as the stat row, the active sessions by type as a donut. */
const SessionStatusView: React.FC<{ data: StatusCounts }> = ({ data }) => {
  'use memo';
  const { t } = useTranslation();
  const sessionTypeLabel = useSessionTypeLabel();
  const statusLabels: Record<(typeof STATUS_GROUPS)[number]['key'], string> = {
    pending: 'PENDING',
    starting: t('dashboard.card.Starting'),
    running: 'RUNNING',
    terminating: 'TERMINATING',
  };
  return (
    <BAIFlex
      direction="column"
      align="stretch"
      gap="sm"
      style={{ flex: 1, minHeight: 0 }}
    >
      <StatRow
        compact
        items={STATUS_GROUPS.map(({ key }) => ({
          key,
          label: statusLabels[key],
          value: String(data[key]?.count ?? 0),
          size: 'sm',
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
        total={data.active?.count}
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

const MineSessionCounts: React.FC<{ projectId: string; fetchKey: string }> = ({
  projectId,
  fetchKey,
}) => {
  'use memo';
  const variables = useDeferredValue(
    sessionCountFilters({ projectId: { equals: projectId } }),
  );
  const data = useLazyLoadQuery<SessionStatusPanelMineQuery>(
    graphql`
      query SessionStatusPanelMineQuery(
        $pending: SessionV2Filter!
        $starting: SessionV2Filter!
        $running: SessionV2Filter!
        $terminating: SessionV2Filter!
        $interactive: SessionV2Filter!
        $batch: SessionV2Filter!
        $inference: SessionV2Filter!
        $system: SessionV2Filter!
        $active: SessionV2Filter!
      ) {
        pending: mySessionsV2(filter: $pending, limit: 1) {
          count
        }
        starting: mySessionsV2(filter: $starting, limit: 1) {
          count
        }
        running: mySessionsV2(filter: $running, limit: 1) {
          count
        }
        terminating: mySessionsV2(filter: $terminating, limit: 1) {
          count
        }
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
        active: mySessionsV2(filter: $active, limit: 1) {
          count
        }
      }
    `,
    variables,
    { fetchPolicy: 'store-and-network', fetchKey },
  );
  return <SessionStatusView data={data} />;
};

const ProjectSessionCounts: React.FC<{
  projectId: string;
  fetchKey: string;
}> = ({ projectId, fetchKey }) => {
  'use memo';
  const variables = useDeferredValue({ projectId, ...sessionCountFilters() });
  const data = useLazyLoadQuery<SessionStatusPanelProjectQuery>(
    graphql`
      query SessionStatusPanelProjectQuery(
        $projectId: UUID!
        $pending: SessionV2Filter!
        $starting: SessionV2Filter!
        $running: SessionV2Filter!
        $terminating: SessionV2Filter!
        $interactive: SessionV2Filter!
        $batch: SessionV2Filter!
        $inference: SessionV2Filter!
        $system: SessionV2Filter!
        $active: SessionV2Filter!
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
        active: projectSessionsV2(
          scope: { projectId: $projectId }
          filter: $active
          limit: 1
        ) {
          count
        }
      }
    `,
    variables,
    { fetchPolicy: 'store-and-network', fetchKey },
  );
  return <SessionStatusView data={data} />;
};

const DomainSessionCounts: React.FC<{ domainId: string; fetchKey: string }> = ({
  domainId,
  fetchKey,
}) => {
  'use memo';
  const variables = useDeferredValue({ domainId, ...sessionCountFilters() });
  const data = useLazyLoadQuery<SessionStatusPanelDomainQuery>(
    graphql`
      query SessionStatusPanelDomainQuery(
        $domainId: UUID!
        $pending: SessionV2Filter!
        $starting: SessionV2Filter!
        $running: SessionV2Filter!
        $terminating: SessionV2Filter!
        $interactive: SessionV2Filter!
        $batch: SessionV2Filter!
        $inference: SessionV2Filter!
        $system: SessionV2Filter!
        $active: SessionV2Filter!
      ) {
        pending: scopedSessionsV2(
          scope: { domain: [{ value: $domainId }] }
          filter: $pending
          limit: 1
        ) {
          count
        }
        starting: scopedSessionsV2(
          scope: { domain: [{ value: $domainId }] }
          filter: $starting
          limit: 1
        ) {
          count
        }
        running: scopedSessionsV2(
          scope: { domain: [{ value: $domainId }] }
          filter: $running
          limit: 1
        ) {
          count
        }
        terminating: scopedSessionsV2(
          scope: { domain: [{ value: $domainId }] }
          filter: $terminating
          limit: 1
        ) {
          count
        }
        interactive: scopedSessionsV2(
          scope: { domain: [{ value: $domainId }] }
          filter: $interactive
          limit: 1
        ) {
          count
        }
        batch: scopedSessionsV2(
          scope: { domain: [{ value: $domainId }] }
          filter: $batch
          limit: 1
        ) {
          count
        }
        inference: scopedSessionsV2(
          scope: { domain: [{ value: $domainId }] }
          filter: $inference
          limit: 1
        ) {
          count
        }
        system: scopedSessionsV2(
          scope: { domain: [{ value: $domainId }] }
          filter: $system
          limit: 1
        ) {
          count
        }
        active: scopedSessionsV2(
          scope: { domain: [{ value: $domainId }] }
          filter: $active
          limit: 1
        ) {
          count
        }
      }
    `,
    variables,
    { fetchPolicy: 'store-and-network', fetchKey },
  );
  return <SessionStatusView data={data} />;
};

const SessionCounts: React.FC<{ scope: CardScope; fetchKey: string }> = ({
  scope,
  fetchKey,
}) => {
  'use memo';
  switch (scope.kind) {
    case 'mine':
      return (
        <MineSessionCounts projectId={scope.projectId} fetchKey={fetchKey} />
      );
    case 'project':
      return (
        <ProjectSessionCounts projectId={scope.projectId} fetchKey={fetchKey} />
      );
    case 'domain':
      return (
        <DomainSessionCounts domainId={scope.domainId} fetchKey={fetchKey} />
      );
  }
};
/** Sessions right now by status, and the active ones by type, in the page's scope. */
const SessionStatusPanel: React.FC<PanelComponentProps> = ({
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
        mine: {
          title: t('session.MySessions'),
          tooltip: t('dashboard.card.MySessionsTooltip'),
        },
        project: {
          title: t('dashboard.card.SessionStatus'),
          tooltip: t('dashboard.card.SessionStatusTooltip'),
        },
      }}
    >
      {(cardScope, key) => <SessionCounts scope={cardScope} fetchKey={key} />}
    </ScopedCard>
  );
};

export default SessionStatusPanel;
