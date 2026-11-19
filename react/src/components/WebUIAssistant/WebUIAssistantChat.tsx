/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useWebUILocation } from '../../hooks';
import { useTanQuery } from '../../hooks/reactQueryAlias';
import { useHelpURL, useManualBaseURL } from '../../hooks/useHelpURL';
import ChatMessageContent from '../Chat/ChatMessageContent';
import type { ChatMessage as ChatUIMessage } from '../Chat/ChatModel';
import { fetchOpenAIModels, type ModelsFetchError } from '../Chat/openAIModels';
import {
  createManualIndex,
  loadManual,
  searchManual,
  type ManualSection,
} from './manualSearch';
import { streamChatCompletion } from './streamChatCompletion';
import { WEBUI_ASSISTANT_PROFILE } from './webUIAssistantProfile';
import {
  MANUAL_RESOURCE_BASE,
  WEBUI_ASSISTANT_EXCERPT_COUNT,
  isAuthRejected,
  buildAssistantSystemPrompt,
  parseManualTarget,
} from './webUIAssistantPrompt';
import { useChat } from '@ai-sdk/react';
import { Banner } from '@lablup/ui-common/Banner';
import { Button } from '@lablup/ui-common/Button';
import {
  ChatComposer,
  ChatComposerInput,
  ChatMessage,
  ChatMessageBubble,
  ChatMessageList,
} from '@lablup/ui-common/Chat';
import { Spinner } from '@lablup/ui-common/Spinner';
import { Text } from '@lablup/ui-common/Text';
import { DefaultChatTransport } from 'ai';
import { BAIFlex, useEventNotStable } from 'backend.ai-ui';
import { MessageCircleQuestion } from 'lucide-react';
import { useEffect, useEffectEvent } from 'react';
import { useTranslation } from 'react-i18next';

const MODEL_POLL_INTERVAL_MS = 5000;

/** Thrown so a failed refetch keeps the last model list instead of replacing it. */
class ModelsQueryError extends Error {
  constructor(readonly detail: ModelsFetchError) {
    super(detail.kind);
  }
}

interface WebUIAssistantChatProps {
  /** OpenAI-compatible base URL (`…/v1`). */
  baseURL: string;
  apiKey?: string;
  /** Whether the panel is on screen; the model list is polled only then. */
  isVisible: boolean;
  /** Lets the user fix a connection the endpoint rejects or cannot be reached on. */
  onChangeConnection: () => void;
}

const messageText = (message: ChatUIMessage) =>
  message.parts
    .filter((part) => part.type === 'text')
    .map((part) => part.text)
    .join('');

const WebUIAssistantChat: React.FC<WebUIAssistantChatProps> = ({
  baseURL: apiBaseURL,
  apiKey: token,
  isVisible,
  onChangeConnection,
}) => {
  'use memo';

  const { t } = useTranslation();
  const location = useWebUILocation();
  const helpURL = useHelpURL();
  const { baseURL: manualBaseURL, docsLang } = useManualBaseURL();

  const manualQuery = useTanQuery({
    queryKey: ['webui-assistant-manual', docsLang],
    queryFn: async () =>
      createManualIndex(await loadManual(MANUAL_RESOURCE_BASE, docsLang)),
    staleTime: Infinity,
    retry: false,
  });
  const manualIndex = manualQuery.data;

  const modelsQuery = useTanQuery({
    queryKey: ['webui-assistant-models', apiBaseURL, token],
    queryFn: async () => {
      const result = await fetchOpenAIModels(apiBaseURL ?? '', token);
      if (result.error) throw new ModelsQueryError(result.error);
      return result.data;
    },
    enabled: !!apiBaseURL,
    retry: false,
    // Poll while the panel is shown and a deployment starts up; a rejected key will not fix itself.
    refetchInterval: (query) => {
      const error = query.state.error;
      return !isVisible ||
        query.state.data?.length ||
        (error instanceof ModelsQueryError && isAuthRejected(error.detail))
        ? false
        : MODEL_POLL_INTERVAL_MS;
    },
  });
  const models = modelsQuery.data ?? [];
  const modelsError =
    modelsQuery.error instanceof ModelsQueryError
      ? modelsQuery.error.detail
      : undefined;
  const modelId = models[0]?.id;
  const isTokenRejected = isAuthRejected(modelsError);

  // `null` = the manual is not loaded, which the prompt must not report as "nothing matched".
  const pickExcerpts = (question: string): ManualSection[] | null => {
    if (!manualIndex) {
      // The chat stays mounted, so a failed load is retried on the next question.
      if (manualQuery.isError) void manualQuery.refetch();
      return null;
    }
    const hits = searchManual(
      manualIndex,
      question,
      WEBUI_ASSISTANT_EXCERPT_COUNT,
    ).map((hit) => hit.section);
    // The page the user is on is the likeliest subject of "here" / "this".
    const target = helpURL ? parseManualTarget(helpURL) : null;
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
            basePrompt: WEBUI_ASSISTANT_PROFILE.systemPrompt,
            page: { path: location.pathname, manualURL: helpURL ?? undefined },
            excerpts: pickExcerpts(lastUser ? messageText(lastUser) : ''),
            manualBaseURL,
          }),
        });
      }),
    }),
  });

  // useChat does not abort on unmount (Clear conversation, a new connection).
  const stopOnUnmount = useEffectEvent(() => stop());
  useEffect(
    () => () => {
      stopOnUnmount();
    },
    [],
  );

  const isStreaming = status === 'streaming' || status === 'submitted';
  const isModelReady = !!modelId;

  if (!isModelReady) {
    return (
      <BAIFlex
        direction="column"
        align="center"
        justify="center"
        gap="sm"
        style={{
          flex: '1 1 0%',
          minHeight: 0,
          overflowY: 'auto',
          padding: 'var(--spacing-3) var(--spacing-4)',
        }}
      >
        {isTokenRejected ? (
          <Banner
            status="error"
            title={t('webuiAssistant.ConnectionRejected')}
            role="alert"
          />
        ) : (
          <>
            <Spinner />
            <Text color="secondary">{t('webuiAssistant.ModelLoading')}</Text>
            {modelsError && (
              <Text color="secondary" size="sm">
                {t('webuiAssistant.EndpointUnreachable', { url: apiBaseURL })}
              </Text>
            )}
          </>
        )}
        {(isTokenRejected || modelsError) && (
          <Button
            variant="secondary"
            label={t('webuiAssistant.ChangeConnection')}
            onClick={onChangeConnection}
          />
        )}
      </BAIFlex>
    );
  }

  const lastMessage = messages[messages.length - 1];
  const isWaitingForFirstToken =
    isStreaming && (lastMessage?.role === 'user' || !lastMessage);

  const thinking = (
    <BAIFlex gap="xs">
      <Spinner size="sm" />
      <Text color="secondary">{t('chatui.Thinking')}</Text>
    </BAIFlex>
  );

  const messageItems = [
    ...messages.map((message, index) => {
      const isUser = message.role === 'user';
      const isMessageStreaming = isStreaming && index === messages.length - 1;
      const text = messageText(message);
      return (
        <ChatMessage key={message.id} sender={isUser ? 'user' : 'assistant'}>
          <ChatMessageBubble>
            {isUser ? (
              text
            ) : isMessageStreaming && !text.trim() ? (
              // A reasoning model streams its reasoning first, which has nothing to show.
              thinking
            ) : (
              <ChatMessageContent isStreaming={isMessageStreaming}>
                {text}
              </ChatMessageContent>
            )}
          </ChatMessageBubble>
        </ChatMessage>
      );
    }),
    ...(isWaitingForFirstToken
      ? [
          <ChatMessage key="thinking" sender="assistant">
            <ChatMessageBubble>{thinking}</ChatMessageBubble>
          </ChatMessage>,
        ]
      : []),
  ];

  return (
    <>
      <BAIFlex
        direction="column"
        align="stretch"
        gap="sm"
        className="webui-assistant-panel__messages"
        style={{
          flex: '1 1 0%',
          minHeight: 0,
          overflowY: 'auto',
          padding: 'var(--spacing-3) var(--spacing-4)',
        }}
      >
        {manualQuery.isError && (
          <Banner
            status="warning"
            title={t('webuiAssistant.ManualUnavailable')}
          />
        )}
        {messageItems.length === 0 ? (
          <BAIFlex
            direction="column"
            align="center"
            justify="center"
            gap="sm"
            style={{ flex: '1 1 0%', textAlign: 'center' }}
          >
            <MessageCircleQuestion
              size={32}
              // A global rule sizes SVGs to 1em, so `size` alone stays at text size.
              style={{ fontSize: 32 }}
              color="var(--color-text-secondary)"
              aria-hidden
            />
            <Text color="secondary">{t('webuiAssistant.EmptyState')}</Text>
          </BAIFlex>
        ) : (
          <ChatMessageList density="compact" isStreaming={isStreaming}>
            {messageItems}
          </ChatMessageList>
        )}
        {error?.message && (
          <Banner status="error" title={error.message} role="alert" />
        )}
      </BAIFlex>
      <BAIFlex
        direction="column"
        align="stretch"
        style={{
          flexShrink: 0,
          borderTop: '1px solid var(--color-border)',
          padding: 'var(--spacing-3) var(--spacing-4)',
        }}
      >
        <ChatComposer
          density="compact"
          elevation="none"
          style={
            {
              '--radius-chat': 'var(--radius-container)',
            } as React.CSSProperties
          }
          placeholder={t('webuiAssistant.Placeholder')}
          isStopShown={isStreaming}
          onStop={stop}
          onSubmit={(value) => {
            if (value.trim()) sendMessage({ text: value });
          }}
          input={
            <ChatComposerInput
              label={t('webuiAssistant.Placeholder')}
              hasHistory={false}
              pasteAsToken={false}
            />
          }
        />
      </BAIFlex>
    </>
  );
};

export default WebUIAssistantChat;
