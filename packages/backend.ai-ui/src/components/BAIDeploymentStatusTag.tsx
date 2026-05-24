import { SemanticColor, useSemanticColorMap } from '../helper';
import BAITag from './BAITag';
import type { TagProps } from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';

export type BAIDeploymentStatus =
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

const deploymentStatusSemanticMap: Record<BAIDeploymentStatus, SemanticColor> =
  {
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

const deploymentStatusI18nMap: Record<BAIDeploymentStatus, string> = {
  HEALTHY: 'comp:BAIDeploymentStatusTag.Healthy',
  UNHEALTHY: 'comp:BAIDeploymentStatusTag.Unhealthy',
  DEGRADED: 'comp:BAIDeploymentStatusTag.Degraded',
  NOT_CHECKED: 'comp:BAIDeploymentStatusTag.NotChecked',
  DEPLOYING: 'comp:BAIDeploymentStatusTag.Deploying',
  SCALING: 'comp:BAIDeploymentStatusTag.Scaling',
  STOPPED: 'comp:BAIDeploymentStatusTag.Stopped',
  STOPPING: 'comp:BAIDeploymentStatusTag.Stopping',
  TERMINATED: 'comp:BAIDeploymentStatusTag.Terminated',
  PENDING: 'comp:BAIDeploymentStatusTag.Pending',
  READY: 'comp:BAIDeploymentStatusTag.Ready',
};

export interface BAIDeploymentStatusTagProps extends Omit<TagProps, 'color'> {
  /**
   * The deployment-level status to display. Consolidates lifecycle (e.g.
   * `DEPLOYING`, `STOPPED`, `TERMINATED`) and health (e.g. `HEALTHY`,
   * `UNHEALTHY`, `DEGRADED`) into a single tag.
   */
  status: BAIDeploymentStatus;
}

/**
 * BAIDeploymentStatusTag — consolidated lifecycle + health status tag for a
 * deployment. Uses the semantic color system to align with project admin
 * serving views.
 */
const BAIDeploymentStatusTag: React.FC<BAIDeploymentStatusTagProps> = ({
  status,
  ...tagProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const semanticColorMap = useSemanticColorMap();

  return (
    <BAITag
      {...tagProps}
      color={semanticColorMap[deploymentStatusSemanticMap[status]]}
    >
      {t(deploymentStatusI18nMap[status])}
    </BAITag>
  );
};

export default BAIDeploymentStatusTag;
