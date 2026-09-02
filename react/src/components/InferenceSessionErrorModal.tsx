/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { InferenceSessionErrorModalFragment$key } from '../__generated__/InferenceSessionErrorModalFragment.graphql';
import { Button } from '@astryxdesign/core/Button';
import { MetadataListItem } from '@astryxdesign/core/MetadataList';
import {
  BAIMetadataList,
  BAIModal,
  BAIModalProps,
  BAIText,
} from 'backend.ai-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

interface Props extends Omit<BAIModalProps, 'onOk' | 'onClose' | 'onCancel'> {
  inferenceSessionErrorFrgmt: InferenceSessionErrorModalFragment$key | null;
  onRequestClose: () => void;
}

const InferenceSessionErrorModal: React.FC<Props> = ({
  onRequestClose,
  inferenceSessionErrorFrgmt,
  ...baiModalProps
}) => {
  const { t } = useTranslation();

  const iSessionError = useFragment(
    graphql`
      fragment InferenceSessionErrorModalFragment on InferenceSessionError {
        session_id
        errors {
          repr
        }
      }
    `,
    inferenceSessionErrorFrgmt,
  );

  return (
    <BAIModal
      centered
      title={t('modelService.ServingRouteErrorModalTitle')}
      onCancel={() => {
        onRequestClose();
      }}
      footer={
        <Button
          label={t('button.Close')}
          onClick={() => {
            onRequestClose();
          }}
        />
      }
      {...baiModalProps}
    >
      {/* antd `Descriptions` → `MetadataList` + `MetadataListItem`
          (MAPPING §4). `bordered` has no destination and is dropped; the
          breakpoint-map `column` collapses to `columns="single"` because every
          breakpoint asked for one column anyway; `labelStyle.minWidth` becomes
          the `label.width` budget. */}
      <BAIMetadataList
        columns="single"
        label={{ position: 'start', width: 100 }}
        style={{ marginTop: 20 }}
      >
        <MetadataListItem label={t('modelService.SessionId')}>
          <BAIText code copyable>
            {iSessionError?.session_id}
          </BAIText>
        </MetadataListItem>
        <MetadataListItem label={t('dialog.error.Error')}>
          {iSessionError?.errors[0].repr}
        </MetadataListItem>
      </BAIMetadataList>
    </BAIModal>
  );
};

export default InferenceSessionErrorModal;
