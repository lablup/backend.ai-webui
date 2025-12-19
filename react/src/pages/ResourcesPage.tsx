import ResourceGroupList from '../components/ResourceGroupList';
import StorageProxyList from '../components/StorageProxyList';
import AgentNodesListPage from './AgentNodesListPage';
import { Skeleton } from 'antd';
import { BAICard } from 'backend.ai-ui';
import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import BAIErrorBoundary from 'src/components/BAIErrorBoundary';
import { StringParam, useQueryParam, withDefault } from 'use-query-params';

type TabKey = 'agents' | 'storages' | 'resourceGroup';

interface ResourcesPageProps {}

const tabParam = withDefault(StringParam, 'agents');

const ResourcesPage: React.FC<ResourcesPageProps> = () => {
  const { t } = useTranslation();
  const [curTabKey, setCurTabKey] = useQueryParam('tab', tabParam, {
    updateType: 'replace',
  });

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
      <Suspense fallback={<Skeleton active />}>
        {curTabKey === 'agents' && (
          <BAIErrorBoundary>
            <AgentNodesListPage />
          </BAIErrorBoundary>
        )}
        {curTabKey === 'storages' && (
          <BAIErrorBoundary>
            <StorageProxyList />
          </BAIErrorBoundary>
        )}
        {curTabKey === 'resourceGroup' && (
          <BAIErrorBoundary>
            <ResourceGroupList />
          </BAIErrorBoundary>
        )}
      </Suspense>
    </BAICard>
  );
};

export default ResourcesPage;
