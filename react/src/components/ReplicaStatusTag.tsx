/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { BadgeProps, Tooltip } from 'antd';
import { BAIBadge, SemanticColor } from 'backend.ai-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

export type ReplicaStatus =
  | 'HEALTHY'
  | 'UNHEALTHY'
  | 'DEGRADED'
  | 'NOT_CHECKED'
  | 'PROVISIONING'
  | 'TERMINATING'
  | 'TERMINATED';

export interface ReplicaStatusTagProps extends Omit<
  BadgeProps,
  'color' | 'status'
> {
  /**
   * Replica health/lifecycle state.
   * Health states: `HEALTHY`, `UNHEALTHY`, `DEGRADED`, `NOT_CHECKED`.
   * Lifecycle states: `PROVISIONING`, `TERMINATING`, `TERMINATED`.
   */
  status: ReplicaStatus;
  /**
   * When true, wraps the badge in a tooltip explaining the state.
   * @default true
   */
  showTooltip?: boolean;
}

/**
 * Maps each replica status to a semantic color from the BAI design system.
 * `NOT_CHECKED` intentionally maps to `undefined` so `BAIBadge` renders an
 * outline-only (border) dot, matching the "unknown/indeterminate" convention.
 */
const replicaStatusSemanticMap: Record<
  ReplicaStatus,
  SemanticColor | undefined
> = {
  HEALTHY: 'success',
  UNHEALTHY: 'error',
  DEGRADED: 'warning',
  NOT_CHECKED: undefined,
  PROVISIONING: 'info',
  TERMINATING: 'warning',
  TERMINATED: 'default',
};

/**
 * Statuses that should render with a ripple/processing animation on the dot
 * to convey an in-progress lifecycle transition.
 */
const processingStatuses: ReadonlySet<ReplicaStatus> = new Set([
  'PROVISIONING',
  'TERMINATING',
]);

/**
 * i18n key suffix (PascalCase) for each replica status. Matches the keys
 * registered under `replicaStatus.*` and `replicaStatus.tooltip.*` in
 * `resources/i18n/en.json` (see FR-2666).
 */
const replicaStatusI18nKey: Record<ReplicaStatus, string> = {
  HEALTHY: 'Healthy',
  UNHEALTHY: 'Unhealthy',
  DEGRADED: 'Degraded',
  NOT_CHECKED: 'NotChecked',
  PROVISIONING: 'Provisioning',
  TERMINATING: 'Terminating',
  TERMINATED: 'Terminated',
};

/**
 * ReplicaStatusTag - Displays the health/lifecycle state of a deployment replica.
 *
 * Renders a `BAIBadge` whose dot color and processing animation map to the
 * new replica health state machine used by the Endpoint Deployment UI
 * (FR-1368 / FR-2658). When `showTooltip` is true (default), the badge is
 * wrapped in a `Tooltip` that explains the state to the user.
 */
const ReplicaStatusTag: React.FC<ReplicaStatusTagProps> = ({
  status,
  showTooltip = true,
  ...badgeProps
}) => {
  'use memo';
  const { t } = useTranslation();

  const color = replicaStatusSemanticMap[status];
  const processing = processingStatuses.has(status);
  const i18nKey = replicaStatusI18nKey[status];
  const label = t(`replicaStatus.${i18nKey}`);
  const tooltipTitle = showTooltip
    ? t(`replicaStatus.tooltip.${i18nKey}`, { defaultValue: '' })
    : undefined;

  const badge = (
    <BAIBadge
      {...badgeProps}
      color={color}
      processing={processing}
      text={label}
    />
  );

  if (!showTooltip || !tooltipTitle) {
    return badge;
  }

  return (
    <Tooltip title={tooltipTitle}>
      <span>{badge}</span>
    </Tooltip>
  );
};

export default ReplicaStatusTag;
