import MaintenanceSettingList from '../components/MaintenanceSettingList';
import { Card, Skeleton } from 'antd';
import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import BAIErrorBoundary from 'src/components/BAIErrorBoundary';
import BrandingSettingList from 'src/components/BrandingSettingList';
import { StringParam, useQueryParam, withDefault } from 'use-query-params';

type TabKey = 'maintenance' | 'branding';

const tabParam = withDefault(StringParam, 'maintenance');

const MaintenancePage = () => {
  const { t } = useTranslation();
  const [curTabKey, setCurTabKey] = useQueryParam('tab', tabParam);

  return (
    <Card
      activeTabKey={curTabKey}
      onTabChange={(key) => setCurTabKey(key as TabKey)}
      tabList={[
        {
          key: 'maintenance',
          tab: t('webui.menu.Maintenance'),
        },
        {
          key: 'branding',
          tab: t('userSettings.Branding'),
        },
      ]}
      style={{ maxWidth: curTabKey === 'branding' ? 900 : undefined }}
    >
      <Suspense fallback={<Skeleton active />}>
        {curTabKey === 'maintenance' && (
          <BAIErrorBoundary>
            <MaintenanceSettingList />
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

export default MaintenancePage;
