import Flex from './Flex';
import { Checkbox, Form, FormItemProps } from 'antd';
import { cloneElement, isValidElement, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface FormItemWithCheckboxProps extends FormItemProps {
  children: React.ReactNode;
  checkedValue?: any;
}
const FormItemWithCheckbox = ({
  children,
  name,
  label,
  tooltip,
  required,
  checkedValue,
  ...formItemProps
}: FormItemWithCheckboxProps) => {
  const [isDisabled, setIsDisabled] = useState(false);
  const form = Form.useFormInstance();
  const { t } = useTranslation();

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

  useEffect(() => {
    const fieldValue = form.getFieldValue(name);

    if (checkedValue !== undefined) {
      setIsDisabled(fieldValue === checkedValue);
      form.setFieldsValue({
        [`${name}_checkbox`]: fieldValue === checkedValue,
      });
    }
  }, [form, name, checkedValue]);
  return (
    <Form.Item label={label} tooltip={tooltip} required={required}>
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
        <Form.Item
          style={{ marginBottom: 0 }}
          name={`${name}_checkbox`}
          valuePropName="checked"
        >
          <Checkbox
            onChange={(e) => {
              setIsDisabled(e.target.checked);
              if (e.target.checked) {
                form.setFieldsValue({
                  [name]: checkedValue,
                });
              }
            }}
            value={checkedValue}
          >
            {t('settings.Unset')}
          </Checkbox>
        </Form.Item>
      </Flex>
    </Form.Item>
  );
};

export default FormItemWithCheckbox;
