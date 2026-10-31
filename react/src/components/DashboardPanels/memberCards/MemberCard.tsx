/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import PanelFrame from '../PanelFrame';
import PanelSettingsHeaderControls, {
  PanelHeaderSettingsContext,
} from '../PanelSettingsHeaderControls';
import type { DashboardScope } from '../types';
import { Heading } from '@lablup/ui-common/Heading';
import { Text } from '@lablup/ui-common/Text';
import { BAIBoardItemErrorBoundary, BAIFlex, BAISkeleton } from 'backend.ai-ui';
import React, { Suspense, use } from 'react';
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
  /** Values besides the fetch key whose change retries a failed card, such as its resource group. */
  resetKeys?: Array<unknown>;
  /** The card body, given the card's fetch key. */
  children: (fetchKey: string) => React.ReactNode;
}

/** A member card: the title stays up while the body loads or fails. */
const MemberCard: React.FC<MemberCardProps> = ({
  title,
  tooltip,
  extra,
  fetchKey,
  resetKeys = [],
  children,
}) => {
  'use memo';
  const headerSettings = use(PanelHeaderSettingsContext);
  return (
    <BAIBoardItemErrorBoundary
      // The failed state keeps the header picks, so a pick that broke the card can be undone.
      title={
        headerSettings ? (
          <BAIFlex align="center" gap="xs" wrap="wrap">
            <Heading level={5}>{title}</Heading>
            <PanelSettingsHeaderControls />
          </BAIFlex>
        ) : (
          title
        )
      }
      status="error"
      resetKeys={[
        fetchKey,
        JSON.stringify(headerSettings?.effective ?? null),
        ...resetKeys,
      ]}
    >
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
