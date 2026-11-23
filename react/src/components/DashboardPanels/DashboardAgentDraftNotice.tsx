/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { Button } from '@lablup/ui-common/Button';
import { BAIAlert, BAIFlex } from 'backend.ai-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface DashboardAgentDraftNoticeProps {
  /** One line per previewed change. */
  changes: ReadonlyArray<string>;
  onApply: () => void;
  onDiscard: () => void;
}

/** Marks a preview `bai_prepare_dashboard` filled (ADR 0025); only the user applies it. */
const DashboardAgentDraftNotice: React.FC<DashboardAgentDraftNoticeProps> = ({
  changes,
  onApply,
  onDiscard,
}) => {
  'use memo';
  const { t } = useTranslation();
  const apply = t('webuiAssistant.ApplyDashboardChanges');
  return (
    <BAIAlert
      type="warning"
      title={t('dashboard.agentDraft.Title')}
      description={
        <BAIFlex direction="column" align="start" gap="xxs">
          {t('dashboard.agentDraft.Description', { apply })}
          <ul style={{ margin: 0, paddingInlineStart: 'var(--spacing-5)' }}>
            {changes.map((change, index) => (
              <li key={index}>{change}</li>
            ))}
          </ul>
        </BAIFlex>
      }
      action={
        <BAIFlex gap="xs">
          <Button
            size="sm"
            variant="ghost"
            label={t('webuiAssistant.DiscardDashboardChanges')}
            onClick={onDiscard}
          />
          <Button size="sm" variant="primary" label={apply} onClick={onApply} />
        </BAIFlex>
      }
      data-testid="dashboard-agent-draft-notice"
    />
  );
};

export default DashboardAgentDraftNotice;
