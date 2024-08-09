import { useTanQuery } from '../../hooks/reactQueryAlias';
import Flex from '../Flex';
import LLMChatCard from './LLMChatCard';
import { Alert, Modal, ModalProps, Skeleton, theme } from 'antd';
import _ from 'lodash';
import React from 'react';
import { useTranslation } from 'react-i18next';

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
  const { token } = theme.useToken();
  return (
    <Modal
      {...props}
      styles={{
        body: {
          height: '80vh',
          display: 'flex',
        },
        content: {
          padding: 0,
        },
      }}
      footer={null}
      centered
      width={'80%'}
      style={{ maxWidth: token.screenLGMax }}
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
  const { t } = useTranslation();
  const {
    data: modelsResult,
    // error,
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
  });

  return isFetching ? (
    <Skeleton active />
  ) : (
    <LLMChatCard
      baseURL={new URL(basePath, endpoint).toString()}
      models={_.map(modelsResult?.data, (m) => ({
        id: m.id,
        name: m.id,
      }))}
      fetchOnClient
      style={{ flex: 1 }}
      allowCustomModel={_.isEmpty(modelsResult?.data)}
      alert={
        _.isEmpty(modelsResult?.data) && (
          <Alert
            type="warning"
            showIcon
            message={t('chatui.CannotFindModel')}
          />
        )
      }
      modelId={modelsResult?.data?.[0].id ?? 'custom'}
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

export interface Model {
  id: string;
  object: string;
  created: number;
  owned_by: string;
  root: string;
  parent: string | null;
  max_model_len: number;
  permission: ModelPermission[];
}
