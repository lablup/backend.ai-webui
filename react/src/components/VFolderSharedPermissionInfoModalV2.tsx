/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { VFolderSharedPermissionInfoModalV2Fragment$key } from '../__generated__/VFolderSharedPermissionInfoModalV2Fragment.graphql';
import { useSuspendedBackendaiClient } from '../hooks';
import { useCurrentUserInfo } from '../hooks/backendai';
import { useTanMutation } from '../hooks/reactQueryAlias';
import VFolderPermissionCellV2 from './VFolderPermissionCellV2';
import { UserOutlined } from '@ant-design/icons';
import {
  Alert,
  App,
  Button,
  Descriptions,
  Popconfirm,
  Tooltip,
  Typography,
  theme,
} from 'antd';
import {
  BAIModal,
  BAIModalProps,
  BAITable,
  BAIUserUnionIcon,
  BAIFlex,
  filterOutNullAndUndefined,
  toLocalId,
  useErrorMessageResolver,
} from 'backend.ai-ui';
import { LogOut } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

interface VFolderSharedPermissionInfoModalV2Props extends BAIModalProps {
  vfolderFrgmt: VFolderSharedPermissionInfoModalV2Fragment$key | null;
  onLeaveFolder?: (folderId: string) => void;
  onRequestClose: (success?: boolean) => void;
}

const VFolderSharedPermissionInfoModalV2: React.FC<
  VFolderSharedPermissionInfoModalV2Props
> = ({ vfolderFrgmt, onRequestClose, onLeaveFolder, ...modalProps }) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const { getErrorMessage } = useErrorMessageResolver();
  const [currentUser] = useCurrentUserInfo();
  const baiClient = useSuspendedBackendaiClient();

  const vfolder = useFragment(
    graphql`
      fragment VFolderSharedPermissionInfoModalV2Fragment on VFolder {
        id @required(action: NONE)
        metadata {
          name
        }
        accessControl {
          ownershipType
        }
        ownership {
          creatorEmail
        }
        ...VFolderPermissionCellV2Fragment
      }
    `,
    vfolderFrgmt,
  );

  const isUserOwned = vfolder?.accessControl?.ownershipType === 'USER';

  // FIXME(FR-2573): migrate leave_invited to V2 when available
  const leaveFolder = useTanMutation({
    mutationFn: ({ folderId }: { folderId: string }) => {
      return baiClient.vfolder.leave_invited(folderId);
    },
  });

  return (
    <BAIModal
      title={t('data.SharedFolderPermission')}
      onCancel={() => onRequestClose()}
      footer={null}
      {...modalProps}
    >
      <BAIFlex direction="column" align="stretch" gap="lg">
        <Alert
          showIcon
          type="info"
          title={
            isUserOwned
              ? t('data.folders.SharedFolderAlertDesc')
              : t('data.folders.ProjectFolderAlertDesc')
          }
        />
        <Descriptions column={2} bordered title={t('data.FolderInfo')}>
          <Descriptions.Item label={t('data.folders.Name')}>
            <Typography.Text copyable>
              {vfolder?.metadata?.name}
            </Typography.Text>
          </Descriptions.Item>
          <Descriptions.Item label={t('data.folders.Type')}>
            {isUserOwned ? (
              <BAIFlex gap={'xs'}>
                <Typography.Text>{t('data.User')}</Typography.Text>
                <UserOutlined style={{ color: token.colorTextTertiary }} />
              </BAIFlex>
            ) : (
              <BAIFlex gap={'xs'}>
                <Typography.Text>{t('data.Project')}</Typography.Text>
                <BAIUserUnionIcon style={{ color: token.colorTextTertiary }} />
              </BAIFlex>
            )}
          </Descriptions.Item>
          <Descriptions.Item label={t('data.folders.Owner')}>
            {vfolder?.ownership?.creatorEmail}
          </Descriptions.Item>
        </Descriptions>

        {isUserOwned ? (
          <BAIFlex direction="column" align="stretch">
            <Typography.Title
              level={5}
              style={{ marginTop: 0, marginBottom: token.marginMD }}
            >
              {t('data.folders.Permission')}
            </Typography.Title>
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
                  render: (_perm, record) => (
                    <VFolderPermissionCellV2 vfolderFrgmt={record} />
                  ),
                },
                {
                  key: 'control',
                  title: t('data.folders.Control'),
                  render: (_, record) => (
                    <BAIFlex align="stretch" justify="center">
                      <Popconfirm
                        title={t('data.invitation.LeaveSharedFolderDesc', {
                          folderName: record?.metadata?.name,
                        })}
                        onConfirm={() => {
                          const leaveFolderId = toLocalId(record?.id ?? '');
                          if (!leaveFolderId) return;
                          leaveFolder.mutate(
                            { folderId: leaveFolderId },
                            {
                              onSuccess: () => {
                                onLeaveFolder?.(record.id);
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
                        }}
                      >
                        <Tooltip
                          title={t('data.invitation.LeaveSharedFolder')}
                          placement="right"
                        >
                          <Button
                            size="small"
                            type="text"
                            icon={<LogOut />}
                            style={{
                              color: token.colorError,
                              background: token.colorErrorBg,
                            }}
                          />
                        </Tooltip>
                      </Popconfirm>
                    </BAIFlex>
                  ),
                },
              ]}
            />
          </BAIFlex>
        ) : null}
      </BAIFlex>
    </BAIModal>
  );
};

export default VFolderSharedPermissionInfoModalV2;
