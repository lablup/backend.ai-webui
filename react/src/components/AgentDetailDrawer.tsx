import AgentDetailDrawerContent from './AgentDetailDrawerContent';
import { Drawer, DrawerProps, Skeleton } from 'antd';
import { BAIFetchKeyButton, toLocalId, useBAILogger } from 'backend.ai-ui';
import { Suspense, useEffect, useEffectEvent, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useMutation, useRefetchableFragment } from 'react-relay';
import { AgentDetailDrawerFragment$key } from 'src/__generated__/AgentDetailDrawerFragment.graphql';

interface AgentDetailDrawerProps extends DrawerProps {
  onRequestClose?: () => void;
  agentNodeFragment?: AgentDetailDrawerFragment$key | null;
}

const AgentDetailDrawer: React.FC<AgentDetailDrawerProps> = ({
  onRequestClose,
  agentNodeFragment,
  ...drawerProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const { logger } = useBAILogger();
  const [isPendingRefetch, startRefetchTransition] = useTransition();

  const [agent, refetch] = useRefetchableFragment(
    graphql`
      fragment AgentDetailDrawerFragment on Node
      @refetchable(queryName: "AgentDetailDrawerRefetchQuery") {
        ... on AgentNode {
          id
          ...AgentDetailDrawerContentFragment @alias(as: "agentNodeFragment")
        }
      }
    `,
    agentNodeFragment,
  );

  const [rescanGPUAllocationMap] = useMutation(graphql`
    mutation AgentDetailDrawerRescanGPUAllocationMapMutation(
      $agentId: String!
    ) {
      rescan_gpu_alloc_maps(agent_id: $agentId) {
        task_id
      }
    }
  `);

  const initialFetch = useEffectEvent(() => {
    if (agent?.id) {
      startRefetchTransition(() => {
        rescanGPUAllocationMap({
          variables: {
            agentId: toLocalId(agent.id),
          },
          onError: (error) => logger.error(error),
        });
        refetch(
          {},
          {
            fetchPolicy: 'network-only',
          },
        );
      });
    }
  });
  useEffect(() => {
    initialFetch();
  }, []);

  return (
    <Drawer
      title={t('agent.AgentInfo')}
      size={800}
      onClose={onRequestClose}
      {...drawerProps}
      extra={
        <BAIFetchKeyButton
          autoUpdateDelay={7_000}
          loading={isPendingRefetch}
          value=""
          onChange={() => {
            startRefetchTransition(() => {
              rescanGPUAllocationMap({
                variables: {
                  agentId: toLocalId(agent?.id || ''),
                },
                onError: (error) => logger.error(error),
              });
              refetch(
                {},
                {
                  fetchPolicy: 'network-only',
                },
              );
            });
          }}
        />
      }
    >
      <Suspense fallback={<Skeleton active />}>
        {agent?.agentNodeFragment && (
          <AgentDetailDrawerContent
            agentNodeFragment={agent?.agentNodeFragment}
          />
        )}
      </Suspense>
    </Drawer>
  );
};

export default AgentDetailDrawer;
