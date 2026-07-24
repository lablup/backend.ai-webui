/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { Checkbox, Form } from 'antd';
import type { CheckboxProps } from 'antd';
import { createStyles } from 'antd-style';
import { FormItemInputContext } from 'antd/es/form/context';
import React, { use } from 'react';

const useStyles = createStyles(({ css, token }) => ({
  errorCheckbox: css`
    .ant-checkbox {
      border-color: ${token.colorError} !important;
    }
    .ant-checkbox-checked {
      background-color: ${token.colorErrorHover} !important;
    }
  `,
}));

export interface BAICheckboxProps extends CheckboxProps {}

/**
 * antd `Checkbox` reads only `isFormItemInput` from `FormItemInputContext` —
 * unlike Input-likes it never opts into the form item's validation status, so
 * a field error leaves it visually unchanged. `BAICheckbox` reads the status
 * from the same context and paints the error state itself.
 *
 * Changing an errored checkbox also clears the owning field's error — the new
 * value is a fresh attempt, no longer the rejected one. The field name comes
 * from `FormItemInputContext` (populated by antd v6's `StatusProvider`,
 * including noStyle fields), so no extra prop is needed at the call site.
 *
 * Outside a `Form.Item` the context is empty, so it behaves exactly like a
 * plain antd `Checkbox`.
 */
const BAICheckbox: React.FC<BAICheckboxProps> = ({
  className,
  onChange,
  ...checkboxProps
}) => {
  'use memo';
  const { styles, cx } = useStyles();
  const form = Form.useFormInstance();
  const { status, name } = use(FormItemInputContext);

  return (
    <Checkbox
      {...checkboxProps}
      className={cx(className, status === 'error' && styles.errorCheckbox)}
      onChange={(event) => {
        if (status === 'error' && name !== undefined) {
          form.setFields([{ name, errors: [] }]);
        }
        onChange?.(event);
      }}
    />
  );
};

export default BAICheckbox;
