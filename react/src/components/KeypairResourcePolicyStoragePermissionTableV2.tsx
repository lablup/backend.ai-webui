/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { KeypairResourcePolicyStoragePermissionTableV2Query as KeypairResourcePolicyStoragePermissionTableV2QueryType } from '../__generated__/KeypairResourcePolicyStoragePermissionTableV2Query.graphql';
import { KeypairResourcePolicyStoragePermissionTableV2UpdateMutation } from '../__generated__/KeypairResourcePolicyStoragePermissionTableV2UpdateMutation.graphql';
import { KeypairResourcePolicyStoragePermissionTableV2_storageVolumeFrgmt$key } from '../__generated__/KeypairResourcePolicyStoragePermissionTableV2_storageVolumeFrgmt.graphql';
import {
  PERMISSION_DISPLAY_MAP,
  v2PermissionToKey,
} from '../helper/storageHostPermission';
import { useBAIPaginationOptionState } from '../hooks/reactPaginationQueryOptions';
import StoragePermissionEditModal from './StoragePermissionEditModal';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { Tooltip, Typography, theme } from 'antd';
import {
  BAIFlex,
  BAINameActionCell,
  BAITable,
  type BAITableProps,
  BAITag,
  BAIUnmountAfterClose,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React, {
  useDeferredValue,
  useEffect,
  useEffectEvent,
  useState,
} from 'react';
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
      KeypairResourcePolicyStoragePermissionTableV2QueryType['response']['adminKeypairResourcePoliciesV2']
    >['edges'][number]
  >['node']
>;

export interface KeypairResourcePolicyStoragePermissionTableV2Props extends BAITableProps<KeypairResourcePolicyRow> {
  /** Fragment for the storage host — its `id` is read internally. */
  storageVolumeFrgmt: KeypairResourcePolicyStoragePermissionTableV2_storageVolumeFrgmt$key;
  /**
   * Local user id (UUID) selected via `BAIUserSelect`. When set, the table is
   * filtered to the keypair resource policies that govern this user's keypairs
   * (`filter.keypair.userId.equals`) and the Assigned Keypairs column resolves
   * each policy's `keypairs` connection. When undefined, the table pages
   * through every policy and the Assigned Keypairs column is withheld.
   */
  userId?: string | null;
  permissionKeys: string[];
}

const KeypairResourcePolicyStoragePermissionTableV2: React.FC<
  KeypairResourcePolicyStoragePermissionTableV2Props
> = ({ storageVolumeFrgmt, userId, permissionKeys, ...tableProps }) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const storageVolume = useFragment(
    graphql`
      fragment KeypairResourcePolicyStoragePermissionTableV2_storageVolumeFrgmt on StorageVolume {
        id
      }
    `,
    storageVolumeFrgmt,
  );
  const storageHostId = storageVolume?.id ?? '';
  const [editingRow, setEditingRow] = useState<KeypairResourcePolicyRow | null>(
    null,
  );

  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionState({ current: 1, pageSize: 10 });

  // The user filter narrows the result set, so reset to the first page when it
  // changes to avoid landing on an out-of-range offset.
  const resetToFirstPage = useEffectEvent(() => {
    setTablePaginationOption({
      current: 1,
      pageSize: tablePaginationOption.pageSize,
    });
  });
  useEffect(() => {
    resetToFirstPage();
  }, [userId]);

  const includeKeypairs = !!userId;
  const queryVariables = {
    filter: userId ? { keypair: { userId: { equals: userId } } } : null,
    limit: baiPaginationOption.limit,
    offset: baiPaginationOption.offset,
    includeKeypairs,
    // Scope each policy's `keypairs` connection to the selected user too, so the
    // Assigned Keypairs column (access keys + `+N` count) reflects only that
    // user's keypairs governed by the policy — not every keypair on the policy.
    keypairFilter: userId ? { userId: { equals: userId } } : null,
  };
  const deferredQueryVariables = useDeferredValue(queryVariables);

  // Read AND write via V2: `adminUpdateKeypairResourcePolicyV2` returns the
  // updated entity, so requesting `allowedVfolderHosts` in the mutation
  // response lets Relay update the normalized node in place — the table
  // refreshes without a manual refetch (no fetchKey needed).
  const { adminKeypairResourcePoliciesV2 } =
    useLazyLoadQuery<KeypairResourcePolicyStoragePermissionTableV2QueryType>(
      graphql`
        query KeypairResourcePolicyStoragePermissionTableV2Query(
          $filter: KeypairResourcePolicyV2Filter
          $limit: Int!
          $offset: Int!
          $includeKeypairs: Boolean!
          $keypairFilter: KeypairFilter
        ) {
          adminKeypairResourcePoliciesV2(
            filter: $filter
            limit: $limit
            offset: $offset
            orderBy: [{ field: NAME, direction: ASC }]
          ) {
            count
            edges {
              node {
                id
                name
                allowedVfolderHosts {
                  host
                  permissions
                }
                keypairs(filter: $keypairFilter)
                  @include(if: $includeKeypairs) {
                  edges {
                    node {
                      id
                      accessKey
                      user {
                        organization {
                          mainAccessKey
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `,
      deferredQueryVariables,
      { fetchPolicy: 'network-only' },
    );

  const rows: KeypairResourcePolicyRow[] = _.compact(
    adminKeypairResourcePoliciesV2?.edges?.map((edge) => edge?.node),
  );
  const totalCount = adminKeypairResourcePoliciesV2?.count ?? 0;

  const [commitUpdateKrp] =
    useMutation<KeypairResourcePolicyStoragePermissionTableV2UpdateMutation>(
      graphql`
        mutation KeypairResourcePolicyStoragePermissionTableV2UpdateMutation(
          $name: String!
          $input: UpdateKeypairResourcePolicyInput!
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
    // The mutation input's `permissions` is `[String!]`, validated server-side
    // against the V1 `VFolderHostPermission` enum — i.e. kebab values like
    // `mount-in-session`, NOT the `VFolderHostPermissionV2` enum NAMES
    // (`MOUNT_IN_SESSION`) the read returns. So normalize every host to kebab:
    // other hosts via `v2PermissionToKey` (their read values are V2 enum
    // names), and the edited host's `newKeys` are already kebab keys.
    const allowedVfolderHosts = [
      ...(editingRow?.allowedVfolderHosts ?? [])
        .filter((e) => e.host !== storageHostId)
        .map((e) => ({
          host: e.host,
          permissions: e.permissions.map(v2PermissionToKey),
        })),
      { host: storageHostId, permissions: newKeys },
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
        loading={queryVariables !== deferredQueryVariables}
        dataSource={rows}
        pagination={{
          pageSize: tablePaginationOption.pageSize,
          current: tablePaginationOption.current,
          total: totalCount,
          onChange(current, pageSize) {
            if (_.isNumber(current) && _.isNumber(pageSize)) {
              setTablePaginationOption({ current, pageSize });
            }
          },
        }}
        locale={{
          emptyText: t('storageHost.permission.NoKeypairResourcePolicies'),
          ...(tableProps.locale ?? {}),
        }}
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
          {
            title: t('storageHost.permission.AssignedKeypairs'),
            key: 'assignedKeypairs',
            render: (
              _value: KeypairResourcePolicyRow,
              row: KeypairResourcePolicyRow,
            ) => {
              // No user selected: a policy may govern a large number of
              // keypairs, so withhold the list and prompt the operator to pick
              // a user to scope the view.
              if (!userId) {
                return (
                  <Tooltip
                    title={t('storageHost.permission.SelectUserToSeeKeypairs')}
                  >
                    <ExclamationCircleOutlined
                      style={{ color: token.colorWarning }}
                    />
                  </Tooltip>
                );
              }
              const keypairNodes = _.compact(
                row.keypairs?.edges?.map((edge) => edge?.node),
              );
              if (keypairNodes.length === 0) {
                return <Typography.Text type="secondary">-</Typography.Text>;
              }
              const isMainAccessKey = (
                kp: (typeof keypairNodes)[number],
              ): boolean =>
                !!kp.user?.organization?.mainAccessKey &&
                kp.accessKey === kp.user.organization.mainAccessKey;
              // Stack every assigned keypair as its own tag, with the user's
              // main access key sorted to the top (client-side — the connection
              // isn't server-ordered) and highlighted in `colorPrimary` with a
              // leading info icon + tooltip.
              const sortedKeypairNodes = _.sortBy(keypairNodes, (kp) =>
                isMainAccessKey(kp) ? 0 : 1,
              );
              return (
                <BAIFlex direction="column" align="start" gap="xxs">
                  {sortedKeypairNodes.map((kp) =>
                    isMainAccessKey(kp) ? (
                      <Tooltip
                        key={kp.id}
                        title={t('credential.MainAccessKey')}
                      >
                        <BAITag
                          icon={<InfoCircleOutlined />}
                          style={{
                            color: token.colorPrimary,
                            borderColor: token.colorPrimary,
                          }}
                        >
                          {kp.accessKey}
                        </BAITag>
                      </Tooltip>
                    ) : (
                      <BAITag key={kp.id}>{kp.accessKey}</BAITag>
                    ),
                  )}
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

export default KeypairResourcePolicyStoragePermissionTableV2;
