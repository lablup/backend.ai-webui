import {
  SharedFolderPermissionInfoModalFragment$data,
  SharedFolderPermissionInfoModalFragment$key,
} from '../__generated__/SharedFolderPermissionInfoModalFragment.graphql';
import { filterNonNullItems } from '../helper';
import { useSuspendedBackendaiClient } from '../hooks';
import { useCurrentUserInfo } from '../hooks/backendai';
import { useTanMutation } from '../hooks/reactQueryAlias';
import { usePainKiller } from '../hooks/usePainKiller';
import UserUnionIcon from './BAIIcons/UserUnionIcon';
import BAIModal, { BAIModalProps } from './BAIModal';
import BAITable from './BAITable';
import Flex from './Flex';
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
import { LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

interface SharedFolderPermissionInfoModalProps extends BAIModalProps {
  vfolderFrgmt: SharedFolderPermissionInfoModalFragment$key | null;
  onRequestClose: (success?: boolean) => void;
}

type VFolder = NonNullable<SharedFolderPermissionInfoModalFragment$data>;

const SharedFolderPermissionInfoModal: React.FC<
  SharedFolderPermissionInfoModalProps
> = ({ vfolderFrgmt, onRequestClose, ...modalProps }) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const [currentUser] = useCurrentUserInfo();
  const baiClient = useSuspendedBackendaiClient();
  const painKiller = usePainKiller();

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
      <Flex direction="column" align="stretch" gap="lg">
        <Alert
          showIcon
          type="info"
          message={
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
              <Flex gap={'xs'}>
                <Typography.Text>{t('data.User')}</Typography.Text>
                <UserOutlined style={{ color: token.colorTextTertiary }} />
              </Flex>
            ) : (
              <Flex gap={'xs'}>
                <Typography.Text>{t('data.Project')}</Typography.Text>
                <UserUnionIcon style={{ color: token.colorTextTertiary }} />
              </Flex>
            )}
          </Descriptions.Item>
          <Descriptions.Item label={t('data.folders.Owner')}>
            {vfolder?.creator || vfolder?.user_email}
          </Descriptions.Item>
        </Descriptions>

        {vfolder?.ownership_type === 'user' ? (
          <Flex direction="column" align="stretch">
            <Typography.Title
              level={5}
              style={{ marginTop: 0, marginBottom: token.marginMD }}
            >
              {t('data.folders.Permission')}
            </Typography.Title>
            <BAITable<VFolder>
              bordered
              pagination={false}
              dataSource={filterNonNullItems([vfolder])}
              columns={[
                {
                  key: 'userName',
                  title: t('general.E-Mail'),
                  render: () => currentUser.email,
                },
                {
                  key: 'permissions',
                  title: t('data.folders.MountPermission'),
                  render: (perm: string, vfolder) => {
                    return <VFolderPermissionCell vfolderFrgmt={vfolder} />;
                  },
                },
                {
                  key: 'control',
                  title: t('data.folders.Control'),
                  render: (data) => (
                    <Flex align="stretch" justify="center">
                      <Popconfirm
                        title={t('data.invitation.LeaveSharedFolderDesc', {
                          folderName: data?.name,
                        })}
                        onConfirm={() => {
                          leaveFolder.mutate(
                            {
                              folderId: data?.row_id,
                            },
                            {
                              onSuccess: () => {
                                message.success(
                                  t(
                                    'data.invitation.SuccessfullyLeftSharedFolder',
                                  ),
                                );
                                onRequestClose(true);
                              },
                              onError: (err) => {
                                message.error(
                                  painKiller.relieve(err?.message) ||
                                    t('general.ErrorOccurred'),
                                );
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
                    </Flex>
                  ),
                },
              ]}
            />
          </Flex>
        ) : null}
      </Flex>
    </BAIModal>
  );
};

export default SharedFolderPermissionInfoModal;
