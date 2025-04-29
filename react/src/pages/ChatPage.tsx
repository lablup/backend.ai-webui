import BAICard from '../components/BAICard';
import ChatCacheProvider, {
  useConversations,
} from '../components/Chat/ChatCacheProvider';
import { ChatConversation } from '../components/Chat/ChatConversation';
import type { ChatProviderData } from '../components/Chat/ChatModel';
import { useSuspendedBackendaiClient } from '../hooks';
import { ChatPageQuery } from './__generated__/ChatPageQuery.graphql';
import { Card, Skeleton } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { useLazyLoadQuery } from 'react-relay';
import { StringParam, useQueryParams } from 'use-query-params';

type TabClickEvent =
  | string
  | React.MouseEvent<Element, MouseEvent>
  | React.KeyboardEvent<Element>;

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

function useChatProvider(defaultEndpointId?: string): ChatProviderData {
  const [{ endpointId, modelId, agentId, apiKey }] = useQueryParams({
    endpointId: StringParam,
    agentId: StringParam,
    modelId: StringParam,
    apiKey: StringParam,
  });

  return {
    basePath: 'v1', // Use OpenAPI 'v1' for OpenAI compatibility basePath,
    baseURL: '',
    endpointId: endpointId ?? defaultEndpointId ?? undefined,
    agentId: agentId ?? undefined,
    modelId: modelId ?? undefined,
    apiKey: apiKey ?? undefined,
  };
}

const PureChatPage: React.FC = () => {
  const defaultEndpointId = useDefaultEndpointId();
  const provider = useChatProvider(defaultEndpointId);
  const {
    conversations,
    activeConversation,
    setActiveConversation,
    addConversation,
    removeConversation,
    reset,
    isEmptyCache,
  } = useConversations();

  const tabList = conversations.map((conversation, index) => {
    return {
      key: conversation.id,
      label: conversation.label,
    };
  });

  const handleTabEdit = useCallback(
    (e: TabClickEvent, action: 'add' | 'remove') => {
      if (action === 'add') {
        addConversation(provider);
      } else if (action === 'remove') {
        if (conversations.length > 1) {
          removeConversation(e as string);
        }
      }
    },
    [addConversation, removeConversation, provider, conversations],
  );

  const handleTabChange = useCallback(
    (key: string) => {
      setActiveConversation(key);
    },
    [setActiveConversation],
  );

  useEffect(() => {
    // Check conversations cache once the component mounts first
    if (!isEmptyCache()) {
      reset();
    } else {
      addConversation(provider);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <BAICard
      styles={{
        header: {
          padding: 0,
        },
        body: { overflow: 'hidden' },
      }}
      tabList={tabList}
      tabProps={{
        size: 'large',
        type: 'editable-card',
        onEdit: handleTabEdit,
      }}
      activeTabKey={activeConversation}
      onTabChange={handleTabChange}
    >
      <Suspense
        fallback={
          <Card
            style={{
              overflow: 'auto',
              height: 'calc(100vh - 240px)',
            }}
            variant="outlined"
          >
            <Skeleton active />
          </Card>
        }
      >
        {activeConversation && (
          <ChatConversation
            conversationId={activeConversation}
            provider={provider}
          />
        )}
      </Suspense>
    </BAICard>
  );
};

const ChatPage: React.FC = () => {
  return (
    <ChatCacheProvider>
      <PureChatPage />
    </ChatCacheProvider>
  );
};

export default ChatPage;
