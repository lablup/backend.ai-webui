import AllocationHistory from '../components/AllocationHistory';
import UserSessionsMetrics from '../components/UserSessionsMetrics';
import { filterOutEmpty } from '../helper';
import { useSuspendedBackendaiClient } from '../hooks';
import { Skeleton, theme } from 'antd';
import { BAICard } from 'backend.ai-ui';
import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { StringParam, useQueryParam, withDefault } from 'use-query-params';

interface ResourcesPageProps {}

const tabParam = withDefault(StringParam, 'allocation-history');

const ResourcesPage: React.FC<ResourcesPageProps> = (props) => {
  const { t } = useTranslation();
  const baiClient = useSuspendedBackendaiClient();
  const { token } = theme.useToken();

  const [curTabKey, setCurTabKey] = useQueryParam('tab', tabParam, {
    updateType: 'replace',
  });

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
      ) : null}
      {curTabKey === 'user-session-history' ? (
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
      ) : null}
    </BAICard>
  );
};

export default ResourcesPage;
