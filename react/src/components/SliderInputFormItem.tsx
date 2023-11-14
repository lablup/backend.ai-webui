import Flex from './Flex';
import {
  InputNumber,
  Slider,
  Form,
  SliderSingleProps,
  InputNumberProps,
} from 'antd';
import { NamePath } from 'antd/es/form/interface';
import { SliderRangeProps } from 'antd/es/slider';
import { FormItemProps } from 'antd/lib/form/FormItem';
import React, { useEffect } from 'react';

interface SliderInputFormItemProps extends Omit<FormItemProps, 'name'> {
  min?: number;
  max?: number;
  step?: number;
  name: NamePath;
  inputNumberProps?: InputNumberProps;
  sliderProps?: SliderSingleProps | SliderRangeProps;
  disabled?: boolean;
}
const SliderInputFormItem: React.FC<SliderInputFormItemProps> = ({
  name,
  min,
  max,
  step,
  rules,
  required,
  inputNumberProps,
  sliderProps,
  initialValue,
  disabled,
  ...formItemProps
}) => {
  const form = Form.useFormInstance();
  useEffect(() => {
    // when step is 1, make sure the value is integer
    if (step === 1 && form.getFieldValue(name) % 1 !== 0) {
      // do not use form.setFieldsValue, because name can be array
      form.setFieldValue(name, Math.round(form.getFieldValue(name)));
    }
  }, [step, form, name]);
  return (
    <Form.Item required={required} {...formItemProps}>
      <Flex direction="row" gap={'md'}>
        <Flex direction="column" align="stretch" style={{ flex: 3 }}>
          <Form.Item
            name={name}
            noStyle
            rules={rules}
            initialValue={initialValue}
            label={formItemProps.label}
          >
            <Slider
              max={max}
              min={min}
              step={step}
              disabled={disabled}
              {...sliderProps}
            />
          </Form.Item>
        </Flex>
        <Flex
          style={{ flex: 2, minWidth: 130 }}
          align="stretch"
          direction="column"
        >
          <Form.Item
            name={name}
            noStyle
            rules={rules}
            initialValue={initialValue}
            label={formItemProps.label}
          >
            <InputNumber
              max={max}
              min={min}
              step={step}
              onStep={(value, info) => {
                console.log(value, info);
              }}
              disabled={disabled}
              {...inputNumberProps}
            />
          </Form.Item>
        </Flex>
      </Flex>
    </Form.Item>
    // <Row justify="space-around" align="middle" gutter={20}>
    //   <Col span={6}>
    //     <p>Resource</p>
    //   </Col>
    //   <Col span={8}>
    //     <Slider
    //       min={minValue}
    //       max={maxValue}
    //       onChange={onChange}
    //       value={typeof inputValue === "number" ? inputValue : 0}
    //       step={0.01}
    //     />
    //   </Col>
    //   <Col span={6}>
    //     <InputNumber
    //       min={minValue}
    //       max={maxValue}
    //       style={
    //         {
    //           /* use theme config */
    //         }
    //       }
    //       step={0.01}
    //       value={inputValue}
    //       onChange={onChange}
    //     />
    //   </Col>
    // </Row>
  );
};

export default SliderInputFormItem;
