/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { Spin, type SpinProps } from 'antd';
import { BAIFlex, BAIFlexProps } from 'backend.ai-ui';
import { LoaderCircle } from 'lucide-react';
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
      <Spin
        indicator={<LoaderCircle className="anticon-spin" size="1em" />}
        size={spinSize}
      />
      {children}
    </BAIFlex>
  );
};

export default FlexActivityIndicator;
