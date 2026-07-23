/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import AdminUserCredentialList from '../components/AdminUserCredentialList';
import AdminUserManagement from '../components/AdminUserManagement';
import BAIErrorBoundary from '../components/BAIErrorBoundary';
import { useTabQuerySnapshot } from '../hooks';
import { Skeleton } from 'antd';
import { CardTabListType } from 'antd/es/card';
import { BAIFlex, BAICard } from 'backend.ai-ui';
import { parseAsStringLiteral } from 'nuqs';
import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';

const tabParser = parseAsStringLiteral(['users', 'credentials']).withDefault(
  'users',
);

const AdminUsersPage: React.FC = () => {
  'use memo';
  const { t } = useTranslation();
  const { currentTab, onTabChange } = useTabQuerySnapshot(tabParser);

  const tabItems: CardTabListType[] = [
    {
      key: 'users',
      label: t('credential.Users'),
    },
    {
      key: 'credentials',
      label: t('credential.Credentials'),
    },
  ];

  return (
    <BAICard
      activeTabKey={currentTab}
      onTabChange={onTabChange}
      tabList={tabItems}
    >
      <Suspense fallback={<Skeleton active />}>
        {currentTab === 'users' && (
          <BAIErrorBoundary>
            <BAIFlex direction="column" align="stretch">
              <AdminUserManagement />
            </BAIFlex>
          </BAIErrorBoundary>
        )}
        {currentTab === 'credentials' && (
          <BAIErrorBoundary>
            <BAIFlex direction="column" align="stretch">
              <AdminUserCredentialList />
            </BAIFlex>
          </BAIErrorBoundary>
        )}
      </Suspense>
    </BAICard>
  );
};

export default AdminUsersPage;
