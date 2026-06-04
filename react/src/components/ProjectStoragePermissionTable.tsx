/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ProjectStoragePermissionTableModifyGroupMutation } from '../__generated__/ProjectStoragePermissionTableModifyGroupMutation.graphql';
import { ProjectStoragePermissionTableQuery as ProjectStoragePermissionTableQueryType } from '../__generated__/ProjectStoragePermissionTableQuery.graphql';
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
  toLocalId,
  useFetchKey,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React, { useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery, useMutation } from 'react-relay';

type ProjectRow = NonNullable<
  NonNullable<
    NonNullable<
      ProjectStoragePermissionTableQueryType['response']['adminProjectsV2']
    >['edges'][number]
  >['node']
>;

export interface ProjectStoragePermissionTableProps extends BAITableProps<ProjectRow> {
  storageHostId: string;
  /**
   * Raw UUIDs returned by `BAIAdminProjectSelect` (multi-mode). Empty array
   * keeps the query skipped. Passed as `filter.id.in` to `adminProjectsV2`
   * and as `gid` to `modify_group` (V1) on save.
   */
  selectedProjectUuids: string[];
  permissionKeys: string[];
  /**
   * Called when the user clicks the row's deselect action. The panel should
   * remove the UUID from its `selectedProjectUuids` array.
   */
  onDeselectItem?: (uuid: string) => void;
}

const ProjectStoragePermissionTable: React.FC<
  ProjectStoragePermissionTableProps
> = ({
  storageHostId,
  selectedProjectUuids,
  permissionKeys,
  onDeselectItem,
  ...tableProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [editingRow, setEditingRow] = useState<ProjectRow | null>(null);

  const [fetchKey, updateFetchKey] = useFetchKey();
  const deferredFetchKey = useDeferredValue(fetchKey);

  const queryVariables = {
    projectIds: selectedProjectUuids,
    skip: selectedProjectUuids.length === 0,
  };
  const deferredQueryVariables = useDeferredValue(queryVariables);

  const { adminProjectsV2 } =
    useLazyLoadQuery<ProjectStoragePermissionTableQueryType>(
      graphql`
        query ProjectStoragePermissionTableQuery(
          $projectIds: [UUID!]!
          $skip: Boolean!
        ) {
          adminProjectsV2(filter: { id: { in: $projectIds } }, limit: 10)
            @skip(if: $skip) {
            edges {
              node {
                id
                basicInfo {
                  name
                }
                storage {
                  allowedVfolderHosts {
                    host
                    permissions
                  }
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

  // Preserve the user's pick order: `adminProjectsV2` returns by its own
  // ordering, but the consumer expects rows in the order they were selected.
  const byUuid = new Map<string, ProjectRow>();
  _.forEach(adminProjectsV2?.edges, (edge) => {
    const node = edge?.node;
    if (node?.id) byUuid.set(toLocalId(node.id), node);
  });
  const deferredSelected = useDeferredValue(selectedProjectUuids);
  const rows: ProjectRow[] = _.compact(
    deferredSelected.map((uuid) => byUuid.get(uuid) ?? null),
  );

  const [commitModifyGroup] =
    useMutation<ProjectStoragePermissionTableModifyGroupMutation>(graphql`
      mutation ProjectStoragePermissionTableModifyGroupMutation(
        $gid: UUID!
        $props: ModifyGroupInput!
      ) {
        modify_group(gid: $gid, props: $props) {
          ok
          msg
        }
      }
    `);

  const handleSave = async (
    newKeys: string[],
  ): Promise<{ ok: boolean; msg?: string | null }> => {
    const gid = editingRow?.id ? toLocalId(editingRow.id) : undefined;
    if (!gid) {
      return { ok: false, msg: t('storageHost.permission.SaveFailed') };
    }
    const payload = buildAllowedHostsPayloadFromV2(
      editingRow?.storage?.allowedVfolderHosts ?? [],
      storageHostId,
      newKeys,
    );
    return new Promise((resolve) => {
      commitModifyGroup({
        variables: { gid, props: { allowed_vfolder_hosts: payload } },
        onCompleted: (res, errors) => {
          if (errors?.length || !res?.modify_group?.ok) {
            resolve({ ok: false, msg: res?.modify_group?.msg });
          } else {
            updateFetchKey();
            resolve({ ok: true });
          }
        },
        onError: (err) => resolve({ ok: false, msg: err?.message }),
      });
    });
  };

  // Pre-compute the editing row's enabled set so the modal sees a stable Set.
  const editingHosts = editingRow?.storage?.allowedVfolderHosts ?? [];
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
            render: (_value: ProjectRow, row: ProjectRow) => {
              const entry = row.storage?.allowedVfolderHosts?.find(
                (e) => e.host === storageHostId,
              );
              const isHostAllowed = !!entry;
              return (
                <BAIFlex direction="column" align="start" gap="xxs">
                  <BAINameActionCell
                    title={
                      <Typography.Text
                        ellipsis={{ tooltip: row.basicInfo?.name }}
                        style={{ maxWidth: 160 }}
                      >
                        {row.basicInfo?.name}
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
                        onClick: () =>
                          row.id && onDeselectItem?.(toLocalId(row.id)),
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
              render: (_value: ProjectRow, row: ProjectRow) => {
                const entry = row.storage?.allowedVfolderHosts?.find(
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
            name: editingRow?.basicInfo?.name ?? '',
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

export default ProjectStoragePermissionTable;
