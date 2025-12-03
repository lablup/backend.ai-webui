/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import ConfigurationsSettingList from '../components/ConfigurationsSettingList';
import { useSessionStorageState } from 'ahooks';
import { Skeleton } from 'antd';
import { BAICard, filterOutEmpty } from 'backend.ai-ui';
import { useQueryState, parseAsStringLiteral, inferParserType } from 'nuqs';
import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import BAIErrorBoundary from 'src/components/BAIErrorBoundary';
import BrandingSettingList from 'src/components/BrandingSettingList';
import MaintenanceSettingList from 'src/components/MaintenanceSettingList';

const parser = parseAsStringLiteral([
  'maintenance',
  'configurations',
  'branding',
]);
type TabKey = inferParserType<typeof parser>;

const ConfigurationsPage = () => {
  'use memo';
  const { t } = useTranslation();
  const [curTabKey, setCurTabKey] = useQueryState(
    'tab',
    parser.withDefault('configurations'),
  );

  const [isThemePreviewMode] = useSessionStorageState('isThemePreviewMode', {
    defaultValue: false,
  });

  return (
    <BAICard
      activeTabKey={curTabKey}
      onTabChange={(key) => setCurTabKey(key as TabKey)}
      tabList={filterOutEmpty([
        {
          key: 'maintenance',
          tab: t('webui.menu.Maintenance'),
        },
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
