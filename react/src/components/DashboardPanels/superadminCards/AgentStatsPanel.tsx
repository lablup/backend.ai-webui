/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { AgentStatsPanelQuery } from '../../../__generated__/AgentStatsPanelQuery.graphql';
import AgentStats from '../../AgentStats';
import type { PanelComponentProps } from '../types';
import { BAISkeleton } from 'backend.ai-ui';
import React, { Suspense } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';

const AgentStatsContent: React.FC<{ fetchKey: string }> = ({ fetchKey }) => {
  'use memo';
  const data = useLazyLoadQuery<AgentStatsPanelQuery>(
    graphql`
      query AgentStatsPanelQuery(
        $aliveAgentFilter: String!
        $schedulableAgentFilter: String!
      ) {
        ...AgentStatsFragment
          @arguments(
            aliveAgentFilter: $aliveAgentFilter
            schedulableAgentFilter: $schedulableAgentFilter
          )
      }
    `,
    {
      aliveAgentFilter: 'status == "ALIVE"',
      schedulableAgentFilter: 'status == "ALIVE" & schedulable == true',
    },
    { fetchPolicy: 'store-and-network', fetchKey },
  );
  return <AgentStats queryRef={data} />;
};

/** The cluster's total resources and agent counts, fetched only while the card is on the board. */
const AgentStatsPanel: React.FC<PanelComponentProps> = ({ fetchKey }) => {
  'use memo';
  return (
    <Suspense fallback={<BAISkeleton />}>
      <AgentStatsContent fetchKey={fetchKey} />
    </Suspense>
  );
};

export default AgentStatsPanel;
