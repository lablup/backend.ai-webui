/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 ui-common `DataGridSettingsModal` under its BUI name (FR-4096): `open` →
 `isOpen`, `required` → `isAlwaysVisible`, `disableReorder` → `isReorderable`,
 and one `onRequestClose(result?)` for both Apply and cancel. The strings come
 from ui-common's catalog.
*/
import {
  DataGridSettingsModal,
  type DataGridSettingsModalProps,
  type DataGridSettingsResult,
} from '@lablup/ui-common/components/DataGrid';
import React from 'react';

export interface BAITableSettingColumn {
  key: string;
  label: string;
  /** Required columns are always visible and their checkbox is locked. */
  required?: boolean;
}

export type BAITableSettingResult = DataGridSettingsResult;

export interface BAITableSettingModalProps extends Omit<
  DataGridSettingsModalProps,
  | 'isOpen'
  | 'onOpenChange'
  | 'columns'
  | 'visibleColumnKeys'
  | 'isReorderable'
  | 'onApply'
> {
  open: boolean;
  columns: Array<BAITableSettingColumn>;
  /** Currently visible keys, in current display order. */
  visibleColumnKeys: Array<string>;
  disableReorder?: boolean;
  /** `undefined` on cancel, the new settings on Apply. */
  onRequestClose: (result?: BAITableSettingResult) => void;
}

const BAITableSettingModal: React.FC<BAITableSettingModalProps> = ({
  open,
  columns,
  visibleColumnKeys,
  disableReorder,
  onRequestClose,
  ...modalProps
}) => {
  'use memo';
  return (
    <DataGridSettingsModal
      {...modalProps}
      isOpen={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onRequestClose(undefined);
      }}
      columns={columns.map((column) => ({
        key: column.key,
        label: column.label,
        isAlwaysVisible: column.required,
      }))}
      visibleColumnKeys={visibleColumnKeys}
      isReorderable={!disableReorder}
      onApply={(result) => onRequestClose(result)}
    />
  );
};

export default BAITableSettingModal;
