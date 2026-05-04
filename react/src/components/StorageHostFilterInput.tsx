/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { BAIStorageHostSelect } from 'backend.ai-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface StorageHostFilterInputProps {
  onConfirm: (value: string) => void;
}

const StorageHostFilterInput: React.FC<StorageHostFilterInputProps> = ({
  onConfirm,
}) => {
  'use memo';
  const { t } = useTranslation();
  const [resetKey, setResetKey] = React.useState(0);
  return (
    <BAIStorageHostSelect
      key={resetKey}
      placeholder={t('import.StorageHost')}
      onChange={(value) => {
        // BAIStorageHostSelect supports multi-select modes that emit string[].
        // The filter only accepts a single scalar, so ignore array values.
        if (typeof value !== 'string' || !value) return;
        onConfirm(value);
        setResetKey((k) => k + 1);
      }}
      style={{ minWidth: 180 }}
    />
  );
};

export default StorageHostFilterInput;
