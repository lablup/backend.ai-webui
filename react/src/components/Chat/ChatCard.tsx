import { useUpdatableState } from '../../hooks';
import { useSuspenseTanQuery } from '../../hooks/reactQueryAlias';
import { ChatContext, ChatType } from '../../pages/ChatProvider';
import ChatBody from './ChatBody';
import { ChatBodyRef } from './ChatBody';
import ChatHeader from './ChatHeader';
import { Model } from './ChatUIModal';
import { CustomModelForm, CustomModelAlert } from './CustomModelForm';
import { ChatCard_endpoint$key } from './__generated__/ChatCard_endpoint.graphql';
import { Card, CardProps, FormInstance, theme } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import _, { isEmpty } from 'lodash';
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useFragment } from 'react-relay';

export type BAIModel = {
  id: string;
  label?: string;
  name?: string;
  group?: string;
  created?: string;
  description?: string;
};

export type ChatCardParamsType = {
  basePath: string;
  modelId?: string;
  endpoint?: ChatCard_endpoint$key;
  agentId?: string;
};

interface ChatCardProps extends CardProps {
  chat: ChatType;
  conversationId: string;
  chatParams: ChatCardParamsType;
  closable?: boolean;
  onRequestClose?: () => void;
  onModelChange?: (modelId: string) => void;
}

function useChatCardStyles() {
  const { token } = theme.useToken();

  return {
    style: {
      height: '100%',
      width: '100%',
      display: 'flex',
      flexDirection: 'column' as const,
    },
    styles: {
      body: {
        backgroundColor: token.colorFillQuaternary,
        borderRadius: 0,
        flex: 1,
        display: 'flex',
        flexDirection: 'column' as const,
        padding: 0,
        height: '50%',
        position: 'relative' as React.CSSProperties['position'],
      },
      actions: {
        paddingLeft: token.paddingContentHorizontal,
        paddingRight: token.paddingContentHorizontal,
      },
      header: {
        zIndex: 1,
      },
    },
  };
}

const ChatCard: React.FC<ChatCardProps> = ({
  chat,
  conversationId,
  chatParams,
  closable,
  onRequestClose,
  onModelChange,
}) => {
  const { conversations, setConversations } = useContext(ChatContext);

  const [fetchKey, updateFetchKey] = useUpdatableState('first');
  const [endpointFrgmt, setEndpointFrgmt] =
    useState<ChatCard_endpoint$key | null>(chatParams.endpoint || null);
  const endpoint = useFragment(
    graphql`
      fragment ChatCard_endpoint on Endpoint {
        endpoint_id
        url
      }
    `,
    endpointFrgmt,
  );
  const [promisingEndpoint, setPromisingEndpoint] = useState(endpoint);

  const { data: modelsResult } = useSuspenseTanQuery<{
    data: Array<Model>;
  }>({
    queryKey: ['models', fetchKey, endpoint?.endpoint_id],
    queryFn: () => {
      return endpoint?.url
        ? fetch(
            new URL(
              chatParams.basePath + '/models',
              endpoint?.url ?? undefined,
            ).toString(),
          )
            .then((res) => res.json())
            .catch((e) => ({ data: [] }))
        : Promise.resolve({ data: [] });
    },
  });

  const models = _.map(modelsResult?.data, (m) => ({
    id: m.id,
    name: m.id,
  })) as BAIModel[];

  const modelId =
    chatParams.modelId &&
    _.includes(_.map(modelsResult?.data, 'id'), chatParams.modelId)
      ? chatParams.modelId
      : (modelsResult?.data?.[0]?.id ?? 'custom');

  const [agentId, setAgentId] = useState<string | undefined>();

  useEffect(() => {
    setAgentId(chatParams.agentId);
  }, [chatParams.agentId]);

  const customModelFormRef = useRef<FormInstance>(null);
  const chatBodyRef = useRef<ChatBodyRef>(null);

  const baseURL = endpoint?.url
    ? new URL(chatParams.basePath, endpoint?.url ?? undefined).toString()
    : undefined;

  const isEmptyModel = isEmpty(models);

  const { style, styles } = useChatCardStyles();

  const handleClickNewChat = useCallback(() => {
    const conversation = conversations.find((c) => c.key === conversationId);

    if (conversation) {
      // @FIXME: event propagation, bubbling, should be happend at the conversations
      conversation.chats.push({
        key: String(conversation.chats.length),
        sync: false,
        agentId: agentId,
        endpointId: baseURL,
        modelId: modelId,
      });

      setConversations([...conversations]);
    }
  }, [
    agentId,
    baseURL,
    conversationId,
    conversations,
    modelId,
    setConversations,
  ]);

  const handleClickChatSync = useCallback(
    (sync: boolean) => {
      const conversation = conversations.find((c) => c.key === conversationId);

      if (conversation) {
        const targetChat = conversation.chats.find((c) => c.key === chat.key);
        if (targetChat) {
          targetChat.sync = sync;
          setConversations([...conversations]);
        }
      }
    },
    [chat.key, conversationId, conversations, setConversations],
  );

  const handleClickClear = useCallback(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.clearChat();
    }
  }, []);

  return (
    <Card
      bordered
      style={style}
      styles={{ ...styles }}
      title={
        <ChatHeader
          chat={chat}
          setModelId={onModelChange}
          models={models}
          setEndpointFrgmt={setEndpointFrgmt}
          setPromisingEndpoint={setPromisingEndpoint}
          closable={closable}
          endpoint={endpoint}
          promisingEndpoint={promisingEndpoint}
          onClickNewChat={handleClickNewChat}
          onClickChatSync={handleClickChatSync}
          onClickClear={handleClickClear}
        />
      }
    >
      <CustomModelForm
        baseURL={baseURL}
        customModelFormRef={customModelFormRef}
        allowCustomModel={isEmptyModel}
        alert={
          isEmptyModel && <CustomModelAlert onClick={() => updateFetchKey()} />
        }
      />
      <ChatBody
        ref={chatBodyRef}
        chat={chat}
        baseURL={baseURL}
        agentId={agentId}
        modelId={modelId}
      />
    </Card>
  );
};

export default ChatCard;
