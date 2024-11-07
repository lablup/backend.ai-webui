import { Form, FormItemProps } from 'antd';
import React, { useEffect } from 'react';

interface HiddenFormItemProps extends Omit<FormItemProps, 'children'> {
  value: any;
}
const HiddenFormItem: React.FC<HiddenFormItemProps> = ({ value, ...props }) => {
  const form = Form.useFormInstance();
  useEffect(() => {
    form.setFieldValue(props.name, value);
  }, [value, form, props.name]);
  return <Form.Item {...props} hidden />;
};

export default HiddenFormItem;
