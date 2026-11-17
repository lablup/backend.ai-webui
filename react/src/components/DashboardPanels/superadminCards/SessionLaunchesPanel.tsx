/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { SessionLaunchesPanelQuery } from '../../../__generated__/SessionLaunchesPanelQuery.graphql';
import { legacyScopeId } from '../cardScope';
import ScopedCard from '../cards/ScopedCard';
import StatRow from '../charts/StatRow';
import { countText, readCounts } from '../countAliases';
import { readPrimary } from '../panelPermission';
import type { DateTimeWindow } from '../timeRange';
import type { PanelComponentProps } from '../types';
import {
  LAUNCH_OUTCOMES,
  launchOutcomeFilter,
  queueWaitStats,
} from './superadminCardData';
import { Text } from '@lablup/ui-common/Text';
import {
  BAIFlex,
  filterOutNullAndUndefined,
  formatCompactDuration,
} from 'backend.ai-ui';
import React, { useDeferredValue } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

/** The newest started sessions the queue wait is computed over. */
const WAIT_SAMPLE_SIZE = 100;

// TODO(needs-backend): #11284 - a server-side queue wait aggregate would replace the sample.
const SessionLaunches: React.FC<{
  scopeId: string;
  timeRange: DateTimeWindow;
  fetchKey: string;
}> = ({ scopeId, timeRange, fetchKey }) => {
  'use memo';
  const { t } = useTranslation();
  const variables = useDeferredValue({
    scopeId,
    started: launchOutcomeFilter(timeRange, 'started'),
    cancelled: launchOutcomeFilter(timeRange, 'cancelled'),
    error: launchOutcomeFilter(timeRange, 'error'),
    pending: launchOutcomeFilter(timeRange, 'pending'),
    sampleSize: WAIT_SAMPLE_SIZE,
  });
  const data = useLazyLoadQuery<SessionLaunchesPanelQuery>(
    graphql`
      query SessionLaunchesPanelQuery(
        $scopeId: ScopeField
        $started: String!
        $cancelled: String!
        $error: String!
        $pending: String!
        $sampleSize: Int!
      ) {
        started: compute_session_nodes(
          scope_id: $scopeId
          first: $sampleSize
          offset: 0
          filter: $started
          order: "-created_at"
        ) @catch(to: RESULT) {
          count
          edges {
            node {
              created_at
              scheduled_at
            }
          }
        }
        cancelled: compute_session_nodes(
          scope_id: $scopeId
          first: 1
          offset: 0
          filter: $cancelled
        ) @catch(to: RESULT) {
          count
        }
        error: compute_session_nodes(
          scope_id: $scopeId
          first: 1
          offset: 0
          filter: $error
        ) @catch(to: RESULT) {
          count
        }
        pending: compute_session_nodes(
          scope_id: $scopeId
          first: 1
          offset: 0
          filter: $pending
        ) @catch(to: RESULT) {
          count
        }
      }
    `,
    variables,
    { fetchPolicy: 'store-and-network', fetchKey },
  );
  const counts = readCounts(data, LAUNCH_OUTCOMES);
  const sampled = filterOutNullAndUndefined(
    readPrimary(data.started)?.edges.map((edge) => edge?.node),
  );
  const wait = queueWaitStats(sampled);
  const labels = {
    started: t('dashboard.card.LaunchStarted'),
    cancelled: t('dashboard.card.LaunchCancelled'),
    error: t('dashboard.card.Error'),
    pending: t('dashboard.card.Pending'),
  };
  return (
    <BAIFlex direction="column" align="stretch" gap="md">
      <StatRow
        compact
        items={LAUNCH_OUTCOMES.map((outcome) => ({
          key: outcome,
          label: labels[outcome],
          value: countText(counts[outcome]),
          size: 'sm',
        }))}
      />
      <StatRow
        items={[
          {
            key: 'mean',
            label: t('dashboard.card.MeanQueueWait'),
            value: wait ? formatCompactDuration(wait.meanMs) : '-',
            size: 'sm',
          },
          {
            key: 'median',
            label: t('dashboard.card.MedianQueueWait'),
            value: wait ? formatCompactDuration(wait.medianMs) : '-',
            size: 'sm',
          },
        ]}
      />
      {wait && (counts.started ?? 0) > sampled.length ? (
        <Text type="supporting" size="sm">
          {t('dashboard.card.QueueWaitSampled', {
            sampled: sampled.length,
            total: counts.started,
          })}
        </Text>
      ) : null}
    </BAIFlex>
  );
};

/** Sessions created in the card's range by how their launch went, and how long they queued before being scheduled. */
const SessionLaunchesPanel: React.FC<PanelComponentProps> = ({
  scope,
  vars,
  fetchKey,
}) => {
  'use memo';
  const { t } = useTranslation();
  const heading = {
    title: t('dashboard.card.SessionLaunches'),
    tooltip: t('dashboard.card.SessionLaunchesTooltip'),
  };
  return (
    <ScopedCard
      scope={scope}
      fetchKey={fetchKey}
      heading={{ project: heading, domain: heading }}
    >
      {(cardScope, key) => (
        <SessionLaunches
          scopeId={legacyScopeId(cardScope)}
          timeRange={vars.timeRange}
          fetchKey={key}
        />
      )}
    </ScopedCard>
  );
};

export default SessionLaunchesPanel;
