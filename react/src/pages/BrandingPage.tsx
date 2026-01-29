import { Skeleton } from 'antd';
import { BAICard } from 'backend.ai-ui';
import { parseAsString, useQueryState } from 'nuqs';
import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import BAIErrorBoundary from 'src/components/BAIErrorBoundary';
import BrandingSettingList from 'src/components/BrandingSettingList';

const BrandingPage: React.FC = () => {
  'use memo';

  const { t } = useTranslation();
  const [curTabKey, setCurTabKey] = useQueryState(
    'tab',
    parseAsString.withDefault('branding'),
  );

  return (
    <BAICard
      activeTabKey={curTabKey}
      onTabChange={(key) => setCurTabKey(key)}
      tabList={[
        {
          key: 'branding',
          tab: t('webui.menu.Branding'),
        },
      ]}
    >
      <Suspense fallback={<Skeleton active />}>
        {curTabKey === 'branding' && (
          <BAIErrorBoundary>
            <BrandingSettingList />
          </BAIErrorBoundary>
        )}
      </Suspense>
    </BAICard>
  );
};

export default BrandingPage;
