import AgentList from '../components/AgentList';
import ResourceGroupList from '../components/ResourceGroupList';
import StorageProxyList from '../components/StorageProxyList';
import { Skeleton } from 'antd';
import { BAICard } from 'backend.ai-ui';
import { parseAsString, useQueryState } from 'nuqs';
import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import BAIErrorBoundary from 'src/components/BAIErrorBoundary';

type TabKey = 'agents' | 'storages' | 'resourceGroup';

interface ResourcesPageProps {}

const ResourcesPage: React.FC<ResourcesPageProps> = () => {
  const { t } = useTranslation();
  const [curTabKey, setCurTabKey] = useQueryState(
    'tab',
    parseAsString.withDefault('agents').withOptions({ history: 'replace' }),
  );

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
            <AgentList />
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
