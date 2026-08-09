/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { AgentDetailDrawerFragment$key } from '../__generated__/AgentDetailDrawerFragment.graphql';
import AgentDetailDrawerContent from './AgentDetailDrawerContent';
import AutoUpdateFetchKeyButton from './AutoUpdateFetchKeyButton';
import BAIDrawer from './astryx-bui/BAIDrawerAstryx';
import BAISkeletonAstryx from './astryx-bui/BAISkeletonAstryx';
import { toLocalId, useBAILogger } from 'backend.ai-ui';
import { Suspense, useEffect, useEffectEvent, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useMutation, useRefetchableFragment } from 'react-relay';

// PILOT-DECISION: props no longer extend antd `DrawerProps` (P1 grep — the
// only consumer, AgentList, passes `agentNodeFrgmt`/`open`/`onRequestClose`).
// antd `Drawer` → `BAIDrawerAstryx` (qa2-c), which wraps lab `Drawer` and
// restores antd's header arrangement (`[X] title …… [extra]`, divider, padded
// scrollable body) so `title`/`extra` are props again instead of a hand-rolled
// first content row that collided with lab's floating close button.
interface AgentDetailDrawerProps {
  open?: boolean;
  onRequestClose?: () => void;
  agentNodeFrgmt?: AgentDetailDrawerFragment$key | null;
}

const AgentDetailDrawer: React.FC<AgentDetailDrawerProps> = ({
  open = false,
  onRequestClose,
  agentNodeFrgmt,
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
          ...AgentDetailDrawerContentFragment @alias(as: "agentNodeFrgmt")
        }
      }
    `,
    agentNodeFrgmt,
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
        agentNodeFrgmt &&
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
    <BAIDrawer
      open={open}
      onClose={onRequestClose}
      side="end"
      size={800}
      title={t('agent.AgentInfo')}
      extra={
        <AutoUpdateFetchKeyButton
          settingId="agent-detail"
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
      <Suspense fallback={<BAISkeletonAstryx />}>
        {agent?.agentNodeFrgmt && (
          <AgentDetailDrawerContent agentNodeFrgmt={agent?.agentNodeFrgmt} />
        )}
      </Suspense>
    </BAIDrawer>
  );
};

export default AgentDetailDrawer;
