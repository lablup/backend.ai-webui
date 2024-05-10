import AgentList from '../components/AgentList';
import { Card } from 'antd';
import React from 'react';
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

  return (
    <Card
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
      styles={{
        body: {
          padding: 0,
          paddingTop: 1,
          overflow: 'hidden',
        },
      }}
    >
      {curTabKey === 'agents' ? (
        // To remove duplicated border in the bordered table, we need to remove margin of the container.
        <AgentList containerStyle={{ marginLeft: -1, marginRight: -1 }} />
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
