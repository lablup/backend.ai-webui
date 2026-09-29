/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSuspendedBackendaiClient } from '../hooks';
import { useTanQuery } from '../hooks/reactQueryAlias';
import SSHKeyBlock from './SSHKeyBlock';
import { Button } from '@astryxdesign/core/Button';
import { Overlay } from '@astryxdesign/core/Overlay';
import { Spinner } from '@astryxdesign/core/Spinner';
import { HStack } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';
import { BAIPopconfirm, BAIModal, BAIModalProps, BAIFlex } from 'backend.ai-ui';
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
      // Same row as BAIModal's generated footer (see SSHKeypairManagementModal).
      footer={
        <HStack justify="end" gap={2} align="center">
          <BAIPopconfirm
            title={t('button.Confirm')}
            description={t('userSettings.ClearSSHKeypairInput')}
            onConfirm={onRequestClose}
          >
            <Button variant="secondary" label={t('button.Close')} />
          </BAIPopconfirm>
        </HStack>
      }
      {...baiModalProps}
    >
      <Overlay
        isOpen={!!isRefreshModalPending}
        scrim="light"
        content={<Spinner />}
      >
        <BAIFlex direction="column" align="stretch" gap="md">
          <SSHKeyBlock
            label={t('userSettings.PublicKey')}
            value={data?.ssh_public_key}
          />
          <SSHKeyBlock
            label={t('userSettings.PrivateKey')}
            value={data?.ssh_private_key}
            extra={
              // PILOT-DECISION: no Astryx red-text step for antd's danger
              // text (MAPPING §3.4); `supporting` keeps the caption size.
              <Text type="supporting" color="primary">
                {t('userSettings.SSHKeypairGenerationWarning')}
              </Text>
            }
          />
        </BAIFlex>
      </Overlay>
    </BAIModal>
  );
};

export default SSHKeypairGenerationModal;
