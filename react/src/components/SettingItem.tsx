import Flex from './Flex';
import { Badge, Checkbox, Select, SelectProps, Typography, theme } from 'antd';
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
  // selectOptions?: { label: string; value: any }[];
  selectProps?: Omit<SelectProps, 'value' | 'onChange' | 'defaultValue'>;
  onChange?: (value: any) => void;
  onClick?: () => void;
  style?: React.CSSProperties;
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
  selectProps,
  children,
  onChange,
  onClick,
  style,
}) => {
  const { token } = theme.useToken();
  const { styles } = useStyles();

  return (
    <Flex direction="column" align="start" gap={'xxs'} style={style}>
      <Flex direction="row" gap={'xxs'}>
        <Typography.Text
          strong={true}
          style={{
            fontSize: token.fontSize,
          }}
        >
          {title}
        </Typography.Text>
        {defaultValue !== value && <Badge dot status="warning" />}
      </Flex>
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
          style={{ minWidth: 150 }}
          popupMatchSelectWidth={false}
          onChange={onChange}
          onClick={onClick}
          {...selectProps}
        />
      )}
    </Flex>
  );
};

export default SettingItem;
