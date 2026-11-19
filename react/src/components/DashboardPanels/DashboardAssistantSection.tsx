/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { getAIErrorMessage } from '../Chat/ChatModel';
import { useWebUIAssistantModel } from '../WebUIAssistant/useWebUIAssistantModel';
import {
  buildDashboardEditPrompt,
  isNoopAction,
  parseDashboardActions,
  type DashboardAssistantAction,
  type DashboardAssistantCard,
} from './assistantActions';
import { RANGE_LABEL_KEYS } from './panelSettings';
import type { PanelPage } from './types';
import { Banner } from '@lablup/ui-common/Banner';
import { Button } from '@lablup/ui-common/Button';
import { IconButton } from '@lablup/ui-common/IconButton';
import { Text } from '@lablup/ui-common/Text';
import { BAIFlex, BAITextInput } from 'backend.ai-ui';
import { LocateFixed, Sparkles } from 'lucide-react';
import { useEffect, useEffectEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface DashboardAssistantSectionProps {
  page: PanelPage;
  /** The saved board's cards; a proposal is checked against them. */
  cards: ReadonlyArray<DashboardAssistantCard>;
  /** Shows a proposal on the board without saving it; `null` ends the preview. */
  onPreview: (actions: ReadonlyArray<DashboardAssistantAction> | null) => void;
  onApply: (actions: ReadonlyArray<DashboardAssistantAction>) => void;
  /** Outlines a card on the board, or clears the outline with `null`. */
  onHighlight: (id: string | null) => void;
  onReveal: (id: string) => void;
}

/**
 * The edit sider's natural-language input: the WebUI Assistant's model turns a
 * request into dashboard actions, the board previews them, and nothing is saved
 * until Apply. Renders nothing while the assistant is off or not connected.
 */
const DashboardAssistantSection: React.FC<DashboardAssistantSectionProps> = ({
  page,
  cards,
  onPreview,
  onApply,
  onHighlight,
  onReveal,
}) => {
  'use memo';
  const { t } = useTranslation();
  const model = useWebUIAssistantModel();
  const [request, setRequest] = useState('');
  const [proposal, setProposal] =
    useState<ReadonlyArray<DashboardAssistantAction> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAsking, setIsAsking] = useState(false);

  // Leaving edit mode unmounts the sider; the board must not keep the preview.
  const endPreview = useEffectEvent(() => {
    onHighlight(null);
    onPreview(null);
  });
  useEffect(() => () => endPreview(), []);

  if (!model.isAvailable) return null;

  const cardOf = (id: string) => cards.find((card) => card.id === id);
  const items = (proposal ?? []).map((action) => ({
    action,
    isNoop: isNoopAction(action, cards),
  }));
  const effective = items
    .filter((item) => !item.isNoop)
    .map((item) => item.action);

  const close = () => {
    setProposal(null);
    onHighlight(null);
    onPreview(null);
  };

  const ask = async () => {
    const text = request.trim();
    if (!text || isAsking) return;
    setError(null);
    close();
    setIsAsking(true);
    try {
      const reply = await model.complete({
        system: buildDashboardEditPrompt({ page, cards }),
        prompt: text,
      });
      const actions = parseDashboardActions(reply, cards);
      setProposal(actions);
      const next = actions.filter((action) => !isNoopAction(action, cards));
      onPreview(next.length ? next : null);
    } catch (e) {
      setError(getAIErrorMessage(e));
    } finally {
      setIsAsking(false);
    }
  };

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
    <BAIFlex direction="column" align="stretch" gap="xs">
      <BAIFlex gap="xs" align="center">
        <Sparkles size="1em" aria-hidden />
        <Text weight="semibold">{t('webuiAssistant.DashboardAskTitle')}</Text>
      </BAIFlex>
      <BAITextInput
        size="sm"
        value={request}
        onChange={(value) => setRequest(value)}
        placeholder={t('webuiAssistant.DashboardAskPlaceholder')}
        aria-label={t('webuiAssistant.DashboardAskTitle')}
        onEnter={() => void ask()}
      />
      <BAIFlex justify="end">
        <Button
          size="sm"
          label={t('webuiAssistant.DashboardAsk')}
          isDisabled={!request.trim()}
          isLoading={isAsking}
          onClick={() => void ask()}
        />
      </BAIFlex>
      {error ? <Banner status="error" title={error} role="alert" /> : null}
      {proposal && proposal.length === 0 ? (
        <Text color="secondary" size="sm">
          {t('webuiAssistant.DashboardNoProposal')}
        </Text>
      ) : null}
      {proposal && proposal.length > 0 ? (
        <BAIFlex direction="column" align="stretch" gap="xs">
          <Text size="sm" color="secondary">
            {effective.length
              ? t('webuiAssistant.DashboardPreviewing')
              : t('webuiAssistant.DashboardNothingToChange')}
          </Text>
          <ul
            style={{
              margin: 0,
              paddingInlineStart: 'var(--spacing-5)',
              listStyle: 'disc',
            }}
          >
            {items.map(({ action, isNoop }, index) => {
              const cardId = action.type === 'reset' ? undefined : action.id;
              const canLocate = !!cardId && action.type !== 'hide';
              return (
                <li
                  key={index}
                  onMouseEnter={() => onHighlight(canLocate ? cardId! : null)}
                  onMouseLeave={() => onHighlight(null)}
                >
                  <BAIFlex gap="xs" align="center" justify="between">
                    <Text size="sm" color={isNoop ? 'secondary' : undefined}>
                      {describe(action)}
                      {isNoop
                        ? ` (${t('webuiAssistant.DashboardAlreadyDone')})`
                        : ''}
                    </Text>
                    {canLocate ? (
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
          <BAIFlex justify="end" gap="xs">
            <Button
              size="sm"
              variant="ghost"
              label={t('webuiAssistant.DiscardDashboardChanges')}
              onClick={close}
            />
            {effective.length ? (
              <Button
                size="sm"
                variant="primary"
                label={t('webuiAssistant.ApplyDashboardChanges')}
                onClick={() => {
                  onHighlight(null);
                  onApply(effective);
                  setProposal(null);
                  setRequest('');
                }}
              />
            ) : null}
          </BAIFlex>
        </BAIFlex>
      ) : null}
    </BAIFlex>
  );
};

export default DashboardAssistantSection;
