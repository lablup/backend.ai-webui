import { useVFolderInvitations } from '../hooks/backendai';
import BAIModal, { BAIModalProps } from './BAIModal';
import Flex from './Flex';
import VFolderPermissionCell from './VFolderPermissionCell';
import { FolderOutlined } from '@ant-design/icons';
import { List, Button, Typography, theme, Descriptions, App } from 'antd';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

interface InvitationItem {
  id: string;
  vfolder_id: string;
  vfolder_name: string;
  invitee_user_email: string;
  inviter_user_email: string;
  mount_permission: string;
  created_at: string;
  modified_at: string | null;
  status: string;
  perm: string;
}

interface FolderInvitationResponseModalProps extends BAIModalProps {
  onRequestClose?: (success: boolean) => void;
  fetchKey?: string;
}

const FolderInvitationResponseModal: React.FC<
  FolderInvitationResponseModalProps
> = ({ onRequestClose, fetchKey, ...baiModalProps }) => {
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const { t } = useTranslation();
  const [
    { invitations },
    { acceptInvitation, rejectInvitation: declineInvitation },
  ] = useVFolderInvitations(fetchKey);

  const renderInvitationItem = useCallback(
    (item: InvitationItem) => (
      <List.Item
        actions={[
          <Button
            type="primary"
            onClick={() =>
              acceptInvitation(item.id, {
                onSuccess: () => {
                  onRequestClose?.(true);
                  message.success(
                    t('data.invitation.SuccessfullyAcceptedInvitation'),
                  );
                },
                onError: (e) => {
                  onRequestClose?.(false);
                  message.error(
                    e.message || t('data.invitation.FailedToAcceptInvitation'),
                  );
                },
              })
            }
            key="accept"
          >
            {t('summary.Accept')}
          </Button>,
          <Button
            danger
            onClick={() =>
              declineInvitation(item.id, {
                onSuccess: () => {
                  onRequestClose?.(true);
                  message.success(
                    t('data.invitation.SuccessfullyDeclinedInvitation'),
                  );
                },
                onError: (e) => {
                  onRequestClose?.(false);
                  message.error(
                    e.message || t('data.invitation.FailedToDeclineInvitation'),
                  );
                },
              })
            }
            key="decline"
          >
            {t('summary.Decline')}
          </Button>,
        ]}
        style={{
          padding: token.paddingSM,
        }}
      >
        <List.Item.Meta
          title={
            <Flex gap={'xxs'}>
              <FolderOutlined />
              <Typography.Text strong>{item.vfolder_name}</Typography.Text>
            </Flex>
          }
          description={
            <Descriptions
              size="small"
              column={1}
              items={[
                {
                  key: 'from',
                  label: t('data.From'),
                  children: item.inviter_user_email,
                },
                {
                  key: 'permission',
                  label: t('data.Permission'),
                  children: <VFolderPermissionCell permission={item.perm} />,
                },
              ]}
            />
          }
        />
      </List.Item>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [acceptInvitation, declineInvitation, onRequestClose],
  );

  return (
    <BAIModal
      onCancel={() => onRequestClose?.(false)}
      title={t('data.InvitedFolders')}
      footer={null}
      {...baiModalProps}
    >
      <List
        dataSource={invitations}
        renderItem={(item) =>
          renderInvitationItem({
            ...item,
          })
        }
      />
    </BAIModal>
  );
};

export default FolderInvitationResponseModal;
