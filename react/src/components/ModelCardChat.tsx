/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ModelCardChatQuery } from '../__generated__/ModelCardChatQuery.graphql';
import { useChatProviderData } from '../pages/ChatPage';
import ChatCard from './Chat/ChatCard';
import { useHistory } from './Chat/ChatHistory';
import _ from 'lodash';
import React from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';

interface ModelCardChatProps {
  modelName?: string;
  style?: React.CSSProperties;
}

const ModelCardChat: React.FC<ModelCardChatProps> = ({ modelName }) => {
  const { endpoint_list } = useLazyLoadQuery<ModelCardChatQuery>(
    graphql`
      query ModelCardChatQuery(
        $offset: Int!
        $limit: Int!
        $filter: String
        $projectID: UUID
      ) {
        endpoint_list(
          offset: $offset
          limit: $limit
          project: $projectID
          filter: $filter
        ) {
          items {
            name
            endpoint_id
            url
            model
            status
          }
        }
      }
    `,
    {
      limit: 100,
      offset: 0,
      filter: `name ilike "%${modelName}%"`,
    },
    {
      fetchPolicy: 'network-only',
    },
  );

  const healthyEndpoint = _.filter(endpoint_list?.items, (item) => {
    return (item?.status ?? '') === 'HEALTHY';
  });

  const provider = useChatProviderData(
    healthyEndpoint[0]?.endpoint_id as string,
  );
  const { chat } = useHistory('', provider);
  const defaultChat = _.first(chat?.chats) ?? null;

  // Add usingParameters key with value true to default chat
  const defaultChatWithParameters = defaultChat
    ? {
        ...defaultChat,
        usingParameters: true,
      }
    : null;

  // FIXME: temporally render chat UI only if at least one endpoint is healthy.
  return (
    healthyEndpoint.length > 0 &&
    defaultChatWithParameters && (
      <ChatCard chat={defaultChatWithParameters} fetchOnClient />
    )
  );
};

export default ModelCardChat;
