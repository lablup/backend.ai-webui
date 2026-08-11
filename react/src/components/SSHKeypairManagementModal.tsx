/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSuspendedBackendaiClient } from '../hooks';
import { useTanQuery } from '../hooks/reactQueryAlias';
import { theme } from '../theme-shim';
import SSHKeypairGenerationModal from './SSHKeypairGenerationModal';
import SSHKeypairManualFormModal from './SSHKeypairManualFormModal';
import { Button } from '@astryxdesign/core/Button';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Text } from '@astryxdesign/core/Text';
import {
  BAIFlex,
  BAIModal,
  BAIModalProps,
  useToggle,
  useUpdatableState,
} from 'backend.ai-ui';
import { Copy } from 'lucide-react';
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
          <Button
            key="back"
            variant="secondary"
            label={t('button.Close')}
            onClick={() => onRequestClose()}
          />,
          <Button
            key="generate"
            variant="primary"
            label={t('button.Generate')}
            onClick={toggleSSHKeypairGenerationModal}
          />,
          <Button
            key="enterManually"
            variant="primary"
            label={t('button.EnterManually')}
            onClick={toggleSSHKeypairManualFormModal}
          />,
        ]}
        {...modalProps}
      >
        <Text weight="semibold">{t('userSettings.CurrentSSHPublicKey')}</Text>
        {data?.ssh_public_key ? (
          <BAIFlex direction="row" align="start" justify="between">
            <pre style={{ width: 430, height: 270 }}>
              {data?.ssh_public_key}
            </pre>
            {/* antd `Typography.Text copyable={{text}}` with no children
                rendered ONLY the copy glyph — a standalone copy control, not
                a labeled text row (so `BAICopyableText`, which always pairs
                text + icon, doesn't fit). Self-built as a bare IconButton. */}
            <IconButton
              icon={<Copy size="1em" />}
              label={t('button.Copy')}
              tooltip={t('button.Copy')}
              variant="ghost"
              size="sm"
              style={{ marginTop: token.margin }}
              onClick={() => {
                if (data?.ssh_public_key) {
                  void navigator.clipboard?.writeText(data.ssh_public_key);
                }
              }}
            />
          </BAIFlex>
        ) : (
          <pre style={{ height: 270 }}>
            {t('userSettings.NoExistingSSHKeypair')}
          </pre>
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
