import ConfigurationsSettingList from '../components/ConfigurationsSettingList';
import { useSessionStorageState } from 'ahooks';
import { Card, Skeleton } from 'antd';
import { filterOutEmpty } from 'backend.ai-ui';
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
  const [isThemePreviewMode] = useSessionStorageState('isThemePreviewMode', {
    defaultValue: false,
  });

  return (
    <Card
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
      </Suspense>
    </Card>
  );
};

export default ConfigurationsPage;
