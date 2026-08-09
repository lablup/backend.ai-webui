/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { Badge } from '@astryxdesign/core/Badge';
import { Tooltip } from '@astryxdesign/core/Tooltip';
import { badgeVariantForStatus } from 'backend.ai-ui';
import { LoaderCircle } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

export type ReplicaStatus =
  | 'HEALTHY'
  | 'UNHEALTHY'
  | 'DEGRADED'
  | 'NOT_CHECKED'
  | 'PROVISIONING'
  | 'WARMING_UP'
  | 'RUNNING'
  | 'TERMINATING'
  | 'TERMINATED'
  | 'FAILED_TO_START';

// PILOT-DECISION: props no longer extend antd `Omit<TagProps, 'color'>`.
// Grepped consumers (DeploymentReplicasCard) pass only `status` and
// `showTooltip`, so the explicit minimal interface below is the whole public
// surface. The local status→antd-preset color map is gone too — the Badge
// variant comes from the repo-global `badgeVariantForStatus('replica', …)`
// lookup in backend.ai-ui.
export interface ReplicaStatusTagProps {
  /**
   * Replica health/lifecycle state.
   * Health states: `HEALTHY`, `UNHEALTHY`, `DEGRADED`, `NOT_CHECKED`.
   * Lifecycle states: `PROVISIONING`, `WARMING_UP`, `RUNNING`,
   * `TERMINATING`, `TERMINATED`, `FAILED_TO_START`.
   */
  status: ReplicaStatus;
  /**
   * When true, wraps the badge in a tooltip explaining the state.
   * @default true
   */
  showTooltip?: boolean;
}

const replicaStatusI18nKey: Record<ReplicaStatus, string> = {
  HEALTHY: 'Healthy',
  UNHEALTHY: 'Unhealthy',
  DEGRADED: 'Degraded',
  NOT_CHECKED: 'NotChecked',
  PROVISIONING: 'Provisioning',
  WARMING_UP: 'WarmingUp',
  RUNNING: 'Running',
  TERMINATING: 'Terminating',
  TERMINATED: 'Terminated',
  FAILED_TO_START: 'FailedToStart',
};

const ReplicaStatusTag: React.FC<ReplicaStatusTagProps> = ({
  status,
  showTooltip = true,
}) => {
  'use memo';
  const { t } = useTranslation();

  const i18nKey = replicaStatusI18nKey[status];
  const label = t(`replicaStatus.${i18nKey}`);
  const tooltipContent = showTooltip
    ? t(`replicaStatus.tooltip.${i18nKey}`, { defaultValue: '' })
    : undefined;

  // WARMING_UP and PROVISIONING share the info variant; render a spinner on
  // WARMING_UP so the two states stay visually distinct in the status column.
  const icon =
    status === 'WARMING_UP' ? (
      <LoaderCircle className="bai-icon-spin" size="1em" />
    ) : undefined;

  const badge = (
    <Badge
      variant={badgeVariantForStatus('replica', status)}
      icon={icon}
      label={label}
    />
  );

  if (!showTooltip || !tooltipContent) {
    return badge;
  }

  return <Tooltip content={tooltipContent}>{badge}</Tooltip>;
};

export default ReplicaStatusTag;
