import Flex from './Flex';
import { Badge, Checkbox, Select, Typography } from 'antd';
import React, { ReactNode } from 'react';

export interface SettingItemProps {
  type: 'checkbox' | 'select' | 'custom';
  title: string;
  description: ReactNode;
  value: any;
  defaultValue: any;
  options?: any;
  children?: ReactNode;
  onChange?: (value: any) => void;
  onClick?: () => void;
}

const SettingItem: React.FC<SettingItemProps> = ({
  type,
  title,
  description,
  value,
  defaultValue,
  options,
  children,
  ...particialProps
}) => {
  return (
    <Flex
      direction="column"
      align="stretch"
      gap={'xs'}
      style={{ maxWidth: 600 }}
    >
      <Typography.Text strong={true}>
        <Badge dot={defaultValue !== value} status="warning">
          {title}
        </Badge>
      </Typography.Text>
      <Flex direction="row" align="start" gap={'xs'}>
        {type === 'checkbox' && (
          <Checkbox checked={value} {...particialProps} />
        )}
        <Typography.Text>{description}</Typography.Text>
      </Flex>
      {type === 'select' && (
        <Select
          value={value}
          style={{ width: 120 }}
          options={options}
          {...particialProps}
        />
      )}
      {type === 'custom' && children}
    </Flex>
  );
};

export default SettingItem;
