import BAICard from '../components/BAICard';
import UsageHistory from '../components/UsageHistory';
import UserSessionsMetrics from '../components/UserSessionsMetrics';
import { filterEmptyItem } from '../helper';
import { useSuspendedBackendaiClient } from '../hooks';
import { Skeleton, theme } from 'antd';
import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { StringParam, useQueryParam, withDefault } from 'use-query-params';

type TabKey = 'usage-history' | 'prometheus-metrics';

interface ResourcesPageProps {}

const tabParam = withDefault(StringParam, 'usage-history');

const ResourcesPage: React.FC<ResourcesPageProps> = (props) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const baiClient = useSuspendedBackendaiClient();

  const [curTabKey, setCurTabKey] = useQueryParam('tab', tabParam, {
    updateType: 'replace',
  });

  return (
    <BAICard
      activeTabKey={curTabKey}
      onTabChange={(key) => setCurTabKey(key as TabKey)}
      tabList={filterEmptyItem([
        {
          key: 'usage-history',
          tab: t('webui.menu.UsageHistory'),
        },
        baiClient?.supports('user-metrics') && {
          key: 'prometheus-metrics',
          tab: t('webui.menu.UserSessionHistory'),
        },
      ])}
      styles={{
        body: {
          padding: 0,
          paddingTop: 1,
          overflow: 'hidden',
        },
      }}
    >
      {curTabKey === 'usage-history' ? (
        <Suspense
          fallback={
            <Skeleton
              active
              style={{ padding: token.paddingContentVerticalLG }}
            />
          }
        >
          <UsageHistory />
        </Suspense>
      ) : null}
      {curTabKey === 'prometheus-metrics' ? (
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
