/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ConfigProvider, Radio, theme } from 'antd';
import type { RadioGroupProps } from 'antd';
import { createStyles } from 'antd-style';
import classNames from 'classnames';
import React from 'react';

interface BAIRadioGroupProps extends RadioGroupProps {}

const useStyle = createStyles(({ css, token }) => ({
  baiRadioGroup: css`
    // border version
    .ant-radio-button-wrapper:not(.ant-radio-button-wrapper-checked)::before,
    .ant-radio-button-wrapper:hover::before {
      background-color: transparent;
    }
    .ant-radio-button-wrapper-checked:hover::before,
    .ant-radio-button-wrapper-checked::before {
      background-color: transparent;
      /* background-color: ${`rgba(${parseInt(token.colorPrimary.slice(1, 3), 16)}, ${parseInt(token.colorPrimary.slice(3, 5), 16)}, ${parseInt(token.colorPrimary.slice(5, 7), 16)}, 0.30)`}; */
    }

    // original design version
    /* .ant-radio-button-wrapper-checked::before,
    .ant-radio-button-wrapper::before {
      background-color: ${token.colorBorder};
    }
    .ant-radio-button-wrapper-checked:hover::before,
    .ant-radio-button-wrapper:hover::before {
      background-color: ${token.colorBorder};
    }

    .ant-radio-button-wrapper-checked {
      border-color: transparent !important;
    } */
  `,
}));
const BAIRadioGroup: React.FC<BAIRadioGroupProps> = ({ options, ...props }) => {
  const { styles } = useStyle();
  const { token } = theme.useToken();
  const colorPrimaryWithAlpha = `rgba(${parseInt(token.colorPrimary.slice(1, 3), 16)}, ${parseInt(token.colorPrimary.slice(3, 5), 16)}, ${parseInt(token.colorPrimary.slice(5, 7), 16)}, 0.15)`;
  const colorPrimaryWithLessAlpha = `rgba(${parseInt(token.colorPrimary.slice(1, 3), 16)}, ${parseInt(token.colorPrimary.slice(3, 5), 16)}, ${parseInt(token.colorPrimary.slice(5, 7), 16)}, 0.3)`;
  return (
    <ConfigProvider
      theme={{
        components: {
          Radio: {
            buttonSolidCheckedBg: colorPrimaryWithAlpha,
            buttonSolidCheckedColor: token.colorPrimary,
            buttonSolidCheckedHoverBg: colorPrimaryWithLessAlpha,
          },
        },
      }}
    >
      <Radio.Group
        className={classNames(styles.baiRadioGroup, props.className)}
        options={options}
        optionType="button"
        buttonStyle="solid"
        {...props}
      />
    </ConfigProvider>
  );
};

export default BAIRadioGroup;
