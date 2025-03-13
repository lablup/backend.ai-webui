import BAICard from '../components/BAICard';
import { Conversation } from '../components/Chat/Conversation';
import { ChatContext, ChatProvider, ConversationType } from './ChatProvider';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { StringParam, useQueryParams } from 'use-query-params';

const ChatPageStyle = {
  header: {
    padding: '24px 24px 0 24px',
  },
  body: {
    overflow: 'hidden',
    paddingTop: 0,
  },
};

type ChatPageProps = {};

const ChatInnerPage: React.FC<ChatPageProps> = ({ ...props }) => {
  const { conversations, setConversations } = useContext(ChatContext);

  const [{ endpointId, modelId, agentId }] = useQueryParams({
    endpointId: StringParam,
    agentId: StringParam,
    modelId: StringParam,
  });

  const [activeTabKey, setActiveTabKey] = useState<string>('0');

  const handleTabChange = (key: string) => {
    setActiveTabKey(key);
  };

  const handleTabEdit = useCallback(
    (_: any, action: 'add' | 'remove') => {
      if (action === 'add') {
        const key = String(conversations.length);
        conversations.push({
          key,
          label: `Chat ${key}`,
          chats: [],
        });
        setConversations([...conversations]);
        setActiveTabKey(key);
      }
    },
    [conversations, setConversations],
  );

  useEffect(() => {
    // @FIXME: stop creating if enpointId matched with last conversation
    if (endpointId || conversations.length === 0) {
      const key = String(conversations.length);
      conversations.push({
        key,
        label: `Chat ${key}`,
        chats: [],
      });

      setConversations([...conversations]);
      setActiveTabKey(key);
    }
  }, [conversations, endpointId, setConversations]);

  const tabList = conversations.map((conversation: ConversationType) => {
    return {
      key: conversation.key,
      label: conversation.label,
    };
  });

  return (
    <BAICard
      styles={ChatPageStyle}
      tabList={tabList}
      tabProps={{
        size: 'large',
        type: 'editable-card',
        onEdit: handleTabEdit,
      }}
      activeTabKey={activeTabKey}
      onTabChange={handleTabChange}
    >
      <Conversation
        conversation={conversations[Number(activeTabKey)]}
        conversationId={activeTabKey}
        endpointId={endpointId}
        modelId={modelId}
        agentId={agentId}
      />
    </BAICard>
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
