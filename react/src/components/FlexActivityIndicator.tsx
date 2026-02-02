import { LoadingOutlined } from '@ant-design/icons';
import { Spin, type SpinProps } from 'antd';
import { BAIFlex, BAIFlexProps } from 'backend.ai-ui';
import React from 'react';

interface FlexActivityIndicatorProps extends BAIFlexProps {
  spinSize?: SpinProps['size'];
}

const FlexActivityIndicator: React.FC<FlexActivityIndicatorProps> = ({
  style,
  children,
  spinSize = 'default',
}) => {
  return (
    <BAIFlex
      direction="row"
      justify="center"
      align="center"
      style={{ width: '100%', height: '100%', ...style }}
    >
      <Spin indicator={<LoadingOutlined spin />} size={spinSize} />
      {children}
    </BAIFlex>
  );
};

export default FlexActivityIndicator;
