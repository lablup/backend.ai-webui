/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { AgentStatusBadgeFragment$key } from '../../__generated__/AgentStatusBadgeFragment.graphql';
import {
  BAIDoubleBadge,
  BAIDoubleBadgeProps,
  BAIFlex,
  badgeVariantForStatus,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

interface AgentStatusBadgeProps extends Omit<BAIDoubleBadgeProps, 'values'> {
  agentNodeFrgmt?: AgentStatusBadgeFragment$key | null;
}

const AgentStatusBadge: React.FC<AgentStatusBadgeProps> = ({
  agentNodeFrgmt,
  ...doubleBadgeProps
}) => {
  'use memo';

  const { t } = useTranslation();

  const agent = useFragment(
    graphql`
      fragment AgentStatusBadgeFragment on AgentNode {
        status
        status_changed
        version
      }
    `,
    agentNodeFrgmt,
  );

  return (
    <BAIFlex gap="xs" wrap="wrap">
      <BAIDoubleBadge
        values={[
          {
            label: agent?.status || '',
            variant: badgeVariantForStatus('agent', agent?.status),
          },
          {
            label: agent?.version || '',
          },
        ]}
        {...doubleBadgeProps}
      />
      <BAIDoubleBadge
        values={[
          {
            label: t('agent.StatusChanged'),
          },
          {
            label: dayjs(agent?.status_changed).format('lll'),
          },
        ]}
        {...doubleBadgeProps}
      />
    </BAIFlex>
  );
};

export default AgentStatusBadge;
