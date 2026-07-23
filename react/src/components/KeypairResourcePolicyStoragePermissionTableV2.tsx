/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { KeypairResourcePolicyStoragePermissionTableV2PermissionQuery } from '../__generated__/KeypairResourcePolicyStoragePermissionTableV2PermissionQuery.graphql';
import { KeypairResourcePolicyStoragePermissionTableV2UpdateMutation } from '../__generated__/KeypairResourcePolicyStoragePermissionTableV2UpdateMutation.graphql';
import {
  KeypairResourcePolicyStoragePermissionTableV2_nodeFrgmt$data,
  KeypairResourcePolicyStoragePermissionTableV2_nodeFrgmt$key,
} from '../__generated__/KeypairResourcePolicyStoragePermissionTableV2_nodeFrgmt.graphql';
import { KeypairResourcePolicyStoragePermissionTableV2_storageVolumeFrgmt$key } from '../__generated__/KeypairResourcePolicyStoragePermissionTableV2_storageVolumeFrgmt.graphql';
import {
  PERMISSION_DISPLAY_MAP,
  v2PermissionToKey,
} from '../helper/storageHostPermission';
import StoragePermissionEditModal from './StoragePermissionEditModal';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
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
import { SquarePenIcon } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  graphql,
  useFragment,
  useLazyLoadQuery,
  useMutation,
} from 'react-relay';

type KeypairResourcePolicyRow =
  KeypairResourcePolicyStoragePermissionTableV2_nodeFrgmt$data[number];

export interface KeypairResourcePolicyStoragePermissionTableV2Props extends BAITableProps<KeypairResourcePolicyRow> {
  /** Fragment for the storage host — its `id` is read internally. */
  storageVolumeFrgmt: KeypairResourcePolicyStoragePermissionTableV2_storageVolumeFrgmt$key;
  /**
   * Plural node fragment — the page of keypair resource policies to render. The
   * orchestrator (panel) owns the query, so `pagination` (with `total`),
   * `loading`, filtering, and refresh are injected via `BAITableProps`.
   */
  policiesFrgmt: KeypairResourcePolicyStoragePermissionTableV2_nodeFrgmt$key;
  /**
   * The selected user's UUID (from the panel's user picker). Drives the
   * Assigned Keypairs column: when undefined the column is withheld with a
   * prompt to pick a user.
   */
  selectedUserId?: string;
}

const KeypairResourcePolicyStoragePermissionTableV2: React.FC<
  KeypairResourcePolicyStoragePermissionTableV2Props
> = ({ storageVolumeFrgmt, policiesFrgmt, selectedUserId, ...tableProps }) => {
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

  // Static permission catalog (the universe of vfolder host permission keys).
  // This panel has a single card, so the table fetches its own catalog instead
  // of receiving it as a prop; fetched once and served from the store after.
  const { vfolder_host_permissions } =
    useLazyLoadQuery<KeypairResourcePolicyStoragePermissionTableV2PermissionQuery>(
      graphql`
        query KeypairResourcePolicyStoragePermissionTableV2PermissionQuery {
          vfolder_host_permissions {
            vfolder_host_permission_list
          }
        }
      `,
      {},
      { fetchPolicy: 'store-or-network' },
    );
  const permissionKeys = _.compact(
    vfolder_host_permissions?.vfolder_host_permission_list ?? [],
  );

  // Read AND write via V2: `adminUpdateKeypairResourcePolicyV2` returns the
  // updated entity, so requesting `allowedVfolderHosts` in the mutation
  // response lets Relay update the normalized node in place — the table
  // refreshes from the orchestrator's store without a manual refetch.
  //
  // Plural node fragment: the orchestrator selects the connection (count +
  // edges) and hands this page of nodes down. `$keypairFilter` /
  // `$includeKeypairs` are root variables supplied by that query, so no
  // `@argumentDefinitions` is needed here.
  const rows = _.compact(
    useFragment(
      graphql`
        fragment KeypairResourcePolicyStoragePermissionTableV2_nodeFrgmt on KeypairResourcePolicyV2
        @relay(plural: true) {
          id
          name
          allowedVfolderHosts {
            host
            permissions
          }
          keypairs(filter: $keypairFilter) @include(if: $includeKeypairs) {
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
      `,
      policiesFrgmt,
    ),
  );

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
        dataSource={rows}
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
                    icon: <SquarePenIcon />,
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
              if (!selectedUserId) {
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
