/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import BAICodeEditor from './BAICodeEditor';
import { Alert } from 'antd';
import { BAIFlex, BAIModal, BAIModalProps } from 'backend.ai-ui';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface BAIJSONViewerModalProps extends Omit<BAIModalProps, 'children'> {
  json?: object | string;
  description?: React.ReactNode;
}

const BAIJSONViewerModal: React.FC<BAIJSONViewerModalProps> = ({
  json,
  description,
  ...modalProps
}) => {
  const { t } = useTranslation();

  const { formattedJson, hasError } = useMemo(() => {
    if (typeof json === 'string') {
      try {
        return {
          formattedJson: JSON.stringify(JSON.parse(json), null, 2),
          hasError: false,
        };
      } catch {
        return {
          formattedJson: json,
          hasError: true,
        };
      }
    }
    return {
      formattedJson: JSON.stringify(json, null, 2),
      hasError: false,
    };
  }, [json]);

  return (
    <BAIModal footer={null} width={800} {...modalProps}>
      <BAIFlex direction="column" align="stretch" gap={'sm'}>
        {hasError && (
          <Alert
            type="warning"
            title={t('general.InvalidJSONFormat')}
            showIcon
          />
        )}
        {description}
        <BAICodeEditor
          value={formattedJson}
          language={'json'}
          editable={false}
        />
      </BAIFlex>
    </BAIModal>
  );
};

export default BAIJSONViewerModal;
