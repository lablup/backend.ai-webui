/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { VFolderNodesV2DeleteMutation } from '../__generated__/VFolderNodesV2DeleteMutation.graphql';
import {
  VFolderNodesV2Fragment$data,
  VFolderNodesV2Fragment$key,
} from '../__generated__/VFolderNodesV2Fragment.graphql';
import { VFolderNodesV2RestoreMutation } from '../__generated__/VFolderNodesV2RestoreMutation.graphql';
import { useSuspendedBackendaiClient } from '../hooks';
import { useCurrentUserInfo } from '../hooks/backendai';
import { useSuspenseTanQuery, useTanQuery } from '../hooks/reactQueryAlias';
import { useSetBAINotification } from '../hooks/useBAINotification';
import { isDeletedCategory } from '../pages/VFolderNodeListPage';
import DeleteForeverVFolderModalV2 from './DeleteForeverVFolderModalV2';
import { useFolderExplorerOpener } from './FolderExplorerOpener';
import InviteFolderSettingModal from './InviteFolderSettingModal';
import QuotaPerStorageVolumePanelCard, {
  type VolumeInfo,
} from './QuotaPerStorageVolumePanelCard';
import SharedFolderPermissionInfoModalV2 from './SharedFolderPermissionInfoModalV2';
import VFolderDeployModal from './VFolderDeployModal';
import VFolderNodeIdenticonV2 from './VFolderNodeIdenticonV2';
import VFolderPermissionCellV2 from './VFolderPermissionCellV2';
import { QuestionCircleOutlined, UserOutlined } from '@ant-design/icons';
import { App, Modal, Skeleton, theme, Tooltip, Typography } from 'antd';
import {
  filterOutNullAndUndefined,
  BAIAlertIconWithTooltip,
  BAIEndpointsIcon,
  BAILink,
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
  BAITag,
  StorageUsageBadge,
} from 'backend.ai-ui';
import type { BAINameActionCellAction } from 'backend.ai-ui';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import React, { Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useMutation } from 'react-relay';
import { useNavigate } from 'react-router-dom';

export const statusTagColor = {
  // V2 UPPERCASE enum values (VFolderOperationStatus)
  // mountable
  READY: 'warning',
  CLONING: 'warning',
  // delete
  DELETE_PENDING: 'default',
  DELETE_ONGOING: 'default',
  DELETE_COMPLETE: 'default',
  // error
  DELETE_ERROR: 'error',
  // Legacy V1 kebab-case values emitted by `VirtualFolderNode.status`.
  // Kept alongside V2 keys so consumers that still read V1 status (e.g.
  // `VFolderNodeDescription`) continue to get a color mapping and do not
  // need to normalize the status before indexing.
  ready: 'warning',
  performing: 'warning',
  cloning: 'warning',
  mounted: 'warning',
  error: 'error',
  'delete-pending': 'default',
  'delete-ongoing': 'default',
  'delete-complete': 'default',
  'delete-error': 'error',
};

export type VFolderNodeInList = NonNullable<
  VFolderNodesV2Fragment$data[number]
>;

// V2 `VFolderOrderField` enum values. Legacy fields not present in V2
// (last_used, cloneable, ownership_type, quota_scope_id, num_files, cur_size,
// max_files, max_size) are intentionally omitted and kept as unsortable
// columns. See FR-2573 for the V2 migration scope.
const availableVFolderSorterKeys = [
  'name',
  'host',
  'usage_mode',
  'created_at',
  'status',
] as const;

export const availableVFolderSorterValues = [
  ...availableVFolderSorterKeys,
  ...availableVFolderSorterKeys.map((key) => `-${key}` as const),
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

  const isPipelineFolder = vfolder?.metadata?.usageMode === 'DATA';
  const isModelFolder = vfolder?.metadata?.usageMode === 'MODEL';
  const isDeleted = isDeletedCategory(vfolder?.vfolderStatus);

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
          // TODO(needs-backend): V2 `VFolder` does not expose a per-user
          // action permission (legacy `VirtualFolderNode.permissions` had
          // `delete_vfolder`). `accessControl.permission` is a mount-level
          // enum (RO/RW/RW_DELETE), not an entity-level action permission,
          // so it cannot gate this button. Enable unconditionally and let
          // the backend reject unauthorized requests until a proper field
          // is exposed on `VFolder`.
          disabled: isPipelineFolder,
          disabledReason: isPipelineFolder
            ? t('data.folders.CannotDeletePipelineFolder')
            : t('data.folders.NoDeletePermission'),
          popConfirm: {
            title: t('data.folders.MoveToTrash'),
            description: t('data.folders.MoveToTrashRestoreHint'),
            okText: t('button.Confirm'),
            okButtonProps: { danger: true },
            onConfirm: onDelete,
          },
        }
      : null,
    // Restore (deleted folders only)
    isDeleted
      ? {
          key: 'restore',
          title: t('data.folders.Restore'),
          icon: <BAIRestoreIcon />,
          disabled:
            vfolder?.vfolderStatus !== 'DELETE_PENDING' || isPipelineFolder,
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
          disabled: vfolder?.vfolderStatus !== 'DELETE_PENDING',
          onClick: onDeleteForever,
        }
      : null,
  ]);

  return (
    <BAINameActionCell
      icon={
        <VFolderNodeIdenticonV2
          vfolderNodeIdenticonFrgmt={vfolder}
          style={{ fontSize: token.fontSizeHeading5 }}
        />
      }
      title={vfolder.metadata?.name}
      to={generateFolderPath(vfolderId)}
      actions={actions}
      showActions="always"
    />
  );
};

interface VFolderHostCellProps {
  host?: string | null;
}

// Renders a Host column cell: usage badge (if the backend reports one)
// plus the host name. The badge's data comes from `vfolder.list_hosts()`,
// cached under the same tan-query key that `StorageSelect` uses, so the
// payload is fetched once and shared across rows + selects. Uses the
// non-suspense `useTanQuery` here — a per-cell suspense boundary with a
// plain-text fallback rendered identically on the loaded-without-usage path,
// so rows would get stuck in the fallback branch and never pick up the badge
// after the query resolved.
const VFolderHostCell: React.FC<VFolderHostCellProps> = ({ host }) => {
  'use memo';
  const { t } = useTranslation();
  const baiClient = useSuspendedBackendaiClient();

  const { data: vhostInfo } = useTanQuery<{
    volume_info?: Record<string, Omit<VolumeInfo, 'id'>>;
  } | null>({
    queryKey: ['vhostInfo'],
    queryFn: () => baiClient.vfolder.list_hosts(),
    staleTime: 1000 * 60 * 5,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  if (!host) return null;

  const volumeInfo = vhostInfo?.volume_info?.[host];
  const usage = volumeInfo?.usage;
  const usagePercent = usage?.percentage;
  // Match `StorageSelect`'s gating: render the badge whenever the backend
  // attaches a `usage` object — even an empty `{}` — so rows render a neutral
  // (uncolored) marker while percentage data is unavailable. Color is derived
  // from percentage inside `StorageUsageBadge` and is `undefined` (neutral)
  // when the percentage is missing.
  const usageLabel =
    usagePercent === undefined
      ? t('data.usage.Unknown')
      : usagePercent < 70
        ? t('data.usage.Adequate')
        : usagePercent < 90
          ? t('data.usage.Caution')
          : t('data.usage.Insufficient');

  return (
    <BAIFlex gap={'xs'} align="center">
      {usage ? (
        <Tooltip
          title={t('data.usage.HostStatusTooltip', { status: usageLabel })}
        >
          <StorageUsageBadge percent={usagePercent} />
        </Tooltip>
      ) : null}
      <Typography.Text>{host}</Typography.Text>
    </BAIFlex>
  );
};

// Column-header affordance that opens `QuotaPerStorageVolumePanelCard` in a
// modal, pre-selected on a quota-supporting host so the empty "does not
// support" state is not the first thing users see. Renders nothing when no
// volume reports `quota` in its capabilities — removing the modal entry
// point entirely rather than opening a dialog with no useful content.
//
// The trigger (icon) lives inside the column `title`, but the Modal is
// hoisted to the table-level so React synthetic events from inside the
// Modal do not bubble up through the React tree to the `<th>` and trigger
// column sorting (Portal nodes still bubble through the React tree).
interface HostQuotaTriggerProps {
  onOpen: () => void;
}

const HostQuotaTriggerInner: React.FC<HostQuotaTriggerProps> = ({ onOpen }) => {
  'use memo';
  const { t } = useTranslation();
  const baiClient = useSuspendedBackendaiClient();

  const { data: vhostInfo } = useSuspenseTanQuery<{
    volume_info?: Record<string, Omit<VolumeInfo, 'id'>>;
  } | null>({
    queryKey: ['vhostInfo'],
    queryFn: () => baiClient.vfolder.list_hosts(),
  });

  const hasQuotaSupportedHost = _.some(
    _.values(vhostInfo?.volume_info ?? {}),
    (info) => _.includes(info?.capabilities, 'quota'),
  );
  if (!hasQuotaSupportedHost) return null;

  return (
    <BAIAlertIconWithTooltip
      title={t('data.QuotaPerStorageVolume')}
      iconProps={{
        size: 14,
        onClick: (e) => {
          e.stopPropagation();
          onOpen();
        },
        style: { cursor: 'pointer' },
      }}
    />
  );
};

const HostQuotaTrigger: React.FC<HostQuotaTriggerProps> = (props) => (
  <Suspense fallback={null}>
    <HostQuotaTriggerInner {...props} />
  </Suspense>
);

const HostQuotaModalContent: React.FC = () => {
  'use memo';
  const baiClient = useSuspendedBackendaiClient();

  const { data: vhostInfo } = useSuspenseTanQuery<{
    volume_info?: Record<string, Omit<VolumeInfo, 'id'>>;
  } | null>({
    queryKey: ['vhostInfo'],
    queryFn: () => baiClient.vfolder.list_hosts(),
  });

  const quotaSupportedEntry = _.find(
    _.entries(vhostInfo?.volume_info ?? {}),
    ([, info]) => _.includes(info?.capabilities, 'quota'),
  );
  if (!quotaSupportedEntry) return null;

  const [host, info] = quotaSupportedEntry;
  const defaultVolumeInfo: VolumeInfo = { id: host, ...info };

  return (
    <QuotaPerStorageVolumePanelCard defaultVolumeInfo={defaultVolumeInfo} />
  );
};

interface HostQuotaModalProps {
  open: boolean;
  onCancel: () => void;
}

const HostQuotaModal: React.FC<HostQuotaModalProps> = ({ open, onCancel }) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      title={
        <BAIFlex gap={'xs'} align="center">
          {t('data.QuotaPerStorageVolume')}
          <Tooltip title={t('data.HostDetails')}>
            <QuestionCircleOutlined
              style={{ color: token.colorTextDescription }}
            />
          </Tooltip>
        </BAIFlex>
      }
      width={640}
      destroyOnHidden
    >
      <Suspense fallback={<Skeleton active />}>
        <HostQuotaModalContent />
      </Suspense>
    </Modal>
  );
};

interface VFolderNodesV2Props extends Omit<
  BAITableProps<VFolderNodeInList>,
  'dataSource' | 'columns'
> {
  vfoldersFrgmt: VFolderNodesV2Fragment$key;
  // Callback when a row is removed from current list
  onRemoveRow?: (updatedFolderId?: string) => void;
}

const VFolderNodesV2: React.FC<VFolderNodesV2Props> = ({
  vfoldersFrgmt,
  onRemoveRow,
  ...tableProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const [currentUser] = useCurrentUserInfo();
  const [inviteFolderId, setInviteFolderId] = useState<string | null>(null);
  const { getErrorMessage } = useErrorMessageResolver();
  const navigate = useNavigate();
  const { upsertNotification } = useSetBAINotification();

  // Row-level hard-delete reuses the same modal as the bulk toolbar
  // (typed-input confirmation is required for irreversible deletion). Soft
  // delete is handled inline via the row action's Popconfirm — no per-row
  // state needed here.
  const [purgingVFolders, setPurgingVFolders] = useState<
    Array<VFolderNodeInList>
  >([]);
  const [currentSharedVFolder, setCurrentSharedVFolder] =
    useState<VFolderNodeInList | null>(null);
  // vfolder id whose preset-selection deploy modal (FR-2599) should be open.
  const [deployFallbackVfolderId, setDeployFallbackVfolderId] = useState<
    string | null
  >(null);
  const [isHostQuotaModalOpen, setIsHostQuotaModalOpen] = useState(false);

  // `vfolderStatus: status` aliases the V2 `VFolder.status`
  // (`VFolderOperationStatus!`) so it doesn't collide with V1
  // `VirtualFolderNode.status` (`String`) and `ComputeSessionNode.status`
  // (`String`) — both reachable from here via `BAINodeNotificationItemFragment`.
  // The Status column key + V2 OrderField sort value stay `status`.
  const vfolders = useFragment(
    graphql`
      fragment VFolderNodesV2Fragment on VFolder @relay(plural: true) {
        id @required(action: NONE)
        vfolderStatus: status
        host
        unmanagedPath
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
          userId
          projectId
          creatorEmail
          user {
            basicInfo {
              email
            }
          }
          project {
            basicInfo {
              name
            }
          }
        }
        ...VFolderPermissionCellV2Fragment
        ...VFolderNodeIdenticonV2Fragment
        ...SharedFolderPermissionInfoModalV2Fragment
        ...DeleteForeverVFolderModalV2Fragment
        ...BAINodeNotificationItemFragment @alias(as: "notificationFrgmt")
      }
    `,
    vfoldersFrgmt,
  );

  const filteredVFolders = filterOutNullAndUndefined(vfolders);

  const [commitDeleteMutation] = useMutation<VFolderNodesV2DeleteMutation>(
    graphql`
      mutation VFolderNodesV2DeleteMutation($vfolderId: UUID!) {
        deleteVfolderV2(vfolderId: $vfolderId) {
          id
        }
      }
    `,
  );

  const [commitRestoreMutation] = useMutation<VFolderNodesV2RestoreMutation>(
    graphql`
      mutation VFolderNodesV2RestoreMutation($vfolderId: UUID!) {
        restoreVFolder(vfolderId: $vfolderId) {
          id
        }
      }
    `,
  );

  // V2 rich-notification path: now that `BAINodeNotificationItemFragment`
  // gained a `... on VFolder` branch (FR-2573 follow-up), we can render the
  // same folder-link + clickable session-IDs UX the V1 `VFolderNodes` flow
  // uses. Falls back gracefully to a plain description if the error message
  // doesn't carry an occupied-sessions list.
  const handleDeleteError = (vfolder: VFolderNodeInList, error: Error) => {
    const matchString = error?.message.match(/sessions\(ids: (\[.*?\])\)/)?.[1];
    const occupiedSession = JSON.parse(matchString?.replace(/'/g, '"') || '[]');
    upsertNotification({
      open: true,
      key: `vfolder-error-${vfolder?.id}`,
      node: vfolder?.notificationFrgmt ?? null,
      description: getErrorMessage(error).replace(/\(ids[\s\S]*$/, ''),
      extraDescription: !_.isEmpty(occupiedSession) ? (
        <BAIFlex direction="column" align="stretch">
          <Typography.Text style={{ color: token.colorTextDescription }}>
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
  };

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
            render: (_name, vfolder) => {
              return (
                <VFolderNameCell
                  vfolder={vfolder}
                  onShare={() => {
                    vfolder?.ownership?.userId === currentUser?.uuid
                      ? setInviteFolderId(toLocalId(vfolder?.id ?? null))
                      : setCurrentSharedVFolder(vfolder);
                  }}
                  onDelete={() => {
                    const folderId = vfolder?.id;
                    if (!folderId) return;
                    commitDeleteMutation({
                      variables: { vfolderId: toLocalId(folderId) },
                      onCompleted: (_data, errors) => {
                        if (errors && errors.length > 0) {
                          handleDeleteError(
                            vfolder,
                            new Error(errors[0]?.message ?? ''),
                          );
                          return;
                        }
                        onRemoveRow?.(folderId);
                        message.success(
                          t('data.folders.MovedToTrashBin', {
                            folderName: vfolder?.metadata?.name,
                          }),
                        );
                      },
                      onError: (error) => handleDeleteError(vfolder, error),
                    });
                  }}
                  onRestore={() => {
                    const folderId = vfolder?.id;
                    if (!folderId) return;
                    const handleError = (error: Error) => {
                      upsertNotification({
                        key: `vfolder-error-${folderId}`,
                        node: vfolder?.notificationFrgmt ?? null,
                        description: getErrorMessage(error),
                        open: true,
                      });
                    };
                    commitRestoreMutation({
                      variables: { vfolderId: toLocalId(folderId) },
                      onCompleted: (_data, errors) => {
                        if (errors && errors.length > 0) {
                          handleError(new Error(errors[0]?.message ?? ''));
                          return;
                        }
                        onRemoveRow?.(folderId);
                        message.success(
                          t('data.folders.FolderRestored', {
                            folderName: vfolder?.metadata?.name,
                          }),
                        );
                      },
                      onError: handleError,
                    });
                  }}
                  onDeleteForever={() => {
                    setPurgingVFolders(vfolder ? [vfolder] : []);
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
            dataIndex: 'vfolderStatus',
            render: (status: string) => {
              return (
                <BAITag
                  color={
                    status
                      ? statusTagColor[status as keyof typeof statusTagColor]
                      : undefined
                  }
                >
                  {status}
                </BAITag>
              );
            },
            sorter: isEnableSorter('status'),
          },
          {
            key: 'host',
            title: (
              <BAIFlex gap={'xs'} align="center">
                {t('data.Host')}
                <HostQuotaTrigger
                  onOpen={() => setIsHostQuotaModalOpen(true)}
                />
              </BAIFlex>
            ),
            dataIndex: 'host',
            render: (host: string | null | undefined) => (
              <VFolderHostCell host={host} />
            ),
            sorter: isEnableSorter('host'),
          },
          // TODO(needs-backend): V2 `VFolder` does not expose the legacy
          // per-user `permissions` array. The Mount Permission column now
          // derives RO/RW from `accessControl.permission` only; restore or
          // augment once the backend re-introduces richer permission info.
          {
            key: 'permissions',
            title: t('data.folders.MountPermission'),
            render: (_perm: string, vfolder) => {
              return <VFolderPermissionCellV2 vfolderFrgmt={vfolder} />;
            },
          },
          {
            key: 'ownership_type',
            title: t('data.folders.Type'),
            dataIndex: ['accessControl', 'ownershipType'],
            render: (type: string) => {
              return type === 'USER' ? (
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
            // V2 `VFolderOrderField` does not expose ownership_type.
            sorter: isEnableSorter('ownership_type'),
          },

          {
            key: 'owner',
            title: t('data.folders.Owner'),
            render: (__, vfolder) =>
              vfolder.accessControl?.ownershipType === 'USER'
                ? vfolder?.ownership?.user?.basicInfo?.email
                : vfolder?.ownership?.project?.basicInfo?.name,
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
          // TODO(needs-backend): V2 `VFolder` does not yet expose file/size
          // usage statistics (num_files, cur_size) or quota limits
          // (max_files, max_size). Keep these as hidden placeholder columns
          // so column order and per-user settings (saved by key) remain
          // stable; swap `render` back to the real formatter once the
          // backend fields are available.
          {
            key: 'num_files',
            title: t('data.folders.NumberOfFiles'),
            defaultHidden: true,
            sorter: false,
            render: () => '-',
          },
          {
            key: 'cur_size',
            title: t('data.folders.FolderUsage'),
            defaultHidden: true,
            sorter: false,
            render: () => '-',
          },
          {
            key: 'max_files',
            title: t('data.folders.MaxFolderQuota'),
            defaultHidden: true,
            sorter: false,
            render: () => '-',
          },
          {
            key: 'max_size',
            title: t('data.folders.MaxSize'),
            defaultHidden: true,
            sorter: false,
            render: () => '-',
          },
          {
            key: 'cloneable',
            title: t('data.folders.Cloneable'),
            dataIndex: ['metadata', 'cloneable'],
            defaultHidden: true,
            // V2 `VFolderOrderField` does not expose cloneable.
            sorter: isEnableSorter('cloneable'),
            render: (value: boolean) =>
              value ? t('button.Yes') : t('button.No'),
          },
          {
            key: 'quota_scope_id',
            title: t('data.QuotaScopeId'),
            dataIndex: ['metadata', 'quotaScopeId'],
            defaultHidden: true,
            // V2 `VFolderOrderField` does not expose quota_scope_id.
            sorter: isEnableSorter('quota_scope_id'),
            render: (value: string) =>
              value ? <BAIText copyable>{value}</BAIText> : '-',
          },
          {
            key: 'last_used',
            title: t('credential.LastUsed'),
            dataIndex: ['metadata', 'lastUsed'],
            defaultHidden: true,
            // V2 `VFolderOrderField` does not expose last_used.
            sorter: isEnableSorter('last_used'),
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
      <DeleteForeverVFolderModalV2
        vfolderFrgmts={purgingVFolders}
        open={purgingVFolders.length > 0}
        onRequestClose={(success) => {
          if (success) {
            purgingVFolders.forEach((v) => onRemoveRow?.(v.id));
          }
          setPurgingVFolders([]);
        }}
      />
      <InviteFolderSettingModal
        onRequestClose={() => {
          setInviteFolderId(null);
        }}
        vfolderId={inviteFolderId}
        open={!!inviteFolderId}
      />
      <SharedFolderPermissionInfoModalV2
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
      <HostQuotaModal
        open={isHostQuotaModalOpen}
        onCancel={() => setIsHostQuotaModalOpen(false)}
      />
    </>
  );
};

export default VFolderNodesV2;
