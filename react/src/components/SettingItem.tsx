import { SettingOutlined } from '@ant-design/icons';
import { useToggle } from 'ahooks';
import {
  Alert,
  Badge,
  Checkbox,
  CheckboxProps,
  Dropdown,
  Select,
  Typography,
  theme,
} from 'antd';
import { createStyles } from 'antd-style';
import { BAIButton, BAIFlex, BAIModal, BAISelectProps } from 'backend.ai-ui';
import { t } from 'i18next';
import _ from 'lodash';
import React, { ReactElement, ReactNode, useState } from 'react';

type BaseSettingItemProps = {
  'data-testid'?: string;
  title: string;
  description?: string | ReactElement;
  children?: ReactNode;
  showResetButton?: boolean;
  onReset?: () => void;
};

type CheckboxSettingItemProps = BaseSettingItemProps & {
  type: 'checkbox';
  defaultValue?: boolean;
  value?: boolean;
  onChange?: (value?: boolean) => void;
  checkboxProps?: Omit<CheckboxProps, 'value' | 'onChange' | 'defaultValue'>;
  selectProps?: never;
};

type SelectSettingItemProps = BaseSettingItemProps & {
  type: 'select';
  defaultValue?: string | number;
  value?: string | number;
  onChange?: (value?: string | number) => void;
  selectProps?: Omit<BAISelectProps, 'value' | 'onChange' | 'defaultValue'>;
  checkboxProps?: never;
};

type CustomSettingItemProps = BaseSettingItemProps & {
  type: 'custom';
  defaultValue?: any;
  value?: any;
  onChange?: (value?: any) => void;
  selectProps?: never;
  checkboxProps?: never;
};

export type SettingItemProps =
  | CheckboxSettingItemProps
  | SelectSettingItemProps
  | CustomSettingItemProps;

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
  onChange,
  onReset,
  selectProps,
  checkboxProps,
  showResetButton = true,
}) => {
  'use memo';

  const { token } = theme.useToken();
  const { styles } = useStyles();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isOpenResetChangesModal, { toggle: setIsOpenResetChangesModal }] =
    useToggle(false);

  const resetItem = () => {
    if (onReset) {
      onReset();
    } else if (isEnabled && onChange) {
      onChange(defaultValue);
    }
  };

  const isEnabled =
    (type === 'select' && !selectProps?.disabled) ||
    (type === 'checkbox' && !checkboxProps?.disabled) ||
    type === 'custom';

  return (
    <BAIFlex
      data-testid={dataTestId}
      direction="column"
      align="stretch"
      gap={'xxs'}
      onMouseEnter={() => setIsDropdownOpen(true)}
      onMouseLeave={() => setIsDropdownOpen(false)}
    >
      <BAIFlex direction="row" gap={'xxs'}>
        <BAIFlex gap="xxs" align="start">
          <Typography.Text
            strong
            style={{
              fontSize: token.fontSize,
            }}
          >
            {title}
          </Typography.Text>
          {isEnabled &&
            value !== undefined &&
            value !== null &&
            defaultValue !== value && <Badge dot status="warning" />}
          {isEnabled && showResetButton && (
            <Dropdown
              menu={{
                items: [
                  {
                    key: 'reset',
                    label: t('button.Reset'),
                    onClick: () => setIsOpenResetChangesModal(),
                    danger: true,
                  },
                ],
              }}
              placement="topLeft"
              onOpenChange={(e) => e && setIsDropdownOpen(true)}
            >
              <BAIButton
                icon={<SettingOutlined />}
                type="text"
                style={{
                  width: 20,
                  height: 20,
                  opacity: isDropdownOpen ? 1 : 0,
                  transition: 'opacity 0.2s ease-in-out',
                }}
              />
            </Dropdown>
          )}
        </BAIFlex>
      </BAIFlex>
      {type === 'custom' && (
        <BAIFlex
          direction="column"
          gap="xs"
          align="start"
          style={{ width: '100%' }}
        >
          {description}
          {children}
        </BAIFlex>
      )}
      {type === 'checkbox' && (
        <Checkbox
          className={styles.baiSettingItemCheckbox}
          checked={value}
          onChange={(e) => {
            onChange?.(e.target.checked);
          }}
          {...checkboxProps}
        >
          <Typography.Text
            type={checkboxProps?.disabled ? 'secondary' : undefined}
          >
            {description}
          </Typography.Text>
        </Checkbox>
      )}
      {type === 'select' && (
        <>
          <Typography.Text
            type={selectProps?.disabled ? 'secondary' : undefined}
          >
            {description}
          </Typography.Text>
          <Select
            value={value}
            popupMatchSelectWidth={false}
            onChange={(value) => {
              onChange?.(value);
            }}
            style={{
              marginTop: token.marginXS,
              width: 'fit-content',
              ...selectProps?.style,
            }}
            {..._.omit(selectProps, ['style'])}
          ></Select>
        </>
      )}
      <BAIModal
        open={isOpenResetChangesModal}
        title={t('dialog.ask.DoYouWantToResetChanges')}
        okText={t('button.Reset')}
        okButtonProps={{ danger: true }}
        onOk={() => {
          resetItem();
          setIsOpenResetChangesModal();
        }}
        cancelText={t('button.Cancel')}
        onCancel={() => setIsOpenResetChangesModal()}
      >
        <Alert
          showIcon
          message={t('dialog.warning.CannotBeUndone')}
          type="warning"
        />
      </BAIModal>
    </BAIFlex>
  );
};

export default SettingItem;
