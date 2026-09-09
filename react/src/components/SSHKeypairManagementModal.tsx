/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSuspendedBackendaiClient } from '../hooks';
import { useTanQuery } from '../hooks/reactQueryAlias';
import SSHKeyBlock from './SSHKeyBlock';
import SSHKeypairGenerationModal from './SSHKeypairGenerationModal';
import SSHKeypairManualFormModal from './SSHKeypairManualFormModal';
import { Button } from '@astryxdesign/core/Button';
import { HStack } from '@astryxdesign/core/Stack';
import {
  BAIModal,
  BAIModalProps,
  useToggle,
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
  const [isPendingRefreshModal, startRefreshModalTransition] = useTransition();
  const [fetchKey, updateFetchKey] = useUpdatableState('initial-fetch');
  const [
    isOpenSSHKeypairGenerationModal,
    { toggle: toggleSSHKeypairGenerationModal },
  ] = useToggle(false);
  const [
    isOpenSSHKeypairManualFormModal,
    {
      toggle: toggleSSHKeypairManualFormModal,
      setLeft: closeSSHKeypairManualFormModal,
    },
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
        // The same row BAIModal builds for its own OK/Cancel footer, so these
        // actions sit where every other modal's do (right-aligned, spaced)
        // instead of flush-left with no gap, which is what a bare array gets.
        footer={
          <HStack justify="end" gap={2} align="center">
            <Button
              variant="secondary"
              label={t('button.Close')}
              onClick={() => onRequestClose()}
            />
            <Button
              variant="primary"
              label={t('button.Generate')}
              onClick={toggleSSHKeypairGenerationModal}
            />
            <Button
              variant="primary"
              label={t('button.EnterManually')}
              onClick={toggleSSHKeypairManualFormModal}
            />
          </HStack>
        }
        {...modalProps}
      >
        <SSHKeyBlock
          label={t('userSettings.CurrentSSHPublicKey')}
          value={data?.ssh_public_key}
          placeholder={t('userSettings.NoExistingSSHKeypair')}
        />
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
        // Closing is idempotent: the modal now closes from the mutation's
        // onSuccess, so a toggle would reopen it after a cancel mid-request.
        onCancel={closeSSHKeypairManualFormModal}
        onRequestClose={closeSSHKeypairManualFormModal}
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
