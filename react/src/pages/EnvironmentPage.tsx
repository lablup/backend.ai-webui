/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import BAIErrorBoundary from '../components/BAIErrorBoundary';
import ContainerRegistryList from '../components/ContainerRegistryList';
import ImageList from '../components/ImageList';
import ResourcePresetList from '../components/ResourcePresetList';
import { useSuspendedBackendaiClient, useTabQuerySnapshot } from '../hooks';
import { Skeleton } from 'antd';
import { BAICard } from 'backend.ai-ui';
import { parseAsStringLiteral } from 'nuqs';
import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';

const tabParser = parseAsStringLiteral([
  'image',
  'preset',
  'registry',
]).withDefault('image');

const EnvironmentPage = () => {
  'use memo';
  const { t } = useTranslation();
  const { currentTab, onTabChange } = useTabQuerySnapshot(tabParser);
  const baiClient = useSuspendedBackendaiClient();

  return (
    <BAICard
      activeTabKey={currentTab}
      onTabChange={onTabChange}
      tabList={[
        {
          key: 'image',
          label: t('environment.Images'),
        },
        {
          key: 'preset',
          label: t('environment.ResourcePresets'),
        },
        ...(baiClient.is_superadmin
          ? [
              {
                key: 'registry',
                label: t('environment.Registries'),
              },
            ]
          : []),
      ]}
    >
      <Suspense fallback={<Skeleton active />}>
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
