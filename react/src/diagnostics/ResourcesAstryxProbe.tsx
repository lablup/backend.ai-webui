/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Ticket 20 probe orchestrator — lives under `react/src` (not `theme-probe/`)
 because Relay only compiles `graphql` tags inside the configured source
 roots (`relay.config.js` -> `react/src`). The theme-probe harness page
 (`react/theme-probe/resourcesMain.tsx`) mounts these against a
 relay-test-utils mock environment; they render nothing in the app itself.
*/
import type { ResourcesAstryxProbeAgentQuery } from '../__generated__/ResourcesAstryxProbeAgentQuery.graphql';
import type { ResourcesAstryxProbeResourceGroupQuery } from '../__generated__/ResourcesAstryxProbeResourceGroupQuery.graphql';
import AgentDetailDrawer from '../components/AgentDetailDrawer';
import ResourceGroupInfoModal from '../components/ResourceGroupInfoModal';
import { filterOutEmpty } from 'backend.ai-ui';
import React from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';

/** Fetches one mock `AgentNode` and renders the real `AgentDetailDrawer`, open. */
export const ResourcesProbeAgent: React.FC = () => {
  'use memo';
  const data = useLazyLoadQuery<ResourcesAstryxProbeAgentQuery>(
    graphql`
      query ResourcesAstryxProbeAgentQuery(
        $filter: String
        $order: String
        $offset: Int
        $first: Int
        $before: String
        $after: String
        $last: Int
      ) {
        agent_nodes(
          filter: $filter
          order: $order
          offset: $offset
          first: $first
          after: $after
          before: $before
          last: $last
        ) {
          edges {
            node {
              id
              ...AgentDetailDrawerFragment
            }
          }
          count
        }
      }
    `,
    { first: 1 },
  );
  const node = filterOutEmpty(
    data.agent_nodes?.edges.map((e) => e?.node) ?? [],
  )[0];
  return (
    <AgentDetailDrawer open agentNodeFrgmt={node} onRequestClose={() => {}} />
  );
};

/** Fetches one mock `ScalingGroup` and renders the real `ResourceGroupInfoModal`, open. */
export const ResourcesProbeResourceGroup: React.FC = () => {
  'use memo';
  const data = useLazyLoadQuery<ResourcesAstryxProbeResourceGroupQuery>(
    graphql`
      query ResourcesAstryxProbeResourceGroupQuery($is_active: Boolean) {
        scaling_groups(is_active: $is_active) {
          name
          ...ResourceGroupInfoModalFragment
        }
      }
    `,
    { is_active: true },
  );
  const group = filterOutEmpty([...(data.scaling_groups ?? [])])[0];
  return (
    <ResourceGroupInfoModal
      open
      resourceGroupFrgmt={group}
      onRequestClose={() => {}}
    />
  );
};
