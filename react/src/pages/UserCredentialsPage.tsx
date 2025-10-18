import FlexActivityIndicator from '../components/FlexActivityIndicator';
import UserCredentialList from '../components/UserCredentialList';
import UserNodeList from '../components/UserNodeList';
import { CardTabListType } from 'antd/es/card';
import { BAIFlex, BAICard } from 'backend.ai-ui';
import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';

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
          search: new URLSearchParams({ tab: key }).toString(),
        })
      }
      tabList={tabItems}
    >
      <Suspense
        fallback={
          <FlexActivityIndicator
            style={{ height: 'calc(100vh - 145px)' }}
            spinSize="large"
          />
        }
      >
        {currentTab === 'users' && (
          <BAIFlex direction="column" align="stretch">
            <UserNodeList />
          </BAIFlex>
        )}
        {currentTab === 'credentials' && (
          <BAIFlex direction="column" align="stretch">
            <UserCredentialList />
          </BAIFlex>
        )}
      </Suspense>
    </BAICard>
  );
};

export default UserCredentialsPage;
