/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  VFolderNodesFragment$data,
  VFolderNodesFragment$key,
} from '../__generated__/VFolderNodesFragment.graphql';
import { useSuspendedBackendaiClient, useWebUINavigate } from '../hooks';
import { useCurrentUserInfo } from '../hooks/backendai';
import { useTanMutation } from '../hooks/reactQueryAlias';
import { useSetBAINotification } from '../hooks/useBAINotification';
import { isDeletedCategory } from '../pages/VFolderNodeListPage';
import { useFolderExplorerOpener } from './FolderExplorerOpener';
import InviteFolderSettingModal from './InviteFolderSettingModal';
import SharedFolderPermissionInfoModal from './SharedFolderPermissionInfoModal';
import VFolderDeployModal from './VFolderDeployModal';
import VFolderNodeIdenticon from './VFolderNodeIdenticon';
import VFolderPermissionCell from './VFolderPermissionCell';
import { UserOutlined } from '@ant-design/icons';
import { Alert, App, theme, Typography } from 'antd';
import {
  filterOutNullAndUndefined,
  BAIEndpointsIcon,
  BAIRestoreIcon,
  BAIShareAltIcon,
  BAITrashBinIcon,
  BAIUserUnionIcon,
  BAITable,
  BAITableProps,
  BAIFlex,
  BAINameActionCell,
  BAIText,
  toLocalId,
  useErrorMessageResolver,
  BAILink,
  BAIConfirmModalWithInput,
  BAITag,
  bytesToGB,
} from 'backend.ai-ui';
import type { BAINameActionCellAction } from 'backend.ai-ui';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

export const statusTagColor = {
  // mountable
  ready: 'warning',
  performing: 'warning',
  cloning: 'warning',
  mounted: 'warning',
  // delete
  'delete-pending': 'default',
  'delete-ongoing': 'default',
  'delete-complete': 'default',
  // error
  error: 'error',
  'delete-error': 'error',
};

export type VFolderNodeInList = NonNullable<VFolderNodesFragment$data[number]>;

const availableVFolderSorterKeys = [
  'name',
  'host',
  'quota_scope_id',
  'usage_mode',
  'ownership_type',
  'max_files',
  'max_size',
  'created_at',
  'last_used',
  'cloneable',
  'status',
  'cur_size',
] as const;

const isEnableSorter = (key: string) => {
  return _.includes(availableVFolderSorterKeys, key);
};

interface VFolderNameCellProps {
  vfolder: VFolderNodeInList;
  onShare: () => void;
  onDelete: () => void;
  onRestore: () => void;
  onDeleteForever: () => void;
  /**
   * Called when the definition-check step on "Start Service" raises a
   * warning (e.g. missing service-definition.toml or ambiguous runtime
   * variants). The parent uses this to open the preset-selection modal
   * (FR-2599) for the given vfolder instead of navigating away.
   */
  onStartServiceFallback: (vfolderId: string) => void;
}

const VFolderNameCell: React.FC<VFolderNameCellProps> = ({
  vfolder,
  onShare,
  onDelete,
  onRestore,
  onDeleteForever,
  onStartServiceFallback,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { generateFolderPath } = useFolderExplorerOpener();

  const isPipelineFolder = vfolder?.usage_mode === 'data';
  const isModelFolder = vfolder?.usage_mode === 'model';
  const isDeleted = isDeletedCategory(vfolder?.status);
  const hasDeletePermission = _.includes(
    vfolder?.permissions,
    'delete_vfolder',
  );

  const vfolderId = toLocalId(vfolder.id ?? '');

  const actions: BAINameActionCellAction[] = filterOutNullAndUndefined([
    // Start Service (model folders only, active only)
    isModelFolder && !isDeleted
      ? {
          key: 'start-service',
          title: t('modelService.DeployAsService'),
          icon: <BAIEndpointsIcon />,
          onClick: () => onStartServiceFallback(vfolderId),
        }
      : null,
    // Share (active folders only)
    !isDeleted
      ? {
          key: 'share',
          title: t('button.Share'),
          icon: <BAIShareAltIcon />,
          onClick: onShare,
        }
      : null,
    // Move to trash (active folders only)
    !isDeleted
      ? {
          key: 'delete',
          title: t('data.folders.MoveToTrash'),
          icon: <BAITrashBinIcon />,
          type: 'danger' as const,
          disabled: !hasDeletePermission || isPipelineFolder,
          disabledReason: isPipelineFolder
            ? t('data.folders.CannotDeletePipelineFolder')
            : t('data.folders.NoDeletePermission'),
          onClick: onDelete,
        }
      : null,
    // Restore (deleted folders only)
    isDeleted
      ? {
          key: 'restore',
          title: t('data.folders.Restore'),
          icon: <BAIRestoreIcon />,
          disabled: vfolder?.status !== 'delete-pending' || isPipelineFolder,
          disabledReason: isPipelineFolder
            ? t('data.folders.CannotRestorePipelineFolder')
            : undefined,
          onClick: onRestore,
        }
      : null,
    // Delete from trash bin (deleted folders only)
    isDeleted
      ? {
          key: 'delete-forever',
          title: t('data.folders.Delete'),
          icon: <BAITrashBinIcon />,
          type: 'danger' as const,
          disabled: vfolder?.status !== 'delete-pending',
          onClick: onDeleteForever,
        }
      : null,
  ]);

  return (
    <BAINameActionCell
      icon={
        <VFolderNodeIdenticon
          vfolderNodeIdenticonFrgmt={vfolder}
          style={{ fontSize: token.fontSizeHeading5 }}
        />
      }
      title={vfolder.name}
      to={generateFolderPath(vfolderId)}
      actions={actions}
      showActions="always"
    />
  );
};

interface VFolderNodesProps extends Omit<
  BAITableProps<VFolderNodeInList>,
  'dataSource' | 'columns'
> {
  vfoldersFrgmt: VFolderNodesFragment$key;
  // Callback when a row is removed from current list
  onRemoveRow?: (updatedFolderId?: string) => void;
}

const VFolderNodes: React.FC<VFolderNodesProps> = ({
  vfoldersFrgmt,
  onRemoveRow,
  ...tableProps
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { message, modal } = App.useApp();
  const baiClient = useSuspendedBackendaiClient();
  const [currentUser] = useCurrentUserInfo();
  const [inviteFolderId, setInviteFolderId] = useState<string | null>(null);
  const { upsertNotification } = useSetBAINotification();
  const { getErrorMessage } = useErrorMessageResolver();
  const navigate = useWebUINavigate();

  const [deletingVFolder, setDeletingVFolder] =
    useState<VFolderNodeInList | null>(null);
  const [currentSharedVFolder, setCurrentSharedVFolder] =
    useState<VFolderNodeInList | null>(null);
  // vfolder id whose preset-selection deploy modal (FR-2599) should be open.
  const [deployFallbackVfolderId, setDeployFallbackVfolderId] = useState<
    string | null
  >(null);

  const vfolders = useFragment(
    graphql`
      fragment VFolderNodesFragment on VirtualFolderNode @relay(plural: true) {
        id @required(action: NONE)
        status
        name
        host
        quota_scope_id
        ownership_type
        user
        user_email
        group
        group_name
        usage_mode
        max_files
        max_size
        created_at
        last_used
        num_files
        cur_size
        cloneable
        permissions @since(version: "24.09.0")
        ...VFolderPermissionCellFragment
        ...VFolderNodeIdenticonFragment
        ...SharedFolderPermissionInfoModalFragment
        ...BAINodeNotificationItemFragment
      }
    `,
    vfoldersFrgmt,
  );

  const filteredVFolders = filterOutNullAndUndefined(vfolders);

  const deleteMutation = useTanMutation({
    mutationFn: (id: string) => {
      return baiClient.vfolder.delete_by_id(toLocalId(id));
    },
  });

  const restoreMutation = useTanMutation({
    mutationFn: (id: string) => {
      return baiClient.vfolder.restore_from_trash_bin(toLocalId(id));
    },
  });

  const deleteFromTrashBinMutation = useTanMutation({
    mutationFn: (id: string) => {
      return baiClient.vfolder.delete_from_trash_bin(toLocalId(id));
    },
  });

  return (
    <>
      <BAITable
        resizable
        showSorterTooltip={false}
        rowKey={(record) => record.id}
        size="small"
        dataSource={filteredVFolders}
        scroll={{ x: 'max-content' }}
        columns={[
          {
            key: 'name',
            title: t('data.folders.Name'),
            dataIndex: 'name',
            required: true,
            render: (_name, vfolder) => {
              return (
                <VFolderNameCell
                  vfolder={vfolder}
                  onShare={() => {
                    vfolder?.user === currentUser?.uuid
                      ? setInviteFolderId(toLocalId(vfolder?.id ?? null))
                      : setCurrentSharedVFolder(vfolder);
                  }}
                  onDelete={() => {
                    modal.confirm({
                      title: t('data.folders.MoveToTrash'),
                      content: vfolder?.name,
                      okText: t('button.Confirm'),
                      okButtonProps: { danger: true },
                      onOk: () => {
                        deleteMutation.mutate(vfolder?.id, {
                          onSuccess: (_result, variables) => {
                            onRemoveRow?.(variables);
                            message.success(
                              t('data.folders.MovedToTrashBin', {
                                folderName: vfolder?.name,
                              }),
                            );
                          },
                          onError: (error) => {
                            const matchString = error?.message.match(
                              /sessions\(ids: (\[.*?\])\)/,
                            )?.[1];
                            const occupiedSession = JSON.parse(
                              matchString?.replace(/'/g, '"') || '[]',
                            );
                            upsertNotification({
                              open: true,
                              key: `vfolder-error-${vfolder?.id}`,
                              node: vfolder,
                              description: getErrorMessage(error).replace(
                                /\(ids[\s\S]*$/,
                                '',
                              ),
                              extraDescription: !_.isEmpty(occupiedSession) ? (
                                <BAIFlex direction="column" align="stretch">
                                  <Typography.Text
                                    style={{
                                      color: token.colorTextDescription,
                                    }}
                                  >
                                    {t('data.folders.MountedSessions')}
                                  </Typography.Text>
                                  {_.map(occupiedSession, (sessionId) => (
                                    <BAILink
                                      key={sessionId}
                                      style={{ fontWeight: 'normal' }}
                                      onClick={() => {
                                        navigate({
                                          pathname: '/session',
                                          search: new URLSearchParams({
                                            sessionDetail: sessionId,
                                          }).toString(),
                                        });
                                      }}
                                    >
                                      {sessionId}
                                    </BAILink>
                                  ))}
                                </BAIFlex>
                              ) : null,
                            });
                          },
                        });
                      },
                    });
                  }}
                  onRestore={() => {
                    restoreMutation.mutate(vfolder?.id, {
                      onSuccess: (_result, vfolderId) => {
                        onRemoveRow?.(vfolderId);
                        message.success(
                          t('data.folders.FolderRestored', {
                            folderName: vfolder?.name,
                          }),
                        );
                      },
                      onError: (error) => {
                        upsertNotification({
                          key: `vfolder-error-${vfolder?.id}`,
                          node: vfolder,
                          description: getErrorMessage(error),
                          open: true,
                        });
                      },
                    });
                  }}
                  onDeleteForever={() => {
                    setDeletingVFolder(vfolder ?? null);
                  }}
                  onStartServiceFallback={(id) => {
                    setDeployFallbackVfolderId(id);
                  }}
                />
              );
            },
            sorter: isEnableSorter('name'),
          },
          {
            key: 'status',
            title: t('data.folders.Status'),
            dataIndex: 'status',
            render: (status: string) => {
              return (
                <BAITag
                  color={
                    status
                      ? statusTagColor[status as keyof typeof statusTagColor]
                      : undefined
                  }
                >
                  {_.toUpper(status)}
                </BAITag>
              );
            },
            sorter: isEnableSorter('status'),
          },
          {
            key: 'host',
            title: t('data.folders.Location'),
            dataIndex: 'host',
            sorter: isEnableSorter('host'),
          },
          {
            key: 'permissions',
            title: t('data.folders.MountPermission'),
            render: (_perm: string, vfolder) => {
              return <VFolderPermissionCell vfolderFrgmt={vfolder} />;
            },
          },
          {
            key: 'ownership_type',
            title: t('data.folders.Type'),
            dataIndex: 'ownership_type',
            render: (type: string) => {
              return type === 'user' ? (
                <BAIFlex gap={'xs'}>
                  <Typography.Text>{t('data.User')}</Typography.Text>
                  <UserOutlined style={{ color: token.colorTextTertiary }} />
                </BAIFlex>
              ) : (
                <BAIFlex gap={'xs'}>
                  <Typography.Text>{t('data.Project')}</Typography.Text>
                  <BAIUserUnionIcon
                    style={{ color: token.colorTextTertiary }}
                  />
                </BAIFlex>
              );
            },
            sorter: isEnableSorter('ownership_type'),
          },

          {
            key: 'owner',
            title: t('data.folders.Owner'),
            render: (__, vfolder) =>
              vfolder.ownership_type === 'user'
                ? vfolder?.user_email
                : vfolder?.group_name,
          },
          {
            key: 'usage_mode',
            title: t('data.UsageMode'),
            dataIndex: 'usage_mode',
            defaultHidden: true,
            sorter: isEnableSorter('usage_mode'),
            render: (mode: string) => {
              switch (mode) {
                case 'general':
                  return t('data.General');
                case 'data':
                  return t('webui.menu.Data');
                case 'model':
                  return t('data.Models');
                default:
                  return mode;
              }
            },
          },
          {
            key: 'num_files',
            title: t('data.folders.NumberOfFiles'),
            dataIndex: 'num_files',
            defaultHidden: true,
            sorter: isEnableSorter('num_files'),
            render: (value: number) =>
              value != null ? value.toLocaleString() : '-',
          },
          {
            key: 'cur_size',
            title: t('data.folders.FolderUsage'),
            dataIndex: 'cur_size',
            defaultHidden: true,
            sorter: isEnableSorter('cur_size'),
            render: (value: string) =>
              value != null ? `${bytesToGB(Number(value))} GB` : '-',
          },
          {
            key: 'max_files',
            title: t('data.folders.MaxFolderQuota'),
            dataIndex: 'max_files',
            defaultHidden: true,
            sorter: isEnableSorter('max_files'),
            render: (value: number) =>
              value != null && value > 0 ? value.toLocaleString() : '-',
          },
          {
            key: 'max_size',
            title: t('data.folders.MaxSize'),
            dataIndex: 'max_size',
            defaultHidden: true,
            sorter: isEnableSorter('max_size'),
            render: (value: string) =>
              value != null && Number(value) > 0
                ? `${bytesToGB(Number(value))} GB`
                : '-',
          },
          {
            key: 'cloneable',
            title: t('data.folders.Cloneable'),
            dataIndex: 'cloneable',
            defaultHidden: true,
            sorter: isEnableSorter('cloneable'),
            render: (value: boolean) =>
              value ? t('button.Yes') : t('button.No'),
          },
          {
            key: 'quota_scope_id',
            title: t('data.QuotaScopeId'),
            dataIndex: 'quota_scope_id',
            defaultHidden: true,
            sorter: isEnableSorter('quota_scope_id'),
            render: (value: string) =>
              value ? <BAIText copyable>{value}</BAIText> : '-',
          },
          {
            key: 'last_used',
            title: t('credential.LastUsed'),
            dataIndex: 'last_used',
            defaultHidden: true,
            sorter: isEnableSorter('last_used'),
            render: (value: string) =>
              value ? dayjs(value).format('ll LT') : '-',
          },
          {
            key: 'created_at',
            title: t('data.folders.CreatedAt'),
            dataIndex: 'created_at',
            defaultHidden: true,
            sorter: isEnableSorter('created_at'),
            render: (value: string) =>
              value ? dayjs(value).format('ll LT') : '-',
          },
        ]}
        {...tableProps}
      />
      <BAIConfirmModalWithInput
        open={!!deletingVFolder}
        onOk={() => {
          deleteFromTrashBinMutation.mutate(deletingVFolder?.id ?? '', {
            onSuccess: (_result, vfolderId) => {
              onRemoveRow?.(vfolderId);
              message.success(
                t('data.folders.FolderDeletedForever', {
                  folderName: deletingVFolder?.name,
                }),
              );
            },
            onError: (error) => {
              upsertNotification({
                key: `vfolder-error-${deletingVFolder?.id}`,
                ...(deletingVFolder && { node: deletingVFolder }),
                description: getErrorMessage(error),
                open: true,
              });
            },
          });
          setDeletingVFolder(null);
        }}
        onCancel={() => {
          setDeletingVFolder(null);
        }}
        confirmText={deletingVFolder?.name ?? ''}
        content={
          <BAIFlex
            direction="column"
            gap="md"
            align="stretch"
            style={{ marginBottom: token.marginXS, width: '100%' }}
          >
            <Alert
              type="warning"
              title={t('dialog.warning.DeleteForeverDesc')}
              style={{ width: '100%' }}
            />
            <BAIFlex>
              <Typography.Text style={{ marginRight: token.marginXXS }}>
                {t('data.folders.TypeFolderNameToDelete')}
              </Typography.Text>
              (<Typography.Text code>{deletingVFolder?.name}</Typography.Text>)
            </BAIFlex>
          </BAIFlex>
        }
        title={t('dialog.title.DeleteForever')}
        okText={t('data.folders.DeleteForever')}
      />
      <InviteFolderSettingModal
        onRequestClose={() => {
          setInviteFolderId(null);
        }}
        vfolderId={inviteFolderId}
        open={!!inviteFolderId}
      />
      <SharedFolderPermissionInfoModal
        vfolderFrgmt={currentSharedVFolder}
        open={!!currentSharedVFolder}
        onLeaveFolder={(id) => {
          onRemoveRow?.(id);
        }}
        onRequestClose={() => {
          setCurrentSharedVFolder(null);
        }}
      />
      <VFolderDeployModal
        open={!!deployFallbackVfolderId}
        vfolderId={deployFallbackVfolderId ?? undefined}
        onClose={() => setDeployFallbackVfolderId(null)}
        onDeployed={() => setDeployFallbackVfolderId(null)}
      />
    </>
  );
};

export default VFolderNodes;
