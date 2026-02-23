/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { Form, type FormItemProps } from 'antd';
import _ from 'lodash';
import React from 'react';

interface FormItemControlProps extends FormItemProps {
  render?: (args: {
    value: unknown;
    setValue: (value: unknown) => void;
  }) => React.ReactNode;
}
const FormItemControl: React.FC<FormItemControlProps> = (props) => {
  const form = Form.useFormInstance();
  return (
    // Only set the label and required props for the UI to display
    <Form.Item
      label={props.label}
      required={props.required || _.some(props.rules, 'required')}
    >
      {props.render?.({
        value: form.getFieldValue(props.name),
        setValue: (value) => form.setFieldValue(props.name, value),
      })}
      <Form.Item {...props} noStyle></Form.Item>
    </Form.Item>
  );
};

export default FormItemControl;
