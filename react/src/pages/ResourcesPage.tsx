/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import AgentList from '../components/AgentList';
import BAIErrorBoundary from '../components/BAIErrorBoundary';
import ResourceGroupList from '../components/ResourceGroupList';
import StorageProxyList from '../components/StorageProxyList';
import BAISkeletonAstryx from '../components/astryx-bui/BAISkeletonAstryx';
import { useTabQuerySnapshot } from '../hooks';
import { Card } from '@astryxdesign/core/Card';
import { VStack } from '@astryxdesign/core/Stack';
import { Tab, TabList } from '@astryxdesign/core/TabList';
import { parseAsStringLiteral } from 'nuqs';
import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';

interface ResourcesPageProps {}

const tabParser = parseAsStringLiteral([
  'agents',
  'storages',
  'resourceGroup',
]).withDefault('agents');

// antd `BAICard tabList` -> Astryx `Card` + `TabList hasDivider` composition
// (MAPPING.md: Card is COMPOSITION — Card + Stack + Heading (+ TabList)),
// same idiom as AgentSummaryPage (ticket 15). The tab rail sits on the
// header's bottom edge and the body starts under the divider, matching the
// original tabbed-card anatomy.
const ResourcesPage: React.FC<ResourcesPageProps> = () => {
  'use memo';
  const { t } = useTranslation();
  const { currentTab, onTabChange } = useTabQuerySnapshot(tabParser);

  return (
    <Card padding={6}>
      <VStack gap={4} align="stretch">
        <TabList value={currentTab} onChange={onTabChange} hasDivider>
          <Tab value="agents" label={t('agent.Agent')} />
          <Tab value="storages" label={t('general.StorageProxies')} />
          <Tab value="resourceGroup" label={t('general.ResourceGroup')} />
        </TabList>
        <Suspense fallback={<BAISkeletonAstryx />}>
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
      </VStack>
    </Card>
  );
};

export default ResourcesPage;
