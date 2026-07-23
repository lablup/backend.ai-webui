/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { Typography } from 'antd';
import { BAIFlex } from 'backend.ai-ui';
import React, { ReactNode } from 'react';

const DescriptionLabel: React.FC<{
  title: string;
  subtitle?: ReactNode | string | null;
}> = ({ title, subtitle }) => {
  // const { token } = theme.useToken();
  return (
    <BAIFlex direction="column" align="start">
      <Typography.Text strong>{title}</Typography.Text>
      {subtitle && (
        <Typography.Text type="secondary">{subtitle}</Typography.Text>
      )}
    </BAIFlex>
  );
};

export default DescriptionLabel;
