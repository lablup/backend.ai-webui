import Flex from './Flex';
import { Badge, Checkbox, Select, SelectProps, Typography, theme } from 'antd';
import { createStyles } from 'antd-style';
import _ from 'lodash';
import React, { ReactElement, ReactNode } from 'react';

export interface SettingItemProps {
  type: 'custom' | 'checkbox' | 'select';
  title: string;
  description?: string | ReactElement;
  children?: ReactNode;
  defaultValue?: any;
  value?: any;
  setValue?: (value: any) => void;
  selectProps?: Omit<SelectProps, 'value' | 'onChange' | 'defaultValue'>;
  onChange?: (value: any) => void;
  disabled?: boolean;
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
  children,
  defaultValue,
  value,
  selectProps,
  onChange,
  disabled,
}) => {
  const { token } = theme.useToken();
  const { styles } = useStyles();

  return (
    <Flex direction="column" align="start" gap={'xxs'}>
      <Flex direction="row" gap={'xxs'}>
        <Typography.Text
          strong
          style={{
            fontSize: token.fontSize,
          }}
        >
          {title}
        </Typography.Text>
        {!disabled &&
          value !== undefined &&
          value !== null &&
          defaultValue !== value && <Badge dot status="warning" />}
      </Flex>
      {type === 'custom' && (
        <>
          {description}
          <div style={{ marginTop: token.marginXS }}>{children}</div>
        </>
      )}
      {type === 'checkbox' && (
        <Checkbox
          checked={value}
          onChange={onChange}
          disabled={disabled}
          className={styles.baiSettingItemCheckbox}
        >
          <Typography.Text type={disabled ? 'secondary' : undefined}>
            {description}
          </Typography.Text>
        </Checkbox>
      )}
      {type === 'select' && (
        <>
          {description}
          <Select
            value={value}
            popupMatchSelectWidth={false}
            onChange={onChange}
            disabled={disabled}
            style={{
              marginTop: token.marginXS,
              ...selectProps?.style,
            }}
            {..._.omit(selectProps, ['style'])}
          ></Select>
        </>
      )}
    </Flex>
  );
};

export default SettingItem;
