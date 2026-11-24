/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import './DashboardDraftConfirmBar.css';
import { Button } from '@lablup/ui-common/Button';
import { Text } from '@lablup/ui-common/Text';
import { BAIFlex } from 'backend.ai-ui';
import { Sparkles } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface DashboardDraftConfirmBarProps {
  count: number;
  /** Set when the preview starts a new board. */
  newBoardTitle?: string;
  onApply: () => void;
  onDiscard: () => void;
}

/** Applies or discards an AI-proposed dashboard preview; sits beside the assistant button. */
const DashboardDraftConfirmBar: React.FC<DashboardDraftConfirmBarProps> = ({
  count,
  newBoardTitle,
  onApply,
  onDiscard,
}) => {
  'use memo';
  const { t } = useTranslation();
  return (
    <BAIFlex
      align="center"
      gap="sm"
      className="dashboard-draft-confirm-bar"
      role="region"
      aria-label={t('dashboard.agentDraft.Title')}
      data-testid="dashboard-draft-confirm-bar"
      // BAIFlex's inline `position` and `minHeight` would beat the class.
      style={{
        position: 'fixed',
        minHeight: 'var(--webui-assistant-fab-size, 48px)',
      }}
    >
      <Sparkles size="1.1em" aria-hidden color="var(--color-accent)" />
      <Text size="sm" maxLines={1}>
        {newBoardTitle
          ? t('webuiAssistant.DashboardPreviewingNewBoard', {
              title: newBoardTitle,
              count,
            })
          : t('webuiAssistant.DashboardPreviewingCount', { count })}
      </Text>
      <Button
        size="sm"
        variant="primary"
        label={t('webuiAssistant.ApplyDashboardChanges')}
        onClick={onApply}
      />
      <Button
        size="sm"
        variant="ghost"
        label={t('webuiAssistant.DiscardDashboardChanges')}
        onClick={onDiscard}
      />
    </BAIFlex>
  );
};

export default DashboardDraftConfirmBar;
