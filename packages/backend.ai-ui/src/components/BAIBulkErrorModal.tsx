/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 ui-common `BulkErrorModal` under its BUI name (FR-4096): `open` → `isOpen`,
 `onRequestClose` → `onOpenChange(false)`, `alertDescription` → `description`,
 and BAITable's `columns` / `dataSource` translated as BAITable does. The
 header takes BAIModal's geometry; the strings come from ui-common's catalog.
*/
import './BAIModal.css';
import { flattenColumns, toDataGridColumns } from './Table/dataGridColumns';
import type { BAIAnyObject, BAIColumnsType } from './Table/tableTypes';
import {
  BulkErrorModal,
  type BulkErrorModalProps,
} from '@lablup/ui-common/components/BulkErrorModal';
import classNames from 'classnames';
import type { ReactNode } from 'react';

export interface BAIBulkErrorModalProps<RecordType = BAIAnyObject> extends Omit<
  BulkErrorModalProps<RecordType & object>,
  'isOpen' | 'onOpenChange' | 'columns' | 'data' | 'description'
> {
  open?: boolean;
  /** How one failed request renders, per column. */
  columns: BAIColumnsType<RecordType>;
  /** One record per failed request, each with a unique `key` (or `id`). */
  dataSource: RecordType[];
  /** Retry guidance in an error alert above the table. */
  alertDescription?: ReactNode;
  /** Called when the user dismisses the modal (header X, mask, Esc). */
  onRequestClose: () => void;
}

const BAIBulkErrorModal = <RecordType extends BAIAnyObject = BAIAnyObject>({
  open = false,
  columns,
  dataSource,
  alertDescription,
  onRequestClose,
  headerClassName,
  ...modalProps
}: BAIBulkErrorModalProps<RecordType>) => {
  'use memo';
  return (
    <BulkErrorModal<RecordType>
      {...modalProps}
      isOpen={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onRequestClose();
      }}
      headerClassName={classNames('bai-modal__header', headerClassName)}
      columns={toDataGridColumns(flattenColumns(columns))}
      data={dataSource}
      description={alertDescription}
    />
  );
};

export default BAIBulkErrorModal;
