/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import BAIErrorBoundary from '../components/BAIErrorBoundary';
import PendingSessionNodeList from '../components/PendingSessionNodeList';
import SessionDetailAndContainerLogOpenerLegacy from '../components/SessionDetailAndContainerLogOpenerLegacy';
import { useTabQuerySnapshot } from '../hooks';
import { Skeleton } from 'antd';
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
        <Suspense fallback={<Skeleton active />}>
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
      <SessionDetailAndContainerLogOpenerLegacy />
    </>
  );
};

export default AdminSessionPage;
