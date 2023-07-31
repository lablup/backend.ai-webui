import React from "react";
import {
  InputNumber,
  Slider,
  Form,
  SliderSingleProps,
  InputNumberProps,
} from "antd";
import Flex from "./Flex";
import { FormItemProps } from "antd/lib/form/FormItem";
import { NamePath } from "antd/es/form/interface";
import { SliderRangeProps } from "antd/es/slider";

interface SliderInputProps extends Omit<FormItemProps, "name"> {
  min?: number;
  max?: number;
  step?: number;
  name: NamePath;
  inputNumberProps?: InputNumberProps;
  sliderProps?: SliderSingleProps | SliderRangeProps;
}
const SliderInputItem: React.FC<SliderInputProps> = ({
  name,
  min,
  max,
  step,
  rules,
  required,
  inputNumberProps,
  sliderProps,
  ...formItemProps
}) => {
  return (
    <Form.Item required={required} {...formItemProps}>
      <Flex direction="row" gap={"md"}>
        <Flex direction="column" align="stretch" style={{ flex: 3 }}>
          <Form.Item name={name} noStyle rules={rules}>
            <Slider max={max} min={min} step={step} {...sliderProps} />
          </Form.Item>
        </Flex>
        <Flex style={{ flex: 2 }}>
          <Form.Item name={name} noStyle>
            <InputNumber
              max={max}
              min={min}
              step={step}
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

export default SliderInputItem;
