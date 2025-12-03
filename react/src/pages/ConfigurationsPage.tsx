import ConfigurationsSettingList from '../components/ConfigurationsSettingList';
import { useSessionStorageState } from 'ahooks';
import { Skeleton } from 'antd';
import { BAICard, filterOutEmpty } from 'backend.ai-ui';
import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import BAIErrorBoundary from 'src/components/BAIErrorBoundary';
import BrandingSettingList from 'src/components/BrandingSettingList';
import MaintenanceSettingList from 'src/components/MaintenanceSettingList';
import { StringParam, useQueryParam, withDefault } from 'use-query-params';

type TabKey = 'configurations' | 'branding';

const tabParam = withDefault(StringParam, 'configurations');

const ConfigurationsPage = () => {
  'use memo';
  const { t } = useTranslation();
  const [curTabKey, setCurTabKey] = useQueryParam('tab', tabParam);
  const [isThemePreviewMode] = useSessionStorageState('isThemePreviewMode', {
    defaultValue: false,
  });

  return (
    <BAICard
      activeTabKey={curTabKey}
      onTabChange={(key) => setCurTabKey(key as TabKey)}
      tabList={filterOutEmpty([
        {
          key: 'configurations',
          tab: t('webui.menu.Configurations'),
        },
        !isThemePreviewMode && {
          key: 'branding',
          tab: t('webui.menu.Branding'),
        },
        {
          key: 'maintenance',
          tab: t('webui.menu.Maintenance'),
        },
      ])}
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
        {curTabKey === 'maintenance' && (
          <BAIErrorBoundary>
            <MaintenanceSettingList />
          </BAIErrorBoundary>
        )}
      </Suspense>
    </BAICard>
  );
};

export default ConfigurationsPage;
