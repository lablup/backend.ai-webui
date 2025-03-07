import BAICard from '../components/BAICard';
import {
  ChatProviderType,
  ConversationType,
} from '../components/Chat/ChatModel';
import { Conversation } from '../components/Chat/Conversation';
import { t } from 'i18next';
import React, { useId } from 'react';
import { StringParam, useQueryParams } from 'use-query-params';

const ChatPageStyle = {
  body: {
    overflow: 'hidden',
  },
};

type ChatPageProps = {};

const ChatPage: React.FC<ChatPageProps> = () => {
  const [{ endpointId, modelId, agentId }] = useQueryParams({
    endpointId: StringParam,
    agentId: StringParam,
    modelId: StringParam,
  });

  const conversation: ConversationType = {
    id: useId(),
    label: t('webui.menu.Chat'),
    chats: [],
  };

  const provider: ChatProviderType = {
    basePath: 'v1',
    agentId: agentId ?? undefined,
    endpointId: endpointId ?? undefined,
    modelId: modelId ?? undefined,
  };

  return (
    <BAICard title={t('webui.menu.Chat')} styles={ChatPageStyle}>
      <Conversation conversation={conversation} provider={provider} />
    </BAICard>
  );
};

export default ChatPage;
