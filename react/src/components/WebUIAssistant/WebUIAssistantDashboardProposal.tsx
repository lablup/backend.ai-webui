/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  isNoopAction,
  type DashboardAssistantAction,
  type DashboardAssistantCard,
} from '../DashboardPanels/assistantActions';
import { RANGE_LABEL_KEYS } from '../DashboardPanels/panelSettings';
import { Button } from '@lablup/ui-common/Button';
import { IconButton } from '@lablup/ui-common/IconButton';
import { Text } from '@lablup/ui-common/Text';
import { BAIFlex } from 'backend.ai-ui';
import { Check, LayoutDashboard, LocateFixed } from 'lucide-react';
import { useEffect, useEffectEvent } from 'react';
import { useTranslation } from 'react-i18next';

interface WebUIAssistantDashboardProposalProps {
  actions: ReadonlyArray<DashboardAssistantAction>;
  cards: ReadonlyArray<DashboardAssistantCard>;
  isApplied: boolean;
  /** Applies the actions that would change the board. */
  onApply: (actions: ReadonlyArray<DashboardAssistantAction>) => void;
  /** Outlines the card an item points at while it is hovered. */
  onHighlight: (id: string | null) => void;
  onReveal: (id: string) => void;
}

/** The dashboard changes an assistant reply proposes, applied only on the user's click. */
const WebUIAssistantDashboardProposal: React.FC<
  WebUIAssistantDashboardProposalProps
> = ({ actions, cards, isApplied, onApply, onHighlight, onReveal }) => {
  'use memo';
  const { t } = useTranslation();
  const cardOf = (id: string) => cards.find((card) => card.id === id);
  // A closing panel fires no mouseleave, so drop the outline on unmount.
  const clearHighlight = useEffectEvent(() => onHighlight(null));
  useEffect(() => () => clearHighlight(), []);
  // After Apply the board already matches, so every item would read as a no-op.
  const items = actions.map((action) => ({
    action,
    isNoop: !isApplied && isNoopAction(action, cards),
    cardId: action.type === 'reset' ? undefined : action.id,
  }));
  const effective = items
    .filter((item) => !item.isNoop)
    .map((item) => item.action);

  const describe = (action: DashboardAssistantAction): string => {
    if (action.type === 'reset') return t('webuiAssistant.DashboardReset');
    const card = cardOf(action.id);
    const title = card?.title ?? action.id;
    switch (action.type) {
      case 'show':
        return t('webuiAssistant.DashboardShowCard', { title });
      case 'hide':
        return t('webuiAssistant.DashboardHideCard', { title });
      case 'moveToTop':
        return t('webuiAssistant.DashboardMoveCardToTop', { title });
      case 'moveToBottom':
        return t('webuiAssistant.DashboardMoveCardToBottom', { title });
      case 'resize':
        return t('webuiAssistant.DashboardResizeCard', {
          title,
          columns: action.columnSpan ?? card?.columnSpan,
          rows: action.rowSpan ?? card?.rowSpan,
        });
      case 'setRange':
        return t('webuiAssistant.DashboardSetCardRange', {
          title,
          range: t(RANGE_LABEL_KEYS[action.range]),
        });
    }
  };

  return (
    <BAIFlex
      direction="column"
      align="stretch"
      gap="xs"
      style={{
        marginTop: 'var(--spacing-2)',
        paddingTop: 'var(--spacing-2)',
        borderTop: '1px solid var(--color-border)',
      }}
    >
      <BAIFlex gap="xs" align="center">
        <LayoutDashboard size="1em" aria-hidden />
        <Text weight="semibold">{t('webuiAssistant.DashboardChanges')}</Text>
      </BAIFlex>
      <ul
        style={{
          margin: 0,
          paddingInlineStart: 'var(--spacing-5)',
          listStyle: 'disc',
        }}
      >
        {items.map(({ action, isNoop, cardId }, index) => {
          const isOnBoard = !!cardId && !!cardOf(cardId)?.shown;
          return (
            <li
              key={index}
              onMouseEnter={() => onHighlight(isOnBoard ? cardId! : null)}
              onMouseLeave={() => onHighlight(null)}
            >
              <BAIFlex gap="xs" align="center" justify="between">
                <Text color={isNoop ? 'secondary' : undefined}>
                  {describe(action)}
                  {isNoop
                    ? ` (${t('webuiAssistant.DashboardAlreadyDone')})`
                    : ''}
                </Text>
                {isOnBoard ? (
                  <IconButton
                    variant="ghost"
                    size="sm"
                    icon={<LocateFixed size="1em" />}
                    label={t('webuiAssistant.DashboardLocateCard')}
                    tooltip={t('webuiAssistant.DashboardLocateCard')}
                    onClick={() => onReveal(cardId!)}
                  />
                ) : null}
              </BAIFlex>
            </li>
          );
        })}
      </ul>
      <BAIFlex justify="end">
        {isApplied ? (
          <BAIFlex gap="xs" align="center">
            <Check size="1em" aria-hidden />
            <Text color="secondary">
              {t('webuiAssistant.DashboardChangesApplied')}
            </Text>
          </BAIFlex>
        ) : effective.length === 0 ? (
          <Text color="secondary">
            {t('webuiAssistant.DashboardNothingToChange')}
          </Text>
        ) : (
          <Button
            variant="primary"
            size="sm"
            label={t('webuiAssistant.ApplyDashboardChanges')}
            onClick={() => {
              onHighlight(null);
              onApply(effective);
            }}
          />
        )}
      </BAIFlex>
    </BAIFlex>
  );
};

export default WebUIAssistantDashboardProposal;
