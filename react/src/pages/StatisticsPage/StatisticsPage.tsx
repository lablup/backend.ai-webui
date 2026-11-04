/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import BAIErrorBoundary from '../../components/BAIErrorBoundary';
import { useTabQuerySnapshot } from '../../hooks';
import AllocationHistory from './components/AllocationHistory';
import UserSessionsMetrics from './components/UserSessionsMetrics';
import { useTheme } from '@lablup/ui-common/theme';
import { BAISkeleton, BAICard } from 'backend.ai-ui';
import { parseAsStringLiteral } from 'nuqs';
import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';

interface StatisticsPageProps {}

const tabParser = parseAsStringLiteral([
  'allocation-history',
  'user-session-history',
]).withDefault('allocation-history');

const StatisticsPage: React.FC<StatisticsPageProps> = () => {
  'use memo';
  const { t } = useTranslation();
  const { token } = useTheme();

  const { currentTab, onTabChange } = useTabQuerySnapshot(tabParser);

  return (
    <BAICard
      activeTabKey={currentTab}
      onTabChange={onTabChange}
      tabList={[
        {
          key: 'allocation-history',
          label: t('webui.menu.UsageHistory'),
        },
        {
          key: 'user-session-history',
          label: t('webui.menu.UserSessionHistory'),
        },
      ]}
      styles={{
        body: {
          overflow: 'hidden',
        },
      }}
    >
      {currentTab === 'allocation-history' ? (
        <BAIErrorBoundary>
          <Suspense
            fallback={
              // antd `Skeleton active style={{padding}}` -> `BAISkeleton`
              // inside a padded box. The padding cannot ride on the component:
              // in `paragraph` mode it forwards `style` to EVERY line box, so
              // one shared style would repeat the inset per row.
              <div style={{ padding: token('--spacing-4') }}>
                <BAISkeleton />
              </div>
            }
          >
            <AllocationHistory />
          </Suspense>
        </BAIErrorBoundary>
      ) : null}
      {currentTab === 'user-session-history' ? (
        <BAIErrorBoundary>
          <Suspense
            fallback={
              // antd `Skeleton active style={{padding}}` -> `BAISkeleton`
              // inside a padded box. The padding cannot ride on the component:
              // in `paragraph` mode it forwards `style` to EVERY line box, so
              // one shared style would repeat the inset per row.
              <div style={{ padding: token('--spacing-4') }}>
                <BAISkeleton />
              </div>
            }
          >
            <UserSessionsMetrics />
          </Suspense>
        </BAIErrorBoundary>
      ) : null}
    </BAICard>
  );
};

export default StatisticsPage;
