import { useUpdatableState } from '../../hooks';
import { useSuspenseTanQuery } from '../../hooks/reactQueryAlias';
import { useAIAgent } from '../../hooks/useAIAgent';
import PureChatHeader from './ChatHeader';
import PureChatInput from './ChatInput';
import ChatMessages from './ChatMessages';
import {
  BAIModel,
  ChatLifecycleEventType,
  ChatProviderType,
  ChatType,
  getAIErrorMessage,
  Model,
} from './ChatModel';
import { CustomModelForm } from './CustomModelForm';
import { ChatCardQuery } from './__generated__/ChatCardQuery.graphql';
import { createOpenAI } from '@ai-sdk/openai';
import { useChat } from '@ai-sdk/react';
import { extractReasoningMiddleware, streamText, wrapLanguageModel } from 'ai';
import { Alert, App, Card, CardProps } from 'antd';
import { createStyles } from 'antd-style';
import graphql from 'babel-plugin-relay/macro';
import _ from 'lodash';
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useLazyLoadQuery } from 'react-relay';

interface ChatCardProps extends CardProps, ChatLifecycleEventType {
  chat: ChatType;
  onUpdateChat?: (partialChat: DeepPartial<ChatType>) => void;
  closable?: boolean;
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
  provider: ChatProviderType,
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
      case -1:
      default:
        return t('error.UnknownError');
    }
  };

  const { data: modelsResult } = useSuspenseTanQuery<{
    data: Array<Model>;
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
      } else {
        return { data: [], error: res?.status };
      }
    },
  });

  const models = _.map(modelsResult?.data || [], (m) => ({
    id: m.id,
    name: m.id,
  })) as BAIModel[];

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
    models,
    modelId,
    modelsError,
  } as const;
}

const ChatHeader = PureChatHeader;

const ChatInput = React.memo(PureChatInput);

function createBaseURL(basePath: string, endpointUrl?: string | null) {
  return endpointUrl ? new URL(basePath, endpointUrl).toString() : undefined;
}

const ChatCard: React.FC<ChatCardProps> = ({
  chat,
  onUpdateChat,
  closable,
  fetchOnClient,
  onRequestClose,
  onCreateNewChat,
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
          ...(chat.usingParameters ? chat.parameters : {}),
        });

        setStartTime(Date.now());

        return result.toDataStreamResponse({
          sendReasoning: true,
          getErrorMessage: (error) => {
            return getAIErrorMessage(error);
          },
        });
      }

      return fetch(input, init);
    },
  });

  const isStreaming = status === 'streaming' || status === 'submitted';

  useEffect(() => {
    // prevent to show the error message as failed fetching in the first time
    if (modelsError && fetchKey !== 'first') {
      appMessage.error(`Error fetching models: ${modelsError}`, 5);
    }
  }, [modelsError, fetchKey, appMessage]);

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
          onClickCreate={onCreateNewChat}
          onClickClose={() => {
            onRequestClose?.(chat);
          }}
          onClickDeleteChatHistory={() => {
            setMessages([]);
          }}
          parameters={chat.parameters}
          usingParameters={chat.usingParameters}
          onChangeParameter={(usingParameters, parameters) => {
            onUpdateChat?.({
              usingParameters,
              parameters,
            });
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

export default ChatCard;
