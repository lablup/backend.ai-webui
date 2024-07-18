import { useTanQuery } from '../../hooks/reactQueryAlias';
import BAIModal from '../BAIModal';
import Flex from '../Flex';
import LLMChatCard from './LLMChatCard';
import { GetProp, Modal, ModalProps, Skeleton } from 'antd';
import _ from 'lodash';
import { min } from 'lodash';
import React from 'react';

interface ChatUIBasicProps {
  endpoint?: string;
  basePath?: string;
  // models?: GetProp<typeof LLMChatCard, 'models'>;
}
interface ChatUIModalProps extends ModalProps, ChatUIBasicProps {}

const ChatUIModal: React.FC<ChatUIModalProps> = ({
  basePath,
  endpoint,
  // models,
  ...props
}) => {
  return (
    <Modal
      {...props}
      styles={{
        body: {
          height: 500,
          display: 'flex',
        },
        content: {
          padding: 0,
        },
      }}
      footer={null}
      centered
    >
      <Flex direction="column" align="stretch" style={{ flex: 1 }}>
        <EndpointChatContent basePath={basePath} endpoint={endpoint} />
      </Flex>
    </Modal>
  );
};

const EndpointChatContent: React.FC<ChatUIBasicProps> = ({
  basePath = 'v1',
  endpoint,
}) => {
  const {
    data: ModelsResult,
    error,
    isFetching,
  } = useTanQuery<{
    data: Array<Model>;
  }>({
    queryKey: ['models', endpoint],
    queryFn: () => {
      return fetch(new URL(basePath + '/models', endpoint).toString()).then(
        (res) => res.json(),
      );
    },
    suspense: false,
  });

  return isFetching ? (
    <Skeleton active />
  ) : (
    <LLMChatCard
      baseURL={new URL(basePath, endpoint).toString()}
      models={_.map(ModelsResult?.data, (m) => ({
        id: m.id,
        name: m.id,
      }))}
      fetchOnClient
      style={{ flex: 1 }}
    />
  );
};

export default ChatUIModal;

interface ModelPermission {
  id: string;
  object: string;
  created: number;
  allow_create_engine: boolean;
  allow_sampling: boolean;
  allow_logprobs: boolean;
  allow_search_indices: boolean;
  allow_view: boolean;
  allow_fine_tuning: boolean;
  organization: string;
  group: string | null;
  is_blocking: boolean;
}

interface Model {
  id: string;
  object: string;
  created: number;
  owned_by: string;
  root: string;
  parent: string | null;
  max_model_len: number;
  permission: ModelPermission[];
}
