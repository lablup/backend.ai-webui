import AgentDetailDrawerContent from './AgentDetailDrawerContent';
import { Drawer, DrawerProps, Skeleton } from 'antd';
import { BAIFetchKeyButton } from 'backend.ai-ui';
import { Suspense, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useRefetchableFragment } from 'react-relay';
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
  const [isPendingRefetch, startRefetchTransition] = useTransition();

  const [agent, refetch] = useRefetchableFragment(
    graphql`
      fragment AgentDetailDrawerFragment on Node
      @refetchable(queryName: "AgentDetailDrawerRefetchQuery") {
        ... on AgentNode {
          row_id
          ...AgentDetailDrawerContentFragment @alias(as: "agentNodeFragment")
        }
      }
    `,
    agentNodeFragment,
  );

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
