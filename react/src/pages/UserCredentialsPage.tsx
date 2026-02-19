/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import UserCredentialList from '../components/UserCredentialList';
import UserManagement from '../components/UserManagement';
import { Skeleton } from 'antd';
import { CardTabListType } from 'antd/es/card';
import { BAIFlex, BAICard } from 'backend.ai-ui';
import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import BAIErrorBoundary from 'src/components/BAIErrorBoundary';

const UserCredentialsPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'users';
  const navigate = useNavigate();
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
      onTabChange={(key) =>
        navigate({
          pathname: '/credential',
          search: `?tab=${key}`,
        })
      }
      tabList={tabItems}
    >
      <Suspense fallback={<Skeleton active />}>
        {currentTab === 'users' && (
          <BAIErrorBoundary>
            <BAIFlex direction="column" align="stretch">
              <UserManagement />
            </BAIFlex>
          </BAIErrorBoundary>
        )}
        {currentTab === 'credentials' && (
          <BAIErrorBoundary>
            <BAIFlex direction="column" align="stretch">
              <UserCredentialList />
            </BAIFlex>
          </BAIErrorBoundary>
        )}
      </Suspense>
    </BAICard>
  );
};

export default UserCredentialsPage;
