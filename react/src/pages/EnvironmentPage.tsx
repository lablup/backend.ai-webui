/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import BAIErrorBoundary from '../components/BAIErrorBoundary';
import ContainerRegistryList from '../components/ContainerRegistryList';
import ImageList from '../components/ImageList';
import ResourcePresetList from '../components/ResourcePresetList';
import BAISkeletonAstryx from '../components/astryx-bui/BAISkeletonAstryx';
import { useSuspendedBackendaiClient, useTabQuerySnapshot } from '../hooks';
import { Card } from '@astryxdesign/core/Card';
import { VStack } from '@astryxdesign/core/Stack';
import { Tab, TabList } from '@astryxdesign/core/TabList';
import { parseAsStringLiteral } from 'nuqs';
import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';

const tabParser = parseAsStringLiteral([
  'image',
  'preset',
  'registry',
]).withDefault('image');

// antd `BAICard tabList` -> Astryx `Card` + `TabList hasDivider` composition
// (MAPPING.md: Card is COMPOSITION — Card + Stack (+ TabList); ticket 15 idiom).
const EnvironmentPage = () => {
  'use memo';
  const { t } = useTranslation();
  const { currentTab, onTabChange } = useTabQuerySnapshot(tabParser);
  const baiClient = useSuspendedBackendaiClient();

  return (
    <Card padding={6}>
      <VStack gap={4} align="stretch">
        <TabList value={currentTab} onChange={onTabChange} hasDivider>
          <Tab value="image" label={t('environment.Images')} />
          <Tab value="preset" label={t('environment.ResourcePresets')} />
          {baiClient.is_superadmin ? (
            <Tab value="registry" label={t('environment.Registries')} />
          ) : null}
        </TabList>
        <Suspense fallback={<BAISkeletonAstryx rows={4} />}>
          {currentTab === 'image' && (
            <BAIErrorBoundary>
              <ImageList />
            </BAIErrorBoundary>
          )}
          {currentTab === 'preset' && (
            <BAIErrorBoundary>
              <ResourcePresetList />
            </BAIErrorBoundary>
          )}
          {currentTab === 'registry' && (
            <BAIErrorBoundary>
              <ContainerRegistryList />
            </BAIErrorBoundary>
          )}
        </Suspense>
      </VStack>
    </Card>
  );
};

export default EnvironmentPage;
