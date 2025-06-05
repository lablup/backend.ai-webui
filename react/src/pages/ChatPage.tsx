import { ChatPageQuery } from '../__generated__/ChatPageQuery.graphql';
import BAICard from '../components/BAICard';
import {
  ChatProviderType,
  ConversationType,
} from '../components/Chat/ChatModel';
import { Conversation } from '../components/Chat/Conversation';
import { useSuspendedBackendaiClient } from '../hooks';
import graphql from 'babel-plugin-relay/macro';
import { t } from 'i18next';
import React, { useId } from 'react';
import { useLazyLoadQuery } from 'react-relay';
import { StringParam, useQueryParams } from 'use-query-params';

const ChatPageStyle = {
  body: {
    overflow: 'hidden',
  },
};

type ChatPageProps = {};

function useDefaultEndpointId() {
  const baiClient = useSuspendedBackendaiClient();
  const { endpoint_list } = useLazyLoadQuery<ChatPageQuery>(
    graphql`
      query ChatPageQuery($filter: String) {
        endpoint_list(limit: 1, offset: 0, filter: $filter) {
          items {
            endpoint_id
          }
        }
      }
    `,
    {
      filter: baiClient.supports('endpoint-lifecycle-stage-filter')
        ? 'lifecycle_stage == "created"'
        : undefined,
    },
  );

  return endpoint_list?.items[0]?.endpoint_id || undefined;
}

const ChatPage: React.FC<ChatPageProps> = () => {
  const [{ endpointId, modelId, agentId }] = useQueryParams({
    endpointId: StringParam,
    agentId: StringParam,
    modelId: StringParam,
  });

  const defaultEndpointId = useDefaultEndpointId();

  const conversation: ConversationType = {
    id: useId(),
    label: t('webui.menu.Chat'),
    chats: [],
  };

  const provider: ChatProviderType = {
    basePath: 'v1',
    agentId: agentId ?? undefined,
    endpointId: endpointId ?? defaultEndpointId ?? undefined,
    modelId: modelId ?? undefined,
  };

  return (
    <BAICard title={t('webui.menu.Chat')} styles={ChatPageStyle}>
      <Conversation conversation={conversation} provider={provider} />
    </BAICard>
  );
};

export default ChatPage;
