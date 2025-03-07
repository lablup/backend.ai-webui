import Flex from '../Flex';
import ChatCard from './ChatCard';
import { ChatProviderType, ChatType, ConversationType } from './ChatModel';
import { ConversationQuery } from './__generated__/ConversationQuery.graphql';
import { useDynamicList } from 'ahooks';
import { Card, Skeleton } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import { map } from 'lodash';
import { Suspense, useId } from 'react';
import { useLazyLoadQuery } from 'react-relay';

export type ConversationProps = {
  conversation: ConversationType;
  provider: ChatProviderType;
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

function useSelectedEndpoint(endpointId?: string) {
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
      isEmptyEndpointId: !endpointId,
    },
  );

  return (endpoint.ok ? endpoint.value : endpoint_list?.items?.[0]) ?? null;
}

function createNewChat(
  id: string,
  conversationId: string,
  provider: ChatProviderType,
) {
  return {
    id,
    conversationId,
    label: 'Chat',
    sync: false,
    provider,
  };
}

const ConversationStyle = {
  overflow: 'hidden',
};

export const Conversation: React.FC<ConversationProps> = ({
  conversation,
  provider,
}) => {
  const selectedEndpoint = useSelectedEndpoint(provider.endpointId);
  const chat = createNewChat(useId(), conversation.id, provider);
  const { list, remove, push } = useDynamicList<ChatType>([chat]);

  return (
    <Flex
      style={ConversationStyle}
      direction="column"
      align="stretch"
      gap={'xs'}
    >
      <Flex style={ChatViewStyle} gap={'xs'} direction="row" align="stretch">
        {map(list, (chat, index) => (
          <Suspense
            fallback={
              <Card style={ChatSkeletonStyle} bordered>
                <Skeleton active />
              </Card>
            }
            key={index}
          >
            <ChatCard
              style={ChatCardStyle}
              selectedEndpoint={selectedEndpoint}
              chat={chat}
              fetchOnClient
              onRequestClose={() => remove(index)}
              onCreateNewChat={() => {
                push(
                  createNewChat(
                    list.length.toString(),
                    conversation.id,
                    provider,
                  ),
                );
              }}
              closable={list.length > 1}
              key={index}
            />
          </Suspense>
        ))}
      </Flex>
    </Flex>
  );
};
