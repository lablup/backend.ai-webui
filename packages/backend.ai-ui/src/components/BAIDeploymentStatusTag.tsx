import { SemanticColor, useSemanticColorMap } from '../helper';
import { useBAIi18n } from '../hooks/useBAIi18n';
import BAITag from './BAITag';
import { LoadingOutlined } from '@ant-design/icons';
import type { TagProps } from 'antd';
import React from 'react';

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

/**
 * Deployment statuses that belong to the "stopped" lifecycle category — the
 * deployment is stopping or already stopped/terminated, as opposed to an
 * active/serving state.
 */
export const DEPLOYMENT_STOPPED_CATEGORY_STATUSES = [
  'STOPPING',
  'STOPPED',
  'TERMINATED',
] as const satisfies readonly BAIDeploymentStatus[];

/**
 * Single source of truth for "is this deployment stopping or already
 * stopped/terminated?". Live-only call-to-actions (start chat, add revision)
 * and lifecycle mutations should be hidden/disabled for these statuses.
 * Mirrors `isEndpointInDestroyingCategory` for the legacy Endpoint API.
 *
 * The `'%future added value'` member is what Relay generates for
 * forward-compat in enum field types; including it explicitly keeps
 * autocomplete on `BAIDeploymentStatus` while still letting callers pass
 * fragment status fields directly. Unknown / unrecognized values return
 * `false`.
 */
export const isDeploymentInStoppedCategory = (
  status: BAIDeploymentStatus | '%future added value' | null | undefined,
): boolean =>
  status != null &&
  (DEPLOYMENT_STOPPED_CATEGORY_STATUSES as readonly string[]).includes(status);

/**
 * Statuses that show the loading spinner on the tag — the deployment is
 * actively processing. `PENDING` (queued, not processing) is excluded.
 */
export const DEPLOYMENT_IN_PROGRESS_STATUSES = [
  'DEPLOYING',
  'SCALING',
] as const satisfies readonly BAIDeploymentStatus[];

export const isDeploymentInProgress = (
  status: BAIDeploymentStatus | '%future added value' | null | undefined,
): boolean =>
  status != null &&
  (DEPLOYMENT_IN_PROGRESS_STATUSES as readonly string[]).includes(status);

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
  const { t } = useBAIi18n();
  const semanticColorMap = useSemanticColorMap();

  return (
    <BAITag
      {...tagProps}
      icon={
        isDeploymentInProgress(status) ? <LoadingOutlined spin /> : undefined
      }
      color={semanticColorMap[deploymentStatusSemanticMap[status]]}
    >
      {t(deploymentStatusI18nMap[status])}
    </BAITag>
  );
};

export default BAIDeploymentStatusTag;
