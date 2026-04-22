/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
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
  | 'TERMINATING'
  | 'TERMINATED';

export interface ReplicaStatusTagProps extends Omit<TagProps, 'color'> {
  /**
   * Replica health/lifecycle state.
   * Health states: `HEALTHY`, `UNHEALTHY`, `DEGRADED`, `NOT_CHECKED`.
   * Lifecycle states: `PROVISIONING`, `TERMINATING`, `TERMINATED`.
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
  TERMINATING: 'warning',
  TERMINATED: 'default',
};

const replicaStatusI18nKey: Record<ReplicaStatus, string> = {
  HEALTHY: 'Healthy',
  UNHEALTHY: 'Unhealthy',
  DEGRADED: 'Degraded',
  NOT_CHECKED: 'NotChecked',
  PROVISIONING: 'Provisioning',
  TERMINATING: 'Terminating',
  TERMINATED: 'Terminated',
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

  const tag = (
    <BAITag {...tagProps} color={color}>
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
