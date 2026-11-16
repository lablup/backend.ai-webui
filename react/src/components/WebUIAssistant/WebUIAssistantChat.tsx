/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useWebUILocation } from '../../hooks';
import { useTanQuery } from '../../hooks/reactQueryAlias';
import type { AIAgent } from '../../hooks/useAIAgent';
import { useHelpURL, useManualBaseURL } from '../../hooks/useHelpURL';
import ChatMessageContent from '../Chat/ChatMessageContent';
import type { ChatMessage as ChatUIMessage } from '../Chat/ChatModel';
import { fetchOpenAIModels } from '../Chat/openAIModels';
import { streamChatCompletion } from '../Chat/streamChatCompletion';
import {
  createManualIndex,
  searchManual,
  type AssistantManual,
  type ManualSection,
} from './manualSearch';
import {
  WEBUI_ASSISTANT_EXCERPT_COUNT,
  buildAssistantSystemPrompt,
  parseManualTarget,
} from './webUIAssistantPrompt';
import { useChat } from '@ai-sdk/react';
import { Banner } from '@lablup/ui-common/Banner';
import {
  ChatComposer,
  ChatMessage,
  ChatMessageBubble,
  ChatMessageList,
} from '@lablup/ui-common/Chat';
import { Spinner } from '@lablup/ui-common/Spinner';
import { Text } from '@lablup/ui-common/Text';
import { DefaultChatTransport } from 'ai';
import { BAIFlex, useEventNotStable } from 'backend.ai-ui';
import { useEffect, useEffectEvent } from 'react';
import { useTranslation } from 'react-i18next';

const MODEL_POLL_INTERVAL_MS = 5000;

interface WebUIAssistantChatProps {
  profile: AIAgent;
  endpointURL: string;
  token: string;
  /** Fired when the endpoint answers 401, so the caller can issue a new token. */
  onTokenRejected: () => void;
}

const messageText = (message: ChatUIMessage) =>
  message.parts
    .filter((part) => part.type === 'text')
    .map((part) => part.text)
    .join('');

function createAPIBaseURL(endpointURL: string): string | undefined {
  try {
    return new URL('v1', endpointURL).toString();
  } catch {
    return undefined;
  }
}

const WebUIAssistantChat: React.FC<WebUIAssistantChatProps> = ({
  profile,
  endpointURL,
  token,
  onTokenRejected,
}) => {
  'use memo';

  const { t } = useTranslation();
  const location = useWebUILocation();
  const helpURL = useHelpURL();
  const { baseURL: manualBaseURL, docsLang } = useManualBaseURL();
  const apiBaseURL = createAPIBaseURL(endpointURL);

  const manualQuery = useTanQuery({
    queryKey: ['webui-assistant-manual', docsLang],
    queryFn: async () => {
      const response = await fetch(
        `resources/webui-assistant/manual.${docsLang}.json`,
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return createManualIndex((await response.json()) as AssistantManual);
    },
    staleTime: Infinity,
    retry: false,
  });
  const manualIndex = manualQuery.data;

  const modelsQuery = useTanQuery({
    queryKey: ['webui-assistant-models', apiBaseURL, token],
    queryFn: () => fetchOpenAIModels(apiBaseURL ?? '', token),
    enabled: !!apiBaseURL,
    refetchInterval: (query) =>
      query.state.data?.data.length ? false : MODEL_POLL_INTERVAL_MS,
  });
  const models = modelsQuery.data?.data ?? [];
  const modelsError = modelsQuery.data?.error;
  const preferredModelId = profile.modelPreferences?.preferredModelId;
  const modelId =
    models.find((model) => model.id === preferredModelId)?.id ?? models[0]?.id;
  const isTokenRejected =
    modelsError?.kind === 'http' && modelsError.status === 401;

  const notifyTokenRejected = useEffectEvent(() => onTokenRejected());
  useEffect(() => {
    if (isTokenRejected) notifyTokenRejected();
  }, [isTokenRejected]);

  const pickExcerpts = (question: string): ManualSection[] => {
    if (!manualIndex) return [];
    const hits = searchManual(
      manualIndex,
      question,
      WEBUI_ASSISTANT_EXCERPT_COUNT,
    ).map((hit) => hit.section);
    // The page the user is on is the likeliest subject of "here" / "this".
    const target = parseManualTarget(helpURL);
    const pageSection = target
      ? (manualIndex.sections.find(
          (s) => s.page === target.page && s.anchor === target.anchor,
        ) ?? manualIndex.sections.find((s) => s.page === target.page))
      : undefined;
    return pageSection && !hits.includes(pageSection)
      ? [...hits.slice(0, WEBUI_ASSISTANT_EXCERPT_COUNT - 1), pageSection]
      : hits;
  };

  const { messages, sendMessage, status, stop, error } = useChat({
    id: 'webui-assistant',
    experimental_throttle: 100,
    transport: new DefaultChatTransport({
      api: apiBaseURL,
      fetch: useEventNotStable(async (_input, init) => {
        const body = JSON.parse(init?.body as string);
        const uiMessages: ChatUIMessage[] = body?.messages ?? [];
        const lastUser = [...uiMessages]
          .reverse()
          .find((m) => m.role === 'user');
        return streamChatCompletion({
          baseURL: apiBaseURL ?? '',
          apiKey: token,
          modelId: modelId ?? '',
          messages: uiMessages,
          abortSignal: init?.signal || undefined,
          system: buildAssistantSystemPrompt({
            basePrompt: profile.systemPrompt ?? '',
            page: { path: location.pathname, manualURL: helpURL },
            excerpts: pickExcerpts(lastUser ? messageText(lastUser) : ''),
            manualBaseURL,
          }),
        });
      }),
    }),
  });

  const isStreaming = status === 'streaming' || status === 'submitted';
  const isModelReady = !!modelId;

  if (!isModelReady) {
    return (
      <BAIFlex
        direction="column"
        align="center"
        justify="center"
        gap="sm"
        style={{ flex: 1 }}
      >
        {isTokenRejected ? (
          <Banner
            status="error"
            title={t('webuiAssistant.TokenRejected')}
            role="alert"
          />
        ) : (
          <>
            <Spinner />
            <Text color="secondary">{t('webuiAssistant.ModelLoading')}</Text>
            {modelsError && (
              <Text color="secondary" size="sm">
                {t('webuiAssistant.ModelLoadingDesc')}
              </Text>
            )}
          </>
        )}
      </BAIFlex>
    );
  }

  const lastMessage = messages[messages.length - 1];
  const isWaitingForFirstToken =
    isStreaming && (lastMessage?.role === 'user' || !lastMessage);

  return (
    <BAIFlex
      direction="column"
      align="stretch"
      gap="sm"
      style={{ flex: 1, minHeight: 0 }}
    >
      {manualQuery.isError && (
        <Banner
          status="warning"
          title={t('webuiAssistant.ManualUnavailable')}
        />
      )}
      <BAIFlex
        direction="column"
        align="stretch"
        className="webui-assistant-panel__messages"
      >
        <ChatMessageList
          density="compact"
          isStreaming={isStreaming}
          emptyState={
            <Text color="secondary">{t('webuiAssistant.EmptyState')}</Text>
          }
        >
          {messages.map((message, index) => {
            const text = messageText(message);
            const isUser = message.role === 'user';
            return (
              <ChatMessage
                key={message.id}
                sender={isUser ? 'user' : 'assistant'}
              >
                <ChatMessageBubble variant={isUser ? 'filled' : 'ghost'}>
                  {isUser ? (
                    text
                  ) : (
                    <ChatMessageContent
                      isStreaming={isStreaming && index === messages.length - 1}
                    >
                      {text}
                    </ChatMessageContent>
                  )}
                </ChatMessageBubble>
              </ChatMessage>
            );
          })}
          {isWaitingForFirstToken && (
            <ChatMessage sender="assistant">
              <ChatMessageBubble variant="ghost">
                <BAIFlex gap="xs">
                  <Spinner size="sm" />
                  <Text color="secondary">{t('chatui.Thinking')}</Text>
                </BAIFlex>
              </ChatMessageBubble>
            </ChatMessage>
          )}
        </ChatMessageList>
      </BAIFlex>
      {error?.message && (
        <Banner status="error" title={error.message} role="alert" />
      )}
      <ChatComposer
        density="compact"
        placeholder={t('webuiAssistant.Placeholder')}
        isStopShown={isStreaming}
        onStop={stop}
        onSubmit={(value) => {
          if (value.trim()) sendMessage({ text: value });
        }}
      />
    </BAIFlex>
  );
};

export default WebUIAssistantChat;
