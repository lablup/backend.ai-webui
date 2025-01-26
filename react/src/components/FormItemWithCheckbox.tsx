import Flex from './Flex';
import { Checkbox, Form, FormItemProps } from 'antd';
import { cloneElement, isValidElement, useState } from 'react';

interface FormItemWithCheckboxProps extends FormItemProps {
  children: React.ReactNode;
}
const FormItemWithCheckbox = ({
  children,
  name,
  label,
  ...formItemProps
}: FormItemWithCheckboxProps) => {
  const [isDisabled, setIsDisabled] = useState(false);
  const form = Form.useFormInstance();

  const childrenWithProps = isValidElement(children)
    ? cloneElement(children, {
        disabled: isDisabled,
      } as React.Attributes & {
        disabled?: boolean;
      })
    : children;

  const childrenWithNullValue =
    isDisabled && isValidElement(children)
      ? cloneElement(children, {
          value: null,
          disabled: isDisabled,
        } as React.Attributes & { value?: any })
      : null;

  return (
    <Form.Item label={label}>
      <Flex gap="sm" align="center">
        <Form.Item
          name={name}
          hidden={isDisabled}
          style={{ marginBottom: 0, flex: 1 }}
          {...formItemProps}
        >
          {childrenWithProps}
        </Form.Item>
        {isDisabled && (
          <Form.Item style={{ marginBottom: 0, flex: 1 }} {...formItemProps}>
            {childrenWithNullValue}
          </Form.Item>
        )}
        <Checkbox
          onChange={(e) => {
            setIsDisabled(e.target.checked);
            if (e.target.checked) {
              form.setFieldValue(name, null);
            }
          }}
          checked={isDisabled}
        >
          지정 안함
        </Checkbox>
      </Flex>
    </Form.Item>
  );
};

export default FormItemWithCheckbox;
