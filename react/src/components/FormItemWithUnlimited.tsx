/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import BAIFormItem from './BAIFormItem';
import type { BAIFormItemProps } from './BAIFormItem';
import { CheckboxInput } from '@astryxdesign/core/CheckboxInput';
import { Form } from 'antd';
import { BAIFlex } from 'backend.ai-ui';
import React, {
  Attributes,
  cloneElement,
  isValidElement,
  useEffect,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';

interface FormItemWithUnlimitedProps extends BAIFormItemProps {
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
      <BAIFormItem
        style={{ margin: 0 }}
        name={name}
        hidden={isUnlimited}
        {...formItemPropsWithoutNameAndChildren}
      >
        {childrenWithProps}
      </BAIFormItem>
      {isUnlimited ? (
        <BAIFormItem
          style={{ margin: 0 }}
          {...formItemPropsWithoutNameAndChildren}
        >
          {childrenWithUndefinedValue}
        </BAIFormItem>
      ) : null}
      {/* Outside the Form.Item value-binding contract: this checkbox drives
          isUnlimited local state and imperatively pokes the form value, so
          it stays a plain Astryx control rather than the AstryxFormCheckbox
          adapter (which exists for controls Form.Item clones props onto). */}
      <CheckboxInput
        label={t('resourcePolicy.Unlimited')}
        value={isUnlimited}
        isDisabled={disableUnlimited}
        onChange={(checked) => {
          setIsUnlimited(checked);
          if (checked) {
            // Use null instead of undefined because Ant Design may treat
            // undefined as "reset to initial value" rather than storing it.
            form.setFieldValue(name, unlimitedValue ?? null);
          } else {
            form.resetFields([name]);
          }
        }}
      />
    </BAIFlex>
  );
};

export default FormItemWithUnlimited;
