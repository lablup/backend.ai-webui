import { BAIDoubleTag, BAIDoubleTagProps } from 'backend.ai-ui';
import { graphql, useFragment } from 'react-relay';
import { AgentStatusTagFragment$key } from 'src/__generated__/AgentStatusTagFragment.graphql';

interface AgentStatusTagProps extends BAIDoubleTagProps {
  agentNodeFrgmt?: AgentStatusTagFragment$key | null;
}

const AgentStatusTag: React.FC<AgentStatusTagProps> = ({
  agentNodeFrgmt,
  ...doubleTagProps
}) => {
  'use memo';
  const agent = useFragment(
    graphql`
      fragment AgentStatusTagFragment on AgentNode {
        status
        version
      }
    `,
    agentNodeFrgmt,
  );

  const getStatusColor = (status: string | null | undefined) => {
    switch (status) {
      case 'ALIVE':
        return 'green';
      case 'LOST':
        return 'red';
      case 'RESTARTING':
        return 'orange';
      case 'TERMINATED':
        return 'gray';
      default:
        return 'default';
    }
  };

  return (
    <BAIDoubleTag
      values={[
        { label: agent?.status || '', color: getStatusColor(agent?.status) },
        {
          label: agent?.version || '',
        },
      ]}
      {...doubleTagProps}
    />
  );
};

export default AgentStatusTag;
