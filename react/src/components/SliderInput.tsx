import React, { useState } from 'react';
import { Col, InputNumber, Row, Slider, theme } from 'antd';
import Flex from "./Flex";
import { useSuspendedBackendaiClient } from "../hooks";
import { useTranslation } from "react-i18next";

interface ServiceLauncherProps {}
const ServiceLauncher: React.FC = () => {
  const [inputValue, setInputValue] = useState(0);
  const [maxValue, setMaxValue] = useState(1);
  const [minValue, setMinValue] = useState(0);
  const baiClient = useSuspendedBackendaiClient();
  const { t } = useTranslation();
  const { token } = theme.useToken();

  const onChange = (value: number | null) => {
    if (isNaN(value ?? 0)) {
      return 0;
    }
    setInputValue(value ?? 0);
  };

  return (
        <Row justify="space-around" align="middle" gutter={20}>
        <Col span={6}>
            <p>Resource</p>
        </Col>
        <Col span={8}>
            <Slider
            min={minValue}
            max={maxValue}
            onChange={onChange}
            value={typeof inputValue === 'number' ? inputValue : 0}
            step={0.01}
            />
        </Col>
        <Col span={6}>
            <InputNumber
            min={minValue}
            max={maxValue}
            style={{/* use theme config */}}
            step={0.01}
            value={inputValue}
            onChange={onChange}
            />
        </Col>
        </Row>
  );
};

export default ServiceLauncher;