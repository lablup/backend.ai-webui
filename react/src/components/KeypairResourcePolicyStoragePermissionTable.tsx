/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { KeypairResourcePolicyStoragePermissionTableModifyMutation } from '../__generated__/KeypairResourcePolicyStoragePermissionTableModifyMutation.graphql';
import { KeypairResourcePolicyStoragePermissionTableQuery as KeypairResourcePolicyStoragePermissionTableQueryType } from '../__generated__/KeypairResourcePolicyStoragePermissionTableQuery.graphql';
import {
  PERMISSION_DISPLAY_MAP,
  buildAllowedHostsPayloadFromV2,
  v2PermissionToKey,
} from '../helper/storageHostPermission';
import StoragePermissionEditModal from './StoragePermissionEditModal';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EditFilled,
} from '@ant-design/icons';
import { Typography, theme } from 'antd';
import {
  BAIFlex,
  BAINameActionCell,
  BAITable,
  type BAITableProps,
  BAIUnmountAfterClose,
  useFetchKey,
} from 'backend.ai-ui';
import React, { useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery, useMutation } from 'react-relay';

type KeypairResourcePolicyRow = NonNullable<
  KeypairResourcePolicyStoragePermissionTableQueryType['response']['adminKeypairResourcePolicyV2']
>;

export interface KeypairResourcePolicyStoragePermissionTableProps extends BAITableProps<KeypairResourcePolicyRow> {
  storageHostId: string;
  /**
   * Policy name picked via `BAIAdminKeypairResourcePolicySelect`. Undefined
   * keeps the query skipped (no network call). KRP `name` is both the
   * identifier and the display label.
   */
  selectedPolicyName?: string;
  permissionKeys: string[];
}

const KeypairResourcePolicyStoragePermissionTable: React.FC<
  KeypairResourcePolicyStoragePermissionTableProps
> = ({ storageHostId, selectedPolicyName, permissionKeys, ...tableProps }) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);

  // Bump on successful save to re-fetch the (otherwise cached) entity so the
  // table reflects the new permissions immediately. Deferred so the previous
  // row stays visible while the new data loads.
  const [fetchKey, updateFetchKey] = useFetchKey();
  const deferredFetchKey = useDeferredValue(fetchKey);

  const queryVariables = {
    name: selectedPolicyName ?? '',
    skip: !selectedPolicyName,
  };
  const deferredQueryVariables = useDeferredValue(queryVariables);

  const { adminKeypairResourcePolicyV2 } =
    useLazyLoadQuery<KeypairResourcePolicyStoragePermissionTableQueryType>(
      graphql`
        query KeypairResourcePolicyStoragePermissionTableQuery(
          $name: String!
          $skip: Boolean!
        ) {
          adminKeypairResourcePolicyV2(name: $name) @skip(if: $skip) {
            id
            name
            allowedVfolderHosts {
              host
              permissions
            }
          }
        }
      `,
      deferredQueryVariables,
      {
        fetchPolicy: deferredQueryVariables.skip
          ? 'store-only'
          : 'network-only',
        fetchKey: deferredFetchKey,
      },
    );

  const allowedHosts = adminKeypairResourcePolicyV2?.allowedVfolderHosts ?? [];
  const hostEntry = allowedHosts.find((e) => e.host === storageHostId);
  const isHostAllowed = !!hostEntry;
  const enabledKeys = hostEntry?.permissions.map(v2PermissionToKey) ?? [];
  const enabledSet = new Set(enabledKeys);

  // Mutation still goes through V1 `modify_keypair_resource_policy` because the
  // V2 update mutation has not been wired yet — V2 read, V1 write. The
  // JSONString payload is rebuilt from V2 structured entries via
  // `buildAllowedHostsPayloadFromV2`, preserving all other hosts.
  const [commitModifyKrp] =
    useMutation<KeypairResourcePolicyStoragePermissionTableModifyMutation>(
      graphql`
        mutation KeypairResourcePolicyStoragePermissionTableModifyMutation(
          $name: String!
          $props: ModifyKeyPairResourcePolicyInput!
        ) {
          modify_keypair_resource_policy(name: $name, props: $props) {
            ok
            msg
          }
        }
      `,
    );

  const handleSave = async (
    newKeys: string[],
  ): Promise<{ ok: boolean; msg?: string | null }> => {
    if (!selectedPolicyName) {
      return { ok: false, msg: t('storageHost.permission.SaveFailed') };
    }
    const payload = buildAllowedHostsPayloadFromV2(
      allowedHosts,
      storageHostId,
      newKeys,
    );
    return new Promise((resolve) => {
      commitModifyKrp({
        variables: {
          name: selectedPolicyName,
          props: { allowed_vfolder_hosts: payload },
        },
        onCompleted: (res, errors) => {
          if (errors?.length || !res?.modify_keypair_resource_policy?.ok) {
            resolve({
              ok: false,
              msg: res?.modify_keypair_resource_policy?.msg,
            });
          } else {
            // Refetch so the table reflects the just-saved permissions.
            // `modify_keypair_resource_policy` returns only `{ ok, msg }`,
            // so Relay can't auto-update the cached V2 entry — we have to
            // re-issue the read query.
            updateFetchKey();
            resolve({ ok: true });
          }
        },
        onError: (err) => resolve({ ok: false, msg: err?.message }),
      });
    });
  };

  return (
    <>
      <BAITable
        size="small"
        scroll={{ x: 'max-content' }}
        {...tableProps}
        rowKey="id"
        resizable={false}
        pagination={false}
        loading={queryVariables !== deferredQueryVariables}
        dataSource={
          adminKeypairResourcePolicyV2 ? [adminKeypairResourcePolicyV2] : []
        }
        columns={[
          {
            title: t('storageHost.permission.Name'),
            key: 'name',
            fixed: 'left',
            width: 220,
            render: (_: unknown, row: KeypairResourcePolicyRow) => (
              <BAIFlex direction="column" align="start" gap="xxs">
                <BAINameActionCell
                  title={row.name}
                  showActions="always"
                  actions={[
                    {
                      key: 'edit',
                      title: t('storageHost.permission.EditPermissionsAction'),
                      icon: <EditFilled />,
                      onClick: () => setIsEditOpen(true),
                    },
                  ]}
                />
                <BAIFlex gap="xxs" align="center">
                  {isHostAllowed ? (
                    <>
                      <CheckCircleOutlined
                        style={{ color: token.colorSuccess }}
                      />
                      <Typography.Text type="secondary">
                        {t('storageHost.permission.HostAllowed')}
                      </Typography.Text>
                    </>
                  ) : (
                    <>
                      <CloseCircleOutlined
                        style={{ color: token.colorError }}
                      />
                      <Typography.Text type="secondary">
                        {t('storageHost.permission.HostNotAllowed')}
                      </Typography.Text>
                    </>
                  )}
                </BAIFlex>
              </BAIFlex>
            ),
          },
          ...permissionKeys.map((permKey) => {
            const display = PERMISSION_DISPLAY_MAP[permKey];
            return {
              title: display ? t(display.labelKey) : permKey,
              key: permKey,
              align: 'center' as const,
              render: () =>
                enabledSet.has(permKey) ? (
                  <CheckCircleOutlined style={{ color: token.colorSuccess }} />
                ) : (
                  <CloseCircleOutlined
                    style={{ color: token.colorTextDisabled }}
                  />
                ),
            };
          }),
        ]}
      />
      <BAIUnmountAfterClose>
        <StoragePermissionEditModal
          open={isEditOpen}
          title={t('storageHost.permission.EditPermissions', {
            name: adminKeypairResourcePolicyV2?.name ?? '',
          })}
          permissionKeys={permissionKeys}
          initialEnabled={enabledSet}
          onRequestClose={() => setIsEditOpen(false)}
          onSave={handleSave}
        />
      </BAIUnmountAfterClose>
    </>
  );
};

export default KeypairResourcePolicyStoragePermissionTable;
