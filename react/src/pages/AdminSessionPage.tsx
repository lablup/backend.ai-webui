/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import BAIErrorBoundary from '../components/BAIErrorBoundary';
import PendingSessionNodeList from '../components/PendingSessionNodeList';
import SessionDetailAndContainerLogOpenerLegacy from '../components/SessionDetailAndContainerLogOpenerLegacy';
import BAISkeletonAstryx from '../components/astryx-bui/BAISkeletonAstryx';
import { useTabQuerySnapshot } from '../hooks';
import { BAICard, filterOutEmpty } from 'backend.ai-ui';
import { parseAsStringLiteral } from 'nuqs';
import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';

const AdminComputeSessionListPage = React.lazy(
  () => import('./AdminComputeSessionListPage'),
);

const tabParser = parseAsStringLiteral([
  'compute-sessions',
  'pending-sessions',
]).withDefault('compute-sessions');

const AdminSessionPage: React.FC = () => {
  'use memo';

  const { t } = useTranslation();
  const { currentTab, onTabChange } = useTabQuerySnapshot(tabParser);

  return (
    <>
      <BAICard
        activeTabKey={currentTab}
        onTabChange={onTabChange}
        tabList={filterOutEmpty([
          {
            key: 'compute-sessions',
            label: t('webui.menu.Sessions'),
          },
          {
            key: 'pending-sessions',
            label: t('adminSession.PendingSessions'),
          },
        ])}
      >
        <Suspense fallback={<BAISkeletonAstryx />}>
          {currentTab === 'compute-sessions' && (
            <BAIErrorBoundary>
              <AdminComputeSessionListPage />
            </BAIErrorBoundary>
          )}
          {currentTab === 'pending-sessions' && (
            <BAIErrorBoundary>
              <PendingSessionNodeList />
            </BAIErrorBoundary>
          )}
        </Suspense>
      </BAICard>
      {/* Super-admin page (ADR-0001, FR-3413): no ambient project context —
          the session-detail drawer (also opened from the pending-sessions
          tab) renders without a project-mismatch alert. */}
      <SessionDetailAndContainerLogOpenerLegacy project={null} />
    </>
  );
};

export default AdminSessionPage;
