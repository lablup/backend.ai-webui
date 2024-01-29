import ContainerRegistryList from '../components/ContainerRegistryList';
import Flex from '../components/Flex';
import { useSuspendedBackendaiClient } from '../hooks';
import { theme } from 'antd';
import Card from 'antd/es/card/Card';
import { useState, Suspense } from 'react';
import { useTranslation } from 'react-i18next';

type TabKey = 'imageList' | 'presetList' | 'registryList';
const EnvironmentPage = () => {
  const { t } = useTranslation();
  const [curTabKey, setCurTabKey] = useState<TabKey>('imageList');
  const baiClient = useSuspendedBackendaiClient();
  const isSupportContainerRegistryGraphQL = baiClient.supports(
    'container-registry-gql',
  );
  const { token } = theme.useToken();
  return (
    <Card
      activeTabKey={curTabKey}
      onTabChange={(key) => setCurTabKey(key as TabKey)}
      tabList={[
        {
          key: 'imageList',
          label: t('environment.Images'),
        },
        {
          key: 'presetList',
          label: t('environment.ResourcePresets'),
        },
        ...(baiClient.is_superadmin
          ? [
              {
                key: 'registryList',
                label: t('environment.Registries'),
              },
            ]
          : []),
      ]}
      bodyStyle={{
        padding: 0,
        paddingTop: 1,
        overflow: 'hidden',
      }}
    >
      <Flex
        style={{
          display: curTabKey === 'imageList' ? 'block' : 'none',
          paddingTop: token.paddingContentVerticalSM,
        }}
      >
        {/* @ts-ignore */}
        <backend-ai-environment-list active={curTabKey === 'imageList'} />
      </Flex>
      <Flex
        style={{
          display: curTabKey === 'presetList' ? 'block' : 'none',
          paddingTop: token.paddingContentVerticalSM,
        }}
      >
        {/* @ts-ignore */}
        <backend-ai-resource-preset-list active={curTabKey === 'presetList'} />
      </Flex>

      <Flex
        style={{
          display: curTabKey === 'registryList' ? 'block' : 'none',
          height: 'calc(100vh - 145px)',
          // height: 'calc(100vh - 175px)',
        }}
      >
        {isSupportContainerRegistryGraphQL ? (
          curTabKey === 'registryList' ? (
            <Suspense>
              <ContainerRegistryList />
            </Suspense>
          ) : null
        ) : (
          // @ts-ignore
          <backend-ai-registry-list active={curTabKey === 'registryList'} />
        )}
      </Flex>
    </Card>
  );
};

export default EnvironmentPage;
