import { badgeVariantForStatus } from '../helper/astryxTagVariant';
import { useBAIi18n } from '../hooks/useBAIi18n';
import { Badge, type BadgeProps } from '@lablup/ui-common/Badge';
import { LoaderCircle } from 'lucide-react';
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
 * Statuses that show the loading spinner on the badge — the deployment is
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

const deploymentStatusI18nMap: Record<BAIDeploymentStatus, string> = {
  HEALTHY: 'comp:BAIDeploymentStatusBadge.Healthy',
  UNHEALTHY: 'comp:BAIDeploymentStatusBadge.Unhealthy',
  DEGRADED: 'comp:BAIDeploymentStatusBadge.Degraded',
  NOT_CHECKED: 'comp:BAIDeploymentStatusBadge.NotChecked',
  DEPLOYING: 'comp:BAIDeploymentStatusBadge.Deploying',
  SCALING: 'comp:BAIDeploymentStatusBadge.Scaling',
  STOPPED: 'comp:BAIDeploymentStatusBadge.Stopped',
  STOPPING: 'comp:BAIDeploymentStatusBadge.Stopping',
  TERMINATED: 'comp:BAIDeploymentStatusBadge.Terminated',
  PENDING: 'comp:BAIDeploymentStatusBadge.Pending',
  READY: 'comp:BAIDeploymentStatusBadge.Ready',
};

export interface BAIDeploymentStatusBadgeProps extends Omit<
  BadgeProps,
  'variant' | 'label'
> {
  /**
   * The deployment-level status to display. Consolidates lifecycle (e.g.
   * `DEPLOYING`, `STOPPED`, `TERMINATED`) and health (e.g. `HEALTHY`,
   * `UNHEALTHY`, `DEGRADED`) into a single badge.
   */
  status: BAIDeploymentStatus;
}

/**
 * Consolidated lifecycle + health status of a deployment, as a live Badge
 * (ADR 0007).
 */
const BAIDeploymentStatusBadge: React.FC<BAIDeploymentStatusBadgeProps> = ({
  status,
  ...badgeProps
}) => {
  'use memo';
  const { t } = useBAIi18n();

  return (
    <Badge
      {...badgeProps}
      icon={
        isDeploymentInProgress(status) ? (
          <LoaderCircle className="bai-icon-spin" size="1em" />
        ) : undefined
      }
      variant={badgeVariantForStatus('deployment', status)}
      label={t(deploymentStatusI18nMap[status])}
    />
  );
};

export default BAIDeploymentStatusBadge;
