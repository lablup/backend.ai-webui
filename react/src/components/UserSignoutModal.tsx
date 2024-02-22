import BAIModal, { BAIModalProps } from './BAIModal';
import Flex from './Flex';
import { UserSignoutModalMutation } from './__generated__/UserSignoutModalMutation.graphql';
import { Typography, message } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-relay';

interface UserSignoutModalProps extends BAIModalProps {
  onRequestClose: () => void;
  email?: string;
}

const UserSignoutModal: React.FC<UserSignoutModalProps> = ({
  onRequestClose,
  email = '',
  ...baiModalProps
}) => {
  const { t } = useTranslation();
  const [commitUserDelete, isInFlightCommitUserDelete] =
    useMutation<UserSignoutModalMutation>(graphql`
      mutation UserSignoutModalMutation($email: String!) {
        delete_user(email: $email) {
          ok
          msg
        }
      }
    `);

  const handleSignoutOk = () => {
    commitUserDelete({
      variables: {
        email: email,
      },
      onCompleted(res) {
        if (res?.delete_user?.ok) {
          message.success(t('credential.UserAccountCreated'));
        } else {
          message.error(res?.delete_user?.msg);
        }
        onRequestClose();
      },
      onError(err) {
        message.error(err?.message);
      },
    });
  };
  return (
    <BAIModal
      {...baiModalProps}
      destroyOnClose={true}
      centered
      title={t('dialog.title.LetsDouble-Check')}
      onOk={handleSignoutOk}
      okText={t('button.Okay')}
      okButtonProps={{ danger: true }}
      onCancel={onRequestClose}
      cancelText={t('button.Cancel')}
      confirmLoading={isInFlightCommitUserDelete}
    >
      <Flex direction="column" align="start" gap={'xxs'}>
        <Typography.Text>{t('credential.ConfirmSignoutUser')}</Typography.Text>
        <Flex justify="center" style={{ width: '100%' }}>
          <Typography.Text type="danger" strong>
            {email}
          </Typography.Text>
        </Flex>
        <Typography.Text>{t('dialog.ask.DoYouWantToProceed')}</Typography.Text>
      </Flex>
    </BAIModal>
  );
};

export default UserSignoutModal;
