/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { BAIStorageHostSelect } from 'backend.ai-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface StorageHostFilterInputProps {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
}

const StorageHostFilterInput: React.FC<StorageHostFilterInputProps> = ({
  value,
  onChange,
}) => {
  'use memo';
  const { t } = useTranslation();
  return (
    <BAIStorageHostSelect
      value={value}
      placeholder={t('import.StorageHost')}
      onChange={(nextValue) => {
        // BAIStorageHostSelect supports multi-select modes that emit string[].
        // The filter only accepts a single scalar, so ignore array values.
        if (typeof nextValue !== 'string' || !nextValue) {
          onChange(undefined);
          return;
        }
        onChange(nextValue);
      }}
      style={{ minWidth: 180 }}
    />
  );
};

export default StorageHostFilterInput;
