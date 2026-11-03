/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { IconButton } from '@lablup/ui-common/IconButton';
import { Text } from '@lablup/ui-common/Text';
import { BAIFlex } from 'backend.ai-ui';
import { CircleMinus } from 'lucide-react';
import React from 'react';

export interface FormListColumn {
  key: string;
  label: string;
  // The same flex track the matching cell of every row below takes.
  style: React.CSSProperties;
}

// Column headings over a Form.List whose rows end with a remove button; a
// hidden copy of that button keeps the last track the same width.
const FormListColumnHeader: React.FC<{
  columns: ReadonlyArray<FormListColumn>;
  removeLabel: string;
}> = ({ columns, removeLabel }) => {
  'use memo';
  return (
    <BAIFlex direction="row" align="center" gap="xs">
      {columns.map((column) => (
        <BAIFlex key={column.key} style={column.style}>
          <Text type="label" color="secondary">
            {column.label}
          </Text>
        </BAIFlex>
      ))}
      <BAIFlex aria-hidden style={{ visibility: 'hidden' }}>
        <IconButton
          variant="ghost"
          icon={<CircleMinus aria-hidden />}
          label={removeLabel}
          isDisabled
        />
      </BAIFlex>
    </BAIFlex>
  );
};

export default FormListColumnHeader;
