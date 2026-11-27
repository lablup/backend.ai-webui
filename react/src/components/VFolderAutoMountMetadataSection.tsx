/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { VFolderAutoMountMetadataSectionDeleteMutation } from '../__generated__/VFolderAutoMountMetadataSectionDeleteMutation.graphql';
import type { VFolderAutoMountMetadataSectionFragment$key } from '../__generated__/VFolderAutoMountMetadataSectionFragment.graphql';
import type { VFolderAutoMountMetadataSectionPermissionQuery } from '../__generated__/VFolderAutoMountMetadataSectionPermissionQuery.graphql';
import VFolderNodesV2AutoMountCellFragment, {
  type VFolderNodesV2AutoMountCellFragment$key,
} from '../__generated__/VFolderNodesV2AutoMountCellFragment.graphql';
import { App } from '../app-shim';
import { useSuspendedBackendaiClient } from '../hooks';
import VFolderAutoMountSettingModal, {
  type VFolderAutoMountScopeType,
} from './VFolderAutoMountSettingModal';
import { HStack, VStack } from '@lablup/ui-common/Stack';
import { Text } from '@lablup/ui-common/Text';
import {
  BAIMetadataList,
  BAIMetadataListItem,
  BAINameActionCell,
  type BAINameActionCellAction,
  BAIQuestionIconWithTooltip,
  useErrorMessageResolver,
  useMutationWithPromise,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { PlusIcon, SquarePenIcon, Trash2 } from 'lucide-react';
import { Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';

type AutoMountScope = { scopeType: VFolderAutoMountScopeType; scopeId: string };

type BuildActions = (
  disabledUnless: (permission: string) => BAINameActionCellAction['disabled'],
) => Array<BAINameActionCellAction>;

export interface VFolderAutoMountMetadataSectionProps {
  vfolderFrgmt: VFolderAutoMountMetadataSectionFragment$key;
}

/** The folder's one auto-mount setting, shown and edited in its metadata. */
const VFolderAutoMountMetadataSection: React.FC<
  VFolderAutoMountMetadataSectionProps
> = ({ vfolderFrgmt }) => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();
  const { getErrorMessage } = useErrorMessageResolver();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const baiClient = useSuspendedBackendaiClient();

  // `project` is caught in this fragment, not at the explorer's node: a share
  // recipient reads the folder but not its project (#10647).
  const vfolder = useFragment(
    graphql`
      fragment VFolderAutoMountMetadataSectionFragment on VFolder {
        entityId
        metadata {
          name
        }
        accessControl {
          ownershipType
        }
        ownership {
          userId
          projectId
          creatorId
          creatorEmail
          project @catch(to: NULL) {
            basicInfo {
              type
            }
          }
        }
        ...VFolderNodesV2AutoMountCellFragment
      }
    `,
    vfolderFrgmt,
  );
  const { vfolderAutoMounts } =
    useFragment<VFolderNodesV2AutoMountCellFragment$key>(
      VFolderNodesV2AutoMountCellFragment,
      vfolder,
    );
  const autoMount = vfolderAutoMounts?.edges[0]?.node ?? null;

  // ADR 0040: a personal project's folder auto-mounts for its user, any other
  // project folder for its project; null when the project cannot be read.
  const { userId, projectId, creatorId, project } = vfolder.ownership ?? {};
  const addScope = ((): AutoMountScope | null => {
    if (vfolder.accessControl?.ownershipType === 'USER') {
      return userId ? { scopeType: 'USER', scopeId: userId } : null;
    }
    if (!projectId || !project) return null;
    if (project.basicInfo.type !== 'PERSONAL') {
      return { scopeType: 'PROJECT', scopeId: projectId };
    }
    return creatorId ? { scopeType: 'USER', scopeId: creatorId } : null;
  })();
  const scope: AutoMountScope | null = autoMount
    ? {
        scopeType: autoMount.scopeType as VFolderAutoMountScopeType,
        scopeId: autoMount.scopeId,
      }
    : addScope;

  const deleteAutoMount =
    useMutationWithPromise<VFolderAutoMountMetadataSectionDeleteMutation>(
      graphql`
        mutation VFolderAutoMountMetadataSectionDeleteMutation(
          $input: DeleteVFolderAutoMountInput!
        ) {
          deleteVfolderAutoMount(input: $input) {
            vfolderAutoMount {
              id
              vfolder {
                id
                ...VFolderNodesV2AutoMountCellFragment
              }
            }
          }
        }
      `,
    );

  const handleDelete = async () => {
    if (!autoMount) return;
    try {
      await deleteAutoMount({ input: { id: autoMount.entityId } });
      message.success(t('autoMount.AutoMountRemoved'));
    } catch (error) {
      message.error(getErrorMessage(error));
    }
  };

  const buildActions: BuildActions = (disabledUnless) =>
    autoMount
      ? [
          {
            key: 'edit-auto-mount',
            title: t('autoMount.EditAutoMount'),
            icon: <SquarePenIcon />,
            disabled: disabledUnless('UPDATE'),
            onClick: () => setIsModalOpen(true),
          },
          {
            key: 'remove-auto-mount',
            title: t('autoMount.RemoveAutoMount'),
            icon: <Trash2 />,
            type: 'danger',
            disabled: disabledUnless('SOFT_DELETE'),
            popConfirm: {
              title: t('autoMount.RemoveAutoMountConfirm'),
              description: autoMount.mountDestination,
              okButtonProps: { danger: true },
              okText: t('button.Remove'),
              onConfirm: handleDelete,
            },
          },
        ]
      : [
          {
            key: 'add-auto-mount',
            title: t('autoMount.AddAutoMount'),
            icon: <PlusIcon />,
            disabled: disabledUnless('CREATE'),
            onClick: () => setIsModalOpen(true),
          },
        ];

  const title = (
    <HStack gap={1} vAlign="center">
      <Text weight="semibold">{t('autoMount.AutoMount')}</Text>
      <BAIQuestionIconWithTooltip
        title={
          scope?.scopeType === 'PROJECT'
            ? t('autoMount.FolderProjectAutoMountDesc')
            : t('autoMount.FolderUserAutoMountDesc')
        }
      />
    </HStack>
  );
  const noScopeHeader = (
    <BAINameActionCell
      title={title}
      showActions="always"
      actions={buildActions(() => ({
        reason: t('autoMount.NoPermissionToSetAutoMount'),
      }))}
    />
  );

  return (
    <VStack gap={2} align="stretch">
      {scope ? (
        <Suspense fallback={noScopeHeader}>
          <PermissionCheckedHeader
            scope={scope}
            title={title}
            buildActions={buildActions}
          />
        </Suspense>
      ) : (
        noScopeHeader
      )}
      {autoMount ? (
        <BAIMetadataList columns="single">
          <BAIMetadataListItem label={t('autoMount.MountDestination')}>
            {autoMount.mountDestination}
          </BAIMetadataListItem>
          <BAIMetadataListItem label={t('autoMount.Subpath')}>
            {autoMount.subpath}
          </BAIMetadataListItem>
          <BAIMetadataListItem label={t('autoMount.MountPermission')}>
            {autoMount.mountPermission === 'READ_ONLY'
              ? t('data.ReadOnly')
              : autoMount.mountPermission === 'READ_WRITE'
                ? t('data.ReadWrite')
                : t('autoMount.ReadWriteDelete')}
          </BAIMetadataListItem>
        </BAIMetadataList>
      ) : (
        <Text color="secondary">{t('autoMount.NotAutoMounted')}</Text>
      )}
      {scope ? (
        <VFolderAutoMountSettingModal
          open={isModalOpen}
          unmountOnClose
          scopeType={scope.scopeType}
          scopeId={scope.scopeId}
          vfolder={{
            id: vfolder.entityId,
            name: vfolder.metadata?.name ?? '',
          }}
          vfolderAutoMountFrgmt={autoMount}
          otherUserEmail={
            scope.scopeType === 'USER' && scope.scopeId !== baiClient.user_uuid
              ? (vfolder.ownership?.creatorEmail ?? scope.scopeId)
              : null
          }
          onRequestClose={() => setIsModalOpen(false)}
        />
      ) : null}
    </VStack>
  );
};

/** The section's actions, each disabled with a reason without its permission. */
const PermissionCheckedHeader: React.FC<{
  scope: AutoMountScope;
  title: React.ReactNode;
  buildActions: BuildActions;
}> = ({ scope, title, buildActions }) => {
  'use memo';
  const { t } = useTranslation();
  const { myScopePermissions } =
    useLazyLoadQuery<VFolderAutoMountMetadataSectionPermissionQuery>(
      graphql`
        query VFolderAutoMountMetadataSectionPermissionQuery(
          $scopeType: String!
          $scopeId: UUID!
        ) {
          myScopePermissions(
            input: {
              target: {
                scopeType: $scopeType
                scopeId: $scopeId
                entityType: "vfolder_auto_mount"
              }
            }
          ) {
            item {
              permissions
            }
          }
        }
      `,
      {
        scopeType: scope.scopeType === 'PROJECT' ? 'project' : 'user',
        scopeId: scope.scopeId,
      },
      { fetchPolicy: 'store-and-network' },
    );
  const permissions = myScopePermissions?.item.permissions ?? [];
  const reason =
    scope.scopeType === 'PROJECT'
      ? t('autoMount.NoPermissionToSetProjectAutoMount')
      : t('autoMount.NoPermissionToSetAutoMount');

  return (
    <BAINameActionCell
      title={title}
      showActions="always"
      actions={buildActions((permission) =>
        _.includes(permissions, permission) ? undefined : { reason },
      )}
    />
  );
};

export default VFolderAutoMountMetadataSection;
