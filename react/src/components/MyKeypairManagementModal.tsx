/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { BAIModal, BAIModalProps } from 'backend.ai-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface MyKeypairManagementModalProps extends BAIModalProps {
  onRequestClose: () => void;
}

// TODO: Implement full keypair self-service management (FR-2183)
const MyKeypairManagementModal: React.FC<MyKeypairManagementModalProps> = ({
  onRequestClose,
  ...baiModalProps
}) => {
  const { t } = useTranslation();

  return (
    <BAIModal
      {...baiModalProps}
      title={t('userSettings.MyKeypairInfo')}
      centered
      onCancel={onRequestClose}
      destroyOnHidden
      footer={null}
    />
  );
};

export default MyKeypairManagementModal;
