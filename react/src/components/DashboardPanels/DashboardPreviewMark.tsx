/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import './DashboardPreviewMark.css';
import type { PreviewChange, PreviewMark } from './previewMarks';
import { Badge } from '@lablup/ui-common/Badge';
import React from 'react';
import { useTranslation } from 'react-i18next';

const CHANGE_LABEL_KEYS: Record<PreviewChange, string> = {
  moved: 'dashboard.agentDraft.ChangeMoved',
  resized: 'dashboard.agentDraft.ChangeResized',
  range: 'dashboard.agentDraft.ChangeRange',
  edited: 'dashboard.agentDraft.ChangeEdited',
};

/** Outlines a card a preview changes and labels how; a card to be hidden is dimmed in place. */
const DashboardPreviewMark: React.FC<{
  mark: PreviewMark;
  children: React.ReactNode;
}> = ({ mark, children }) => {
  'use memo';
  const { t } = useTranslation();
  const label =
    mark.kind === 'added'
      ? t('dashboard.agentDraft.Added')
      : mark.kind === 'hidden'
        ? t('dashboard.agentDraft.WillBeHidden')
        : t('dashboard.agentDraft.Changed', {
            changes: mark.changes
              .map((change) => t(CHANGE_LABEL_KEYS[change]))
              .join(', '),
          });
  return (
    <div
      className={`dashboard-preview-mark dashboard-preview-mark--${mark.kind}`}
      data-testid={`dashboard-preview-mark-${mark.kind}`}
    >
      <span className="dashboard-preview-mark__badge">
        <Badge
          variant={
            mark.kind === 'added'
              ? 'green'
              : mark.kind === 'changed'
                ? 'blue'
                : 'neutral'
          }
          label={label}
        />
      </span>
      <div className="dashboard-preview-mark__content">{children}</div>
    </div>
  );
};

export default DashboardPreviewMark;
