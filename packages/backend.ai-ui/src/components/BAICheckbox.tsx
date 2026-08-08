/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import './BAICheckbox.css';
import { Checkbox } from 'antd';
import type { CheckboxProps } from 'antd';
import { FormItemInputContext } from 'antd/es/form/context';
import classNames from 'classnames';
import React, { use } from 'react';

export interface BAICheckboxProps extends CheckboxProps {}

/**
 * antd `Checkbox` reads only `isFormItemInput` from `FormItemInputContext` —
 * unlike Input-likes it never opts into the form item's validation status, so
 * a field error leaves it visually unchanged. `BAICheckbox` reads the status
 * from the same context and paints the error state itself.
 *
 * Painting is all it does: it never mutates form state. Whether changing an
 * errored checkbox clears the field error is the owner's decision — some flows
 * must keep the mark — so clear it from the call site's `onChange` (e.g.
 * `form.setFields([{ name, errors: [] }])`) when that is the desired UX.
 *
 * Outside a `Form.Item` the context is empty, so it behaves exactly like a
 * plain antd `Checkbox`.
 */
const BAICheckbox: React.FC<BAICheckboxProps> = ({
  className,
  ...checkboxProps
}) => {
  'use memo';
  const { status } = use(FormItemInputContext);

  return (
    <Checkbox
      {...checkboxProps}
      className={classNames(
        className,
        status === 'error' && 'bai-checkbox-error',
      )}
    />
  );
};

export default BAICheckbox;
