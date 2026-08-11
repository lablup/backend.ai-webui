/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import AllocationHistory from '../components/AllocationHistory';
import BAIErrorBoundary from '../components/BAIErrorBoundary';
import UserSessionsMetrics from '../components/UserSessionsMetrics';
import BAISkeletonAstryx from '../components/astryx-bui/BAISkeletonAstryx';
import { useSuspendedBackendaiClient, useTabQuerySnapshot } from '../hooks';
import { theme } from '../theme-shim';
import { filterOutEmpty, BAICard } from 'backend.ai-ui';
import { parseAsStringLiteral } from 'nuqs';
import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';

interface ResourcesPageProps {}

const tabParser = parseAsStringLiteral([
  'allocation-history',
  'user-session-history',
]).withDefault('allocation-history');

const ResourcesPage: React.FC<ResourcesPageProps> = () => {
  'use memo';
  const { t } = useTranslation();
  const baiClient = useSuspendedBackendaiClient();
  const { token } = theme.useToken();

  const { currentTab, onTabChange } = useTabQuerySnapshot(tabParser);

  return (
    <BAICard
      activeTabKey={currentTab}
      onTabChange={onTabChange}
      tabList={filterOutEmpty([
        {
          key: 'allocation-history',
          label: t('webui.menu.UsageHistory'),
        },
        baiClient?.supports('user-metrics') && {
          key: 'user-session-history',
          label: t('webui.menu.UserSessionHistory'),
        },
      ])}
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
              // antd `Skeleton active style={{padding}}` -> `BAISkeletonAstryx`
              // inside a padded box. The padding cannot ride on the component:
              // in `paragraph` mode it forwards `style` to EVERY line box, so
              // one shared style would repeat the inset per row.
              <div style={{ padding: token.paddingContentVerticalLG }}>
                <BAISkeletonAstryx />
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
              // antd `Skeleton active style={{padding}}` -> `BAISkeletonAstryx`
              // inside a padded box. The padding cannot ride on the component:
              // in `paragraph` mode it forwards `style` to EVERY line box, so
              // one shared style would repeat the inset per row.
              <div style={{ padding: token.paddingContentVerticalLG }}>
                <BAISkeletonAstryx />
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

export default ResourcesPage;
