import { useUpdatableState } from '../../hooks';
import { useSuspenseTanQuery } from '../../hooks/reactQueryAlias';
import { ChatContext, ChatType } from '../../pages/ChatProvider';
import ChatBody from './ChatBody';
import ChatHeader from './ChatHeader';
import { Model } from './ChatUIModal';
import { CustomModelForm, CustomModelAlert } from './CustomModelForm';
import { ChatCard_endpoint$key } from './__generated__/ChatCard_endpoint.graphql';
import { AttachmentsProps } from '@ant-design/x';
import { Card, CardProps, FormInstance, theme } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import { atom, useAtom } from 'jotai';
import _, { isEmpty } from 'lodash';
import React, {
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { useFragment } from 'react-relay';

// @FIXME: how to share messages
const synchronizedMessageState = atom<string>('');
const synchronizedAttachmentState = atom<AttachmentsProps['items']>();
const chatSubmitKeyInfoState = atom<{ id: string; key: string } | undefined>(
  undefined,
);

function useSynconizedMessage() {
  const [synchronizedMessage, setSynchronizedMessage] = useAtom(
    synchronizedMessageState,
  );
  const [synchronizedAttachment, setSynchronizedAttachment] = useAtom(
    synchronizedAttachmentState,
  );

  const [chatSubmitKeyInfo, setChatSubmitKeyInfo] = useAtom(
    chatSubmitKeyInfoState,
  );

  const submitId = useId();

  return {
    synchronizedMessage,
    setSynchronizedMessage,
    synchronizedAttachment,
    setSynchronizedAttachment,
    chatSubmitKeyInfo,
    setChatSubmitKeyInfo,
    submitId,
  };
}

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
  ...cardProps
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

  // const submitId = useId();

  useEffect(() => {
    setAgentId(chatParams.agentId);
  }, [chatParams.agentId]);

  const customModelFormRef = useRef<FormInstance>(null);

  const baseURL = endpoint?.url
    ? new URL(chatParams.basePath, endpoint?.url ?? undefined).toString()
    : undefined;

  const isEmptyModel = isEmpty(models);

  const { style, styles } = useChatCardStyles();

  const handleClickNewChat = useCallback(() => {
    const conversation = conversations.find((c) => c.key === conversationId);

    if (conversation) {
      conversation.chats.push({
        sync: false,
        agentId: agentId,
        endpointId: baseURL,
        modelId: modelId,
      });

      setConversations([...conversations]);
    }
  }, []);
  return (
    <Card
      bordered
      style={style}
      styles={{ ...styles }}
      title={
        <ChatHeader
          setModelId={onModelChange}
          models={models}
          setEndpointFrgmt={setEndpointFrgmt}
          setPromisingEndpoint={setPromisingEndpoint}
          closable={closable}
          endpoint={endpoint}
          promisingEndpoint={promisingEndpoint}
          onClickNewChat={handleClickNewChat}
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
      <ChatBody baseURL={baseURL} agentId={agentId} modelId={modelId} />
    </Card>
  );
};

export default ChatCard;
