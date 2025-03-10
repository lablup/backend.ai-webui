import BAICard from '../components/BAICard';
import { Conversation } from '../components/Chat/Conversation';
import EndpointLLMChatCard from '../components/Chat/EndpointLLMChatCard';
import Flex from '../components/Flex';
import { ChatContext, ChatProvider, ConversationType } from './ChatProvider';
import { PlusOutlined } from '@ant-design/icons';
import { useLocalStorageState } from 'ahooks';
import { useDynamicList } from 'ahooks';
import { TabsProps } from 'antd';
import { t } from 'i18next';
import React, {
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useLazyLoadQuery } from 'react-relay';
import { StringParam, useQueryParam, useQueryParams } from 'use-query-params';

const PageStyle = {
  header: {
    padding: '24px 24px 0 24px',
  },
  body: {
    overflow: 'hidden',
    paddingTop: 0,
  },
};

type TabsType = TabsProps['items'];
type TabType = NonNullable<TabsType>[number];

type ChatPageProps = {};

const ChatInnerPage: React.FC<ChatPageProps> = ({ ...props }) => {
  const chatContext = useContext(ChatContext);

  if (!chatContext) {
    throw new Error('ChatInput must be used within a ChatProvider');
  }

  const { conversations, setConversations, setOption } = chatContext;

  const [{ endpointId, modelId, agentId }] = useQueryParams({
    endpointId: StringParam,
    agentId: StringParam,
    modelId: StringParam,
  });

  // @FIXME, setActiveTab with latest focused
  const [activeTabKey, setActiveTabKey] = useState<string>('0');

  const handleTabChange = (key: string) => {
    setActiveTabKey(key);
  };

  const handleTabEdit = useCallback(
    (_: any, action: 'add' | 'remove') => {
      if (action === 'add') {
        const key = String(conversations?.length ?? 0);
        setConversations([
          ...(conversations ?? []),
          {
            key: String(key),
            label: `Chat ${key}`,
            chats: [],
          },
        ]);
        setActiveTabKey(key);
      }
    },
    [conversations, setConversations],
  );

  const tabList = conversations?.map(
    (conversation: ConversationType, index: number) => {
      return {
        index,
        key: conversation.key,
        label: conversation.label,
      };
    },
  );

  useEffect(() => {
    setOption({
      agentId: agentId,
      endpointId: endpointId,
      modelId: modelId,
    });
  }, [agentId, endpointId, modelId, setOption]);

  return (
    <ChatProvider>
      <BAICard
        styles={PageStyle}
        tabList={tabList}
        tabProps={{
          size: 'large',
          type: 'editable-card',
          onEdit: handleTabEdit,
        }}
        activeTabKey={activeTabKey}
        onTabChange={handleTabChange}
      >
        <Conversation activeTabKey={activeTabKey} />
      </BAICard>
    </ChatProvider>
  );
};

const ChatPage: React.FC<ChatPageProps> = () => {
  return (
    <ChatProvider>
      <ChatInnerPage />
    </ChatProvider>
  );
};

export default ChatPage;
