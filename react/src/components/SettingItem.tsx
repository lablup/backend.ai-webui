import Flex from './Flex';
import { Badge, Checkbox, Select, Typography } from 'antd';
import React, { ReactElement, ReactNode } from 'react';

export interface SettingItemProps {
  type: 'custom' | 'checkbox' | 'select';
  title: string;
  description: string | ReactElement;
  children?: ReactNode;
  defaultValue?: any;
  value?: any;
  setValue?: (value: any) => void;
  selectOptions?: { label: string; value: any }[];
  onChange?: (value: any) => void;
  onClick?: () => void;
}

const SettingItem: React.FC<SettingItemProps> = ({
  type,
  title,
  description,
  value,
  setValue,
  defaultValue,
  selectOptions,
  children,
  ...particialProps
}) => {
  console.log(typeof description, description);
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
      {type === 'custom' && children}
      {type === 'select' && (
        <Select
          value={value}
          style={{ width: 120 }}
          options={selectOptions}
          {...particialProps}
        />
      )}
    </Flex>
  );
};

export default SettingItem;
