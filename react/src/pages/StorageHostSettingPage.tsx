import { StorageHostSettingPageQuery } from '../__generated__/StorageHostSettingPageQuery.graphql';
import Flex from '../components/Flex';
import StorageHostResourcePanel from '../components/StorageHostResourcePanel';
import StorageHostSettingsPanel from '../components/StorageHostSettingsPanel';
import { useWebUINavigate } from '../hooks';
import { Breadcrumb, Card, Empty, Typography } from 'antd';
import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { useParams } from 'react-router-dom';

interface StorageHostSettingPageProps {
  // storageHostId: string;
}
const StorageHostSettingPage: React.FC<StorageHostSettingPageProps> = () => {
  const { hostname: storageHostId } = useParams<{
    hostname: string;
  }>();
  const webuiNavigate = useWebUINavigate();
  const { t } = useTranslation();
  const { storage_volume } = useLazyLoadQuery<StorageHostSettingPageQuery>(
    graphql`
      query StorageHostSettingPageQuery($id: String) {
        storage_volume(id: $id) {
          id
          capabilities
          ...StorageHostResourcePanelFragment
          ...StorageHostSettingsPanel_storageVolumeFrgmt
        }
      }
    `,
    {
      id: storageHostId || '',
    },
  );

  const isQuotaSupportedStorage =
    storage_volume?.capabilities?.includes('quota') ?? false;

  return (
    <Flex direction="column" align="stretch" gap={'sm'}>
      <Breadcrumb
        items={[
          {
            title: t('webui.menu.Resources'),
            onClick: (e) => {
              e.preventDefault();
              webuiNavigate('/agent');
            },
            href: '/agent',
          },
          {
            title: t('storageHost.StorageSetting'),
          },
        ]}
      ></Breadcrumb>
      <Typography.Title level={3} style={{ margin: 0 }}>
        {storageHostId || ''}
      </Typography.Title>
      <StorageHostResourcePanel storageVolumeFrgmt={storage_volume || null} />
      {isQuotaSupportedStorage ? (
        <Suspense fallback={<div>loading...</div>}>
          <StorageHostSettingsPanel
            storageVolumeFrgmt={storage_volume || null}
          />
        </Suspense>
      ) : (
        <Card title={t('storageHost.QuotaSettings')}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={t('storageHost.QuotaDoesNotSupported')}
          />
        </Card>
      )}
    </Flex>
  );
};

export default StorageHostSettingPage;
