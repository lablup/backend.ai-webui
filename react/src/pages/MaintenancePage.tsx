/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import BAIErrorBoundary from '../components/BAIErrorBoundary';
import MaintenanceSettingList from '../components/MaintenanceSettingList';
import RetentionPolicyList from '../components/RetentionPolicyList';
import { useSuspendedBackendaiClient } from '../hooks';
import { BAISkeleton, BAICard, filterOutEmpty } from 'backend.ai-ui';
import { parseAsStringLiteral, useQueryState } from 'nuqs';
import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';

const MaintenancePage = () => {
  'use memo';
  const { t } = useTranslation();
  const baiClient = useSuspendedBackendaiClient();
  const supportsRetentionPolicy = baiClient.supports('retention-policy');
  const [tabKey, setTabKey] = useQueryState(
    'tab',
    parseAsStringLiteral(['maintenance', 'retention-policy']).withDefault(
      'maintenance',
    ),
  );
  const curTabKey =
    tabKey === 'retention-policy' && !supportsRetentionPolicy
      ? 'maintenance'
      : tabKey;

  return (
    <BAICard
      activeTabKey={curTabKey}
      onTabChange={(key) =>
        setTabKey(key as 'maintenance' | 'retention-policy')
      }
      tabList={filterOutEmpty([
        {
          key: 'maintenance',
          label: t('webui.menu.Maintenance'),
        },
        supportsRetentionPolicy && {
          key: 'retention-policy',
          label: t('retentionPolicy.DataRetention'),
        },
      ])}
    >
      <Suspense fallback={<BAISkeleton />}>
        {curTabKey === 'maintenance' && (
          <BAIErrorBoundary>
            <MaintenanceSettingList />
          </BAIErrorBoundary>
        )}
        {curTabKey === 'retention-policy' && (
          <BAIErrorBoundary>
            <RetentionPolicyList />
          </BAIErrorBoundary>
        )}
      </Suspense>
    </BAICard>
  );
};

export default MaintenancePage;
