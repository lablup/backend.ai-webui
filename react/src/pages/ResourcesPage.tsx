import AgentList from '../components/AgentList';
import BAICard from '../components/BAICard';
import StorageProxyList from '../components/StorageProxyList';
import { Skeleton, theme } from 'antd';
import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { StringParam, useQueryParam, withDefault } from 'use-query-params';

type TabKey = 'agents' | 'storages' | 'resourceGroup';

interface ResourcesPageProps {}

const tabParam = withDefault(StringParam, 'agents');

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
          key: 'agents',
          tab: t('agent.Agent'),
        },
        {
          key: 'storages',
          tab: t('general.StorageProxies'),
        },
        {
          key: 'resourceGroup',
          tab: t('general.ResourceGroup'),
        },
      ]}
    >
      {curTabKey === 'agents' ? (
        // To remove duplicated border in the bordered table, we need to remove margin of the container.
        <Suspense
          fallback={
            <Skeleton
              active
              style={{ padding: token.paddingContentVerticalLG }}
            />
          }
        >
          <AgentList />
        </Suspense>
      ) : null}
      {curTabKey === 'storages' ? (
        <Suspense
          fallback={
            <Skeleton
              active
              style={{ padding: token.paddingContentVerticalLG }}
            />
          }
        >
          <StorageProxyList />
        </Suspense>
      ) : null}
      {curTabKey === 'resourceGroup' ? (
        // @ts-ignore
        <backend-ai-resource-group-list active />
      ) : null}
    </BAICard>
  );
};

export default ResourcesPage;
