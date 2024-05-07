import AgentList from '../components/AgentList';
import { Card } from 'antd';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

type TabKey =
  | 'connectedAgents'
  | 'disconnectedAgents'
  | 'storages'
  | 'resourceGroup';

interface ResourcesPageProps {}

const ResourcesPage: React.FC<ResourcesPageProps> = (props) => {
  const { t } = useTranslation();
  const [curTabKey, setCurTabKey] = useState<TabKey>('connectedAgents');

  return (
    <Card
      activeTabKey={curTabKey}
      onTabChange={(key) => setCurTabKey(key as TabKey)}
      tabList={[
        {
          key: 'connectedAgents',
          tab: t('agent.Connected'),
        },
        {
          key: 'disconnectedAgents',
          tab: t('agent.Terminated'),
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
      styles={{
        body: {
          padding: 0,
          paddingTop: 1,
          overflow: 'hidden',
        },
      }}
    >
      {curTabKey === 'connectedAgents' ? (
        <AgentList filter={`status == "ALIVE"`} />
      ) : null}
      {curTabKey === 'disconnectedAgents' ? (
        <AgentList filter={`status == "TERMINATED"`} />
      ) : null}
      {curTabKey === 'storages' ? (
        // @ts-ignore
        <backend-ai-storage-proxy-list active />
      ) : null}
      {curTabKey === 'resourceGroup' ? (
        // @ts-ignore
        <backend-ai-resource-group-list active />
      ) : null}
    </Card>
  );
};

export default ResourcesPage;
