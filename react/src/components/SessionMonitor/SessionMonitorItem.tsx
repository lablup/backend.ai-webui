/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { SessionMonitorItemFragment$key } from '../../__generated__/SessionMonitorItemFragment.graphql';
import { formatDurationAsDays } from '../../helper';
import {
  ATTENTION_THRESHOLD_SEC,
  isRunningStatus,
  type SessionMonitorEntry,
} from '../../helper/sessionMonitor';
import { useProjectPath } from '../../hooks/useRouteScope';
import { getIdleChecksBadgeVariant } from '../ComputeSessionNodeItems/SessionIdleChecks';
import SessionUsageMonitor from '../SessionUsageMonitor';
import WebUILink from '../WebUILink';
import { Badge } from '@lablup/ui-common/Badge';
import { Text } from '@lablup/ui-common/Text';
import { useTheme } from '@lablup/ui-common/theme';
import {
  BAIFlex,
  BAIIntervalView,
  badgeVariantForStatus,
  toLocalId,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

interface SessionMonitorItemProps {
  sessionFrgmt: SessionMonitorItemFragment$key;
  entry: SessionMonitorEntry;
  onNavigate?: () => void;
}

const SessionMonitorItem: React.FC<SessionMonitorItemProps> = ({
  sessionFrgmt,
  entry,
  onNavigate,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = useTheme();
  const buildProjectPath = useProjectPath();

  const session = useFragment(
    graphql`
      fragment SessionMonitorItemFragment on ComputeSessionNode {
        id
        name
        status
        created_at
        ...SessionUsageMonitorFragment
      }
    `,
    sessionFrgmt,
  );

  const { nearest, deadline } = entry;
  const detailPath = `${buildProjectPath('session', { scope: 'project' })}?${new URLSearchParams(
    { sessionDetail: toLocalId(session.id) },
  ).toString()}`;

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
        padding: `${token('--spacing-2')} ${token('--spacing-3')}`,
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
        <WebUILink
          to={detailPath}
          onClick={onNavigate}
          style={{ display: 'block', minWidth: 0, overflow: 'hidden' }}
        >
          <Text type="label" maxLines={1} hasTruncateTooltip={false}>
            {session.name ?? toLocalId(session.id)}
          </Text>
        </WebUILink>
        <BAIFlex direction="row" align="center" gap="xxs">
          <Badge
            variant={badgeVariantForStatus('session', session.status)}
            label={session.status ?? ''}
          />
          {session.created_at && (
            <Text type="supporting">{dayjs(session.created_at).fromNow()}</Text>
          )}
        </BAIFlex>
      </BAIFlex>
      <div style={{ width: 160, flex: 'none' }}>
        {isRunningStatus(session.status) ? (
          <SessionUsageMonitor sessionFrgmt={session} size="small" />
        ) : (
          <Text type="supporting">
            {t('sessionMonitor.WaitingForResources')}
          </Text>
        )}
      </div>
      <BAIFlex
        direction="column"
        align="end"
        gap="xxs"
        style={{ width: 96, flex: 'none' }}
      >
        {nearest && deadline !== null ? (
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
              )}
            />
            <Text type="supporting" maxLines={1} hasTruncateTooltip={false}>
              {idleCheckLabel(nearest.key)}
            </Text>
          </>
        ) : (
          <Text type="supporting">{t('sessionMonitor.NoTimeLimit')}</Text>
        )}
      </BAIFlex>
    </BAIFlex>
  );
};

export default SessionMonitorItem;
