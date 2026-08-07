/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import AgentSummaryList from '../components/AgentSummaryList';
import BAISkeletonAstryx from '../components/astryx-bui/BAISkeletonAstryx';
import { Card } from '@astryxdesign/core/Card';
import { VStack } from '@astryxdesign/core/Stack';
import { Tab, TabList } from '@astryxdesign/core/TabList';
import { parseAsStringLiteral, useQueryState } from 'nuqs';
import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';

interface ResourcesPageProps {}

// antd `BAICard tabList` -> Astryx `Card` + `TabList hasDivider` composition
// (MAPPING.md: Card is COMPOSITION — Card + Stack + Heading (+ TabList)).
// Single-tab card; the tab rail sits on the header's bottom edge and the
// body starts under the divider, matching the original tabbed-card anatomy.
const ResourcesPage: React.FC<ResourcesPageProps> = () => {
  'use memo';
  const { t } = useTranslation();
  const [curTabKey, setCurTabKey] = useQueryState(
    'tab',
    parseAsStringLiteral(['agent-summary']).withDefault('agent-summary'),
  );

  return (
    <Card padding={6}>
      <VStack gap={4} align="stretch">
        <TabList
          value={curTabKey}
          onChange={(key) => {
            if (key === 'agent-summary') {
              setCurTabKey(key);
            }
          }}
          hasDivider
        >
          <Tab value="agent-summary" label={t('webui.menu.AgentSummary')} />
        </TabList>
        {curTabKey === 'agent-summary' ? (
          <Suspense fallback={<BAISkeletonAstryx rows={4} />}>
            <AgentSummaryList />
          </Suspense>
        ) : null}
      </VStack>
    </Card>
  );
};

export default ResourcesPage;
