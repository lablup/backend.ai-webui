/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  VFolderListFragment$data,
  VFolderListFragment$key,
} from '../__generated__/VFolderListFragment.graphql';
import { VFolderListPurgeMutation } from '../__generated__/VFolderListPurgeMutation.graphql';
import { isDeletedVFolderStatus } from '../helper/vfolderFilters';
import { useWebUINavigate } from '../hooks';
import { useSetBAINotification } from '../hooks/useBAINotification';
import { useStartServiceFromFolder } from '../hooks/useModelServiceLauncher';
import { useFolderExplorerOpener } from './FolderExplorerOpener';
import VFolderDeleteModalV2 from './VFolderDeleteModalV2';
import VFolderIdenticonV2 from './VFolderIdenticonV2';
import VFolderPermissionCellV2 from './VFolderPermissionCellV2';
import VFolderRestoreModalV2 from './VFolderRestoreModalV2';
import VFolderSharedPermissionInfoModalV2 from './VFolderSharedPermissionInfoModalV2';
import { UserOutlined } from '@ant-design/icons';
import { Alert, App, theme, Typography } from 'antd';
import {
  BAIConfirmModalWithInput,
  BAIEndpointsIcon,
  BAIFlex,
  BAINameActionCell,
  BAIRestoreIcon,
  BAIShareAltIcon,
  BAITable,
  BAITableProps,
  BAITag,
  BAIText,
  BAITrashBinIcon,
  BAIUserUnionIcon,
  filterOutNullAndUndefined,
  toLocalId,
  useBAILogger,
  useErrorMessageResolver,
} from 'backend.ai-ui';
import type { BAINameActionCellAction } from 'backend.ai-ui';
import dayjs from 'dayjs';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useMutation } from 'react-relay';

export type VFolderInList = NonNullable<VFolderListFragment$data[number]>;

/**
 * Color mapping by `VFolderOperationStatus` enum (UPPER_CASE).
 */
export const statusTagColor: Record<string, string> = {
  READY: 'warning',
  CLONING: 'warning',
  DELETE_PENDING: 'default',
  DELETE_ONGOING: 'default',
  DELETE_COMPLETE: 'default',
  DELETE_ERROR: 'error',
};

/**
 * Sort-column keys the table exposes. These keys must align with
 * `VFOLDER_SORT_KEY_TO_ORDER_FIELD` in `helper/vfolderFilters.ts`.
 */
const availableVFolderSorterKeys = [
  'name',
  'host',
  'created_at',
  'status',
  'usage_mode',
] as const;

const isEnableSorter = (key: string) => {
  return (availableVFolderSorterKeys as readonly string[]).includes(key);
};

interface VFolderNameCellProps {
  vfolder: VFolderInList;
  onShare: () => void;
  onDelete: () => void;
  onRestore: () => void;
  onDeleteForever: () => void;
}

const VFolderNameCell: React.FC<VFolderNameCellProps> = ({
  vfolder,
  onShare,
  onDelete,
  onRestore,
  onDeleteForever,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const navigate = useWebUINavigate();
  const { generateFolderPath } = useFolderExplorerOpener();

  const name = vfolder.metadata?.name ?? '';
  const usageMode = vfolder.metadata?.usageMode;
  const isPipelineFolder = usageMode === 'DATA';
  const isModelFolder = usageMode === 'MODEL';
  const isDeleted = isDeletedVFolderStatus(vfolder.status);
  const hasDeletePermission = vfolder.accessControl?.permission === 'RW_DELETE';

  const vfolderId = toLocalId(vfolder.id ?? '');

  const { start } = useStartServiceFromFolder({
    modelName: name,
    vfolderId,
    navigate,
  });

  const actions: BAINameActionCellAction[] = filterOutNullAndUndefined([
    isModelFolder && !isDeleted
      ? {
          key: 'start-service',
          title: t('modelService.StartModelService'),
          icon: <BAIEndpointsIcon />,
          onClick: () => start(),
        }
      : null,
    !isDeleted
      ? {
          key: 'share',
          title: t('button.Share'),
          icon: <BAIShareAltIcon />,
          onClick: onShare,
        }
      : null,
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
    isDeleted
      ? {
          key: 'restore',
          title: t('data.folders.Restore'),
          icon: <BAIRestoreIcon />,
          disabled: vfolder.status !== 'DELETE_PENDING' || isPipelineFolder,
          disabledReason: isPipelineFolder
            ? t('data.folders.CannotRestorePipelineFolder')
            : undefined,
          onClick: onRestore,
        }
      : null,
    isDeleted
      ? {
          key: 'delete-forever',
          title: t('data.folders.Delete'),
          icon: <BAITrashBinIcon />,
          type: 'danger' as const,
          disabled: vfolder.status !== 'DELETE_PENDING',
          onClick: onDeleteForever,
        }
      : null,
  ]);

  return (
    <BAINameActionCell
      icon={
        <VFolderIdenticonV2
          vfolderFrgmt={vfolder}
          style={{ fontSize: token.fontSizeHeading5 }}
        />
      }
      title={name}
      to={generateFolderPath(vfolderId)}
      actions={actions}
      showActions="always"
    />
  );
};

interface VFolderListProps extends Omit<
  BAITableProps<VFolderInList>,
  'dataSource' | 'columns'
> {
  vfoldersFrgmt: VFolderListFragment$key;
  onRemoveRow?: (updatedFolderId?: string) => void;
}

const VFolderList: React.FC<VFolderListProps> = ({
  vfoldersFrgmt,
  onRemoveRow,
  ...tableProps
}) => {
  'use memo';

  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { message, modal } = App.useApp();
  const { upsertNotification } = useSetBAINotification();
  const { getErrorMessage } = useErrorMessageResolver();
  const { logger } = useBAILogger();

  const [deletingVFolder, setDeletingVFolder] = useState<VFolderInList | null>(
    null,
  );
  const [currentSharedVFolder, setCurrentSharedVFolder] =
    useState<VFolderInList | null>(null);
  const [rowDeleteTarget, setRowDeleteTarget] = useState<VFolderInList | null>(
    null,
  );
  const [rowRestoreTarget, setRowRestoreTarget] =
    useState<VFolderInList | null>(null);

  const vfolders = useFragment(
    graphql`
      fragment VFolderListFragment on VFolder @relay(plural: true) {
        id @required(action: NONE)
        status
        host
        metadata {
          name
          usageMode
          quotaScopeId
          createdAt
          lastUsed
          cloneable
        }
        accessControl {
          permission
          ownershipType
        }
        ownership {
          creatorEmail
          project {
            basicInfo {
              name
            }
          }
        }
        ...VFolderIdenticonV2Fragment
        ...VFolderPermissionCellV2Fragment
        ...VFolderSharedPermissionInfoModalV2Fragment
        ...VFolderDeleteModalV2Fragment
        ...VFolderRestoreModalV2Fragment
      }
    `,
    vfoldersFrgmt,
  );

  const filteredVFolders = filterOutNullAndUndefined(vfolders);

  const [commitPurge] = useMutation<VFolderListPurgeMutation>(graphql`
    mutation VFolderListPurgeMutation($vfolderId: UUID!) {
      purgeVfolderV2(vfolderId: $vfolderId) {
        id
      }
    }
  `);

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
            dataIndex: ['metadata', 'name'],
            required: true,
            render: (_name, vfolder) => (
              <VFolderNameCell
                vfolder={vfolder}
                onShare={() => setCurrentSharedVFolder(vfolder)}
                onDelete={() => {
                  modal.confirm({
                    title: t('data.folders.MoveToTrash'),
                    content: vfolder.metadata?.name,
                    okText: t('button.Confirm'),
                    okButtonProps: { danger: true },
                    onOk: () => {
                      setRowDeleteTarget(vfolder);
                    },
                  });
                }}
                onRestore={() => {
                  // FIXME(FR-2573): replace with restoreVfolderV2 when backend adds it.
                  setRowRestoreTarget(vfolder);
                }}
                onDeleteForever={() => {
                  setDeletingVFolder(vfolder);
                }}
              />
            ),
            sorter: isEnableSorter('name'),
          },
          {
            key: 'status',
            title: t('data.folders.Status'),
            dataIndex: 'status',
            render: (status: string) => (
              <BAITag color={status ? statusTagColor[status] : undefined}>
                {status}
              </BAITag>
            ),
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
            render: (_perm, vfolder) => (
              <VFolderPermissionCellV2 vfolderFrgmt={vfolder} />
            ),
          },
          {
            key: 'ownership_type',
            title: t('data.folders.Type'),
            dataIndex: ['accessControl', 'ownershipType'],
            render: (type: string) =>
              type === 'USER' ? (
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
              ),
          },
          {
            key: 'owner',
            title: t('data.folders.Owner'),
            render: (__, vfolder) =>
              vfolder.accessControl?.ownershipType === 'USER'
                ? vfolder.ownership?.creatorEmail
                : vfolder.ownership?.project?.basicInfo?.name,
          },
          {
            key: 'usage_mode',
            title: t('data.UsageMode'),
            dataIndex: ['metadata', 'usageMode'],
            defaultHidden: true,
            sorter: isEnableSorter('usage_mode'),
            render: (mode: string) => {
              switch (mode) {
                case 'GENERAL':
                  return t('data.General');
                case 'DATA':
                  return t('webui.menu.Data');
                case 'MODEL':
                  return t('data.Models');
                default:
                  return mode;
              }
            },
          },
          // FIXME(FR-2573): VFolderMetadataInfo needs num_files/cur_size/max_files/max_size — restore when backend adds them
          {
            key: 'num_files',
            title: t('data.folders.NumberOfFiles'),
            defaultHidden: true,
            render: () => '-',
          },
          // FIXME(FR-2573): VFolderMetadataInfo needs num_files/cur_size/max_files/max_size — restore when backend adds them
          {
            key: 'cur_size',
            title: t('data.folders.FolderUsage'),
            defaultHidden: true,
            render: () => '-',
          },
          // FIXME(FR-2573): VFolderMetadataInfo needs num_files/cur_size/max_files/max_size — restore when backend adds them
          {
            key: 'max_files',
            title: t('data.folders.MaxFolderQuota'),
            defaultHidden: true,
            render: () => '-',
          },
          // FIXME(FR-2573): VFolderMetadataInfo needs num_files/cur_size/max_files/max_size — restore when backend adds them
          {
            key: 'max_size',
            title: t('data.folders.MaxSize'),
            defaultHidden: true,
            render: () => '-',
          },
          {
            key: 'cloneable',
            title: t('data.folders.Cloneable'),
            dataIndex: ['metadata', 'cloneable'],
            defaultHidden: true,
            render: (value: boolean) =>
              value ? t('button.Yes') : t('button.No'),
          },
          {
            key: 'quota_scope_id',
            title: t('data.QuotaScopeId'),
            dataIndex: ['metadata', 'quotaScopeId'],
            defaultHidden: true,
            render: (value: string) =>
              value ? <BAIText copyable>{value}</BAIText> : '-',
          },
          {
            key: 'last_used',
            title: t('credential.LastUsed'),
            dataIndex: ['metadata', 'lastUsed'],
            defaultHidden: true,
            render: (value: string) =>
              value ? dayjs(value).format('ll LT') : '-',
          },
          {
            key: 'created_at',
            title: t('data.folders.CreatedAt'),
            dataIndex: ['metadata', 'createdAt'],
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
          if (!deletingVFolder) return;
          const target = deletingVFolder;
          commitPurge({
            variables: { vfolderId: toLocalId(target.id) },
            onCompleted: (_data, errors) => {
              if (errors && errors.length > 0) {
                logger.error(errors[0]);
                upsertNotification({
                  key: `vfolder-error-${target.id}`,
                  description: errors[0]?.message || t('general.ErrorOccurred'),
                  open: true,
                });
                return;
              }
              onRemoveRow?.(target.id);
              message.success(
                t('data.folders.FolderDeletedForever', {
                  folderName: target.metadata?.name,
                }),
              );
            },
            onError: (error) => {
              logger.error(error);
              upsertNotification({
                key: `vfolder-error-${target.id}`,
                description: getErrorMessage(error),
                open: true,
              });
            },
          });
          setDeletingVFolder(null);
        }}
        onCancel={() => setDeletingVFolder(null)}
        confirmText={deletingVFolder?.metadata?.name ?? ''}
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
              (
              <Typography.Text code>
                {deletingVFolder?.metadata?.name}
              </Typography.Text>
              )
            </BAIFlex>
          </BAIFlex>
        }
        title={t('dialog.title.DeleteForever')}
        okText={t('data.folders.DeleteForever')}
      />
      {/* Row-action single delete confirmation path: reuses the bulk delete modal
          so that the same V2 mutation code-path runs for single and bulk deletes. */}
      <VFolderDeleteModalV2
        open={!!rowDeleteTarget}
        vfolderFrgmts={rowDeleteTarget ? [rowDeleteTarget] : undefined}
        onRequestClose={(success) => {
          const removedId = rowDeleteTarget?.id;
          setRowDeleteTarget(null);
          if (success && removedId) {
            onRemoveRow?.(removedId);
          }
        }}
      />
      <VFolderRestoreModalV2
        open={!!rowRestoreTarget}
        vfolderFrgmts={rowRestoreTarget ? [rowRestoreTarget] : undefined}
        onRequestClose={(success) => {
          const removedId = rowRestoreTarget?.id;
          setRowRestoreTarget(null);
          if (success && removedId) {
            onRemoveRow?.(removedId);
          }
        }}
      />
      <VFolderSharedPermissionInfoModalV2
        vfolderFrgmt={currentSharedVFolder}
        open={!!currentSharedVFolder}
        onLeaveFolder={(id) => onRemoveRow?.(id)}
        onRequestClose={() => setCurrentSharedVFolder(null)}
      />
    </>
  );
};

export default VFolderList;
