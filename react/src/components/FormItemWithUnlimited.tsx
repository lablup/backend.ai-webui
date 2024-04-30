import Flex from './Flex';
import { Form, FormInstance } from 'antd';
import Checkbox, { CheckboxChangeEvent } from 'antd/es/checkbox';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface FormItemWithUnlimitedProps {
  form: FormInstance;
  fieldName: string | Array<string>;
  checkboxFieldName: string;
  label?: string;
  fallbackValue?: any;
  render: (disabled: boolean) => React.ReactNode;
}

const FormItemWithUnlimited: React.FC<FormItemWithUnlimitedProps> = ({
  form,
  fieldName,
  checkboxFieldName,
  label,
  fallbackValue,
  render,
}) => {
  const { t } = useTranslation();

  return (
    <Flex direction="column" align="start">
      <Form.Item
        style={{ margin: 0 }}
        label={label}
        shouldUpdate={(prevValues, currentValues) => {
          return (
            prevValues[checkboxFieldName] !== currentValues[checkboxFieldName]
          );
        }}
      >
        {() => {
          const disabled = form.getFieldValue(checkboxFieldName);
          return (
            <Form.Item noStyle name={fieldName}>
              {render?.(disabled)}
            </Form.Item>
          );
        }}
      </Form.Item>
      <Form.Item name={checkboxFieldName} valuePropName="checked">
        <Checkbox
          onChange={(e: CheckboxChangeEvent) => {
            if (e.target.checked) {
              form.setFieldValue(fieldName, null);
            } else if (fallbackValue) {
              form.setFieldValue(fieldName, fallbackValue);
            }
            form.validateFields(
              typeof fieldName === 'string' ? [fieldName] : fieldName,
            );
          }}
        >
          {t('resourcePolicy.Unlimited')}
        </Checkbox>
      </Form.Item>
    </Flex>
  );
};

export default FormItemWithUnlimited;
