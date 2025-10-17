import {
  VFolderNodesFragment$data,
  VFolderNodesFragment$key,
} from '../__generated__/VFolderNodesFragment.graphql';
import { useSuspendedBackendaiClient } from '../hooks';
import { useCurrentUserInfo } from '../hooks/backendai';
import { useTanMutation } from '../hooks/reactQueryAlias';
import { useSetBAINotification } from '../hooks/useBAINotification';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import { isDeletedCategory } from '../pages/VFolderNodeListPage';
import BAITag from './BAITag';
import EditableVFolderName from './EditableVFolderName';
import { useFolderExplorerOpener } from './FolderExplorerOpener';
import InviteFolderSettingModal from './InviteFolderSettingModal';
import SharedFolderPermissionInfoModal from './SharedFolderPermissionInfoModal';
import VFolderNodeIdenticon from './VFolderNodeIdenticon';
import VFolderPermissionCell from './VFolderPermissionCell';
import { CheckCircleOutlined, UserOutlined } from '@ant-design/icons';
import {
  Alert,
  App,
  Button,
  Popconfirm,
  theme,
  Tooltip,
  Typography,
} from 'antd';
import {
  filterOutNullAndUndefined,
  BAIRestoreIcon,
  BAIShareAltIcon,
  BAITrashBinIcon,
  BAIUserUnionIcon,
  BAITable,
  BAITableProps,
  BAIFlex,
  toLocalId,
  useErrorMessageResolver,
  BAILink,
  BAIConfirmModalWithInput,
} from 'backend.ai-ui';
import _ from 'lodash';
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
interface VFolderNodesProps
  extends Omit<BAITableProps<VFolderNodeInList>, 'dataSource' | 'columns'> {
  vfoldersFrgmt: VFolderNodesFragment$key;
  onRequestChange?: (updatedFolderId?: string) => void;
}

const VFolderNodes: React.FC<VFolderNodesProps> = ({
  vfoldersFrgmt,
  onRequestChange,
  ...tableProps
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const currentProject = useCurrentProjectValue();
  const baiClient = useSuspendedBackendaiClient();
  const [currentUser] = useCurrentUserInfo();
  const [hoveredColumn, setHoveredColumn] = useState<string | null>();
  const [editingColumn, setEditingColumn] = useState<string | null>(null);
  const [inviteFolderId, setInviteFolderId] = useState<string | null>(null);
  const { upsertNotification } = useSetBAINotification();
  const { generateFolderPath } = useFolderExplorerOpener();
  const { getErrorMessage } = useErrorMessageResolver();

  const [currentVFolder, setCurrentVFolder] =
    useState<VFolderNodeInList | null>(null);
  const [currentSharedVFolder, setCurrentSharedVFolder] =
    useState<VFolderNodeInList | null>(null);

  const vfolders = useFragment(
    graphql`
      fragment VFolderNodesFragment on VirtualFolderNode @relay(plural: true) {
        id @required(action: NONE)
        status
        name
        host
        ownership_type
        user
        group
        usage_mode
        permissions @since(version: "24.09.0")
        ...VFolderPermissionCellFragment
        ...EditableVFolderNameFragment
        ...VFolderNodeIdenticonFragment
        ...SharedFolderPermissionInfoModalFragment
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
                <BAIFlex align="center" gap="xs">
                  <VFolderNodeIdenticon
                    vfolderNodeIdenticonFrgmt={vfolder}
                    style={{
                      fontSize: token.fontSizeHeading5,
                    }}
                  />
                  {vfolder?.id === hoveredColumn ? (
                    <EditableVFolderName
                      vfolderFrgmt={vfolder}
                      style={{ color: token.colorLink }}
                      editable={
                        !isDeletedCategory(vfolder?.status) &&
                        vfolder?.id !== editingColumn &&
                        _.includes(vfolder?.permissions, 'update_attribute')
                      }
                      onEditEnd={() => {
                        setEditingColumn(null);
                      }}
                      onEditStart={() => {
                        setEditingColumn(vfolder?.id);
                      }}
                    />
                  ) : (
                    <BAILink
                      type="hover"
                      to={generateFolderPath(toLocalId(vfolder?.id))}
                    >
                      {vfolder.name}
                    </BAILink>
                  )}
                </BAIFlex>
              );
            },
            onCell: (vfolder) => {
              return {
                onMouseEnter: () => {
                  if (!editingColumn) {
                    setHoveredColumn(vfolder?.id);
                  }
                },
                onMouseLeave: () => {
                  if (!editingColumn) {
                    setHoveredColumn(null);
                  }
                },
                // onClick: () => {
                //   setEditingColumn(vfolder?.id);
                // },
              };
            },
            sorter: true,
          },
          {
            key: 'controls',
            title: t('data.folders.Control'),
            render: (__, vfolder) => {
              const isPipelineFolder = vfolder?.usage_mode === 'data';
              const hasDeletePermission = _.includes(
                vfolder?.permissions,
                'delete_vfolder',
              );
              return (
                <BAIFlex gap={'xs'}>
                  {/* Share */}
                  {!isDeletedCategory(vfolder?.status) && (
                    <Tooltip title={t('button.Share')} placement="left">
                      <Button
                        size="small"
                        type="text"
                        icon={<BAIShareAltIcon />}
                        style={{
                          color: token.colorInfo,
                          background: token.colorInfoBg,
                        }}
                        onClick={() => {
                          vfolder?.user === currentUser?.uuid
                            ? setInviteFolderId(toLocalId(vfolder?.id ?? null))
                            : setCurrentSharedVFolder(vfolder);
                        }}
                      />
                    </Tooltip>
                  )}
                  {/* Restore */}
                  {isDeletedCategory(vfolder?.status) && (
                    <Tooltip
                      title={
                        isPipelineFolder
                          ? t('data.folders.CannotRestorePipelineFolder')
                          : t('data.folders.Restore')
                      }
                      placement="left"
                    >
                      <Button
                        size="small"
                        type="text"
                        icon={<BAIRestoreIcon />}
                        style={{
                          color:
                            vfolder?.status !== 'delete-pending' ||
                            isPipelineFolder
                              ? token.colorTextDisabled
                              : token.colorInfo,
                          background:
                            vfolder?.status !== 'delete-pending' ||
                            isPipelineFolder
                              ? token.colorBgContainerDisabled
                              : token.colorInfoBg,
                        }}
                        disabled={
                          vfolder?.status !== 'delete-pending' ||
                          isPipelineFolder
                        }
                        onClick={() => {
                          restoreMutation.mutate(vfolder?.id, {
                            onSuccess: (_result, variables) => {
                              onRequestChange?.(variables);
                              message.success(
                                t('data.folders.FolderRestored', {
                                  folderName: vfolder?.name,
                                }),
                              );
                            },
                            onError: (error) => {
                              upsertNotification({
                                description: getErrorMessage(error),
                                open: true,
                              });
                            },
                          });
                        }}
                      />
                    </Tooltip>
                  )}
                  {/* Move to trash bin */}
                  {!isDeletedCategory(vfolder?.status) && (
                    <Popconfirm
                      title={t('data.folders.MoveToTrash')}
                      onConfirm={() => {
                        deleteMutation.mutate(vfolder?.id, {
                          onSuccess: (_result, variables) => {
                            onRequestChange?.(variables);
                            message.success(
                              t('data.folders.MovedToTrashBin', {
                                folderName: vfolder?.name,
                              }),
                            );
                          },
                          onError: (error) => {
                            upsertNotification({
                              description: getErrorMessage(error),
                              open: true,
                            });
                          },
                        });
                      }}
                      okText={t('button.Move')}
                      okButtonProps={{ danger: true }}
                      disabled={!hasDeletePermission || isPipelineFolder}
                    >
                      <Tooltip
                        title={
                          isPipelineFolder
                            ? t('data.folders.CannotDeletePipelineFolder')
                            : hasDeletePermission
                              ? t('data.folders.MoveToTrash')
                              : t('data.folders.NoDeletePermission')
                        }
                        placement="right"
                      >
                        <Button
                          size="small"
                          type="text"
                          icon={<BAITrashBinIcon />}
                          disabled={!hasDeletePermission || isPipelineFolder}
                          style={{
                            color:
                              !_.includes(
                                vfolder?.permissions,
                                'delete_vfolder',
                              ) || isPipelineFolder
                                ? token.colorTextDisabled
                                : token.colorError,
                            background:
                              !_.includes(
                                vfolder?.permissions,
                                'delete_vfolder',
                              ) || isPipelineFolder
                                ? token.colorBgContainerDisabled
                                : token.colorErrorBg,
                          }}
                        />
                      </Tooltip>
                    </Popconfirm>
                  )}
                  {/* Delete from trash bin & Disabled delete button */}
                  {isDeletedCategory(vfolder?.status) && (
                    <Tooltip title={t('data.folders.Delete')} placement="right">
                      <Button
                        size="small"
                        type="text"
                        icon={<BAITrashBinIcon />}
                        style={{
                          color:
                            vfolder?.status !== 'delete-pending'
                              ? token.colorTextDisabled
                              : token.colorError,
                          background:
                            vfolder?.status !== 'delete-pending'
                              ? token.colorBgContainerDisabled
                              : token.colorErrorBg,
                        }}
                        disabled={vfolder?.status !== 'delete-pending'}
                        onClick={() => {
                          setCurrentVFolder(vfolder ?? null);
                        }}
                      />
                    </Tooltip>
                  )}
                </BAIFlex>
              );
            },
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
            sorter: true,
          },
          {
            key: 'host',
            title: t('data.folders.Location'),
            dataIndex: 'host',
            sorter: true,
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
            sorter: true,
          },
          {
            key: 'permissions',
            title: t('data.folders.MountPermission'),
            render: (_perm: string, vfolder) => {
              return <VFolderPermissionCell vfolderFrgmt={vfolder} />;
            },
          },
          {
            key: 'owner',
            title: t('data.folders.Owner'),
            render: (__, vfolder) =>
              vfolder?.user === currentUser?.uuid ||
              (vfolder?.group === currentProject?.id && baiClient.is_admin) ? (
                <BAIFlex justify="center">
                  <CheckCircleOutlined />
                </BAIFlex>
              ) : null,
          },
        ]}
        {...tableProps}
      />
      <BAIConfirmModalWithInput
        open={!!currentVFolder}
        onOk={() => {
          deleteFromTrashBinMutation.mutate(currentVFolder?.id ?? '', {
            onSuccess: () => {
              onRequestChange?.();
              message.success(
                t('data.folders.FolderDeletedForever', {
                  folderName: currentVFolder?.name,
                }),
              );
            },
            onError: (error) => {
              upsertNotification({
                description: getErrorMessage(error),
                open: true,
              });
            },
          });
          setCurrentVFolder(null);
        }}
        onCancel={() => {
          setCurrentVFolder(null);
        }}
        confirmText={currentVFolder?.name ?? ''}
        content={
          <BAIFlex
            direction="column"
            gap="md"
            align="stretch"
            style={{ marginBottom: token.marginXS, width: '100%' }}
          >
            <Alert
              type="warning"
              message={t('dialog.warning.DeleteForeverDesc')}
              style={{ width: '100%' }}
            />
            <BAIFlex>
              <Typography.Text style={{ marginRight: token.marginXXS }}>
                {t('data.folders.TypeFolderNameToDelete')}
              </Typography.Text>
              (<Typography.Text code>{currentVFolder?.name}</Typography.Text>)
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
        onRequestClose={(success?: boolean) => {
          setCurrentSharedVFolder(null);
          if (success) {
            onRequestChange?.();
          }
        }}
      />
    </>
  );
};

export default VFolderNodes;
