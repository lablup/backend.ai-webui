/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { DeploymentAutoScalingTab_deployment$key } from '../__generated__/DeploymentAutoScalingTab_deployment.graphql';
import { useCurrentUserInfo } from '../hooks/backendai';
import AutoScalingRuleList from './AutoScalingRuleList';
import React from 'react';
import { graphql, useFragment } from 'react-relay';

interface DeploymentAutoScalingTabProps {
  deploymentFrgmt: DeploymentAutoScalingTab_deployment$key | null | undefined;
  fetchKey?: string;
}

/**
 * DeploymentAutoScalingTab — tab shown on the Deployment detail page that
 * hosts the Auto-Scaling Rules management UI.
 *
 * This is a thin wrapper around `<AutoScalingRuleList />`. It extracts the
 * Relay global ID from the deployment fragment and derives the
 * `isEndpointDestroying` / `isOwnedByCurrentUser` flags that the underlying
 * list needs for permission gating. `AutoScalingRuleList` is already
 * Deployment-API based (its GraphQL query is rooted at `deployment(id: $id)`)
 * so no API migration is needed — we only need to surface it inside the new
 * Deployment detail page tabs.
 */
const DeploymentAutoScalingTab: React.FC<DeploymentAutoScalingTabProps> = ({
  deploymentFrgmt,
  fetchKey,
}) => {
  'use memo';
  const [currentUser] = useCurrentUserInfo();

  const deployment = useFragment(
    graphql`
      fragment DeploymentAutoScalingTab_deployment on ModelDeployment {
        id
        metadata {
          status
        }
        creator @since(version: "26.4.3") {
          basicInfo {
            email
          }
        }
      }
    `,
    deploymentFrgmt,
  );

  if (!deployment?.id) {
    return null;
  }

  const status = deployment.metadata?.status;
  // DeploymentStatus has no explicit DESTROYED state; STOPPING / STOPPED are
  // the terminal lifecycle states that should disable mutations, mirroring
  // `isEndpointInDestroyingCategory` from the legacy Endpoint API.
  const isEndpointDestroying = status === 'STOPPING' || status === 'STOPPED';

  const creatorEmail = deployment.creator?.basicInfo?.email ?? null;
  // When the creator is unknown (e.g. on manager versions < 26.4.3 where the
  // `creator` field is not yet resolvable), fall back to "owned" so the UI
  // does not over-restrict.
  const isOwnedByCurrentUser =
    !creatorEmail || creatorEmail === currentUser.email;

  return (
    <AutoScalingRuleList
      deploymentId={deployment.id}
      isEndpointDestroying={isEndpointDestroying}
      isOwnedByCurrentUser={isOwnedByCurrentUser}
      fetchKey={fetchKey}
    />
  );
};

export default DeploymentAutoScalingTab;
