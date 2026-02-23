/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { Form, type FormItemProps } from 'antd';
import React, { useEffect } from 'react';

interface HiddenFormItemProps extends Omit<FormItemProps, 'children'> {
  value: any;
}
const HiddenFormItem: React.FC<HiddenFormItemProps> = ({ value, ...props }) => {
  const form = Form.useFormInstance();
  useEffect(() => {
    form.setFieldValue(props.name, value);
  }, [value, form, props.name]);
  return (
    <Form.Item {...props} hidden>
      <div />
    </Form.Item>
  );
};

export default HiddenFormItem;
