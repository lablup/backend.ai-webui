/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Ticket 16 — converted to Astryx. antd `Descriptions bordered size="small"`
 becomes `MetadataList columns="single"` (MAPPING §4: `bordered`/`size` have
 no destination and are DROPPED, defaults-first). The status tag routes
 through the repo-global ticket-13 lookup, the permission select becomes an
 Astryx `Selector`, and copyable values use `BAIText copyable`.

 PILOT-DECISIONs:
 - The disabled 'rw' option's inline Tooltip is dropped — Astryx `Selector`
   options take string labels; the client-side guard in `onChange` still
   blocks the restricted transition.
*/
import { VFolderNodeDescriptionV2Fragment$key } from '../__generated__/VFolderNodeDescriptionV2Fragment.graphql';
import { VFolderNodeDescriptionV2PermissionRefreshQuery } from '../__generated__/VFolderNodeDescriptionV2PermissionRefreshQuery.graphql';
import { App } from '../app-shim';
import { useSuspendedBackendaiClient } from '../hooks';
import { useCurrentUserInfo } from '../hooks/backendai';
import { useTanMutation } from '../hooks/reactQueryAlias';
import { useCurrentUserProjectRoles } from '../hooks/useCurrentUserProjectRoles';
import { useVirtualFolderPathV2 } from '../hooks/useVirtualFolderNodePathV2';
import VirtualFolderPathV2 from './VirtualFolderNodeItems/VirtualFolderPathV2';
import { Badge } from '@astryxdesign/core/Badge';
import { Selector } from '@astryxdesign/core/Selector';
import { HStack } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';
import {
  BAIMetadataList,
  BAIMetadataListItem,
  filterOutEmpty,
  toLocalId,
  useErrorMessageResolver,
  badgeVariantForStatus,
  BAIText,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import {
  CircleCheckIcon,
  CircleXIcon,
  UserIcon,
  UsersIcon,
} from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  graphql,
  fetchQuery,
  useFragment,
  useRelayEnvironment,
} from 'react-relay';

interface VFolderNodeDescriptionV2Props {
  vfolderNodeFrgmt: VFolderNodeDescriptionV2Fragment$key;
}

const VFolderNodeDescriptionV2: React.FC<VFolderNodeDescriptionV2Props> = ({
  vfolderNodeFrgmt,
  ...props
}) => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();
  const { getErrorMessage } = useErrorMessageResolver();

  const relayEnv = useRelayEnvironment();
  const baiClient = useSuspendedBackendaiClient();
  const [currentUser] = useCurrentUserInfo();
  // Not `useEffectiveAdminRole` — it resolves its target from the ambient
  // project. Authorization here is derived from the folder's own ownership.
  const { isSuperAdmin, projectAdminIds } = useCurrentUserProjectRoles();

  // TODO(needs-backend): the mount-permission update still goes through the
  // legacy REST endpoint (`baiClient.vfolder.update_folder`) because the V2
  // GraphQL schema does not yet expose a corresponding mutation. Replace this
  // with a V2 mutation once the backend provides one — see FR-2619 follow-up.
  const updateMutation = useTanMutation({
    mutationFn: ({ permission, id }: { permission: string; id: string }) => {
      return baiClient.vfolder.update_folder({ permission }, id);
    },
  });

  const vfolderNode = useFragment(
    graphql`
      fragment VFolderNodeDescriptionV2Fragment on VFolder {
        id
        host
        status
        unmanagedPath
        metadata {
          name
          usageMode
          cloneable
          createdAt
        }
        accessControl {
          permission
          ownershipType
        }
        ownership {
          userId
          projectId
          creatorId
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
        ...useVirtualFolderNodePathV2Fragment
      }
    `,
    vfolderNodeFrgmt,
  );

  const { vfolderPath } = useVirtualFolderPathV2(vfolderNode);

  const vfolderId = toLocalId(vfolderNode.id);

  // V2 `VFolderMountPermission` enum → legacy REST permission string mapping
  // for the `<Selector/>` below. READ_ONLY → 'ro', READ_WRITE/RW_DELETE → 'rw'.
  // NOTE: `accessControl.permission` is the *mount* permission (how this folder
  // would be mounted into a session), not the caller's operational rights on
  // the folder. When the value is null/undefined we fall back to 'ro' so that
  // users without an explicit permission do not see a misleading read-write
  // default. See FR-2619 follow-up for a proper permission set.
  const currentSelectPermission =
    vfolderNode.accessControl?.permission === 'READ_WRITE' ||
    vfolderNode.accessControl?.permission === 'RW_DELETE'
      ? 'rw'
      : 'ro';

  // Model project folders are read-only by design (FR-1290), matching
  // FolderCreateModalV2. The manager used to enforce `ro` server-side and no
  // longer seems to, but we keep enforcing it on the client to preserve that
  // contract until the project-folder behavior is reworked.
  const shouldDisableRWPermission =
    vfolderNode.metadata?.usageMode === 'MODEL' &&
    vfolderNode.accessControl?.ownershipType === 'GROUP';

  const items = filterOutEmpty([
    !vfolderNode?.unmanagedPath && {
      key: 'path',
      label: (
        <BAIText copyable={{ text: vfolderPath }}>
          {t('data.folders.Path')}
        </BAIText>
      ),
      children: <VirtualFolderPathV2 vfolderNodeFrgmt={vfolderNode} />,
    },
    {
      key: 'status',
      label: t('data.folders.Status'),
      children: (
        <Badge
          variant={badgeVariantForStatus('vfolder', vfolderNode.status)}
          label={_.toUpper(vfolderNode.status ?? '')}
        />
      ),
    },
    {
      key: 'host',
      label: t('data.Host'),
      children: vfolderNode.host,
    },
    {
      key: 'ownership_type',
      label: t('data.folders.Ownership'),
      children:
        vfolderNode?.accessControl?.ownershipType === 'USER' ? (
          <HStack gap={2}>
            <Text>{t('data.User')}</Text>
            <UserIcon size="1em" />
          </HStack>
        ) : (
          <HStack gap={2}>
            <Text>{t('data.Project')}</Text>
            <UsersIcon size="1em" />
          </HStack>
        ),
    },
    // Allowed for the folder owner, super admins, or an admin of the project
    // that owns the folder. Domain admins are excluded — they have no
    // implicit per-project ownership rights.
    (vfolderNode?.ownership?.userId === currentUser.uuid ||
      isSuperAdmin ||
      (!!vfolderNode?.ownership?.projectId &&
        projectAdminIds.includes(vfolderNode.ownership.projectId))) && {
      key: 'permission',
      label: t('data.folders.MountPermission'),
      children: (
        // QA-FINDINGS Q-34 — this Selector bypasses `BAISelect` /
        // `AstryxFormSelector`, so it needs its own `placement`. With none,
        // `shouldOverlaySelectedItem` is true (no search field) and Astryx
        // centres the selected option OVER the trigger via a negative
        // `margin-block-start` — inside a `MetadataList` row that covers the
        // "Mount Permission" label as well as the value, which is what the
        // folder-permission report saw.
        <Selector
          placement="below"
          label={t('data.folders.MountPermission')}
          isLabelHidden
          value={currentSelectPermission}
          options={[
            { value: 'ro', label: t('data.ReadOnly') },
            {
              value: 'rw',
              label: t('data.ReadWrite'),
              disabled: shouldDisableRWPermission,
            },
          ]}
          onChange={(value) => {
            // Defense-in-depth: never persist 'rw' for a restricted folder.
            if (shouldDisableRWPermission && value === 'rw') {
              return;
            }
            updateMutation.mutate(
              { permission: value, id: vfolderId },
              {
                onSuccess: () => {
                  message.success(t('data.permission.PermissionModified'));
                  document.dispatchEvent(
                    new CustomEvent('backend-ai-folder-updated'),
                  );

                  // Refresh the V2 VFolder record so the UI reflects the new
                  // `accessControl.permission` value. The refetch is fire-and-
                  // forget; swallow failures so a background refresh error
                  // does not surface as an unhandled promise rejection.
                  void fetchQuery<VFolderNodeDescriptionV2PermissionRefreshQuery>(
                    relayEnv,
                    graphql`
                      query VFolderNodeDescriptionV2PermissionRefreshQuery(
                        $vfolderId: UUID!
                      ) {
                        vfolderV2(vfolderId: $vfolderId) {
                          id
                          accessControl {
                            permission
                          }
                        }
                      }
                    `,
                    {
                      vfolderId,
                    },
                  )
                    .toPromise()
                    .catch(() => {});
                },
                onError: (error) => {
                  message.error(getErrorMessage(error));
                },
              },
            );
          }}
        />
      ),
    },
    {
      key: 'owner',
      label: t('data.folders.Owner'),
      children: (
        <HStack justify="start">
          {vfolderNode?.ownership?.creatorId === currentUser?.uuid ? (
            <CircleCheckIcon size="1em" />
          ) : (
            <CircleXIcon size="1em" />
          )}
        </HStack>
      ),
    },
    vfolderNode.ownership?.user?.basicInfo?.email && {
      key: 'user_email',
      label: t('data.User'),
      children: (
        <BAIText copyable>
          {vfolderNode.ownership?.user?.basicInfo?.email ?? ''}
        </BAIText>
      ),
    },
    vfolderNode.ownership?.project?.basicInfo?.name && {
      key: 'group_name',
      label: t('data.Project'),
      children: vfolderNode.ownership?.project?.basicInfo?.name,
    },
    {
      key: 'cloneable',
      label: t('data.folders.Cloneable'),
      children: (
        <HStack justify="start">
          {vfolderNode.metadata?.cloneable ? (
            <CircleCheckIcon size="1em" />
          ) : (
            <CircleXIcon size="1em" />
          )}
        </HStack>
      ),
    },
    // TODO(needs-backend): V2 `VFolder` does not yet expose quota limits
    // (`max_size`, `max_files`). Hide the MaxSize row until the backend
    // catches up — see FR-2573 follow-up.
    {
      key: 'usage',
      label: t('data.UsageMode'),
      children: (() => {
        switch (vfolderNode.metadata?.usageMode) {
          case 'GENERAL':
            return t('data.General');
          case 'DATA':
            return t('webui.menu.Data');
          case 'MODEL':
            return t('data.Models');
          default:
            return vfolderNode.metadata?.usageMode;
        }
      })(),
    },
    {
      key: 'created_at',
      label: t('data.folders.CreatedAt'),
      children: vfolderNode.metadata?.createdAt
        ? dayjs(vfolderNode.metadata.createdAt).format('lll')
        : '-',
    },
  ]);

  return (
    <BAIMetadataList columns="single" {...props}>
      {items.map((item) => (
        <BAIMetadataListItem key={item.key} label={item.label}>
          {item.children}
        </BAIMetadataListItem>
      ))}
    </BAIMetadataList>
  );
};

export default VFolderNodeDescriptionV2;
