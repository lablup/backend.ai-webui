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

export interface SettingItemProps {
  'data-testid'?: string;
  type: 'custom' | 'checkbox' | 'select';
  title: string;
  description?: string | ReactElement;
  children?: ReactNode;
  defaultValue?: any;
  value?: any;
  setValue?: (value: any) => void;
  showResetButton?: boolean;
  checkboxProps?: Omit<CheckboxProps, 'value' | 'onChange' | 'defaultValue'>;
  selectProps?: Omit<BAISelectProps, 'value' | 'onChange' | 'defaultValue'>;
  onAfterChange?: (value: any) => void;
  onReset?: () => void;
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
  setValue,
  onAfterChange,
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
    } else {
      !selectProps?.disabled &&
        !checkboxProps?.disabled &&
        setValue?.(defaultValue);
    }
  };

  return (
    <BAIFlex
      data-testid={dataTestId}
      direction="column"
      align="start"
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
          {(!selectProps?.disabled || !checkboxProps?.disabled) &&
            value !== undefined &&
            value !== null &&
            defaultValue !== value && <Badge dot status="warning" />}
          {!selectProps?.disabled &&
            !checkboxProps?.disabled &&
            showResetButton && (
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
            setValue?.(e.target.checked);
            onAfterChange?.(e);
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
              setValue?.(value);
              onAfterChange?.(value);
            }}
            style={{
              marginTop: token.marginXS,
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
