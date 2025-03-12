import BAICard from '../components/BAICard';
import PrometheusMetricPage from '../components/PrometheusMetric';
import UsageHistory from '../components/UsageHistory';
import { Card, Skeleton, theme } from 'antd';
import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { StringParam, useQueryParam, withDefault } from 'use-query-params';

type TabKey = 'usage-history' | 'prometheus-metrics';

interface ResourcesPageProps {}

const tabParam = withDefault(StringParam, 'usage-history');

const ResourcesPage: React.FC<ResourcesPageProps> = (props) => {
  const { t } = useTranslation();
  const [curTabKey, setCurTabKey] = useQueryParam('tab', tabParam, {
    updateType: 'replace',
  });

  const { token } = theme.useToken();

  return (
    <BAICard
      activeTabKey={curTabKey}
      onTabChange={(key) => setCurTabKey(key as TabKey)}
      tabList={[
        {
          key: 'usage-history',
          tab: t('webui.menu.UsageHistory'),
        },
        {
          key: 'prometheus-metrics',
          tab: t('webui.menu.PrometheusMetrics'),
        },
      ]}
      styles={{
        body: {
          padding: 0,
          paddingTop: 1,
          overflow: 'hidden',
        },
      }}
    >
      {curTabKey === 'usage-history' ? (
        // To remove duplicated border in the bordered table, we need to remove margin of the container.
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
          <PrometheusMetricPage />
        </Suspense>
      ) : null}
    </BAICard>
  );
};

export default ResourcesPage;
