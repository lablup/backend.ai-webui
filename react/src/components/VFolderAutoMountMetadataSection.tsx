/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { VFolderAutoMountMetadataSectionDeleteMutation } from '../__generated__/VFolderAutoMountMetadataSectionDeleteMutation.graphql';
import type { VFolderAutoMountMetadataSectionPermissionQuery } from '../__generated__/VFolderAutoMountMetadataSectionPermissionQuery.graphql';
import type { VFolderAutoMountMetadataSectionQuery } from '../__generated__/VFolderAutoMountMetadataSectionQuery.graphql';
import { App } from '../app-shim';
import VFolderAutoMountSettingModal, {
  type VFolderAutoMountScopeType,
} from './VFolderAutoMountSettingModal';
import { HStack, VStack } from '@lablup/ui-common/Stack';
import { Text } from '@lablup/ui-common/Text';
import {
  BAIMetadataList,
  BAIMetadataListItem,
  BAINameActionCell,
  BAIQuestionIconWithTooltip,
  useErrorMessageResolver,
  useFetchKey,
  useMutationWithPromise,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { PlusIcon, SquarePenIcon, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

export interface VFolderAutoMountMetadataSectionProps {
  scopeType: VFolderAutoMountScopeType;
  /** UUID of the project or the user the folder auto-mounts for. */
  scopeId: string;
  vfolder: { id: string; name: string };
}

/** The folder's one auto-mount setting, shown and edited in its metadata. */
const VFolderAutoMountMetadataSection: React.FC<
  VFolderAutoMountMetadataSectionProps
> = ({ scopeType, scopeId, vfolder }) => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();
  const { getErrorMessage } = useErrorMessageResolver();
  const [fetchKey, updateFetchKey] = useFetchKey();
  const [isModalOpen, setIsModalOpen] = useState(false);

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
        scopeType: scopeType === 'PROJECT' ? 'project' : 'user',
        scopeId,
      },
      { fetchPolicy: 'store-and-network' },
    );
  const permissions = myScopePermissions?.item.permissions ?? [];
  const canRead = _.includes(permissions, 'READ');

  const { scopedVfolderAutoMounts } =
    useLazyLoadQuery<VFolderAutoMountMetadataSectionQuery>(
      graphql`
        query VFolderAutoMountMetadataSectionQuery(
          $scope: VFolderAutoMountScope!
          $filter: VFolderAutoMountFilter
          $canRead: Boolean!
        ) {
          scopedVfolderAutoMounts(scope: $scope, filter: $filter, limit: 1)
            @include(if: $canRead) {
            edges {
              node {
                id
                entityId
                mountDestination
                subpath
                mountPermission
                ...VFolderAutoMountSettingModalFragment
              }
            }
          }
        }
      `,
      {
        scope:
          scopeType === 'PROJECT'
            ? { project: [{ value: scopeId }] }
            : { user: [{ value: scopeId }] },
        filter: {
          scopeType: { equals: scopeType },
          vfolderId: { equals: vfolder.id },
        },
        canRead,
      },
      { fetchKey, fetchPolicy: 'store-and-network' },
    );
  const autoMount = scopedVfolderAutoMounts?.edges[0]?.node ?? null;
  const noPermission = {
    reason:
      scopeType === 'PROJECT'
        ? t('autoMount.NoPermissionToSetProjectAutoMount')
        : t('autoMount.NoPermissionToSetAutoMount'),
  };
  const disabledUnless = (permission: string) =>
    _.includes(permissions, permission) ? undefined : noPermission;

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
      updateFetchKey();
    } catch (error) {
      message.error(getErrorMessage(error));
    }
  };

  const permissionLabel = (permission: string) =>
    permission === 'READ_ONLY'
      ? t('data.ReadOnly')
      : permission === 'READ_WRITE'
        ? t('data.ReadWrite')
        : t('autoMount.ReadWriteDelete');

  return (
    <VStack gap={2} align="stretch">
      {/* The row-action cell, so the buttons match the tables' tooltips and colours. */}
      <BAINameActionCell
        title={
          <HStack gap={1} vAlign="center">
            <Text weight="semibold">{t('autoMount.AutoMount')}</Text>
            <BAIQuestionIconWithTooltip
              title={
                scopeType === 'PROJECT'
                  ? t('autoMount.FolderProjectAutoMountDesc')
                  : t('autoMount.FolderUserAutoMountDesc')
              }
            />
          </HStack>
        }
        showActions="always"
        actions={
          !canRead
            ? []
            : autoMount
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
                    type: 'danger' as const,
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
                ]
        }
      />
      {!canRead ? (
        <Text color="secondary">
          {t('autoMount.NoPermissionToViewAutoMount')}
        </Text>
      ) : autoMount ? (
        <BAIMetadataList columns="single">
          <BAIMetadataListItem label={t('autoMount.MountDestination')}>
            {autoMount.mountDestination}
          </BAIMetadataListItem>
          <BAIMetadataListItem label={t('autoMount.Subpath')}>
            {autoMount.subpath}
          </BAIMetadataListItem>
          <BAIMetadataListItem label={t('autoMount.MountPermission')}>
            {permissionLabel(autoMount.mountPermission)}
          </BAIMetadataListItem>
        </BAIMetadataList>
      ) : (
        <Text color="secondary">{t('autoMount.NotAutoMounted')}</Text>
      )}
      <VFolderAutoMountSettingModal
        open={isModalOpen}
        unmountOnClose
        scopeType={scopeType}
        scopeId={scopeId}
        vfolder={vfolder}
        vfolderAutoMountFrgmt={autoMount}
        onRequestClose={(success) => {
          setIsModalOpen(false);
          if (success && !autoMount) updateFetchKey();
        }}
      />
    </VStack>
  );
};

export default VFolderAutoMountMetadataSection;
