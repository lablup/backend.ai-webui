import { useUpdatableState } from '../../hooks';
import { useSuspenseTanQuery } from '../../hooks/reactQueryAlias';
import { useAIAgent } from '../../hooks/useAIAgent';
import PureChatHeader from './ChatHeader';
import PureChatInput from './ChatInput';
import ChatMessages from './ChatMessages';
import {
  ChatLifecycleEventType,
  ChatProviderData,
  ChatData,
  ChatModel,
  getLatestUserMessage,
  ChatMessage,
} from './ChatModel';
import { CustomModelForm } from './CustomModelForm';
import { ChatCardQuery } from './__generated__/ChatCardQuery.graphql';
import { createOpenAI } from '@ai-sdk/openai';
import { useChat } from '@ai-sdk/react';
import {
  extractReasoningMiddleware,
  streamText,
  UIMessage,
  wrapLanguageModel,
} from 'ai';
import { Alert, App, Card, CardProps } from 'antd';
import { createStyles } from 'antd-style';
import graphql from 'babel-plugin-relay/macro';
import _ from 'lodash';
import React, {
  memo,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useLazyLoadQuery } from 'react-relay';

interface ChatCardProps extends CardProps, ChatLifecycleEventType {
  chat: ChatData;
  onUpdateChat?: (partialChat: DeepPartial<ChatData>) => void;
  onSaveMessage?: (message: ChatMessage) => void;
  onClickClearChatMessages?: (chat: ChatData) => void;
  closable?: boolean;
  clonable?: boolean;
  fetchOnClient?: boolean;
  defaultEndpointId?: string;
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

function createModelsURL(baseURL: string) {
  const { origin, port, pathname: path } = new URL(baseURL.trim());
  const host = port.length > 0 ? `${origin}:${port}` : origin;
  const normalizedPath = path === '/' ? '/models' : `${path}/models`;

  return new URL(normalizedPath, host).toString();
}

function useModels(
  provider: ChatProviderData,
  fetchKey: string,
  baseURL?: string,
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
    data: Array<ChatModel>;
    error?: number;
  }>({
    queryKey: ['models', fetchKey, baseURL, provider.apiKey],
    queryFn: async () => {
      if (!baseURL) {
        return { data: [] };
      }

      const url = createModelsURL(baseURL);
      const authToken = provider.apiKey;
      const res = await fetch(url, {
        headers: {
          Authorization: authToken ? `Bearer ${authToken}` : '',
        },
      }).catch((e) => {
        return {
          ok: false,
          status: -1,
        } as const;
      });

      if (res.ok) {
        return await res.json();
      }

      return { data: [], error: res?.status };
    },
    select: (res) => ({
      data: res
        ? res.data.map((model) => ({
            id: model.id,
            name: model.id,
          }))
        : [],
    }),
  });

  const modelId = useMemo(
    () =>
      provider.modelId &&
      _.includes(_.map(modelsResult?.data || [], 'id'), provider.modelId)
        ? provider.modelId
        : (modelsResult?.data?.[0]?.id ?? 'custom'),
    [modelsResult?.data, provider.modelId],
  );

  const modelsError =
    modelsResult.error && getModelsErrorMessage(modelsResult.error);

  return {
    models: modelsResult?.data,
    modelId,
    modelsError,
  } as const;
}

const ChatHeader = PureChatHeader;

const ChatInput = React.memo(PureChatInput);

function createBaseURL(basePath?: string, endpointUrl?: string | null) {
  return endpointUrl
    ? new URL(basePath ?? '', endpointUrl).toString()
    : undefined;
}

const PureChatCard: React.FC<ChatCardProps> = ({
  chat,
  onUpdateChat,
  closable,
  clonable,
  fetchOnClient,
  onRequestClose,
  onCreateNewChat,
  onSaveMessage,
  onClickClearChatMessages,
}) => {
  const { t } = useTranslation();
  const { message: appMessage } = App.useApp();
  const endpointResult = useLazyLoadQuery<ChatCardQuery>(
    graphql`
      query ChatCardQuery($endpointId: UUID!) {
        endpoint(endpoint_id: $endpointId) @catch {
          endpoint_id
          url
          ...ChatHeader_Endpoint
        }
      }
    `,
    {
      endpointId: chat.provider.endpointId || '',
    },
    {
      fetchPolicy: chat.provider.endpointId ? 'store-or-network' : 'store-only',
    },
  );
  const endpoint = endpointResult.endpoint.ok
    ? endpointResult.endpoint.value
    : null;
  const {
    styles: { chatCard: chatCardStyle, alert: alertStyle, ...chatCardStyles },
  } = useStyles();
  const [isPendingUpdate, startUpdateTransition] = useTransition();

  const dropContainerRef = useRef<HTMLDivElement>(null);
  const [fetchKey, updateFetchKey] = useUpdatableState('first');
  const [startTime, setStartTime] = useState<number | null>(null);

  const baseURL = createBaseURL(chat.provider.basePath, endpoint?.url);
  const { models, modelId, modelsError } = useModels(
    chat.provider,
    fetchKey,
    baseURL,
  );
  const { agents } = useAIAgent();
  const agent = agents.find((a) => a.id === chat.provider.agentId);

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
    id: chat.id,
    api: baseURL,
    body: {
      modelId: modelId,
    },
    initialMessages: chat.messages,
    experimental_throttle: 50,
    fetch: async (input, init) => {
      if (fetchOnClient || modelId === 'custom') {
        const body = JSON.parse(init?.body as string);
        const provider = createOpenAI({
          baseURL: baseURL,
          apiKey: chat.provider.apiKey || 'dummy',
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

        const userMessage = getLatestUserMessage(body.messages);
        if (userMessage) {
          onSaveMessage?.(userMessage);
        }

        setStartTime(Date.now());

        return result.toDataStreamResponse({
          sendReasoning: true,
        });
      }

      return fetch(input, init);
    },
    onFinish: (assistantMessage, { finishReason }) => {
      if (finishReason === 'stop') {
        onSaveMessage?.(assistantMessage as UIMessage);
      }
    },
  });

  const isStreaming = status === 'streaming' || status === 'submitted';

  useEffect(() => {
    // prevent to show the error message as failed fetching in the first time
    if (modelsError && fetchKey !== 'first') {
      appMessage.error(`Error fetching models: ${modelsError}`, 5);
    }
  }, [modelsError, fetchKey, appMessage]);

  useEffect(() => {
    if (chat.messages.length > 0) {
      setMessages(chat.messages);
    }
  }, [setMessages, chat.messages]);

  return (
    <Card
      variant="outlined"
      className={chatCardStyle}
      classNames={chatCardStyles}
      title={
        <ChatHeader
          // model
          models={models}
          modelId={modelId}
          onChangeModel={(modelId) => {
            onUpdateChat?.({
              provider: {
                modelId,
              },
            });
          }}
          // agent
          agents={agents}
          agent={agent}
          onChangeAgent={(agent) => {
            onUpdateChat?.({
              provider: {
                agentId: agent.id,
                endpointId: agent.endpoint_id,
              },
            });
          }}
          // endpoint
          endpointFrgmt={endpoint}
          onChangeEndpoint={(endpointId) => {
            onUpdateChat?.({
              provider: {
                endpointId,
              },
            });
          }}
          // sync
          sync={chat.sync}
          onChangeSync={(sync) => {
            onUpdateChat?.({
              sync,
            });
          }}
          // others
          fetchKey={fetchKey}
          closable={closable}
          clonable={clonable}
          onClickCreate={() => {
            onCreateNewChat?.(chat);
          }}
          onClickClose={() => {
            onRequestClose?.(chat);
          }}
          onClickClearChatMessages={() => {
            onClickClearChatMessages?.(chat);
            setMessages([]);
          }}
        />
      }
      ref={dropContainerRef}
    >
      {baseURL && endpoint && _.isEmpty(models) && (
        <CustomModelForm
          baseURL={baseURL}
          token={chat.provider.apiKey}
          endpointId={endpoint?.endpoint_id}
          loading={isPendingUpdate}
          onSubmit={(data) => {
            startUpdateTransition(() => {
              updateFetchKey();
              onUpdateChat?.({
                ...chat,
                provider: {
                  ...chat.provider,
                  baseURL: data.baseURL,
                  apiKey: data.token,
                },
              });
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
      {!baseURL ? (
        <Alert
          message={t('error.InvalidBaseURL')}
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
        disabled={!baseURL}
        sync={chat.sync}
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

export default memo(PureChatCard);
