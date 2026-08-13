/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Ticket 16 — converted to Astryx; see `SharedFolderPermissionInfoModal.tsx`
 for the conversion notes (Descriptions→MetadataList with `bordered` dropped,
 Alert→Banner, Popconfirm→BAIPopconfirmAstryx, icon-only button→IconButton
 with a real accessible name). The table crossed to the Astryx engine in
 ticket 30-D.
*/
import { SharedFolderPermissionInfoModalV2Fragment$key } from '../__generated__/SharedFolderPermissionInfoModalV2Fragment.graphql';
import { App } from '../app-shim';
import { useSuspendedBackendaiClient } from '../hooks';
import { useCurrentUserInfo } from '../hooks/backendai';
import { useTanMutation } from '../hooks/reactQueryAlias';
import VFolderPermissionCellV2 from './VFolderPermissionCellV2';
import './baiNameActionCellDanger.css';
import { Banner } from '@astryxdesign/core/Banner';
import { IconButton } from '@astryxdesign/core/IconButton';
import {
  MetadataList,
  MetadataListItem,
} from '@astryxdesign/core/MetadataList';
import { HStack, VStack } from '@astryxdesign/core/Stack';
import { Heading, Text } from '@astryxdesign/core/Text';
import { BAIPopconfirmAstryx as BAIPopconfirm } from 'backend.ai-ui';
import {
  filterOutNullAndUndefined,
  BAITable,
  BAIModal,
  type BAIModalProps,
  BAIText,
  useErrorMessageResolver,
  toLocalId,
} from 'backend.ai-ui';
import { UserIcon, UsersIcon, LogOutIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

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
  const baiClient = useSuspendedBackendaiClient();

  const vfolder = useFragment(
    graphql`
      fragment SharedFolderPermissionInfoModalV2Fragment on VFolder {
        id
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

  const leaveFolder = useTanMutation({
    mutationFn: ({ folderId }: { folderId: string }) => {
      return baiClient.vfolder.leave_invited(folderId);
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
          status="info"
          title={
            isUserOwned
              ? t('data.folders.SharedFolderAlertDesc')
              : t('data.folders.ProjectFolderAlertDesc')
          }
        />
        <MetadataList title={t('data.FolderInfo')} columns={2}>
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
        </MetadataList>

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
                          const leaveFolderId = globalId
                            ? toLocalId(globalId)
                            : null;
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
