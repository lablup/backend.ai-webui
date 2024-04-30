import DynamicUnitInputNumber, {
  DynamicUnitInputNumberProps,
} from './DynamicUnitInputNumber';
import Flex from './Flex';
import { Form } from 'antd';
import Checkbox, { CheckboxChangeEvent } from 'antd/es/checkbox';
import _ from 'lodash';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface DynamicUnitInputNumberWithUnlimitedFormItemsProps
  extends DynamicUnitInputNumberProps {
  fieldName: string | string[];
  checkboxFieldName: string;
}

const DynamicUnitInputNumberWithUnlimitedFormItems: React.FC<
  DynamicUnitInputNumberWithUnlimitedFormItemsProps
> = ({ fieldName, checkboxFieldName, ...otherProps }) => {
  const { t } = useTranslation();
  const form = Form.useFormInstance();
  return (
    <Flex direction="column" align="start">
      <Form.Item
        noStyle
        shouldUpdate={(prevValues, currentValues) =>
          prevValues?.[checkboxFieldName] !== currentValues?.[checkboxFieldName]
        }
      >
        {() => {
          const disabled = form.getFieldValue(checkboxFieldName) === true;
          return (
            <Form.Item
              noStyle
              name={fieldName}
              rules={[
                {
                  required: !disabled,
                },
              ]}
            >
              <DynamicUnitInputNumber disabled={disabled} {...otherProps} />
            </Form.Item>
          );
        }}
      </Form.Item>
      <Form.Item noStyle name={fieldName} valuePropName="checked">
        <Checkbox
          onChange={(e: CheckboxChangeEvent) => {
            if (e.target.checked) {
              form.setFieldValue(fieldName, null);
            } else {
              form.setFieldValue(
                fieldName,
                form.getFieldValue(fieldName) ||
                  otherProps.value ||
                  otherProps.defaultValue,
              );
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

export default DynamicUnitInputNumberWithUnlimitedFormItems;
