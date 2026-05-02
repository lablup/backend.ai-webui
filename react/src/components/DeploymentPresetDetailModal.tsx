/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { DeploymentPresetDetailModalQuery } from '../__generated__/DeploymentPresetDetailModalQuery.graphql';
import DeploymentPresetDetailContent from './DeploymentPresetDetailContent';
import ErrorBoundaryWithNullFallback from './ErrorBoundaryWithNullFallback';
import { Skeleton } from 'antd';
import { BAIModal, BAIModalProps } from 'backend.ai-ui';
import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

interface DeploymentPresetDetailModalContentProps {
  presetId: string;
}

const DeploymentPresetDetailModalContent: React.FC<
  DeploymentPresetDetailModalContentProps
> = ({ presetId }) => {
  'use memo';

  const { deploymentRevisionPreset } =
    useLazyLoadQuery<DeploymentPresetDetailModalQuery>(
      graphql`
        query DeploymentPresetDetailModalQuery($id: UUID!) {
          deploymentRevisionPreset(id: $id) {
            name
            ...DeploymentPresetDetailContentFragment
          }
        }
      `,
      { id: presetId },
      { fetchPolicy: 'network-only' },
    );

  return (
    <DeploymentPresetDetailContent
      presetFrgmt={deploymentRevisionPreset ?? null}
    />
  );
};

interface DeploymentPresetDetailModalProps extends BAIModalProps {
  presetId: string | null | undefined;
  onRequestClose: () => void;
}

const DeploymentPresetDetailModal: React.FC<
  DeploymentPresetDetailModalProps
> = ({ presetId, onRequestClose, ...modalProps }) => {
  'use memo';

  const { t } = useTranslation();

  return (
    <BAIModal
      {...modalProps}
      centered
      title={t('modelService.DeploymentPresetDetail')}
      onCancel={onRequestClose}
      destroyOnHidden
      footer={null}
    >
      {presetId ? (
        <ErrorBoundaryWithNullFallback>
          <Suspense fallback={<Skeleton active paragraph={{ rows: 6 }} />}>
            <DeploymentPresetDetailModalContent presetId={presetId} />
          </Suspense>
        </ErrorBoundaryWithNullFallback>
      ) : null}
    </BAIModal>
  );
};

export default DeploymentPresetDetailModal;
