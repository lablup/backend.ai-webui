/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import PanelFrame from '../PanelFrame';
import type { DashboardScope } from '../types';
import { Text } from '@lablup/ui-common/Text';
import { BAIBoardItemErrorBoundary, BAISkeleton } from 'backend.ai-ui';
import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';

/** The member page's project; member cards render nothing without one. */
export const mineProjectId = (scope: DashboardScope): string | null =>
  scope.kind === 'mine' ? scope.projectId : null;

export interface MemberCardProps {
  title: string;
  tooltip?: React.ReactNode;
  extra?: React.ReactNode;
  /** The card's fetch key from the dashboard timer. */
  fetchKey: string;
  /** The card body, given the card's fetch key. */
  children: (fetchKey: string) => React.ReactNode;
}

/** A member card: the title stays up while the body loads or fails. */
const MemberCard: React.FC<MemberCardProps> = ({
  title,
  tooltip,
  extra,
  fetchKey,
  children,
}) => {
  'use memo';
  return (
    <BAIBoardItemErrorBoundary title={title} status="error">
      <PanelFrame title={title} tooltip={tooltip} extra={extra}>
        <Suspense fallback={<BAISkeleton />}>{children(fetchKey)}</Suspense>
      </PanelFrame>
    </BAIBoardItemErrorBoundary>
  );
};

/** Shown in a member card's body when the page has no project. */
export const NoProjectText: React.FC = () => {
  'use memo';
  const { t } = useTranslation();
  return <Text type="supporting">{t('dashboard.card.NoProject')}</Text>;
};

export default MemberCard;
