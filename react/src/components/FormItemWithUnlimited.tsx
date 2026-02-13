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
    // When unlimitedValue is undefined or null, treat both null and undefined
    // form values as "unlimited" because Ant Design may internally convert
    // undefined to null when storing form field values.
    const isFieldUnlimited =
      unlimitedValue === undefined || unlimitedValue === null
        ? fieldValue === undefined || fieldValue === null
        : fieldValue === unlimitedValue;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsUnlimited(isFieldUnlimited);
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
            // Use null instead of undefined because Ant Design may treat
            // undefined as "reset to initial value" rather than storing it.
            form.setFieldValue(name, unlimitedValue ?? null);
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
