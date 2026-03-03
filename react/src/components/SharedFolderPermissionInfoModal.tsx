/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { SharedFolderPermissionInfoModalFragment$key } from '../__generated__/SharedFolderPermissionInfoModalFragment.graphql';
import { useSuspendedBackendaiClient } from '../hooks';
import { useCurrentUserInfo } from '../hooks/backendai';
import { useTanMutation } from '../hooks/reactQueryAlias';
import VFolderPermissionCell from './VFolderPermissionCell';
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
  toGlobalId,
} from 'backend.ai-ui';
import { LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

interface SharedFolderPermissionInfoModalProps extends BAIModalProps {
  vfolderFrgmt: SharedFolderPermissionInfoModalFragment$key | null;
  onLeaveFolder?: (folderId: string) => void;
  onRequestClose: (success?: boolean) => void;
}

const SharedFolderPermissionInfoModal: React.FC<
  SharedFolderPermissionInfoModalProps
> = ({ vfolderFrgmt, onRequestClose, onLeaveFolder, ...modalProps }) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
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
            vfolder?.ownership_type === 'user'
              ? t('data.folders.SharedFolderAlertDesc')
              : t('data.folders.ProjectFolderAlertDesc')
          }
        />
        <Descriptions column={2} bordered title={t('data.FolderInfo')}>
          <Descriptions.Item label={t('data.folders.Name')}>
            <Typography.Text copyable>{vfolder?.name}</Typography.Text>
          </Descriptions.Item>
          <Descriptions.Item label={t('data.folders.Type')}>
            {vfolder?.ownership_type === 'user' ? (
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
            {vfolder?.creator || vfolder?.user_email}
          </Descriptions.Item>
        </Descriptions>

        {vfolder?.ownership_type === 'user' ? (
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
                    return <VFolderPermissionCell vfolderFrgmt={vfolder} />;
                  },
                },
                {
                  key: 'control',
                  title: t('data.folders.Control'),
                  render: (_, data) => (
                    <BAIFlex align="stretch" justify="center">
                      <Popconfirm
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

export default SharedFolderPermissionInfoModal;
