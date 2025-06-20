import { useSuspendedBackendaiClient } from '../hooks';
import {
  InvitationItem,
  useSetVFolderInvitations,
  useVFolderInvitationsValue,
} from '../hooks/useVFolderInvitations';
import BAIModal, { BAIModalProps } from './BAIModal';
import Flex from './Flex';
import VFolderPermissionCell from './VFolderPermissionCell';
import { FolderOutlined } from '@ant-design/icons';
import { List, Button, Typography, theme, Descriptions, App } from 'antd';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

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
  const { invitations } = useVFolderInvitationsValue();
  const { acceptInvitation, rejectInvitation } = useSetVFolderInvitations();
  const baiClient = useSuspendedBackendaiClient();
  const hasInviterEmail = baiClient.isManagerVersionCompatibleWith('25.6.0');

  // Memoize invitations to prevent unnecessary re-renders
  const memoizedInvitations = React.useMemo(() => invitations, [invitations]);

  const renderInvitationItem = useCallback(
    (item: InvitationItem) => (
      <List.Item
        key={item.id}
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
              rejectInvitation(item.id, {
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
                  children: hasInviterEmail
                    ? item.inviter_user_email
                    : item.inviter,
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
    [
      acceptInvitation,
      rejectInvitation,
      onRequestClose,
      message,
      t,
      token.paddingSM,
      hasInviterEmail,
    ],
  );

  return (
    <BAIModal
      onCancel={() => onRequestClose?.(false)}
      title={t('data.InvitedFolders')}
      footer={null}
      {...baiModalProps}
    >
      <List
        dataSource={memoizedInvitations}
        renderItem={renderInvitationItem}
      />
    </BAIModal>
  );
};

export default FolderInvitationResponseModal;
