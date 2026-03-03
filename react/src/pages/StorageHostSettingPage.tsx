/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { StorageHostSettingPageQuery } from '../__generated__/StorageHostSettingPageQuery.graphql';
import StorageHostResourcePanel from '../components/StorageHostResourcePanel';
import StorageHostSettingsPanel from '../components/StorageHostSettingsPanel';
import { useWebUINavigate } from '../hooks';
import { Breadcrumb, Card, Empty, Skeleton, Typography } from 'antd';
import { BAIFlex } from 'backend.ai-ui';
import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { useParams } from 'react-router-dom';
import ErrorBoundaryWithNullFallback from 'src/components/ErrorBoundaryWithNullFallback';

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
    <BAIFlex direction="column" align="stretch" gap={'sm'}>
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
        <ErrorBoundaryWithNullFallback>
          <Suspense fallback={<Skeleton active />}>
            <StorageHostSettingsPanel
              storageVolumeFrgmt={storage_volume || null}
            />
          </Suspense>
        </ErrorBoundaryWithNullFallback>
      ) : (
        <Card title={t('storageHost.QuotaSettings')}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={t('storageHost.QuotaDoesNotSupported')}
          />
        </Card>
      )}
    </BAIFlex>
  );
};

export default StorageHostSettingPage;
