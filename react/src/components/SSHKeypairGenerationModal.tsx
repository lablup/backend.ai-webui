import { useSuspendedBackendaiClient } from '../hooks';
import { useTanQuery, useTanMutation } from '../hooks/reactQueryAlias';
import BAIModal, { BAIModalProps } from './BAIModal';
import Flex from './Flex';
import { LoadingOutlined } from '@ant-design/icons';
import { Button, Popconfirm, Spin, Typography, theme } from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface SSHKeypairGenerationModalProps extends BAIModalProps {
  onRequestClose: () => void;
  onRequestRefresh: () => void;
  isRefreshModalPending?: boolean;
}

const SSHKeypairGenerationModal: React.FC<SSHKeypairGenerationModalProps> = ({
  onRequestClose,
  onRequestRefresh,
  isRefreshModalPending,
  ...baiModalProps
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const baiClient = useSuspendedBackendaiClient();

  const { data } = useTanQuery<{
    ssh_public_key: string;
    ssh_private_key: string;
  }>({
    queryKey: ['refreshSSHKeypair', baiModalProps.open],
    queryFn: () => {
      return baiModalProps.open ? baiClient.refreshSSHKeypair() : null;
    },
    suspense: false,
  });

  const mutationToPostSSHKeypair = useTanMutation({
    mutationFn: () => {
      return baiClient.postSSHKeypair({
        pubkey: data?.ssh_public_key,
        privkey: data?.ssh_private_key,
      });
    },
  });

  const _onConfirm = () => {
    mutationToPostSSHKeypair.mutate(undefined, {
      onSuccess: () => {
        onRequestRefresh();
      },
    });
    onRequestClose();
  };

  return (
    <BAIModal
      title={t('usersettings.SSHKeypairGeneration')}
      closeIcon={false}
      footer={[
        <Popconfirm
          key="close"
          title={t('button.Confirm')}
          description={t('usersettings.ClearSSHKeypairInput')}
          onConfirm={_onConfirm}
        >
          <Button>{t('button.Close')}</Button>
        </Popconfirm>,
      ]}
      {...baiModalProps}
    >
      <Spin spinning={isRefreshModalPending} indicator={<LoadingOutlined />}>
        <Typography.Text strong>{t('usersettings.PublicKey')}</Typography.Text>
        <Flex direction="row" align="start" justify="between">
          <Typography.Paragraph>
            <pre
              style={{
                width: 430,
                maxHeight: 100,
                overflowY: 'scroll',
                scrollbarWidth: 'none', // Firefox
              }}
            >
              {data?.ssh_public_key}
            </pre>
          </Typography.Paragraph>
          <Typography.Text
            copyable={{ text: data?.ssh_public_key }}
            style={{ marginTop: token.margin }}
          />
        </Flex>
        <Typography.Text strong>{t('usersettings.PrivateKey')}</Typography.Text>{' '}
        <Flex direction="row" align="start" justify="between">
          <Typography.Paragraph>
            <pre
              style={{
                width: 430,
                maxHeight: 100,
                overflowY: 'scroll',
                scrollbarWidth: 'none', // Firefox
              }}
            >
              {data?.ssh_private_key}
            </pre>
            <Typography.Text type="danger">
              {t('usersettings.SSHKeypairGenerationWarning')}
            </Typography.Text>
          </Typography.Paragraph>
          <Typography.Text
            copyable={{ text: data?.ssh_private_key }}
            style={{ marginTop: token.margin }}
          />
        </Flex>
      </Spin>
    </BAIModal>
  );
};

export default SSHKeypairGenerationModal;
