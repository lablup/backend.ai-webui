import { useUpdatableState } from '../../hooks';
import { useSuspenseTanQuery } from '../../hooks/reactQueryAlias';
import { AIAgent, useAIAgent } from '../../hooks/useAIAgent';
import PureChatHeader from './ChatHeader';
import PureChatInput from './ChatInput';
import ChatMessages from './ChatMessages';
import {
  BAIModel,
  ChatLifecycleEventType,
  ChatProviderType,
  ChatType,
  Model,
} from './ChatModel';
import { CustomModelForm } from './CustomModelForm';
import { ChatCard_endpoint$key } from './__generated__/ChatCard_endpoint.graphql';
import { createOpenAI } from '@ai-sdk/openai';
import { useChat } from '@ai-sdk/react';
import { extractReasoningMiddleware, streamText, wrapLanguageModel } from 'ai';
import { Alert, App, Card, CardProps } from 'antd';
import { createStyles } from 'antd-style';
import graphql from 'babel-plugin-relay/macro';
import _ from 'lodash';
import React, {
  startTransition,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from 'react';
import { useFragment } from 'react-relay';

interface ChatCardProps extends CardProps, ChatLifecycleEventType {
  chat: ChatType;
  selectedEndpoint: ChatCard_endpoint$key | null;
  closable?: boolean;
  fetchOnClient?: boolean;
}

const useStyles = createStyles(({ token, css }) => ({
  chatCard: css`
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
  `,
  body: css`
    background-color: ${token.colorFillQuaternary};
    border-radius: 0;
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 0;
    height: 50%;
    position: relative;
  `,
  actions: css`
    padding-left: ${token.paddingContentHorizontal};
    padding-right: ${token.paddingContentHorizontal};
  `,
  header: css`
    zindex: 1;
  `,
  alert: css`
    margin: ${token.marginSM};
  `,
}));

function useEndpoint(selectedEndpoint?: ChatCard_endpoint$key | null) {
  const [endpointKey, setEndpoint] = useState<ChatCard_endpoint$key | null>(
    selectedEndpoint || null,
  );
  const endpoint = useFragment(
    graphql`
      fragment ChatCard_endpoint on Endpoint {
        endpoint_id
        url
      }
    `,
    endpointKey,
  );

  return { endpoint, setEndpoint } as const;
}

function createModelsURL(baseURL: string) {
  const { origin, port, pathname: path } = new URL(baseURL.trim());
  const host = port.length > 0 ? `${origin}:${port}` : origin;
  const normalizedPath = path === '/' ? '/models' : `${path}/models`;

  return new URL(normalizedPath, host).toString();
}

function useModels(
  provider: ChatProviderType,
  fetchKey: string,
  baseURL?: string,
  token?: string,
) {
  const { t } = useTranslation();
  const getModelsErrorMessage = (status?: number) => {
    switch (status) {
      case 401:
        return t('error.UnauthorizedToken');
      case 404:
        return t('error.NotFoundBasePath');
      case 500:
        return t('error.InternalServerError');
      case 503:
        return t('error.ServiceUnavailable');
      default:
        return t('error.UnknownError');
    }
  };

  const { data: modelsResult } = useSuspenseTanQuery<{
    data: Array<Model>;
  }>({
    queryKey: ['models', fetchKey, baseURL, token],
    queryFn: async () => {
      try {
        if (baseURL) {
          const url = createModelsURL(baseURL);
          const authToken = token || provider.apiKey;
          const res = await fetch(url, {
            headers: {
              Authorization: authToken ? `Bearer ${authToken}` : '',
            },
          });

      const url = createModelsURL(baseURL);
      const authToken = provider.apiKey;
      const res = await fetch(url, {
        headers: {
          Authorization: authToken ? `Bearer ${authToken}` : '',
        },
      });

      if (!res.ok) {
        return { data: [], error: res.status };
      }

      return await res.json();
    },
  });

  const models = _.map(modelsResult?.data || [], (m) => ({
    id: m.id,
    name: m.id,
  })) as BAIModel[];

  const selectedModelId = useMemo(
    () =>
      provider.modelId &&
      _.includes(_.map(modelsResult?.data || [], 'id'), provider.modelId)
        ? provider.modelId
        : (modelsResult?.data?.[0]?.id ?? 'custom'),
    [modelsResult?.data, provider.modelId],
  );

  const [modelId, setModelId] = useState<string>(selectedModelId);

  useEffect(() => {
    setModelId(selectedModelId);
  }, [selectedModelId]);

  return { models, modelId, setModelId } as const;
}

function useAgents(provider: ChatProviderType) {
  const { agents } = useAIAgent();
  const [agent, setAgent] = useState<AIAgent | undefined>(undefined);

  const selectedAgent = useMemo(() => {
    return agents.find((a) => a.id === provider.agentId);
  }, [agents, provider.agentId]);

  useEffect(() => {
    setAgent(selectedAgent);
  }, [selectedAgent]);

  return { agents, agent, setAgent } as const;
}

const ChatHeader = React.memo(PureChatHeader, (prev, next) => {
  if (prev.modelId !== next.modelId) return false;
  if (prev.endpoint !== next.endpoint) return false;
  if (prev.agent !== next.agent) return false;
  if (prev.fetchKey !== next.fetchKey) return false;
  if (prev.sync !== next.sync) return false;
  if (prev.closable !== next.closable) return false;
  return true;
});

const ChatInput = React.memo(PureChatInput);

function createBaseURL(basePath: string, endpointUrl?: string | null) {
  return endpointUrl ? new URL(basePath, endpointUrl).toString() : undefined;
}

const ChatCard: React.FC<ChatCardProps> = ({
  chat,
  selectedEndpoint,
  closable,
  fetchOnClient,
  onRequestClose,
  onCreateNewChat,
}) => {
  const {
    styles: { chatCard: chatCardStyle, alert: alertStyle, ...chatCardStyles },
  } = useStyles();
  const [isPendingUpdate, startUpdateTransition] = useTransition();

  const dropContainerRef = useRef<HTMLDivElement>(null);
  const [fetchKey, updateFetchKey] = useUpdatableState('first');
  const [startTime, setStartTime] = useState<number | null>(null);

  const { endpoint, setEndpoint } = useEndpoint(selectedEndpoint);
  const [baseURL, setBaseURL] = useState<string | undefined>(
    createBaseURL(chat.provider.basePath, endpoint?.url),
  );
  const [token, setToken] = useState<string | undefined>();
  const { models, modelId, setModelId } = useModels(
    chat.provider,
    fetchKey,
    baseURL,
    token,
  );
  const { agents, agent, setAgent } = useAgents(chat.provider);
  const [sync, setSync] = useState(chat.sync);

  const {
    error,
    messages,
    input,
    setInput,
    stop,
    status,
    append,
    setMessages,
  } = useChat({
    id: `${chat.id}-${endpoint?.endpoint_id}-${agent?.id ?? 'none'}-${modelId}`,
    api: baseURL,
    credentials: chat.provider.credentials,
    body: {
      modelId: modelId,
    },
    experimental_throttle: 50,
    fetch: async (input, init) => {
      if (fetchOnClient || modelId === 'custom') {
        const body = JSON.parse(init?.body as string);
        const provider = createOpenAI({
          baseURL: baseURL,
          apiKey: token || chat.provider.apiKey || 'dummy',
        });
        const result = streamText({
          abortSignal: init?.signal || undefined,
          model: wrapLanguageModel({
            model: provider(modelId),
            middleware: extractReasoningMiddleware({ tagName: 'think' }),
          }),
          messages: body?.messages,
          system: agent ? (agent.config.system_prompt ?? '') : '',
        });

        setStartTime(Date.now());

        return result.toDataStreamResponse({
          sendReasoning: true,
        });
      }

      return fetch(input, init);
    },
  });

  useEffect(() => {
    startTransition(() => {
      setBaseURL(createBaseURL(chat.provider.basePath, endpoint?.url));
      setToken(undefined);
      updateFetchKey('first');
    });
  }, [endpoint?.url, chat.provider.basePath, updateFetchKey]);

  const isStreaming = status === 'streaming' || status === 'submitted';

  return (
    <Card
      variant="outlined"
      className={chatCardStyle}
      classNames={chatCardStyles}
      title={
        <ChatHeader
          chat={chat}
          models={models}
          modelId={modelId}
          setModelId={setModelId}
          endpoint={endpoint}
          setEndpoint={setEndpoint}
          agents={agents}
          agent={agent}
          setAgent={setAgent}
          sync={sync}
          setSync={setSync}
          fetchKey={fetchKey}
          closable={closable}
          onCreateNewChat={onCreateNewChat}
          onRequestClose={onRequestClose}
          setMessages={setMessages}
        />
      }
      ref={dropContainerRef}
    >
      {_.isEmpty(models) && (
        <CustomModelForm
          baseURL={baseURL}
          token={token}
          endpointId={endpoint?.endpoint_id}
          loading={isPendingUpdate}
          onSubmit={(data) => {
            startUpdateTransition(() => {
              updateFetchKey();
              setBaseURL(data.baseURL);
              setToken(data.token);
            });
          }}
        />
      )}
      {!_.isEmpty(error?.message) ? (
        <Alert
          message={error?.message}
          type="error"
          showIcon
          className={alertStyle}
          closable
        />
      ) : null}
      <ChatMessages
        messages={messages}
        input={input}
        isStreaming={isStreaming}
        startTime={startTime}
      />
      <ChatInput
        sync={sync}
        input={input}
        setInput={setInput}
        stop={stop}
        append={append}
        isStreaming={isStreaming}
        dropContainerRef={dropContainerRef}
      />
    </Card>
  );
};

export default ChatCard;
