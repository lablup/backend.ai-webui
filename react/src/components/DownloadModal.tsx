/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 The downloads dialog's frame. The tabs and their code views are a lazy chunk
 (`DownloadModalContent`), so the dialog paints before it arrives (#11144).
 */
import { BAIModal, BAISkeleton, type BAIModalProps } from 'backend.ai-ui';
import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';

const DownloadModalContent = React.lazy(() => import('./DownloadModalContent'));

interface DownloadModalProps extends BAIModalProps {
  onRequestClose?: () => void;
}

const DownloadModal: React.FC<DownloadModalProps> = ({
  onRequestClose,
  ...baiModalProps
}) => {
  'use memo';
  const { t } = useTranslation();

  return (
    <BAIModal
      title={t('summary.Downloads')}
      onCancel={onRequestClose}
      footer={null}
      styles={{ body: { paddingTop: 0 } }}
      {...baiModalProps}
    >
      <Suspense fallback={<BAISkeleton rows={6} />}>
        <DownloadModalContent />
      </Suspense>
    </BAIModal>
  );
};

export default DownloadModal;
