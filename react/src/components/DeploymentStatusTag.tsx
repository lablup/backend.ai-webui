/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { TagProps } from 'antd';
import { BAITag, type SemanticColor } from 'backend.ai-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

export type DeploymentStatus =
  | 'HEALTHY'
  | 'UNHEALTHY'
  | 'DEGRADED'
  | 'NOT_CHECKED'
  | 'DEPLOYING'
  | 'SCALING'
  | 'STOPPED'
  | 'STOPPING'
  | 'TERMINATED'
  | 'PENDING'
  | 'READY';

/**
 * Maps each deployment status to a Tag color.
 *
 * - success:    HEALTHY, READY — fully operational.
 * - processing: DEPLOYING, SCALING, PENDING — transient, in-flight states.
 * - warning:    DEGRADED, UNHEALTHY, STOPPING — attention needed or transitioning away.
 * - default:    NOT_CHECKED, STOPPED, TERMINATED — neutral / inactive.
 */
const deploymentStatusColorMap: Record<DeploymentStatus, SemanticColor> = {
  HEALTHY: 'success',
  READY: 'success',
  DEPLOYING: 'info',
  SCALING: 'info',
  PENDING: 'info',
  DEGRADED: 'warning',
  UNHEALTHY: 'warning',
  STOPPING: 'warning',
  NOT_CHECKED: 'default',
  STOPPED: 'default',
  TERMINATED: 'default',
};

const deploymentStatusI18nMap: Record<DeploymentStatus, string> = {
  HEALTHY: 'deployment.status.Healthy',
  UNHEALTHY: 'deployment.status.Unhealthy',
  DEGRADED: 'deployment.status.Degraded',
  NOT_CHECKED: 'deployment.status.NotChecked',
  DEPLOYING: 'deployment.status.Deploying',
  SCALING: 'deployment.status.Scaling',
  STOPPED: 'deployment.status.Stopped',
  STOPPING: 'deployment.status.Stopping',
  TERMINATED: 'deployment.status.Terminated',
  PENDING: 'deployment.status.Pending',
  READY: 'deployment.status.Ready',
};

export interface DeploymentStatusTagProps extends Omit<TagProps, 'color'> {
  /**
   * The deployment-level status to display. Consolidates lifecycle (e.g.
   * `DEPLOYING`, `STOPPED`, `TERMINATED`) and health (e.g. `HEALTHY`,
   * `UNHEALTHY`, `DEGRADED`) into a single tag.
   */
  status: DeploymentStatus;
}

/**
 * DeploymentStatusTag — consolidated lifecycle + health status tag for a
 * deployment. Used in list rows and detail page headers.
 */
const DeploymentStatusTag: React.FC<DeploymentStatusTagProps> = ({
  status,
  ...tagProps
}) => {
  'use memo';
  const { t } = useTranslation();

  return (
    <BAITag {...tagProps} color={deploymentStatusColorMap[status]}>
      {t(deploymentStatusI18nMap[status])}
    </BAITag>
  );
};

export default DeploymentStatusTag;
