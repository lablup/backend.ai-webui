/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { BAIDoubleTag, BAITag } from 'backend.ai-ui';
import _ from 'lodash';
import { graphql, useFragment } from 'react-relay';
import { AgentComputePluginsFragment$key } from 'src/__generated__/AgentComputePluginsFragment.graphql';

interface AgentComputePluginsProps {
  agentNodeFrgmt?: AgentComputePluginsFragment$key | null;
}

const AgentComputePlugins: React.FC<AgentComputePluginsProps> = ({
  agentNodeFrgmt,
}) => {
  'use memo';
  const agent = useFragment(
    graphql`
      fragment AgentComputePluginsFragment on AgentNode {
        compute_plugins
        available_slots
      }
    `,
    agentNodeFrgmt,
  );

  const parsedComputePlugins = JSON.parse(agent?.compute_plugins || '{}');
  const parsedAvailableSlots = JSON.parse(agent?.available_slots || '{}');

  return (
    <>
      {parsedComputePlugins?.cuda ? (
        <>
          {parsedComputePlugins?.cuda?.cuda_version ? (
            <BAIDoubleTag
              values={[
                { label: 'CUDA' },
                {
                  label: parsedComputePlugins?.cuda?.cuda_version,
                  color: 'green',
                },
              ]}
            />
          ) : (
            <BAITag color="green">CUDA Disabled</BAITag>
          )}
          <BAIDoubleTag
            values={[
              { label: 'CUDA Plugin' },
              {
                label: parsedComputePlugins?.cuda?.version,
                color: 'blue',
              },
            ]}
          />
          {_.includes(_.keys(parsedAvailableSlots), 'cuda.shares') ? (
            <BAITag color="blue" style={{ borderRadius: 0 }}>
              Fractional GPU™
            </BAITag>
          ) : null}
        </>
      ) : (
        '-'
      )}
    </>
  );
};

export default AgentComputePlugins;
