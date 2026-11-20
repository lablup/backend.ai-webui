/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { getAIErrorMessage } from '../Chat/ChatModel';
import { useWebUIAssistantModel } from '../WebUIAssistant/useWebUIAssistantModel';
import {
  actionTargetId,
  isNoopAction,
  type DashboardAssistantAction,
} from './assistantActions';
import {
  buildDashboardChatPrompt,
  parseDashboardChatReply,
  type DashboardChatContext,
} from './dashboardChat';
import { RANGE_LABEL_KEYS } from './panelSettings';
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
import type { ModelMessage } from 'ai';
import { BAIFlex } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { CornerDownRight, LocateFixed, Sparkles, X } from 'lucide-react';
import { useEffect, useEffectEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';

/** How many earlier messages a request carries; the board itself carries the state. */
const HISTORY_MESSAGES = 6;

interface ChatTurn {
  id: number;
  request: string;
  /** A note in the conversation (what Apply saved) instead of a request. */
  notice?: string;
  reply?: string;
  /** Every action the reply proposed, with the ones that changed nothing marked. */
  items?: Array<{ action: DashboardAssistantAction; isNoop: boolean }>;
  error?: string;
}

export interface DashboardAssistantChatProps extends DashboardChatContext {
  /** The proposal the board previews; every turn adds to it until Apply or Discard. */
  draft: ReadonlyArray<DashboardAssistantAction>;
  onDraftChange: (
    actions: ReadonlyArray<DashboardAssistantAction> | null,
  ) => void;
  onApply: (actions: ReadonlyArray<DashboardAssistantAction>) => void;
  onHighlight: (id: string | null) => void;
  onReveal: (id: string) => void;
  onClose: () => void;
}

/**
 * The edit sider's chat mode: each request asks the WebUI Assistant's model
 * for changes to the board, which previews them as a draft until Apply.
 */
const DashboardAssistantChat: React.FC<DashboardAssistantChatProps> = ({
  draft,
  onDraftChange,
  onApply,
  onHighlight,
  onReveal,
  onClose,
  ...ctx
}) => {
  'use memo';
  const { t } = useTranslation();
  const model = useWebUIAssistantModel();
  const [turns, setTurns] = useState<Array<ChatTurn>>([]);
  const [isAsking, setIsAsking] = useState(false);

  // Leaving edit mode or the chat unmounts it; the board must not keep the preview.
  const endPreview = useEffectEvent(() => {
    onHighlight(null);
    onDraftChange(null);
  });
  useEffect(() => () => endPreview(), []);

  const cardTitle = (id: string) =>
    ctx.cards.find((card) => card.id === id)?.title ??
    ctx.panels.find((panel) => panel.id === id)?.title ??
    id;

  const describe = (action: DashboardAssistantAction): string => {
    switch (action.type) {
      case 'reset':
        return t('webuiAssistant.DashboardReset');
      case 'createBoard':
        return t('webuiAssistant.DashboardCreateBoard', {
          title: action.title,
        });
      case 'addPanel':
        return t('webuiAssistant.DashboardAddPanel', {
          title: action.panel.title || t('webuiAssistant.DashboardNewPanel'),
        });
      case 'editPanel':
        return t('webuiAssistant.DashboardEditPanel', {
          title: action.input.title || cardTitle(action.id),
        });
      case 'show':
        return t('webuiAssistant.DashboardShowCard', {
          title: cardTitle(action.id),
        });
      case 'hide':
        return t('webuiAssistant.DashboardHideCard', {
          title: cardTitle(action.id),
        });
      case 'moveToTop':
        return t('webuiAssistant.DashboardMoveCardToTop', {
          title: cardTitle(action.id),
        });
      case 'moveToBottom':
        return t('webuiAssistant.DashboardMoveCardToBottom', {
          title: cardTitle(action.id),
        });
      case 'resize': {
        const card = ctx.cards.find((item) => item.id === action.id);
        return t('webuiAssistant.DashboardResizeCard', {
          title: cardTitle(action.id),
          columns: action.columnSpan ?? card?.columnSpan,
          rows: action.rowSpan ?? card?.rowSpan,
        });
      }
      case 'setRange':
        return t('webuiAssistant.DashboardSetCardRange', {
          title: cardTitle(action.id),
          range: t(RANGE_LABEL_KEYS[action.range]),
        });
    }
  };

  const historyOf = (previous: ReadonlyArray<ChatTurn>): Array<ModelMessage> =>
    previous
      .filter((turn) => !turn.notice)
      .flatMap((turn): Array<ModelMessage> => [
        { role: 'user', content: turn.request },
        {
          role: 'assistant',
          content: JSON.stringify({
            reply: turn.reply ?? turn.error ?? '',
            actions: (turn.items ?? [])
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
      ])
      .slice(-HISTORY_MESSAGES);

  const send = async (text: string) => {
    const request = text.trim();
    if (!request || isAsking) return;
    const id = (turns[turns.length - 1]?.id ?? 0) + 1;
    const previous = turns;
    setTurns([...previous, { id, request }]);
    setIsAsking(true);
    let result: ChatTurn;
    try {
      const answer = await model.complete({
        system: buildDashboardChatPrompt(ctx),
        messages: [...historyOf(previous), { role: 'user', content: request }],
      });
      const { reply, actions } = parseDashboardChatReply(answer, ctx);
      // One new board per chat: a second would drop what the first collected.
      const hasNewBoard = draft.some((action) => action.type === 'createBoard');
      const items = actions
        .filter((action) => !(hasNewBoard && action.type === 'createBoard'))
        .map((action) => ({ action, isNoop: isNoopAction(action, ctx.cards) }));
      const effective = items
        .filter((item) => !item.isNoop)
        .map((item) => item.action);
      if (effective.length) {
        onDraftChange([...draft, ...effective]);
        const target = effective.map(actionTargetId).find(Boolean);
        if (target) onReveal(target);
      }
      result = { id, request, reply, items };
    } catch (e) {
      result = { id, request, error: getAIErrorMessage(e) };
    }
    setTurns((current) =>
      current.map((turn) => (turn.id === id ? result : turn)),
    );
    setIsAsking(false);
  };

  const newBoard = draft.find((action) => action.type === 'createBoard');

  // Built from this board, so every example names something that exists here.
  const shownCards = ctx.cards.filter((card) => card.shown);
  const otherCards = ctx.cards.filter((card) => !card.shown);
  const boardCards = [...otherCards, ...shownCards].slice(0, 2);
  const examples = _.compact([
    // An empty board has nothing to hide, so it suggests showing a card instead.
    shownCards[0]
      ? t('webuiAssistant.DashboardChatExampleLayout', {
          title: shownCards[0].title,
        })
      : otherCards[0] &&
        t('webuiAssistant.DashboardChatExampleShow', {
          title: otherCards[0].title,
        }),
    ctx.sources.some((source) => source.key === 'session') &&
      t('webuiAssistant.DashboardChatExamplePanel'),
    ctx.canCreateBoard &&
      boardCards.length === 2 &&
      t('webuiAssistant.DashboardChatExampleBoard', {
        first: boardCards[0].title,
        second: boardCards[1].title,
      }),
  ]);

  return (
    <BAIFlex
      direction="column"
      align="stretch"
      gap="sm"
      style={{ flex: 1, minHeight: 0 }}
    >
      <BAIFlex
        justify="between"
        align="center"
        gap="xs"
        style={{ flexShrink: 0 }}
      >
        <BAIFlex gap="xs" align="center">
          <Sparkles size="1em" aria-hidden />
          <Text weight="semibold">{t('webuiAssistant.DashboardAskTitle')}</Text>
        </BAIFlex>
        <IconButton
          variant="ghost"
          size="sm"
          icon={<X size="1em" />}
          label={t('button.Close')}
          tooltip={t('button.Close')}
          onClick={onClose}
        />
      </BAIFlex>
      {!model.isAvailable ? (
        <Text color="secondary" size="sm">
          {t('webuiAssistant.DashboardChatOffline')}
        </Text>
      ) : null}
      {turns.length === 0 ? (
        <BAIFlex
          direction="column"
          align="stretch"
          justify="center"
          gap="sm"
          style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}
        >
          {/* The same empty state as the floating assistant's chat. */}
          <BAIFlex
            direction="column"
            align="center"
            gap="sm"
            style={{ textAlign: 'center' }}
          >
            <Sparkles
              size={32}
              // A global rule sizes SVGs to 1em, so `size` alone stays at text size.
              style={{ fontSize: 32 }}
              color="var(--color-text-secondary)"
              aria-hidden
            />
            <Text color="secondary">
              {t('webuiAssistant.DashboardChatEmpty')}
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
                isDisabled={!model.isAvailable || isAsking}
                onClick={() => void send(example)}
              />
            ))}
          </List>
        </BAIFlex>
      ) : (
        <BAIFlex
          direction="column"
          align="stretch"
          // Grows with the turns; at the sider's max height only this scrolls.
          style={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto' }}
        >
          <ChatMessageList density="compact" isStreaming={isAsking}>
            {turns.flatMap((turn) =>
              turn.notice
                ? [
                    <ChatSystemMessage key={`${turn.id}-n`}>
                      {turn.notice}
                    </ChatSystemMessage>,
                  ]
                : [
                    <ChatMessage key={`${turn.id}-q`} sender="user">
                      <ChatMessageBubble>{turn.request}</ChatMessageBubble>
                    </ChatMessage>,
                    <ChatMessage key={`${turn.id}-a`} sender="assistant">
                      <ChatMessageBubble>
                        {turn.error ? (
                          <Banner
                            status="error"
                            title={turn.error}
                            role="alert"
                          />
                        ) : !turn.items ? (
                          <BAIFlex gap="xs">
                            <Spinner size="sm" />
                            <Text color="secondary">
                              {t('chatui.Thinking')}
                            </Text>
                          </BAIFlex>
                        ) : (
                          <BAIFlex direction="column" align="stretch" gap="xxs">
                            {turn.reply ? (
                              <Text size="sm">{turn.reply}</Text>
                            ) : null}
                            {turn.items.length === 0 ? (
                              <Text size="sm" color="secondary">
                                {t('webuiAssistant.DashboardNoProposal')}
                              </Text>
                            ) : (
                              turn.items.map(({ action, isNoop }, index) => {
                                const target =
                                  action.type === 'hide'
                                    ? undefined
                                    : actionTargetId(action);
                                return (
                                  <BAIFlex
                                    key={index}
                                    gap="xs"
                                    align="center"
                                    justify="between"
                                    onMouseEnter={() =>
                                      onHighlight(target ?? null)
                                    }
                                    onMouseLeave={() => onHighlight(null)}
                                  >
                                    <Text
                                      size="sm"
                                      color={isNoop ? 'secondary' : undefined}
                                    >
                                      {`· ${describe(action)}${
                                        isNoop
                                          ? ` (${t('webuiAssistant.DashboardAlreadyDone')})`
                                          : ''
                                      }`}
                                    </Text>
                                    {target ? (
                                      <IconButton
                                        variant="ghost"
                                        size="sm"
                                        icon={<LocateFixed size="1em" />}
                                        label={t(
                                          'webuiAssistant.DashboardLocateCard',
                                        )}
                                        tooltip={t(
                                          'webuiAssistant.DashboardLocateCard',
                                        )}
                                        onClick={() => onReveal(target)}
                                      />
                                    ) : null}
                                  </BAIFlex>
                                );
                              })
                            )}
                          </BAIFlex>
                        )}
                      </ChatMessageBubble>
                    </ChatMessage>,
                  ],
            )}
          </ChatMessageList>
        </BAIFlex>
      )}
      {draft.length > 0 ? (
        <BAIFlex
          direction="column"
          align="stretch"
          gap="xs"
          style={{ flexShrink: 0 }}
        >
          <Text size="sm" color="secondary">
            {newBoard
              ? t('webuiAssistant.DashboardPreviewingNewBoard', {
                  title: newBoard.title,
                  count: draft.length,
                })
              : t('webuiAssistant.DashboardPreviewingCount', {
                  count: draft.length,
                })}
          </Text>
          <BAIFlex justify="end" gap="xs">
            <Button
              size="sm"
              variant="ghost"
              label={t('webuiAssistant.DiscardDashboardChanges')}
              onClick={() => {
                onHighlight(null);
                onDraftChange(null);
              }}
            />
            <Button
              size="sm"
              variant="primary"
              label={t('webuiAssistant.ApplyDashboardChanges')}
              onClick={() => {
                onHighlight(null);
                setTurns((current) => [
                  ...current,
                  {
                    id: (current[current.length - 1]?.id ?? 0) + 1,
                    request: '',
                    notice: t('webuiAssistant.DashboardChangesSaved', {
                      count: draft.length,
                    }),
                  },
                ]);
                onApply(draft);
              }}
            />
          </BAIFlex>
        </BAIFlex>
      ) : null}
      {/* A fixed-height sider squeezes what may shrink; the composer must stay. */}
      <BAIFlex direction="column" align="stretch" style={{ flexShrink: 0 }}>
        <ChatComposer
          density="compact"
          elevation="none"
          style={
            {
              '--radius-chat': 'var(--radius-container)',
            } as React.CSSProperties
          }
          placeholder={t('webuiAssistant.DashboardAskPlaceholder')}
          isStopShown={false}
          onSubmit={(value) => void send(value)}
          input={
            <ChatComposerInput
              label={t('webuiAssistant.DashboardAskTitle')}
              hasHistory={false}
              pasteAsToken={false}
            />
          }
        />
      </BAIFlex>
    </BAIFlex>
  );
};

export default DashboardAssistantChat;
