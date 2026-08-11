/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { StorageHostDetailDrawerContentFragment$key } from '../__generated__/StorageHostDetailDrawerContentFragment.graphql';
import { useSuspendedBackendaiClient } from '../hooks';
import ErrorBoundaryWithNullFallback from './ErrorBoundaryWithNullFallback';
import ProjectFolderPermissionPanel from './ProjectFolderPermissionPanel';
import StorageHostResourcePanel from './StorageHostResourcePanel';
import StorageHostSettingsPanel from './StorageHostSettingsPanel';
import UserFolderPermissionPanel from './UserFolderPermissionPanel';
import UserFolderPermissionPanelV2 from './UserFolderPermissionPanelV2';
import BAISkeletonAstryx from './astryx-bui/BAISkeletonAstryx';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { Heading } from '@astryxdesign/core/Heading';
import { Tab, TabList } from '@astryxdesign/core/TabList';
import { Text } from '@astryxdesign/core/Text';
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
        ...UserFolderPermissionPanelV2_storageVolumeFrgmt
      }
    `,
    storageVolumeFrgmt,
  );

  // The storage host id is read from the fragment rather than passed in.
  const storageHostId = storageVolume?.id ?? '';
  const isQuotaSupportedStorage =
    storageVolume?.capabilities?.includes('quota') ?? false;

  // The keypair-scoped User Folder Permissions view (filter policies by a
  // user's keypairs + Assigned Keypairs column) relies on the `keypair.userId`
  // filter and `keypairs` connection added to `adminKeypairResourcePoliciesV2`
  // in 26.4.4. Older managers fall back to the policy-name selection view.
  const baiClient = useSuspendedBackendaiClient();
  const supportsKeypairUserFilter =
    baiClient?.supports('keypair-resource-policy-user-filter') ?? false;

  return (
    <BAIFlex direction="column" align="stretch" gap="md">
      <BAIFlex direction="column" align="start">
        <Heading level={3}>{storageHostId}</Heading>
        {storageVolume?.path ? (
          <Text color="secondary">{storageVolume.path}</Text>
        ) : null}
      </BAIFlex>
      <StorageHostResourcePanel storageVolumeFrgmt={storageVolume} />
      {/* antd Tabs → TabList + Tab (MAPPING §4): navigation only, panel is
          self-rendered below. */}
      <TabList
        value={activeTabKey}
        onChange={(key) => setActiveTabKey(key as TabKey)}
      >
        <Tab
          value="projectFolderPermissions"
          label={t('storageHost.tab.ProjectFolderPermissions')}
        />
        <Tab
          value="userFolderPermissions"
          label={t('storageHost.tab.UserFolderPermissions')}
        />
        <Tab value="capacity" label={t('storageHost.tab.CapacitySetting')} />
      </TabList>
      {activeTabKey === 'projectFolderPermissions' && (
        <ErrorBoundaryWithNullFallback>
          <Suspense fallback={<BAISkeletonAstryx />}>
            <ProjectFolderPermissionPanel storageVolumeFrgmt={storageVolume} />
          </Suspense>
        </ErrorBoundaryWithNullFallback>
      )}
      {activeTabKey === 'userFolderPermissions' && (
        <ErrorBoundaryWithNullFallback>
          <Suspense fallback={<BAISkeletonAstryx />}>
            {supportsKeypairUserFilter ? (
              <UserFolderPermissionPanelV2 storageVolumeFrgmt={storageVolume} />
            ) : (
              <UserFolderPermissionPanel storageVolumeFrgmt={storageVolume} />
            )}
          </Suspense>
        </ErrorBoundaryWithNullFallback>
      )}
      {activeTabKey === 'capacity' &&
        (isQuotaSupportedStorage ? (
          <ErrorBoundaryWithNullFallback>
            <Suspense fallback={<BAISkeletonAstryx />}>
              <StorageHostSettingsPanel storageVolumeFrgmt={storageVolume} />
            </Suspense>
          </ErrorBoundaryWithNullFallback>
        ) : (
          <BAICard styles={{ body: { paddingTop: 0 } }}>
            <EmptyState
              title={t('storageHost.QuotaDoesNotSupported')}
              isCompact
            />
          </BAICard>
        ))}
    </BAIFlex>
  );
};

export default StorageHostDetailDrawerContent;
