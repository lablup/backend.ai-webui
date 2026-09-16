import { BAITagProps } from './BAITag';
import { default as React } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
export type BAIDeploymentStatus = 'HEALTHY' | 'UNHEALTHY' | 'DEGRADED' | 'NOT_CHECKED' | 'DEPLOYING' | 'SCALING' | 'STOPPED' | 'STOPPING' | 'TERMINATED' | 'PENDING' | 'READY';
/**
 * Deployment statuses that belong to the "stopped" lifecycle category — the
 * deployment is stopping or already stopped/terminated, as opposed to an
 * active/serving state.
 */
export declare const DEPLOYMENT_STOPPED_CATEGORY_STATUSES: readonly ["STOPPING", "STOPPED", "TERMINATED"];
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
export declare const isDeploymentInStoppedCategory: (status: BAIDeploymentStatus | "%future added value" | null | undefined) => boolean;
/**
 * Statuses that show the loading spinner on the tag — the deployment is
 * actively processing. `PENDING` (queued, not processing) is excluded.
 */
export declare const DEPLOYMENT_IN_PROGRESS_STATUSES: readonly ["DEPLOYING", "SCALING"];
export declare const isDeploymentInProgress: (status: BAIDeploymentStatus | "%future added value" | null | undefined) => boolean;
export interface BAIDeploymentStatusTagProps extends Omit<BAITagProps, 'color'> {
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
declare const BAIDeploymentStatusTag: React.FC<BAIDeploymentStatusTagProps>;
export default BAIDeploymentStatusTag;
