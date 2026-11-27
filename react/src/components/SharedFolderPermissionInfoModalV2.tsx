/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
*/
import { SharedFolderPermissionInfoModalV2Fragment$key } from '../__generated__/SharedFolderPermissionInfoModalV2Fragment.graphql';
import { SharedFolderPermissionInfoModalV2LeaveMutation } from '../__generated__/SharedFolderPermissionInfoModalV2LeaveMutation.graphql';
import { SharedFolderPermissionInfoModalV2MySharesQuery } from '../__generated__/SharedFolderPermissionInfoModalV2MySharesQuery.graphql';
import { SharedFolderPermissionInfoModalV2ProjectLeaversQuery } from '../__generated__/SharedFolderPermissionInfoModalV2ProjectLeaversQuery.graphql';
import { SharedFolderPermissionInfoModalV2ProjectSharesQuery } from '../__generated__/SharedFolderPermissionInfoModalV2ProjectSharesQuery.graphql';
import { App } from '../app-shim';
import { useCurrentUserInfo } from '../hooks/backendai';
import { useTanMutation, useTanQuery } from '../hooks/reactQueryAlias';
import { useIsPersonalProject } from '../hooks/useAccessibleProjects';
import type { ProjectContextOrNull } from '../types/projectContext';
import VFolderPermissionCellV2 from './VFolderPermissionCellV2';
import { Banner } from '@lablup/ui-common/Banner';
import { IconButton } from '@lablup/ui-common/IconButton';
import { MetadataListItem } from '@lablup/ui-common/MetadataList';
import { HStack, VStack } from '@lablup/ui-common/Stack';
import { Heading, Text } from '@lablup/ui-common/Text';
import {
  BAIDeleteConfirmModal,
  BAIPopconfirm,
  filterOutNullAndUndefined,
  BAITable,
  BAIMetadataList,
  BAIModal,
  BAISkeleton,
  type BAIModalProps,
  BAIText,
  useErrorMessageResolver,
  useMutationWithPromise,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { UserIcon, UsersIcon, LogOutIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  type Environment,
  fetchQuery,
  graphql,
  useFragment,
  useRelayEnvironment,
} from 'react-relay';

const VFOLDER_ENTITY_TYPE = 'vfolder';
const ENTITY_SHARE_ENTITY_TYPE = 'entity_share';

type LeavableShare =
  | { shareId: string; isProjectShare: false }
  /** Leaving a project's share takes the folder from the whole project. */
  | { shareId: string; isProjectShare: true; projectName: string };

const isFolderShare = (share: { targetEntityType: string }) =>
  share.targetEntityType.toLowerCase() === VFOLDER_ENTITY_TYPE;

// Relay resolves a response whose nullable root field errored with that field null: treat it as a failure.
class UnreadableFieldError extends Error {}
const requireField = <T,>(value: T | null | undefined, field: string): T => {
  if (value == null) throw new UnreadableFieldError(field);
  return value;
};

/**
 * The accepted share of the folder the caller may leave: `recipientProject`'s,
 * or their own when it is null (`myEntityShares` never lists project shares).
 * Leaving takes `SOFT_DELETE` on `entity_share` in the scope the share is
 * addressed to (lablup/backend.ai#17162); `null` when there is no such share.
 */
const findLeavableShare = async (
  environment: Environment,
  folderId: string,
  userId: string,
  recipientProject: ProjectContextOrNull,
): Promise<LeavableShare | null> => {
  if (!recipientProject) {
    const mine =
      await fetchQuery<SharedFolderPermissionInfoModalV2MySharesQuery>(
        environment,
        graphql`
          query SharedFolderPermissionInfoModalV2MySharesQuery(
            $folderId: UUID!
            $userScope: PermissionTarget!
          ) {
            myEntityShares(
              sides: [RECIPIENT]
              filter: {
                targetEntityId: { equals: $folderId }
                status: { equals: ACCEPTED }
              }
              limit: 1
            ) {
              edges {
                node {
                  entityId
                  targetEntityType
                }
              }
            }
            myScopePermissions(input: { target: $userScope }) {
              item {
                permissions
              }
            }
          }
        `,
        {
          folderId,
          userScope: {
            scopeType: 'user',
            scopeId: userId,
            entityType: ENTITY_SHARE_ENTITY_TYPE,
          },
        },
        { fetchPolicy: 'network-only' },
      ).toPromise();
    const own = requireField(mine?.myEntityShares, 'myEntityShares').edges.find(
      ({ node }) => isFolderShare(node),
    )?.node;
    const canLeave = _.includes(
      requireField(mine?.myScopePermissions, 'myScopePermissions').item
        .permissions,
      'SOFT_DELETE',
    );
    return own && canLeave
      ? { shareId: own.entityId, isProjectShare: false }
      : null;
  }

  const permissions =
    await fetchQuery<SharedFolderPermissionInfoModalV2ProjectLeaversQuery>(
      environment,
      graphql`
        query SharedFolderPermissionInfoModalV2ProjectLeaversQuery(
          $projectScope: PermissionTarget!
        ) {
          myScopePermissions(input: { target: $projectScope }) {
            item {
              permissions
            }
          }
        }
      `,
      {
        projectScope: {
          scopeType: 'project',
          scopeId: recipientProject.id,
          entityType: ENTITY_SHARE_ENTITY_TYPE,
        },
      },
      { fetchPolicy: 'network-only' },
    ).toPromise();
  // Finding the project's share takes `READ` next to the `SOFT_DELETE` leaving takes.
  const projectBits = requireField(
    permissions?.myScopePermissions,
    'myScopePermissions',
  ).item.permissions;
  if (
    !_.includes(projectBits, 'SOFT_DELETE') ||
    !_.includes(projectBits, 'READ')
  )
    return null;
  const shares =
    await fetchQuery<SharedFolderPermissionInfoModalV2ProjectSharesQuery>(
      environment,
      graphql`
        query SharedFolderPermissionInfoModalV2ProjectSharesQuery(
          $projects: [UUIDScope!]!
          $folderId: UUID!
        ) {
          entityShares(
            scope: { recipientProject: $projects }
            filter: {
              targetEntityId: { equals: $folderId }
              status: { equals: ACCEPTED }
            }
            limit: 1
          ) {
            edges {
              node {
                entityId
                targetEntityType
              }
            }
          }
        }
      `,
      { projects: [{ value: recipientProject.id }], folderId },
      { fetchPolicy: 'network-only' },
    ).toPromise();
  const projectShare = requireField(
    shares?.entityShares,
    'entityShares',
  ).edges.find(({ node }) => isFolderShare(node))?.node;
  if (!projectShare) return null;
  return {
    shareId: projectShare.entityId,
    isProjectShare: true,
    projectName: recipientProject.name,
  };
};

interface SharedFolderPermissionInfoModalV2Props extends Omit<
  BAIModalProps,
  'isOpen' | 'onOpenChange'
> {
  /** App-level contract, kept: consumers outside this area use it. */
  open?: boolean;
  vfolderFrgmt: SharedFolderPermissionInfoModalV2Fragment$key | null;
  /** The page's project (ADR-0001): its share is the one shown and left; the caller's own on their personal project or with `null`. */
  project: ProjectContextOrNull;
  onLeaveFolder?: (folderId: string) => void;
  onRequestClose: (success?: boolean) => void;
}

const SharedFolderPermissionInfoModalV2: React.FC<
  SharedFolderPermissionInfoModalV2Props
> = ({
  vfolderFrgmt,
  project,
  onRequestClose,
  onLeaveFolder,
  ...modalProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();
  const { getErrorMessage } = useErrorMessageResolver();
  const [currentUser] = useCurrentUserInfo();
  const relayEnvironment = useRelayEnvironment();
  const [isProjectLeaveOpen, setIsProjectLeaveOpen] = useState(false);

  const vfolder = useFragment(
    graphql`
      fragment SharedFolderPermissionInfoModalV2Fragment on VFolder {
        id
        entityId
        metadata {
          name
        }
        accessControl {
          ownershipType
        }
        ownership {
          creatorEmail
          user {
            basicInfo {
              email
            }
          }
        }
        ...VFolderPermissionCellV2Fragment
      }
    `,
    vfolderFrgmt,
  );

  const leaveShare =
    useMutationWithPromise<SharedFolderPermissionInfoModalV2LeaveMutation>(
      graphql`
        mutation SharedFolderPermissionInfoModalV2LeaveMutation($id: UUID!) {
          leaveEntityShare(id: $id) {
            share {
              id
              status
            }
          }
        }
      `,
    );

  const isUserOwned = vfolder?.accessControl?.ownershipType === 'USER';
  const folderId = vfolder?.entityId;
  const userId = currentUser.uuid;
  // On the caller's personal project the folder is reached through their own
  // share; on any other project, through that project's.
  const isPersonalProject = useIsPersonalProject(project?.id);
  const recipientProject = isPersonalProject ? null : project;
  const leavableShare = useTanQuery({
    queryKey: [
      'SharedFolderPermissionInfoModalV2.leavableShare',
      folderId,
      userId,
      recipientProject?.id ?? null,
    ],
    queryFn: () =>
      findLeavableShare(
        relayEnvironment,
        folderId ?? '',
        userId,
        recipientProject,
      ),
    enabled: !!modalProps.open && !!folderId && !!userId,
    staleTime: 0,
    gcTime: 0,
  });
  const share = leavableShare.data;
  const cannotLeave = !share;

  const leaveFolder = useTanMutation({
    mutationFn: ({ shareId }: { shareId: string }) =>
      leaveShare({ id: shareId }),
  });

  const leave = () => {
    const globalId = vfolder?.id;
    if (!share || !globalId) return Promise.resolve();
    return leaveFolder
      .mutateAsync({ shareId: share.shareId })
      .then(() => {
        onLeaveFolder?.(globalId);
        message.success(t('data.invitation.SuccessfullyLeftSharedFolder'));
        onRequestClose(true);
      })
      .catch((err) => {
        message.error(getErrorMessage(err));
        onRequestClose();
      });
  };

  const leaveButton = (
    <IconButton
      label={t('data.invitation.LeaveSharedFolder')}
      tooltip={
        leavableShare.isError
          ? leavableShare.error instanceof UnreadableFieldError
            ? t('general.ErrorOccurred')
            : getErrorMessage(leavableShare.error)
          : cannotLeave
            ? t('data.invitation.NoPermissionToLeaveSharedFolder')
            : t('data.invitation.LeaveSharedFolder')
      }
      size="sm"
      variant="ghost"
      icon={<LogOutIcon />}
      className="bai-name-action-cell-danger"
      isLoading={leaveFolder.isPending}
      isDisabled={cannotLeave}
      onClick={
        share?.isProjectShare ? () => setIsProjectLeaveOpen(true) : undefined
      }
    />
  );

  return (
    <BAIModal
      isOpen={modalProps.open}
      onOpenChange={(next) => {
        if (!next) onRequestClose();
      }}
      title={t('data.SharedFolderPermission')}
      maskClosable={false}
      footer={null}
      {...modalProps}
    >
      {leavableShare.isLoading ? (
        <BAISkeleton />
      ) : (
        <VStack align="stretch" gap={5}>
          <Banner
            role="status"
            status="info"
            title={
              isUserOwned
                ? t('data.folders.SharedFolderAlertDesc')
                : t('data.folders.ProjectFolderAlertDesc')
            }
          />
          <BAIMetadataList title={t('data.FolderInfo')} columns={2}>
            <MetadataListItem label={t('data.folders.Name')}>
              <BAIText copyable>{vfolder?.metadata?.name ?? ''}</BAIText>
            </MetadataListItem>
            <MetadataListItem label={t('data.folders.Type')}>
              {isUserOwned ? (
                <HStack gap={2} align="center">
                  <Text>{t('data.User')}</Text>
                  <UserIcon size="1em" />
                </HStack>
              ) : (
                <HStack gap={2} align="center">
                  <Text>{t('data.Project')}</Text>
                  <UsersIcon size="1em" />
                </HStack>
              )}
            </MetadataListItem>
            <MetadataListItem label={t('data.folders.Owner')}>
              {vfolder?.ownership?.creatorEmail ||
                vfolder?.ownership?.user?.basicInfo?.email}
            </MetadataListItem>
          </BAIMetadataList>

          <VStack align="stretch" gap={4}>
            <Heading level={5}>{t('data.folders.Permission')}</Heading>
            <BAITable
              bordered
              pagination={false}
              dataSource={filterOutNullAndUndefined([vfolder])}
              columns={[
                // Named by the page's project, so a caller who may not read the share sees it too.
                {
                  key: 'shareType',
                  title: t('data.folders.ShareType'),
                  render: () =>
                    recipientProject ? t('general.Project') : t('general.User'),
                },
                {
                  key: 'recipient',
                  title: t('data.folders.Recipient'),
                  render: () =>
                    recipientProject
                      ? recipientProject.name
                      : currentUser.email,
                },
                {
                  key: 'permissions',
                  title: t('data.folders.MountPermission'),
                  render: (_perm: string, vfolder) => {
                    return <VFolderPermissionCellV2 vfolderFrgmt={vfolder} />;
                  },
                },
                {
                  key: 'control',
                  title: t('data.folders.Control'),
                  render: () => (
                    <HStack justify="center">
                      {share && !share.isProjectShare ? (
                        <BAIPopconfirm
                          title={t('data.invitation.LeaveSharedFolderDesc', {
                            folderName: vfolder?.metadata?.name,
                          })}
                          onConfirm={leave}
                        >
                          {leaveButton}
                        </BAIPopconfirm>
                      ) : (
                        leaveButton
                      )}
                    </HStack>
                  ),
                },
              ]}
            />
          </VStack>
        </VStack>
      )}
      {share?.isProjectShare ? (
        <BAIDeleteConfirmModal
          open={isProjectLeaveOpen}
          title={t('data.invitation.LeaveSharedFolder')}
          description={t('data.invitation.LeaveProjectSharedFolderDesc', {
            folderName: vfolder?.metadata?.name,
            projectName: share.projectName,
          })}
          items={[
            {
              key: share.shareId,
              label: vfolder?.metadata?.name ?? '',
            },
          ]}
          confirmText={vfolder?.metadata?.name ?? ''}
          requireConfirmInput
          confirmLoading={leaveFolder.isPending}
          okText={t('data.invitation.LeaveSharedFolder')}
          onOk={() => leave().finally(() => setIsProjectLeaveOpen(false))}
          onCancel={() => setIsProjectLeaveOpen(false)}
        />
      ) : null}
    </BAIModal>
  );
};

export default SharedFolderPermissionInfoModalV2;
