/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  VFolderNodesFragment$data,
  VFolderNodesFragment$key,
} from '../__generated__/VFolderNodesFragment.graphql';
import { App } from '../app-shim';
import { useSuspendedBackendaiClient, useWebUINavigate } from '../hooks';
import { useCurrentUserInfo } from '../hooks/backendai';
import { useTanMutation } from '../hooks/reactQueryAlias';
import { useSetBAINotification } from '../hooks/useBAINotification';
import { useEffectiveAdminRole } from '../hooks/useCurrentUserProjectRoles';
import { useProjectPath } from '../hooks/useRouteScope';
import { isDeletedCategory } from '../pages/VFolderNodeListPage';
import { theme } from '../theme-shim';
import DeploymentSettingModal from './DeploymentSettingModal';
import { useFolderExplorerOpener } from './FolderExplorerOpener';
import InviteFolderSettingModal from './InviteFolderSettingModal';
import SharedFolderPermissionInfoModal from './SharedFolderPermissionInfoModal';
import VFolderDeployModal from './VFolderDeployModal';
import VFolderNodeIdenticon from './VFolderNodeIdenticon';
import VFolderPermissionCell from './VFolderPermissionCell';
import BAICopyableText from './astryx-bui/BAICopyableText';
import BAIDeleteConfirmModal from './astryx-bui/BAIDeleteConfirmModalAstryx';
import BAITable from './astryx-bui/BAITableAstryx';
import type { BAITableAstryxProps } from './astryx-bui/BAITableAstryx';
import { Badge } from '@astryxdesign/core/Badge';
import type { BadgeVariant } from '@astryxdesign/core/Badge';
import { Link } from '@astryxdesign/core/Link';
import { HStack, VStack } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';
import { useToggle } from 'ahooks';
import {
  filterOutNullAndUndefined,
  BAIEndpointsIcon,
  BAIRestoreIcon,
  BAIShareAltIcon,
  BAIUnmountAfterClose,
  BAIUserUnionIcon,
  BAINameActionCell,
  toLocalId,
  useErrorMessageResolver,
  bytesToGB,
} from 'backend.ai-ui';
import type { BAINameActionCellAction } from 'backend.ai-ui';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
// PILOT PHASE 2: @ant-design/icons -> lucide-react. `DeleteFilled` (a solid
// glyph) has no filled counterpart in Lucide's stroke-only set; Trash2 is the
// closest read. PILOT-DECISION: the filled/outlined distinction that
// distinguished 'delete forever' from 'move to trash' is lost and is carried
// by the label alone now.
import { Trash2Icon, TrashIcon, UserIcon } from 'lucide-react';
import React, { Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

/**
 * PHASE 5: retyped from antd `Tag` colour names to Astryx `Badge` variants —
 * `'default'` becomes `'neutral'`. The status map is now Astryx-shaped data
 * rather than an antd-shaped value the wrapper had to translate.
 */
export const statusTagColor: Record<string, BadgeVariant> = {
  // mountable
  ready: 'warning',
  performing: 'warning',
  cloning: 'warning',
  mounted: 'warning',
  // delete
  'delete-pending': 'neutral',
  'delete-ongoing': 'neutral',
  'delete-complete': 'neutral',
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
  /**
   * When true, project-type folders (`ownership_type === 'group'`) are
   * locked from row-level destructive actions regardless of the caller's
   * `delete_vfolder` permission — even super-admins. Used by the
   * user-facing data page (`/data`) where project folders are managed
   * exclusively from the admin data page; the row-level disabled tooltip
   * additionally redirects admins (project/domain/super) to that page.
   */
  disableProjectFolderActions?: boolean;
}

const VFolderNameCell: React.FC<VFolderNameCellProps> = ({
  vfolder,
  onShare,
  onDelete,
  onRestore,
  onDeleteForever,
  onStartServiceFallback,
  disableProjectFolderActions = false,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { generateFolderPath } = useFolderExplorerOpener();
  const effectiveAdminRole = useEffectiveAdminRole();

  const isPipelineFolder = vfolder?.usage_mode === 'data';
  const isModelFolder = vfolder?.usage_mode === 'model';
  const isDeleted = isDeletedCategory(vfolder?.status);
  const isProjectFolder = vfolder?.ownership_type === 'group';
  const hasDeletePermission = _.includes(
    vfolder?.permissions,
    'delete_vfolder',
  );
  const isProjectFolderManagedElsewhere =
    disableProjectFolderActions && isProjectFolder;
  // When project folder actions are routed elsewhere (e.g. `/data` defers to
  // the admin data page), tell admins where to go. Regular members fall back
  // to the existing per-action default (e.g. "no delete permission") since
  // the redirect message wouldn't apply to them.
  const projectFolderAdminHint =
    isProjectFolderManagedElsewhere && effectiveAdminRole !== 'none'
      ? t('data.folders.ManageProjectFolderInAdmin')
      : undefined;

  const vfolderId = toLocalId(vfolder.id ?? '');

  const actions: BAINameActionCellAction[] = filterOutNullAndUndefined([
    // Start Service (model folders only, active only)
    isModelFolder && !isDeleted
      ? {
          key: 'start-service',
          title: t('modelService.DeployAsService'),
          icon: <BAIEndpointsIcon />,
          // Use `action` (not `onClick`) so the state update that mounts
          // `<VFolderDeployModal>` (which suspends on its Relay query)
          // runs inside `startTransition` — the page stays interactive
          // instead of falling into its Suspense fallback.
          action: async () => {
            onStartServiceFallback(vfolderId);
          },
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
          icon: <TrashIcon />,
          type: 'danger' as const,
          disabled:
            !hasDeletePermission ||
            isPipelineFolder ||
            isProjectFolderManagedElsewhere,
          disabledReason: isPipelineFolder
            ? t('data.folders.CannotDeletePipelineFolder')
            : (projectFolderAdminHint ?? t('data.folders.NoDeletePermission')),
          onClick: onDelete,
        }
      : null,
    // Restore (deleted folders only)
    isDeleted
      ? {
          key: 'restore',
          title: t('data.folders.Restore'),
          icon: <BAIRestoreIcon />,
          disabled:
            vfolder?.status !== 'delete-pending' ||
            isPipelineFolder ||
            isProjectFolderManagedElsewhere,
          disabledReason: isPipelineFolder
            ? t('data.folders.CannotRestorePipelineFolder')
            : isProjectFolderManagedElsewhere
              ? (projectFolderAdminHint ??
                t('data.folders.NoRestorePermission'))
              : undefined,
          popConfirm: {
            title: t('data.folders.Restore'),
            description: vfolder?.name,
            okText: t('button.Confirm'),
            onConfirm: onRestore,
          },
        }
      : null,
    // Delete from trash bin (deleted folders only)
    isDeleted
      ? {
          key: 'delete-forever',
          title: t('data.folders.Delete'),
          icon: <Trash2Icon />,
          type: 'danger' as const,
          disabled:
            vfolder?.status !== 'delete-pending' ||
            isProjectFolderManagedElsewhere,
          disabledReason: isProjectFolderManagedElsewhere
            ? (projectFolderAdminHint ?? t('data.folders.NoDeletePermission'))
            : undefined,
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
  BAITableAstryxProps<VFolderNodeInList>,
  'data' | 'columns' | 'rowSelection'
> {
  /**
   * PHASE 5 boundary: `VFolderNodes` is an APP component with a consumer
   * outside the pilot graph (`VFolderNodeListPage`), so it keeps the repo's
   * existing antd-shaped selection contract and translates to the
   * Astryx-native `BAITableAstryx` shape internally. The native-API policy
   * applies to the NEW `astryx-bui/*` components, not to app components whose
   * callers were never migrated.
   */
  rowSelection?: {
    type?: 'checkbox' | 'radio';
    preserveSelectedRowKeys?: boolean;
    selectedRowKeys?: Array<React.Key>;
    getCheckboxProps?: (record: VFolderNodeInList) => { disabled?: boolean };
    onChange?: (selectedRowKeys: Array<React.Key>) => void;
  };
  vfoldersFrgmt: VFolderNodesFragment$key;
  // Callback when a row is removed from current list
  onRemoveRow?: (updatedFolderId?: string) => void;
  /**
   * Forwarded to each row's name cell. Set on the user-facing data page
   * (`/data`) so project folders are not deletable/restorable from there
   * — those actions live on the admin data page instead.
   *
   * NOTE: VFolderNodesV2 should be refactored to support this kind of
   * row-action variation through column overrides (composing the actions
   * column at the call site) rather than carrying boolean flags on the
   * component. This prop is the V1-friendly stopgap.
   */
  disableProjectFolderActions?: boolean;
}

const VFolderNodes: React.FC<VFolderNodesProps> = ({
  vfoldersFrgmt,
  onRemoveRow,
  disableProjectFolderActions,
  rowSelection,
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
  const buildProjectPath = useProjectPath();

  const [deletingVFolder, setDeletingVFolder] =
    useState<VFolderNodeInList | null>(null);
  const [currentSharedVFolder, setCurrentSharedVFolder] =
    useState<VFolderNodeInList | null>(null);
  // vfolder id whose preset-selection deploy modal (FR-2599) should be open.
  const [deployFallbackVfolderId, setDeployFallbackVfolderId] = useState<
    string | null
  >(null);
  // FR-2862 — when the user hits the empty-preset state in
  // VFolderDeployModal, escalate to the deployment shell creation modal
  // (`DeploymentSettingModal`), same as the `/deployments` page entry.
  const [isCreateDeploymentOpen, { toggle: toggleCreateDeployment }] =
    useToggle(false);

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
        isColumnResizable
        idKey={(record) => record.id}
        density="compact"
        data={filteredVFolders}
        columns={[
          {
            key: 'name',
            header: t('data.folders.Name'),
            dataIndex: 'name',
            isRequired: true,
            renderCell: (vfolder) => {
              return (
                <VFolderNameCell
                  vfolder={vfolder}
                  disableProjectFolderActions={disableProjectFolderActions}
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
                                <VStack align="stretch">
                                  {/* PILOT-DECISION: Astryx `Text` has no
                                      `style` escape hatch (only `xstyle`,
                                      which needs the StyleX compiler we chose
                                      NOT to adopt — see 03 conflict point 1).
                                      `token.colorTextDescription` maps to the
                                      semantic `color="secondary"`. */}
                                  <Text color="secondary">
                                    {t('data.folders.MountedSessions')}
                                  </Text>
                                  {_.map(occupiedSession, (sessionId) => (
                                    <Link
                                      key={sessionId}
                                      href="#"
                                      style={{ fontWeight: 'normal' }}
                                      onClick={(e: React.MouseEvent) => {
                                        e.preventDefault();
                                        navigate({
                                          pathname: buildProjectPath(
                                            'session',
                                            { scope: 'project' },
                                          ),
                                          search: new URLSearchParams({
                                            sessionDetail: sessionId,
                                          }).toString(),
                                        });
                                      }}
                                    >
                                      {sessionId}
                                    </Link>
                                  ))}
                                </VStack>
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
            sortable: isEnableSorter('name'),
          },
          {
            key: 'status',
            header: t('data.folders.Status'),
            dataIndex: 'status',
            renderCell: (vfolder) => {
              const status = vfolder.status as string;
              return (
                <Badge
                  variant={status ? statusTagColor[status] : 'neutral'}
                  label={_.toUpper(status)}
                />
              );
            },
            sortable: isEnableSorter('status'),
          },
          {
            key: 'host',
            header: t('data.folders.Location'),
            dataIndex: 'host',
            sortable: isEnableSorter('host'),
          },
          {
            key: 'permissions',
            header: t('data.folders.MountPermission'),
            renderCell: (vfolder) => {
              return <VFolderPermissionCell vfolderFrgmt={vfolder} />;
            },
          },
          {
            key: 'ownership_type',
            header: t('data.folders.Type'),
            dataIndex: 'ownership_type',
            renderCell: (vfolder) => {
              const type = vfolder.ownership_type as string;
              return type === 'user' ? (
                <HStack gap={2}>
                  <Text>{t('data.User')}</Text>
                  <UserIcon style={{ color: token.colorTextTertiary }} />
                </HStack>
              ) : (
                <HStack gap={2}>
                  <Text>{t('data.Project')}</Text>
                  <BAIUserUnionIcon
                    style={{ color: token.colorTextTertiary }}
                  />
                </HStack>
              );
            },
            sortable: isEnableSorter('ownership_type'),
          },

          {
            key: 'owner',
            header: t('data.folders.Owner'),
            renderCell: (vfolder) =>
              vfolder.ownership_type === 'user'
                ? vfolder?.user_email
                : vfolder?.group_name,
          },
          {
            key: 'usage_mode',
            header: t('data.UsageMode'),
            dataIndex: 'usage_mode',
            isHiddenByDefault: true,
            sortable: isEnableSorter('usage_mode'),
            renderCell: (vfolder) => {
              const mode = vfolder.usage_mode as string;
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
            header: t('data.folders.NumberOfFiles'),
            dataIndex: 'num_files',
            isHiddenByDefault: true,
            sortable: isEnableSorter('num_files'),
            renderCell: (vfolder) => {
              const value = vfolder.num_files;
              return value != null ? value.toLocaleString() : '-';
            },
          },
          {
            key: 'cur_size',
            header: t('data.folders.FolderUsage'),
            dataIndex: 'cur_size',
            isHiddenByDefault: true,
            sortable: isEnableSorter('cur_size'),
            renderCell: (vfolder) => {
              const value = vfolder.cur_size;
              return value != null ? `${bytesToGB(Number(value))} GB` : '-';
            },
          },
          {
            key: 'max_files',
            header: t('data.folders.MaxFolderQuota'),
            dataIndex: 'max_files',
            isHiddenByDefault: true,
            sortable: isEnableSorter('max_files'),
            renderCell: (vfolder) => {
              const value = vfolder.max_files;
              return value != null && value > 0 ? value.toLocaleString() : '-';
            },
          },
          {
            key: 'max_size',
            header: t('data.folders.MaxSize'),
            dataIndex: 'max_size',
            isHiddenByDefault: true,
            sortable: isEnableSorter('max_size'),
            renderCell: (vfolder) => {
              const value = vfolder.max_size;
              return value != null && Number(value) > 0
                ? `${bytesToGB(Number(value))} GB`
                : '-';
            },
          },
          {
            key: 'cloneable',
            header: t('data.folders.Cloneable'),
            dataIndex: 'cloneable',
            isHiddenByDefault: true,
            sortable: isEnableSorter('cloneable'),
            renderCell: (vfolder) => {
              const value = vfolder.cloneable;
              return value ? t('button.Yes') : t('button.No');
            },
          },
          {
            key: 'quota_scope_id',
            header: t('data.QuotaScopeId'),
            dataIndex: 'quota_scope_id',
            isHiddenByDefault: true,
            sortable: isEnableSorter('quota_scope_id'),
            renderCell: (vfolder) => {
              const value = vfolder.quota_scope_id;
              return value ? <BAICopyableText>{value}</BAICopyableText> : '-';
            },
          },
          {
            key: 'last_used',
            header: t('credential.LastUsed'),
            dataIndex: 'last_used',
            isHiddenByDefault: true,
            sortable: isEnableSorter('last_used'),
            renderCell: (vfolder) => {
              const value = vfolder.last_used;
              return value ? dayjs(value).format('ll LT') : '-';
            },
          },
          {
            key: 'created_at',
            header: t('data.folders.CreatedAt'),
            dataIndex: 'created_at',
            isHiddenByDefault: true,
            sortable: isEnableSorter('created_at'),
            renderCell: (vfolder) => {
              const value = vfolder.created_at;
              return value ? dayjs(value).format('ll LT') : '-';
            },
          },
        ]}
        rowSelection={
          rowSelection
            ? {
                selectedKeys: (rowSelection.selectedRowKeys ?? []).map(String),
                isPreservingKeys: rowSelection.preserveSelectedRowKeys,
                getIsItemEnabled: (item) =>
                  !rowSelection.getCheckboxProps?.(item)?.disabled,
                onChange: (keys) => rowSelection.onChange?.(keys),
              }
            : undefined
        }
        {...tableProps}
      />
      {/* PHASE 6 (item 2) — the typed-confirmation destructive modal, rebuilt
          on Astryx. `.claude/rules/destructive-confirmation.md` is the contract
          this call site has to satisfy: the danger button stays disabled until
          the folder name is typed exactly. */}
      <BAIDeleteConfirmModal
        isOpen={!!deletingVFolder}
        onAction={() => {
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
        onOpenChange={(next) => {
          if (!next) setDeletingVFolder(null);
        }}
        items={
          deletingVFolder
            ? [
                {
                  key: deletingVFolder.id ?? '',
                  label: deletingVFolder.name ?? '',
                },
              ]
            : []
        }
        confirmText={deletingVFolder?.name ?? ''}
        requireConfirmInput
        inputLabel={t('dialog.PleaseTypeToConfirm', {
          confirmText: deletingVFolder?.name ?? '',
        })}
        inputPlaceholder={deletingVFolder?.name ?? ''}
        title={t('dialog.title.DeleteForever')}
        description={t('data.folders.DeleteForeverDescription', {
          folderName: deletingVFolder?.name ?? '',
        })}
        cannotBeUndoneText={t('dialog.warning.CannotBeUndone')}
        actionLabel={t('data.folders.DeleteForever')}
        cancelLabel={t('button.Cancel')}
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
      {/* `VFolderDeployModal` fetches presets via Relay internally and uses
          `useDeferredValue(open)` to show an Ant Design skeleton while a
          deferred update resolves. The first-time cache miss still suspends,
          so wrap in `<Suspense>`. */}
      <Suspense fallback={null}>
        <BAIUnmountAfterClose>
          <VFolderDeployModal
            open={!!deployFallbackVfolderId}
            vfolderId={deployFallbackVfolderId ?? undefined}
            onClose={() => setDeployFallbackVfolderId(null)}
            onDeployed={() => setDeployFallbackVfolderId(null)}
          />
        </BAIUnmountAfterClose>
      </Suspense>
      <DeploymentSettingModal
        open={isCreateDeploymentOpen}
        onRequestClose={toggleCreateDeployment}
      />
    </>
  );
};

export default VFolderNodes;
