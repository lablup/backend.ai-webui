import { theme } from '../theme-shim';
import BAIFlex from './BAIFlex';
import './BAISelect.css';
import { Divider, Select, Tooltip, Typography, type SelectProps } from 'antd';
import type { BaseOptionType, DefaultOptionType } from 'antd/es/select';
import type { GetRef } from 'antd/lib';
import classNames from 'classnames';
import * as _ from 'lodash-es';
import React, { useLayoutEffect, useRef, useTransition } from 'react';

export interface BAISelectProps<
  ValueType = any,
  OptionType extends BaseOptionType | DefaultOptionType = DefaultOptionType,
> extends Omit<SelectProps<ValueType, OptionType>, 'onSearch' | 'role'> {
  ref?: React.RefObject<GetRef<typeof Select<ValueType, OptionType>> | null>;
  ghost?: boolean;
  autoSelectOption?:
    | boolean
    | ((options: SelectProps<ValueType, OptionType>['options']) => ValueType);
  tooltip?: string;
  atBottomThreshold?: number;
  atBottomStateChange?: (atBottom: boolean) => void;
  bottomLoading?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  endReached?: () => void;
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
  header,
  footer,
  endReached,
  searchAction,
  ...selectProps
}: BAISelectProps<ValueType, OptionType>): React.ReactElement {
  const { value, options, onChange } = selectProps;
  const { token } = theme.useToken();
  // const dropdownRef = useRef<HTMLDivElement | null>(null);
  const lastScrollTop = useRef<number>(0);
  const isAtBottom = useRef<boolean>(false);
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

  const composedShowSearch = (() => {
    if (selectProps.showSearch === false) return false;
    const baseShowSearch = _.isObject(selectProps.showSearch)
      ? selectProps.showSearch
      : undefined;
    const callerOnSearch = baseShowSearch?.onSearch;
    if (!callerOnSearch && !searchAction) {
      return baseShowSearch ?? true;
    }
    return {
      ...baseShowSearch,
      onSearch: (value: string) => {
        callerOnSearch?.(value);
        startTransition(async () => {
          await searchAction?.(value);
        });
      },
    };
  })();

  return (
    <Tooltip title={tooltip}>
      <Select<ValueType, OptionType>
        {...selectProps}
        loading={isPending || selectProps.loading}
        showSearch={composedShowSearch}
        ref={ref}
        className={classNames(
          selectProps.className,
          'bai-select',
          ghost && 'bai-select-ghost',
        )}
        onPopupScroll={(e) => {
          if (atBottomStateChange || endReached) handlePopupScroll(e);
          selectProps.onPopupScroll?.(e);
        }}
        popupRender={
          header || footer
            ? (menu) => {
                // Note: a caller-supplied `popupRender` is ignored when
                // `header`/`footer` is set; only `menu` is rendered here.
                return (
                  <BAIFlex direction="column" align="stretch">
                    {header ? (
                      <>
                        <BAIFlex
                          align="center"
                          style={{
                            paddingBottom: token.paddingXXS,
                            paddingInline: token.paddingSM,
                          }}
                        >
                          {_.isString(header) ? (
                            <Typography.Text type="secondary">
                              {header}
                            </Typography.Text>
                          ) : (
                            header
                          )}
                        </BAIFlex>
                        <Divider
                          style={{
                            margin: 0,
                            marginBottom: token.marginXXS,
                          }}
                        />
                      </>
                    ) : null}
                    {menu}
                    {footer ? (
                      <>
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
                      </>
                    ) : null}
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
