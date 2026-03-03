/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import MaintenanceSettingList from '../components/MaintenanceSettingList';
import { Skeleton } from 'antd';
import { BAICard } from 'backend.ai-ui';
import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import BAIErrorBoundary from 'src/components/BAIErrorBoundary';
import { StringParam, useQueryParam, withDefault } from 'use-query-params';

type TabKey = 'maintenance';

const tabParam = withDefault(StringParam, 'maintenance');

const MaintenancePage = () => {
  const { t } = useTranslation();
  const [curTabKey, setCurTabKey] = useQueryParam('tab', tabParam);

  return (
    <BAICard
      activeTabKey={curTabKey}
      onTabChange={(key) => setCurTabKey(key as TabKey)}
      tabList={[
        {
          key: 'maintenance',
          tab: t('webui.menu.Maintenance'),
        },
      ]}
    >
      <Suspense fallback={<Skeleton active />}>
        {curTabKey === 'maintenance' && (
          <BAIErrorBoundary>
            <MaintenanceSettingList />
          </BAIErrorBoundary>
        )}
      </Suspense>
    </BAICard>
  );
};

export default MaintenancePage;
