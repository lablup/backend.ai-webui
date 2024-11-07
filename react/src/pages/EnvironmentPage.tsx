import ContainerRegistryList from '../components/ContainerRegistryList';
import ContainerRegistryListBefore2409 from '../components/ContainerRegistryListBefore2409';
import FlexActivityIndicator from '../components/FlexActivityIndicator';
import ImageList from '../components/ImageList';
import ResourcePresetList from '../components/ResourcePresetList';
import { useSuspendedBackendaiClient } from '../hooks';
import Card from 'antd/es/card/Card';
import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { StringParam, useQueryParam, withDefault } from 'use-query-params';

const tabParam = withDefault(StringParam, 'image');

const EnvironmentPage = () => {
  const { t } = useTranslation();
  const [curTabKey, setCurTabKey] = useQueryParam('tab', tabParam);
  const baiClient = useSuspendedBackendaiClient();
  const isSupportContainerRegistryGraphQL = baiClient.supports(
    'container-registry-gql',
  );
  const isSupportContainerRegistryNodes =
    baiClient?.isManagerVersionCompatibleWith('24.09.0');

  return (
    <Card
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
      styles={{
        body: {
          padding: 0,
          paddingTop: 1,
          overflow: 'hidden',
        },
      }}
    >
      <Suspense
        fallback={
          <FlexActivityIndicator
            style={{ height: 'calc(100vh - 145px)' }}
            spinSize="large"
          />
        }
      >
        {curTabKey === 'image' && <ImageList />}
        {curTabKey === 'preset' && <ResourcePresetList />}
        {curTabKey === 'registry' ? (
          isSupportContainerRegistryGraphQL ? (
            isSupportContainerRegistryNodes ? (
              // manager ≤ v24.09.0
              <ContainerRegistryList />
            ) : (
              // v23.09.2 ≤ manager < v24.09.0
              <ContainerRegistryListBefore2409 />
            )
          ) : (
            // TODO: remove this from 24.09.2
            // v23.09.2 < manager
            // @ts-ignore
            <backend-ai-registry-list active />
          )
        ) : null}
      </Suspense>
    </Card>
  );
};

export default EnvironmentPage;
