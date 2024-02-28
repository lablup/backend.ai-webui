import Flex from './Flex';
import { Typography } from 'antd';
import React, { ReactNode } from 'react';

const DescriptionLabel: React.FC<{
  title: string;
  subtitle?: ReactNode | string | null;
}> = ({ title, subtitle }) => {
  // const { token } = theme.useToken();
  return (
    <Flex direction="column" align="start">
      <Typography.Text strong>{title}</Typography.Text>
      {subtitle && (
        <Typography.Text type="secondary">{subtitle}</Typography.Text>
      )}
    </Flex>
  );
};

export default DescriptionLabel;
