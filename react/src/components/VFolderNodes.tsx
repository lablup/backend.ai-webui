import { filterNonNullItems, toLocalId } from '../helper';
import { useSuspendedBackendaiClient } from '../hooks';
import { useCurrentUserInfo } from '../hooks/backendai';
import { useTanMutation } from '../hooks/reactQueryAlias';
import { useSetBAINotification } from '../hooks/useBAINotification';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import { usePainKiller } from '../hooks/usePainKiller';
import { isDeletedCategory } from '../pages/VFolderNodeListPage';
import BAIConfirmModalWithInput from './BAIConfirmModalWithInput';
import RestoreIcon from './BAIIcons/RestoreIcon';
import ShareAltIcon from './BAIIcons/ShareAltIcon';
import TrashBinIcon from './BAIIcons/TrashBinIcon';
import UserUnionIcon from './BAIIcons/UserUnionIcon';
import BAILink from './BAILink';
import BAITable, { BAITableProps } from './BAITable';
import BAITag from './BAITag';
import Flex from './Flex';
import VFolderPermissionCell from './VFolderPermissionCell';
import {
  VFolderNodesFragment$data,
  VFolderNodesFragment$key,
} from './__generated__/VFolderNodesFragment.graphql';
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
import graphql from 'babel-plugin-relay/macro';
import _ from 'lodash';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFragment } from 'react-relay';

const statusTagColor = {
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
  onClickVFolderName?: (vfolder: VFolderNodeInList) => void;
  onRequestChange?: () => void;
}

const VFolderNodes: React.FC<VFolderNodesProps> = ({
  vfoldersFrgmt,
  onClickVFolderName,
  onRequestChange,
  ...tableProps
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { message } = App.useApp();

  const currentProject = useCurrentProjectValue();
  const baiClient = useSuspendedBackendaiClient();
  const painKiller = usePainKiller();
  const { upsertNotification } = useSetBAINotification();
  const [currentUser] = useCurrentUserInfo();

  const [currentVFolder, setCurrentVFolder] =
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
        ...VFolderPermissionCellFragment
      }
    `,
    vfoldersFrgmt,
  );
  const filteredVFolders = filterNonNullItems(vfolders);

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
      <BAITable<(typeof filteredVFolders)[0]>
        resizable
        neoStyle
        showSorterTooltip={false}
        sortDirections={['descend', 'ascend', 'descend']}
        rowKey={(record) => record.id}
        size="small"
        dataSource={filteredVFolders}
        scroll={{ x: 'max-content' }}
        columns={[
          {
            key: '#',
            title: '#',
            render: (id, record, index) => {
              const [current, pageSize] =
                tableProps.pagination &&
                tableProps.pagination.current &&
                tableProps.pagination.pageSize
                  ? [
                      tableProps.pagination.current,
                      tableProps.pagination.pageSize,
                    ]
                  : [1, 0];
              return index + 1 + (current - 1) * pageSize;
            },
          },
          {
            key: 'name',
            title: t('data.folders.Name'),
            dataIndex: 'name',
            render: (name: string, vfolder) => {
              return onClickVFolderName ? (
                <BAILink
                  type="hover"
                  onClick={(e) => {
                    // onClickVFolderName(vfolder?.id);
                  }}
                >
                  {name}
                </BAILink>
              ) : (
                name
              );
            },
            sorter: true,
          },
          {
            key: 'controls',
            title: t('data.folders.Control'),
            render: (__, vfolder) => {
              return (
                <Flex gap={'xs'}>
                  {/* Share */}
                  {!isDeletedCategory(vfolder?.status) && (
                    <Button
                      size="small"
                      type="text"
                      icon={<ShareAltIcon />}
                      style={{
                        color: token.colorInfo,
                        background: token.colorInfoBg,
                      }}
                    />
                  )}
                  {/* Restore */}
                  {isDeletedCategory(vfolder?.status) && (
                    <Tooltip title={t('data.folders.Restore')} placement="left">
                      <Button
                        size="small"
                        type="text"
                        icon={<RestoreIcon />}
                        style={{
                          color:
                            vfolder?.status !== 'delete-pending'
                              ? token.colorTextDisabled
                              : token.colorInfo,
                          background:
                            vfolder?.status !== 'delete-pending'
                              ? token.colorBgContainerDisabled
                              : token.colorInfoBg,
                        }}
                        disabled={vfolder?.status !== 'delete-pending'}
                        onClick={() => {
                          restoreMutation.mutate(vfolder?.id, {
                            onSuccess: (result) => {
                              onRequestChange?.();
                              message.success(
                                t('data.folders.FolderRestored', {
                                  folderName: vfolder?.name,
                                }),
                              );
                            },
                            onError: (error) => {
                              upsertNotification({
                                description: painKiller.relieve(error?.message),
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
                          onSuccess: () => {
                            onRequestChange?.();
                            message.success(
                              t('data.folders.MovedToTrashBin', {
                                folderName: vfolder?.name,
                              }),
                            );
                          },
                          onError: (error) => {
                            upsertNotification({
                              description: painKiller.relieve(error?.message),
                              open: true,
                            });
                          },
                        });
                      }}
                      okText={t('button.Move')}
                      okButtonProps={{ danger: true }}
                    >
                      <Tooltip
                        title={t('data.folders.MoveToTrash')}
                        placement="right"
                      >
                        <Button
                          size="small"
                          type="text"
                          icon={<TrashBinIcon />}
                          style={{
                            color: token.colorError,
                            background: token.colorErrorBg,
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
                      icon={<TrashBinIcon />}
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
                </Flex>
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
                <Flex gap={'xs'}>
                  <Typography.Text>{t('data.User')}</Typography.Text>
                  <UserOutlined style={{ color: token.colorTextTertiary }} />
                </Flex>
              ) : (
                <Flex gap={'xs'}>
                  <Typography.Text>{t('data.Project')}</Typography.Text>
                  <UserUnionIcon style={{ color: token.colorTextTertiary }} />
                </Flex>
              );
            },
            sorter: true,
          },
          {
            key: 'permissions',
            title: t('data.folders.MountPermission'),
            render: (perm: string, vfolder) => {
              return <VFolderPermissionCell vfolderFrgmt={vfolder} />;
            },
          },
          {
            key: 'owner',
            title: t('data.folders.Owner'),
            render: (__, vfolder) =>
              vfolder?.user === currentUser?.uuid ||
              vfolder?.group === currentProject?.id ? (
                <Flex justify="center">
                  <CheckCircleOutlined />
                </Flex>
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
                description: painKiller.relieve(error?.message),
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
          <Flex
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
            <Flex>
              <Typography.Text style={{ marginRight: token.marginXXS }}>
                {t('data.folders.TypeFolderNameToDelete')}
              </Typography.Text>
              (<Typography.Text code>{currentVFolder?.name}</Typography.Text>)
            </Flex>
          </Flex>
        }
        title={t('dialog.title.DeleteForever')}
        okText={t('data.folders.DeleteForever')}
      />
    </>
  );
};

export default VFolderNodes;
