import { Form, Checkbox, type FormItemProps } from 'antd';
import { CheckboxChangeEvent } from 'antd/es/checkbox';
import { BAIFlex } from 'backend.ai-ui';
import React, {
  Attributes,
  cloneElement,
  isValidElement,
  useEffect,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';

interface FormItemWithUnlimitedProps extends FormItemProps {
  unlimitedValue?: number | string | null;
  disableUnlimited?: boolean;
}

const FormItemWithUnlimited: React.FC<FormItemWithUnlimitedProps> = ({
  name,
  unlimitedValue,
  disableUnlimited,
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
      } as Attributes & { disabled?: boolean })
    : children;

  const childrenWithUndefinedValue =
    isUnlimited && isValidElement(children)
      ? cloneElement(children, {
          value: undefined,
          disabled: isUnlimited,
        } as Attributes & { value?: any })
      : undefined;

  return (
    <BAIFlex direction="column" align="start">
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
          {childrenWithUndefinedValue}
        </Form.Item>
      ) : null}
      <Checkbox
        checked={isUnlimited}
        disabled={disableUnlimited}
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
    </BAIFlex>
  );
};

export default FormItemWithUnlimited;
