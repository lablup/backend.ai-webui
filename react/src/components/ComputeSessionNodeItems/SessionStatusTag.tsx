/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  SessionStatusTagFragment$data,
  SessionStatusTagFragment$key,
} from '../../__generated__/SessionStatusTagFragment.graphql';
import { Badge } from '@astryxdesign/core/Badge';
import { Tooltip } from '@astryxdesign/core/Tooltip';
import { BAIFlex, badgeVariantForStatus } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { LoaderCircle } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

// Preemption reasons the scheduler writes into `status_info`; shown to users
// as a friendly line instead of the raw internal string.
const STATUS_INFO_DESCRIPTION_KEY: Record<string, string> = {
  PREEMPTED_BY_SCHEDULER: 'session.StatusReasonPreemptedByScheduler',
  RESCHEDULED: 'session.StatusReasonRescheduled',
  'preemption-reservation': 'session.StatusReasonPreemptionReservation',
  'preempted-by-reservation': 'session.StatusReasonPreemptedByReservation',
};

interface SessionStatusTagProps {
  sessionFrgmt?: SessionStatusTagFragment$key | null;
  showQueuePosition?: boolean;
  showTooltip?: boolean;
}

const isTransitional = (session: SessionStatusTagFragment$data) => {
  return [
    'RESERVED',
    'PREEMPTED',
    'RESCHEDULING',
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

const SessionStatusTag: React.FC<SessionStatusTagProps> = ({
  sessionFrgmt,
  showQueuePosition = true,
  showTooltip = true,
}) => {
  const { t } = useTranslation();

  const session = useFragment(
    graphql`
      fragment SessionStatusTagFragment on ComputeSessionNode {
        id
        status
        status_info
        queue_position
      }
    `,
    sessionFrgmt,
  );

  const statusInfoDescriptionKey = session?.status_info
    ? STATUS_INFO_DESCRIPTION_KEY[session.status_info]
    : undefined;

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
          <LoaderCircle className="bai-icon-spin" size="1em" />
        ) : undefined
      }
      label={session.status || ' '}
    />
  );

  return (
    <BAIFlex gap="xs">
      {showTooltip && statusInfoDescriptionKey ? (
        <Tooltip content={t(statusInfoDescriptionKey)}>{statusBadge}</Tooltip>
      ) : (
        statusBadge
      )}
      {displayQuePosition ? (
        <Tooltip content={t('session.PendingPosition')}>
          <Badge label={`#${displayQuePosition}`} />
        </Tooltip>
      ) : null}
    </BAIFlex>
  );
};

export default SessionStatusTag;
