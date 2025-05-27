import BAICard from '../components/BAICard';
import ContainerRegistryList from '../components/ContainerRegistryList';
import FlexActivityIndicator from '../components/FlexActivityIndicator';
import ImageList from '../components/ImageList';
import ImageListBefore251100 from '../components/ImageListBefore251100';
import ResourcePresetList from '../components/ResourcePresetList';
import { useSuspendedBackendaiClient } from '../hooks';
import { theme } from 'antd';
import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';

const EnvironmentPage = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'image';
  const navigate = useNavigate();
  const baiClient = useSuspendedBackendaiClient();

  const { token } = theme.useToken();

  return (
    <BAICard
      activeTabKey={currentTab}
      onTabChange={(key) =>
        navigate({
          pathname: '/environment',
          search: new URLSearchParams({ tab: key }).toString(),
        })
      }
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
          padding: `${token.paddingSM}px ${token.paddingLG}px ${token.paddingLG}px ${token.paddingLG}px`,
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
        {currentTab === 'image' &&
          (baiClient.supports('image_node') ? (
            <ImageList />
          ) : (
            <ImageListBefore251100 />
          ))}
        {currentTab === 'preset' && <ResourcePresetList />}
        {currentTab === 'registry' && <ContainerRegistryList />}
      </Suspense>
    </BAICard>
  );
};

export default EnvironmentPage;
