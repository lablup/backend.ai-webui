/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { LoadingOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import type { TagProps } from 'antd';
import { BAITag, type SemanticColor } from 'backend.ai-ui';
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

export interface ReplicaStatusTagProps extends Omit<TagProps, 'color'> {
  /**
   * Replica health/lifecycle state.
   * Health states: `HEALTHY`, `UNHEALTHY`, `DEGRADED`, `NOT_CHECKED`.
   * Lifecycle states: `PROVISIONING`, `WARMING_UP`, `RUNNING`,
   * `TERMINATING`, `TERMINATED`, `FAILED_TO_START`.
   */
  status: ReplicaStatus;
  /**
   * When true, wraps the tag in a tooltip explaining the state.
   * @default true
   */
  showTooltip?: boolean;
}

const replicaStatusColorMap: Record<ReplicaStatus, SemanticColor> = {
  HEALTHY: 'success',
  UNHEALTHY: 'error',
  DEGRADED: 'warning',
  NOT_CHECKED: 'default',
  PROVISIONING: 'info',
  WARMING_UP: 'info',
  RUNNING: 'success',
  TERMINATING: 'warning',
  TERMINATED: 'default',
  FAILED_TO_START: 'error',
};

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
  ...tagProps
}) => {
  'use memo';
  const { t } = useTranslation();

  const color = replicaStatusColorMap[status];
  const i18nKey = replicaStatusI18nKey[status];
  const label = t(`replicaStatus.${i18nKey}`);
  const tooltipTitle = showTooltip
    ? t(`replicaStatus.tooltip.${i18nKey}`, { defaultValue: '' })
    : undefined;

  // WARMING_UP and PROVISIONING share the `info` semantic color; render a
  // spinner on WARMING_UP so the two states stay visually distinct in the
  // status column.
  const icon = status === 'WARMING_UP' ? <LoadingOutlined spin /> : undefined;

  const tag = (
    <BAITag {...tagProps} color={color} icon={icon}>
      {label}
    </BAITag>
  );

  if (!showTooltip || !tooltipTitle) {
    return tag;
  }

  return (
    <Tooltip title={tooltipTitle}>
      <span>{tag}</span>
    </Tooltip>
  );
};

export default ReplicaStatusTag;
