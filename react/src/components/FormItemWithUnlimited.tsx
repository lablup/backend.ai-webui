import Flex from './Flex';
import { Form, Checkbox, FormItemProps } from 'antd';
import { CheckboxChangeEvent } from 'antd/es/checkbox';
import React, {
  cloneElement,
  isValidElement,
  useEffect,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';

interface FormItemWithUnlimitedProps extends FormItemProps {
  unlimitedValue?: number | string;
}

const FormItemWithUnlimited: React.FC<FormItemWithUnlimitedProps> = ({
  name,
  unlimitedValue,
  children,
  ...formItemPropsWithoutNameAndChildren
}) => {
  const { t } = useTranslation();
  const [isUnlimited, setIsUnlimited] = useState<boolean>(false);
  const form = Form.useFormInstance();

  // Detect changes in form value to update the isUnlimited state.
  useEffect(() => {
    const fieldValue = form.getFieldValue(name);
    setIsUnlimited(fieldValue === unlimitedValue);
  }, [form, name, unlimitedValue]);

  // Disable children when isUnlimited is true.
  const childrenWithProps = isValidElement(children)
    ? cloneElement(children, {
        disabled: isUnlimited,
      } as React.Attributes & { disabled?: boolean })
    : children;

  const childrenWithNullValue =
    isUnlimited && isValidElement(children)
      ? cloneElement(children, {
          value: null,
          disabled: isUnlimited,
        } as React.Attributes & { value?: any })
      : null;

  return (
    <Flex direction="column" align="start">
      <Form.Item
        style={{ margin: 0 }}
        name={name}
        hidden={isUnlimited}
        {...formItemPropsWithoutNameAndChildren}
      >
        {childrenWithProps}
      </Form.Item>
      {isUnlimited ? (
        <Form.Item
          style={{ margin: 0 }}
          {...formItemPropsWithoutNameAndChildren}
        >
          {childrenWithNullValue}
        </Form.Item>
      ) : null}
      <Checkbox
        checked={isUnlimited}
        onChange={(e: CheckboxChangeEvent) => {
          const checked = e.target.checked;
          setIsUnlimited(checked);
          if (checked) {
            form.setFieldValue(name, unlimitedValue);
          } else {
            form.resetFields([name]);
          }
        }}
      >
        {t('resourcePolicy.Unlimited')}
      </Checkbox>
    </Flex>
  );
};

export default FormItemWithUnlimited;
