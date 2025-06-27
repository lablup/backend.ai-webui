import BAICard from '../components/BAICard';
import CustomizedImageList from '../components/CustomizedImageList';
import FlexActivityIndicator from '../components/FlexActivityIndicator';
import { theme } from 'antd';
import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { StringParam, useQueryParam, withDefault } from 'use-query-params';

const tabParam = withDefault(StringParam, 'image');

const MyEnvironmentPage = () => {
  const { t } = useTranslation();
  const [curTabKey, setCurTabKey] = useQueryParam('tab', tabParam);
  const { token } = theme.useToken();

  return (
    <BAICard
      activeTabKey={curTabKey}
      onTabChange={setCurTabKey}
      tabList={[
        {
          key: 'image',
          label: t('environment.Images'),
        },
      ]}
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
        {curTabKey === 'image' && <CustomizedImageList />}
      </Suspense>
    </BAICard>
  );
};

export default MyEnvironmentPage;
