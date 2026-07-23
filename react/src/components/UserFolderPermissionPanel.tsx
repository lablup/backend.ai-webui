/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { UserFolderPermissionPanelQuery } from '../__generated__/UserFolderPermissionPanelQuery.graphql';
import { UserFolderPermissionPanel_storageVolumeFrgmt$key } from '../__generated__/UserFolderPermissionPanel_storageVolumeFrgmt.graphql';
import KeypairResourcePolicyStoragePermissionTable from './KeypairResourcePolicyStoragePermissionTable';
import { Typography, theme } from 'antd';
import {
  BAIAdminKeypairResourcePolicySelect,
  BAIAlert,
  BAICard,
  BAIFlex,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';

interface UserFolderPermissionPanelProps {
  storageVolumeFrgmt: UserFolderPermissionPanel_storageVolumeFrgmt$key;
}

/**
 * Maximum keypair resource policies the card may show at once. The cap exists
 * because the V2 list-with-filter query is paged and reviewing more than ~10
 * permission matrices in one card defeats the per-entity inspection UX.
 */
const MAX_SELECTION = 10;

/**
 * "User Folder Permissions" tab. Permissions applied to a user's personal
 * folders are controlled by the keypair resource policies they belong to.
 */
const UserFolderPermissionPanel: React.FC<UserFolderPermissionPanelProps> = ({
  storageVolumeFrgmt,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();

  const storageVolume = useFragment(
    graphql`
      fragment UserFolderPermissionPanel_storageVolumeFrgmt on StorageVolume {
        ...KeypairResourcePolicyStoragePermissionTable_storageVolumeFrgmt
      }
    `,
    storageVolumeFrgmt,
  );

  const { vfolder_host_permissions } =
    useLazyLoadQuery<UserFolderPermissionPanelQuery>(
      graphql`
        query UserFolderPermissionPanelQuery {
          vfolder_host_permissions {
            vfolder_host_permission_list
          }
        }
      `,
      {},
      { fetchPolicy: 'store-and-network' },
    );
  const permissionKeys: string[] = _.compact(
    vfolder_host_permissions?.vfolder_host_permission_list ?? [],
  );

  const [selectedPolicyNames, setSelectedPolicyNames] = useState<string[]>([]);

  // Over-selecting (an 11th item) flips the select to an error state; the
  // table caps its fetched dataSource at `MAX_SELECTION` regardless.
  const renderLimitMessage = (count: number) =>
    count > MAX_SELECTION ? (
      <Typography.Text type="danger" style={{ fontSize: token.fontSizeSM }}>
        {t('storageHost.permission.SelectionLimitExceeded', {
          max: MAX_SELECTION,
        })}
      </Typography.Text>
    ) : null;

  return (
    <BAIFlex direction="column" align="stretch" gap="md">
      <BAIAlert
        type="info"
        showIcon
        description={t('storageHost.permission.UserFolderPermissionsNote')}
      />

      <BAICard
        title={t('storageHost.permission.KeypairResourcePolicies')}
        extra={
          <BAIFlex direction="column" align="end" gap="xxs">
            <BAIAdminKeypairResourcePolicySelect
              mode="multiple"
              maxTagCount="responsive"
              value={selectedPolicyNames}
              onChange={(value) =>
                setSelectedPolicyNames((value as string[]) ?? [])
              }
              status={
                selectedPolicyNames.length > MAX_SELECTION ? 'error' : undefined
              }
              style={{ width: 320 }}
            />
            {renderLimitMessage(selectedPolicyNames.length)}
          </BAIFlex>
        }
        styles={{ body: { paddingTop: 0 } }}
      >
        <KeypairResourcePolicyStoragePermissionTable
          storageVolumeFrgmt={storageVolume}
          selectedPolicyNames={selectedPolicyNames.slice(0, MAX_SELECTION)}
          permissionKeys={permissionKeys}
          locale={{
            emptyText: t(
              'storageHost.permission.NoKeypairResourcePolicySelected',
            ),
          }}
        />
      </BAICard>
    </BAIFlex>
  );
};

export default UserFolderPermissionPanel;
