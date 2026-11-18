/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type {
  DashboardAssistantAction,
  DashboardAssistantCard,
} from '../DashboardPanels/assistantActions';
import { RANGE_LABEL_KEYS } from '../DashboardPanels/panelSettings';
import { Button } from '@lablup/ui-common/Button';
import { Text } from '@lablup/ui-common/Text';
import { BAIFlex } from 'backend.ai-ui';
import { Check, LayoutDashboard } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface WebUIAssistantDashboardProposalProps {
  actions: ReadonlyArray<DashboardAssistantAction>;
  cards: ReadonlyArray<DashboardAssistantCard>;
  isApplied: boolean;
  onApply: () => void;
}

/** The dashboard changes an assistant reply proposes, applied only on the user's click. */
const WebUIAssistantDashboardProposal: React.FC<
  WebUIAssistantDashboardProposalProps
> = ({ actions, cards, isApplied, onApply }) => {
  'use memo';
  const { t } = useTranslation();
  const cardOf = (id: string) => cards.find((card) => card.id === id);

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
      <ul style={{ margin: 0, paddingInlineStart: 'var(--spacing-5)' }}>
        {actions.map((action, index) => (
          <li key={index}>
            <Text>{describe(action)}</Text>
          </li>
        ))}
      </ul>
      <BAIFlex justify="end">
        {isApplied ? (
          <BAIFlex gap="xs" align="center">
            <Check size="1em" aria-hidden />
            <Text color="secondary">
              {t('webuiAssistant.DashboardChangesApplied')}
            </Text>
          </BAIFlex>
        ) : (
          <Button
            variant="primary"
            size="sm"
            label={t('webuiAssistant.ApplyDashboardChanges')}
            onClick={onApply}
          />
        )}
      </BAIFlex>
    </BAIFlex>
  );
};

export default WebUIAssistantDashboardProposal;
