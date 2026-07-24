/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { LoadingOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import type { TagProps } from 'antd';
import { BAITag } from 'backend.ai-ui';
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

/**
 * Antd `Tag` preset status colors. Only these five values are recognized by
 * antd as status presets (`success | processing | error | warning | default`)
 * and therefore resolve to theme tokens (`colorSuccess`, `colorInfo`, …) that
 * adapt to dark mode. `'info'` is NOT an antd status preset — passing it makes
 * antd treat the tag as a custom color and fall back to hardcoded white text,
 * which glares in dark mode. Use `'processing'` for info-colored states: it
 * maps to the `colorInfo` token and `BAITag` already renders its background
 * transparent via the `colorInfoBg` override.
 */
type TagPresetStatusColor =
  | 'success'
  | 'processing'
  | 'error'
  | 'warning'
  | 'default';

const replicaStatusColorMap: Record<ReplicaStatus, TagPresetStatusColor> = {
  HEALTHY: 'success',
  UNHEALTHY: 'error',
  DEGRADED: 'warning',
  NOT_CHECKED: 'default',
  PROVISIONING: 'processing',
  WARMING_UP: 'processing',
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

  // WARMING_UP and PROVISIONING share the `processing` (info) status color;
  // render a spinner on WARMING_UP so the two states stay visually distinct in
  // the status column.
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
