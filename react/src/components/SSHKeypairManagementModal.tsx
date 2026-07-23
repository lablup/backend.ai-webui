/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSuspendedBackendaiClient } from '../hooks';
import { useTanQuery } from '../hooks/reactQueryAlias';
import SSHKeypairGenerationModal from './SSHKeypairGenerationModal';
import SSHKeypairManualFormModal from './SSHKeypairManualFormModal';
import { useToggle } from 'ahooks';
import { Button, Typography, theme } from 'antd';
import {
  BAIModal,
  BAIModalProps,
  BAIFlex,
  useUpdatableState,
} from 'backend.ai-ui';
import React, { useTransition } from 'react';
import { useTranslation } from 'react-i18next';

interface SSHKeypairManagementModalProps extends BAIModalProps {
  onRequestClose: (success?: boolean) => void;
}

const SSHKeypairManagementModal: React.FC<SSHKeypairManagementModalProps> = ({
  onRequestClose,
  ...modalProps
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [isPendingRefreshModal, startRefreshModalTransition] = useTransition();
  const [fetchKey, updateFetchKey] = useUpdatableState('initial-fetch');
  const [
    isOpenSSHKeypairGenerationModal,
    { toggle: toggleSSHKeypairGenerationModal },
  ] = useToggle(false);
  const [
    isOpenSSHKeypairManualFormModal,
    { toggle: toggleSSHKeypairManualFormModal },
  ] = useToggle(false);

  const baiClient = useSuspendedBackendaiClient();
  const { data } = useTanQuery<{
    ssh_public_key: string;
  }>({
    queryKey: ['fetchSSHKeypair', fetchKey],
    queryFn: () => {
      return baiClient.fetchSSHKeypair();
    },
  });

  return (
    <>
      <BAIModal
        title={t('userSettings.SSHKeypairGeneration')}
        onCancel={() => onRequestClose()}
        footer={[
          <Button key="back" onClick={() => onRequestClose()}>
            {t('button.Close')}
          </Button>,
          <Button
            key="generate"
            type="primary"
            onClick={toggleSSHKeypairGenerationModal}
          >
            {t('button.Generate')}
          </Button>,
          <Button
            key="enterManually"
            type="primary"
            onClick={toggleSSHKeypairManualFormModal}
          >
            {t('button.EnterManually')}
          </Button>,
        ]}
        {...modalProps}
      >
        <Typography.Text strong>
          {t('userSettings.CurrentSSHPublicKey')}
        </Typography.Text>
        {data?.ssh_public_key ? (
          <BAIFlex direction="row" align="start" justify="between">
            <Typography.Paragraph>
              <pre style={{ width: 430, height: 270 }}>
                {data?.ssh_public_key}
              </pre>
            </Typography.Paragraph>
            <Typography.Text
              copyable={{ text: data?.ssh_public_key }}
              style={{ marginTop: token.margin }}
            />
          </BAIFlex>
        ) : (
          <Typography.Paragraph>
            <pre style={{ height: 270 }}>
              {t('userSettings.NoExistingSSHKeypair')}
            </pre>
          </Typography.Paragraph>
        )}
      </BAIModal>
      <SSHKeypairGenerationModal
        open={isOpenSSHKeypairGenerationModal}
        isRefreshModalPending={isPendingRefreshModal}
        onRequestClose={() => {
          toggleSSHKeypairGenerationModal();
          startRefreshModalTransition(() => {
            updateFetchKey();
          });
        }}
      />
      <SSHKeypairManualFormModal
        open={isOpenSSHKeypairManualFormModal}
        onCancel={toggleSSHKeypairManualFormModal}
        onRequestClose={() => {
          toggleSSHKeypairManualFormModal();
        }}
        onRequestRefresh={() => {
          startRefreshModalTransition(() => {
            updateFetchKey();
          });
        }}
      />
    </>
  );
};

export default SSHKeypairManagementModal;
