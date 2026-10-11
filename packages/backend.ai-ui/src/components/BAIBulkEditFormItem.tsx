/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Adapter over ui-common `BulkEditFormItem` (FR-4054): keeps the antd-shaped
 `showClear`. The strings come from ui-common's catalog.
*/
import {
  BulkEditFormItem,
  type BulkEditFormItemProps,
} from '@lablup/ui-common/components/BulkEditFormItem';
import React from 'react';

export interface BAIBulkEditFormItemProps extends Omit<
  BulkEditFormItemProps,
  'hasClear'
> {
  /** Offers "Clear", which sets the value to `null` for every record. */
  showClear?: boolean;
}

const BAIBulkEditFormItem: React.FC<BAIBulkEditFormItemProps> = ({
  showClear,
  ...bulkEditFormItemProps
}) => {
  'use memo';
  return <BulkEditFormItem {...bulkEditFormItemProps} hasClear={showClear} />;
};

BAIBulkEditFormItem.displayName = 'BAIBulkEditFormItem';

export default BAIBulkEditFormItem;
