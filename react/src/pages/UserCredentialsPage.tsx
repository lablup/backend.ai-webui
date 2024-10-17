import BAICard from '../BAICard';
import FlexActivityIndicator from '../components/FlexActivityIndicator';
import UserList from '../components/UserList';
import { createStyles } from 'antd-style';
import { CardTabListType } from 'antd/es/card';
import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { StringParam, useQueryParam, withDefault } from 'use-query-params';

const useStyles = createStyles(({ css }) => ({
  card: css`
    .ant-card-body {
      padding: 0;
    }
  `,
}));

const tabParam = withDefault(StringParam, 'users');

const UserCredentialsPage: React.FC = () => {
  const { t } = useTranslation();
  const { styles } = useStyles();
  const [curTabKey, setCurTabKey] = useQueryParam('tab', tabParam);
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
      className={styles.card}
      activeTabKey={curTabKey}
      onTabChange={setCurTabKey}
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
        {curTabKey === 'users' && <UserList />}
        {curTabKey === 'credentials' && (
          <div>{t('credential.Credentials')}</div>
        )}
      </Suspense>
    </BAICard>
  );
};

export default UserCredentialsPage;
