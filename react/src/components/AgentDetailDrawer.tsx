/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { AgentDetailDrawerFragment$key } from '../__generated__/AgentDetailDrawerFragment.graphql';
import AgentDetailDrawerContent from './AgentDetailDrawerContent';
import AutoUpdateFetchKeyButton from './AutoUpdateFetchKeyButton';
import BAISkeletonAstryx from './astryx-bui/BAISkeletonAstryx';
import { Heading } from '@astryxdesign/core/Heading';
import { HStack, VStack } from '@astryxdesign/core/Stack';
import { Drawer } from '@astryxdesign/lab';
import { toLocalId, useBAILogger } from 'backend.ai-ui';
import { Suspense, useEffect, useEffectEvent, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useMutation, useRefetchableFragment } from 'react-relay';

// PILOT-DECISION: props no longer extend antd `DrawerProps` (P1 grep — the
// only consumer, AgentList, passes `agentNodeFrgmt`/`open`/`onRequestClose`).
// antd `Drawer` → lab `Drawer` (MAPPING §2 LAB), same shape as the
// DeploymentRevisionDetailDrawer precedent (ticket 18): `open`→`isOpen`,
// antd `size={800}` → lab `size={800}` (both px), heading/extra rendered as
// the first content row since lab Drawer has no title bar.
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
    <Drawer
      isOpen={open}
      onClose={() => onRequestClose?.()}
      side="end"
      size={800}
      label={t('agent.AgentInfo')}
    >
      {/* lab Drawer renders flush to the panel edges; reproduce the antd
          Drawer's 24px body padding with the spacing-6 token (ticket 18
          precedent). */}
      <VStack gap={4} align="stretch" style={{ padding: 'var(--spacing-6)' }}>
        <HStack gap={2} align="center" justify="between">
          <Heading level={5}>{t('agent.AgentInfo')}</Heading>
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
        </HStack>
        <Suspense fallback={<BAISkeletonAstryx />}>
          {agent?.agentNodeFrgmt && (
            <AgentDetailDrawerContent agentNodeFrgmt={agent?.agentNodeFrgmt} />
          )}
        </Suspense>
      </VStack>
    </Drawer>
  );
};

export default AgentDetailDrawer;
