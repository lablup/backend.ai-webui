/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { BadgeProps } from 'antd';
import { BAIBadge, SemanticColor } from 'backend.ai-ui';
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
 * Maps each deployment status to a semantic color.
 *
 * - success: HEALTHY, READY — the deployment is fully operational.
 * - info: DEPLOYING, SCALING, PENDING — transient, in-flight states.
 * - warning: DEGRADED, UNHEALTHY, STOPPING — user attention needed or transitioning away.
 * - default: NOT_CHECKED, STOPPED, TERMINATED — neutral / inactive / pre-check states.
 */
const deploymentStatusSemanticMap: Record<DeploymentStatus, SemanticColor> = {
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

/**
 * In-flight statuses that should render with the processing ripple animation.
 */
const processingStatuses: ReadonlySet<DeploymentStatus> =
  new Set<DeploymentStatus>(['DEPLOYING', 'SCALING', 'STOPPING']);

/**
 * Maps each deployment status to its i18n translation key under `deployment.status.*`.
 */
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

export interface DeploymentStatusTagProps extends Omit<
  BadgeProps,
  'color' | 'status' | 'styles' | 'text'
> {
  /**
   * The deployment-level status to display. Consolidates lifecycle (e.g.
   * `DEPLOYING`, `STOPPED`, `TERMINATED`) and health (e.g. `HEALTHY`,
   * `UNHEALTHY`, `DEGRADED`) into a single tag.
   */
  status: DeploymentStatus;
}

/**
 * DeploymentStatusTag — consolidated lifecycle + health status badge for a
 * deployment. Used in list rows and detail page headers.
 *
 * In-flight states (`DEPLOYING`, `SCALING`, `STOPPING`) automatically render
 * with a processing ripple animation.
 */
const DeploymentStatusTag: React.FC<DeploymentStatusTagProps> = ({
  status,
  ...badgeProps
}) => {
  'use memo';
  const { t } = useTranslation();

  return (
    <BAIBadge
      {...badgeProps}
      color={deploymentStatusSemanticMap[status]}
      processing={processingStatuses.has(status)}
      text={t(deploymentStatusI18nMap[status])}
    />
  );
};

export default DeploymentStatusTag;
