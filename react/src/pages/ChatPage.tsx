import BAICard from '../components/BAICard';
import { Conversation } from '../components/Chat/Conversation';
import EndpointLLMChatCard from '../components/Chat/EndpointLLMChatCard';
import Flex from '../components/Flex';
import { ChatContext, ChatProvider, ConversationType } from './ChatProvider';
import { ChatPageQuery } from './__generated__/ChatPageQuery.graphql';
import { PlusOutlined } from '@ant-design/icons';
import { useLocalStorageState } from 'ahooks';
import { useDynamicList } from 'ahooks';
import {
  Button,
  Card,
  Skeleton,
  Switch,
  Tabs,
  Typography,
  TabsProps,
  CardProps,
} from 'antd';
import { CardTabListType } from 'antd/lib/card';
import graphql from 'babel-plugin-relay/macro';
import { t } from 'i18next';
import _ from 'lodash';
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
    padding: '24px 24px',
  },
  body: {
    overflow: 'hidden',
  },
};

type TabsType = TabsProps['items'];
type TabType = NonNullable<TabsType>[number];

function useEndpoint(endpointId: string, isEmptyEndpointId: boolean) {
  const { endpoint, endpoint_list } = useLazyLoadQuery<ChatPageQuery>(
    graphql`
      query ChatPageQuery($endpointId: UUID!, $isEmptyEndpointId: Boolean!) {
        endpoint(endpoint_id: $endpointId)
          @skipOnClient(if: $isEmptyEndpointId)
          @catch {
          endpoint_id
          ...EndpointLLMChatCard_endpoint
        }
        endpoint_list(limit: 1, offset: 0) {
          items {
            endpoint_id
            ...EndpointLLMChatCard_endpoint
          }
        }
      }
    `,
    {
      endpointId: endpointId,
      isEmptyEndpointId: isEmptyEndpointId,
    },
  );

  return {
    endpoint:
      (endpoint.ok ? endpoint.value : endpoint_list?.items?.[0]) ?? undefined,
  };
}

type ChatPageProps = {};

const ChatInnerPage: React.FC<ChatPageProps> = ({ ...props }) => {
  const chatContext = useContext(ChatContext);

  if (!chatContext) {
    throw new Error('ChatInput must be used within a ChatProvider');
  }

  const { conversations, setConversations } = chatContext;

  const { t } = useTranslation();

  const [{ endpointId, modelId, agentId }] = useQueryParams({
    endpointId: StringParam,
    modelId: StringParam,
    agentId: StringParam,
  });

  // const { endpoint, endpoint_list, default_endpoint } = useEndpoint(
  //   endpointId ?? '',
  //   !endpointId,
  // );

  const [activeTabKey, setActiveTabKey] = useState<string>('1');

  const handleTabChange = (key: string) => {
    setActiveTabKey(key);
  };

  const handleTabEdit = useCallback(
    (_: any, action: 'add' | 'remove') => {
      if (action === 'add') {
        const key = String((conversations?.length ?? 0) + 1);
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
        {
          // @TODO pass activeTabKey to prevent whole screen rendering?
        }
        <Flex style={{ height: 'calc(100vh - 240px)' }}>
          <Conversation
            conversation={conversations[Number(activeTabKey) - 1]}
          />
        </Flex>
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
