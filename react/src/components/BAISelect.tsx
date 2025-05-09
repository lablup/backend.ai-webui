import Flex from './Flex';
import { Divider, Select, SelectProps, theme, Tooltip, Typography } from 'antd';
import { createStyles } from 'antd-style';
import classNames from 'classnames';
import _ from 'lodash';
import React, { useLayoutEffect } from 'react';

const useStyles = createStyles(({ css, token }) => ({
  ghostSelect: css`
    &.ant-select {
      .ant-select-selector {
        background-color: transparent;
        border-color: ${token.colorBgBase} !important;
        /* box-shadow: none; */
        color: ${token.colorBgBase};
        /* transition: color 0.3s, border-color 0.3s; */
      }

      &:hover .ant-select-selector {
        background-color: rgb(255 255 255 / 10%);
      }

      &:active .ant-select-selector {
        background-color: rgb(255 255 255 / 10%);
      }

      .ant-select-arrow {
        color: ${token.colorBgBase};
      }

      &:hover .ant-select-arrow {
        color: ${token.colorBgBase};
      }

      &:active .ant-select-arrow {
        color: ${token.colorBgBase};
      }
    }
  `,
}));

export interface BAISelectProps extends SelectProps {
  ghost?: boolean;
  autoSelectOption?: boolean | ((options: SelectProps['options']) => any);
  tooltip?: string;
  title?: string;
}
/**
 * BAISelect component.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {boolean | Function} props.autoSelectOption - Determines whether to automatically select an option.
 * @param {any} props.value - The current value of the select.
 * @param {Array} props.options - The available options for the select.
 * @param {Function} props.onChange - The callback function to handle value changes.
 * @returns {JSX.Element} The rendered BAISelect component.
 */
const BAISelect: React.FC<BAISelectProps> = ({
  autoSelectOption,
  ghost,
  tooltip = '',
  title,
  ...selectProps
}) => {
  const { value, options, onChange } = selectProps;
  const { styles } = useStyles();
  const { token } = theme.useToken();

  useLayoutEffect(() => {
    if (autoSelectOption && _.isEmpty(value) && options?.[0]) {
      if (_.isBoolean(autoSelectOption)) {
        onChange?.(options?.[0].value || options?.[0], options?.[0]);
      } else if (_.isFunction(autoSelectOption)) {
        onChange?.(autoSelectOption(options), options[0]);
      }
    }
  }, [value, options, onChange, autoSelectOption]);

  return (
    <Tooltip title={tooltip}>
      <Select
        // This will be ignored if selectProps has dropdownRender
        dropdownRender={(menu) => {
          return title ? (
            <Flex direction="column" gap={'xxs'} align="start">
              <Typography.Text
                style={{
                  padding: token.paddingXXS,
                  paddingLeft: token.paddingSM,
                }}
                type="secondary"
              >
                {title}
              </Typography.Text>
              <Divider style={{ margin: 0 }} />
              {menu}
            </Flex>
          ) : (
            menu
          );
        }}
        {...selectProps}
        className={
          ghost
            ? classNames(styles.ghostSelect, selectProps.className)
            : selectProps.className
        }
      />
    </Tooltip>
  );
};

export default BAISelect;
