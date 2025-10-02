import {
  Badge,
  Checkbox,
  Select,
  type SelectProps,
  Switch,
  type SwitchProps,
  Typography,
  theme,
} from 'antd';
import { createStyles } from 'antd-style';
import { BAIFlex } from 'backend.ai-ui';
import _ from 'lodash';
import React, { ReactElement, ReactNode } from 'react';

export interface SettingItemProps {
  'data-testid'?: string;
  type: 'custom' | 'checkbox' | 'select' | 'switch';
  title: string;
  description?: string | ReactElement;
  children?: ReactNode;
  defaultValue?: any;
  value?: any;
  setValue?: (value: any) => void;
  selectProps?: Omit<
    SelectProps,
    'value' | 'onChange' | 'defaultValue' | 'disabled'
  >;
  switchProps?: Omit<
    SwitchProps,
    | 'value'
    | 'checked'
    | 'onChange'
    | 'defaultValue'
    | 'defaultChecked'
    | 'disabled'
  >;
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
  'data-testid': dataTestId,
  type,
  title,
  description,
  children,
  defaultValue,
  value,
  selectProps,
  switchProps,
  onChange,
  disabled,
}) => {
  const { token } = theme.useToken();
  const { styles } = useStyles();

  return (
    <BAIFlex
      data-testid={dataTestId}
      direction="column"
      align="start"
      gap={'xxs'}
    >
      <BAIFlex direction="row" gap={'xxs'}>
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
      </BAIFlex>
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
          />
        </>
      )}
      {type === 'switch' && (
        <>
          {description}
          <Switch
            checked={value}
            onChange={onChange}
            disabled={disabled}
            {...switchProps}
          />
        </>
      )}
    </BAIFlex>
  );
};

export default SettingItem;
