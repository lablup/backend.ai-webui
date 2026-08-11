/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import BAIErrorBoundary from '../components/BAIErrorBoundary';
import MaintenanceSettingList from '../components/MaintenanceSettingList';
import BAISkeletonAstryx from '../components/astryx-bui/BAISkeletonAstryx';
import { BAICard } from 'backend.ai-ui';
import { parseAsStringLiteral, useQueryState } from 'nuqs';
import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';

const MaintenancePage = () => {
  'use memo';
  const { t } = useTranslation();
  const [curTabKey] = useQueryState(
    'tab',
    parseAsStringLiteral(['maintenance']).withDefault('maintenance'),
  );

  return (
    <BAICard
      activeTabKey={curTabKey}
      tabList={[
        {
          key: 'maintenance',
          label: t('webui.menu.Maintenance'),
        },
      ]}
    >
      <Suspense fallback={<BAISkeletonAstryx />}>
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
