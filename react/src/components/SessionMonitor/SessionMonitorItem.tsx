/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { SessionMonitorItemFragment$key } from '../../__generated__/SessionMonitorItemFragment.graphql';
import { convertToBinaryUnit, formatDurationAsDays } from '../../helper';
import {
  ATTENTION_THRESHOLD_SEC,
  isRunningStatus,
  type SessionMonitorEntry,
} from '../../helper/sessionMonitor';
import { useResourceSlotsDetails } from '../../hooks/backendai';
import { getIdleChecksBadgeVariant } from '../ComputeSessionNodeItems/SessionIdleChecks';
import SessionStatusBadge from '../ComputeSessionNodeItems/SessionStatusBadge';
import SessionMonitorUtilizationBars from './SessionMonitorUtilizationBars';
import { Badge } from '@lablup/ui-common/Badge';
import { Text } from '@lablup/ui-common/Text';
import { useTheme } from '@lablup/ui-common/theme';
import { BAIFlex, BAIIntervalView, BAILink, toLocalId } from 'backend.ai-ui';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

interface SessionMonitorItemProps {
  sessionFrgmt: SessionMonitorItemFragment$key;
  entry: SessionMonitorEntry;
  /** The session list the row's detail link opens on. */
  listPath: string;
  onNavigate?: () => void;
}

const SessionMonitorItem: React.FC<SessionMonitorItemProps> = ({
  sessionFrgmt,
  entry,
  listPath,
  onNavigate,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = useTheme();
  const { mergedResourceSlots } = useResourceSlotsDetails();

  const session = useFragment(
    graphql`
      fragment SessionMonitorItemFragment on ComputeSessionNode {
        id
        name
        status
        created_at
        occupied_slots
        requested_slots
        ...SessionMonitorUtilizationBarsFragment
        ...SessionStatusBadgeFragment
      }
    `,
    sessionFrgmt,
  );

  const { nearest, deadline } = entry;
  const isRunning = isRunningStatus(session.status);
  const detailPath = `${listPath}?${new URLSearchParams({
    sessionDetail: toLocalId(session.id),
  }).toString()}`;

  // "GPU 2 · RAM 32G": the allocation, or the request while starting.
  const slots: Record<string, string | undefined> = JSON.parse(
    (isRunning ? session.occupied_slots : session.requested_slots) || '{}',
  );
  const allocation = _.compact(
    _.map(slots, (value, key) => {
      if (!value) return null;
      const name = mergedResourceSlots?.[key]?.human_readable_name ?? key;
      if (key === 'mem') {
        const gib = convertToBinaryUnit(value, 'g', 1)?.number ?? 0;
        return `${name} ${Number.isInteger(gib) ? gib : gib.toFixed(1)}G`;
      }
      return `${name} ${parseFloat(value)}`;
    }),
  ).join(' · ');
  const elapsed = session.created_at
    ? dayjs(session.created_at).fromNow(true)
    : null;

  const idleCheckLabel = (
    key: NonNullable<SessionMonitorEntry['nearest']>['key'],
  ) =>
    key === 'utilization'
      ? t('session.UtilizationIdleTimeout')
      : key === 'network_timeout'
        ? t('session.NetworkIdleTimeout')
        : t('session.MaxSessionLifetime');

  return (
    <BAIFlex
      direction="row"
      align="center"
      gap="sm"
      style={{
        padding: `${token('--spacing-1-5')} ${token('--spacing-3')}`,
        borderTop: `1px solid ${token('--color-border')}`,
        background:
          nearest && nearest.remaining <= ATTENTION_THRESHOLD_SEC
            ? token('--color-error-muted')
            : undefined,
      }}
    >
      <BAIFlex
        direction="column"
        align="stretch"
        gap="xxs"
        style={{ flex: 1, minWidth: 0 }}
      >
        <BAIFlex direction="row" align="center" gap="xs">
          <BAILink
            to={detailPath}
            onClick={onNavigate}
            ellipsis
            style={{ minWidth: 0, fontWeight: 500 }}
          >
            {session.name ?? toLocalId(session.id)}
          </BAILink>
        </BAIFlex>
        <BAIFlex direction="row" align="center" gap="xs">
          <Text
            type="supporting"
            maxLines={1}
            style={{ flex: '0 1 auto', minWidth: 0 }}
          >
            {allocation}
          </Text>
          {elapsed && (
            <Text type="supporting" textWrap="nowrap">
              {allocation ? `· ${elapsed}` : elapsed}
            </Text>
          )}
        </BAIFlex>
      </BAIFlex>
      <div style={{ width: 160, flex: 'none' }}>
        {isRunning && <SessionMonitorUtilizationBars sessionFrgmt={session} />}
      </div>
      {
        <BAIFlex
          direction="column"
          align="stretch"
          gap="xxs"
          style={{ width: 140, flex: 'none', textAlign: 'end' }}
        >
          <BAIFlex justify="end">
            <SessionStatusBadge sessionFrgmt={session} showQueuePosition />
          </BAIFlex>
          {nearest && deadline !== null && (
            <>
              <BAIIntervalView
                delay={1000}
                callback={() => {
                  const remainingSec = Math.max(
                    0,
                    Math.round((deadline - Date.now()) / 1000),
                  );
                  return {
                    remainingSec,
                    text:
                      remainingSec > 0
                        ? formatDurationAsDays(
                            dayjs().toISOString(),
                            dayjs(deadline).toISOString(),
                          )
                        : '00:00:00',
                  };
                }}
                render={({ remainingSec, text }) => (
                  <BAIFlex justify="end">
                    <Badge
                      variant={getIdleChecksBadgeVariant(
                        {
                          remaining: remainingSec,
                          remaining_time_type: nearest.remainingTimeType,
                          extra: null,
                        },
                        'remaining',
                      )}
                      label={text}
                    />
                  </BAIFlex>
                )}
              />
              <Text type="supporting" maxLines={1} justify="end">
                {idleCheckLabel(nearest.key)}
              </Text>
            </>
          )}
        </BAIFlex>
      }
    </BAIFlex>
  );
};

export default SessionMonitorItem;
