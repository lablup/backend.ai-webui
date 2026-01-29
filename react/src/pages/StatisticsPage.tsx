import AllocationHistory from '../components/AllocationHistory';
import UserSessionsMetrics from '../components/UserSessionsMetrics';
import { useSuspendedBackendaiClient } from '../hooks';
import { Skeleton, theme } from 'antd';
import { filterOutEmpty, BAICard } from 'backend.ai-ui';
import { parseAsString, useQueryState } from 'nuqs';
import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import BAIErrorBoundary from 'src/components/BAIErrorBoundary';

interface ResourcesPageProps {}

const ResourcesPage: React.FC<ResourcesPageProps> = () => {
  const { t } = useTranslation();
  const baiClient = useSuspendedBackendaiClient();
  const { token } = theme.useToken();

  const [curTabKey, setCurTabKey] = useQueryState(
    'tab',
    parseAsString
      .withDefault('allocation-history')
      .withOptions({ history: 'replace' }),
  );

  return (
    <BAICard
      activeTabKey={curTabKey}
      onTabChange={(key) => setCurTabKey(key)}
      tabList={filterOutEmpty([
        {
          key: 'allocation-history',
          tab: t('webui.menu.UsageHistory'),
        },
        baiClient?.supports('user-metrics') && {
          key: 'user-session-history',
          tab: t('webui.menu.UserSessionHistory'),
        },
      ])}
      styles={{
        body: {
          overflow: 'hidden',
        },
      }}
    >
      {curTabKey === 'allocation-history' ? (
        <BAIErrorBoundary>
          <Suspense
            fallback={
              <Skeleton
                active
                style={{ padding: token.paddingContentVerticalLG }}
              />
            }
          >
            <AllocationHistory />
          </Suspense>
        </BAIErrorBoundary>
      ) : null}
      {curTabKey === 'user-session-history' ? (
        <BAIErrorBoundary>
          <Suspense
            fallback={
              <Skeleton
                active
                style={{ padding: token.paddingContentVerticalLG }}
              />
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
