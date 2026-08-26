/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Ticket 16 — converted to Astryx; the table itself crossed in ticket 30-D
 (`BAITable`, Astryx engine). Everything rendered AROUND and INSIDE the table's
 cells is Astryx: `BAINameActionCell` (name + row actions),
 `Badge` + the repo-global status lookup (ticket 13) for the status tag,
 `Text` for text cells, `BAIText copyable` for the copyable id, and
 `BAIDeleteConfirmModal` (BUI) for the typed destructive confirm.
*/
import { VFolderDeployModalQuery } from '../__generated__/VFolderDeployModalQuery.graphql';
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
import { ProjectContextOrNull } from '../types/projectContext';
import { useFolderExplorerOpener } from './FolderExplorerOpener';
import InviteFolderSettingModal from './InviteFolderSettingModal';
import SharedFolderPermissionInfoModal from './SharedFolderPermissionInfoModal';
import VFolderDeployModal, { VFolderDeployQuery } from './VFolderDeployModal';
import VFolderNodeIdenticon from './VFolderNodeIdenticon';
import VFolderPermissionCell from './VFolderPermissionCell';
import { Badge } from '@astryxdesign/core/Badge';
import type { BadgeVariant } from '@astryxdesign/core/Badge';
import { Link } from '@astryxdesign/core/Link';
import { HStack, VStack } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';
import {
  BAITable,
  BAITableProps,
  BAIDeleteConfirmModal,
  BAINameActionCell,
  type BAINameActionCellAction,
  BAIUnmountAfterClose,
  badgeVariantForStatus,
  BAIText,
  bytesToGB,
  filterOutNullAndUndefined,
  toLocalId,
  useErrorMessageResolver,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
// PILOT-DECISION (inherited from the pilot's final sweep): BUI's `BAI*Icon`
// set wraps `@ant-design/icons`' `Icon` COMPONENT, so every one of them is a
// live antd render (P16). The four used here are replaced with their nearest
// Lucide glyphs; `DeleteFilled` vs `DeleteOutlined` (delete forever vs move
// to trash) collapse to Trash2/Trash and the distinction rests on the label.
import {
  RocketIcon,
  RotateCcwIcon,
  Share2Icon,
  Trash2Icon,
  TrashIcon,
  UserIcon,
  UsersIcon,
} from 'lucide-react';
import React, { Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useQueryLoader } from 'react-relay';

/**
 * Retyped from antd `Tag` colour names to Astryx `Badge` variants —
 * `'default'` becomes `'neutral'` (ticket 13 lookup vocabulary).
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
  /**
   * When set, the "Deploy as service" row action renders disabled with this
   * string as its tooltip. The component never infers on its own when
   * deployment should be blocked — including from `project` being `null`,
   * which user-facing pages may also pass legitimately — the page decides
   * and supplies the reason (mirrors `FolderExplorerHeaderV2`'s
   * `noProjectTooltip`, FR-3412). Absent by default, so every existing
   * caller (user Data page, model store) keeps today's behavior unchanged.
   */
  noDeployTooltip?: string;
}

const VFolderNameCell: React.FC<VFolderNameCellProps> = ({
  vfolder,
  onShare,
  onDelete,
  onRestore,
  onDeleteForever,
  onStartServiceFallback,
  disableProjectFolderActions = false,
  noDeployTooltip,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { generateFolderPath } = useFolderExplorerOpener();
  const navigate = useWebUINavigate();
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
  const folderPath = generateFolderPath(vfolderId);

  const actions: Array<BAINameActionCellAction> = filterOutNullAndUndefined([
    // Start Service (model folders only, active only)
    isModelFolder && !isDeleted
      ? {
          key: 'start-service',
          title: t('modelService.DeployAsService'),
          icon: <RocketIcon />,
          disabled: !!noDeployTooltip,
          disabledReason: noDeployTooltip,
          // Use `action` (not `onClick`) so the state update that mounts
          // `<VFolderDeployModal>` (which suspends on its preloaded query)
          // runs inside `startTransition` — the page stays interactive
          // while the preloaded query resolves, instead of flashing the
          // modal's Suspense fallback.
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
          icon: <Share2Icon />,
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
          icon: <RotateCcwIcon />,
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
            description: vfolder?.name ?? undefined,
            okText: t('button.Confirm'),
            cancelText: t('button.Cancel'),
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
      // BUI passed react-router's `to` OBJECT; Astryx `Link` is anchor-first,
      // so the object is flattened to an href and the left click is
      // intercepted for the router.
      to={`${folderPath.pathname}?${folderPath.search}`}
      onTitleClick={() => {
        navigate(folderPath);
      }}
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
  /**
   * Explicit project prop contract (ADR-0001, FR-3410). Pass-through for the
   * deployment-creation escalation modal (`DeploymentSettingModal`): the
   * parent page decides the project context. Admin pages pass `null` (the
   * modal then embeds its own required project selector); user-facing pages
   * narrow the ambient current project at page level.
   */
  project: ProjectContextOrNull;
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
  /**
   * Forwarded to each row's name cell (FR-3423). When set, the "Deploy as
   * service" row action renders disabled with this string as its tooltip.
   * The admin folder page (`AdminVFolderNodeListPage`) is the only caller
   * that passes this — deployments are project-scoped, and that page has
   * no ambient project (an oversight surface across every project), so
   * deploying from it would create an endpoint the admin cannot
   * afterwards see or clean up. The user-facing data page and the model
   * store leave this unset and keep the action fully functional.
   */
  noDeployTooltip?: string;
}

const VFolderNodes: React.FC<VFolderNodesProps> = ({
  vfoldersFrgmt,
  onRemoveRow,
  project,
  disableProjectFolderActions,
  noDeployTooltip,
  ...tableProps
}) => {
  const { t } = useTranslation();
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
  // Preset-selection deploy modal (FR-2599). The query reference is loaded in
  // the Deploy click handler (render-as-you-fetch); it and the target folder id
  // are deliberately kept alive after close — only `isDeployModalOpen` toggles,
  // so the modal's data and its auto-deploy/selection decision stay stable
  // through the close animation.
  const [deployQueryRef, loadDeployQuery] =
    useQueryLoader<VFolderDeployModalQuery>(VFolderDeployQuery);
  const [deployVfolderId, setDeployVfolderId] = useState<string | null>(null);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);

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
        scroll={{ x: 'max-content' }}
        resizable
        rowKey={(record) => record.id}
        size="small"
        dataSource={filteredVFolders}
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
                  disableProjectFolderActions={disableProjectFolderActions}
                  noDeployTooltip={noDeployTooltip}
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
                                  {/* `token.colorTextDescription` maps to the
                                      semantic `color="secondary"` (P5). */}
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
                    // Render-as-you-fetch: start the request in the open event.
                    loadDeployQuery({}, { fetchPolicy: 'store-and-network' });
                    setDeployVfolderId(id);
                    setIsDeployModalOpen(true);
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
                <Badge
                  variant={badgeVariantForStatus('vfolder', status)}
                  label={_.toUpper(status)}
                />
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
                <HStack gap={2}>
                  <Text>{t('data.User')}</Text>
                  <UserIcon size="1em" />
                </HStack>
              ) : (
                <HStack gap={2}>
                  <Text>{t('data.Project')}</Text>
                  <UsersIcon size="1em" />
                </HStack>
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
      {/* The typed-confirmation destructive modal, rebuilt on Astryx.
          `.claude/rules/destructive-confirmation.md` is the contract this call
          site has to satisfy: the danger button stays disabled until the
          folder name is typed exactly. */}
      <BAIDeleteConfirmModal
        isOpen={!!deletingVFolder}
        maskClosable={false}
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
        inputProps={{ placeholder: deletingVFolder?.name ?? '' }}
        title={t('dialog.title.DeleteForever')}
        description={t('data.folders.DeleteForeverDescription', {
          folderName: deletingVFolder?.name ?? '',
        })}
        cannotBeUndoneText={t('dialog.warning.CannotBeUndone')}
        okText={t('data.folders.DeleteForever')}
        cancelText={t('button.Cancel')}
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
      {/* The boundary is required and must stay mounted unconditionally.
          The Deploy action runs inside `startTransition`
          (`BAINameActionCell`), which only protects the render that state
          update causes — the preloaded presets query. The modal also holds
          suspending sources that start *after* it commits and therefore
          outside any transition: `useProjectResourceGroups`
          (`useSuspenseTanQuery`), `BAIProjectResourceGroupSelect` (same
          hook), and `BAIAvailablePresetSelect`, whose value query re-runs
          with `skip: false` as soon as the modal preselects the first
          preset. Without this boundary those escape to the page-level
          fallback and blank the folder list. Keeping it mounted (rather
          than rendering it together with the modal) means the initial
          transition still avoids showing `fallback` at all. */}
      <Suspense fallback={null}>
        {deployQueryRef != null &&
          deployVfolderId != null &&
          project != null && (
            <BAIUnmountAfterClose>
              <VFolderDeployModal
                open={isDeployModalOpen}
                project={project}
                vfolderId={deployVfolderId}
                queryRef={deployQueryRef}
                onClose={() => setIsDeployModalOpen(false)}
                onDeployed={() => setIsDeployModalOpen(false)}
              />
            </BAIUnmountAfterClose>
          )}
      </Suspense>
    </>
  );
};

export default VFolderNodes;
