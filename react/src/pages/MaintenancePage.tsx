/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import BAIErrorBoundary from '../components/BAIErrorBoundary';
import MaintenanceSettingList from '../components/MaintenanceSettingList';
import RetentionPolicyList from '../components/RetentionPolicyList';
import { BAISkeleton, BAICard } from 'backend.ai-ui';
import { parseAsStringLiteral, useQueryState } from 'nuqs';
import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';

const MaintenancePage = () => {
  'use memo';
  const { t } = useTranslation();
  const [tabKey, setTabKey] = useQueryState(
    'tab',
    parseAsStringLiteral(['maintenance', 'retention-policy']).withDefault(
      'maintenance',
    ),
  );

  return (
    <BAICard
      activeTabKey={tabKey}
      onTabChange={(key) =>
        setTabKey(key as 'maintenance' | 'retention-policy')
      }
      tabList={[
        {
          key: 'maintenance',
          label: t('webui.menu.Maintenance'),
        },
        {
          key: 'retention-policy',
          label: t('retentionPolicy.DataRetention'),
        },
      ]}
    >
      <Suspense fallback={<BAISkeleton />}>
        {tabKey === 'maintenance' && (
          <BAIErrorBoundary>
            <MaintenanceSettingList />
          </BAIErrorBoundary>
        )}
        {tabKey === 'retention-policy' && (
          <BAIErrorBoundary>
            <RetentionPolicyList />
          </BAIErrorBoundary>
        )}
      </Suspense>
    </BAICard>
  );
};

export default MaintenancePage;
