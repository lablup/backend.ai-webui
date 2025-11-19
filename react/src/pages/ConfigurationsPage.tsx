import ConfigurationsSettingList from '../components/ConfigurationsSettingList';
import { Card, Skeleton } from 'antd';
import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import BAIErrorBoundary from 'src/components/BAIErrorBoundary';
import BrandingSettingList from 'src/components/BrandingSettingList';
import { StringParam, useQueryParam, withDefault } from 'use-query-params';

type TabKey = 'configurations' | 'branding';

const tabParam = withDefault(StringParam, 'configurations');

const ConfigurationsPage = () => {
  const { t } = useTranslation();
  const [curTabKey, setCurTabKey] = useQueryParam('tab', tabParam);

  return (
    <Card
      activeTabKey={curTabKey}
      onTabChange={(key) => setCurTabKey(key as TabKey)}
      tabList={[
        {
          key: 'configurations',
          tab: t('webui.menu.Configurations'),
        },
        {
          key: 'branding',
          tab: t('webui.menu.Branding'),
        },
      ]}
    >
      <Suspense fallback={<Skeleton active />}>
        {curTabKey === 'configurations' && (
          <BAIErrorBoundary>
            <ConfigurationsSettingList />
          </BAIErrorBoundary>
        )}
        {curTabKey === 'branding' && (
          <BAIErrorBoundary>
            <BrandingSettingList />
          </BAIErrorBoundary>
        )}
      </Suspense>
    </Card>
  );
};

export default ConfigurationsPage;
