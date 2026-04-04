/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { CaretDownOutlined } from '@ant-design/icons';
import { theme } from 'antd';
import { BAIFlex } from 'backend.ai-ui';
import React from 'react';

const RemainingMark: React.FC = () => {
  const { token } = theme.useToken();
  return (
    <BAIFlex
      style={{
        position: 'absolute',
        top: -24,
        transform: 'translateX(-50%)',
        color: token.colorSuccess,
        opacity: 0.5,
      }}
    >
      <CaretDownOutlined />
    </BAIFlex>
  );
};

export default RemainingMark;
