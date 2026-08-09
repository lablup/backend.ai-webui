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
import { BAICard, filterOutEmpty } from 'backend.ai-ui';
import { parseAsStringLiteral } from 'nuqs';
import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';

const tabParser = parseAsStringLiteral([
  'image',
  'preset',
  'registry',
]).withDefault('image');

// QA2-A: folded the hand-inlined `Card` + `VStack` + `TabList` copy back onto
// `BAICard tabList`, which now renders the strip as the card's header chrome
// (full-bleed rail, tab label on the body inset). See `AgentSummaryPage`.
const EnvironmentPage = () => {
  'use memo';
  const { t } = useTranslation();
  const { currentTab, onTabChange } = useTabQuerySnapshot(tabParser);
  const baiClient = useSuspendedBackendaiClient();

  return (
    <BAICard
      activeTabKey={currentTab}
      onTabChange={onTabChange}
      tabList={filterOutEmpty([
        { key: 'image', label: t('environment.Images') },
        { key: 'preset', label: t('environment.ResourcePresets') },
        baiClient.is_superadmin && {
          key: 'registry',
          label: t('environment.Registries'),
        },
      ])}
    >
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
    </BAICard>
  );
};

export default EnvironmentPage;
