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
import VFolderPermissionCellV2 from './VFolderPermissionCellV2';
import { Banner } from '@lablup/ui-common/Banner';
import { IconButton } from '@lablup/ui-common/IconButton';
import { MetadataListItem } from '@lablup/ui-common/MetadataList';
import { HStack, VStack } from '@lablup/ui-common/Stack';
import { Heading, Text } from '@lablup/ui-common/Text';
import { BAIPopconfirm } from 'backend.ai-ui';
import {
  filterOutNullAndUndefined,
  BAITable,
  BAIMetadataList,
  BAIModal,
  type BAIModalProps,
  BAIText,
  useErrorMessageResolver,
  useMutationWithPromise,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { UserIcon, UsersIcon, LogOutIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  type Environment,
  fetchQuery,
  graphql,
  useFragment,
  useRelayEnvironment,
} from 'react-relay';

const VFOLDER_ENTITY_TYPE = 'vfolder';
// `myAtomicBulkScopePermissions` refuses more than 100 targets.
const MAX_PERMISSION_TARGETS = 100;

interface LeavableShare {
  /** The share's `entityId`: what `leaveEntityShare` takes. */
  shareId: string;
  /** Set when the share is addressed to a project: leaving it takes the folder from the whole project. */
  projectName?: string;
}

/**
 * The accepted share of the folder the caller may leave: their own, else one
 * addressed to a project where they hold `soft-delete` on `entity_share`
 * (lablup/backend.ai#17162; `myEntityShares` never lists project shares).
 */
const findLeavableShare = async (
  environment: Environment,
  folderId: string,
): Promise<LeavableShare | null> => {
  const mine = await fetchQuery<SharedFolderPermissionInfoModalV2MySharesQuery>(
    environment,
    graphql`
      query SharedFolderPermissionInfoModalV2MySharesQuery($folderId: UUID!) {
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
        myUserV2 {
          projects(filter: { isActive: true }, limit: 100) {
            edges {
              node {
                entityId
                basicInfo {
                  name
                }
              }
            }
          }
        }
      }
    `,
    { folderId },
    { fetchPolicy: 'network-only' },
  ).toPromise();
  const own = mine?.myEntityShares?.edges.find(
    ({ node }) => node.targetEntityType === VFOLDER_ENTITY_TYPE,
  )?.node;
  if (own) return { shareId: own.entityId };

  const projects = _.map(mine?.myUserV2?.projects?.edges, 'node').slice(
    0,
    MAX_PERMISSION_TARGETS,
  );
  if (_.isEmpty(projects)) return null;
  const permissions =
    await fetchQuery<SharedFolderPermissionInfoModalV2ProjectLeaversQuery>(
      environment,
      graphql`
        query SharedFolderPermissionInfoModalV2ProjectLeaversQuery(
          $targets: [PermissionTarget!]!
        ) {
          myAtomicBulkScopePermissions(input: { targets: $targets }) {
            items {
              scopeId
              permissions
            }
          }
        }
      `,
      {
        targets: _.map(projects, (project) => ({
          scopeType: 'project',
          scopeId: project.entityId,
          entityType: 'entity_share',
        })),
      },
      { fetchPolicy: 'network-only' },
    ).toPromise();
  // Leaving takes `SOFT_DELETE`, not the `UPDATE` accepting takes: a role may hold one bit only.
  const leavableIds = _.map(
    _.filter(permissions?.myAtomicBulkScopePermissions?.items, (item) =>
      _.includes(item.permissions, 'SOFT_DELETE'),
    ),
    'scopeId',
  );
  if (_.isEmpty(leavableIds)) return null;
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
            limit: 100
          ) {
            edges {
              node {
                entityId
                targetEntityType
                recipientEntityId
              }
            }
          }
        }
      `,
      {
        projects: _.map(leavableIds, (value) => ({ value })),
        folderId,
      },
      { fetchPolicy: 'network-only' },
    ).toPromise();
  const projectShare = shares?.entityShares?.edges.find(
    ({ node }) => node.targetEntityType === VFOLDER_ENTITY_TYPE,
  )?.node;
  if (!projectShare) return null;
  return {
    shareId: projectShare.entityId,
    projectName:
      _.find(projects, { entityId: projectShare.recipientEntityId ?? '' })
        ?.basicInfo.name ??
      projectShare.recipientEntityId ??
      undefined,
  };
};

interface SharedFolderPermissionInfoModalV2Props extends Omit<
  BAIModalProps,
  'isOpen' | 'onOpenChange'
> {
  /** App-level contract, kept: consumers outside this area use it. */
  open?: boolean;
  vfolderFrgmt: SharedFolderPermissionInfoModalV2Fragment$key | null;
  onLeaveFolder?: (folderId: string) => void;
  onRequestClose: (success?: boolean) => void;
}

const SharedFolderPermissionInfoModalV2: React.FC<
  SharedFolderPermissionInfoModalV2Props
> = ({ vfolderFrgmt, onRequestClose, onLeaveFolder, ...modalProps }) => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();
  const { getErrorMessage } = useErrorMessageResolver();
  const [currentUser] = useCurrentUserInfo();
  const relayEnvironment = useRelayEnvironment();

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

  const folderId = vfolder?.entityId;
  const leavableShare = useTanQuery({
    queryKey: ['SharedFolderPermissionInfoModalV2.leavableShare', folderId],
    queryFn: () => findLeavableShare(relayEnvironment, folderId ?? ''),
    enabled: !!modalProps.open && !!folderId,
    staleTime: 0,
  });
  const share = leavableShare.data;

  const leaveFolder = useTanMutation({
    mutationFn: ({ shareId }: { shareId: string }) =>
      leaveShare({ id: shareId }),
  });

  const isUserOwned = vfolder?.accessControl?.ownershipType === 'USER';

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

        {isUserOwned ? (
          <VStack align="stretch" gap={4}>
            <Heading level={5}>{t('data.folders.Permission')}</Heading>
            <BAITable
              bordered
              pagination={false}
              dataSource={filterOutNullAndUndefined([vfolder])}
              columns={[
                {
                  key: 'userName',
                  title: t('general.E-Mail'),
                  render: () => currentUser.email,
                },
                {
                  key: 'permissions',
                  title: t('data.folders.MountPermission'),
                  render: (_perm: string, vfolder) => {
                    return <VFolderPermissionCellV2 vfolderFrgmt={vfolder} />;
                  },
                },
                ...(share
                  ? [
                      {
                        key: 'control',
                        title: t('data.folders.Control'),
                        render: (_value: unknown, data: typeof vfolder) => (
                          <HStack justify="center">
                            <BAIPopconfirm
                              title={
                                share.projectName
                                  ? t(
                                      'data.invitation.LeaveProjectSharedFolderDesc',
                                      {
                                        folderName: data?.metadata?.name,
                                        projectName: share.projectName,
                                      },
                                    )
                                  : t('data.invitation.LeaveSharedFolderDesc', {
                                      folderName: data?.metadata?.name,
                                    })
                              }
                              onConfirm={() => {
                                const globalId = data?.id;
                                if (globalId) {
                                  leaveFolder.mutate(
                                    {
                                      shareId: share.shareId,
                                    },
                                    {
                                      onSuccess: () => {
                                        onLeaveFolder?.(globalId);
                                        message.success(
                                          t(
                                            'data.invitation.SuccessfullyLeftSharedFolder',
                                          ),
                                        );
                                        onRequestClose(true);
                                      },
                                      onError: (err) => {
                                        message.error(getErrorMessage(err));
                                        onRequestClose();
                                      },
                                    },
                                  );
                                }
                              }}
                            >
                              <IconButton
                                label={t('data.invitation.LeaveSharedFolder')}
                                tooltip={t('data.invitation.LeaveSharedFolder')}
                                size="sm"
                                variant="ghost"
                                icon={<LogOutIcon />}
                                className="bai-name-action-cell-danger"
                              />
                            </BAIPopconfirm>
                          </HStack>
                        ),
                      },
                    ]
                  : []),
              ]}
            />
          </VStack>
        ) : null}
      </VStack>
    </BAIModal>
  );
};

export default SharedFolderPermissionInfoModalV2;
