import React, { useState } from "react";
import { Col, InputNumber, Row, Slider, theme, Form } from "antd";
import Flex from "./Flex";
import { useSuspendedBackendaiClient } from "../hooks";
import { useTranslation } from "react-i18next";
import FormItem from "antd/es/form/FormItem";
import { FormItemProps } from "antd/lib/form/FormItem";
import { NamePath } from "antd/es/form/interface";

interface SliderInputProps extends Omit<FormItemProps, "name"> {
  min?: number;
  max?: number;
  step?: number;
  name: NamePath;
}
const SliderInputItem: React.FC<SliderInputProps> = ({
  name,
  min,
  max,
  step,
  rules,
  ...formItemProps
}) => {
  return (
    <Form.Item {...formItemProps}>
      <Flex direction="row" gap={"md"}>
        <Flex direction="column" align="stretch" style={{ flex: 3 }}>
          <Form.Item name={name} noStyle rules={rules}>
            <Slider max={max} min={min} step={step} />
          </Form.Item>
        </Flex>
        <Flex>
          <Form.Item name={name} noStyle>
            <InputNumber max={max} min={min} step={step} />
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
