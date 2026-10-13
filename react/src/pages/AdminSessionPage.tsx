/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import BAIErrorBoundary from '../components/BAIErrorBoundary';
import PendingSessionNodeList from '../components/PendingSessionNodeList';
import SessionDetailAndContainerLogOpenerLegacy from '../components/SessionDetailAndContainerLogOpenerLegacy';
import { useSuspendedBackendaiClient, useTabQuerySnapshot } from '../hooks';
import { BAISkeleton, BAICard, filterOutEmpty } from 'backend.ai-ui';
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
  // TODO(needs-backend): session_pending_queue admits superadmins only until the backend
  // reworks the pending queue query (#10300).
  const isSuperAdmin = useSuspendedBackendaiClient().is_superadmin;
  const activeTab = isSuperAdmin ? currentTab : 'compute-sessions';

  return (
    <>
      <BAICard
        activeTabKey={activeTab}
        onTabChange={onTabChange}
        tabList={filterOutEmpty([
          {
            key: 'compute-sessions',
            label: t('webui.menu.Sessions'),
          },
          isSuperAdmin && {
            key: 'pending-sessions',
            label: t('adminSession.PendingSessions'),
          },
        ])}
      >
        <Suspense fallback={<BAISkeleton />}>
          {activeTab === 'compute-sessions' && (
            <BAIErrorBoundary>
              <AdminComputeSessionListPage />
            </BAIErrorBoundary>
          )}
          {activeTab === 'pending-sessions' && (
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
