/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { UserFolderPermissionPanelV2Query } from '../__generated__/UserFolderPermissionPanelV2Query.graphql';
import { UserFolderPermissionPanelV2_storageVolumeFrgmt$key } from '../__generated__/UserFolderPermissionPanelV2_storageVolumeFrgmt.graphql';
import KeypairResourcePolicyStoragePermissionTableV2 from './KeypairResourcePolicyStoragePermissionTableV2';
import {
  BAIAlert,
  BAICard,
  BAIFlex,
  BAIGraphQLPropertyFilter,
  BAIUserSelect,
  type GraphQLFilter,
} from 'backend.ai-ui';
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

  // The user picker emits the local user id (UUID) under `keypair.userId.equals`
  // — a valid `KeypairResourcePolicyV2Filter` passed straight to the table.
  const [userFilter, setUserFilter] = useState<GraphQLFilter | undefined>();

  return (
    <BAIFlex direction="column" align="stretch" gap="md">
      <BAIAlert
        type="info"
        showIcon
        description={t('storageHost.permission.UserFolderPermissionsNote')}
      />

      <BAICard
        title={t('storageHost.permission.KeypairResourcePolicies')}
        styles={{ body: { paddingTop: 0 } }}
      >
        <BAIFlex direction="column" align="stretch" gap="sm">
          <BAIGraphQLPropertyFilter
            style={{ flex: 1 }}
            value={userFilter}
            onChange={setUserFilter}
            filterProperties={[
              {
                key: 'keypair.userId',
                propertyLabel: t('storageHost.permission.Name'),
                type: 'uuid',
                fixedOperator: 'equals',
                renderInput: ({ value, onChange }) => (
                  <BAIUserSelect
                    valuePropName="id"
                    value={value}
                    onChange={onChange}
                    style={{ minWidth: 200 }}
                  />
                ),
              },
            ]}
          />
          <KeypairResourcePolicyStoragePermissionTableV2
            storageVolumeFrgmt={storageVolume}
            userFilter={userFilter}
            permissionKeys={permissionKeys}
          />
        </BAIFlex>
      </BAICard>
    </BAIFlex>
  );
};

export default UserFolderPermissionPanelV2;
