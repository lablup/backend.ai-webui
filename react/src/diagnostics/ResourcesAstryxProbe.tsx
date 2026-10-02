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
import AgentDetailDrawer from '../components/AgentDetailDrawer';
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
