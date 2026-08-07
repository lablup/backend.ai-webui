/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  SessionStatusTagFragment$data,
  SessionStatusTagFragment$key,
} from '../../__generated__/SessionStatusTagFragment.graphql';
import { useSuspendedBackendaiClient } from '../../hooks';
import { Badge } from '@astryxdesign/core/Badge';
import { Tooltip } from '@astryxdesign/core/Tooltip';
import { BAIFlex, badgeVariantForStatus } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { LoaderCircle, CircleAlertIcon } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

interface SessionStatusTagProps {
  sessionFrgmt?: SessionStatusTagFragment$key | null;
  showInfo?: boolean;
  showQueuePosition?: boolean;
  showTooltip?: boolean;
}

const isTransitional = (session: SessionStatusTagFragment$data) => {
  return [
    'SCHEDULED',
    'RESTARTING',
    'TERMINATING',
    'PENDING',
    'PREPARING',
    'PREPARED',
    'CREATING',
    'PULLING',
  ].includes(session?.status || '');
};

// PILOT-DECISION (ticket 17): antd `Tag color` (per-file blue/green/red map)
// -> Astryx `Badge` variants via the repo-global `badgeVariantForStatus`
// lookup (`session` / `sessionStatusInfo` domains, ticket 13). The bespoke
// pill styling (11px joined radii, dashed second segment, 80px ellipsis
// width, paddingSM tweaks) is dropped — defaults-first; the two-segment
// status+reason pill becomes two adjacent Badges.
const SessionStatusTag: React.FC<SessionStatusTagProps> = ({
  sessionFrgmt,
  showInfo,
  showQueuePosition = true,
  showTooltip = true,
}) => {
  const { t } = useTranslation();
  const baiClient = useSuspendedBackendaiClient();

  const session = useFragment(
    graphql`
      fragment SessionStatusTagFragment on ComputeSessionNode {
        id
        status
        status_info
        status_data
        queue_position @since(version: "25.13.0")
      }
    `,
    sessionFrgmt,
  );

  const displayQuePosition =
    showQueuePosition && _.isNumber(session?.queue_position)
      ? session?.queue_position + 1
      : undefined;

  if (!session) {
    return null;
  }

  const statusBadge = (
    <Badge
      variant={badgeVariantForStatus('session', session.status)}
      icon={
        isTransitional(session) ? (
          <LoaderCircle className="anticon-spin" size="1em" />
        ) : undefined
      }
      label={
        <>
          {session.status || ' '}
          {session.status_info && isTransitional(session) ? (
            <CircleAlertIcon
              size="1em"
              style={{
                verticalAlign: 'text-top',
                marginLeft: 4,
                color: 'var(--color-error)',
              }}
            />
          ) : null}
        </>
      }
    />
  );

  const queuePositionBadge = displayQuePosition ? (
    <Tooltip content={t('session.PendingPosition')}>
      <Badge label={`#${displayQuePosition}`} />
    </Tooltip>
  ) : null;

  if (baiClient.supports('session-scheduling-history')) {
    return (
      <BAIFlex gap="xs">
        <Badge
          variant={badgeVariantForStatus('session', session.status)}
          icon={
            isTransitional(session) ? (
              <LoaderCircle className="anticon-spin" size="1em" />
            ) : undefined
          }
          label={session.status || ' '}
        />
        {queuePositionBadge}
      </BAIFlex>
    );
  }

  if (_.isEmpty(session.status_info) || !showInfo) {
    return (
      <BAIFlex wrap="nowrap" gap="xs">
        {showTooltip && session.status_info ? (
          <Tooltip content={session.status_info}>{statusBadge}</Tooltip>
        ) : (
          statusBadge
        )}
        {queuePositionBadge}
      </BAIFlex>
    );
  }

  return (
    <BAIFlex gap={'xs'}>
      <BAIFlex gap="xxs">
        <Badge
          variant={badgeVariantForStatus('session', session.status)}
          icon={
            isTransitional(session) ? (
              <LoaderCircle className="anticon-spin" size="1em" />
            ) : undefined
          }
          label={session.status || ' '}
        />
        <Badge
          variant={badgeVariantForStatus(
            'sessionStatusInfo',
            session.status_info,
          )}
          label={session.status_info}
        />
      </BAIFlex>
      {queuePositionBadge}
    </BAIFlex>
  );
};

export default SessionStatusTag;
