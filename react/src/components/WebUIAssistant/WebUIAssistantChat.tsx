/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useWebUILocation } from '../../hooks';
import { useTanQuery } from '../../hooks/reactQueryAlias';
import { useHelpURL, useManualBaseURL } from '../../hooks/useHelpURL';
import ChatMessageContent from '../Chat/ChatMessageContent';
import {
  getAIErrorMessage,
  type ChatMessage as ChatUIMessage,
} from '../Chat/ChatModel';
import { fetchOpenAIModels, type ModelsFetchError } from '../Chat/openAIModels';
import {
  actionTargetId,
  isNoopAction,
  type DashboardAssistantAction,
} from '../DashboardPanels/assistantActions';
import {
  dashboardAgentAtom,
  type DashboardAgent,
} from '../DashboardPanels/dashboardAgent';
import {
  buildDashboardChatPrompt,
  dashboardExamplesOf,
  describeDashboardAction,
  answersFromManual,
  parseDashboardChatReply,
} from '../DashboardPanels/dashboardChat';
import { generateAssistantText } from './generateAssistantText';
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
  linkManualReferences,
  manualReferencesOf,
  type ManualReference,
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
  ChatSystemMessage,
} from '@lablup/ui-common/Chat';
import { IconButton } from '@lablup/ui-common/IconButton';
import { List, ListItem } from '@lablup/ui-common/List';
import { Spinner } from '@lablup/ui-common/Spinner';
import { Text } from '@lablup/ui-common/Text';
import {
  DefaultChatTransport,
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateId,
  type ModelMessage,
} from 'ai';
import { BAIFlex, useEventNotStable } from 'backend.ai-ui';
import { useAtomValue } from 'jotai';
import {
  CornerDownRight,
  LocateFixed,
  MessageCircleQuestion,
} from 'lucide-react';
import { useEffect, useEffectEvent } from 'react';
import { useTranslation } from 'react-i18next';

const MODEL_POLL_INTERVAL_MS = 5000;

const messageText = (message: ChatUIMessage) =>
  message.parts
    .filter((part) => part.type === 'text')
    .map((part) => part.text)
    .join('');
/** How many earlier dashboard messages a request carries; the board itself carries the state. */
const DASHBOARD_HISTORY_MESSAGES = 6;

/** What a dashboard answer proposed, kept on its message for display and history. */
interface DashboardTurn {
  items: Array<{
    action: DashboardAssistantAction;
    text: string;
    isNoop: boolean;
  }>;
}

interface AssistantMessageMetadata {
  dashboard?: DashboardTurn;
  /** A note in the conversation (what Apply saved), never sent to the model. */
  notice?: boolean;
  /** The manual excerpts the answer's `[n]` references point at. */
  references?: Array<ManualReference>;
}

const metadataOf = (message: ChatUIMessage) =>
  (message.metadata ?? {}) as AssistantMessageMetadata;

/** A dashboard answer as `useChat` reads a streamed one. */
const dashboardResponse = (reply: string, turn: DashboardTurn) =>
  createUIMessageStreamResponse({
    stream: createUIMessageStream({
      execute: ({ writer }) => {
        writer.write({
          type: 'start',
          messageMetadata: {
            dashboard: turn,
          } satisfies AssistantMessageMetadata,
        });
        if (reply) {
          writer.write({ type: 'text-start', id: 'reply' });
          writer.write({ type: 'text-delta', id: 'reply', delta: reply });
          writer.write({ type: 'text-end', id: 'reply' });
        }
        writer.write({ type: 'finish' });
      },
    }),
  });

/** Earlier dashboard requests and answers, as the agent prompt's examples expect them. */
const dashboardHistoryOf = (
  messages: ReadonlyArray<ChatUIMessage>,
): Array<ModelMessage> =>
  messages
    .flatMap((message, index): Array<ModelMessage> => {
      const turn = metadataOf(message).dashboard;
      const request = messages[index - 1];
      if (!turn || request?.role !== 'user') return [];
      return [
        { role: 'user', content: messageText(request) },
        {
          role: 'assistant',
          content: JSON.stringify({
            reply: messageText(message),
            actions: turn.items
              .filter((item) => !item.isNoop)
              .map(({ action }) =>
                action.type === 'addPanel'
                  ? { type: 'addPanel', id: action.panel.id }
                  : action.type === 'editPanel'
                    ? { type: 'editPanel', id: action.id }
                    : action,
              ),
          }),
        },
      ];
    })
    .slice(-DASHBOARD_HISTORY_MESSAGES);

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

const WebUIAssistantChat: React.FC<WebUIAssistantChatProps> = ({
  baseURL: apiBaseURL,
  apiKey: token,
  isVisible,
  onChangeConnection,
}) => {
  'use memo';

  const { t } = useTranslation();
  const location = useWebUILocation();
  // Set while a dashboard page is open: requests that change the board go to its agent.
  const dashboardAgent = useAtomValue(dashboardAgentAtom);
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

  /** The agent's answer, or null when the request is a question for the manual. */
  const askDashboard = async (
    agent: DashboardAgent,
    history: ReadonlyArray<ChatUIMessage>,
    request: string,
    abortSignal?: AbortSignal,
  ): Promise<Response | null> => {
    let answer: string;
    try {
      answer = await generateAssistantText({
        baseURL: apiBaseURL,
        apiKey: token,
        modelId: modelId ?? '',
        system: buildDashboardChatPrompt(agent.context),
        messages: [
          ...dashboardHistoryOf(history),
          { role: 'user', content: request },
        ],
        abortSignal,
      });
    } catch (e) {
      throw new Error(getAIErrorMessage(e));
    }
    const { reply, actions, isQuestion } = parseDashboardChatReply(
      answer,
      agent.context,
    );
    // Changes after a new board land on that board, so the current one cannot make them no-ops.
    const newBoardIndex = actions.findIndex((a) => a.type === 'createBoard');
    const items = actions.map((action, index) => ({
      action,
      text: describeDashboardAction(action, agent.context, t),
      isNoop:
        (newBoardIndex < 0 || index < newBoardIndex) &&
        isNoopAction(action, agent.context.cards),
    }));
    const effective = items.filter((item) => !item.isNoop);
    if (
      answersFromManual({
        request,
        isQuestion,
        hasChange: effective.length > 0,
      })
    )
      return null;
    if (effective.length) agent.propose(effective.map((item) => item.action));
    return dashboardResponse(reply, { items });
  };

  const { messages, setMessages, sendMessage, status, stop, error } = useChat({
    id: 'webui-assistant',
    experimental_throttle: 100,
    transport: new DefaultChatTransport({
      api: apiBaseURL,
      fetch: useEventNotStable(async (_input, init) => {
        const body = JSON.parse(init?.body as string);
        const uiMessages = ((body?.messages ?? []) as ChatUIMessage[]).filter(
          (message) => !metadataOf(message).notice,
        );
        const lastUser = [...uiMessages]
          .reverse()
          .find((m) => m.role === 'user');
        if (dashboardAgent && lastUser) {
          const response = await askDashboard(
            dashboardAgent,
            uiMessages.slice(0, -1),
            messageText(lastUser),
            init?.signal || undefined,
          );
          if (response) return response;
        }
        const excerpts = pickExcerpts(lastUser ? messageText(lastUser) : '');
        return streamChatCompletion({
          baseURL: apiBaseURL ?? '',
          apiKey: token,
          modelId: modelId ?? '',
          messages: uiMessages,
          abortSignal: init?.signal || undefined,
          system: buildAssistantSystemPrompt({
            basePrompt: WEBUI_ASSISTANT_PROFILE.systemPrompt,
            page: { path: location.pathname, manualURL: helpURL ?? undefined },
            excerpts,
            manualBaseURL,
          }),
          startMetadata: {
            references: manualReferencesOf(excerpts ?? [], manualBaseURL),
          } satisfies AssistantMessageMetadata,
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

  const dashboardTurnView = (text: string, turn: DashboardTurn) => (
    <BAIFlex direction="column" align="stretch" gap="xxs">
      {text ? <Text size="sm">{text}</Text> : null}
      {turn.items.length === 0 ? (
        <Text size="sm" color="secondary">
          {t('webuiAssistant.DashboardNoProposal')}
        </Text>
      ) : (
        turn.items.map(({ action, text: line, isNoop }, index) => {
          // A hidden card is not on the board to point at.
          const target =
            dashboardAgent && action.type !== 'hide'
              ? actionTargetId(action)
              : undefined;
          return (
            <BAIFlex
              key={index}
              gap="xs"
              align="center"
              justify="between"
              onMouseEnter={() => dashboardAgent?.highlight(target ?? null)}
              onMouseLeave={() => dashboardAgent?.highlight(null)}
            >
              <Text size="sm" color={isNoop ? 'secondary' : undefined}>
                {`· ${line}${
                  isNoop ? ` (${t('webuiAssistant.DashboardAlreadyDone')})` : ''
                }`}
              </Text>
              {target ? (
                <IconButton
                  variant="ghost"
                  size="sm"
                  icon={<LocateFixed size="1em" />}
                  label={t('webuiAssistant.DashboardLocateCard')}
                  tooltip={t('webuiAssistant.DashboardLocateCard')}
                  onClick={() => dashboardAgent?.reveal(target)}
                />
              ) : null}
            </BAIFlex>
          );
        })
      )}
    </BAIFlex>
  );

  const messageItems = [
    ...messages.map((message, index) => {
      const isUser = message.role === 'user';
      const isMessageStreaming = isStreaming && index === messages.length - 1;
      const text = messageText(message);
      const { dashboard, notice, references } = metadataOf(message);
      if (notice) {
        return <ChatSystemMessage key={message.id}>{text}</ChatSystemMessage>;
      }
      return (
        <ChatMessage key={message.id} sender={isUser ? 'user' : 'assistant'}>
          <ChatMessageBubble>
            {isUser ? (
              text
            ) : dashboard ? (
              dashboardTurnView(text, dashboard)
            ) : isMessageStreaming && !text.trim() ? (
              // A reasoning model streams its reasoning first, which has nothing to show.
              thinking
            ) : (
              <ChatMessageContent isStreaming={isMessageStreaming}>
                {linkManualReferences(text, references ?? [])}
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

  // The same order as the empty state's text: a question first, then changes.
  const examples = [
    t('webuiAssistant.ExampleStartSession'),
    t('webuiAssistant.ExampleShareFolder'),
    ...(dashboardAgent ? dashboardExamplesOf(dashboardAgent.context, t) : []),
  ];
  const draft = dashboardAgent?.draft ?? [];
  const newBoard = draft.find((action) => action.type === 'createBoard');

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
            align="stretch"
            justify="center"
            gap="sm"
            style={{ flex: '1 1 0%' }}
          >
            <BAIFlex
              direction="column"
              align="center"
              gap="sm"
              style={{ textAlign: 'center' }}
            >
              <MessageCircleQuestion
                size={32}
                // A global rule sizes SVGs to 1em, so `size` alone stays at text size.
                style={{ fontSize: 32 }}
                color="var(--color-text-secondary)"
                aria-hidden
              />
              <Text color="secondary">
                {dashboardAgent
                  ? t('webuiAssistant.DashboardChatEmpty')
                  : t('webuiAssistant.EmptyState')}
              </Text>
            </BAIFlex>
            {/* A ReactNode label wraps; a Button would cut a sentence to one line. */}
            <List density="compact" hasDividers>
              {examples.map((example) => (
                <ListItem
                  key={example}
                  startContent={<CornerDownRight size="1em" aria-hidden />}
                  label={<Text size="sm">{example}</Text>}
                  align="first-line"
                  isDisabled={isStreaming}
                  onClick={() => sendMessage({ text: example })}
                />
              ))}
            </List>
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
        gap="sm"
        style={{
          flexShrink: 0,
          borderTop: '1px solid var(--color-border)',
          padding: 'var(--spacing-3) var(--spacing-4)',
        }}
      >
        {dashboardAgent && draft.length > 0 ? (
          <BAIFlex justify="between" align="center" gap="xs">
            <Text size="sm" color="secondary">
              {newBoard?.type === 'createBoard'
                ? t('webuiAssistant.DashboardPreviewingNewBoard', {
                    title: newBoard.title,
                    count: draft.length,
                  })
                : t('webuiAssistant.DashboardPreviewingCount', {
                    count: draft.length,
                  })}
            </Text>
            <BAIFlex gap="xs" style={{ flexShrink: 0 }}>
              <Button
                size="sm"
                variant="ghost"
                label={t('webuiAssistant.DiscardDashboardChanges')}
                onClick={dashboardAgent.discard}
              />
              <Button
                size="sm"
                variant="primary"
                label={t('webuiAssistant.ApplyDashboardChanges')}
                onClick={() => {
                  setMessages((current) => [
                    ...current,
                    {
                      id: generateId(),
                      role: 'assistant',
                      parts: [
                        {
                          type: 'text',
                          text: t('webuiAssistant.DashboardChangesSaved', {
                            count: draft.length,
                          }),
                        },
                      ],
                      metadata: {
                        notice: true,
                      } satisfies AssistantMessageMetadata,
                    },
                  ]);
                  dashboardAgent.apply();
                }}
              />
            </BAIFlex>
          </BAIFlex>
        ) : null}
        <ChatComposer
          density="compact"
          elevation="none"
          style={
            {
              '--radius-chat': 'var(--radius-container)',
            } as React.CSSProperties
          }
          placeholder={
            dashboardAgent
              ? t('webuiAssistant.DashboardPlaceholder')
              : t('webuiAssistant.Placeholder')
          }
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
