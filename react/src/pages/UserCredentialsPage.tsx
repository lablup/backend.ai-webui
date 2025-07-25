import Flex from '../components/Flex';
import FlexActivityIndicator from '../components/FlexActivityIndicator';
import UserCredentialList from '../components/UserCredentialList';
import UserNodeList from '../components/UserNodeList';
import { theme } from 'antd';
import { createStyles } from 'antd-style';
import { CardTabListType } from 'antd/es/card';
import { BAICard } from 'backend.ai-ui';
import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';

const useStyles = createStyles(({ css }) => ({
  card: css`
    .ant-card-body {
      padding: 0;
    }
  `,
}));

const UserCredentialsPage: React.FC = () => {
  const { t } = useTranslation();
  const { styles } = useStyles();
  const { token } = theme.useToken();
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
      showDivider
      className={styles.card}
      activeTabKey={currentTab}
      onTabChange={(key) =>
        navigate({
          pathname: '/credential',
          search: `?tab=${key}`,
        })
      }
      tabList={tabItems}
      styles={{
        body: {
          padding: `${token.paddingSM}px ${token.paddingLG}px ${token.paddingLG}px ${token.paddingLG}px`,
        },
      }}
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
          <Flex direction="column" align="stretch">
            <UserNodeList />
          </Flex>
        )}
        {currentTab === 'credentials' && (
          <Flex direction="column" align="stretch">
            <UserCredentialList />
          </Flex>
        )}
      </Suspense>
    </BAICard>
  );
};

export default UserCredentialsPage;
