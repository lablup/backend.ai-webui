/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { BAIDoubleTag, BAIDoubleTagProps, BAIFlex } from 'backend.ai-ui';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';
import { AgentStatusTagFragment$key } from 'src/__generated__/AgentStatusTagFragment.graphql';

interface AgentStatusTagProps extends Omit<BAIDoubleTagProps, 'values'> {
  agentNodeFrgmt?: AgentStatusTagFragment$key | null;
}

const AgentStatusTag: React.FC<AgentStatusTagProps> = ({
  agentNodeFrgmt,
  ...doubleTagProps
}) => {
  'use memo';

  const { t } = useTranslation();

  const agent = useFragment(
    graphql`
      fragment AgentStatusTagFragment on AgentNode {
        status
        status_changed
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
    <BAIFlex gap="xs" wrap="wrap">
      <BAIDoubleTag
        values={[
          { label: agent?.status || '', color: getStatusColor(agent?.status) },
          {
            label: agent?.version || '',
          },
        ]}
        {...doubleTagProps}
      />
      <BAIDoubleTag
        values={[
          {
            label: t('agent.StatusChanged'),
          },
          {
            label: dayjs(agent?.status_changed).format('lll'),
          },
        ]}
        {...doubleTagProps}
      />
    </BAIFlex>
  );
};

export default AgentStatusTag;
