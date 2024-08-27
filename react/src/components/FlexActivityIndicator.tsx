import Flex, { FlexProps } from './Flex';
import { LoadingOutlined } from '@ant-design/icons';
import { Spin, SpinProps } from 'antd';
import React from 'react';

interface FlexActivityIndicatorProps extends FlexProps {
  spinSize?: SpinProps['size'];
}

const FlexActivityIndicator: React.FC<FlexActivityIndicatorProps> = ({
  style,
  children,
  spinSize = 'default',
}) => {
  return (
    <Flex
      direction="row"
      justify="center"
      align="center"
      style={{ width: '100%', height: '100%', ...style }}
    >
      <Spin indicator={<LoadingOutlined spin />} size={spinSize} />
      {children}
    </Flex>
  );
};

export default FlexActivityIndicator;
