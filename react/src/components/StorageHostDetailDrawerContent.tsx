/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { StorageHostDetailDrawerContentFragment$key } from '../__generated__/StorageHostDetailDrawerContentFragment.graphql';
import { useCurrentUserRole } from '../hooks/backendai';
import ErrorBoundaryWithNullFallback from './ErrorBoundaryWithNullFallback';
import StorageHostPermissionPanel from './StorageHostPermissionPanel';
import StorageHostResourcePanel from './StorageHostResourcePanel';
import StorageHostSettingsPanel from './StorageHostSettingsPanel';
import { Empty, Skeleton, Tabs, Typography } from 'antd';
import { BAICard, BAIFlex } from 'backend.ai-ui';
import React, { Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

interface StorageHostDetailDrawerContentProps {
  storageVolumeFrgmt: StorageHostDetailDrawerContentFragment$key;
  storageHostId: string;
}

type TabKey = 'capacity' | 'permissions';

const StorageHostDetailDrawerContent: React.FC<
  StorageHostDetailDrawerContentProps
> = ({ storageVolumeFrgmt, storageHostId }) => {
  'use memo';
  const { t } = useTranslation();
  const userRole = useCurrentUserRole();
  const isSuperadmin = userRole === 'superadmin';
  // Permissions tab takes priority for superadmin (the one role that sees it).
  // Non-superadmin only sees the Capacity Setting tab.
  const [activeTabKey, setActiveTabKey] = useState<TabKey>(
    isSuperadmin ? 'permissions' : 'capacity',
  );

  const storageVolume = useFragment(
    graphql`
      fragment StorageHostDetailDrawerContentFragment on StorageVolume {
        id
        path
        capabilities
        ...StorageHostResourcePanelFragment
        ...StorageHostSettingsPanel_storageVolumeFrgmt
      }
    `,
    storageVolumeFrgmt,
  );

  const isQuotaSupportedStorage =
    storageVolume?.capabilities?.includes('quota') ?? false;

  return (
    <BAIFlex direction="column" align="stretch" gap="md">
      <BAIFlex direction="column" align="start">
        <Typography.Title level={3} style={{ margin: 0 }}>
          {storageVolume?.id ?? storageHostId}
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
          ...(isSuperadmin
            ? [
                {
                  key: 'permissions',
                  label: t('storageHost.tab.Permissions'),
                  children: (
                    <ErrorBoundaryWithNullFallback>
                      <Suspense fallback={<Skeleton active />}>
                        <StorageHostPermissionPanel
                          storageHostId={storageHostId}
                        />
                      </Suspense>
                    </ErrorBoundaryWithNullFallback>
                  ),
                },
              ]
            : []),
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
