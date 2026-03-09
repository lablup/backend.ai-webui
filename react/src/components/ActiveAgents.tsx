/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ActiveAgentsFragment$key } from '../__generated__/ActiveAgentsFragment.graphql';
import AgentDetailDrawer from './AgentDetailDrawer';
import { theme } from 'antd';
import {
  filterOutNullAndUndefined,
  BAIAgentTable,
  BAIBoardItemTitle,
  BAIFetchKeyButton,
  BAIFlex,
  BAIUnmountAfterClose,
} from 'backend.ai-ui';
import { useEffect, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useRefetchableFragment } from 'react-relay';

interface ActiveAgentsProps {
  queryRef: ActiveAgentsFragment$key;
  isRefetching?: boolean;
}

const ActiveAgents: React.FC<ActiveAgentsProps> = ({
  queryRef,
  isRefetching,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [isPendingRefetch, startRefetchTransition] = useTransition();
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [order, setOrder] = useState<string>('-first_contact');

  const [data, refetch] = useRefetchableFragment(
    graphql`
      fragment ActiveAgentsFragment on Query
      @refetchable(queryName: "ActiveAgentsRefetchQuery")
      @argumentDefinitions(
        order: { type: "String", defaultValue: "-first_contact" }
      ) {
        active_agent_nodes: agent_nodes(
          first: 5
          filter: "status == \"ALIVE\""
          order: $order
        ) {
          edges {
            node {
              id
              ...BAIAgentTableFragment
              ...AgentDetailDrawerFragment
            }
          }
        }
      }
    `,
    queryRef,
  );

  const agentNodes = filterOutNullAndUndefined(
    data.active_agent_nodes?.edges.map((e) => e?.node),
  );

  const selectedAgent = agentNodes.find((a) => a.id === selectedAgentId);

  // Auto-close drawer when selected agent disappears (e.g., goes offline during refetch)
  useEffect(() => {
    if (selectedAgentId && !selectedAgent) {
      setSelectedAgentId(null);
    }
  }, [selectedAgentId, selectedAgent]);

  return (
    <>
      <BAIFlex
        direction="column"
        align="stretch"
        style={{
          paddingInline: token.paddingXL,
          height: '100%',
        }}
      >
        <BAIBoardItemTitle
          title={t('activeAgent.ActiveAgents')}
          tooltip={t('activeAgent.ActiveAgentsTooltip', {
            count: 5,
          })}
          extra={
            <BAIFetchKeyButton
              size="small"
              loading={isPendingRefetch || isRefetching}
              value=""
              onChange={() => {
                startRefetchTransition(() => {
                  refetch(
                    {},
                    {
                      fetchPolicy: 'network-only',
                    },
                  );
                });
              }}
              type="text"
              style={{
                backgroundColor: 'transparent',
              }}
            />
          }
        />

        {/* Scrollable Content Section */}
        <BAIFlex
          direction="column"
          align="stretch"
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
          }}
        >
          <BAIAgentTable
            agentsFragment={agentNodes}
            order={order}
            onChangeOrder={(newOrder) => {
              const orderValue = newOrder || '-first_contact';
              setOrder(orderValue);
              startRefetchTransition(() => {
                refetch({ order: orderValue }, { fetchPolicy: 'network-only' });
              });
            }}
            onClickAgentName={(agent) => {
              setSelectedAgentId(agent.id);
            }}
            pagination={{
              pageSize: 3,
              showSizeChanger: false,
            }}
          />
        </BAIFlex>
      </BAIFlex>
      <BAIUnmountAfterClose>
        <AgentDetailDrawer
          agentNodeFrgmt={selectedAgent ?? null}
          open={!!selectedAgent}
          onRequestClose={() => {
            setSelectedAgentId(null);
          }}
        />
      </BAIUnmountAfterClose>
    </>
  );
};

export default ActiveAgents;
