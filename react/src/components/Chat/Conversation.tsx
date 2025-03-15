import { ChatContext, ConversationType } from '../../pages/ChatProvider';
import BAICard from '../BAICard';
import Flex from '../Flex';
import ChatCard from './ChatCard';
import { ConversationQuery } from './__generated__/ConversationQuery.graphql';
import { Card, Skeleton } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import { Suspense, useContext, useEffect } from 'react';
import { useLazyLoadQuery } from 'react-relay';

export type ConversationProps = {
  conversation: ConversationType;
  conversationId: string;
  endpointId?: string | null;
  modelId?: string | null;
  agentId?: string | null;
};

const ConversationViewStyle = {
  body: {
    overflow: 'hidden',
  },
};

const ChatViewStyle = {
  overflow: 'auto',
  height: 'calc(100vh - 240px)',
};

const ChatSkeletonStyle = {
  width: '100%',
  display: 'flex',
  flexDirection: 'column' as const,
};

const ChatCardStyle = { flex: 1, overflow: 'hidden' };

function useEndpoint(
  endpointId: string | null | undefined,
  isEmptyEndpointId: boolean,
) {
  const { endpoint, endpoint_list } = useLazyLoadQuery<ConversationQuery>(
    graphql`
      query ConversationQuery(
        $endpointId: UUID!
        $isEmptyEndpointId: Boolean!
      ) {
        endpoint(endpoint_id: $endpointId)
          @skipOnClient(if: $isEmptyEndpointId)
          @catch {
          endpoint_id
          ...ChatCard_endpoint
        }
        endpoint_list(limit: 1, offset: 0) {
          items {
            endpoint_id
            ...ChatCard_endpoint
          }
        }
      }
    `,
    {
      endpointId: endpointId || '',
      isEmptyEndpointId: isEmptyEndpointId,
    },
  );

  return {
    endpoint:
      (endpoint.ok ? endpoint.value : endpoint_list?.items?.[0]) ?? undefined,
  };
}

export const Conversation: React.FC<ConversationProps> = ({
  // @FIXME cleanup props
  conversation,
  conversationId,
  endpointId,
  modelId,
  agentId,
}) => {
  const { conversations, setConversations } = useContext(ChatContext);

  const { endpoint } = useEndpoint(endpointId, !endpointId);

  const getChatParams = (index: number) => {
    return {
      basePath: 'v1',
      modelId: (index === 0 && endpoint ? modelId : undefined) ?? undefined,
      endpoint: index === 0 && endpoint ? endpoint : undefined,
      agentId: agentId ?? undefined,
    };
  };

  useEffect(() => {
    if (conversation?.chats.length === 0) {
      conversation?.chats.push({
        key: String(conversation?.chats.length),
        sync: false,
        agentId: agentId,
        endpointId: endpointId,
        modelId: modelId,
      });
      setConversations([...conversations]);
    }
  }, [
    agentId,
    conversation,
    conversations,
    endpointId,
    modelId,
    setConversations,
  ]);

  return (
    <BAICard styles={ConversationViewStyle}>
      <Flex direction="column" align="stretch" gap={'xs'}>
        <Flex gap={'xs'} direction="row" style={ChatViewStyle} align="stretch">
          {// @FIXME mode to chat context to manage chats in conversioans
          // @FIXME prevent rerendering
          conversation?.chats.map((chat, index) => (
            <Suspense
              fallback={
                <Card bordered style={ChatSkeletonStyle}>
                  <Skeleton active />
                </Card>
              }
              key={index}
            >
              <ChatCard
                // @FIXME: cleanup props
                // @FIXME: defaults from endpoint or stored data
                chat={chat}
                conversationId={conversationId}
                chatParams={getChatParams(index)}
                style={ChatCardStyle}
                onRequestClose={() => {}}
                closable={
                  conversation?.chats ? conversation.chats.length > 1 : false
                }
                key={index}
              />
            </Suspense>
          ))}
        </Flex>
      </Flex>
    </BAICard>
  );
};
