import Flex from './Flex';
import { Typography, theme } from 'antd';
import _ from 'lodash';
import React from 'react';

export interface BAIProgressWithLabelProps {
  title?: React.ReactNode;
  valueLabel?: React.ReactNode;
  percent?: number;
  width?: React.CSSProperties['width'];
  strokeColor?: string;
  labelStyle?: React.CSSProperties;
  size?: 'small' | 'middle' | 'large';
}
const BAIProgressWithLabel: React.FC<BAIProgressWithLabelProps> = ({
  title,
  valueLabel,
  percent = 0,
  width,
  strokeColor,
  labelStyle,
  size = 'small',
}) => {
  const { token } = theme.useToken();

  const fontSize =
    size === 'small'
      ? token.fontSizeSM
      : size === 'middle'
        ? token.fontSize
        : token.fontSizeLG;
  return (
    <Flex
      style={{
        padding: 1,
        border: `1px solid ${token.colorBorder}`,
        borderRadius: 3,
        backgroundColor: token.colorBgContainerDisabled,
        ...(_.isNumber(width) || _.isString(width)
          ? { width: width }
          : { flex: 1 }),
      }}
      direction="column"
      align="stretch"
    >
      <Flex
        style={{
          height: '100%',
          width: `${percent > 100 ? 100 : percent}%`,
          position: 'absolute',
          left: 0,
          top: 0,
          backgroundColor: strokeColor ?? token.colorSuccess,
          opacity: 0.7,
          zIndex: 0,
          overflow: 'hidden',
        }}
      ></Flex>
      <Flex direction="row" justify="between">
        <Typography.Text style={{ fontSize, ...labelStyle }}>
          {title}
        </Typography.Text>
        <Typography.Text style={{ fontSize, ...labelStyle }}>
          {valueLabel}
        </Typography.Text>
      </Flex>
    </Flex>
  );
};

export default BAIProgressWithLabel;
