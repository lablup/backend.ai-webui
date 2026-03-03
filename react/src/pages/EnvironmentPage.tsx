/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import ContainerRegistryList from '../components/ContainerRegistryList';
import ImageList from '../components/ImageList';
import ResourcePresetList from '../components/ResourcePresetList';
import { useSuspendedBackendaiClient } from '../hooks';
import { Skeleton } from 'antd';
import { BAICard } from 'backend.ai-ui';
import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import BAIErrorBoundary from 'src/components/BAIErrorBoundary';
import { StringParam, useQueryParam, withDefault } from 'use-query-params';

const tabParam = withDefault(StringParam, 'image');

const EnvironmentPage = () => {
  const { t } = useTranslation();
  const [curTabKey, setCurTabKey] = useQueryParam('tab', tabParam);
  const baiClient = useSuspendedBackendaiClient();

  return (
    <BAICard
      activeTabKey={curTabKey}
      onTabChange={setCurTabKey}
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
        {curTabKey === 'image' && (
          <BAIErrorBoundary>
            <ImageList />
          </BAIErrorBoundary>
        )}
        {curTabKey === 'preset' && (
          <BAIErrorBoundary>
            <ResourcePresetList />
          </BAIErrorBoundary>
        )}
        {curTabKey === 'registry' && (
          <BAIErrorBoundary>
            <ContainerRegistryList />
          </BAIErrorBoundary>
        )}
      </Suspense>
    </BAICard>
  );
};

export default EnvironmentPage;
