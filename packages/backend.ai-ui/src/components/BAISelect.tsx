import BAIFlex from './BAIFlex';
import { Divider, Select, SelectProps, theme, Tooltip, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { BaseOptionType, DefaultOptionType } from 'antd/es/select';
import { GetRef } from 'antd/lib';
import classNames from 'classnames';
import _ from 'lodash';
import React, { useLayoutEffect, useRef, useTransition } from 'react';

const useStyles = createStyles(({ css, token }) => ({
  ghostSelect: css`
    &.ant-select {
      background-color: transparent;
      border-color: ${token.colorBgBase} !important;
      /* box-shadow: none; */
      color: ${token.colorBgBase};
      /* transition: color 0.3s, border-color 0.3s; */

      &:hover {
        background-color: rgb(255 255 255 / 10%);
      }

      &:active {
        background-color: rgb(255 255 255 / 10%);
      }

      .ant-select-suffix {
        color: ${token.colorBgBase};
      }

      &:hover .ant-select-suffix {
        color: ${token.colorBgBase};
      }

      &:active .ant-select-suffix {
        color: ${token.colorBgBase};
      }
    }
  `,
}));

export interface BAISelectProps<
  ValueType = any,
  OptionType extends BaseOptionType | DefaultOptionType = DefaultOptionType,
> extends SelectProps<ValueType, OptionType> {
  ref?: React.RefObject<GetRef<typeof Select<ValueType, OptionType>> | null>;
  ghost?: boolean;
  autoSelectOption?:
    | boolean
    | ((options: SelectProps<ValueType, OptionType>['options']) => ValueType);
  tooltip?: string;
  atBottomThreshold?: number;
  atBottomStateChange?: (atBottom: boolean) => void;
  bottomLoading?: boolean;
  footer?: React.ReactNode;
  endReached?: () => void; // New prop for endReached
  searchAction?: (value: string) => Promise<void>;
}

function BAISelect<
  ValueType = any,
  OptionType extends BaseOptionType | DefaultOptionType = DefaultOptionType,
>({
  ref,
  autoSelectOption,
  ghost,
  tooltip = '',
  atBottomThreshold = 30,
  atBottomStateChange,
  footer,
  endReached, // Destructure the new prop
  searchAction,
  ...selectProps
}: BAISelectProps<ValueType, OptionType>): React.ReactElement {
  const { value, options, onChange } = selectProps;
  const { styles } = useStyles();
  // const dropdownRef = useRef<HTMLDivElement | null>(null);
  const lastScrollTop = useRef<number>(0);
  const isAtBottom = useRef<boolean>(false);
  const { token } = theme.useToken();
  const [isPending, startTransition] = useTransition();

  useLayoutEffect(() => {
    if (autoSelectOption && _.isEmpty(value) && options?.[0]) {
      if (_.isBoolean(autoSelectOption)) {
        onChange?.(options?.[0].value || options?.[0], options?.[0]);
      } else if (_.isFunction(autoSelectOption)) {
        onChange?.(autoSelectOption(options), options?.[0]);
      }
    }
  }, [value, options, onChange, autoSelectOption]);

  // Function to check if the scroll has reached the bottom
  const handlePopupScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!atBottomStateChange && !endReached) return; // Check for endReached

    const target = e.target as HTMLElement;
    const scrollTop = target.scrollTop;
    // const scrollDirection = scrollTop > lastScrollTop.current ? 'down' : 'up';
    lastScrollTop.current = scrollTop;

    const isAtBottomNow =
      target.scrollHeight - scrollTop - target.clientHeight <=
      atBottomThreshold;

    // Only notify when the state changes
    // ~~or when scrolling down at the bottom~~
    if (
      isAtBottomNow !== isAtBottom.current
      // ||
      // (isAtBottomNow && scrollDirection === 'down')
    ) {
      isAtBottom.current = isAtBottomNow;
      atBottomStateChange?.(isAtBottomNow);

      if (isAtBottomNow) {
        endReached?.(); // Call endReached when at the bottom
      }
    }
  };

  return (
    <Tooltip title={tooltip}>
      <Select<ValueType, OptionType>
        {...selectProps}
        loading={isPending || selectProps.loading}
        onSearch={async (value) => {
          selectProps.onSearch?.(value);
          startTransition(async () => {
            await searchAction?.(value);
          });
        }}
        ref={ref}
        className={
          ghost
            ? classNames(styles.ghostSelect, selectProps.className)
            : selectProps.className
        }
        onPopupScroll={(e) => {
          if (atBottomStateChange || endReached) handlePopupScroll(e);
          selectProps.onPopupScroll?.(e);
        }}
        popupRender={
          footer
            ? (menu) => {
                // Process with custom popupRender if provided
                // const renderedMenu = selectProps.popupRender
                //   ? selectProps.popupRender(menu)
                //   : menu;

                return (
                  <BAIFlex direction="column" align="stretch">
                    {menu}
                    <Divider
                      style={{
                        margin: 0,
                        marginBottom: token.paddingXS,
                      }}
                    />
                    <BAIFlex
                      direction="column"
                      align="end"
                      gap={'xs'}
                      style={{
                        paddingBottom: token.paddingXXS,
                        paddingInline: token.paddingSM,
                      }}
                    >
                      {_.isString(footer) ? (
                        <Typography.Text type="secondary">
                          {footer}
                        </Typography.Text>
                      ) : (
                        footer
                      )}
                    </BAIFlex>
                  </BAIFlex>
                );
              }
            : undefined
        }
      />
    </Tooltip>
  );
}

export default BAISelect;
