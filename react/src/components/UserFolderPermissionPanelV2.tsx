/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { UserFolderPermissionPanelV2Query } from '../__generated__/UserFolderPermissionPanelV2Query.graphql';
import { UserFolderPermissionPanelV2_storageVolumeFrgmt$key } from '../__generated__/UserFolderPermissionPanelV2_storageVolumeFrgmt.graphql';
import KeypairResourcePolicyStoragePermissionTableV2 from './KeypairResourcePolicyStoragePermissionTableV2';
import { BAIAlert, BAICard, BAIFlex, BAIUserSelect } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';

interface UserFolderPermissionPanelV2Props {
  storageVolumeFrgmt: UserFolderPermissionPanelV2_storageVolumeFrgmt$key;
}

/**
 * "User Folder Permissions" tab. Permissions applied to a user's personal
 * folders are controlled by the keypair resource policies their keypairs are
 * bound to.
 *
 * With no user selected the table pages through every keypair resource policy
 * (`adminKeypairResourcePoliciesV2` offset pagination). Selecting a user filters
 * the table to the policies that govern that user's keypairs (via the
 * `keypair.userId` nested filter) and reveals each policy's assigned keypairs.
 */
const UserFolderPermissionPanelV2: React.FC<
  UserFolderPermissionPanelV2Props
> = ({ storageVolumeFrgmt }) => {
  'use memo';
  const { t } = useTranslation();

  const storageVolume = useFragment(
    graphql`
      fragment UserFolderPermissionPanelV2_storageVolumeFrgmt on StorageVolume {
        ...KeypairResourcePolicyStoragePermissionTableV2_storageVolumeFrgmt
      }
    `,
    storageVolumeFrgmt,
  );

  const { vfolder_host_permissions } =
    useLazyLoadQuery<UserFolderPermissionPanelV2Query>(
      graphql`
        query UserFolderPermissionPanelV2Query {
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

  // Local user id (UUID) of the selected user, or undefined to show all
  // policies. `BAIUserSelect` with `valuePropName="id"` yields the local id
  // that `keypair.userId` (a `UUIDFilter`) expects.
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>();

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
          <BAIUserSelect
            valuePropName="id"
            excludeInactive
            allowClear
            value={selectedUserId}
            onChange={(value) =>
              setSelectedUserId(
                _.isArray(value) ? value[0] : (value ?? undefined),
              )
            }
            style={{ width: 320 }}
          />
        }
        styles={{ body: { paddingTop: 0 } }}
      >
        <KeypairResourcePolicyStoragePermissionTableV2
          storageVolumeFrgmt={storageVolume}
          userId={selectedUserId}
          permissionKeys={permissionKeys}
        />
      </BAICard>
    </BAIFlex>
  );
};

export default UserFolderPermissionPanelV2;
