/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import AgentList from '../components/AgentList';
import BAIErrorBoundary from '../components/BAIErrorBoundary';
import ResourceGroupList from '../components/ResourceGroupList';
import StorageProxyList from '../components/StorageProxyList';
import { useTabQuerySnapshot } from '../hooks';
import { Skeleton } from 'antd';
import { BAICard } from 'backend.ai-ui';
import { parseAsStringLiteral } from 'nuqs';
import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';

interface ResourcesPageProps {}

const tabParser = parseAsStringLiteral([
  'agents',
  'storages',
  'resourceGroup',
]).withDefault('agents');

const ResourcesPage: React.FC<ResourcesPageProps> = () => {
  'use memo';
  const { t } = useTranslation();
  const { currentTab, onTabChange } = useTabQuerySnapshot(tabParser);

  return (
    <BAICard
      activeTabKey={currentTab}
      onTabChange={onTabChange}
      tabList={[
        {
          key: 'agents',
          label: t('agent.Agent'),
        },
        {
          key: 'storages',
          label: t('general.StorageProxies'),
        },
        {
          key: 'resourceGroup',
          label: t('general.ResourceGroup'),
        },
      ]}
    >
      <Suspense fallback={<Skeleton active />}>
        {currentTab === 'agents' && (
          <BAIErrorBoundary>
            <AgentList />
          </BAIErrorBoundary>
        )}
        {currentTab === 'storages' && (
          <BAIErrorBoundary>
            <StorageProxyList />
          </BAIErrorBoundary>
        )}
        {currentTab === 'resourceGroup' && (
          <BAIErrorBoundary>
            <ResourceGroupList />
          </BAIErrorBoundary>
        )}
      </Suspense>
    </BAICard>
  );
};

export default ResourcesPage;
