import { useVFolderInvitations } from '../hooks/backendai';
import BAIModal, { BAIModalProps } from './BAIModal';
import Flex from './Flex';
import { FolderOutlined } from '@ant-design/icons';
import { List, Button, Typography, theme, Descriptions } from 'antd';
import React from 'react';
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
  onRequestClose?: () => void;
}

const FolderInvitationResponseModal: React.FC<
  FolderInvitationResponseModalProps
> = ({ onRequestClose, ...baiModalProps }) => {
  const { token } = theme.useToken();
  const { t } = useTranslation();
  const [
    { invitations },
    { acceptInvitation, rejectInvitation: declineInvitation },
  ] = useVFolderInvitations();

  return (
    <BAIModal
      onCancel={onRequestClose}
      title={t('data.InvitedFolders')}
      footer={null}
      {...baiModalProps}
    >
      <List
        dataSource={invitations}
        renderItem={(item: InvitationItem) => (
          <List.Item
            actions={[
              <Button
                type="primary"
                onClick={() => acceptInvitation(item.id)}
                key="accept"
              >
                {t('summary.Accept')}
              </Button>,
              <Button
                danger
                onClick={() => declineInvitation(item.id)}
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
                      label: 'From',
                      children: item.inviter_user_email,
                    },
                    {
                      key: 'permission',
                      label: t('data.Permission'),
                      children: item.perm,
                    },
                  ]}
                />
              }
            />
          </List.Item>
        )}
      />
    </BAIModal>
  );
};

export default FolderInvitationResponseModal;
