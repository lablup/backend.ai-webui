/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { SessionStatusBadgeFragment$key } from '../../__generated__/SessionStatusBadgeFragment.graphql';
import {
  getSessionKernelBreakdown,
  getSessionKernelProgress,
  isTransitionalSessionStatus,
} from '../../helper/sessionStatus';
import { useSuspendedBackendaiClient } from '../../hooks';
import { Badge } from '@astryxdesign/core/Badge';
import { HoverCard } from '@astryxdesign/core/HoverCard';
import { Text } from '@astryxdesign/core/Text';
import { Tooltip } from '@astryxdesign/core/Tooltip';
import {
  BAIFlex,
  BAIKernelProgressBreakdown,
  BAIProgressRing,
  badgeVariantForStatus,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { CircleAlertIcon } from 'lucide-react';
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

interface SessionStatusBadgeProps {
  sessionFrgmt?: SessionStatusBadgeFragment$key | null;
  showInfo?: boolean;
  showQueuePosition?: boolean;
  showTooltip?: boolean;
}

const SessionStatusBadge: React.FC<SessionStatusBadgeProps> = ({
  sessionFrgmt,
  showInfo,
  showQueuePosition = true,
  showTooltip = true,
}) => {
  const { t } = useTranslation();
  const baiClient = useSuspendedBackendaiClient();

  const session = useFragment(
    graphql`
      fragment SessionStatusBadgeFragment on ComputeSessionNode {
        id
        status
        status_info
        status_data
        queue_position @since(version: "25.13.0")
        cluster_size
        # No pagination args: the manager ignores them and returns every
        # kernel, and the list already selects this connection, so Relay
        # merges the two selections into one request.
        kernel_nodes {
          edges {
            node {
              id
              status
            }
          }
        }
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

  const progress = getSessionKernelProgress(session);

  // One icon for all three render paths below, so they cannot drift apart. The
  // ring is determinate only where `getSessionKernelProgress` can trust the
  // fraction; elsewhere it spins like the glyph it replaces.
  const statusIcon = isTransitionalSessionStatus(session.status) ? (
    <BAIProgressRing
      percent={progress.percent}
      // Only the determinate ring is a `progressbar`, and a progressbar needs
      // a name; naming the indeterminate one would announce a decoration.
      aria-label={
        progress.percent === undefined
          ? undefined
          : (session.status ?? undefined)
      }
    />
  ) : undefined;

  const { phase } = progress;
  // The breakdown only says something a cluster session's badge does not: one
  // kernel has no distribution, and a settled one is not moving.
  const kernelBreakdownPhase =
    phase !== null &&
    progress.total > 1 &&
    (session.kernel_nodes?.edges?.length ?? 0) > 0
      ? phase
      : null;

  /**
   * One overlay per badge. A transitional badge can carry both a `status_info`
   * reason and the kernel breakdown, and a Tooltip and a HoverCard on the same
   * element open on the same hover and overlap — so where the breakdown
   * applies, the hover card takes the reason as its first line and the tooltip
   * stands down.
   */
  const withStatusOverlay = (
    badge: React.ReactElement<{
      tabIndex?: number;
      style?: React.CSSProperties;
    }>,
    tooltipContent?: React.ReactNode,
  ) => {
    if (kernelBreakdownPhase) {
      return (
        <HoverCard
          hasHoverIndication={false}
          content={
            <BAIFlex direction="column" align="stretch" gap="xs">
              {tooltipContent ? (
                <Text type="supporting">{tooltipContent}</Text>
              ) : null}
              <BAIKernelProgressBreakdown
                phase={kernelBreakdownPhase}
                done={progress.done}
                total={progress.total}
                segments={getSessionKernelBreakdown(session)}
              />
            </BAIFlex>
          }
        >
          {/* `Badge` is a bare <span>, and HoverCard's `focusTrigger="auto"`
              only attaches to a naturally focusable element — without this the
              breakdown is unreachable by keyboard (as in `BAITagList`). */}
          {React.cloneElement(badge, {
            tabIndex: 0,
            style: { cursor: 'help', ...badge.props.style },
          })}
        </HoverCard>
      );
    }
    return tooltipContent ? (
      <Tooltip content={tooltipContent}>{badge}</Tooltip>
    ) : (
      badge
    );
  };

  const statusBadge = (
    <Badge
      variant={badgeVariantForStatus('session', session.status)}
      icon={statusIcon}
      label={
        <>
          {session.status || ' '}
          {session.status_info &&
          isTransitionalSessionStatus(session.status) ? (
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
    const schedulingHistoryBadge = (
      <Badge
        variant={badgeVariantForStatus('session', session.status)}
        icon={statusIcon}
        label={session.status || ' '}
      />
    );
    return (
      <BAIFlex gap="xs">
        {withStatusOverlay(
          schedulingHistoryBadge,
          showTooltip && statusInfoDescriptionKey
            ? t(statusInfoDescriptionKey)
            : undefined,
        )}
        {queuePositionBadge}
      </BAIFlex>
    );
  }

  if (_.isEmpty(session.status_info) || !showInfo) {
    return (
      <BAIFlex wrap="nowrap" gap="xs">
        {withStatusOverlay(
          statusBadge,
          showTooltip && session.status_info
            ? statusInfoDescriptionKey
              ? t(statusInfoDescriptionKey)
              : session.status_info
            : undefined,
        )}
        {queuePositionBadge}
      </BAIFlex>
    );
  }

  return (
    <BAIFlex gap={'xs'}>
      <BAIFlex gap="xxs">
        {withStatusOverlay(
          <Badge
            variant={badgeVariantForStatus('session', session.status)}
            icon={statusIcon}
            label={session.status || ' '}
          />,
        )}
        {statusInfoDescriptionKey ? (
          <Tooltip content={t(statusInfoDescriptionKey)}>
            <Badge
              variant={badgeVariantForStatus(
                'sessionStatusInfo',
                session.status_info,
              )}
              label={session.status_info}
            />
          </Tooltip>
        ) : (
          <Badge
            variant={badgeVariantForStatus(
              'sessionStatusInfo',
              session.status_info,
            )}
            label={session.status_info}
          />
        )}
      </BAIFlex>
      {queuePositionBadge}
    </BAIFlex>
  );
};

export default SessionStatusBadge;
