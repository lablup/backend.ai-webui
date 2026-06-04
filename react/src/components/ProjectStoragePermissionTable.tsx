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

type ProjectRow = NonNullable<
  ProjectStoragePermissionTableQueryType['response']['projectV2']
>;

export interface ProjectStoragePermissionTableProps extends BAITableProps<ProjectRow> {
  storageHostId: string;
  /**
   * Raw UUID returned by `BAIAdminProjectSelect`. Passed directly to
   * `projectV2(projectId: UUID!)` and `modify_group(gid: UUID!)`.
   */
  selectedProjectUuid?: string;
  permissionKeys: string[];
}

const ProjectStoragePermissionTable: React.FC<
  ProjectStoragePermissionTableProps
> = ({ storageHostId, selectedProjectUuid, permissionKeys, ...tableProps }) => {
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
    projectId: selectedProjectUuid ?? '',
    skip: !selectedProjectUuid,
  };
  const deferredQueryVariables = useDeferredValue(queryVariables);

  const { projectV2 } =
    useLazyLoadQuery<ProjectStoragePermissionTableQueryType>(
      graphql`
        query ProjectStoragePermissionTableQuery(
          $projectId: UUID!
          $skip: Boolean!
        ) {
          projectV2(projectId: $projectId) @skip(if: $skip) {
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
      `,
      deferredQueryVariables,
      {
        fetchPolicy: deferredQueryVariables.skip
          ? 'store-only'
          : 'network-only',
        fetchKey: deferredFetchKey,
      },
    );

  const allowedHosts = projectV2?.storage?.allowedVfolderHosts ?? [];
  const hostEntry = allowedHosts.find((e) => e.host === storageHostId);
  const isHostAllowed = !!hostEntry;
  const enabledKeys = hostEntry?.permissions.map(v2PermissionToKey) ?? [];
  const enabledSet = new Set(enabledKeys);

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
    if (!selectedProjectUuid) {
      return { ok: false, msg: t('storageHost.permission.SaveFailed') };
    }
    const payload = buildAllowedHostsPayloadFromV2(
      allowedHosts,
      storageHostId,
      newKeys,
    );
    return new Promise((resolve) => {
      commitModifyGroup({
        variables: {
          gid: selectedProjectUuid,
          props: { allowed_vfolder_hosts: payload },
        },
        onCompleted: (res, errors) => {
          if (errors?.length || !res?.modify_group?.ok) {
            resolve({ ok: false, msg: res?.modify_group?.msg });
          } else {
            // Refetch so the table reflects the just-saved permissions.
            // `modify_group` returns only `{ ok, msg }`, so Relay can't
            // auto-update the cached `projectV2(projectId)` entry — we
            // have to re-issue the read query.
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
        dataSource={projectV2 ? [projectV2] : []}
        columns={[
          {
            title: t('storageHost.permission.Name'),
            key: 'name',
            fixed: 'left',
            width: 220,
            render: (_: unknown, row: ProjectRow) => (
              <BAIFlex direction="column" align="start" gap="xxs">
                <BAINameActionCell
                  title={row.basicInfo?.name ?? ''}
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
            name: projectV2?.basicInfo?.name ?? '',
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

export default ProjectStoragePermissionTable;
