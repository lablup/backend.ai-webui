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
  MinusCircleOutlined,
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
import * as _ from 'lodash-es';
import React, { useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery, useMutation } from 'react-relay';

type KeypairResourcePolicyRow = NonNullable<
  NonNullable<
    NonNullable<
      KeypairResourcePolicyStoragePermissionTableQueryType['response']['adminKeypairResourcePoliciesV2']
    >['edges'][number]
  >['node']
>;

export interface KeypairResourcePolicyStoragePermissionTableProps extends BAITableProps<KeypairResourcePolicyRow> {
  storageHostId: string;
  /**
   * Policy names picked via `BAIAdminKeypairResourcePolicySelect` (multi).
   * Empty array keeps the query skipped. Passed as `filter.name.in` to
   * `adminKeypairResourcePoliciesV2` and as `name` to V1
   * `modify_keypair_resource_policy` on save.
   */
  selectedPolicyNames: string[];
  permissionKeys: string[];
  /**
   * Called when the user clicks the row's deselect action. The panel should
   * remove the name from its `selectedPolicyNames` array.
   */
  onDeselectItem?: (name: string) => void;
}

const KeypairResourcePolicyStoragePermissionTable: React.FC<
  KeypairResourcePolicyStoragePermissionTableProps
> = ({
  storageHostId,
  selectedPolicyNames,
  permissionKeys,
  onDeselectItem,
  ...tableProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [editingRow, setEditingRow] = useState<KeypairResourcePolicyRow | null>(
    null,
  );

  const [fetchKey, updateFetchKey] = useFetchKey();
  const deferredFetchKey = useDeferredValue(fetchKey);

  const queryVariables = {
    names: selectedPolicyNames,
    skip: selectedPolicyNames.length === 0,
  };
  const deferredQueryVariables = useDeferredValue(queryVariables);

  // Read via V2 list-with-filter; write still goes through V1
  // `modify_keypair_resource_policy` because no V2 update mutation has been
  // wired yet. JSONString payload rebuilt from V2 structured entries via
  // `buildAllowedHostsPayloadFromV2`, preserving all other hosts.
  const { adminKeypairResourcePoliciesV2 } =
    useLazyLoadQuery<KeypairResourcePolicyStoragePermissionTableQueryType>(
      graphql`
        query KeypairResourcePolicyStoragePermissionTableQuery(
          $names: [String!]!
          $skip: Boolean!
        ) {
          adminKeypairResourcePoliciesV2(
            filter: { name: { in: $names } }
            limit: 10
          ) @skip(if: $skip) {
            edges {
              node {
                id
                name
                allowedVfolderHosts {
                  host
                  permissions
                }
              }
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

  // Preserve selection order.
  const byName = new Map<string, KeypairResourcePolicyRow>();
  _.forEach(adminKeypairResourcePoliciesV2?.edges, (edge) => {
    const node = edge?.node;
    if (node?.name) byName.set(node.name, node);
  });
  const deferredSelected = useDeferredValue(selectedPolicyNames);
  const rows: KeypairResourcePolicyRow[] = _.compact(
    deferredSelected.map((n) => byName.get(n) ?? null),
  );

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
    const policyName = editingRow?.name;
    if (!policyName) {
      return { ok: false, msg: t('storageHost.permission.SaveFailed') };
    }
    const payload = buildAllowedHostsPayloadFromV2(
      editingRow?.allowedVfolderHosts ?? [],
      storageHostId,
      newKeys,
    );
    return new Promise((resolve) => {
      commitModifyKrp({
        variables: {
          name: policyName,
          props: { allowed_vfolder_hosts: payload },
        },
        onCompleted: (res, errors) => {
          if (errors?.length || !res?.modify_keypair_resource_policy?.ok) {
            resolve({
              ok: false,
              msg: res?.modify_keypair_resource_policy?.msg,
            });
          } else {
            updateFetchKey();
            resolve({ ok: true });
          }
        },
        onError: (err) => resolve({ ok: false, msg: err?.message }),
      });
    });
  };

  const editingHosts = editingRow?.allowedVfolderHosts ?? [];
  const editingEntry = editingHosts.find((e) => e.host === storageHostId);
  const editingEnabledSet = new Set(
    editingEntry?.permissions.map(v2PermissionToKey) ?? [],
  );

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
        dataSource={rows}
        columns={[
          {
            title: t('storageHost.permission.Name'),
            key: 'name',
            fixed: 'left',
            width: 240,
            render: (
              _value: KeypairResourcePolicyRow,
              row: KeypairResourcePolicyRow,
            ) => {
              const entry = row.allowedVfolderHosts?.find(
                (e) => e.host === storageHostId,
              );
              const isHostAllowed = !!entry;
              return (
                <BAIFlex direction="column" align="start" gap="xxs">
                  <BAINameActionCell
                    title={
                      <Typography.Text
                        ellipsis={{ tooltip: row.name }}
                        style={{ maxWidth: 160 }}
                      >
                        {row.name}
                      </Typography.Text>
                    }
                    showActions="always"
                    actions={[
                      {
                        key: 'edit',
                        title: t(
                          'storageHost.permission.EditPermissionsAction',
                        ),
                        icon: <EditFilled />,
                        onClick: () => setEditingRow(row),
                      },
                      {
                        key: 'deselect',
                        title: t('storageHost.permission.DeselectItem'),
                        icon: (
                          <MinusCircleOutlined
                            style={{ color: token.colorTextTertiary }}
                          />
                        ),
                        onClick: () => onDeselectItem?.(row.name),
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
              );
            },
          },
          ...permissionKeys.map((permKey) => {
            const display = PERMISSION_DISPLAY_MAP[permKey];
            return {
              title: display ? t(display.labelKey) : permKey,
              key: permKey,
              align: 'center' as const,
              render: (
                _value: KeypairResourcePolicyRow,
                row: KeypairResourcePolicyRow,
              ) => {
                const entry = row.allowedVfolderHosts?.find(
                  (e) => e.host === storageHostId,
                );
                const enabled = new Set(
                  entry?.permissions.map(v2PermissionToKey) ?? [],
                );
                return enabled.has(permKey) ? (
                  <CheckCircleOutlined style={{ color: token.colorSuccess }} />
                ) : (
                  <CloseCircleOutlined
                    style={{ color: token.colorTextDisabled }}
                  />
                );
              },
            };
          }),
        ]}
      />
      <BAIUnmountAfterClose>
        <StoragePermissionEditModal
          open={!!editingRow}
          title={t('storageHost.permission.EditPermissions', {
            name: editingRow?.name ?? '',
          })}
          permissionKeys={permissionKeys}
          initialEnabled={editingEnabledSet}
          onRequestClose={() => setEditingRow(null)}
          onSave={handleSave}
        />
      </BAIUnmountAfterClose>
    </>
  );
};

export default KeypairResourcePolicyStoragePermissionTable;
