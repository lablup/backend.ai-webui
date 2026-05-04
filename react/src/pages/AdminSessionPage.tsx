/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { Skeleton } from 'antd';
import { BAICard, filterOutEmpty } from 'backend.ai-ui';
import { parseAsString, useQueryStates } from 'nuqs';
import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import BAIErrorBoundary from 'src/components/BAIErrorBoundary';
import PendingSessionNodeList from 'src/components/PendingSessionNodeList';
import SessionDetailAndContainerLogOpenerLegacy from 'src/components/SessionDetailAndContainerLogOpenerLegacy';
import { useWebUINavigate } from 'src/hooks';

const AdminComputeSessionListPage = React.lazy(
  () => import('./AdminComputeSessionListPage'),
);

const AdminSessionPage: React.FC = () => {
  'use memo';

  const { t } = useTranslation();
  const [queryParam, setQueryParam] = useQueryStates(
    {
      tab: parseAsString.withDefault('compute-sessions'),
    },
    { history: 'push' },
  );
  const webUINavigate = useWebUINavigate();

  return (
    <>
      <BAICard
        activeTabKey={queryParam.tab}
        onTabChange={(key) => {
          webUINavigate({
            pathname: '/admin-session',
            search: new URLSearchParams({
              tab: key,
            }).toString(),
          });
          setQueryParam({ tab: key });
        }}
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
          {queryParam.tab === 'compute-sessions' && (
            <BAIErrorBoundary>
              <AdminComputeSessionListPage />
            </BAIErrorBoundary>
          )}
          {queryParam.tab === 'pending-sessions' && (
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
