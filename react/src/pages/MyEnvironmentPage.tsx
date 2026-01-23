import CustomizedImageList from '../components/CustomizedImageList';
import FlexActivityIndicator from '../components/FlexActivityIndicator';
import { BAICard } from 'backend.ai-ui';
import { parseAsString, useQueryState } from 'nuqs';
import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';

const MyEnvironmentPage = () => {
  const { t } = useTranslation();
  const [curTabKey, setCurTabKey] = useQueryState(
    'tab',
    parseAsString.withDefault('image'),
  );

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
