import Flex from './Flex';
import { Badge, Checkbox, Select, Typography, theme } from 'antd';
import { createStyles } from 'antd-style';
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

const useStyles = createStyles(({ css }) => ({
  baiSettingItemCheckbox: css`
    .ant-checkbox {
      align-self: flex-start;
      margin-top: 0.2rem;
    }
  `,
}));

const SettingItem: React.FC<SettingItemProps> = ({
  type,
  title,
  description,
  value,
  setValue,
  defaultValue,
  selectOptions,
  children,
  onChange,
  onClick,
}) => {
  const { token } = theme.useToken();
  const { styles } = useStyles();

  return (
    <Flex
      direction="column"
      align="stretch"
      gap={'xxs'}
      style={{ maxWidth: 600 }}
    >
      <Badge dot={defaultValue !== value} status="warning">
        <Typography.Text
          strong={true}
          style={{
            fontSize: token.fontSize,
          }}
        >
          {title}
        </Typography.Text>
      </Badge>
      {type === 'checkbox' ? (
        <Checkbox
          checked={value}
          onChange={onChange}
          onClick={onClick}
          style={{
            alignItems: 'flex-start',
          }}
          className={styles.baiSettingItemCheckbox}
        >
          {description}
        </Checkbox>
      ) : (
        <Typography.Text>{description}</Typography.Text>
      )}
      {type === 'custom' && children}
      {type === 'select' && (
        <Select
          value={value}
          style={{ width: 120 }}
          options={selectOptions}
          onChange={onChange}
          onClick={onClick}
        />
      )}
    </Flex>
  );
};

export default SettingItem;
