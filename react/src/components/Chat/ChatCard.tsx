import { ChatCardQuery } from '../../__generated__/ChatCardQuery.graphql';
import { useSuspenseTanQuery } from '../../hooks/reactQueryAlias';
import { useAIAgent } from '../../hooks/useAIAgent';
import PureChatHeader from './ChatHeader';
import PureChatInput from './ChatInput';
import ChatMessages from './ChatMessages';
import {
  getAIErrorMessage,
  ChatProviderData,
  ChatData,
  ChatModel,
  getLatestUserMessage,
  ChatMessage,
} from './ChatModel';
import { CustomModelForm } from './CustomModelForm';
import { createOpenAI } from '@ai-sdk/openai';
import { useChat } from '@ai-sdk/react';
import {
  convertToModelMessages,
  DefaultChatTransport,
  extractReasoningMiddleware,
  streamText,
  wrapLanguageModel,
} from 'ai';
import { Alert, App, Card, CardProps, theme } from 'antd';
import { createStyles } from 'antd-style';
import {
  BAILogger,
  useBAILogger,
  useEventNotStable,
  useUpdatableState,
} from 'backend.ai-ui';
import classNames from 'classnames';
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
import { graphql, useLazyLoadQuery } from 'react-relay';

interface ChatCardProps extends Omit<CardProps, 'classNames' | 'variant'> {
  chat: ChatData;
  onUpdateChat?: (partialChat: DeepPartial<ChatData>) => void;
  onRemoveChat?: (chat: ChatData) => void;
  onAddChat?: (chat: ChatData) => void;
  onChangeEndpoint?: (endpointId: string) => void;
  onChangeModel?: (modelId: string) => void;
  onChangeAgent?: (agentId: string) => void;
  onChangeSync?: (sync: boolean) => void;
  onSaveMessage?: (message: ChatMessage) => void;
  onClearMessage?: (chat: ChatData) => void;
  closable?: boolean;
  cloneable?: boolean;
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
  alert: css`
    margin-block: ${token.paddingContentVertical}px;
    margin-inline: ${token.paddingContentHorizontal}px;
  `,
}));

function createModelsURL(baseURL: string) {
  const { origin, pathname: path } = new URL(baseURL.trim());
  const normalizedPath = path === '/' ? '/models' : `${path}/models`;

  return new URL(normalizedPath, origin).toString();
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
      try {
        if (!baseURL) {
          return { data: [] };
        }

        const url = createModelsURL(baseURL);
        const authToken = provider.apiKey;
        const response = await fetch(url, {
          headers: {
            Authorization: authToken ? `Bearer ${authToken}` : '',
          },
        });

        if (!response.ok) {
          return { data: [], error: response.status };
        }

        const result = await response.json();
        if (!_.isArray(result?.data)) {
          throw new Error('Invalid response format');
        }
        return result;
      } catch (error) {
        return { data: [], error: -1 };
      }
    },
    select: (res) => {
      return {
        data: res.data
          ? res.data.map((model) => ({
              id: model.id,
              name: model.id,
            }))
          : [],
      };
    },
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

function createBaseURL(
  logger: BAILogger,
  basePath?: string,
  endpointUrl?: string | null,
) {
  try {
    return endpointUrl
      ? new URL(basePath ?? '', endpointUrl).toString()
      : undefined;
  } catch {
    logger.error('Invalid base URL:', basePath, 'endpointUrl', endpointUrl);
  }
}

const PureChatCard: React.FC<ChatCardProps> = ({
  chat,
  onUpdateChat,
  closable,
  cloneable,
  fetchOnClient,
  onRemoveChat,
  onAddChat,
  onSaveMessage,
  onClearMessage,
  styles,
  className,
  ...otherCardProps
}) => {
  'use memo';

  const { t } = useTranslation();
  const { logger } = useBAILogger();
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
    styles: { chatCard: chatCardStyle, alert: alertStyle },
  } = useStyles();

  const { token } = theme.useToken();

  const [isPendingUpdate, startUpdateTransition] = useTransition();

  const dropContainerRef = useRef<HTMLDivElement>(null);
  const [fetchKey, updateFetchKey] = useUpdatableState('first');
  const [startTime, setStartTime] = useState<number | null>(null);

  const baseURL = createBaseURL(logger, chat.provider.basePath, endpoint?.url);
  const { models, modelId, modelsError } = useModels(
    chat.provider,
    fetchKey,
    baseURL,
  );
  const { agents } = useAIAgent();
  const agent = agents.find((a) => a.id === chat.provider.agentId);

  const [input, setInput] = useState('');

  const { error, messages, stop, status, sendMessage, setMessages } = useChat({
    experimental_throttle: 100,
    messages: chat.messages,
    onFinish: () => {
      setStartTime(null);
    },
    // Because there is an issue(https://github.com/vercel/ai/issues/8956) with useChat that does not run a new transport without an id change,
    // we have to change the id and use fetch by utilizing useEventNotStable.
    id: `chat-${baseURL}-${modelId}-${chat.provider.apiKey}`,
    transport: new DefaultChatTransport({
      api: baseURL,
      body: {
        modelId: modelId,
      },
      headers: {
        Authorization: chat.provider.apiKey
          ? `Bearer ${chat.provider.apiKey}`
          : '',
      },
      fetch: useEventNotStable(async (input, init) => {
        // For custom models or client-side fetching, handle directly
        if (fetchOnClient || modelId === 'custom') {
          const provider = createOpenAI({
            baseURL: baseURL,
            apiKey: chat.provider.apiKey || 'dummy',
          });

          try {
            const body = JSON.parse(init?.body as string);
            const result = streamText({
              abortSignal: init?.signal || undefined,
              model: wrapLanguageModel({
                model: provider.chat(modelId),
                middleware: extractReasoningMiddleware({
                  tagName: 'think',
                }),
              }),
              messages: convertToModelMessages(body?.messages),
              system: agent?.config.system_prompt || undefined,
              ...(chat.usingParameters ? chat.parameters : {}),
            });

            const userMessage = getLatestUserMessage(body.messages);
            if (userMessage) {
              onSaveMessage?.(userMessage);
            }

            return result.toUIMessageStreamResponse({
              onError: (error) => {
                return getAIErrorMessage(error);
              },
              onFinish: (event) => {
                if (!event.isAborted && event.responseMessage) {
                  onSaveMessage?.(event.responseMessage);
                }
              },
            });
          } catch (error) {
            logger.error('Client-side streaming error:', error);
            // Fallback to regular fetch
            return fetch(input, init);
          }
        }

        // Default fetch for server endpoints
        return fetch(input, init);
      }),
    }),
  });

  const isStreaming = status === 'streaming' || status === 'submitted';

  // Helper function to handle message sending with files
  const handleSendMessage = async (textContent: string, files?: File[]) => {
    setStartTime(Date.now());

    const parts: Array<
      | { type: 'text'; text: string }
      | { type: 'file'; url: string; mediaType: string; filename?: string }
    > = [];

    // Add text content if present
    if (textContent) {
      parts.push({ type: 'text', text: textContent });
    }

    // Add files if present
    if (files && files.length > 0) {
      files.forEach((file) => {
        const url = URL.createObjectURL(file);
        parts.push({
          type: 'file',
          url: url,
          mediaType: file.type || 'application/octet-stream',
          filename: file.name,
        });
      });
    }

    // Send with parts array if we have content
    if (parts.length > 0) {
      await sendMessage({ parts });
    }
  };

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
      {...otherCardProps}
      variant="outlined"
      className={classNames(chatCardStyle, className)}
      styles={{
        ...styles,
        body: {
          backgroundColor: token.colorFillQuaternary,
          borderRadius: 0,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          height: '50%',
          position: 'relative',
          ...(!_.isFunction(styles) && styles?.body),
        },
        actions: {
          paddingLeft: token.paddingContentHorizontal,
          paddingRight: token.paddingContentHorizontal,
          ...(!_.isFunction(styles) && styles?.actions),
        },
        header: {
          zIndex: 1,
          paddingInline: token.paddingContentHorizontal,
          paddingRight: token.paddingXS,
          ...(!_.isFunction(styles) && styles?.header),
        },
      }}
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
          cloneable={cloneable}
          onAddChat={() => {
            onAddChat?.(chat);
          }}
          onRemoveChat={() => {
            onRemoveChat?.(chat);
          }}
          onClearMessage={() => {
            onClearMessage?.(chat);
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
          endpointUrl={endpoint?.url ?? ''}
          basePath={chat.provider.basePath}
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
                  basePath: data.basePath,
                  apiKey: data.token,
                },
              });
            });
          }}
        />
      )}
      {!_.isEmpty(error?.message) ? (
        <Alert
          title={error?.message}
          type="error"
          showIcon
          className={alertStyle}
          closable
        />
      ) : null}
      {!baseURL ? (
        <Alert
          title={t('error.InvalidBaseURL')}
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
        onSendMessage={handleSendMessage}
        isStreaming={isStreaming}
        dropContainerRef={dropContainerRef}
      />
    </Card>
  );
};

export default memo(PureChatCard);
