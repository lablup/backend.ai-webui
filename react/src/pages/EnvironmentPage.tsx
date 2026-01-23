import ContainerRegistryList from '../components/ContainerRegistryList';
import ImageList from '../components/ImageList';
import ResourcePresetList from '../components/ResourcePresetList';
import { useSuspendedBackendaiClient } from '../hooks';
import { Skeleton } from 'antd';
import { BAICard } from 'backend.ai-ui';
import { parseAsString, useQueryState } from 'nuqs';
import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import BAIErrorBoundary from 'src/components/BAIErrorBoundary';

const EnvironmentPage = () => {
  const { t } = useTranslation();
  const [curTabKey, setCurTabKey] = useQueryState(
    'tab',
    parseAsString.withDefault('image'),
  );
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
