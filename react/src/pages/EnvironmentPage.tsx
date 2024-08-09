import ContainerRegistryList from '../components/ContainerRegistryList';
import Flex from '../components/Flex';
import ImageList from '../components/ImageList';
import { useSuspendedBackendaiClient } from '../hooks';
import { theme } from 'antd';
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
  const { token } = theme.useToken();

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
      <Flex
        style={{
          display: 'block',
        }}
      >
        {/* @ts-ignore */}
        {curTabKey === 'image' ? <ImageList /> : null}
      </Flex>
      <Flex
        style={{
          display: curTabKey === 'preset' ? 'block' : 'none',
          paddingTop: token.paddingContentVerticalSM,
        }}
      >
        {/* @ts-ignore */}
        <backend-ai-resource-preset-list active={curTabKey === 'preset'} />
      </Flex>

      <Flex
        style={{
          display: curTabKey === 'registry' ? 'block' : 'none',
          height: 'calc(100vh - 145px)',
          // height: 'calc(100vh - 175px)',
        }}
      >
        {isSupportContainerRegistryGraphQL ? (
          curTabKey === 'registry' ? (
            <Suspense>
              <ContainerRegistryList />
            </Suspense>
          ) : null
        ) : (
          // @ts-ignore
          <backend-ai-registry-list active={curTabKey === 'registry'} />
        )}
      </Flex>
    </Card>
  );
};

export default EnvironmentPage;
