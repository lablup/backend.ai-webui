import { useSuspendedBackendaiClient } from '../hooks';
import {
  InvitationItem,
  useVFolderInvitations,
} from '../hooks/useVFolderInvitations';
import VFolderPermissionCell from './VFolderPermissionCell';
import { FolderOutlined } from '@ant-design/icons';
import { List, Typography, theme, Descriptions, App } from 'antd';
import {
  BAIButton,
  BAIFlex,
  BAIModal,
  BAIModalProps,
  useErrorMessageResolver,
} from 'backend.ai-ui';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface FolderInvitationResponseModalProps extends BAIModalProps {}

const FolderInvitationResponseModal: React.FC<
  FolderInvitationResponseModalProps
> = (baiModalProps) => {
  'use memo';
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const { t } = useTranslation();
  const [
    invitations,
    { acceptInvitation, rejectInvitation, updateInvitations },
  ] = useVFolderInvitations();
  const baiClient = useSuspendedBackendaiClient();
  const hasInviterEmail = baiClient.supports('invitation-inviter-email');
  const { getErrorMessage } = useErrorMessageResolver();

  useEffect(() => {
    updateInvitations();
  }, [updateInvitations]);

  const renderInvitationItem = (item: InvitationItem) => (
    <List.Item
      key={item.id}
      actions={[
        <BAIButton
          type="primary"
          action={async () => {
            try {
              await acceptInvitation(item.id);
              message.success(
                t('data.invitation.SuccessfullyAcceptedInvitation'),
              );
            } catch (e: any) {
              if (
                e?.statusCode === 409 ||
                e?.error_code === 'vfolder_create_already-exists'
              ) {
                message.error(t('data.FolderAlreadyExists'));
                return;
              }
              message.error(
                getErrorMessage(
                  e.message || t('data.invitation.FailedToAcceptInvitation'),
                ),
              );
            }
          }}
          key="accept"
        >
          {t('summary.Accept')}
        </BAIButton>,
        <BAIButton
          danger
          action={async () => {
            try {
              await rejectInvitation(item.id);
              message.success(
                t('data.invitation.SuccessfullyDeclinedInvitation'),
              );
            } catch (e: any) {
              message.error(
                getErrorMessage(
                  e?.message || t('data.invitation.FailedToDeclineInvitation'),
                ),
              );
            }
          }}
          key="decline"
        >
          {t('summary.Decline')}
        </BAIButton>,
      ]}
      style={{
        padding: token.paddingSM,
      }}
    >
      <List.Item.Meta
        title={
          <BAIFlex gap={'xxs'}>
            <FolderOutlined />
            <Typography.Text strong>{item.vfolder_name}</Typography.Text>
          </BAIFlex>
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
  );

  return (
    <BAIModal title={t('data.InvitedFolders')} footer={null} {...baiModalProps}>
      <List
        dataSource={invitations}
        renderItem={renderInvitationItem}
        locale={{
          emptyText: t('data.invitation.NoMoreInvitation'),
        }}
      />
    </BAIModal>
  );
};

export default FolderInvitationResponseModal;
