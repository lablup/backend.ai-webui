import { useSuspendedBackendaiClient, useUpdatableState } from '../hooks';
import { useTanQuery } from '../hooks/reactQueryAlias';
import BAIModal, { BAIModalProps } from './BAIModal';
import Flex from './Flex';
import SSHKeypairGenerationModal from './SSHKeypairGenerationModal';
import { useToggle } from 'ahooks';
import { Button, Typography, theme } from 'antd';
import React, { useTransition } from 'react';
import { useTranslation } from 'react-i18next';

interface SSHKeypairManagementModalProps extends BAIModalProps {}

const SSHKeypairManagementModal: React.FC<SSHKeypairManagementModalProps> = ({
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
        title={t('usersettings.SSHKeypairGeneration')}
        footer={[
          <Button key="back" onClick={modalProps.onCancel}>
            {t('button.Close')}
          </Button>,
          <Button
            key="generate"
            type="primary"
            onClick={toggleSSHKeypairGenerationModal}
          >
            {t('button.Generate')}
          </Button>,
          <Button key="enterManually" type="primary">
            {t('button.EnterManually')}
          </Button>,
        ]}
        {...modalProps}
      >
        <Typography.Text strong>
          {t('usersettings.CurrentSSHPublicKey')}
        </Typography.Text>
        {data?.ssh_public_key ? (
          <Flex direction="row" align="start" justify="between">
            <Typography.Paragraph>
              <pre style={{ width: 430, height: 270 }}>
                {data?.ssh_public_key}
              </pre>
            </Typography.Paragraph>
            <Typography.Text
              copyable={{ text: data?.ssh_public_key }}
              style={{ marginTop: token.margin }}
            />
          </Flex>
        ) : (
          <Typography.Paragraph>
            <pre style={{ height: 270 }}>
              {t('usersettings.NoExistingSSHKeypair')}
            </pre>
          </Typography.Paragraph>
        )}
      </BAIModal>
      <SSHKeypairGenerationModal
        open={isOpenSSHKeypairGenerationModal}
        isRefreshModalPending={isPendingRefreshModal}
        onRequestClose={() => {
          toggleSSHKeypairGenerationModal();
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
