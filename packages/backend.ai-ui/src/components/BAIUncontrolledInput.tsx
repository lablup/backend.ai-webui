/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Adapter over ui-common `UncontrolledInput` (FR-4054): keeps antd's
 `disabled` and string `status`. The fallback accessible name comes from
 ui-common's catalog.
*/
import {
  UncontrolledInput,
  type UncontrolledInputProps,
} from '@lablup/ui-common/components/UncontrolledInput';
import React from 'react';

export interface BAIUncontrolledInputProps extends Omit<
  UncontrolledInputProps,
  'isDisabled' | 'status'
> {
  disabled?: boolean;
  /** antd's `status`, reshaped onto Astryx's `status` object. */
  status?: 'error' | 'warning' | '';
}

/**
 * An uncontrolled input that commits its value on Enter or blur, not on
 * every keystroke.
 */
const BAIUncontrolledInput: React.FC<BAIUncontrolledInputProps> = ({
  disabled,
  status,
  ...uncontrolledInputProps
}) => {
  'use memo';
  return (
    <UncontrolledInput
      {...uncontrolledInputProps}
      isDisabled={disabled}
      status={
        status === 'error' || status === 'warning'
          ? { type: status }
          : undefined
      }
    />
  );
};

export default BAIUncontrolledInput;
