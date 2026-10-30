/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
*/
import { SharedFolderPermissionInfoModalV2Fragment$key } from '../__generated__/SharedFolderPermissionInfoModalV2Fragment.graphql';
import { SharedFolderPermissionInfoModalV2LeaveMutation } from '../__generated__/SharedFolderPermissionInfoModalV2LeaveMutation.graphql';
import { SharedFolderPermissionInfoModalV2MySharesQuery } from '../__generated__/SharedFolderPermissionInfoModalV2MySharesQuery.graphql';
import { App } from '../app-shim';
import { useCurrentUserInfo } from '../hooks/backendai';
import { useTanMutation } from '../hooks/reactQueryAlias';
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
import { UserIcon, UsersIcon, LogOutIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  fetchQuery,
  graphql,
  useFragment,
  useRelayEnvironment,
} from 'react-relay';

const VFOLDER_ENTITY_TYPE = 'vfolder';

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

  // `leaveEntityShare` takes the share, not the folder, so the recipient's
  // accepted share of this folder is looked up first. The status is matched
  // on the client: the deployed manager rejects the `filter` argument's shape.
  const leaveFolder = useTanMutation({
    mutationFn: async ({ folderId }: { folderId: string }) => {
      const data =
        await fetchQuery<SharedFolderPermissionInfoModalV2MySharesQuery>(
          relayEnvironment,
          graphql`
            query SharedFolderPermissionInfoModalV2MySharesQuery {
              myEntityShares(sides: [RECIPIENT], limit: 100) {
                edges {
                  node {
                    entityId
                    targetEntityType
                    targetEntityId
                    status
                  }
                }
              }
            }
          `,
          {},
          { fetchPolicy: 'network-only' },
        ).toPromise();
      const share = data?.myEntityShares?.edges.find(
        ({ node }) =>
          node.targetEntityType === VFOLDER_ENTITY_TYPE &&
          node.targetEntityId === folderId &&
          node.status === 'ACCEPTED',
      )?.node;
      if (!share) {
        throw new Error(t('data.invitation.AcceptedShareNotFound'));
      }
      return leaveShare({ id: share.entityId });
    },
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
              <HStack gap={2}>
                <Text>{t('data.User')}</Text>
                <UserIcon size="1em" />
              </HStack>
            ) : (
              <HStack gap={2}>
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
                {
                  key: 'control',
                  title: t('data.folders.Control'),
                  render: (_, data) => (
                    <HStack justify="center">
                      <BAIPopconfirm
                        title={t('data.invitation.LeaveSharedFolderDesc', {
                          folderName: data?.metadata?.name,
                        })}
                        onConfirm={() => {
                          const globalId = data?.id;
                          const leaveFolderId = data?.entityId;
                          if (leaveFolderId && globalId) {
                            leaveFolder.mutate(
                              {
                                folderId: leaveFolderId,
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
              ]}
            />
          </VStack>
        ) : null}
      </VStack>
    </BAIModal>
  );
};

export default SharedFolderPermissionInfoModalV2;
