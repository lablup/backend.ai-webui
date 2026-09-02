/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ChatCardQuery } from '../../__generated__/ChatCardQuery.graphql';
import { App } from '../../app-shim';
import { useTanQuery } from '../../hooks/reactQueryAlias';
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
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { useChat } from '@ai-sdk/react';
import { Banner } from '@astryxdesign/core/Banner';
import { Card } from '@astryxdesign/core/Card';
import { useTheme } from '@astryxdesign/core/theme';
import {
  convertToModelMessages,
  DefaultChatTransport,
  extractReasoningMiddleware,
  streamText,
  wrapLanguageModel,
} from 'ai';
import {
  BAIFlex,
  BAILogger,
  toGlobalId,
  toLocalId,
  useBAILogger,
  useEventNotStable,
  useUpdatableState,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React, { memo, useEffect, useRef, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

// PILOT-DECISION: the antd `CardProps` extension is gone — grepping every
// call site (ChatPage's PureChatCard usage, ModelCardChat) shows only
// `style` was ever passed externally; `title`/`styles`/`className`/`ref`
// were internal to this component. Astryx `Card` (MAPPING.md §5.1) is a bare
// container, so the header/body split below is hand-composed instead of
// threaded through Card's (nonexistent) `title`/`styles` slots.
interface ChatCardProps {
  style?: React.CSSProperties;
  chat: ChatData;
  onUpdateChat?: (partialChat: DeepPartial<ChatData>) => void;
  onRemoveChat?: (chat: ChatData) => void;
  onAddChat?: (chat: ChatData) => void;
  onChangeDeployment?: (deploymentId: string) => void;
  onChangeModel?: (modelId: string) => void;
  onChangeAgent?: (agentId: string) => void;
  onChangeSync?: (sync: boolean) => void;
  onSaveMessage?: (message: ChatMessage) => void;
  onClearMessage?: (chat: ChatData) => void;
  closable?: boolean;
  cloneable?: boolean;
  fetchOnClient?: boolean;
  defaultDeploymentId?: string;
}

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // `FileReader.result` is typed `string | ArrayBuffer | null`; only a
      // string is a valid data URL. Reject instead of casting so a malformed
      // read can never produce an invalid `url` downstream.
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('FileReader did not return a data URL string.'));
      }
    };
    reader.onerror = () =>
      reject(reader.error ?? new Error('Failed to read the file.'));
    // Without an abort handler the Promise would hang forever if the read is
    // aborted (e.g. the file becomes unavailable mid-read).
    reader.onabort = () => reject(new Error('File reading was aborted.'));
    reader.readAsDataURL(file);
  });
}

function createModelsURL(baseURL: string) {
  const { origin, pathname: path } = new URL(baseURL.trim());
  const normalizedPath = path === '/' ? '/models' : `${path}/models`;

  return new URL(normalizedPath, origin).toString();
}

function useModels(
  provider: ChatProviderData,
  fetchKey: string,
  baseURL?: string,
  effectiveApiKey?: string,
) {
  'use memo';
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

  const { data: modelsResult, isLoading: isLoadingModels } = useTanQuery<{
    data: Array<ChatModel>;
    error?: number;
  }>({
    queryKey: ['models', fetchKey, baseURL, effectiveApiKey ?? provider.apiKey],
    queryFn: async () => {
      try {
        if (!baseURL) {
          return { data: [] };
        }

        const url = createModelsURL(baseURL);
        const authToken = effectiveApiKey ?? provider.apiKey;
        // FR-3212: An unresponsive endpoint (TCP connects but never returns an
        // HTTP response) would otherwise hang this fetch forever, leaving the
        // Suspense boundary spinning indefinitely. Abort after 30s so the
        // request rejects and falls into the catch below (error: -1), driving
        // the established CustomModelForm recovery UX. 30s is generous enough
        // for a slow-but-healthy endpoint (cold start, app-proxy/TLS latency)
        // while still bounding a dead connection to a recoverable failure.
        const response = await fetch(url, {
          headers: {
            Authorization: authToken ? `Bearer ${authToken}` : '',
          },
          signal: AbortSignal.timeout(30000),
        });

        if (!response.ok) {
          return { data: [], error: response.status };
        }

        const result = await response.json();
        if (!_.isArray(result?.data)) {
          throw new Error('Invalid response format');
        }
        return result;
      } catch {
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
        // Preserve the error code so consumers (modelsError below) can detect
        // a failed `/models` fetch; otherwise it is dropped by this select.
        error: res.error,
      };
    },
  });

  const modelId =
    provider.modelId &&
    _.includes(_.map(modelsResult?.data || [], 'id'), provider.modelId)
      ? provider.modelId
      : (modelsResult?.data?.[0]?.id ?? 'custom');

  const modelsError = modelsResult?.error
    ? getModelsErrorMessage(modelsResult.error)
    : undefined;

  return {
    // useTanQuery leaves `data` undefined until the query settles; normalize to
    // an empty array so consumers (ChatHeader, the CustomModelForm gate) keep a
    // stable `ChatModel[]` shape. `isLoadingModels` distinguishes the in-flight
    // window from a genuinely empty result.
    models: modelsResult?.data ?? [],
    modelId,
    modelsError,
    isLoadingModels,
  } as const;
}

const ChatHeader = PureChatHeader;

const ChatInput = React.memo(PureChatInput);

function createBaseURL(
  logger: BAILogger,
  basePath?: string,
  deploymentUrl?: string | null,
) {
  try {
    return deploymentUrl
      ? new URL(basePath ?? '', deploymentUrl).toString()
      : undefined;
  } catch {
    logger.error('Invalid base URL:', basePath, 'deploymentUrl', deploymentUrl);
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
  style,
}) => {
  'use memo';

  const { t } = useTranslation();
  const { logger } = useBAILogger();
  const { message: appMessage } = App.useApp();
  const deploymentResult = useLazyLoadQuery<ChatCardQuery>(
    graphql`
      query ChatCardQuery($deploymentId: ID!) {
        deployment(id: $deploymentId) @catch {
          id
          networkAccess {
            endpointUrl
          }
          replicaState {
            desiredReplicaCount
          }
          ...ChatHeader_Deployment
        }
      }
    `,
    {
      // `chat.provider.deploymentId` holds the deployment's local UUID (it also
      // travels through the `deploymentId` URL param), while the Strawberry
      // `deployment(id:)` field takes the global Relay ID. The empty string
      // keeps the store-only branch below from issuing a network request.
      deploymentId: chat.provider.deploymentId
        ? toGlobalId('ModelDeployment', chat.provider.deploymentId)
        : '',
    },
    {
      fetchPolicy: chat.provider.deploymentId
        ? 'store-or-network'
        : 'store-only',
    },
  );
  const deployment = deploymentResult.deployment.ok
    ? deploymentResult.deployment.value
    : null;
  const hasNoDesiredReplicas =
    deployment?.replicaState.desiredReplicaCount === 0;
  // Consumers below address the deployment by its local UUID, as the chat
  // provider and the `deploymentId` URL param do.
  const deploymentId = deployment?.id ? toLocalId(deployment.id) : undefined;

  const { token } = useTheme();

  const [isPendingUpdate, startUpdateTransition] = useTransition();

  const dropContainerRef = useRef<HTMLDivElement>(null);
  const [fetchKey, updateFetchKey] = useUpdatableState('first');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);

  const { agents, getEndpointBinding } = useAIAgent();
  const agent = agents.find((a) => a.id === chat.provider.agentId);
  const agentEndpoint = agent ? getEndpointBinding(agent.id) : undefined;
  const effectiveApiKey = agentEndpoint?.endpoint_token || chat.provider.apiKey;
  const agentEndpointUrl = agentEndpoint?.endpoint_url;

  const baseURL = createBaseURL(
    logger,
    chat.provider.basePath,
    agentEndpointUrl || deployment?.networkAccess.endpointUrl,
  );
  const { models, modelId, modelsError, isLoadingModels } = useModels(
    chat.provider,
    fetchKey,
    baseURL,
    effectiveApiKey,
  );

  const [input, setInput] = useState('');

  const { error, messages, stop, status, sendMessage, setMessages } = useChat({
    experimental_throttle: 100,
    messages: chat.messages,
    // Because there is an issue(https://github.com/vercel/ai/issues/8956) with useChat that does not run a new transport without an id change,
    // we have to change the id and use fetch by utilizing useEventNotStable.
    id: `chat-${baseURL}-${modelId}-${effectiveApiKey}`,
    transport: new DefaultChatTransport({
      api: baseURL,
      body: {
        modelId: modelId,
      },
      headers: {
        Authorization: effectiveApiKey ? `Bearer ${effectiveApiKey}` : '',
      },
      fetch: useEventNotStable(async (input, init) => {
        // For custom models or client-side fetching, handle directly
        if (fetchOnClient || modelId === 'custom' || agentEndpointUrl) {
          const provider = createOpenAICompatible({
            name: 'backend-ai',
            baseURL: baseURL ?? '',
            apiKey: effectiveApiKey || 'dummy',
          });

          try {
            const body = JSON.parse(init?.body as string);
            const result = streamText({
              abortSignal: init?.signal || undefined,
              model: wrapLanguageModel({
                model: provider.chatModel(modelId),
                middleware: [
                  extractReasoningMiddleware({
                    tagName: 'think',
                  }),
                  // The openai-compatible provider does not advertise any
                  // `supportedUrls`, so the AI SDK treats a `data:` image
                  // attachment as a remote asset and tries to *download* it,
                  // failing with "Failed to download data:image/...". Advertise
                  // that the model accepts image URLs inline so the SDK passes
                  // the data URL straight through as an `image_url` part.
                  {
                    overrideSupportedUrls: () => ({
                      'image/*': [/^data:/, /^https?:\/\//],
                    }),
                  },
                ],
              }),
              messages: convertToModelMessages(body?.messages),
              system: agent?.systemPrompt || undefined,
              ...(chat.usingParameters ? chat.parameters : {}),
            });

            const userMessage = getLatestUserMessage(body.messages);
            if (userMessage) {
              onSaveMessage?.(userMessage);
            }

            return result.toUIMessageStreamResponse({
              // Surface the model-reported output token count on the final
              // message so ChatTokenCounter can use the exact usage value for
              // TPS instead of the gpt-tokenizer estimate. Only emitted on the
              // 'finish' event (usage is not known mid-stream).
              messageMetadata: ({ part }) => {
                if (part.type === 'finish') {
                  return { outputTokens: part.totalUsage.outputTokens };
                }
              },
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

  // TPS measurement window follows the standard LLM inference convention:
  // start when the first output token arrives (status transitions to
  // 'streaming') and stop when streaming ends (success, abort, or error).
  // This excludes file upload, network RTT, and prefill (TTFT), so the
  // displayed TPS reflects pure decode rate — the same definition used by
  // vLLM, Ollama, NVIDIA GenAI-Perf, etc.
  useEffect(() => {
    if (status === 'streaming' && startTime === null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- TPS timer; pre-existing in FR-2854 scope, refactor in follow-up
      setStartTime(Date.now());
    }
  }, [status, startTime]);

  useEffect(() => {
    if (!isStreaming && startTime !== null && endTime === null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- TPS timer; pre-existing in FR-2854 scope, refactor in follow-up
      setEndTime(Date.now());
    }
  }, [isStreaming, startTime, endTime]);

  // Helper function to handle message sending with files
  const handleSendMessage = async (textContent: string, files?: File[]) => {
    setStartTime(null);
    setEndTime(null);

    const parts: Array<
      | { type: 'text'; text: string }
      | { type: 'file'; url: string; mediaType: string; filename?: string }
    > = [];

    // Add text content if present
    if (textContent) {
      parts.push({ type: 'text', text: textContent });
    }

    // Add files if present.
    // Encode each file as a base64 data URL rather than an object URL: a
    // `blob:` URL is only resolvable inside the document that created it, so it
    // cannot be read once the attachment is forwarded to the model endpoint
    // through the openai-compatible provider. A data URL inlines the bytes and
    // is delivered to the model as-is.
    if (files && files.length > 0) {
      // `onSendMessage` is fired from ChatInput without awaiting, so a
      // rejection here would surface as an unhandled promise rejection.
      // Catch the read failure, surface it to the user, and abort the send
      // rather than forwarding a half-built message to the model.
      try {
        const fileParts = await Promise.all(
          files.map(async (file) => ({
            type: 'file' as const,
            url: await readFileAsDataURL(file),
            mediaType: file.type || 'application/octet-stream',
            filename: file.name,
          })),
        );
        parts.push(...fileParts);
      } catch (error) {
        logger.error('Failed to read attached file(s) as data URL:', error);
        appMessage.error(t('theme.FailedToReadFile'));
        return;
      }
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
    // PILOT-DECISION: Astryx `Card` is a bare container (MAPPING.md §5.1) —
    // antd's `title`/`styles.header`/`styles.body` header-vs-body split is
    // hand-composed below instead of routed through a generic BAICard
    // wrapper (this page's exact anatomy — a full-bleed body, no card
    // padding — doesn't fit the standard padded-header recipe). `ref` moves
    // from the antd Card root to the Astryx Card root; both are plain
    // `HTMLDivElement`s, so `getDropContainer` keeps working unchanged.
    <Card
      ref={dropContainerRef}
      padding={0}
      variant="default"
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        ...style,
      }}
    >
      <BAIFlex
        direction="column"
        align="stretch"
        style={{
          zIndex: 1,
          paddingInline: token('--spacing-4'),
          paddingRight: token('--spacing-2'),
          paddingBlock: token('--spacing-2'),
          borderBottom: `1px solid ${token('--color-border')}`,
        }}
      >
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
            const binding = getEndpointBinding(agent.id);
            onUpdateChat?.({
              provider: {
                agentId: agent.id,
                deploymentId: binding?.endpoint_url ? '' : binding?.endpoint_id,
                apiKey: binding?.endpoint_token || undefined,
                modelId: agent.modelPreferences?.preferredModelId || undefined,
              },
            });
          }}
          // deployment
          deploymentFrgmt={deployment}
          onChangeDeployment={(deploymentId) => {
            onUpdateChat?.({
              provider: {
                deploymentId,
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
      </BAIFlex>
      <BAIFlex
        direction="column"
        align="stretch"
        style={{
          backgroundColor: token('--bai-color-fill-quaternary'),
          flex: 1,
          padding: 0,
          // `minHeight: 0` (not the old `height: '50%'`): this column owns the
          // messages/composer height budget. Without it the message list's
          // automatic minimum size is its min-content height, which lets the
          // list push the composer past the card's `overflow: hidden` edge.
          minHeight: 0,
          position: 'relative',
        }}
      >
        {baseURL && (deployment || agentEndpointUrl) && _.isEmpty(models) && (
          <CustomModelForm
            deploymentUrl={
              agentEndpointUrl || deployment?.networkAccess.endpointUrl || ''
            }
            basePath={chat.provider.basePath}
            token={effectiveApiKey}
            deploymentId={deploymentId}
            loading={isPendingUpdate || isLoadingModels}
            hasNoDesiredReplicas={hasNoDesiredReplicas}
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
          <Banner
            title={error?.message ?? ''}
            status="error"
            style={{
              marginBlock: token('--spacing-3'),
              marginInline: token('--spacing-4'),
            }}
          />
        ) : null}
        {!baseURL ? (
          <Banner
            title={t('error.InvalidBaseURL')}
            status="error"
            style={{
              marginBlock: token('--spacing-3'),
              marginInline: token('--spacing-4'),
            }}
          />
        ) : null}
        <ChatMessages
          messages={messages}
          input={input}
          isStreaming={isStreaming}
          startTime={startTime}
          endTime={endTime}
        />
        <ChatInput
          disabled={!baseURL || !!modelsError || isLoadingModels}
          sync={chat.sync}
          input={input}
          setInput={setInput}
          stop={stop}
          onSendMessage={handleSendMessage}
          isStreaming={isStreaming}
          dropContainerRef={dropContainerRef}
        />
      </BAIFlex>
    </Card>
  );
};

export default memo(PureChatCard);
