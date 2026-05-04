/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { SharedFolderPermissionInfoModalV2Fragment$key } from '../__generated__/SharedFolderPermissionInfoModalV2Fragment.graphql';
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
  filterOutNullAndUndefined,
  BAITable,
  BAIUserUnionIcon,
  BAIFlex,
  useErrorMessageResolver,
  toLocalId,
} from 'backend.ai-ui';
import { LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

interface SharedFolderPermissionInfoModalV2Props extends BAIModalProps {
  vfolderFrgmt: SharedFolderPermissionInfoModalV2Fragment$key | null;
  onLeaveFolder?: (folderId: string) => void;
  onRequestClose: (success?: boolean) => void;
}

const SharedFolderPermissionInfoModalV2: React.FC<
  SharedFolderPermissionInfoModalV2Props
> = ({ vfolderFrgmt, onRequestClose, onLeaveFolder, ...modalProps }) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
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
            {vfolder?.ownership?.creatorEmail ||
              vfolder?.ownership?.user?.basicInfo?.email}
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
                  render: (_perm: string, vfolder) => {
                    return <VFolderPermissionCellV2 vfolderFrgmt={vfolder} />;
                  },
                },
                {
                  key: 'control',
                  title: t('data.folders.Control'),
                  render: (_, data) => (
                    <BAIFlex align="stretch" justify="center">
                      <Popconfirm
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

export default SharedFolderPermissionInfoModalV2;
