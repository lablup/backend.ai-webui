/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSuspendedBackendaiClient } from '../hooks';
import { useTanQuery } from '../hooks/reactQueryAlias';
import { LoadingOutlined } from '@ant-design/icons';
import { Button, Popconfirm, Spin, Typography, theme } from 'antd';
import { BAIModal, BAIModalProps, BAIFlex } from 'backend.ai-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface SSHKeypairGenerationModalProps extends BAIModalProps {
  onRequestClose: () => void;
  isRefreshModalPending?: boolean;
}

const SSHKeypairGenerationModal: React.FC<SSHKeypairGenerationModalProps> = ({
  onRequestClose,
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
  });

  return (
    <BAIModal
      title={t('userSettings.SSHKeypairGeneration')}
      closeIcon={false}
      footer={[
        <Popconfirm
          key="close"
          title={t('button.Confirm')}
          description={t('userSettings.ClearSSHKeypairInput')}
          onConfirm={onRequestClose}
        >
          <Button>{t('button.Close')}</Button>
        </Popconfirm>,
      ]}
      {...baiModalProps}
    >
      <Spin spinning={isRefreshModalPending} indicator={<LoadingOutlined />}>
        <Typography.Text strong>{t('userSettings.PublicKey')}</Typography.Text>
        <BAIFlex direction="row" align="start" justify="between">
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
        </BAIFlex>
        <Typography.Text strong>{t('userSettings.PrivateKey')}</Typography.Text>
        <BAIFlex direction="row" align="start" justify="between">
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
              {t('userSettings.SSHKeypairGenerationWarning')}
            </Typography.Text>
          </Typography.Paragraph>
          <Typography.Text
            copyable={{ text: data?.ssh_private_key }}
            style={{ marginTop: token.margin }}
          />
        </BAIFlex>
      </Spin>
    </BAIModal>
  );
};

export default SSHKeypairGenerationModal;
