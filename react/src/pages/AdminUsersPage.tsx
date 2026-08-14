/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import AdminUserCredentialList from '../components/AdminUserCredentialList';
import AdminUserManagement from '../components/AdminUserManagement';
import BAIErrorBoundary from '../components/BAIErrorBoundary';
import { useTabQuerySnapshot } from '../hooks';
import { BAISkeleton } from 'backend.ai-ui';
// The tab-list item shape now comes from `BAICard` itself (`BAICardTabItem`,
// restated in BUI when the card stopped being antd's) instead of the deep
// `antd/es/card` subpath the frontier note used to point at (P15).
import { BAIFlex, BAICard, type BAICardTabItem } from 'backend.ai-ui';
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

  const tabItems: BAICardTabItem[] = [
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
      <Suspense fallback={<BAISkeleton />}>
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
