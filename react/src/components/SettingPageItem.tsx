import Flex from './Flex';
import { Badge, Button, Checkbox, List, Select, Typography } from 'antd';
import React, { ReactNode, useState } from 'react';

export interface SettingItemProps {
  type: 'toggle' | 'dropdown' | 'custom';
  title: string;
  description: ReactNode;
  value: any;
  defaultValue: any;
  options?: any;
  onChange?: (value: any) => void;
}

const SettingPageItem: React.FC<SettingItemProps> = ({
  type,
  title,
  description,
  value,
  defaultValue,
  options,
  ...particialProps
}) => {
  return (
    <List.Item style={{ border: 'none' }}>
      <Flex direction="column" align="stretch" gap={'xs'}>
        <Typography.Text style={{ fontWeight: 'bold', fontSize: '16px' }}>
          <Badge dot={defaultValue !== value} status="warning">
            {title}
          </Badge>
        </Typography.Text>
        <Flex direction="row" align="start" gap={'xs'}>
          {type === 'toggle' && (
            <Checkbox
              checked={value}
              // onChange={(e) => setSettingValue(e.target.checked)}
              {...particialProps}
            />
          )}
          <Typography.Text>{description}</Typography.Text>
        </Flex>
        {type === 'dropdown' && (
          <Select
            value={value}
            style={{ width: 120 }}
            options={options}
            {...particialProps}
          />
        )}
        {type === 'custom' && (
          <Button type="primary" style={{ width: 120 }}>
            Custom
          </Button>
        )}
      </Flex>
    </List.Item>
  );
};

export default SettingPageItem;
