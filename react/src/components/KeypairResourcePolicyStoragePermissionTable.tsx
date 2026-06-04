/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { KeypairResourcePolicyStoragePermissionTableQuery as KeypairResourcePolicyStoragePermissionTableQueryType } from '../__generated__/KeypairResourcePolicyStoragePermissionTableQuery.graphql';
import { KeypairResourcePolicyStoragePermissionTableUpdateMutation } from '../__generated__/KeypairResourcePolicyStoragePermissionTableUpdateMutation.graphql';
import { KeypairResourcePolicyStoragePermissionTable_storageVolumeFrgmt$key } from '../__generated__/KeypairResourcePolicyStoragePermissionTable_storageVolumeFrgmt.graphql';
import {
  PERMISSION_DISPLAY_MAP,
  keyToV2Enum,
  v2PermissionToKey,
} from '../helper/storageHostPermission';
import StoragePermissionEditModal from './StoragePermissionEditModal';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { Typography, theme } from 'antd';
import {
  BAINameActionCell,
  BAITable,
  type BAITableProps,
  BAIUnmountAfterClose,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React, { useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  graphql,
  useFragment,
  useLazyLoadQuery,
  useMutation,
} from 'react-relay';

type KeypairResourcePolicyRow = NonNullable<
  NonNullable<
    NonNullable<
      KeypairResourcePolicyStoragePermissionTableQueryType['response']['adminKeypairResourcePoliciesV2']
    >['edges'][number]
  >['node']
>;

export interface KeypairResourcePolicyStoragePermissionTableProps extends BAITableProps<KeypairResourcePolicyRow> {
  /** Fragment for the storage host — its `id` is read internally. */
  storageVolumeFrgmt: KeypairResourcePolicyStoragePermissionTable_storageVolumeFrgmt$key;
  /**
   * Policy names picked via `BAIAdminKeypairResourcePolicySelect` (multi).
   * Empty array keeps the query skipped. Passed as `filter.name.in` to
   * `adminKeypairResourcePoliciesV2` and as `name` to
   * `adminUpdateKeypairResourcePolicyV2` on save.
   */
  selectedPolicyNames: string[];
  permissionKeys: string[];
}

const KeypairResourcePolicyStoragePermissionTable: React.FC<
  KeypairResourcePolicyStoragePermissionTableProps
> = ({
  storageVolumeFrgmt,
  selectedPolicyNames,
  permissionKeys,
  ...tableProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const storageVolume = useFragment(
    graphql`
      fragment KeypairResourcePolicyStoragePermissionTable_storageVolumeFrgmt on StorageVolume {
        id
      }
    `,
    storageVolumeFrgmt,
  );
  const storageHostId = storageVolume?.id ?? '';
  const [editingRow, setEditingRow] = useState<KeypairResourcePolicyRow | null>(
    null,
  );

  const queryVariables = {
    names: selectedPolicyNames,
    skip: selectedPolicyNames.length === 0,
  };
  const deferredQueryVariables = useDeferredValue(queryVariables);

  // Read AND write via V2: `adminUpdateKeypairResourcePolicyV2` returns the
  // updated entity, so requesting `allowedVfolderHosts` in the mutation
  // response lets Relay update the normalized node in place — the table
  // refreshes without a manual refetch (no fetchKey needed).
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

  const [commitUpdateKrp] =
    useMutation<KeypairResourcePolicyStoragePermissionTableUpdateMutation>(
      graphql`
        mutation KeypairResourcePolicyStoragePermissionTableUpdateMutation(
          $name: String!
          $input: UpdateKeypairResourcePolicyInputGQL!
        ) {
          adminUpdateKeypairResourcePolicyV2(name: $name, input: $input) {
            keypairResourcePolicy {
              id
              allowedVfolderHosts {
                host
                permissions
              }
            }
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
    // Rebuild the full host list, replacing only this host's permissions.
    // `VFolderHostPermissionEntryInput.permissions` is typed `[String!]` but
    // carries `VFolderHostPermissionV2` enum VALUES. Other hosts come back from
    // the query already as enum values (keep verbatim); the edited host's
    // newKeys are kebab keys, so convert them to enum values via the canonical
    // `keyToV2Enum` helper — the single source of truth for the asymmetric
    // `set-user-specific-permission` ↔ `SET_USER_PERM` mapping.
    const allowedVfolderHosts = [
      ...(editingRow?.allowedVfolderHosts ?? [])
        .filter((e) => e.host !== storageHostId)
        .map((e) => ({ host: e.host, permissions: [...e.permissions] })),
      { host: storageHostId, permissions: newKeys.map(keyToV2Enum) },
    ];
    return new Promise((resolve) => {
      commitUpdateKrp({
        variables: { name: policyName, input: { allowedVfolderHosts } },
        onCompleted: (res, errors) => {
          if (
            errors?.length ||
            !res?.adminUpdateKeypairResourcePolicyV2?.keypairResourcePolicy
          ) {
            resolve({ ok: false, msg: errors?.[0]?.message });
          } else {
            // The mutation response carries the updated allowedVfolderHosts, so
            // Relay refreshes this row from the normalized store — no refetch.
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
            ) => (
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
                    title: t('storageHost.permission.EditPermissionsAction'),
                    icon: <SettingOutlined />,
                    onClick: () => setEditingRow(row),
                  },
                ]}
              />
            ),
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
          permissionKeys={permissionKeys}
          targets={
            editingRow
              ? [
                  {
                    id: editingRow.name,
                    name: editingRow.name,
                    enabled: editingEnabledSet,
                  },
                ]
              : []
          }
          onRequestClose={() => setEditingRow(null)}
          onSave={handleSave}
        />
      </BAIUnmountAfterClose>
    </>
  );
};

export default KeypairResourcePolicyStoragePermissionTable;
