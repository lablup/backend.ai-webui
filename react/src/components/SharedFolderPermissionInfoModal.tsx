/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Ticket 16 — converted to Astryx. antd `Descriptions` becomes `MetadataList`
 (its `bordered` emphasis has no destination — MAPPING §4 — and is DROPPED,
 defaults-first), `Alert` becomes `Banner`, `Popconfirm` becomes the
 `BAIPopconfirm` gap component (reversible-tier confirm per
 `.claude/rules/destructive-confirmation.md`), and the icon-only leave button
 becomes an `IconButton` with a real accessible name (P8). The table crossed
 to the Astryx engine in ticket 30-D.
*/
import { SharedFolderPermissionInfoModalFragment$key } from '../__generated__/SharedFolderPermissionInfoModalFragment.graphql';
import { App } from '../app-shim';
import { useSuspendedBackendaiClient } from '../hooks';
import { useCurrentUserInfo } from '../hooks/backendai';
import { useTanMutation } from '../hooks/reactQueryAlias';
import VFolderPermissionCell from './VFolderPermissionCell';
import { Banner } from '@astryxdesign/core/Banner';
import { IconButton } from '@astryxdesign/core/IconButton';
import { MetadataListItem } from '@astryxdesign/core/MetadataList';
import { HStack, VStack } from '@astryxdesign/core/Stack';
import { Heading, Text } from '@astryxdesign/core/Text';
import { BAIPopconfirm } from 'backend.ai-ui';
import {
  filterOutNullAndUndefined,
  BAITable,
  BAIMetadataList,
  BAIModal,
  type BAIModalProps,
  BAIText,
  useErrorMessageResolver,
  toGlobalId,
} from 'backend.ai-ui';
import { UserIcon, UsersIcon, LogOutIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

interface SharedFolderPermissionInfoModalProps extends Omit<
  BAIModalProps,
  'isOpen' | 'onOpenChange'
> {
  /** App-level contract, kept: consumers outside this area use it. */
  open?: boolean;
  vfolderFrgmt: SharedFolderPermissionInfoModalFragment$key | null;
  onLeaveFolder?: (folderId: string) => void;
  onRequestClose: (success?: boolean) => void;
}

const SharedFolderPermissionInfoModal: React.FC<
  SharedFolderPermissionInfoModalProps
> = ({ vfolderFrgmt, onRequestClose, onLeaveFolder, ...modalProps }) => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();
  const { getErrorMessage } = useErrorMessageResolver();
  const [currentUser] = useCurrentUserInfo();
  const baiClient = useSuspendedBackendaiClient();

  const vfolder = useFragment(
    graphql`
      fragment SharedFolderPermissionInfoModalFragment on VirtualFolderNode {
        id
        name
        row_id
        creator
        ownership_type
        user_email
        permission

        ...VFolderPermissionCellFragment
      }
    `,
    vfolderFrgmt,
  );

  const leaveFolder = useTanMutation({
    mutationFn: ({ folderId }: { folderId: string }) => {
      return baiClient.vfolder.leave_invited(folderId);
    },
  });

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
            vfolder?.ownership_type === 'user'
              ? t('data.folders.SharedFolderAlertDesc')
              : t('data.folders.ProjectFolderAlertDesc')
          }
        />
        <BAIMetadataList title={t('data.FolderInfo')} columns={2}>
          <MetadataListItem label={t('data.folders.Name')}>
            <BAIText copyable>{vfolder?.name ?? ''}</BAIText>
          </MetadataListItem>
          <MetadataListItem label={t('data.folders.Type')}>
            {vfolder?.ownership_type === 'user' ? (
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
            {vfolder?.creator || vfolder?.user_email}
          </MetadataListItem>
        </BAIMetadataList>

        {vfolder?.ownership_type === 'user' ? (
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
                    return <VFolderPermissionCell vfolderFrgmt={vfolder} />;
                  },
                },
                {
                  key: 'control',
                  title: t('data.folders.Control'),
                  render: (_, data) => (
                    <HStack justify="center">
                      <BAIPopconfirm
                        title={t('data.invitation.LeaveSharedFolderDesc', {
                          folderName: data?.name,
                        })}
                        onConfirm={() => {
                          const leaveFolderId = data?.row_id;
                          if (leaveFolderId) {
                            leaveFolder.mutate(
                              {
                                folderId: leaveFolderId,
                              },
                              {
                                onSuccess: () => {
                                  onLeaveFolder?.(
                                    toGlobalId(
                                      'VirtualFolderNode',
                                      leaveFolderId,
                                    ),
                                  );
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

export default SharedFolderPermissionInfoModal;
