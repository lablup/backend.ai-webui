/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import './BAIFormItem.css';
import { FormItem, type FormItemProps } from '@lablup/ui-common/Form';
import React from 'react';

export interface BAIFormItemProps<Values = any> extends FormItemProps<Values> {
  /**
   * Actions for the label row: far end in vertical layout, right after the
   * label otherwise. Needs a `label`.
   */
  labelExtra?: React.ReactNode;
}

const BAIFormItem = <Values,>({
  label,
  labelExtra,
  ...formItemProps
}: BAIFormItemProps<Values>) => {
  'use memo';
  const hasLabelExtra =
    label !== undefined &&
    label !== null &&
    labelExtra !== undefined &&
    labelExtra !== null &&
    labelExtra !== false;

  return (
    <FormItem
      {...formItemProps}
      // ui-common renders `label` inside its `<label>`; the slot rides along.
      label={
        hasLabelExtra ? (
          <span className="bai-form-item-label-with-extra">
            <span className="bai-form-item-label-with-extra__label">
              {label}
            </span>
            <span className="bai-form-item-label-with-extra__extra">
              {labelExtra}
            </span>
          </span>
        ) : (
          label
        )
      }
    />
  );
};

export default BAIFormItem;
