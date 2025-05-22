import BAICard from '../components/BAICard';
import { ChatConversation } from '../components/Chat/ChatConversation';
import ChatHistoryProvider, {
  generateUUID,
} from '../components/Chat/ChatHistoryProvider';
import type { ChatProviderData } from '../components/Chat/ChatModel';
import { useSuspendedBackendaiClient } from '../hooks';
import { ChatPageQuery } from './__generated__/ChatPageQuery.graphql';
import { Card, Skeleton } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import { t } from 'i18next';
import { Suspense, useEffect, useState } from 'react';
import { useLazyLoadQuery } from 'react-relay';
import { useParams } from 'react-router-dom';
import { StringParam, useQueryParams } from 'use-query-params';

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

  const { conversationId } = useParams();
  const [id, setId] = useState(conversationId);

  // @FIXME move to provider
  useEffect(() => {
    if (!conversationId) {
      const id = generateUUID();
      setId(id);
      // @FIXME: back, forward doesn't work
      window.history.replaceState({}, '', `/chat/${id}`);
    }
  }, [conversationId]);

  return (
    <BAICard
      title={t('webui.menu.Chat')}
      styles={{
        body: { overflow: 'hidden', paddingTop: 0 },
      }}
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
        {id && <ChatConversation id={id} provider={provider} />}
      </Suspense>
    </BAICard>
  );
};

const ChatPage: React.FC = () => {
  return (
    <ChatHistoryProvider>
      <PureChatPage />
    </ChatHistoryProvider>
  );
};

export default ChatPage;
