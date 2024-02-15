import Flex from './Flex';
import { SettingOutlined } from '@ant-design/icons';
import { Badge, Button, Checkbox, Select, Typography, theme } from 'antd';
import React, { ReactNode } from 'react';

export interface SettingItemProps {
  //default 는 custom, children 으로 node element를 받기
  type: 'checkbox' | 'select' | 'custom';
  title: string;
  description: ReactNode;
  value: any;
  defaultValue: any;
  options?: any;
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
  ...particialProps
}) => {
  const { token } = theme.useToken();

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
      {/* Todo:  */}
      {type === 'custom' && (
        //children 으로 범용적으로 사용할 수 있게 변경.
        <Button
          type="primary"
          icon={<SettingOutlined />}
          style={{ width: 120 }}
          {...particialProps}
        >
          custom
        </Button>
      )}
    </Flex>
  );
};

export default SettingItem;
