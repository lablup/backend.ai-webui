/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { StorageHostDetailDrawerContentFragment$key } from '../__generated__/StorageHostDetailDrawerContentFragment.graphql';
import ErrorBoundaryWithNullFallback from './ErrorBoundaryWithNullFallback';
import ProjectFolderPermissionPanel from './ProjectFolderPermissionPanel';
import StorageHostResourcePanel from './StorageHostResourcePanel';
import StorageHostSettingsPanel from './StorageHostSettingsPanel';
import UserFolderPermissionPanel from './UserFolderPermissionPanel';
import { Empty, Skeleton, Tabs, Typography } from 'antd';
import { BAICard, BAIFlex } from 'backend.ai-ui';
import React, { Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

interface StorageHostDetailDrawerContentProps {
  storageVolumeFrgmt: StorageHostDetailDrawerContentFragment$key;
}

type TabKey = 'projectFolderPermissions' | 'userFolderPermissions' | 'capacity';

const StorageHostDetailDrawerContent: React.FC<
  StorageHostDetailDrawerContentProps
> = ({ storageVolumeFrgmt }) => {
  'use memo';
  const { t } = useTranslation();
  // This drawer is only reachable from the admin Resources page, so all tabs
  // are always shown without an in-component role check.
  const [activeTabKey, setActiveTabKey] = useState<TabKey>(
    'projectFolderPermissions',
  );

  const storageVolume = useFragment(
    graphql`
      fragment StorageHostDetailDrawerContentFragment on StorageVolume {
        id
        path
        capabilities
        ...StorageHostResourcePanelFragment
        ...StorageHostSettingsPanel_storageVolumeFrgmt
        ...ProjectFolderPermissionPanel_storageVolumeFrgmt
        ...UserFolderPermissionPanel_storageVolumeFrgmt
      }
    `,
    storageVolumeFrgmt,
  );

  // The storage host id is read from the fragment rather than passed in.
  const storageHostId = storageVolume?.id ?? '';
  const isQuotaSupportedStorage =
    storageVolume?.capabilities?.includes('quota') ?? false;

  return (
    <BAIFlex direction="column" align="stretch" gap="md">
      <BAIFlex direction="column" align="start">
        <Typography.Title level={3} style={{ margin: 0 }}>
          {storageHostId}
        </Typography.Title>
        {storageVolume?.path ? (
          <Typography.Text type="secondary">
            {storageVolume.path}
          </Typography.Text>
        ) : null}
      </BAIFlex>
      <StorageHostResourcePanel storageVolumeFrgmt={storageVolume} />
      <Tabs
        activeKey={activeTabKey}
        onChange={(key: string) => setActiveTabKey(key as TabKey)}
        items={[
          {
            key: 'projectFolderPermissions',
            label: t('storageHost.tab.ProjectFolderPermissions'),
            children: (
              <ErrorBoundaryWithNullFallback>
                <Suspense fallback={<Skeleton active />}>
                  <ProjectFolderPermissionPanel
                    storageVolumeFrgmt={storageVolume}
                  />
                </Suspense>
              </ErrorBoundaryWithNullFallback>
            ),
          },
          {
            key: 'userFolderPermissions',
            label: t('storageHost.tab.UserFolderPermissions'),
            children: (
              <ErrorBoundaryWithNullFallback>
                <Suspense fallback={<Skeleton active />}>
                  <UserFolderPermissionPanel
                    storageVolumeFrgmt={storageVolume}
                  />
                </Suspense>
              </ErrorBoundaryWithNullFallback>
            ),
          },
          {
            key: 'capacity',
            label: t('storageHost.tab.CapacitySetting'),
            children: isQuotaSupportedStorage ? (
              <ErrorBoundaryWithNullFallback>
                <Suspense fallback={<Skeleton active />}>
                  <StorageHostSettingsPanel
                    storageVolumeFrgmt={storageVolume}
                  />
                </Suspense>
              </ErrorBoundaryWithNullFallback>
            ) : (
              <BAICard styles={{ body: { paddingTop: 0 } }}>
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={t('storageHost.QuotaDoesNotSupported')}
                />
              </BAICard>
            ),
          },
        ]}
      />
    </BAIFlex>
  );
};

export default StorageHostDetailDrawerContent;
